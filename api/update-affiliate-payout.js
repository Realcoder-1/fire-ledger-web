const { createClient } = require('@supabase/supabase-js');

const getSupabaseAdmin = () =>
  createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { userId, payoutMethod, payoutEmail, notes } = parseBody(req.body);
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('affiliate_profiles')
      .update({
        payout_method: payoutMethod || 'PayPal',
        payout_email: payoutEmail || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return res.status(200).json({ ok: true, profile: data });
  } catch (error) {
    console.error('update-affiliate-payout error:', error);
    return res.status(500).json({ error: error.message || 'Could not save payout details.' });
  }
};
