import { useState, useEffect } from 'react';
import { fetchCryptoPrices, fetchExchangeRates } from './services/api';
import AdsterraAd from './components/AdsterraAd';

// Configuración de Adsterra - REEMPLAZA CON TUS CÓDIGOS
const ADSTERRA_BANNER_KEY = 'TU_BANNER_KEY_AQUI';

// Datos de demostración
const demoCryptoData = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 104250, change1h: 0.3, change24h: 2.1, change7d: 5.8, marketCap: 2050000000000, volume24h: 42000000000, high24h: 105100, low24h: 101800, dominance: 54.2, sparkline: [98000, 99500, 100200, 101000, 102500, 101800, 103000, 104250] },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2520, change1h: -0.2, change24h: 1.5, change7d: 3.2, marketCap: 303000000000, volume24h: 18000000000, high24h: 2560, low24h: 2480, dominance: 8.1, sparkline: [2400, 2420, 2450, 2480, 2500, 2490, 2510, 2520] },
  { id: 'tether', symbol: 'USDT', name: 'Tether', price: 1.00, change1h: 0.01, change24h: -0.01, change7d: 0.02, marketCap: 120000000000, volume24h: 65000000000, high24h: 1.001, low24h: 0.999, sparkline: [1, 1, 1, 1, 1, 1, 1, 1] },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 680, change1h: 0.5, change24h: 1.8, change7d: 4.1, marketCap: 98000000000, volume24h: 2200000000, high24h: 690, low24h: 665, sparkline: [650, 655, 660, 665, 670, 672, 676, 680] },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 172, change1h: 1.2, change24h: 3.5, change7d: 8.2, marketCap: 80000000000, volume24h: 4500000000, high24h: 175, low24h: 165, sparkline: [158, 160, 163, 165, 168, 170, 171, 172] },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 2.35, change1h: -0.8, change24h: 0.9, change7d: 2.1, marketCap: 130000000000, volume24h: 5200000000, high24h: 2.40, low24h: 2.28, sparkline: [2.20, 2.22, 2.25, 2.28, 2.30, 2.32, 2.34, 2.35] },
];

// Países
const countries = [
  { code: 'US', name: 'Estados Unidos', nameEn: 'United States', flag: '🇺🇸', currency: 'USD' },
  { code: 'MX', name: 'México', nameEn: 'Mexico', flag: '🇲🇽', currency: 'MXN' },
  { code: 'ES', name: 'España', nameEn: 'Spain', flag: '🇪🇸', currency: 'EUR' },
  { code: 'GB', name: 'Reino Unido', nameEn: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  { code: 'CO', name: 'Colombia', nameEn: 'Colombia', flag: '🇨🇴', currency: 'COP' },
  { code: 'AR', name: 'Argentina', nameEn: 'Argentina', flag: '🇦🇷', currency: 'ARS' },
  { code: 'BR', name: 'Brasil', nameEn: 'Brazil', flag: '🇧🇷', currency: 'BRL' },
  { code: 'PH', name: 'Filipinas', nameEn: 'Philippines', flag: '🇵🇭', currency: 'PHP' },
];

// Monedas
const currencies = [
  { code: 'USD', name: 'Dólar', nameEn: 'US Dollar', symbol: '$', type: 'fiat' },
  { code: 'EUR', name: 'Euro', nameEn: 'Euro', symbol: '€', type: 'fiat' },
  { code: 'GBP', name: 'Libra', nameEn: 'British Pound', symbol: '£', type: 'fiat' },
  { code: 'MXN', name: 'Peso MX', nameEn: 'Mexican Peso', symbol: 'MX$', type: 'fiat' },
  { code: 'COP', name: 'Peso CO', nameEn: 'Colombian Peso', symbol: 'COL$', type: 'fiat' },
  { code: 'BRL', name: 'Real', nameEn: 'Brazilian Real', symbol: 'R$', type: 'fiat' },
  { code: 'BTC', name: 'Bitcoin', nameEn: 'Bitcoin', symbol: '₿', type: 'crypto' },
  { code: 'ETH', name: 'Ethereum', nameEn: 'Ethereum', symbol: 'Ξ', type: 'crypto' },
  { code: 'USDT', name: 'Tether', nameEn: 'Tether', symbol: '₮', type: 'crypto' },
  { code: 'USDC', name: 'USD Coin', nameEn: 'USD Coin', symbol: '$', type: 'crypto' },
  { code: 'BNB', name: 'BNB', nameEn: 'BNB', symbol: 'BNB', type: 'crypto' },
  { code: 'SOL', name: 'Solana', nameEn: 'Solana', symbol: 'SOL', type: 'crypto' },
  { code: 'XRP', name: 'XRP', nameEn: 'XRP', symbol: 'XRP', type: 'crypto' },
];

// Métodos de pago
const paymentMethods = [
  { id: 'bank_transfer', name: 'Transferencia bancaria', nameEn: 'Bank transfer' },
  { id: 'debit_card', name: 'Tarjeta de débito', nameEn: 'Debit card' },
  { id: 'credit_card', name: 'Tarjeta de crédito', nameEn: 'Credit card' },
  { id: 'wallet', name: 'Wallet digital', nameEn: 'Digital wallet' },
  { id: 'crypto', name: 'Criptomonedas', nameEn: 'Cryptocurrency' },
];

// Métodos de recepción
const receiveMethods = [
  { id: 'bank_account', name: 'Cuenta bancaria', nameEn: 'Bank account' },
  { id: 'cash', name: 'Efectivo', nameEn: 'Cash' },
  { id: 'wallet', name: 'Wallet digital', nameEn: 'Digital wallet' },
  { id: 'exchange', name: 'Exchange', nameEn: 'Exchange' },
  { id: 'blockchain', name: 'Dirección blockchain', nameEn: 'Blockchain address' },
];

// Redes blockchain
const networks = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', fee: 3.50 },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', fee: 5.20 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', fee: 0.001 },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', fee: 0.02 },
  { id: 'bnb_chain', name: 'BNB Chain', symbol: 'BNB', fee: 0.05 },
];

// Prioridades
const priorities = [
  { id: 'lowest_cost', name: 'Menor costo', nameEn: 'Lowest cost' },
  { id: 'fastest', name: 'Más rápido', nameEn: 'Fastest' },
  { id: 'best_rate', name: 'Mejor tasa', nameEn: 'Best rate' },
  { id: 'most_secure', name: 'Más seguro', nameEn: 'Most secure' },
];

