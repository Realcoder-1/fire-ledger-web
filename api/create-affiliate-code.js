const { createClient } = require('@supabase/supabase-js');

const MONTHLY_PRICE_ID = process.env.PADDLE_MONTHLY_PRICE_ID || 'pri_01kkk53619cxb49atjaykftcn7';
const ANNUAL_PRICE_ID = process.env.PADDLE_ANNUAL_PRICE_ID || 'pri_01kkk544b2fntpj7s989ntee0x';
const PADDLE_API_BASE = process.env.PADDLE_API_BASE || 'https://api.paddle.com';
const AFFILIATE_DISCOUNT_PERCENT = process.env.PADDLE_AFFILIATE_DISCOUNT_PERCENT || '10';

const sanitizeCode = (value = '') =>
  String(value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);

const buildFallbackCode = (name = '', email = '') => {
  const base = sanitizeCode(name || email.split('@')[0] || 'FIRELEDGER').slice(0, 12) || 'FIRELEDGER';
  return `${base}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

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

async function findExistingProfile(supabase, userId) {
  const { data, error } = await supabase
    .from('affiliate_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function ensureCodeAvailable(supabase, code, userId) {
  const { data, error } = await supabase
    .from('affiliate_profiles')
    .select('user_id, referral_code, paddle_discount_code')
    .or(`referral_code.eq.${code},paddle_discount_code.eq.${code}`);

  if (error) throw error;

  const takenByAnotherUser = (data || []).some((row) => row.user_id !== userId);
  if (takenByAnotherUser) {
    throw new Error('That code is already in use. Please choose another one.');
  }
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

async function upsertProfile(supabase, profile, { userId, email, fullName, code, paddleDiscount }) {
  const now = new Date().toISOString();
  const nextProfile = {
    user_id: userId,
    email,
    full_name: fullName || profile?.full_name || email,
    status: profile?.status || 'active',
    referral_code: code,
    paddle_discount_code: paddleDiscount?.code || profile?.paddle_discount_code || null,
    paddle_discount_id: paddleDiscount?.id || profile?.paddle_discount_id || null,
    updated_at: now,
  };

  const query = supabase
    .from('affiliate_profiles')
    .upsert(nextProfile, { onConflict: 'user_id' })
    .select('*')
    .single();

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { userId, email, fullName, preferredCode } = parseBody(req.body);

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required.' });
    }

    const supabase = getSupabaseAdmin();
    const existingProfile = await findExistingProfile(supabase, userId);
    const requestedCode = sanitizeCode(preferredCode) || existingProfile?.paddle_discount_code || existingProfile?.referral_code || buildFallbackCode(fullName, email);

    await ensureCodeAvailable(supabase, requestedCode, userId);

    let paddleDiscount;
    if (getPaddleApiKey()) {
      const discountPayload = buildDiscountPayload({
        code: requestedCode,
        email,
        fullName,
        userId,
      });

      if (existingProfile?.paddle_discount_id) {
        paddleDiscount = await paddleRequest(`/discounts/${existingProfile.paddle_discount_id}`, {
          method: 'PATCH',
          body: discountPayload,
        });
      } else {
        paddleDiscount = await paddleRequest('/discounts', {
          method: 'POST',
          body: discountPayload,
        });
      }
    }

    const profile = await upsertProfile(supabase, existingProfile, {
      userId,
      email,
      fullName,
      code: requestedCode,
      paddleDiscount,
    });

    return res.status(200).json({
      ok: true,
      profile,
      paddleDiscount,
      paddleConfigured: Boolean(getPaddleApiKey()),
    });
  } catch (error) {
    console.error('create-affiliate-code error:', error);
    const statusCode = /already in use/i.test(error.message || '') ? 409 : 500;
    return res.status(statusCode).json({ error: error.message || 'Could not provision affiliate code.' });
  }
};
