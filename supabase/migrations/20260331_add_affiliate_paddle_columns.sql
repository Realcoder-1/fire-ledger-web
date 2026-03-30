alter table if exists public.affiliate_profiles
  add column if not exists paddle_discount_code text,
  add column if not exists paddle_discount_id text;

alter table if exists public.affiliate_referrals
  add column if not exists affiliate_code text,
  add column if not exists paddle_transaction_id text,
  add column if not exists paddle_subscription_id text;

create unique index if not exists affiliate_profiles_paddle_discount_code_key
  on public.affiliate_profiles (lower(paddle_discount_code))
  where paddle_discount_code is not null;

create unique index if not exists affiliate_referrals_paddle_transaction_id_key
  on public.affiliate_referrals (paddle_transaction_id)
  where paddle_transaction_id is not null;
