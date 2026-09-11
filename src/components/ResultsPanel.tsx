import { ComparisonResult, Recommendation } from '../types';
import { translations } from '../i18n/translations';
import { formatCurrency } from '../utils/calculations';

interface ResultsPanelProps {
  results: ComparisonResult[];
  recommendations: Recommendation[];
  language: 'es' | 'en';
  receiveCurrency: string;
  sendCurrency: string;
}

function ExportShareBar({ results, language, sendCurrency, receiveCurrency }: { results: ComparisonResult[]; language: 'es' | 'en'; sendCurrency: string; receiveCurrency: string }) {
  const t = translations[language];
  
  const exportCSV = () => {
    const headers = ['Platform', 'Exchange Rate', 'Total Fee', 'Amount Received', 'Time', 'Score'];
    const rows = results.map(r => [
      r.provider.name,
      r.exchangeRate.toFixed(6),
      r.costBreakdown.totalCost.toFixed(2),
      r.amountReceived.toFixed(2),
      `${r.estimatedTime} ${r.timeUnit}`,
      r.score.toString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remitcompare-${sendCurrency}-${receiveCurrency}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareLink = () => {
    const url = `${window.location.origin}?from=${sendCurrency}&to=${receiveCurrency}`;
    navigator.clipboard.writeText(url).then(() => {
      alert(language === 'es' ? '¡Enlace copiado al portapapeles!' : 'Link copied to clipboard!');
    }).catch(() => {
      prompt(language === 'es' ? 'Copia este enlace:' : 'Copy this link:', url);
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={exportCSV}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
      >
        📄 {t.common.export} CSV
      </button>
      <button
        onClick={shareLink}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
      >
        🔗 {t.common.share}
      </button>
    </div>
  );
}

export default function ResultsPanel({ results, recommendations, language, receiveCurrency, sendCurrency }: ResultsPanelProps) {
  const t = translations[language];

  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
        <span className="text-4xl">🔍</span>
        <p className="mt-4 text-slate-500 dark:text-slate-400">{t.results.noResults}</p>
      </div>
    );
  }

  const bestResult = results[0];

  return (
    <div className="space-y-6">
      {/* Export/Share Bar */}
      <ExportShareBar results={results} language={language} sendCurrency={sendCurrency} receiveCurrency={receiveCurrency} />

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-emerald-100 text-sm">{t.results.youWillReceive}</p>
            <p className="text-3xl md:text-4xl font-bold mt-1">
              {formatCurrency(bestResult.amountReceived, receiveCurrency)}
            </p>
            <p className="text-emerald-100 text-sm mt-2">
              {t.results.totalCost}: <span className="font-semibold text-white">{formatCurrency(bestResult.costBreakdown.totalCost, sendCurrency)}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <p className="text-emerald-100 text-xs">{t.results.percentageLost}</p>
              <p className="text-lg font-bold">{bestResult.costBreakdown.effectivePercentage.toFixed(2)}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <p className="text-emerald-100 text-xs">{t.results.savingsVsMostExpensive}</p>
              <p className="text-lg font-bold text-emerald-200">{formatCurrency(bestResult.savingsVsMostExpensive, sendCurrency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
        <p className="text-amber-700 dark:text-amber-400 text-sm">{t.results.disclaimer}</p>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">{t.recommendations.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border-2 transition-all hover:shadow-md ${
                  i === 0
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                    : i === 1
                    ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20'
                }`}
              >
                <p className="font-bold text-sm text-slate-800 dark:text-white">{rec.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{rec.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{rec.result.provider.logo} {rec.result.provider.name}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{rec.result.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Cards (Mobile) / Table (Desktop) */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.table.platform}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.table.exchangeRate}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.table.totalFee}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.table.amountReceived}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.table.estimatedTime}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.table.score}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{t.table.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {results.map((result, idx) => (
                  <tr key={result.provider.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 ${idx === 0 ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{result.provider.logo}</span>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">{result.provider.name}</p>
                          {result.isSponsored && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">{t.results.sponsored}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-white">{result.exchangeRate.toFixed(4)}</p>
                      <p className="text-xs text-slate-500">{t.results.marketRate}: {result.marketRate.toFixed(4)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-red-600 dark:text-red-400">{formatCurrency(result.costBreakdown.totalCost, sendCurrency)}</p>
                      <p className="text-xs text-slate-500">{result.costBreakdown.effectivePercentage.toFixed(2)}%</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(result.amountReceived, receiveCurrency)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800 dark:text-white">{result.estimatedTime} {result.timeUnit === 'minutes' ? (language === 'es' ? 'min' : 'min') : result.timeUnit === 'hours' ? (language === 'es' ? 'h' : 'h') : (language === 'es' ? 'd' : 'd')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${result.score >= 80 ? 'bg-emerald-500' : result.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${result.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{result.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={result.provider.affiliateLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-all"
                      >
                        {t.results.viewOffer}
                        <span className="text-[10px] opacity-70">↗</span>
                      </a>
                      {result.provider.affiliateLink && (
                        <p className="text-[10px] text-slate-400 mt-1">{t.results.affiliateLink}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {results.map((result, idx) => (
          <div
            key={result.provider.id}
            className={`rounded-xl p-4 border-2 ${
              idx === 0
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{result.provider.logo}</span>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{result.provider.name}</p>
                  {result.isSponsored && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">{t.results.sponsored}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{t.table.score}</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{result.score}/100</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-slate-500">{t.table.amountReceived}</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(result.amountReceived, receiveCurrency)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.table.totalFee}</p>
                <p className="font-medium text-red-600 dark:text-red-400">{formatCurrency(result.costBreakdown.totalCost, sendCurrency)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.table.exchangeRate}</p>
                <p className="font-medium text-slate-800 dark:text-white">{result.exchangeRate.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t.table.estimatedTime}</p>
                <p className="font-medium text-slate-800 dark:text-white">{result.estimatedTime} {result.timeUnit === 'minutes' ? 'min' : result.timeUnit === 'hours' ? 'h' : 'd'}</p>
              </div>
            </div>

            {/* Cost breakdown mini */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
              <details className="text-xs">
                <summary className="cursor-pointer text-slate-600 dark:text-slate-400">{t.costBreakdown.title}</summary>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between"><span>{t.costBreakdown.fixedFee}</span><span>{formatCurrency(result.costBreakdown.fixedFee, sendCurrency)}</span></div>
                  <div className="flex justify-between"><span>{t.costBreakdown.percentageFee}</span><span>{formatCurrency(result.costBreakdown.percentageFee, sendCurrency)}</span></div>
                  <div className="flex justify-between"><span>{t.costBreakdown.paymentMethodFee}</span><span>{formatCurrency(result.costBreakdown.paymentMethodFee, sendCurrency)}</span></div>
                  <div className="flex justify-between"><span>{t.costBreakdown.exchangeRateMargin}</span><span>{formatCurrency(result.costBreakdown.exchangeRateMargin, sendCurrency)}</span></div>
                  {result.costBreakdown.networkFee > 0 && <div className="flex justify-between"><span>{t.costBreakdown.networkFee}</span><span>{formatCurrency(result.costBreakdown.networkFee, sendCurrency)}</span></div>}
                </div>
              </details>
            </div>

            <a
              href={result.provider.affiliateLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block w-full text-center py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-all"
            >
              {t.results.viewOffer} ↗
            </a>
            {result.provider.affiliateLink && (
              <p className="text-[10px] text-slate-400 text-center mt-1">{t.results.affiliateLink}</p>
            )}
          </div>
        ))}
      </div>

      {/* Detailed Cost Breakdown for top result */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <span>📊</span> {t.costBreakdown.title} — {bestResult.provider.name}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <CostRow label={t.costBreakdown.fixedFee} value={formatCurrency(bestResult.costBreakdown.fixedFee, sendCurrency)} />
            <CostRow label={t.costBreakdown.percentageFee} value={formatCurrency(bestResult.costBreakdown.percentageFee, sendCurrency)} />
            <CostRow label={t.costBreakdown.paymentMethodFee} value={formatCurrency(bestResult.costBreakdown.paymentMethodFee, sendCurrency)} />
            <CostRow label={t.costBreakdown.exchangeRateMargin} value={formatCurrency(bestResult.costBreakdown.exchangeRateMargin, sendCurrency)} />
            {bestResult.costBreakdown.withdrawalFee > 0 && (
              <CostRow label={t.costBreakdown.withdrawalFee} value={formatCurrency(bestResult.costBreakdown.withdrawalFee, sendCurrency)} />
            )}
            {bestResult.costBreakdown.networkFee > 0 && (
              <CostRow label={t.costBreakdown.networkFee} value={formatCurrency(bestResult.costBreakdown.networkFee, sendCurrency)} />
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-t-2 border-slate-300 dark:border-slate-600">
              <span className="font-bold text-slate-800 dark:text-white">{t.costBreakdown.totalCost}</span>
              <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(bestResult.costBreakdown.totalCost, sendCurrency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t.costBreakdown.effectivePercentage}</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{bestResult.costBreakdown.effectivePercentage.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t.results.exchangeRate}</span>
              <span className="font-medium text-slate-800 dark:text-white">{bestResult.exchangeRate.toFixed(6)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t.results.marketRate}</span>
              <span className="font-medium text-slate-800 dark:text-white">{bestResult.marketRate.toFixed(6)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t.results.confidenceLevel}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                bestResult.confidenceLevel === 'high' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                bestResult.confidenceLevel === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {t.results[bestResult.confidenceLevel]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-800 dark:text-white">{value}</span>
    </div>
  );
}
