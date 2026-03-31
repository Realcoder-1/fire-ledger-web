const STORAGE_KEY = 'fireledger_affiliate_code';
const AUTH_DESTINATION_KEY = 'fireledger_auth_destination';

export const sanitizeAffiliateCode = (value = '') =>
  String(value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);

export const getAffiliateCodeFromSearch = (search = '') => {
  const params = new URLSearchParams(search);
  return sanitizeAffiliateCode(
    params.get('ref') || params.get('code') || params.get('coupon') || ''
  );
};

export const persistAffiliateCode = (code) => {
  const nextCode = sanitizeAffiliateCode(code);
  if (typeof window === 'undefined' || !nextCode) return nextCode;
  window.localStorage.setItem(STORAGE_KEY, nextCode);
  return nextCode;
};

export const readStoredAffiliateCode = () => {
  if (typeof window === 'undefined') return '';
  return sanitizeAffiliateCode(window.localStorage.getItem(STORAGE_KEY) || '');
};

export const clearStoredAffiliateCode = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const captureAffiliateCodeFromSearch = (search = '') => {
  const code = getAffiliateCodeFromSearch(search);
  if (!code) return '';
  return persistAffiliateCode(code);
};

export const markAffiliateAuthIntent = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(AUTH_DESTINATION_KEY, 'affiliate');
};

export const hasAffiliateAuthIntent = () => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(AUTH_DESTINATION_KEY) === 'affiliate';
};

export const clearAffiliateAuthIntent = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(AUTH_DESTINATION_KEY);
};
