import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LIFETIME_PRICE_ID = 'pri_01km5hzemdp93p7d4mgpky8qz0';

function verifyPaddleSignature(rawBody, signatureHeader, secret) {
  const parts = Object.fromEntries(signatureHeader.split(';').map(p => p.split('=')));
  const expected = crypto.createHmac('sha256', secret)
    .update(`${parts['ts']}:${rawBody}`).digest('hex');
  return expected === parts['h1'];
}

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function findUserByEmail(email) {
  const { data: authUser } = await supabase.auth.admin.listUsers();
  return authUser?.users?.find(u => u.email === email) || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody   = await getRawBody(req);
  const signature = req.headers['paddle-signature'];

  if (!verifyPaddleSignature(rawBody, signature, process.env.PADDLE_WEBHOOK_SECRET)) {
    console.error('Invalid Paddle signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event_type: eventType, data } = JSON.parse(rawBody);
  console.log('Paddle event:', eventType, data?.id);

  try {

    // ── ONE-TIME LIFETIME PURCHASE ────────────────────────────────────────────
    if (eventType === 'transaction.completed') {
      const priceId   = data?.items?.[0]?.price?.id;
      const userEmail = data?.customer?.email || data?.address?.email;

      // Only process lifetime price — recurring subscriptions fire subscription.* events
      if (priceId !== LIFETIME_PRICE_ID) return res.status(200).json({ received: true });
      if (!userEmail) { console.error('No email in transaction'); return res.status(200).json({ received: true }); }

      const user = await findUserByEmail(userEmail);
      if (!user) { console.error('No user for:', userEmail); return res.status(200).json({ received: true }); }

      await supabase.from('subscriptions').upsert({
        user_id:                user.id,
        paddle_subscription_id: `lifetime_${data.id}`,
        status:                 'active',
        plan_type:              'lifetime',
        price_id:               priceId,
        updated_at:             new Date().toISOString(),
      }, { onConflict: 'user_id' });

      console.log('✅ Lifetime granted for', userEmail);
      return res.status(200).json({ received: true });
    }

    // ── SUBSCRIPTION CREATED / ACTIVATED ─────────────────────────────────────
    if (eventType === 'subscription.created' || eventType === 'subscription.activated') {
      const userEmail = data?.customer?.email || data?.billing_details?.email;
      if (!userEmail) return res.status(200).json({ received: true });

      const user = await findUserByEmail(userEmail);
      if (!user) { console.error('No user for:', userEmail); return res.status(200).json({ received: true }); }

      await supabase.from('subscriptions').upsert({
        user_id:                user.id,
        paddle_subscription_id: data.id,
        status:                 data.status,
        plan_type:              'recurring',
        price_id:               data.items?.[0]?.price?.id,
        updated_at:             new Date().toISOString(),
      }, { onConflict: 'user_id' });

      console.log('✅ Subscription activated for', userEmail);
    }

    // ── SUBSCRIPTION CANCELLED / PAUSED ──────────────────────────────────────
    if (eventType === 'subscription.canceled' || eventType === 'subscription.paused') {
      await supabase.from('subscriptions')
        .update({ status: data.status, updated_at: new Date().toISOString() })
        .eq('paddle_subscription_id', data.id);
      console.log('❌ Subscription cancelled:', data.id);
    }

    // ── SUBSCRIPTION UPDATED ──────────────────────────────────────────────────
    if (eventType === 'subscription.updated') {
      await supabase.from('subscriptions')
        .update({ status: data.status, price_id: data.items?.[0]?.price?.id, updated_at: new Date().toISOString() })
        .eq('paddle_subscription_id', data.id);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
