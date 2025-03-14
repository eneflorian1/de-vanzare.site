'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import prisma from '@/lib/prisma';
import ListingsPage from '@/components/listings/ListingsPage';
import SearchFilters from '@/components/listings/SearchFilters';
import { X } from 'lucide-react';

export default function AnunturiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load city from URL parameters
  useEffect(() => {
    const urlCity = searchParams.get('city');
    if (urlCity) {
      setSelectedCity(urlCity);
    } else {
      setSelectedCity(null);
    }
  }, [searchParams]);
  useEffect(() => {
    // Preia anunțurile inițiale în funcție de parametrii URL
    const fetchInitialListings = async () => {
      try {
        setIsLoading(true);
        
        // Preluăm parametrii din URL dacă există
        const urlSearchParams = new URLSearchParams(window.location.search);
        const urlQuery = urlSearchParams.toString();
        
        // Get currency from URL for initialization
        const urlCurrency = urlSearchParams.get('currency');
        if (urlCurrency) {
          setSelectedCurrency(urlCurrency);
        }
        
        // Adăugăm parametrii la request dacă există
        const apiUrl = urlQuery ? `/api/search?${urlQuery}` : '/api/search';
        console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Check we have listings before setting state
            if (data.listings && Array.isArray(data.listings)) {
              setListings(data.listings);
            } else {
              console.warn('Received empty or invalid listings array');
              setListings([]);
            }
          } else {
            console.warn('API returned success: false');
            setListings([]);
          }
        } else {
          console.error('Error fetching data from API:', response.statusText);
          setListings([]);
        }
      } catch (error) {
        console.error('Error fetching initial listings:', error);
        setListings([]);
      } finally {
        setInitialDataLoaded(true);
        setIsLoading(false);
      }
    };
    
    fetchInitialListings();
    
    // Add an event listener for browser back/forward navigation
    const handlePopState = () => {
      // Re-fetch listings when browser navigation occurs
      fetchInitialListings();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Funcție îmbunătățită pentru reîncărcarea anunțurilor cu tratarea erorilor avansate
  const reloadListings = async () => {
    try {
      setIsLoading(true);
      
      // Extragem parametrii din URL
      const urlSearchParams = new URLSearchParams(window.location.search);
      const apiUrl = `/api/search?${urlSearchParams.toString()}`;
      
      console.log('Reload listings with URL:', apiUrl);
      
      // Facem cererea API cu timeout și tratarea erorilor
      const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          clearTimeout(id);
          return response;
        } catch (error) {
          clearTimeout(id);
          throw error;
        }
      };
      
      // Apelul API cu timeout
      const response = await fetchWithTimeout(apiUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      // Verificăm dacă răspunsul este valid
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        
        // Dacă e eroare de server 500, încercăm să rezolvăm problema
        if (response.status === 500) {
          // În loc să aruncăm eroare, revenim la parametri simpli
          const fallbackParams = new URLSearchParams();
          if (selectedCurrency) {
            fallbackParams.set('currency', selectedCurrency);
          }
          fallbackParams.set('sortBy', 'recent');
          
          // Reîncercarea cu parametri minimi
          const fallbackResponse = await fetch(`/api/search?${fallbackParams.toString()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.success) {
              setListings(fallbackData.listings || []);
              return; // Success with fallback
            }
          }
        }
        
        // Dacă fallback a eșuat, aruncăm eroarea originală
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      // Procesează datele dacă răspunsul este OK
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API returned success: false');
      }
      
      // Actualizăm listingurile și verificăm să nu fie goale
      if (Array.isArray(data.listings)) {
        setListings(data.listings);
      } else {
        console.warn('API returned non-array listings:', data.listings);
        setListings([]);
      }
    } catch (error) {
      console.error('Error reloading listings:', error);
      // În caz de eroare, setăm o listă goală dar nu aruncăm eroarea mai departe
      setListings([]);
      throw error; // Propagate error for recovery logic
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (results) => {
    setListings(results);
  };
  
  // Improve currency change handling with better error recovery
  const handleCurrencyChange = (currency) => {
    // Update state for client-side currency display
    setSelectedCurrency(currency);
    
    // Reset loading state when currency changes to avoid stuck UI
    setIsLoading(false);
    
    // Always reload listings when changing currency for consistency
    setTimeout(() => {
      reloadListings().catch(error => {
        console.error('Failed to reload listings after currency change:', error);
        
        // Last resort recovery: clear filters and reload with minimal params
        if (currency === 'GBP') {
          // Special handling for GBP which might cause server errors
          const minimalParams = new URLSearchParams();
          minimalParams.set('currency', currency);
          minimalParams.set('sortBy', 'recent');
          
          // Update URL with minimal parameters
          router.push(`/anunturi?${minimalParams.toString()}`);
          
          // Wait a bit then try one more time
          setTimeout(() => {
            reloadListings().catch(() => {
              // If still failing, inform the user
              console.error('Recovery attempt failed');
            });
          }, 500);
        }
      });
    }, 300);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <SearchFilters 
        onSearch={handleSearch} 
        onCurrencyChange={handleCurrencyChange}
        onCityReset={reloadListings}
      />
      <div className="container mx-auto px-4 py-8">
        {initialDataLoaded ? (
          <ListingsPage 
            initialListings={listings || []} 
            selectedCurrency={selectedCurrency}
          />
        ) : (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}