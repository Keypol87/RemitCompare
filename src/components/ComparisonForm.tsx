import { useState } from 'react';
import { ComparisonRequest, PaymentMethod, ReceiveMethod, ScoringWeights } from '../types';
import { countries, currencies, blockchainNetworks } from '../data/providers';
import { translations } from '../i18n/translations';
import { validateBlockchainAddress } from '../utils/calculations';

interface ComparisonFormProps {
  language: 'es' | 'en';
  weights: ScoringWeights;
  setWeights: (w: ScoringWeights) => void;
  onCompare: (request: ComparisonRequest) => void;
}

export default function ComparisonForm({ language, weights, setWeights, onCompare }: ComparisonFormProps) {
  const t = translations[language];
  const [originCountry, setOriginCountry] = useState('US');
  const [destinationCountry, setDestinationCountry] = useState('MX');
  const [sendCurrency, setSendCurrency] = useState('USD');
  const [receiveCurrency, setReceiveCurrency] = useState('MXN');
  const [amount, setAmount] = useState('1000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [receiveMethod, setReceiveMethod] = useState<ReceiveMethod>('bank_account');
  const [priority, setPriority] = useState<ComparisonRequest['priority']>('lowest_cost');
  const [preferredNetwork, setPreferredNetwork] = useState('');
  const [blockchainAddress, setBlockchainAddress] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [showWeights, setShowWeights] = useState(false);

  const isCryptoSend = currencies.find(c => c.code === sendCurrency)?.type === 'crypto';
  const isCryptoReceive = currencies.find(c => c.code === receiveCurrency)?.type === 'crypto';
  const isCrypto = isCryptoSend || isCryptoReceive;

  const handleCountryChange = (code: string, type: 'origin' | 'destination') => {
    const country = countries.find(c => c.code === code);
    if (country) {
      if (type === 'origin') {
        setOriginCountry(code);
        setSendCurrency(country.currency);
      } else {
        setDestinationCountry(code);
        setReceiveCurrency(country.currency);
      }
    }
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount)) errs.push(t.validation.amountRequired);
    else if (numAmount <= 0) errs.push(t.validation.amountPositive);
    if (!originCountry) errs.push(t.validation.selectOrigin);
    if (!destinationCountry) errs.push(t.validation.selectDestination);
    if (!sendCurrency) errs.push(t.validation.selectSendCurrency);
    if (!receiveCurrency) errs.push(t.validation.selectReceiveCurrency);
    
    if (blockchainAddress && !validateBlockchainAddress(blockchainAddress, preferredNetwork)) {
      errs.push(t.validation.invalidAddress);
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onCompare({
      originCountry,
      destinationCountry,
      sendCurrency,
      receiveCurrency,
      amount: parseFloat(amount),
      paymentMethod,
      receiveMethod,
      priority,
      preferredNetwork: preferredNetwork || undefined,
      blockchainAddress: blockchainAddress || undefined,
    });
  };

  const paymentMethods: PaymentMethod[] = ['bank_transfer', 'debit_card', 'credit_card', 'wallet_balance', 'crypto'];
  const receiveMethods: ReceiveMethod[] = ['bank_account', 'cash', 'digital_wallet', 'exchange', 'blockchain_address'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <span>📋</span> {t.form.title}
      </h2>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          {errors.map((err, i) => (
            <p key={i} className="text-red-600 dark:text-red-400 text-sm">⚠️ {err}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin Country */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.form.originCountry}</label>
          <select
            value={originCountry}
            onChange={e => handleCountryChange(e.target.value, 'origin')}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {countries.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {language === 'es' ? c.nameEs : c.name}</option>
            ))}
          </select>
        </div>

        {/* Destination Country */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.form.destinationCountry}</label>
          <select
            value={destinationCountry}
            onChange={e => handleCountryChange(e.target.value, 'destination')}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {countries.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {language === 'es' ? c.nameEs : c.name}</option>
            ))}
          </select>
        </div>

        {/* Send Currency */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.form.sendCurrency}</label>
          <select
            value={sendCurrency}
            onChange={e => setSendCurrency(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <optgroup label="Fiat">
              {currencies.filter(c => c.type === 'fiat').map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Crypto">
              {currencies.filter(c => c.type === 'crypto').map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Receive Currency */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.form.receiveCurrency}</label>
          <select
            value={receiveCurrency}
            onChange={e => setReceiveCurrency(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <optgroup label="Fiat">
              {currencies.filter(c => c.type === 'fiat').map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Crypto">
              {currencies.filter(c => c.type === 'crypto').map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.form.amount}</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">{sendCurrency}</span>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.form.priority}</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as ComparisonRequest['priority'])}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="lowest_cost">{t.priorities.lowest_cost}</option>
            <option value="fastest">{t.priorities.fastest}</option>
            <option value="best_rate">{t.priorities.best_rate}</option>
            <option value="most_secure">{t.priorities.most_secure}</option>
            <option value="most_available">{t.priorities.most_available}</option>
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.form.paymentMethod}</label>
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {paymentMethods.map(m => (
              <option key={m} value={m}>{t.methods[m]}</option>
            ))}
          </select>
        </div>

        {/* Receive Method */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.form.receiveMethod}</label>
          <select
            value={receiveMethod}
            onChange={e => setReceiveMethod(e.target.value as ReceiveMethod)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {receiveMethods.map(m => (
              <option key={m} value={m}>{t.methods[m]}</option>
            ))}
          </select>
        </div>

        {/* Blockchain Network (conditional) */}
        {isCrypto && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.form.preferredNetwork}</label>
              <select
                value={preferredNetwork}
                onChange={e => setPreferredNetwork(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">{t.form.selectNetwork}</option>
                {blockchainNetworks.map(n => (
                  <option key={n.id} value={n.id}>{n.name} ({n.symbol}) — ~${n.avgFee} {n.avgFeeUnit}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.form.blockchainAddress}</label>
              <input
                type="text"
                value={blockchainAddress}
                onChange={e => setBlockchainAddress(e.target.value)}
                placeholder="0x... / bc1... / T..."
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </>
        )}
      </div>

      {/* Scoring Weights Toggle */}
      <div className="mt-4">
        <button
          onClick={() => setShowWeights(!showWeights)}
          className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          ⚙️ {t.scoring.title} {showWeights ? '▲' : '▼'}
        </button>
        
        {showWeights && (
          <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-3">
            {([
              ['cost', t.scoring.cost],
              ['exchangeRate', t.scoring.exchangeRate],
              ['speed', t.scoring.speed],
              ['security', t.scoring.security],
              ['availability', t.scoring.availability],
              ['easeOfUse', t.scoring.easeOfUse],
            ] as [keyof ScoringWeights, string][]).map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-slate-600 dark:text-slate-400">{label}: {weights[key]}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights[key]}
                  onChange={e => setWeights({ ...weights, [key]: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        🔍 {t.form.compare}
      </button>
    </div>
  );
}
