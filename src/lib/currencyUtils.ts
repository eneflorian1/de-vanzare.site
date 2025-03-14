// Currency utilities for price conversion and formatting

// Exchange rates for common currencies (as of February 2025)
export const exchangeRates = {
  'RON': { 'EUR': 0.2, 'USD': 0.22, 'GBP': 0.17 },
  'EUR': { 'RON': 5.0, 'USD': 1.1, 'GBP': 0.85 },
  'USD': { 'RON': 4.5, 'EUR': 0.91, 'GBP': 0.77 },
  'GBP': { 'RON': 5.9, 'EUR': 1.18, 'USD': 1.3 }
};

// Currency symbols for display
export const currencySymbols = {
  'RON': 'lei',
  'EUR': '€',
  'USD': '$',
  'GBP': '£'
};

/**
 * Convert a price from one currency to another
 * @param price - The price to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns The converted price, or original price if conversion not possible
 */
export function convertPrice(price: number, fromCurrency: string, toCurrency: string): number {
  // Return original price if currencies are the same
  if (fromCurrency === toCurrency) return price;
  
  // Direct conversion if rates exist
  if (exchangeRates[fromCurrency] && exchangeRates[fromCurrency][toCurrency]) {
    return price * exchangeRates[fromCurrency][toCurrency];
  }
  
  // Fallback to RON as intermediary
  if (fromCurrency !== 'RON' && toCurrency !== 'RON') {
    const priceInRON = price * exchangeRates[fromCurrency]['RON'];
    return priceInRON * exchangeRates['RON'][toCurrency];
  }
  
  // Return original price if conversion not possible
  return price;
}

/**
 * Format a price with proper currency symbol
 * @param price - The price to format
 * @param currency - Currency code (RON, EUR, USD, GBP)
 * @param showSymbol - Whether to include the currency symbol
 * @returns Formatted price string
 */
export function formatPriceWithCurrency(price: number, currency: string = 'RON', showSymbol: boolean = true): string {
  if (!price && price !== 0) return 'N/A';
  
  // Format the number with appropriate decimal places
  const formattedNumber = price >= 1000 
    ? price.toLocaleString('ro-RO', { maximumFractionDigits: 0 })
    : price.toLocaleString('ro-RO', { maximumFractionDigits: 2 });
  
  // Add currency symbol if requested
  if (showSymbol) {
    const symbol = currencySymbols[currency] || '';
    return currency === 'RON' 
      ? `${formattedNumber} ${symbol}` 
      : `${symbol}${formattedNumber}`;
  }
  
  return formattedNumber;
}

/**
 * Get currencies for UI display
 * @returns Array of currency objects with value, label and symbol
 */
export function getAvailableCurrencies() {
  return [
    { value: 'all', label: 'Toate monedele', symbol: '' },
    { value: 'RON', label: 'RON', symbol: 'lei' },
    { value: 'EUR', label: 'EUR', symbol: '€' },
    { value: 'USD', label: 'USD', symbol: '$' },
    { value: 'GBP', label: 'GBP', symbol: '£' }
  ];
}