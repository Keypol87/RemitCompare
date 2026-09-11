export interface Country {
  code: string;
  name: string;
  nameEs: string;
  currency: string;
  flag: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  type: 'fiat' | 'crypto';
}

export interface BlockchainNetwork {
  id: string;
  name: string;
  symbol: string;
  avgFee: number;
  avgFeeUnit: string;
  confirmationTime: number;
  congestion: 'low' | 'medium' | 'high';
  confirmations: number;
}

export interface Provider {
  id: string;
  name: string;
  logo: string;
  type: 'remittance' | 'exchange' | 'wallet' | 'bank';
  supportedCountries: string[];
  supportedCurrencies: string[];
  supportedCrypto: string[];
  supportedNetworks: string[];
  paymentMethods: PaymentMethod[];
  receiveMethods: ReceiveMethod[];
  feeStructure: FeeStructure;
  avgDeliveryTime: number;
  timeUnit: 'minutes' | 'hours' | 'days';
  securityRating: number;
  trustScore: number;
  affiliateLink?: string;
  isSponsored?: boolean;
}

export type PaymentMethod = 'bank_transfer' | 'debit_card' | 'credit_card' | 'wallet_balance' | 'crypto';
export type ReceiveMethod = 'bank_account' | 'cash' | 'digital_wallet' | 'exchange' | 'blockchain_address';

export interface FeeStructure {
  fixedFee: number;
  percentageFee: number;
  paymentMethodFees: Record<string, number>;
  exchangeRateMargin: number;
  withdrawalFee: number;
  networkFee: number;
  minAmount: number;
  maxAmount: number;
}

export interface ComparisonRequest {
  originCountry: string;
  destinationCountry: string;
  sendCurrency: string;
  receiveCurrency: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receiveMethod: ReceiveMethod;
  priority: 'lowest_cost' | 'fastest' | 'best_rate' | 'most_secure' | 'most_available';
  preferredNetwork?: string;
  blockchainAddress?: string;
}

export interface CostBreakdown {
  fixedFee: number;
  percentageFee: number;
  paymentMethodFee: number;
  exchangeRateMargin: number;
  withdrawalFee: number;
  networkFee: number;
  totalCost: number;
  effectivePercentage: number;
}

export interface ComparisonResult {
  provider: Provider;
  amountSent: number;
  amountReceived: number;
  exchangeRate: number;
  marketRate: number;
  costBreakdown: CostBreakdown;
  estimatedTime: number;
  timeUnit: string;
  score: number;
  network?: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  savingsVsMostExpensive: number;
  isSponsored?: boolean;
}

export interface Recommendation {
  type: 'best_price' | 'best_balance' | 'best_crypto';
  title: string;
  description: string;
  result: ComparisonResult;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  dominance?: number;
  lastUpdated: string;
  sparkline?: number[];
}

export interface ScoringWeights {
  cost: number;
  exchangeRate: number;
  speed: number;
  security: number;
  availability: number;
  easeOfUse: number;
}

export interface UserPreferences {
  language: 'es' | 'en';
  theme: 'light' | 'dark';
  weights: ScoringWeights;
  isPremium: boolean;
}

export type Page = 'compare' | 'crypto' | 'networks' | 'pricing' | 'history' | 'admin';
