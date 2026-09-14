import { useState, useEffect } from 'react';
import { fetchCryptoPrices, fetchExchangeRates } from '../services/api';
import { defaultCryptoPrices } from '../data/providers';

export function useMarketData(refreshInterval: number = 60000) {
  const [cryptoPrices, setCryptoPrices] = useState(defaultCryptoPrices);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUsingDemoData, setIsUsingDemoData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const crypto = await fetchCryptoPrices();
        if (crypto && crypto.length > 0) {
          setCryptoPrices(crypto);
          setIsUsingDemoData(false);
          console.log('✅ Datos reales de CoinGecko cargados');
        } else {
          console.warn('⚠️ Usando datos de demostración');
          setIsUsingDemoData(true);
        }

        const rates = await fetchExchangeRates();
        if (rates) {
          setExchangeRates(rates);
        }

        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsUsingDemoData(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    cryptoPrices,
    exchangeRates,
    isLoading,
    lastUpdated,
    isUsingDemoData,
  };
}
