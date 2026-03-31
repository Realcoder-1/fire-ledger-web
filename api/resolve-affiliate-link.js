const { createClient } = require('@supabase/supabase-js');

const PADDLE_API_BASE = process.env.PADDLE_API_BASE || 'https://api.paddle.com';

const sanitizeCode = (value = '') =>
  String(value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);

const parseBody = (body) => {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
};

const getSupabaseAdmin = () =>
  createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

const getPaddleApiKey = () => process.env.PADDLE_API_KEY || '';

async function paddleRequest(path) {
  const apiKey = getPaddleApiKey();
  if (!apiKey) return null;

  const response = await fetch(`${PADDLE_API_BASE}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.detail || payload?.error?.message || payload?.message || 'Paddle request failed.';
    throw new Error(detail);
  }
  return payload.data;
}

async function findAffiliateProfileByCode(supabase, code) {
  if (!code) return null;

  const { data, error } = await supabase
    .from('affiliate_profiles')
    .select('*')
    .or(`referral_code.eq.${code},paddle_discount_code.eq.${code}`)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function findDiscountByCode(code) {
  if (!code) return null;
  const data = await paddleRequest(`/discounts?code=${encodeURIComponent(code)}`);
  return data?.[0] || null;
}

const isCheckoutUsable = (discount) =>
  Boolean(discount && discount.enabled_for_checkout !== false && (!discount.status || discount.status === 'active'));

async function resolveCheckoutDiscount(profile) {
  const sharedCode = sanitizeCode(process.env.PADDLE_COMMON_AFFILIATE_DISCOUNT_CODE || '');
  const uniqueCode = sanitizeCode(profile?.paddle_discount_code || profile?.referral_code || '');

  if (sharedCode) {
    if (!getPaddleApiKey()) {
      return { checkoutDiscountCode: sharedCode, discountMode: 'shared', discountVerified: false };
    }

    const sharedDiscount = await findDiscountByCode(sharedCode).catch(() => null);
    if (isCheckoutUsable(sharedDiscount)) {
      return { checkoutDiscountCode: sharedCode, discountMode: 'shared', discountVerified: true };
    }
  }

  if (uniqueCode) {
    if (!getPaddleApiKey()) {
      return { checkoutDiscountCode: uniqueCode, discountMode: 'unique', discountVerified: false };
    }

    const uniqueDiscount = await findDiscountByCode(uniqueCode).catch(() => null);
    if (isCheckoutUsable(uniqueDiscount)) {
      return { checkoutDiscountCode: uniqueCode, discountMode: 'unique', discountVerified: true };
    }
  }

  return { checkoutDiscountCode: null, discountMode: 'none', discountVerified: false };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { code } = parseBody(req.body);
    const requestedCode = sanitizeCode(code);

    if (!requestedCode) {
      return res.status(400).json({ error: 'A valid referral code is required.' });
    }

    const supabase = getSupabaseAdmin();
    const profile = await findAffiliateProfileByCode(supabase, requestedCode);

    if (!profile) {
      return res.status(404).json({ error: 'That affiliate referral link is not active.' });
    }

    const resolved = await resolveCheckoutDiscount(profile);

    return res.status(200).json({
      ok: true,
      active: profile.status !== 'inactive',
      referralCode: sanitizeCode(profile.referral_code || requestedCode),
      checkoutDiscountCode: resolved.checkoutDiscountCode,
      discountMode: resolved.discountMode,
      discountVerified: resolved.discountVerified,
      payoutMethod: profile.payout_method || null,
      affiliateName: profile.full_name || null,
    });
  } catch (error) {
    console.error('resolve-affiliate-link error:', error);
    return res.status(500).json({ error: error.message || 'Could not resolve affiliate link.' });
  }
};
