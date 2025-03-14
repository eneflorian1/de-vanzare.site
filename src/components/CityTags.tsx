'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

interface CityTagsProps {
  onClear?: () => void;
}

const CityTags: React.FC<CityTagsProps> = ({ onClear }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCities, setActiveCities] = useState<string[]>([]);

  // Load cities from URL parameters
  useEffect(() => {
    const urlCity = searchParams.get('city');
    if (urlCity) {
      setActiveCities([urlCity]);
    } else {
      setActiveCities([]);
    }
  }, [searchParams]);

  const handleClearCity = (city: string) => {
    // Create a new URL without the city parameter
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete('city');
    newParams.delete('county');
    
    // Update the URL
    router.push(`/anunturi?${newParams.toString()}`);
    
    // Clear the city locally as well
    setActiveCities([]);
    
    // Call the optional callback if provided
    if (onClear) {
      onClear();
    }
  };

  if (activeCities.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {activeCities.map((city) => (
        <div key={city} className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
          {city}
          <button 
            onClick={() => handleClearCity(city)}
            className="ml-1 p-0.5 hover:bg-indigo-100 rounded-full"
            aria-label={`Șterge ${city}`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CityTags;