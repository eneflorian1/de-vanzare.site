'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Grid, List, MapPin, Calendar, Eye, Tag, Heart, Share2, DollarSign, Euro, PoundSterling, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getImagePath } from '@/lib/imageUtils';
import { useSearchParams } from 'next/navigation';
import { convertPrice, formatPriceWithCurrency, getAvailableCurrencies } from '@/lib/currencyUtils';
import { useFavorites } from '@/hooks/useFavorites';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Tipuri pentru valute
type CurrencyCode = 'RON' | 'EUR' | 'USD' | 'GBP';
type DisplayCurrency = CurrencyCode | 'all';

interface Listing {
  id: string;
  title: string;
  price: number;
  currency?: CurrencyCode;
  description: string;
  slug: string;
  images: { imageUrl?: string; url?: string }[];
  location: { name?: string; city?: string; county?: string };
  createdAt: string;
  category?: {
    id: number;
    name: string;
    slug: string;
    parentId?: number | null;
    description?: string | null;
    iconName?: string | null;
  };
  views?: number;
  originalPrice?: number;
  originalCurrency?: CurrencyCode;
}

interface ListingsPageProps {
  initialListings: Listing[];
  selectedCurrency?: DisplayCurrency;
}

// Currency icon component
const CurrencyIcon = ({ currency }: { currency: CurrencyCode }) => {
  switch(currency) {
    case 'EUR': return <Euro className="h-4 w-4" />;
    case 'USD': return <DollarSign className="h-4 w-4" />;
    case 'GBP': return <PoundSterling className="h-4 w-4" />;
    default: return <span className="text-sm font-medium">RON</span>;
  }
};

// Exchange rates (simplified for demonstration)
const exchangeRates: Record<CurrencyCode, Record<CurrencyCode, number>> = {
  'RON': { 'EUR': 0.2, 'USD': 0.22, 'GBP': 0.17, 'RON': 1 },
  'EUR': { 'RON': 5.0, 'USD': 1.1, 'GBP': 0.85, 'EUR': 1 },
  'USD': { 'RON': 4.5, 'EUR': 0.91, 'GBP': 0.77, 'USD': 1 },
  'GBP': { 'RON': 5.9, 'EUR': 1.18, 'USD': 1.3, 'GBP': 1 }
};

