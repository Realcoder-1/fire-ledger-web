export function formatCurrency(amount, currency = 'USD') {
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
  const sym = symbols[currency] || '$';
  const n = Math.abs(parseFloat(amount) || 0);
  if (n >= 1000000000) return `${sym}${(n / 1000000000).toFixed(1)}B`;
  if (n >= 1000000)    return `${sym}${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)       return `${sym}${(n / 1000).toFixed(1)}k`;
  return `${sym}${n.toFixed(2)}`;
}
