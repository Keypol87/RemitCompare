import { useState, useEffect, useCallback } from 'react';
import { CryptoAsset } from '../types';
import { fetchCryptoPricesFromCoinGecko, fetchExchangeRatesFromFreeAPI } from '../services/api';
import { defaultCryptoPrices } from '../data/providers';

interface UseMarketDataReturn {
  cryptoPrices: CryptoAsset[];
  exchangeRates: Record<string, number> | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isUsingDemoData: boolean;
}

export function useMarketData(refreshInterval: number = 60000): UseMarketDataReturn {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoAsset[]>(defaultCryptoPrices);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUsingDemoData, setIsUsingDemoData] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch crypto prices from CoinGecko
      const cryptoData = await fetchCryptoPricesFromCoinGecko();
      
      if (cryptoData && cryptoData.length > 0) {
        setCryptoPrices(cryptoData);
        setIsUsingDemoData(false);
      } else {
        // Use demo data if API fails
        setCryptoPrices(defaultCryptoPrices.map(asset => ({
          ...asset,
          price: asset.price * (1 + (Math.random() - 0.5) * 0.002),
          change1h: asset.change1h + (Math.random() - 0.5) * 0.1,
          lastUpdated: new Date().toISOString(),
        })));
        setIsUsingDemoData(true);
      }

      // Fetch exchange rates
      const rates = await fetchExchangeRatesFromFreeAPI();
      if (rates) {
        setExchangeRates(rates);
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching market data');
      setIsUsingDemoData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Set up refresh interval
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    cryptoPrices,
    exchangeRates,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchData,
    isUsingDemoData,
  };
}
