'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Info } from 'lucide-react';

// Import the Romanian counties and cities data
import { romanianLocations } from './locationData';

interface Location {
  city: string;
  county: string;
}

interface AutocompleteLocationSelectorProps {
  selectedLocation: Location | null;
  onLocationChange: (location: Location | null) => void;
  placeholder?: string;
  className?: string;
}

const AutocompleteLocationSelector: React.FC<AutocompleteLocationSelectorProps> = ({
  selectedLocation,
  onLocationChange,
  placeholder = 'Caută oraș sau județ...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [focused, setFocused] = useState(false);
  const [multipleCityMatches, setMultipleCityMatches] = useState<Location[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to find exact city matches across all counties
  const findExactCityMatches = (cityName: string): Location[] => {
    const matches: Location[] = [];
    romanianLocations.forEach(county => {
      const matchingCities = county.cities.filter(city => 
        city.toLowerCase() === cityName.toLowerCase()
      );
      
      matchingCities.forEach(city => {
        matches.push({
          city,
          county: county.county
        });
      });
    });
    return matches;
  };

  // Function to find cities and counties that contain the search term
  const getSuggestions = (value: string) => {
    if (!value.trim()) {
      return [];
    }
    
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    const results: Location[] = [];
    
    if (inputLength < 2) {
      return [];
    }

    // Check for exact city matches first
    const exactCityMatches = findExactCityMatches(inputValue);
    if (exactCityMatches.length === 1) {
      return exactCityMatches;
    } else if (exactCityMatches.length > 1) {
      setMultipleCityMatches(exactCityMatches);
    }
    
    // Look for cities and counties containing the search term
    romanianLocations.forEach(county => {
      // Check if county name matches
      if (county.county.toLowerCase().includes(inputValue)) {
        // Add most popular cities from this county
        county.cities.slice(0, 3).forEach(city => {
          results.push({
            city,
            county: county.county
          });
        });
      }
      
      // Check for city matches
      const matchingCities = county.cities.filter(city => 
        city.toLowerCase().includes(inputValue)
      ).slice(0, 5);
      
      matchingCities.forEach(city => {
        results.push({
          city,
          county: county.county
        });
      });
    });
    
    // Remove duplicates and limit results
    return Array.from(new Set(results.map(loc => JSON.stringify(loc))))
      .map(str => JSON.parse(str) as Location)
      .slice(0, 10);
  };

  // Update suggestions when search term changes
  useEffect(() => {
    if (searchTerm) {
      const newSuggestions = getSuggestions(searchTerm);
      setSuggestions(newSuggestions);
      
      // If there's an exact match for a city that exists in only one county, auto-select it
      const exactMatches = findExactCityMatches(searchTerm);
      if (exactMatches.length === 1 && !isOpen) {
        onLocationChange(exactMatches[0]);
      }
    } else {
      setSuggestions([]);
      setMultipleCityMatches([]);
    }
  }, [searchTerm, isOpen, onLocationChange]);

  // Handle click outside to close dropdown with improved clear button handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if we're in the process of clearing the location
      if (document.body.classList.contains('location-clear-in-progress')) {
        return;
      }
      
      // Skip if the click is on the clear button specifically
      if ((event.target as Element)?.closest('.location-clear-button')) {
        return;
      }
      
      // Otherwise close dropdowns if clicked outside
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setMultipleCityMatches([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: Location, event: React.MouseEvent) => {
    // Prevent bubbling that could cause unwanted interactions
    event.preventDefault();
    event.stopPropagation();
    
    // Apply the selection
    onLocationChange(suggestion);
    setSearchTerm('');
    setIsOpen(false);
    setMultipleCityMatches([]);
  };

  // Handle multiple city matches resolution
  const handleMultipleCityMatch = (location: Location, event: React.MouseEvent) => {
    // Prevent bubbling
    event.preventDefault();
    event.stopPropagation();
    
    // Apply the selection
    onLocationChange(location);
    setSearchTerm('');
    setIsOpen(false);
    setMultipleCityMatches([]);
  };

  // Clear selection with improved event handling
  const handleClear = (event: React.MouseEvent) => {
    // Prevent event propagation and default behavior
    event.preventDefault();
    event.stopPropagation();
    
    console.log("Clearing location in AutocompleteLocationSelector");
    
    // Add a class to track that this click is intentional
    document.body.classList.add('location-clear-in-progress');
    
    // Clear the selection
    onLocationChange(null);
    setSearchTerm('');
    setMultipleCityMatches([]);
    setIsOpen(false);
    
    // Remove tracking class after a short delay
    setTimeout(() => {
      document.body.classList.remove('location-clear-in-progress');
      
      // Give input focus
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input field */}
      <div className="relative">
        {!selectedLocation ? (
          <>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                setFocused(true);
                setIsOpen(true);
              }}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              className="w-full px-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <Search 
              className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" 
            />
            {(searchTerm || suggestions.length > 0) && (
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchTerm('');
                  setSuggestions([]);
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center w-full px-4 py-2 border rounded-lg bg-indigo-50 border-indigo-200 transition-all">
            <MapPin className="text-indigo-600 h-5 w-5 mr-2" />
            <div className="flex-1 text-indigo-800">
              <span className="font-medium">{selectedLocation.city}</span>
              <span className="text-indigo-700 text-sm ml-1">({selectedLocation.county})</span>
            </div>
            <button 
              type="button"
              onClick={handleClear}
              className="location-clear-button text-indigo-500 hover:text-indigo-700 transition-colors p-1 rounded-full hover:bg-indigo-100"
              aria-label="Șterge locația"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Multiple cities with same name resolution */}
      {multipleCityMatches.length > 0 && !selectedLocation && (
        <div className="absolute z-30 w-full mt-1 bg-white border rounded-lg shadow-lg">
          <div className="p-2 border-b bg-yellow-50 text-amber-800 text-sm flex items-center">
            <Info size={16} className="mr-1" />
            <span>Există mai multe orașe cu același nume. Selectează județul:</span>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {multipleCityMatches.map((match, i) => (
              <div 
                key={i}
                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors"
                onClick={(e) => handleMultipleCityMatch(match, e)}
              >
                <span className="font-medium">{match.city}</span>
                <span className="text-gray-500 ml-2">({match.county})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && !selectedLocation && !multipleCityMatches.length && (
        <div 
          ref={dropdownRef}
          className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg"
        >
          <div className="max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, i) => (
              <div 
                key={i}
                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors"
                onClick={(e) => handleSuggestionClick(suggestion, e)}
              >
                <span className="font-medium">{suggestion.city}</span>
                <span className="text-gray-500 ml-2">({suggestion.county})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteLocationSelector;