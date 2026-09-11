import { useState, useEffect } from 'react';
import { CryptoAsset } from '../types';
import { defaultCryptoPrices, blockchainNetworks } from '../data/providers';
import { translations } from '../i18n/translations';
import { formatLargeNumber } from '../utils/calculations';

interface CryptoPanelProps {
  language: 'es' | 'en';
  showNetworks?: boolean;
}

export default function CryptoPanel({ language, showNetworks = false }: CryptoPanelProps) {
  const t = translations[language];
  const [cryptoData, setCryptoData] = useState<CryptoAsset[]>(defaultCryptoPrices);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData(prev => prev.map(asset => ({
        ...asset,
        price: asset.price * (1 + (Math.random() - 0.5) * 0.002),
        change1h: asset.change1h + (Math.random() - 0.5) * 0.1,
        lastUpdated: new Date().toISOString(),
      })));
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCryptoData(prev => prev.map(asset => ({
        ...asset,
        price: asset.price * (1 + (Math.random() - 0.5) * 0.005),
        change1h: asset.change1h + (Math.random() - 0.5) * 0.2,
        lastUpdated: new Date().toISOString(),
      })));
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  if (showNetworks) {
    return (
      <div className="space-y-6">
        <NetworkComparison language={language} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span>📈</span> {t.crypto.title}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.crypto.lastUpdated}: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Crypto Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cryptoData.map(asset => (
          <CryptoCard key={asset.id} asset={asset} language={language} />
        ))}
      </div>

      {/* Data Source */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">📡 {t.crypto.source}</p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          ⚠️ {language === 'es' ? 'Datos de demostración. En producción se conectaría a CoinGecko/CoinMarketCap API.' : 'Demo data. In production, connects to CoinGecko/CoinMarketCap API.'}
        </p>
      </div>

      {/* Network Comparison Section */}
      <NetworkComparison language={language} />
    </div>
  );
}

function CryptoCard({ asset, language }: { asset: CryptoAsset; language: 'es' | 'en' }) {
  const t = translations[language];
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">{asset.symbol}</span>
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

      <div className="flex items-center gap-3 mt-2">
        <span className={`text-xs font-medium ${asset.change1h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {t.crypto.change1h}: {asset.change1h >= 0 ? '+' : ''}{asset.change1h.toFixed(2)}%
        </span>
        <span className={`text-xs font-medium ${asset.change24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {t.crypto.change24h}: {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
        </span>
        <span className={`text-xs font-medium ${asset.change7d >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {t.crypto.change7d}: {asset.change7d >= 0 ? '+' : ''}{asset.change7d.toFixed(2)}%
        </span>
      </div>

      {/* Mini Sparkline */}
      {asset.sparkline && (
        <div className="mt-3 h-8">
          <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={asset.change24h >= 0 ? '#10b981' : '#ef4444'}
              strokeWidth="1.5"
              points={asset.sparkline.map((val, i) => {
                const min = Math.min(...asset.sparkline!);
                const max = Math.max(...asset.sparkline!);
                const range = max - min || 1;
                const x = (i / (asset.sparkline!.length - 1)) * 100;
                const y = 30 - ((val - min) / range) * 28;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400">{t.crypto.marketCap}</span>
          <p className="font-medium text-slate-700 dark:text-slate-300">{formatLargeNumber(asset.marketCap)}</p>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">{t.crypto.volume24h}</span>
          <p className="font-medium text-slate-700 dark:text-slate-300">{formatLargeNumber(asset.volume24h)}</p>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">{t.crypto.high24h}</span>
          <p className="font-medium text-emerald-600 dark:text-emerald-400">${asset.high24h < 1 ? asset.high24h.toFixed(4) : asset.high24h.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">{t.crypto.low24h}</span>
          <p className="font-medium text-red-600 dark:text-red-400">${asset.low24h < 1 ? asset.low24h.toFixed(4) : asset.low24h.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function NetworkComparison({ language }: { language: 'es' | 'en' }) {
  const t = translations[language];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
        <span>🔗</span> {t.networks.title}
      </h3>
      
      {/* Warning */}
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-700 dark:text-red-400 text-sm font-medium">{t.networks.warning}</p>
      </div>

      {/* Network Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.networks.name}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.networks.avgFee}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.networks.confirmationTime}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.networks.congestion}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.networks.confirmations}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {blockchainNetworks.map(network => (
              <tr key={network.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-800 dark:text-white">{network.name}</span>
                  <span className="ml-2 text-xs text-slate-500">({network.symbol})</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${network.avgFee < 0.1 ? 'text-emerald-600 dark:text-emerald-400' : network.avgFee < 2 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${network.avgFee} {network.avgFeeUnit}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {network.confirmationTime < 1 ? `${network.confirmationTime * 60}s` : network.confirmationTime < 60 ? `${network.confirmationTime}min` : `${network.confirmationTime / 60}h`}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    network.congestion === 'low' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                    network.congestion === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {t.networks[network.congestion]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{network.confirmations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 mt-4">
        {blockchainNetworks.map(network => (
          <div key={network.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 dark:text-white">{network.name} ({network.symbol})</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                network.congestion === 'low' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                network.congestion === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {t.networks[network.congestion]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500">{t.networks.avgFee}</span>
                <p className="font-medium text-slate-700 dark:text-slate-300">${network.avgFee}</p>
              </div>
              <div>
                <span className="text-slate-500">{t.networks.confirmationTime}</span>
                <p className="font-medium text-slate-700 dark:text-slate-300">{network.confirmationTime < 1 ? `${network.confirmationTime * 60}s` : `${network.confirmationTime}min`}</p>
              </div>
              <div>
                <span className="text-slate-500">{t.networks.confirmations}</span>
                <p className="font-medium text-slate-700 dark:text-slate-300">{network.confirmations}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
