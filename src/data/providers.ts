import { CryptoAsset } from '../types';

export const defaultCryptoPrices: CryptoAsset[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 104250, change1h: 0.3, change24h: 2.1, change7d: 5.8, marketCap: 2050000000000, volume24h: 42000000000, high24h: 105100, low24h: 101800, dominance: 54.2, lastUpdated: new Date().toISOString(), sparkline: [98000, 99500, 100200, 101000, 102500, 101800, 103000, 104250] },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2520, change1h: -0.2, change24h: 1.5, change7d: 3.2, marketCap: 303000000000, volume24h: 18000000000, high24h: 2560, low24h: 2480, dominance: 8.1, lastUpdated: new Date().toISOString(), sparkline: [2400, 2420, 2450, 2480, 2500, 2490, 2510, 2520] },
  { id: 'tether', symbol: 'USDT', name: 'Tether', price: 1.00, change1h: 0.01, change24h: -0.01, change7d: 0.02, marketCap: 120000000000, volume24h: 65000000000, high24h: 1.001, low24h: 0.999, lastUpdated: new Date().toISOString(), sparkline: [1, 1, 1, 1, 1, 1, 1, 1] },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 680, change1h: 0.5, change24h: 1.8, change7d: 4.1, marketCap: 98000000000, volume24h: 2200000000, high24h: 690, low24h: 665, lastUpdated: new Date().toISOString(), sparkline: [650, 655, 660, 665, 670, 672, 676, 680] },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 172, change1h: 1.2, change24h: 3.5, change7d: 8.2, marketCap: 80000000000, volume24h: 4500000000, high24h: 175, low24h: 165, lastUpdated: new Date().toISOString(), sparkline: [158, 160, 163, 165, 168, 170, 171, 172] },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 2.35, change1h: -0.8, change24h: 0.9, change7d: 2.1, marketCap: 130000000000, volume24h: 5200000000, high24h: 2.40, low24h: 2.28, lastUpdated: new Date().toISOString(), sparkline: [2.20, 2.22, 2.25, 2.28, 2.30, 2.32, 2.34, 2.35] },
];
