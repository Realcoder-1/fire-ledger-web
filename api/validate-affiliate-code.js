const { createClient } = require('@supabase/supabase-js');

const MONTHLY_PRICE_ID = process.env.PADDLE_MONTHLY_PRICE_ID || 'pri_01kkk53619cxb49atjaykftcn7';
const ANNUAL_PRICE_ID = process.env.PADDLE_ANNUAL_PRICE_ID || 'pri_01kkk544b2fntpj7s989ntee0x';
const PADDLE_API_BASE = process.env.PADDLE_API_BASE || 'https://api.paddle.com';
const AFFILIATE_DISCOUNT_PERCENT = process.env.PADDLE_AFFILIATE_DISCOUNT_PERCENT || '10';

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

async function paddleRequest(path, { method = 'GET', body } = {}) {
  const apiKey = getPaddleApiKey();
  if (!apiKey) {
    throw new Error('Missing PADDLE_API_KEY server environment variable.');
  }

  const response = await fetch(`${PADDLE_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.detail || payload?.error?.message || payload?.message || 'Paddle request failed.';
    throw new Error(detail);
  }
  return payload.data;
}

async function findPaddleDiscountByCode(code) {
  if (!code) return null;
  const data = await paddleRequest(`/discounts?code=${encodeURIComponent(code)}`);
  return data?.[0] || null;
}

function buildDiscountPayload({ code, email, fullName, userId }) {
  const restrictTo = [MONTHLY_PRICE_ID, ANNUAL_PRICE_ID].filter(Boolean);

  return {
    code,
    description: `Affiliate code for ${fullName || email}`,
    enabled_for_checkout: true,
    type: 'percentage',
    amount: String(AFFILIATE_DISCOUNT_PERCENT),
    recur: false,
    ...(restrictTo.length ? { restrict_to: restrictTo } : {}),
    custom_data: {
      source: 'affiliate_program',
      affiliate_user_id: userId,
      affiliate_email: email,
    },
  };
}

async function findAffiliateProfileByCode(supabase, code) {
  const { data, error } = await supabase
    .from('affiliate_profiles')
    .select('*')
    .or(`paddle_discount_code.eq.${code},referral_code.eq.${code}`)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function saveProfile(supabase, profile, paddleDiscount) {
  const { data, error } = await supabase
    .from('affiliate_profiles')
    .update({
      paddle_discount_code: paddleDiscount?.code || profile?.paddle_discount_code || profile?.referral_code,
      paddle_discount_id: paddleDiscount?.id || profile?.paddle_discount_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function ensureLiveDiscount(profile, code) {
  const payload = buildDiscountPayload({
    code,
    email: profile.email,
    fullName: profile.full_name,
    userId: profile.user_id,
  });

  try {
    if (profile.paddle_discount_id) {
      return await paddleRequest(`/discounts/${profile.paddle_discount_id}`, {
        method: 'PATCH',
        body: {
          status: 'active',
          ...payload,
        },
      });
    }

    const discountByCode = await findPaddleDiscountByCode(code);
    if (discountByCode?.id) {
      return await paddleRequest(`/discounts/${discountByCode.id}`, {
        method: 'PATCH',
        body: {
          status: 'active',
          ...payload,
        },
      });
    }

    return await paddleRequest('/discounts', {
      method: 'POST',
      body: payload,
    });
  } catch (error) {
    const fallbackByCode = await findPaddleDiscountByCode(code).catch(() => null);
    if (fallbackByCode?.id) {
      return await paddleRequest(`/discounts/${fallbackByCode.id}`, {
        method: 'PATCH',
        body: {
          status: 'active',
          ...payload,
        },
      });
    }
    throw error;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { code } = parseBody(req.body);
    const requestedCode = sanitizeCode(code);

    if (!requestedCode) {
      return res.status(400).json({ error: 'A valid affiliate code is required.' });
    }

    const supabase = getSupabaseAdmin();
    const profile = await findAffiliateProfileByCode(supabase, requestedCode);

    if (!profile) {
      return res.status(404).json({ error: 'That affiliate code was not found.' });
    }

    const paddleDiscount = await ensureLiveDiscount(profile, requestedCode);
    const updatedProfile = await saveProfile(supabase, profile, paddleDiscount);

    return res.status(200).json({
      ok: true,
      active: Boolean(updatedProfile?.paddle_discount_id && updatedProfile?.paddle_discount_code),
      code: updatedProfile?.paddle_discount_code || requestedCode,
      profile: updatedProfile,
      paddleDiscount,
    });
  } catch (error) {
    console.error('validate-affiliate-code error:', error);
    return res.status(500).json({ error: error.message || 'Could not validate affiliate code.' });
  }
};
