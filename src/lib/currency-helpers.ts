/**
 * Helper pentru gestionarea valutelor
 */

/**
 * Lista monedelor suportate de aplicație
 */
export const SUPPORTED_CURRENCIES = ['RON', 'EUR', 'USD', 'GBP'];

/**
 * Verifică dacă o monedă este validă
 */
export const isValidCurrency = (currency: string): boolean => {
  return SUPPORTED_CURRENCIES.includes(currency);
};

/**
 * Ratele de schimb pentru conversie (simplificate pentru demonstrație)
 */
export const EXCHANGE_RATES = {
  'RON': { 'EUR': 0.2, 'USD': 0.22, 'GBP': 0.17 },
  'EUR': { 'RON': 5.0, 'USD': 1.1, 'GBP': 0.85 },
  'USD': { 'RON': 4.5, 'EUR': 0.91, 'GBP': 0.77 },
  'GBP': { 'RON': 5.9, 'EUR': 1.18, 'USD': 1.3 }
};

/**
 * Converteste un preț dintr-o monedă în alta
 */
export const convertPrice = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  try {
    // Verifică dacă avem o rată de schimb directă
    if (EXCHANGE_RATES[fromCurrency] && EXCHANGE_RATES[fromCurrency][toCurrency]) {
      return amount * EXCHANGE_RATES[fromCurrency][toCurrency];
    }
    
    // Dacă nu, încearcă să converti via RON
    const amountInRON = fromCurrency === 'RON' 
      ? amount 
      : amount * EXCHANGE_RATES[fromCurrency]['RON'];
      
    return toCurrency === 'RON'
      ? amountInRON
      : amountInRON * EXCHANGE_RATES['RON'][toCurrency];
      
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount; // Return original amount on failure
  }
};

/**
 * Formatează prețul cu simbolul monedei
 */
export const formatPriceWithCurrency = (amount: number, currency: string, includeSymbol = true): string => {
  const formatter = new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  const formattedAmount = formatter.format(amount);
  
  if (!includeSymbol) return formattedAmount;
  
  switch (currency) {
    case 'EUR': return `${formattedAmount} €`;
    case 'USD': return `${formattedAmount} $`;
    case 'GBP': return `${formattedAmount} £`;
    default: return `${formattedAmount} lei`;
  }
};

/**
 * Obține lista monedelor disponibile pentru selecție în UI
 */
export const getAvailableCurrencies = () => {
  return [
    { value: 'all', label: 'Toate monedele', symbol: '' },
    { value: 'RON', label: 'RON', symbol: 'lei' },
    { value: 'EUR', label: 'EUR', symbol: '€' },
    { value: 'USD', label: 'USD', symbol: '$' },
    { value: 'GBP', label: 'GBP', symbol: '£' }
  ];
};
