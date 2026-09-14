import { useState, useEffect } from 'react';
import { fetchCryptoPrices, fetchExchangeRates } from './services/api';

// Configuración de Adsterra - REEMPLAZA CON TUS CÓDIGOS
const ADSTERRA_BANNER_KEY = 'TU_BANNER_KEY_AQUI'; // Banner 728x90
const ADSTERRA_NATIVE_KEY = 'TU_NATIVE_KEY_AQUI'; // Native Banner

// Datos de demostración
const demoCryptoData = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 104250, change1h: 0.3, change24h: 2.1, change7d: 5.8, marketCap: 2050000000000, volume24h: 42000000000, high24h: 105100, low24h: 101800, dominance: 54.2, sparkline: [98000, 99500, 100200, 101000, 102500, 101800, 103000, 104250] },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2520, change1h: -0.2, change24h: 1.5, change7d: 3.2, marketCap: 303000000000, volume24h: 18000000000, high24h: 2560, low24h: 2480, dominance: 8.1, sparkline: [2400, 2420, 2450, 2480, 2500, 2490, 2510, 2520] },
  { id: 'tether', symbol: 'USDT', name: 'Tether', price: 1.00, change1h: 0.01, change24h: -0.01, change7d: 0.02, marketCap: 120000000000, volume24h: 65000000000, high24h: 1.001, low24h: 0.999, sparkline: [1, 1, 1, 1, 1, 1, 1, 1] },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 680, change1h: 0.5, change24h: 1.8, change7d: 4.1, marketCap: 98000000000, volume24h: 2200000000, high24h: 690, low24h: 665, sparkline: [650, 655, 660, 665, 670, 672, 676, 680] },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 172, change1h: 1.2, change24h: 3.5, change7d: 8.2, marketCap: 80000000000, volume24h: 4500000000, high24h: 175, low24h: 165, sparkline: [158, 160, 163, 165, 168, 170, 171, 172] },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 2.35, change1h: -0.8, change24h: 0.9, change7d: 2.1, marketCap: 130000000000, volume24h: 5200000000, high24h: 2.40, low24h: 2.28, sparkline: [2.20, 2.22, 2.25, 2.28, 2.30, 2.32, 2.34, 2.35] },
];

