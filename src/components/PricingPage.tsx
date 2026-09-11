import { translations } from '../i18n/translations';

interface PricingPageProps {
  language: 'es' | 'en';
  isPremium: boolean;
}

export default function PricingPage({ language, isPremium }: PricingPageProps) {
  const t = translations[language];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{t.pricing.title}</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {language === 'es' 
            ? 'Elige el plan que mejor se adapte a tus necesidades' 
            : 'Choose the plan that best fits your needs'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className={`rounded-2xl border-2 p-6 ${isPremium ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800' : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.pricing.free}</h3>
            {!isPremium && (
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded">
                {t.pricing.current}
              </span>
            )}
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-slate-800 dark:text-white">${t.pricing.price.free}</span>
            <span className="text-slate-500 dark:text-slate-400">{t.pricing.month}</span>
          </div>
          <ul className="space-y-3">
            {t.pricing.features.free.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-emerald-500">✓</span> {feature}
              </li>
            ))}
          </ul>
          {!isPremium && (
            <button className="mt-6 w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium rounded-xl cursor-default">
              {t.pricing.current}
            </button>
          )}
        </div>

        {/* Premium Plan */}
        <div className={`rounded-2xl border-2 p-6 relative overflow-hidden ${isPremium ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'}`}>
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded">
              ⭐ PRO
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.pricing.premium}</h3>
            {isPremium && (
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded">
                {t.pricing.current}
              </span>
            )}
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-slate-800 dark:text-white">${t.pricing.price.premium}</span>
            <span className="text-slate-500 dark:text-slate-400">{t.pricing.month}</span>
          </div>
          <ul className="space-y-3">
            {t.pricing.features.premium.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-emerald-500">✓</span> {feature}
              </li>
            ))}
          </ul>
          {!isPremium && (
            <button className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg">
              {t.pricing.upgrade}
            </button>
          )}
        </div>
      </div>

      {/* Monetization Info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          {language === 'es' ? '💰 Modelo de monetización' : '💰 Monetization Model'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">🤝 {language === 'es' ? 'Marketing de Afiliados' : 'Affiliate Marketing'}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'es'
                ? 'Enlaces patrocinados claramente identificados. No alteran la clasificación por mérito.'
                : 'Clearly identified sponsored links. Do not alter merit-based ranking.'}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">⭐ {language === 'es' ? 'Suscripción Premium' : 'Premium Subscription'}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'es'
                ? 'Funciones avanzadas, sin publicidad, alertas y exportación de datos.'
                : 'Advanced features, no ads, alerts, and data export.'}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">📢 {language === 'es' ? 'Publicidad Contextual' : 'Contextual Advertising'}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'es'
                ? 'Banners discretos y posiciones patrocinadas claramente etiquetadas.'
                : 'Discreet banners and clearly labeled sponsored positions.'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Integration Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          💳 {language === 'es'
            ? 'Integración preparada para Stripe, Paddle o solución equivalente. En demo, el botón no procesa pagos reales.'
            : 'Integration ready for Stripe, Paddle or equivalent. In demo, the button does not process real payments.'}
        </p>
      </div>
    </div>
  );
}
