import { ComparisonRequest, ComparisonResult, CostBreakdown, Recommendation, ScoringWeights, Provider } from '../types';
import { providers, exchangeRates, blockchainNetworks } from '../data/providers';

export function getExchangeRate(from: string, to: string): number {
  const key = `${from}-${to}`;
  if (exchangeRates[key]) return exchangeRates[key];
  const reverseKey = `${to}-${from}`;
  if (exchangeRates[reverseKey]) return 1 / exchangeRates[reverseKey];
  if (from === to) return 1;
  // Try via USD
  const fromUsd = exchangeRates[`${from}-USD`] || (exchangeRates[`USD-${from}`] ? 1 / exchangeRates[`USD-${from}`] : null);
  const toUsd = exchangeRates[`${to}-USD`] || (exchangeRates[`USD-${to}`] ? 1 / exchangeRates[`USD-${to}`] : null);
  if (fromUsd && toUsd) return toUsd / fromUsd;
  return 1;
}

export function calculateCostBreakdown(
  provider: Provider,
  amount: number,
  paymentMethod: string,
  receiveMethod: string,
  network?: string
): CostBreakdown {
  const fees = provider.feeStructure;
  const fixedFee = fees.fixedFee;
  const percentageFee = amount * (fees.percentageFee / 100);
  const paymentMethodFee = fees.paymentMethodFees[paymentMethod] || 0;
  const exchangeRateMargin = amount * (fees.exchangeRateMargin / 100);
  const withdrawalFee = receiveMethod === 'blockchain_address' || receiveMethod === 'exchange' ? fees.withdrawalFee : 0;
  
  let networkFee = 0;
  if (network && provider.supportedNetworks.includes(network)) {
    const networkData = blockchainNetworks.find(n => n.id === network);
    networkFee = networkData ? networkData.avgFee : 0;
  }

  const totalCost = fixedFee + percentageFee + paymentMethodFee + exchangeRateMargin + withdrawalFee + networkFee;
  const effectivePercentage = (totalCost / amount) * 100;

  return {
    fixedFee,
    percentageFee,
    paymentMethodFee,
    exchangeRateMargin,
    withdrawalFee,
    networkFee,
    totalCost,
    effectivePercentage,
  };
}

export function calculateAmountReceived(
  amount: number,
  costBreakdown: CostBreakdown,
  exchangeRate: number,
  exchangeRateMargin: number
): number {
  const effectiveRate = exchangeRate * (1 - exchangeRateMargin / 100);
  const amountAfterFees = amount - costBreakdown.totalCost;
  return Math.max(0, amountAfterFees * effectiveRate);
}