// Datos de proveedores
const providers = [
  { id: 'wise', name: 'Wise', logo: '🟢', fixedFee: 1.50, percentageFee: 0.45, exchangeRateMargin: 0.35, deliveryTime: 15, score: 92, supportsCrypto: false },
  { id: 'remitly', name: 'Remitly', logo: '🔵', fixedFee: 3.99, percentageFee: 0.8, exchangeRateMargin: 1.2, deliveryTime: 10, score: 88, supportsCrypto: false },
  { id: 'western_union', name: 'Western Union', logo: '🟡', fixedFee: 5.00, percentageFee: 1.5, exchangeRateMargin: 2.5, deliveryTime: 30, score: 85, supportsCrypto: false },
  { id: 'paypal', name: 'PayPal', logo: '🔷', fixedFee: 4.99, percentageFee: 1.8, exchangeRateMargin: 3.0, deliveryTime: 5, score: 82, supportsCrypto: true },
  { id: 'binance', name: 'Binance', logo: '🟠', fixedFee: 1.00, percentageFee: 0.1, exchangeRateMargin: 0.1, deliveryTime: 10, score: 80, supportsCrypto: true },
  { id: 'coinbase', name: 'Coinbase', logo: '🔹', fixedFee: 1.50, percentageFee: 0.5, exchangeRateMargin: 0.6, deliveryTime: 15, score: 90, supportsCrypto: true },
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
  const [originCountry, setOriginCountry] = useState('US');
  const [destinationCountry, setDestinationCountry] = useState('MX');
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('MXN');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [receiveMethod, setReceiveMethod] = useState('bank_account');
  const [priority, setPriority] = useState('lowest_cost');
  const [network, setNetwork] = useState('');
  const [blockchainAddress, setBlockchainAddress] = useState('');
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

  const isCrypto = currencies.find(c => c.code === fromCurrency)?.type === 'crypto' || 
                   currencies.find(c => c.code === toCurrency)?.type === 'crypto';

  const handleCompare = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const rate = exchangeRates[toCurrency] || 1;
    
    // Filtrar proveedores según si es crypto o no
    const filteredProviders = isCrypto 
      ? providers.filter(p => p.supportsCrypto)
      : providers;
    
    const calculatedResults = filteredProviders.map(provider => {
      const fixedFee = provider.fixedFee;
      const percentageFee = numAmount * (provider.percentageFee / 100);
      const exchangeMargin = numAmount * (provider.exchangeRateMargin / 100);
      const networkFee = isCrypto && network ? networks.find(n => n.id === network)?.fee || 0 : 0;
      const totalCost = fixedFee + percentageFee + exchangeMargin + networkFee;
      const amountReceived = (numAmount - totalCost) * rate * (1 - provider.exchangeRateMargin / 100);
      const effectivePercentage = (totalCost / numAmount) * 100;

      return {
        ...provider,
        amountReceived,
        totalCost,
        effectivePercentage,
        exchangeRate: rate * (1 - provider.exchangeRateMargin / 100),
        networkFee,
      };
    });

    // Ordenar según prioridad
    if (priority === 'lowest_cost') {
      calculatedResults.sort((a, b) => a.totalCost - b.totalCost);
    } else if (priority === 'fastest') {
      calculatedResults.sort((a, b) => a.deliveryTime - b.deliveryTime);
    } else if (priority === 'best_rate') {
      calculatedResults.sort((a, b) => b.exchangeRate - a.exchangeRate);
    } else {
      calculatedResults.sort((a, b) => b.score - a.score);
    }

    setResults(calculatedResults);
    setHasSearched(true);
  };

  const t = {
    title: language === 'es' ? 'Configurar envío' : 'Configure transfer',
    origin: language === 'es' ? 'País de origen' : 'Origin country',
    destination: language === 'es' ? 'País de destino' : 'Destination country',
    amount: language === 'es' ? 'Importe' : 'Amount',
    from: language === 'es' ? 'Moneda a enviar' : 'Send currency',
    to: language === 'es' ? 'Moneda a recibir' : 'Receive currency',
    payment: language === 'es' ? 'Método de pago' : 'Payment method',
    receive: language === 'es' ? 'Método de recepción' : 'Receive method',
    priority: language === 'es' ? 'Prioridad' : 'Priority',
    network: language === 'es' ? 'Red blockchain (opcional)' : 'Blockchain network (optional)',
    address: language === 'es' ? 'Dirección blockchain (opcional)' : 'Blockchain address (optional)',
    compare: language === 'es' ? 'Comparar plataformas' : 'Compare platforms',
    results: language === 'es' ? 'Resultados de comparación' : 'Comparison results',
    bestOption: language === 'es' ? 'Mejor opción' : 'Best option',
    youReceive: language === 'es' ? 'Recibirás' : 'You receive',
    totalCost: language === 'es' ? 'Costo total' : 'Total cost',
    fee: language === 'es' ? 'Comisión' : 'Fee',
    time: language === 'es' ? 'Tiempo' : 'Time',
    cryptoPanel: language === 'es' ? 'Panel de Criptomonedas' : 'Crypto Dashboard',
    demoData: language === 'es' ? 'Usando datos de demostración' : 'Using demo data',
    realData: language === 'es' ? 'Datos en tiempo real de CoinGecko' : 'Real-time data from CoinGecko',
    marketCap: language === 'es' ? 'Cap. mercado' : 'Market cap',
    volume24h: language === 'es' ? 'Volumen 24h' : 'Volume 24h',
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
            📋 {t.title}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* País de origen */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.origin}
              </label>
              <select
                value={originCountry}
                onChange={e => {
                  setOriginCountry(e.target.value);
                  const country = countries.find(c => c.code === e.target.value);
                  if (country) setFromCurrency(country.currency);
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {language === 'es' ? c.name : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* País de destino */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.destination}
              </label>
              <select
                value={destinationCountry}
                onChange={e => {
                  setDestinationCountry(e.target.value);
                  const country = countries.find(c => c.code === e.target.value);
                  if (country) setToCurrency(country.currency);
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {language === 'es' ? c.name : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Importe */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.amount}
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            {/* Moneda a enviar */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.from}
              </label>
              <select
                value={fromCurrency}
                onChange={e => setFromCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                <optgroup label="Fiat">
                  {currencies.filter(c => c.type === 'fiat').map(c => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} - {language === 'es' ? c.name : c.nameEn}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Crypto">
                  {currencies.filter(c => c.type === 'crypto').map(c => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} - {language === 'es' ? c.name : c.nameEn}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Moneda a recibir */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.to}
              </label>
              <select
                value={toCurrency}
                onChange={e => setToCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                <optgroup label="Fiat">
                  {currencies.filter(c => c.type === 'fiat').map(c => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} - {language === 'es' ? c.name : c.nameEn}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Crypto">
                  {currencies.filter(c => c.type === 'crypto').map(c => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} - {language === 'es' ? c.name : c.nameEn}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.payment}
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                {paymentMethods.map(m => (
                  <option key={m.id} value={m.id}>
                    {language === 'es' ? m.name : m.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Método de recepción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.receive}
              </label>
              <select
                value={receiveMethod}
                onChange={e => setReceiveMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                {receiveMethods.map(m => (
                  <option key={m.id} value={m.id}>
                    {language === 'es' ? m.name : m.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.priority}
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                {priorities.map(p => (
                  <option key={p.id} value={p.id}>
                    {language === 'es' ? p.name : p.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Red blockchain (solo si es crypto) */}
            {isCrypto && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t.network}
                  </label>
                  <select
                    value={network}
                    onChange={e => setNetwork(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  >
                    <option value="">Seleccionar red</option>
                    {networks.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.symbol}) - ~${n.fee}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t.address}
                  </label>
                  <input
                    type="text"
                    value={blockchainAddress}
                    onChange={e => setBlockchainAddress(e.target.value)}
                    placeholder="0x... / bc1... / T..."
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleCompare}
            className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-blue-700 transition-all shadow-lg"
          >
            🔍 {t.compare}
          </button>
        </div>

        {/* Adsterra Banner */}
        <div className="mb-6">
          <div className="text-center mb-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
              {language === 'es' ? 'Publicidad' : 'Advertisement'}
            </span>
          </div>
          <AdsterraAd 
            adCode={ADSTERRA_BANNER_KEY} 
            width={728} 
            height={90}
            className="flex justify-center"
          />
        </div>

        {/* Results */}
        {hasSearched && results.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              📊 {t.results}
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
                            {t.bestOption}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{t.youReceive}</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        {result.amountReceived.toFixed(2)} {toCurrency}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                    <div>
                      <span className="text-slate-500">{t.totalCost}</span>
                      <p className="font-medium text-red-600 dark:text-red-400">${result.totalCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">{t.fee}</span>
                      <p className="font-medium text-slate-800 dark:text-white">{result.effectivePercentage.toFixed(2)}%</p>
                    </div>
                    <div>
                      <span className="text-slate-500">{t.time}</span>
                      <p className="font-medium text-slate-800 dark:text-white">{result.deliveryTime} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Segundo Banner Adsterra */}
        <div className="mb-6">
          <div className="text-center mb-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
              {language === 'es' ? 'Publicidad' : 'Advertisement'}
            </span>
          </div>
          <AdsterraAd 
            adCode={ADSTERRA_BANNER_KEY} 
            width={728} 
            height={90}
            className="flex justify-center"
          />
        </div>

        {/* Crypto Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>📈</span> {t.cryptoPanel}
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
                ⚠️ {t.demoData}
              </p>
            </div>
          )}

          {!isUsingDemoData && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                ✅ {t.realData}
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
                    <span className="text-slate-500 dark:text-slate-400">{t.marketCap}</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{formatLargeNumber(asset.marketCap)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{t.volume24h}</span>
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
