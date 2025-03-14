'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAvailableCurrencies, isValidCurrency } from '@/lib/currency-helpers';

interface CurrencyHandlerProps {
  onCurrencyChange: (currency: string) => void;
  onError?: (error: string) => void;
}

/**
 * Component to handle currency switching in a safer way
 */
export const useCurrencyHandler = (
  initialCurrency: string = 'RON',
  onCurrencyChange?: (currency: string) => void,
  onFetchListings?: () => void
) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize from URL if needed
  useEffect(() => {
    const urlCurrency = searchParams.get('currency');
    if (urlCurrency && isValidCurrency(urlCurrency) && urlCurrency !== selectedCurrency) {
      setSelectedCurrency(urlCurrency);
      if (onCurrencyChange) onCurrencyChange(urlCurrency);
    }
  }, [searchParams, onCurrencyChange]);
  
  const handleCurrencyChange = useCallback(async (newCurrency: string) => {
    if (newCurrency === selectedCurrency || !isValidCurrency(newCurrency)) return;
    
    setIsChanging(true);
    setError(null);
    
    try {
      // 1. Update local state
      setSelectedCurrency(newCurrency);
      
      // 2. Update URL parameters
      const params = new URLSearchParams(window.location.search);
      
      // Special handling for GBP which might have schema issues
      if (newCurrency === 'GBP') {
        // Clear price filters that might cause issues
        params.delete('minPrice');
        params.delete('maxPrice');
      }
      
      // Set the currency parameter
      params.set('currency', newCurrency);
      
      // Update URL without navigation
      window.history.replaceState(
        { currency: newCurrency },
        '',
        `${window.location.pathname}?${params.toString()}`
      );
      
      // 3. Notify parent component
      if (onCurrencyChange) {
        onCurrencyChange(newCurrency);
      }
      
      // 4. Force reload listings if needed
      if (onFetchListings) {
        setTimeout(onFetchListings, 100);
      }
    } catch (err) {
      console.error("Currency change error:", err);
      setError(err instanceof Error ? err.message : "Unknown error changing currency");
      
      // Revert to previous currency
      setSelectedCurrency(selectedCurrency);
    } finally {
      // Clear loading state
      setTimeout(() => setIsChanging(false), 300);
    }
  }, [selectedCurrency, onCurrencyChange, onFetchListings]);
  
  // Return all needed values and functions
  return {
    selectedCurrency,
    isChanging,
    error,
    handleCurrencyChange,
    availableCurrencies: getAvailableCurrencies(),
  };
};

export default function CurrencyHandler({ onCurrencyChange, onError }: CurrencyHandlerProps) {
  const { 
    selectedCurrency, 
    isChanging, 
    error, 
    handleCurrencyChange, 
    availableCurrencies 
  } = useCurrencyHandler('RON', onCurrencyChange);
  
  // Report errors to parent
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);
  
  return null; // This is a utility component with no UI
}