export function calculateScore(
  result: Omit<ComparisonResult, 'score'>,
  weights: ScoringWeights
): number {
  const costScore = Math.max(0, 100 - (result.costBreakdown.effectivePercentage * 10));
  const rateScore = Math.max(0, 100 - (Math.abs(result.exchangeRate - result.marketRate) / result.marketRate) * 1000);
  const speedScore = result.estimatedTime <= 5 ? 100 : result.estimatedTime <= 15 ? 85 : result.estimatedTime <= 30 ? 70 : result.estimatedTime <= 60 ? 50 : 30;
  const securityScore = result.provider.securityRating;
  const availabilityScore = result.provider.supportedCountries.length > 10 ? 95 : result.provider.supportedCountries.length > 5 ? 75 : 50;
  const easeScore = result.provider.trustScore;

  const totalWeight = weights.cost + weights.exchangeRate + weights.speed + weights.security + weights.availability + weights.easeOfUse;
  
  const score = (
    (costScore * weights.cost) +
    (rateScore * weights.exchangeRate) +
    (speedScore * weights.speed) +
    (securityScore * weights.security) +
    (availabilityScore * weights.availability) +
    (easeScore * weights.easeOfUse)
  ) / totalWeight;

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function compareProviders(
  request: ComparisonRequest,
  weights: ScoringWeights
): ComparisonResult[] {
  const marketRate = getExchangeRate(request.sendCurrency, request.receiveCurrency);
  
  const availableProviders = providers.filter(provider => {
    const supportsOrigin = provider.supportedCountries.includes(request.originCountry);
    const supportsDestination = provider.supportedCountries.includes(request.destinationCountry);
    const supportsSendCurrency = provider.supportedCurrencies.includes(request.sendCurrency) || provider.supportedCrypto.includes(request.sendCurrency);
    const supportsReceiveCurrency = provider.supportedCurrencies.includes(request.receiveCurrency) || provider.supportedCrypto.includes(request.receiveCurrency);
    const supportsPayment = provider.paymentMethods.includes(request.paymentMethod);
    const supportsReceive = provider.receiveMethods.includes(request.receiveMethod);
    
    return supportsOrigin && supportsDestination && supportsSendCurrency && supportsReceiveCurrency && supportsPayment && supportsReceive;
  });

  const results: ComparisonResult[] = availableProviders.map(provider => {
    const costBreakdown = calculateCostBreakdown(
      provider,
      request.amount,
      request.paymentMethod,
      request.receiveMethod,
      request.preferredNetwork
    );

    const exchangeRateApplied = marketRate * (1 - provider.feeStructure.exchangeRateMargin / 100);
    const amountReceived = calculateAmountReceived(
      request.amount,
      costBreakdown,
      marketRate,
      provider.feeStructure.exchangeRateMargin
    );

    const partialResult = {
      provider,
      amountSent: request.amount,
      amountReceived,
      exchangeRate: exchangeRateApplied,
      marketRate,
      costBreakdown,
      estimatedTime: provider.avgDeliveryTime,
      timeUnit: provider.timeUnit,
      confidenceLevel: provider.trustScore > 88 ? 'high' as const : provider.trustScore > 75 ? 'medium' as const : 'low' as const,
      savingsVsMostExpensive: 0,
      isSponsored: provider.isSponsored,
    };

    const score = calculateScore(partialResult, weights);

    return { ...partialResult, score };
  });

  // Calculate savings vs most expensive
  if (results.length > 0) {
    const maxCost = Math.max(...results.map(r => r.costBreakdown.totalCost));
    results.forEach(r => {
      r.savingsVsMostExpensive = maxCost - r.costBreakdown.totalCost;
    });
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

export function getRecommendations(
  results: ComparisonResult[],
  lang: 'es' | 'en'
): Recommendation[] {
  if (results.length === 0) return [];

  const recommendations: Recommendation[] = [];

  // Best price
  const bestPrice = [...results].sort((a, b) => a.costBreakdown.totalCost - b.costBreakdown.totalCost)[0];
  recommendations.push({
    type: 'best_price',
    title: lang === 'es' ? '🏆 Mejor precio' : '🏆 Best price',
    description: lang === 'es'
      ? `${bestPrice.provider.name}: Recibirás aproximadamente ${bestPrice.amountReceived.toFixed(2)}, con un costo efectivo del ${bestPrice.costBreakdown.effectivePercentage.toFixed(1)}%. Es la mejor opción para minimizar costos.`
      : `${bestPrice.provider.name}: You'll receive approximately ${bestPrice.amountReceived.toFixed(2)}, with an effective cost of ${bestPrice.costBreakdown.effectivePercentage.toFixed(1)}%. Best option to minimize costs.`,
    result: bestPrice,
  });

  // Best balance (price + speed)
  const bestBalance = [...results].sort((a, b) => {
    const scoreA = (a.amountReceived * 0.6) + ((60 / Math.max(a.estimatedTime, 1)) * 40);
    const scoreB = (b.amountReceived * 0.6) + ((60 / Math.max(b.estimatedTime, 1)) * 40);
    return scoreB - scoreA;
  })[0];
  recommendations.push({
    type: 'best_balance',
    title: lang === 'es' ? '⚡ Mejor equilibrio' : '⚡ Best balance',
    description: lang === 'es'
      ? `${bestBalance.provider.name}: Entrega en ${bestBalance.estimatedTime} ${bestBalance.timeUnit} con un costo del ${bestBalance.costBreakdown.effectivePercentage.toFixed(1)}%. Equilibrio óptimo entre precio y velocidad.`
      : `${bestBalance.provider.name}: Delivery in ${bestBalance.estimatedTime} ${bestBalance.timeUnit} with a cost of ${bestBalance.costBreakdown.effectivePercentage.toFixed(1)}%. Optimal balance between price and speed.`,
    result: bestBalance,
  });

  // Best crypto option
  const cryptoResults = results.filter(r => r.provider.supportedCrypto.length > 0);
  if (cryptoResults.length > 0) {
    const bestCrypto = [...cryptoResults].sort((a, b) => b.score - a.score)[0];
    recommendations.push({
      type: 'best_crypto',
      title: lang === 'es' ? '🔗 Mejor opción crypto' : '🔗 Best crypto option',
      description: lang === 'es'
        ? `${bestCrypto.provider.name}: Soporta ${bestCrypto.provider.supportedCrypto.length} criptomonedas y ${bestCrypto.provider.supportedNetworks.length} redes. Ideal para transferencias con cripto.`
        : `${bestCrypto.provider.name}: Supports ${bestCrypto.provider.supportedCrypto.length} cryptocurrencies and ${bestCrypto.provider.supportedNetworks.length} networks. Ideal for crypto transfers.`,
      result: bestCrypto,
    });
  }

  return recommendations;
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

export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

export function validateBlockchainAddress(address: string, network?: string): boolean {
  if (!address) return true; // Optional field
  if (!network) return address.length >= 20;
  
  const patterns: Record<string, RegExp> = {
    ethereum: /^0x[a-fA-F0-9]{40}$/,
    bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
    solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    tron: /^T[a-zA-HJ-NP-Z0-9]{33}$/,
    bnb_chain: /^(bnb|0x)[a-zA-HJ-NP-Z0-9]{38,42}$/,
  };
  
  if (patterns[network]) return patterns[network].test(address);
  return address.length >= 20;
}
