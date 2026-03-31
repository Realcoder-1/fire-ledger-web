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
  if (!apiKey) {
    return null;
  }

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

async function findDiscount(profile) {
  if (!getPaddleApiKey()) return null;

  if (profile?.paddle_discount_id) {
    return paddleRequest(`/discounts/${profile.paddle_discount_id}`);
  }

  const code = sanitizeCode(profile?.paddle_discount_code || profile?.referral_code || '');
  if (!code) return null;

  const result = await paddleRequest(`/discounts?code=${encodeURIComponent(code)}`);
  return result?.[0] || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { userId } = parseBody(req.body);
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const supabase = getSupabaseAdmin();
    const { data: profile, error: profileError } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      return res.status(404).json({ error: 'Affiliate profile not found.' });
    }

    let referrals = [];
    const { data: richReferrals, error: richReferralsError } = await supabase
      .from('affiliate_referrals')
      .select('referred_email, affiliate_code, attribution_source, applied_discount_code, payout_status, status, commission_amount')
      .eq('affiliate_id', profile.id);

    if (richReferralsError && /attribution_source|applied_discount_code/i.test(richReferralsError.message || '')) {
      const { data: fallbackReferrals, error: fallbackError } = await supabase
        .from('affiliate_referrals')
        .select('referred_email, affiliate_code, payout_status, status, commission_amount')
        .eq('affiliate_id', profile.id);

      if (fallbackError) throw fallbackError;
      referrals = fallbackReferrals || [];
    } else if (richReferralsError) {
      throw richReferralsError;
    } else {
      referrals = richReferrals || [];
    }

    const uniqueCustomers = new Set(
      referrals
        .map((row) => String(row.referred_email || '').toLowerCase())
        .filter(Boolean)
    ).size;

    const paidCount = referrals.filter((row) => row.payout_status === 'paid').length;
    const pendingCount = referrals.filter((row) => row.payout_status === 'pending').length;
    const linkAttributedConversions = referrals.filter((row) => row.attribution_source === 'link').length;
    const discountedConversions = referrals.filter((row) => Boolean(row.applied_discount_code)).length;

    let paddleDiscount = null;
    try {
      paddleDiscount = await findDiscount(profile);
    } catch (error) {
      paddleDiscount = { error: error.message };
    }

    return res.status(200).json({
      ok: true,
      stats: {
        code: profile.paddle_discount_code || profile.referral_code || '',
        paddleDiscountId: profile.paddle_discount_id || paddleDiscount?.id || null,
        paddleRedemptions: Number(paddleDiscount?.times_used || 0),
        enabledForCheckout: Boolean(paddleDiscount?.enabled_for_checkout),
        discountStatus: paddleDiscount?.status || null,
        trackedConversions: referrals.length,
        uniqueCustomers,
        paidConversions: paidCount,
        pendingConversions: pendingCount,
        linkAttributedConversions,
        discountedConversions,
      },
    });
  } catch (error) {
    console.error('affiliate-discount-stats error:', error);
    return res.status(500).json({ error: error.message || 'Could not load affiliate discount stats.' });
  }
};
