import { useState, useEffect } from 'react';
import { Page, ComparisonRequest, ComparisonResult, Recommendation, ScoringWeights, UserPreferences } from './types';
import { translations } from './i18n/translations';
import { compareProviders, getRecommendations, getExchangeRate } from './utils/calculations';
import Header from './components/Header';
import ComparisonForm from './components/ComparisonForm';
import ResultsPanel from './components/ResultsPanel';
import CryptoPanel from './components/CryptoPanel';
import PricingPage from './components/PricingPage';

const defaultWeights: ScoringWeights = {
  cost: 35,
  exchangeRate: 20,
  speed: 15,
  security: 15,
  availability: 10,
  easeOfUse: 5,
};

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('remitcompare_prefs');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      language: 'es' as const,
      theme: (localStorage.getItem('theme') || 'light') as 'light' | 'dark',
      weights: defaultWeights,
      isPremium: false,
    };
  });

  const [currentPage, setCurrentPage] = useState<Page>('compare');
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [lastRequest, setLastRequest] = useState<ComparisonRequest | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const t = translations[preferences.language];

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('remitcompare_prefs', JSON.stringify(preferences));
  }, [preferences]);

  // Theme management
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(preferences.theme);
    document.documentElement.setAttribute('data-theme', preferences.theme);
    localStorage.setItem('theme', preferences.theme);
  }, [preferences.theme]);

  const handleCompare = (request: ComparisonRequest) => {
    const comparisonResults = compareProviders(request, preferences.weights);
    const recs = getRecommendations(comparisonResults, preferences.language);
    setResults(comparisonResults);
    setRecommendations(recs);
    setLastRequest(request);
    setHasSearched(true);
  };

  const setLanguage = (lang: 'es' | 'en') => {
    setPreferences(prev => ({ ...prev, language: lang }));
    // Recalculate recommendations with new language
    if (results.length > 0) {
      setRecommendations(getRecommendations(results, lang));
    }
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setPreferences(prev => ({ ...prev, theme }));
  };

  const setWeights = (weights: ScoringWeights) => {
    setPreferences(prev => ({ ...prev, weights }));
    // Recalculate if we have results
    if (lastRequest) {
      const comparisonResults = compareProviders(lastRequest, weights);
      const recs = getRecommendations(comparisonResults, preferences.language);
      setResults(comparisonResults);
      setRecommendations(recs);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header
        currentPage={currentPage}
        setPage={setCurrentPage}
        language={preferences.language}
        setLanguage={setLanguage}
        theme={preferences.theme}
        setTheme={setTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPage === 'compare' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="text-center py-6">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
                {t.app.tagline}
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                {t.app.subtitle}
              </p>
            </div>

            {/* Comparison Form */}
            <ComparisonForm
              language={preferences.language}
              weights={preferences.weights}
              setWeights={setWeights}
              onCompare={handleCompare}
            />

            {/* Results */}
            {hasSearched && (
              <ResultsPanel
                results={results}
                recommendations={recommendations}
                language={preferences.language}
                receiveCurrency={lastRequest?.receiveCurrency || 'MXN'}
                sendCurrency={lastRequest?.sendCurrency || 'USD'}
              />
            )}

            {/* Quick Currency Converter */}
            {!hasSearched && <CurrencyConverter language={preferences.language} />}

            {/* Quick Crypto Panel */}
            {!hasSearched && (
              <div className="mt-8">
                <CryptoPanel language={preferences.language} />
              </div>
            )}
          </div>
        )}

        {currentPage === 'crypto' && (
          <CryptoPanel language={preferences.language} />
        )}

        {currentPage === 'networks' && (
          <CryptoPanel language={preferences.language} showNetworks={true} />
        )}

        {currentPage === 'pricing' && (
          <PricingPage language={preferences.language} isPremium={preferences.isPremium} />
        )}

        {currentPage === 'history' && (
          <HistoryPage language={preferences.language} isPremium={preferences.isPremium} />
        )}

        {currentPage === 'admin' && (
          <AdminPanel language={preferences.language} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💱</span>
                <span className="font-bold text-slate-800 dark:text-white">RemitCompare</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.footer.disclaimer}</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                {preferences.language === 'es' ? 'Legal' : 'Legal'}
              </h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer">{t.footer.privacy}</li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer">{t.footer.terms}</li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer">{t.footer.risks}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                {preferences.language === 'es' ? 'Avisos importantes' : 'Important notices'}
              </h4>
              <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <li>• {preferences.language === 'es' ? 'No custodiamos fondos de usuarios' : 'We do not custody user funds'}</li>
                <li>• {preferences.language === 'es' ? 'No ejecutamos transferencias' : 'We do not execute transfers'}</li>
                <li>• {preferences.language === 'es' ? 'Los cálculos son informativos' : 'Calculations are informational'}</li>
                <li>• {preferences.language === 'es' ? 'No almacenamos claves privadas' : 'We do not store private keys'}</li>
                <li>• {preferences.language === 'es' ? 'Las criptomonedas conllevan riesgos' : 'Cryptocurrencies carry risks'}</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
            © 2025 RemitCompare. {preferences.language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </div>
  );
}

// Currency Converter Widget
function CurrencyConverter({ language }: { language: 'es' | 'en' }) {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100');

  const rate = getExchangeRate(fromCurrency, toCurrency);
  const converted = parseFloat(amount || '0') * rate;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <span>💱</span> {language === 'es' ? 'Conversor rápido' : 'Quick Converter'}
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-lg font-bold"
          />
          <select
            value={fromCurrency}
            onChange={e => setFromCurrency(e.target.value)}
            className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
          >
            {['USD', 'EUR', 'GBP', 'MXN', 'COP', 'BRL', 'JPY', 'CAD', 'AUD', 'BTC', 'ETH'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="text-2xl text-slate-400">→</div>
        <div className="flex-1 w-full">
          <div className="w-full px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-lg font-bold">
            {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <select
            value={toCurrency}
            onChange={e => setToCurrency(e.target.value)}
            className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
          >
            {['USD', 'EUR', 'GBP', 'MXN', 'COP', 'BRL', 'JPY', 'CAD', 'AUD', 'BTC', 'ETH'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        1 {fromCurrency} = {rate.toFixed(6)} {toCurrency}
      </p>
    </div>
  );
}

// History Page Component
function HistoryPage({ language, isPremium }: { language: 'es' | 'en'; isPremium: boolean }) {
  const mockHistory = [
    { date: '2025-01-15 14:32', from: 'USD', to: 'MXN', amount: 1000, bestProvider: 'Wise', savings: '$12.50' },
    { date: '2025-01-14 09:15', from: 'EUR', to: 'GBP', amount: 500, bestProvider: 'Revolut', savings: '€3.20' },
    { date: '2025-01-13 18:45', from: 'USD', to: 'COP', amount: 2000, bestProvider: 'Binance', savings: '$28.00' },
    { date: '2025-01-12 11:20', from: 'GBP', to: 'PHP', amount: 750, bestProvider: 'Wise', savings: '£5.80' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
        📜 {language === 'es' ? 'Historial de comparaciones' : 'Comparison History'}
      </h2>

      {!isPremium && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            🔒 {language === 'es'
              ? 'Plan gratuito: solo se muestran las últimas 4 comparaciones. Actualiza a Premium para historial completo.'
              : 'Free plan: only last 4 comparisons shown. Upgrade to Premium for full history.'}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {language === 'es' ? 'Fecha' : 'Date'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {language === 'es' ? 'Envío' : 'Send'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {language === 'es' ? 'Mejor plataforma' : 'Best platform'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {language === 'es' ? 'Ahorro' : 'Savings'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {mockHistory.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.date}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {item.amount} {item.from} → {item.to}
                  </td>
                  <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">{item.bestProvider}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">{item.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Alerts */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          🔔 {language === 'es' ? 'Alertas de precio' : 'Price Alerts'}
        </h3>
        {isPremium ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600">
              <div>
                <p className="font-medium text-slate-800 dark:text-white">BTC &lt; $100,000</p>
                <p className="text-xs text-slate-500">{language === 'es' ? 'Creada hace 2 días' : 'Created 2 days ago'}</p>
              </div>
              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded">
                {language === 'es' ? 'Activa' : 'Active'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600">
              <div>
                <p className="font-medium text-slate-800 dark:text-white">USD/MXN &lt; 17.00</p>
                <p className="text-xs text-slate-500">{language === 'es' ? 'Creada hace 5 días' : 'Created 5 days ago'}</p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded">
                {language === 'es' ? 'Disparada' : 'Triggered'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            🔒 {language === 'es'
              ? 'Las alertas de precio están disponibles en el plan Premium.'
              : 'Price alerts are available in the Premium plan.'}
          </p>
        )}
      </div>
    </div>
  );
}

// Admin Panel Component
function AdminPanel({ language }: { language: 'es' | 'en' }) {
  const t = translations[language];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
        🛡️ {language === 'es' ? 'Panel de Administración' : 'Admin Panel'}
      </h2>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: language === 'es' ? 'Comparaciones hoy' : 'Comparisons today', value: '1,247', icon: '📊', color: 'emerald' },
          { label: language === 'es' ? 'Clics de afiliados' : 'Affiliate clicks', value: '342', icon: '🤝', color: 'blue' },
          { label: language === 'es' ? 'Usuarios premium' : 'Premium users', value: '89', icon: '⭐', color: 'purple' },
          { label: language === 'es' ? 'Ingresos del mes' : 'Monthly revenue', value: '$4,520', icon: '💰', color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Provider Management */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          {language === 'es' ? 'Gestión de proveedores' : 'Provider Management'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.table.platform}</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{language === 'es' ? 'Estado' : 'Status'}</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{language === 'es' ? 'API' : 'API'}</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{language === 'es' ? 'Afiliado' : 'Affiliate'}</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{language === 'es' ? 'Acciones' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {['Wise', 'Remitly', 'Western Union', 'PayPal', 'Revolut', 'Binance', 'Coinbase', 'Kraken'].map((name, i) => (
                <tr key={name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded">
                      {language === 'es' ? 'Activo' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded ${i < 5 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                      {i < 5 ? (language === 'es' ? 'Conectada' : 'Connected') : (language === 'es' ? 'Estimada' : 'Estimated')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                      {language === 'es' ? 'Configurado' : 'Configured'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                      {language === 'es' ? 'Editar' : 'Edit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Logs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          📋 {language === 'es' ? 'Registro de API' : 'API Logs'}
        </h3>
        <div className="space-y-2">
          {[
            { time: '14:32:05', endpoint: 'GET /api/crypto/prices', status: 200, ms: 45 },
            { time: '14:31:58', endpoint: 'POST /api/compare', status: 200, ms: 120 },
            { time: '14:31:45', endpoint: 'GET /api/providers', status: 200, ms: 32 },
            { time: '14:31:30', endpoint: 'GET /api/exchange-rates', status: 200, ms: 89 },
            { time: '14:31:15', endpoint: 'POST /api/affiliate/click', status: 201, ms: 15 },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded bg-slate-50 dark:bg-slate-700/30 text-xs font-mono">
              <span className="text-slate-500">{log.time}</span>
              <span className={`px-1.5 py-0.5 rounded ${log.status < 300 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                {log.status}
              </span>
              <span className="text-slate-700 dark:text-slate-300 flex-1">{log.endpoint}</span>
              <span className="text-slate-500">{log.ms}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Source Monitor */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          📡 {language === 'es' ? 'Monitor de fuentes de datos' : 'Data Source Monitor'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'CoinGecko API', status: 'operational', latency: '45ms' },
            { name: 'Exchange Rates API', status: 'operational', latency: '32ms' },
            { name: 'Provider Fees Cache', status: 'operational', latency: '12ms' },
            { name: 'Blockchain Gas Tracker', status: 'degraded', latency: '230ms' },
          ].map((source, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${source.status === 'operational' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{source.name}</span>
              </div>
              <span className="text-xs text-slate-500">{source.latency}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
