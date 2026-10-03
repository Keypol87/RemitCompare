// Servicios de API para RemitCompare MVP

/**
 * Obtiene precios de criptomonedas desde CoinGecko (API pública sin key)
 */
export async function fetchCryptoPrices(): Promise<any[]> {
  const coinIds = [
    'bitcoin', 'ethereum', 'tether', 'usd-coin', 'binancecoin',
    'solana', 'ripple', 'dogecoin', 'cardano', 'avalanche-2',
    'polkadot', 'chainlink'
  ];

  try {
    const params = new URLSearchParams({
      vs_currency: 'usd',
      ids: coinIds.join(','),
      order: 'market_cap_desc',
      per_page: '12',
      page: '1',
      sparkline: 'true',
      price_change_percentage: '1h,24h,7d',
    });

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?${params}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change1h: coin.price_change_percentage_1h_in_currency || 0,
      change24h: coin.price_change_percentage_24h || 0,
      change7d: coin.price_change_percentage_7d_in_currency || 0,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      dominance: coin.id === 'bitcoin' ? 54.2 : coin.id === 'ethereum' ? 8.1 : undefined,
      lastUpdated: coin.last_updated_at 
        ? new Date(coin.last_updated_at * 1000).toISOString()
        : new Date().toISOString(),
      sparkline: coin.sparkline_in_7d?.price || [],
    }));
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
    return [];
  }
}

/**
 * Obtiene tasas de cambio de divisas fiat (API pública sin key)
 */
export async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${baseCurrency}`
    );

    if (!response.ok) {
      console.error(`Frankfurter API error: ${response.status}`);
      return {};
    }

    const data = await response.json();
    return data.rates || {};
  } catch (error) {
    console.error('Error fetching from Frankfurter:', error);
    return {};
  }
}
