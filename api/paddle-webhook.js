const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const LIFETIME_PRICE_ID = process.env.PADDLE_LIFETIME_PRICE_ID || 'pri_01km5hzemdp93p7d4mgpky8qz0';
const MONTHLY_PRICE_ID = process.env.PADDLE_MONTHLY_PRICE_ID || 'pri_01kkk53619cxb49atjaykftcn7';
const ANNUAL_PRICE_ID = process.env.PADDLE_ANNUAL_PRICE_ID || 'pri_01kkk544b2fntpj7s989ntee0x';
const COMMISSION_RATE = Number(process.env.AFFILIATE_COMMISSION_RATE || '0.3');

const sanitizeCode = (value = '') =>
  String(value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const getSupabaseAdmin = () =>
  createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

const getRawBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

function verifyPaddleSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;

  const parts = Object.fromEntries(
    String(signatureHeader)
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([key, value]) => key && value)
  );

  if (!parts.ts || !parts.h1) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${parts.ts}:${rawBody}`)
    .digest('hex');

  if (expected.length !== String(parts.h1).length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.h1));
}

async function findUserByEmail(supabase, email) {
  if (!email) return null;

  let page = 1;
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const users = data?.users || [];
    const match = users.find((user) => String(user.email || '').toLowerCase() === String(email).toLowerCase());
    if (match) return match;
    if (users.length < 200) break;
    page += 1;
  }

  return null;
}

function getCustomerEmail(entity) {
  return (
    entity?.customer?.email ||
    entity?.billing_details?.email ||
    entity?.address?.email ||
    entity?.custom_data?.customer_email ||
    null
  );
}

function getPriceId(entity) {
  return entity?.items?.[0]?.price?.id || entity?.details?.line_items?.[0]?.price?.id || null;
}

function getPlanDetails(entity) {
  const priceId = getPriceId(entity);
  if (priceId === LIFETIME_PRICE_ID) {
    return { planType: 'lifetime', planPrice: 5, priceId };
  }
  if (priceId === MONTHLY_PRICE_ID) {
    return { planType: 'monthly', planPrice: 4.99, priceId };
  }
  if (priceId === ANNUAL_PRICE_ID) {
    return { planType: 'annual', planPrice: 59.99, priceId };
  }
  return { planType: entity?.subscription_id ? 'recurring' : 'purchase', planPrice: null, priceId };
}

function extractAppliedDiscountCode(entity) {
  return sanitizeCode(
    entity?.custom_data?.checkout_discount_code ||
      entity?.discount?.code ||
      entity?.discount_code ||
      entity?.discounts?.[0]?.code ||
      entity?.discounts?.[0]?.discount?.code ||
      ''
  );
}

function extractAffiliateAttribution(entity) {
  const linkCode = sanitizeCode(
    entity?.custom_data?.affiliate_code ||
      entity?.custom_data?.affiliate_referral_code ||
      ''
  );
  const appliedDiscountCode = extractAppliedDiscountCode(entity);

  return {
    affiliateCode: linkCode || appliedDiscountCode,
    attributionSource: linkCode ? 'link' : appliedDiscountCode ? 'discount' : null,
    appliedDiscountCode,
  };
}

async function resolveUserId(supabase, entity) {
  const customUserId = entity?.custom_data?.fireledger_user_id;
  if (customUserId) return customUserId;

  const email = getCustomerEmail(entity);
  const user = await findUserByEmail(supabase, email);
  return user?.id || null;
}

async function findAffiliateProfileByCode(supabase, affiliateCode) {
  if (!affiliateCode) return null;

  const { data, error } = await supabase
    .from('affiliate_profiles')
    .select('*')
    .or(`paddle_discount_code.eq.${affiliateCode},referral_code.eq.${affiliateCode}`)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function upsertSubscription(supabase, entity, statusOverride) {
  const userId = await resolveUserId(supabase, entity);
  if (!userId) return;

  const plan = getPlanDetails(entity);
  const subscriptionId = entity?.subscription_id || entity?.id;
  const row = {
    user_id: userId,
    paddle_subscription_id:
      plan.priceId === LIFETIME_PRICE_ID ? `lifetime_${entity.id}` : subscriptionId,
    status: statusOverride || entity?.status || 'active',
    plan_type: plan.planType,
    price_id: plan.priceId,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('subscriptions').upsert(row, { onConflict: 'user_id' });
  if (error) throw error;
}

async function upsertAffiliateReferral(supabase, entity) {
  const attribution = extractAffiliateAttribution(entity);
  const affiliateCode = attribution.affiliateCode;
  const customerEmail = getCustomerEmail(entity);
  if (!affiliateCode || !customerEmail) return;

  const affiliateProfile = await findAffiliateProfileByCode(supabase, affiliateCode);
  if (!affiliateProfile) return;

  if (String(affiliateProfile.email || '').toLowerCase() === String(customerEmail).toLowerCase()) {
    return;
  }

  const plan = getPlanDetails(entity);
  const planPrice = plan.planPrice;
  const commissionAmount = planPrice === null ? null : roundMoney(planPrice * COMMISSION_RATE);
  const now = new Date().toISOString();
  const row = {
    affiliate_id: affiliateProfile.id,
    affiliate_code: affiliateCode,
    attribution_source: attribution.attributionSource,
    applied_discount_code: attribution.appliedDiscountCode || null,
    referred_email: customerEmail,
    plan_type: plan.planType,
    plan_price: planPrice,
    commission_amount: commissionAmount,
    status: entity?.status === 'canceled' || entity?.status === 'paused' ? 'inactive' : 'active',
    payout_status: 'pending',
    paddle_transaction_id: entity?.id || null,
    paddle_subscription_id: entity?.subscription_id || null,
    updated_at: now,
  };

  const { error } = await supabase
    .from('affiliate_referrals')
    .upsert(row, { onConflict: 'paddle_transaction_id' });

  if (error) {
    if (/attribution_source|applied_discount_code/i.test(error.message || '')) {
      const fallbackRow = {
        affiliate_id: row.affiliate_id,
        affiliate_code: row.affiliate_code,
        referred_email: row.referred_email,
        plan_type: row.plan_type,
        plan_price: row.plan_price,
        commission_amount: row.commission_amount,
        status: row.status,
        payout_status: row.payout_status,
        paddle_transaction_id: row.paddle_transaction_id,
        paddle_subscription_id: row.paddle_subscription_id,
        updated_at: row.updated_at,
      };

      const { error: fallbackError } = await supabase
        .from('affiliate_referrals')
        .upsert(fallbackRow, { onConflict: 'paddle_transaction_id' });

      if (fallbackError) throw fallbackError;
      return;
    }

    throw error;
  }
}

async function updateReferralSubscriptionStatus(supabase, subscriptionId, status) {
  if (!subscriptionId) return;

  const { error } = await supabase
    .from('affiliate_referrals')
    .update({
      status: status === 'canceled' || status === 'paused' ? 'inactive' : 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', subscriptionId);

  if (error) throw error;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const rawBody = await getRawBody(req);
  const signature = req.headers['paddle-signature'];

  if (!verifyPaddleSignature(rawBody, signature, process.env.PADDLE_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature.' });
  }

  try {
    const payload = JSON.parse(rawBody);
    const eventType = payload?.event_type;
    const data = payload?.data || {};
    const supabase = getSupabaseAdmin();

    if (eventType === 'transaction.completed') {
      await upsertSubscription(supabase, data, 'active');
      await upsertAffiliateReferral(supabase, data);
      return res.status(200).json({ received: true });
    }

    if (eventType === 'subscription.created' || eventType === 'subscription.activated') {
      await upsertSubscription(supabase, data, data?.status || 'active');
      await updateReferralSubscriptionStatus(supabase, data?.id, data?.status || 'active');
      return res.status(200).json({ received: true });
    }

    if (eventType === 'subscription.updated') {
      await upsertSubscription(supabase, data, data?.status);
      await updateReferralSubscriptionStatus(supabase, data?.id, data?.status);
      return res.status(200).json({ received: true });
    }

    if (eventType === 'subscription.canceled' || eventType === 'subscription.paused') {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: data?.status, updated_at: new Date().toISOString() })
        .eq('paddle_subscription_id', data?.id);

      if (error) throw error;

      await updateReferralSubscriptionStatus(supabase, data?.id, data?.status);
      return res.status(200).json({ received: true });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('paddle-webhook error:', error);
    return res.status(500).json({ error: error.message || 'Webhook handling failed.' });
  }
}

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
