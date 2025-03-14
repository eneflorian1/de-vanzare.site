'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ChevronDown, MapPin, Loader2, X, DollarSign, Euro, PoundSterling } from 'lucide-react';
import { useCategories } from '@/components/CategoryProvider';
import AutocompleteLocationSelector from '@/components/AutocompleteLocationSelector';
import CategoryBrowserModal from '@/components/CategoryBrowserModal';

type CurrencyCode = 'RON' | 'EUR' | 'USD' | 'GBP' | 'all';

interface SearchFiltersProps {
  onCurrencyChange?: (currency: CurrencyCode) => void;
  initialCurrency?: CurrencyCode;
}

interface PriceRange {
  min: string;
  max: string;
}

// Currency icon component for visual appeal
const CurrencyIcon = ({ currency }: { currency: CurrencyCode }) => {
  switch(currency) {
    case 'EUR': return <Euro className="h-4 w-4" />;
    case 'USD': return <DollarSign className="h-4 w-4" />;
    case 'GBP': return <PoundSterling className="h-4 w-4" />;
    default: return <span className="text-sm font-medium">RON</span>;
  }
};

export default function SearchFilters({ onSearch, onCurrencyChange, onCityReset }: { 
  onSearch?: (results: any[]) => void;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  onCityReset?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [changingCurrency, setChangingCurrency] = useState(false);
  
  // Location state using the enhanced location selector
  const [selectedLocation, setSelectedLocation] = useState<{ city: string, county: string } | null>(null);
  
  const [popularCities, setPopularCities] = useState([
    { city: 'București', county: 'București' },
    { city: 'Cluj-Napoca', county: 'Cluj' },
    { city: 'Timișoara', county: 'Timiș' },
    { city: 'Iași', county: 'Iași' },
    { city: 'Constanța', county: 'Constanța' },
    { city: 'Brașov', county: 'Brașov' },
  ]);
  
  const currencies = [
    { value: 'all', label: 'Toate monedele', symbol: '' },
    { value: 'RON', label: 'RON', symbol: 'lei' },
    { value: 'EUR', label: 'EUR', symbol: '€' },
    { value: 'USD', label: 'USD', symbol: '$' },
    { value: 'GBP', label: 'GBP', symbol: '£' }
  ];
  
  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  
  // Folosim hook-ul de categorii
  const { mainCategories, categories, isLoading: categoriesLoading } = useCategories();
  
  // Category browser modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Adăugăm un state pentru a preveni actualizări multiple
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  // Adăugăm un state pentru a preveni apeluri multiple
  const [isRemoving, setIsRemoving] = useState(false);

  // Încărcare inițială a filtrelor din URL și sincronizare cu URL-ul
  useEffect(() => {
    // Initialize from URL params
    const urlSearchParams = new URLSearchParams(window.location.search);
    
    // Get search query
    const urlQuery = urlSearchParams.get('query');
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }
    
    // Get category
    const urlCategory = urlSearchParams.get('category');
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
    
    // Get price range
    const urlMinPrice = urlSearchParams.get('minPrice');
    const urlMaxPrice = urlSearchParams.get('maxPrice');
    if (urlMinPrice || urlMaxPrice) {
      setPriceRange({
        min: urlMinPrice || '',
        max: urlMaxPrice || ''
      });
    }
    
    // Get currency
    const urlCurrency = urlSearchParams.get('currency') as CurrencyCode | null;
    if (urlCurrency && currencies.some(c => c.value === urlCurrency)) {
      setSelectedCurrency(urlCurrency);
      if (onCurrencyChange) {
        onCurrencyChange(urlCurrency);
      }
    }
    
    // Get sort
    const urlSort = urlSearchParams.get('sortBy');
    if (urlSort) {
      setSortBy(urlSort);
    }
    
    // Check premium filter
    const isPremium = urlSearchParams.get('premium') === 'true';
    setIsPremium(isPremium);
    
    // Update active filters
    updateActiveFilters();
  }, []);
  
  // Modificăm efectul de sincronizare pentru locație
  useEffect(() => {
    if (isUpdatingLocation) return; // Prevenim actualizări recursive

    const urlCity = searchParams.get('city');
    const urlCounty = searchParams.get('county');
    
    if (urlCity && urlCounty) {
      const newLocation = { city: urlCity, county: urlCounty };
      if (!selectedLocation || 
          selectedLocation.city !== urlCity || 
          selectedLocation.county !== urlCounty) {
        setSelectedLocation(newLocation);
      }
    } else if (selectedLocation) {
      setSelectedLocation(null);
    }
  }, [searchParams, isUpdatingLocation]);
  
  const updateActiveFilters = () => {
    const filters: string[] = [];
    
    if (searchQuery) {
      filters.push(`Căutare: ${searchQuery}`);
    }
    
    if (selectedCategory && selectedCategory !== 'toate') {
      const categoryName = categories.find(c => c.slug === selectedCategory)?.name;
      if (categoryName) {
        filters.push(`Categorie: ${categoryName}`);
      }
    }
    
    if (priceRange.min && priceRange.max) {
      filters.push(`Preț: ${priceRange.min} - ${priceRange.max} ${selectedCurrency !== 'all' ? selectedCurrency : ''}`);
    } else if (priceRange.min) {
      filters.push(`Preț minim: ${priceRange.min} ${selectedCurrency !== 'all' ? selectedCurrency : ''}`);
    } else if (priceRange.max) {
      filters.push(`Preț maxim: ${priceRange.max} ${selectedCurrency !== 'all' ? selectedCurrency : ''}`);
    }
    
    if (selectedLocation) {
      filters.push(`Locație: ${selectedLocation.city}, ${selectedLocation.county}`);
    }
    
    if (selectedCurrency !== 'all') {
      filters.push(`Monedă: ${selectedCurrency}`);
    }
    
    if (isPremium) {
      filters.push(`Anunțuri premium`);
    }
    
    setActiveFilters(filters);
  };
  
  // Adăugăm un efect pentru a sincroniza valuta din URL
  useEffect(() => {
    const urlCurrency = searchParams.get('currency') as CurrencyCode;
    if (urlCurrency && urlCurrency !== selectedCurrency) {
      setSelectedCurrency(urlCurrency);
    }
  }, [searchParams]);
  
  // Currency selection handler cu stabilitate și feedback îmbunătățit
  const handleCurrencyChange = (currency: CurrencyCode) => {
    // If same currency selected, just return
    if (currency === selectedCurrency) return;
    
    // Visual feedback that currency is changing
    setChangingCurrency(true);
    
    try {
      // Update UI state immediately
      setSelectedCurrency(currency);
      
      // Construim noul URL păstrând parametrii existenți
      const currentParams = new URLSearchParams(window.location.search);
      
      if (currency !== 'all') {
        currentParams.set('currency', currency);
      } else {
        currentParams.delete('currency');
      }
      
      // Folosim router.push în loc de replaceState pentru a asigura o actualizare corectă
      router.push(`${window.location.pathname}?${currentParams.toString()}`, { scroll: false });
      
      // Notificăm componenta părinte despre schimbarea valutei
      if (onCurrencyChange) {
        onCurrencyChange(currency);
      }
    } catch (err) {
      console.error("Error during currency change:", err);
      // Nu mai este nevoie să revenim la valuta anterioară deoarece
      // efectul useEffect va sincroniza automat cu URL-ul
    } finally {
      // Eliminăm starea de loading după o scurtă întârziere
      setTimeout(() => {
        setChangingCurrency(false);
      }, 300);
    }
  };
  
  const handleCityToggle = async (cityData: { city: string, county: string }) => {
    if (isUpdatingLocation) return;

    setIsUpdatingLocation(true);
    
    try {
      const isSelected = selectedLocation && 
                        selectedLocation.city === cityData.city && 
                        selectedLocation.county === cityData.county;

      // Actualizăm starea locală imediat pentru feedback vizual
      setSelectedLocation(isSelected ? null : cityData);

      // Construim URL-ul nou păstrând parametrii existenți
      const currentParams = new URLSearchParams(window.location.search);
      
      // Ștergem parametrii vechi de locație
      currentParams.delete('city');
      currentParams.delete('county');
      
      if (!isSelected) {
        currentParams.set('city', cityData.city);
        currentParams.set('county', cityData.county);
      } else if (onCityReset) {
        onCityReset();
      }

      // Construim noul URL
      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
      
      // Actualizăm URL-ul și așteptăm să se termine
      await router.replace(newUrl, { scroll: false });

      // Așteptăm puțin pentru a ne asigura că URL-ul s-a actualizat
      await new Promise(resolve => setTimeout(resolve, 50));

      // Declanșăm căutarea și așteptăm să se termine
      await handleSearch(true);
      
    } catch (error) {
      console.error('Error in city toggle:', error);
      // Revertim starea în caz de eroare
      setSelectedLocation(selectedLocation);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleSearch = async (isInitial = false, sortOnlyChange = false) => {
    if (changingCurrency || isUpdatingLocation) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Construim parametrii de căutare
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.set('query', searchQuery);
      }
      
      if (selectedCategory && selectedCategory !== 'toate') {
        params.set('category', selectedCategory);
      }
      
      if (priceRange.min) {
        params.set('minPrice', priceRange.min);
      }
      
      if (priceRange.max) {
        params.set('maxPrice', priceRange.max);
      }
      
      if (selectedLocation) {
        params.set('city', selectedLocation.city);
        params.set('county', selectedLocation.county);
      }
      
      if (selectedCurrency !== 'all') {
        params.set('currency', selectedCurrency);
      }
      
      if (sortBy) {
        params.set('sortBy', sortBy);
      }
      
      if (isPremium) {
        params.set('premium', 'true');
      }
      
      // Actualizăm URL-ul și așteptăm să se termine
      await router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
      
      // Așteptăm puțin pentru a ne asigura că URL-ul s-a actualizat
      await new Promise(resolve => setTimeout(resolve, 50));

      // Actualizăm filtrele active
      updateActiveFilters();

      console.log(`Searching with params: ${params.toString()}`);
      
      // Apelăm API-ul de căutare
      const response = await fetch(`/api/search?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.details || 'API returned success: false');
      }
      
      // Trimitem rezultatele către componenta părinte
      if (onSearch) {
        onSearch(data.listings || []);
      }
      
    } catch (error) {
      console.error('Error in search:', error);
      setError(error instanceof Error ? error.message : 'A apărut o eroare în timpul căutării');
      if (onSearch) {
        onSearch([]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleLocationChange = (location: { city: string; county: string } | null) => {
    setSelectedLocation(location);
  };
  
  const handleCategoryChange = async (value: string) => {
    try {
      // Actualizăm starea categoriei imediat pentru feedback vizual
      setSelectedCategory(value);

      // Construim URL-ul nou păstrând parametrii existenți
      const currentParams = new URLSearchParams(window.location.search);
      
      // Ștergem întotdeauna parametrul vechi de categorie
      currentParams.delete('category');
      
      // Adăugăm categoria nouă doar dacă nu este 'toate'
      if (value !== 'toate') {
        currentParams.set('category', value);
      }
      
      // Actualizăm filtrele active
      updateActiveFilters();
      
      // Actualizăm URL-ul
      await router.replace(`${window.location.pathname}?${currentParams.toString()}`, { scroll: false });
      
      // Așteptăm puțin pentru a ne asigura că URL-ul s-a actualizat
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Declanșăm căutarea
      await handleSearch(true);
      
      // Închidem panoul de filtre doar după ce s-a terminat căutarea
      setTimeout(() => setShowFilters(false), 300);
    } catch (error) {
      console.error('Error in category change:', error);
      // Revertim la categoria din URL în caz de eroare
      const urlCategory = searchParams.get('category');
      setSelectedCategory(urlCategory || 'toate');
    }
  };

  // Modificăm efectul pentru sincronizarea categoriei
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory || 'toate');
    }
  }, [searchParams, selectedCategory]);

  const resetAllFilters = async () => {
    // Resetăm toate stările
    setSearchQuery('');
    setSelectedCategory('toate');
    setPriceRange({ min: '', max: '' });
    setSelectedLocation(null);
    setActiveFilters([]);
    
    // Ștergem toți parametrii din URL, păstrând doar sortarea dacă există
    const currentParams = new URLSearchParams(window.location.search);
    const sortByValue = currentParams.get('sortBy');
    const currencyValue = currentParams.get('currency');
    
    // Creăm un nou URL doar cu sortarea și valuta, dacă există
    const newParams = new URLSearchParams();
    if (sortByValue) newParams.set('sortBy', sortByValue);
    if (currencyValue) newParams.set('currency', currencyValue);
    
    // Actualizăm URL-ul
    await router.replace(`${window.location.pathname}?${newParams.toString()}`, { scroll: false });
    
    // Declanșăm căutarea
    setTimeout(() => handleSearch(), 50);
  };

  const removeFilter = async (filterIndex: number) => {
    if (isRemoving) return;
    setIsRemoving(true);
    setShowFilters(false); // Închidem imediat panoul

    const filter = activeFilters[filterIndex];
    const currentParams = new URLSearchParams(window.location.search);
    
    // Actualizăm filtrele active imediat
    const newFilters = activeFilters.filter((_, i) => i !== filterIndex);
    setActiveFilters(newFilters);
    
    // Identificăm și ștergem filtrul corect
    if (filter.startsWith('"')) {
      setSearchQuery('');
      currentParams.delete('query');
    } else if (categories.some(cat => cat.name === filter)) {
      setSelectedCategory('toate');
      currentParams.delete('category');
    } else if (filter.includes('-') || filter.includes('>=') || filter.includes('<=')) {
      setPriceRange({ min: '', max: '' });
      currentParams.delete('minPrice');
      currentParams.delete('maxPrice');
    } else if (selectedLocation && filter === selectedLocation.city) {
      setSelectedLocation(null);
      currentParams.delete('city');
      currentParams.delete('county');
    }

    try {
      // Actualizăm URL-ul
      await router.replace(`${window.location.pathname}?${currentParams.toString()}`, { scroll: false });
      await handleSearch(true);
    } catch (error) {
      console.error('Error removing filter:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  // Adăugăm o categorie artificială pentru "Toate categoriile"
  const allCategoriesOption = { id: 0, name: 'Toate categoriile', slug: 'toate', parentId: null, description: null, iconName: null };
  const availableCategories = [allCategoriesOption, ...mainCategories];

  // Adăugăm un efect pentru sincronizarea sortării
  useEffect(() => {
    const urlSortBy = searchParams.get('sortBy');
    if (urlSortBy && urlSortBy !== sortBy) {
      setSortBy(urlSortBy);
    }
  }, [searchParams]);

  // Modificăm handlerul pentru schimbarea sortării
  const handleSortChange = async (newSortValue: string) => {
    setSortBy(newSortValue);
    
    // Construim URL-ul nou păstrând parametrii existenți
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('sortBy', newSortValue);
    
    // Actualizăm URL-ul
    await router.replace(`${window.location.pathname}?${currentParams.toString()}`, { scroll: false });
    
    // Declanșăm căutarea
    await handleSearch(true);
  };

  // Function to toggle premium filter
  const handleTogglePremium = () => {
    setIsPremium(!isPremium);
    setTimeout(() => {
      handleSearch();
    }, 0);
  };

  return (
    <div className="sticky top-16 bg-white shadow-md z-40">
      {/* Bara principală de căutare */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută anunțuri..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    handleSearch();
                  }}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Caută...
                </>
              ) : 'Caută'}
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-200 ${
              showFilters ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filtre
            {activeFilters.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        
        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeFilters.map((filter, index) => (
              <div key={index} className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                {filter}
                <button 
                  onClick={() => removeFilter(index)}
                  className="ml-1 p-0.5 hover:bg-indigo-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {activeFilters.length > 1 && (
              <button 
                onClick={resetAllFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 hover:bg-indigo-50 rounded-full"
              >
                Resetează toate
              </button>
            )}
          </div>
        )}
        
        {/* Butoane de selecție orașe îmbunătățite */}
        <div className="flex flex-wrap gap-2 mt-3">
          {popularCities.map((cityData, index) => {
            const isSelected = selectedLocation && 
                              selectedLocation.city === cityData.city && 
                              selectedLocation.county === cityData.county;
            
            return (
              <button
                key={index}
                onClick={() => handleCityToggle(cityData)}
                className={`text-xs px-3 py-1 rounded-full flex items-center gap-1
                  ${isSelected 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <MapPin className="h-3 w-3" />
                {cityData.city}
                {isSelected && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting and currency control bar - outside filters panel */}
      <div className="container mx-auto px-4 py-2 border-t">
        <div className="flex justify-between items-center flex-wrap gap-2">
          {/* Currency selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 hidden md:inline">
              Afișează prețurile în:
            </label>
            <div className="flex relative">
              {changingCurrency && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                </div>
              )}
              {currencies.filter(c => c.value !== 'all').map((currency) => (
                <button
                  key={currency.value}
                  onClick={() => {
                    if (!changingCurrency) {
                      handleCurrencyChange(currency.value as CurrencyCode);
                    }
                  }}
                  disabled={changingCurrency}
                  className={`px-3 py-1.5 flex items-center justify-center min-w-[60px] ${
                    selectedCurrency === currency.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${currency.value === 'RON' ? 'rounded-l-lg' : ''} ${
                    currency.value === 'GBP' ? 'rounded-r-lg' : ''
                  } ${changingCurrency ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`Switch to ${currency.label} currency`}
                >
                  <CurrencyIcon currency={currency.value as CurrencyCode} />
                </button>
              ))}
            </div>
            
            {/* Premium filter - mutat din panoul de filtre avansate */}
            <div className="flex items-center ml-6">
              <label className="block text-sm font-medium text-gray-700 mr-2">
                Premium
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isPremium}
                  onChange={handleTogglePremium}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
          
          {/* Separate sort control */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 hidden md:inline">
              Sortare:
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border rounded-lg p-2 bg-white min-w-[150px]"
              disabled={changingCurrency}
            >
              <option value="recent">Cele mai recente</option>
              <option value="price_asc">Preț crescător</option>
              <option value="price_desc">Preț descrescător</option>
              <option value="popular">Popularitate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Panoul de filtre avansate */}
      {showFilters && (
        <div className="border-t">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Categorie */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Categorie
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    Toate categoriile
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </button>
                </div>
                {categoriesLoading ? (
                <div className="w-full border rounded-lg p-2 flex items-center justify-center gap-2 bg-gray-50">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-gray-500">Se încarcă categoriile...</span>
                </div>
              ) : (
                <select
                  value={searchParams.get('category') || 'toate'}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
              </div>

              {/* Interval de preț */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
                  <span>Preț</span>
                  {selectedCurrency !== 'all' && (
                    <span className="text-xs text-indigo-600">{currencies.find(c => c.value === selectedCurrency)?.label}</span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="relative w-1/2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0);
                        setPriceRange(prev => ({ ...prev, min: value.toString() }));
                      }}
                      onBlur={async () => {
                        if (priceRange.min && priceRange.max) {
                          await handleSearch();
                          setShowFilters(false);
                        }
                      }}
                      className="w-full border rounded-lg p-2 pr-8"
                    />
                    {selectedCurrency !== 'all' && (
                      <span className="absolute right-2 top-2 text-gray-400 text-sm">
                        {currencies.find(c => c.value === selectedCurrency)?.symbol}
                      </span>
                    )}
                  </div>
                  <div className="relative w-1/2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0);
                        setPriceRange(prev => ({ ...prev, max: value.toString() }));
                      }}
                      onBlur={async () => {
                        if (priceRange.min && priceRange.max) {
                          await handleSearch();
                          setShowFilters(false);
                        }
                      }}
                      className="w-full border rounded-lg p-2 pr-8"
                    />
                    {selectedCurrency !== 'all' && (
                      <span className="absolute right-2 top-2 text-gray-400 text-sm">
                        {currencies.find(c => c.value === selectedCurrency)?.symbol}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Location Selector */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Locație
                </label>
                <AutocompleteLocationSelector
                  selectedLocation={selectedLocation}
                  onLocationChange={handleLocationChange}
                  placeholder="Caută oraș sau județ..."
                  className="w-full"
                />
              </div>

              {/* Buton de aplicare filtre */}
              <div className="flex items-end md:col-span-4 gap-4">
                {/* Butonul a fost eliminat */}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Category Browser Modal */}
      <CategoryBrowserModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
      />
    </div>
  );
}