// API Services for RemitCompare

// ============================================
// CoinGecko API - Crypto Prices
// ============================================
export async function fetchCryptoPricesFromCoinGecko(
  coinIds: string[] = ['bitcoin', 'ethereum', 'tether', 'usd-coin', 'binancecoin', 'solana', 'ripple', 'dogecoin', 'cardano', 'avalanche-2', 'polkadot', 'chainlink']
) {
  const baseUrl = 'https://api.coingecko.com/api/v3';
  const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;
  
  const params = new URLSearchParams({
    ids: coinIds.join(','),
    vs_currencies: 'usd',
    include_market_cap: 'true',
    include_24hr_vol: 'true',
    include_24hr_change: 'true',
    include_last_updated_at: 'true',
  });

  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  if (apiKey) {
    headers['x-cg-demo-api-key'] = apiKey;
  }

  try {
    const response = await fetch(`${baseUrl}/coins/markets?${params}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
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
      lastUpdated: new Date(coin.last_updated_at * 1000).toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
    return null;
  }
}

// ============================================
// CoinMarketCap API - Crypto Prices (Alternative)
// ============================================
export async function fetchCryptoPricesFromCoinMarketCap(
  symbols: string[] = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'LINK']
) {
  const apiKey = import.meta.env.VITE_COINMARKETCAP_API_KEY;
  
  if (!apiKey) {
    console.warn('CoinMarketCap API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols.join(',')}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }

    const data = await response.json();
    
    return Object.values(data.data).map((coin: any) => ({
      id: coin.slug,
      symbol: coin.symbol,
      name: coin.name,
      price: coin.quote.USD.price,
      change1h: coin.quote.USD.percent_change_1h,
      change24h: coin.quote.USD.percent_change_24h,
      change7d: coin.quote.USD.percent_change_7d,
      marketCap: coin.quote.USD.market_cap,
      volume24h: coin.quote.USD.volume_24h,
      high24h: coin.quote.USD.price * 1.02, // Approximation
      low24h: coin.quote.USD.price * 0.98, // Approximation
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching from CoinMarketCap:', error);
    return null;
  }
}

// ============================================
// Exchange Rates API - Fiat Currency Rates
// ============================================
export async function fetchExchangeRates(baseCurrency: string = 'USD') {
  const apiKey = import.meta.env.VITE_EXCHANGE_RATES_API_KEY;
  
  if (!apiKey) {
    console.warn('Exchange Rates API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.exchangeratesapi.io/v1/latest?base=${baseCurrency}&access_key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Exchange Rates API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.info || 'API error');
    }

    return data.rates;
  } catch (error) {
    console.error('Error fetching from Exchange Rates API:', error);
    return null;
  }
}

// ============================================
// Open Exchange Rates API - Alternative
// ============================================
export async function fetchExchangeRatesFromOpenExchangeRates(baseCurrency: string = 'USD') {
  const apiKey = import.meta.env.VITE_OPEN_EXCHANGE_RATES_API_KEY;
  
  if (!apiKey) {
    console.warn('Open Exchange Rates API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=${baseCurrency}`
    );

    if (!response.ok) {
      throw new Error(`Open Exchange Rates API error: ${response.status}`);
    }

    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching from Open Exchange Rates:', error);
    return null;
  }
}

// ============================================
// Free Currency API - No API Key Required
// ============================================
export async function fetchExchangeRatesFromFreeAPI(baseCurrency: string = 'USD') {
  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${baseCurrency}`
    );

    if (!response.ok) {
      throw new Error(`Free API error: ${response.status}`);
    }

    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching from Free API:', error);
    return null;
  }
}

// ============================================
// ETH Gas Station - Gas Fees
// ============================================
export async function fetchETHGasFees() {
  try {
    const response = await fetch('https://ethgasstation.info/api/ethgasAPI.json');

    if (!response.ok) {
      throw new Error(`ETH Gas Station API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      fast: data.fast / 10, // Convert to Gwei
      average: data.average / 10,
      slow: data.safeLow / 10,
      estimatedTime: data.estimatedTime,
    };
  } catch (error) {
    console.error('Error fetching ETH gas fees:', error);
    return null;
  }
}

// ============================================
// Main function to fetch all data
// ============================================
export async function fetchAllMarketData() {
  const [cryptoPrices, exchangeRates] = await Promise.all([
    fetchCryptoPricesFromCoinGecko(),
    fetchExchangeRatesFromFreeAPI(),
  ]);

  return {
    cryptoPrices,
    exchangeRates,
    lastUpdated: new Date().toISOString(),
  };
}