// Datos de proveedores
const providers = [
  { id: 'wise', name: 'Wise', logo: '🟢', fixedFee: 1.50, percentageFee: 0.45, exchangeRateMargin: 0.35, deliveryTime: 15, score: 92 },
  { id: 'remitly', name: 'Remitly', logo: '🔵', fixedFee: 3.99, percentageFee: 0.8, exchangeRateMargin: 1.2, deliveryTime: 10, score: 88 },
  { id: 'western_union', name: 'Western Union', logo: '🟡', fixedFee: 5.00, percentageFee: 1.5, exchangeRateMargin: 2.5, deliveryTime: 30, score: 85 },
  { id: 'paypal', name: 'PayPal', logo: '🔷', fixedFee: 4.99, percentageFee: 1.8, exchangeRateMargin: 3.0, deliveryTime: 5, score: 82 },
  { id: 'binance', name: 'Binance', logo: '🟠', fixedFee: 1.00, percentageFee: 0.1, exchangeRateMargin: 0.1, deliveryTime: 10, score: 80 },
];

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function App() {
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [cryptoData, setCryptoData] = useState(demoCryptoData);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingDemoData, setIsUsingDemoData] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Form state
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch market data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const crypto = await fetchCryptoPrices();
        if (crypto && crypto.length > 0) {
          setCryptoData(crypto);
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
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCompare = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const rate = exchangeRates[toCurrency] || 1;
    
    const calculatedResults = providers.map(provider => {
      const fixedFee = provider.fixedFee;
      const percentageFee = numAmount * (provider.percentageFee / 100);
      const exchangeMargin = numAmount * (provider.exchangeRateMargin / 100);
      const totalCost = fixedFee + percentageFee + exchangeMargin;
      const amountReceived = (numAmount - totalCost) * rate * (1 - provider.exchangeRateMargin / 100);
      const effectivePercentage = (totalCost / numAmount) * 100;

      return {
        ...provider,
        amountReceived,
        totalCost,
        effectivePercentage,
        exchangeRate: rate * (1 - provider.exchangeRateMargin / 100),
      };
    });

    calculatedResults.sort((a, b) => b.amountReceived - a.amountReceived);
    setResults(calculatedResults);
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💱</span>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  RemitCompare
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
                  {language === 'es' ? 'Compara comisiones de envío' : 'Compare transfer fees'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="px-2 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {language === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
              </button>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
            {language === 'es' ? 'Encuentra la mejor plataforma para enviar dinero' : 'Find the best platform to send money'}
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {language === 'es' 
              ? 'Compara comisiones de envío de dinero y criptomonedas' 
              : 'Compare money transfer and cryptocurrency fees'}
          </p>
        </div>

        {/* Comparison Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
            {language === 'es' ? '📋 Configurar envío' : '📋 Configure transfer'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'es' ? 'Importe' : 'Amount'}
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'es' ? 'Desde' : 'From'}
              </label>
              <select
                value={fromCurrency}
                onChange={e => setFromCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="MXN">MXN - Mexican Peso</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {language === 'es' ? 'Hacia' : 'To'}
              </label>
              <select
                value={toCurrency}
                onChange={e => setToCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - US Dollar</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="MXN">MXN - Mexican Peso</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCompare}
            className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-blue-700 transition-all shadow-lg"
          >
            🔍 {language === 'es' ? 'Comparar plataformas' : 'Compare platforms'}
          </button>
        </div>

        {/* Adsterra Banner */}
        {ADSTERRA_BANNER_KEY !== 'TU_BANNER_KEY_AQUI' && (
          <div className="mb-6">
            <div className="text-center mb-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                {language === 'es' ? 'Publicidad' : 'Advertisement'}
              </span>
            </div>
            <div className="min-h-[90px] bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <p className="text-xs text-slate-400">Adsterra Banner 728x90</p>
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && results.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              {language === 'es' ? '📊 Resultados de comparación' : '📊 Comparison results'}
            </h3>

            <div className="space-y-3">
              {results.map((result, idx) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-xl border-2 ${
                    idx === 0
                      ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{result.logo}</span>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{result.name}</p>
                        {idx === 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded">
                            {language === 'es' ? 'Mejor opción' : 'Best option'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{language === 'es' ? 'Recibirás' : 'You receive'}</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        {result.amountReceived.toFixed(2)} {toCurrency}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                    <div>
                      <span className="text-slate-500">{language === 'es' ? 'Costo total' : 'Total cost'}</span>
                      <p className="font-medium text-red-600 dark:text-red-400">${result.totalCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">{language === 'es' ? 'Comisión' : 'Fee'}</span>
                      <p className="font-medium text-slate-800 dark:text-white">{result.effectivePercentage.toFixed(2)}%</p>
                    </div>
                    <div>
                      <span className="text-slate-500">{language === 'es' ? 'Tiempo' : 'Time'}</span>
                      <p className="font-medium text-slate-800 dark:text-white">{result.deliveryTime} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crypto Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>📈</span> {language === 'es' ? 'Panel de Criptomonedas' : 'Crypto Dashboard'}
            </h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {lastUpdated?.toLocaleTimeString() || '---'}
              </span>
            </div>
          </div>

          {isUsingDemoData && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                ⚠️ {language === 'es' 
                  ? 'Usando datos de demostración'
                  : 'Using demo data'}
              </p>
            </div>
          )}

          {!isUsingDemoData && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                ✅ {language === 'es' 
                  ? 'Datos en tiempo real de CoinGecko'
                  : 'Real-time data from CoinGecko'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cryptoData.map(asset => (
              <div key={asset.id} className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{asset.symbol}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{asset.name}</span>
                  </div>
                  {asset.dominance && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                      {asset.dominance}%
                    </span>
                  )}
                </div>

                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  ${asset.price < 1 ? asset.price.toFixed(4) : asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-medium ${asset.change24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    24h: {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                  <span className={`text-xs font-medium ${asset.change7d >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    7d: {asset.change7d >= 0 ? '+' : ''}{asset.change7d.toFixed(2)}%
                  </span>
                </div>

                {asset.sparkline && asset.sparkline.length > 0 && (
                  <div className="mt-3 h-8">
                    <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke={asset.change24h >= 0 ? '#10b981' : '#ef4444'}
                        strokeWidth="1.5"
                        points={asset.sparkline.map((val: number, i: number) => {
                          const min = Math.min(...asset.sparkline);
                          const max = Math.max(...asset.sparkline);
                          const range = max - min || 1;
                          const x = (i / (asset.sparkline.length - 1)) * 100;
                          const y = 30 - ((val - min) / range) * 28;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                    </svg>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{language === 'es' ? 'Cap. mercado' : 'Market cap'}</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{formatLargeNumber(asset.marketCap)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{language === 'es' ? 'Volumen 24h' : 'Volume 24h'}</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{formatLargeNumber(asset.volume24h)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-xs text-slate-400">
            © 2025 RemitCompare. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
