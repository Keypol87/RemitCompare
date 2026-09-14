export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', MXN: 'MX$', COP: 'COL$',
    BRL: 'R$', ARS: 'AR$', PHP: '₱', INR: '₹', JPY: '¥',
    CAD: 'C$', AUD: 'A$', BTC: '₿', ETH: 'Ξ', USDT: '₮',
    USDC: '$', BNB: '', SOL: '', XRP: '',
  };
  const symbol = symbols[currency] || '';
  const decimals = ['JPY', 'KRW'].includes(currency) ? 0 : ['BTC'].includes(currency) ? 8 : 2;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