export default function ListingsPage({ initialListings, selectedCurrency: propCurrency }: ListingsPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [listings, setListings] = useState<Listing[]>(initialListings || []);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const searchParams = useSearchParams();
  // Priority: prop > URL param > default
  const selectedCurrency = (propCurrency || searchParams.get('currency') || 'RON') as DisplayCurrency;
  
  // Cache for converted prices to avoid recalculating
  const [priceCache, setPriceCache] = useState<Record<string, Record<string, number>>>({});
  
  // Calculate time difference
  const getTimeAgo = (dateString: string): string => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      const minute = 60;
      const hour = minute * 60;
      const day = hour * 24;
      const week = day * 7;
      const month = day * 30;
      
      if (diffInSeconds < minute) {
        return 'chiar acum';
      } else if (diffInSeconds < hour) {
        const minutes = Math.floor(diffInSeconds / minute);
        return `acum ${minutes} ${minutes === 1 ? 'minut' : 'minute'}`;
      } else if (diffInSeconds < day) {
        const hours = Math.floor(diffInSeconds / hour);
        return `acum ${hours} ${hours === 1 ? 'oră' : 'ore'}`;
      } else if (diffInSeconds < week) {
        const days = Math.floor(diffInSeconds / day);
        return `acum ${days} ${days === 1 ? 'zi' : 'zile'}`;
      } else if (diffInSeconds < month) {
        const weeks = Math.floor(diffInSeconds / week);
        return `acum ${weeks} ${weeks === 1 ? 'săptămână' : 'săptămâni'}`;
      } else {
        return new Date(dateString).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (error) {
      // Fallback in case of date parsing error
      console.error("Error parsing date:", error);
      return "Data necunoscută";
    }
  };
  
  // Get or calculate converted price with caching and error handling
  const getConvertedPrice = (price: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number => {
    try {
      // If currencies are the same, just return the original price
      if (fromCurrency === toCurrency) return price;
      
      // Create cache keys
      const cacheKey = `${fromCurrency}_${toCurrency}`;
      
      // Check if we already calculated this conversion
      if (priceCache[cacheKey] && priceCache[cacheKey][price] !== undefined) {
        return priceCache[cacheKey][price];
      }
      
      // Validate currency codes
      if (!exchangeRates[fromCurrency] || !exchangeRates[fromCurrency][toCurrency]) {
        console.warn(`Invalid currency conversion: ${fromCurrency} to ${toCurrency}`);
        return price;
      }
      
      // Calculate and cache the converted price
      const converted = price * exchangeRates[fromCurrency][toCurrency];
      
      // Update the cache
      setPriceCache(prev => ({
        ...prev,
        [cacheKey]: {
          ...(prev[cacheKey] || {}),
          [price]: converted
        }
      }));
      
      return converted;
    } catch (error) {
      console.error("Error converting price:", error);
      return price; // Return original price on error
    }
  };
  
  // Process listings whenever currency or initial listings change with cache handling
  useEffect(() => {
    if (!initialListings || initialListings.length === 0) {
      setListings([]);
      return;
    }
    
    // Always reset error state at the beginning
    setConversionError(false);
    
    // Keep a reference to the current listings to avoid stale state issues
    const listingsToProcess = [...initialListings];
    
    const processCurrentListings = async () => {
      try {
        if (selectedCurrency && selectedCurrency !== 'all') {
          setIsConverting(true);
          
          // Process the listings with a small delay to allow UI feedback
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const processed = listingsToProcess.map(listing => {
            const listingCurrency = (listing.currency || 'RON') as CurrencyCode;
            
            if (listingCurrency !== selectedCurrency) {
              const convertedPrice = getConvertedPrice(listing.price, listingCurrency, selectedCurrency as CurrencyCode);
              return {
                ...listing,
                originalPrice: listing.price,
                originalCurrency: listingCurrency,
                price: convertedPrice,
                currency: selectedCurrency as CurrencyCode
              };
            }
            return listing;
          });
          
          setListings(processed);
        } else {
          // If showing all currencies, just use the original listings
          setListings(listingsToProcess);
        }
      } catch (error) {
        console.error("Failed to convert prices:", error);
        setConversionError(true);
        // Always ensure we show something rather than empty listings
        setListings(listingsToProcess);
      } finally {
        setIsConverting(false);
      }
    };
    
    // Start the processing
    processCurrentListings();
    
  }, [initialListings, selectedCurrency]);

  const handleFavoriteClick = async (e: React.MouseEvent, listingId: string) => {
    e.preventDefault(); // Previne navigarea către pagina anunțului
    await toggleFavorite(parseInt(listingId));
  };

  const handleShare = async (e: React.MouseEvent, listing: Listing) => {
    e.preventDefault(); // Previne navigarea către pagina anunțului
    
    const shareUrl = `${window.location.origin}/anunturi/${listing.slug}`;
    const shareTitle = listing.title;
    const shareText = `${listing.title} - ${formatPrice(listing.price)} ${listing.currency}`;
    
    try {
      if (navigator.share) {
        // Pentru dispozitive mobile
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Mulțumim pentru distribuire!');
      } else {
        // Fallback pentru desktop - copiere în clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link-ul a fost copiat în clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('A apărut o eroare la distribuire');
    }
  };

  // Handle case when no listings
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Nu există anunțuri disponibile</h2>
        <p className="text-gray-500 mt-2">Încearcă să modifici filtrele de căutare</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Conversion error notice */}
      {conversionError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>
            A apărut o eroare la conversia prețurilor. Unele prețuri pot fi afișate în moneda originală.
          </p>
        </div>
      )}
    
      {/* View mode toggle */}
      <div className="flex justify-between items-center gap-2 mb-4">
        <div className="text-gray-600">
          {listings.length} {listings.length === 1 ? 'anunț' : 'anunțuri'} găsite
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-label="Vizualizare grilă"
            title="Vizualizare grilă"
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-label="Vizualizare listă"
            title="Vizualizare listă"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Currency conversion loading overlay */}
      {isConverting && (
        <div className="relative">
          <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-2 p-4 bg-white shadow-lg rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-indigo-600 font-medium">Se convertesc prețurile...</p>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <Link href={`/anunturi/${listing.slug}`} key={listing.id} className="group">
              <motion.div 
                className="bg-white rounded-lg shadow-sm overflow-hidden relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={listing.images[0]?.imageUrl || listing.images[0]?.url || '/placeholder.png'}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    priority={false}
                  />
                  <motion.button
                    onClick={(e) => handleFavoriteClick(e, listing.id)}
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      isFavorite(parseInt(listing.id)) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart 
                      className="h-5 w-5" 
                      fill={isFavorite(parseInt(listing.id)) ? "currentColor" : "none"}
                    />
                  </motion.button>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 line-clamp-2">
                    {listing.title}
                  </h3>
                  
                  {/* Price display with converted price indication */}
                  <div className="mt-2">
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-indigo-600 flex items-center">
                        {listing.currency && <CurrencyIcon currency={listing.currency} />}
                        <span className="ml-1">{formatPrice(listing.price)}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Location and date info */}
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                    {listing.location?.city && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.location.city}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {getTimeAgo(listing.createdAt)}
                    </div>
                    {listing.views !== undefined && (
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {listing.views} vizualizări
                      </div>
                    )}
                    {listing.category?.name && (
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {listing.category.name}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Link href={`/anunturi/${listing.slug}`} key={listing.id} className="group">
              <motion.div 
                className="bg-white rounded-lg shadow-sm overflow-hidden flex relative"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative w-48 h-36">
                  <Image
                    src={listing.images[0]?.imageUrl || listing.images[0]?.url || '/placeholder.png'}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    priority={false}
                  />
                  <motion.button
                    onClick={(e) => handleFavoriteClick(e, listing.id)}
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      isFavorite(parseInt(listing.id)) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart 
                      className="h-5 w-5" 
                      fill={isFavorite(parseInt(listing.id)) ? "currentColor" : "none"}
                    />
                  </motion.button>
                </div>
                {/* Content */}
                <div className="p-4 flex-grow">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 line-clamp-2">
                    {listing.title}
                  </h3>
                  
                  {/* Price display with converted price indication */}
                  <div className="mt-2">
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-indigo-600 flex items-center">
                        {listing.currency && <CurrencyIcon currency={listing.currency} />}
                        <span className="ml-1">{formatPrice(listing.price)}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Location and date info */}
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                    {listing.location?.city && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.location.city}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {getTimeAgo(listing.createdAt)}
                    </div>
                    {listing.views !== undefined && (
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {listing.views} vizualizări
                      </div>
                    )}
                    {listing.category?.name && (
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {listing.category.name}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}