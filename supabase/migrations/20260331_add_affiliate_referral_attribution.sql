alter table if exists public.affiliate_referrals
  add column if not exists attribution_source text,
  add column if not exists applied_discount_code text;
