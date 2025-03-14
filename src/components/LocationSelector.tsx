'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, ChevronDown } from 'lucide-react';

interface Location {
  county: string;
  cities: string[];
}

// List of Romanian counties with major cities
const romanianLocations: Location[] = [
  {
    county: 'Alba',
    cities: ['Alba Iulia', 'Aiud', 'Blaj', 'Sebeș', 'Cugir']
  },
  {
    county: 'Arad',
    cities: ['Arad', 'Ineu', 'Lipova', 'Nădlac', 'Pecica']
  },
  {
    county: 'Argeș',
    cities: ['Pitești', 'Câmpulung', 'Curtea de Argeș', 'Mioveni', 'Costești']
  },
  {
    county: 'Bacău',
    cities: ['Bacău', 'Onești', 'Moinești', 'Comănești', 'Buhuși']
  },
  {
    county: 'Bihor',
    cities: ['Oradea', 'Salonta', 'Beiuș', 'Marghita', 'Aleșd']
  },
  {
    county: 'Bistrița-Năsăud',
    cities: ['Bistrița', 'Năsăud', 'Beclean', 'Sângeorz-Băi']
  },
  {
    county: 'Botoșani',
    cities: ['Botoșani', 'Dorohoi', 'Darabani', 'Săveni', 'Bucecea']
  },
  {
    county: 'Brașov',
    cities: ['Brașov', 'Făgăraș', 'Săcele', 'Zărnești', 'Codlea']
  },
  {
    county: 'Brăila',
    cities: ['Brăila', 'Ianca', 'Însurăței', 'Făurei']
  },
  {
    county: 'București',
    cities: ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6']
  },
  {
    county: 'Buzău',
    cities: ['Buzău', 'Râmnicu Sărat', 'Nehoiu', 'Pogoanele', 'Pătârlagele']
  },
  {
    county: 'Caraș-Severin',
    cities: ['Reșița', 'Caransebeș', 'Oravița', 'Moldova Nouă', 'Băile Herculane']
  },
  {
    county: 'Călărași',
    cities: ['Călărași', 'Oltenița', 'Budești', 'Lehliu Gară', 'Fundulea']
  },
  {
    county: 'Cluj',
    cities: ['Cluj-Napoca', 'Turda', 'Dej', 'Câmpia Turzii', 'Gherla']
  },
  {
    county: 'Constanța',
    cities: ['Constanța', 'Mangalia', 'Medgidia', 'Cernavodă', 'Năvodari']
  },
  {
    county: 'Covasna',
    cities: ['Sfântu Gheorghe', 'Târgu Secuiesc', 'Covasna', 'Baraolt', 'Întorsura Buzăului']
  },
  {
    county: 'Dâmbovița',
    cities: ['Târgoviște', 'Moreni', 'Pucioasa', 'Găești', 'Titu']
  },
  {
    county: 'Dolj',
    cities: ['Craiova', 'Băilești', 'Calafat', 'Filiași', 'Dăbuleni']
  },
  {
    county: 'Galați',
    cities: ['Galați', 'Tecuci', 'Târgu Bujor', 'Berești']
  },
  {
    county: 'Giurgiu',
    cities: ['Giurgiu', 'Bolintin-Vale', 'Mihăilești']
  },
  {
    county: 'Gorj',
    cities: ['Târgu Jiu', 'Motru', 'Rovinari', 'Târgu Cărbunești', 'Novaci']
  },
  {
    county: 'Harghita',
    cities: ['Miercurea Ciuc', 'Odorheiu Secuiesc', 'Gheorgheni', 'Toplița', 'Bălan']
  },
  {
    county: 'Hunedoara',
    cities: ['Deva', 'Hunedoara', 'Petroșani', 'Orăștie', 'Brad']
  },
  {
    county: 'Ialomița',
    cities: ['Slobozia', 'Fetești', 'Urziceni', 'Țăndărei', 'Amara']
  },
  {
    county: 'Iași',
    cities: ['Iași', 'Pașcani', 'Târgu Frumos', 'Hârlău', 'Podu Iloaiei']
  },
  {
    county: 'Ilfov',
    cities: ['Voluntari', 'Pantelimon', 'Buftea', 'Popești-Leordeni', 'Bragadiru']
  },
  {
    county: 'Maramureș',
    cities: ['Baia Mare', 'Sighetu Marmației', 'Borșa', 'Vișeu de Sus', 'Târgu Lăpuș']
  },
  {
    county: 'Mehedinți',
    cities: ['Drobeta-Turnu Severin', 'Orșova', 'Strehaia', 'Vânju Mare', 'Baia de Aramă']
  },
  {
    county: 'Mureș',
    cities: ['Târgu Mureș', 'Sighișoara', 'Reghin', 'Târnăveni', 'Luduș']
  },
  {
    county: 'Neamț',
    cities: ['Piatra Neamț', 'Roman', 'Târgu Neamț', 'Bicaz', 'Roznov']
  },
  {
    county: 'Olt',
    cities: ['Slatina', 'Caracal', 'Balș', 'Corabia', 'Scornicești']
  },
  {
    county: 'Prahova',
    cities: ['Ploiești', 'Câmpina', 'Sinaia', 'Azuga', 'Bușteni']
  },
  {
    county: 'Satu Mare',
    cities: ['Satu Mare', 'Carei', 'Negrești-Oaș', 'Tășnad', 'Ardud']
  },
  {
    county: 'Sălaj',
    cities: ['Zalău', 'Șimleu Silvaniei', 'Jibou', 'Cehu Silvaniei']
  },
  {
    county: 'Sibiu',
    cities: ['Sibiu', 'Mediaș', 'Cisnădie', 'Avrig', 'Agnita']
  },
  {
    county: 'Suceava',
    cities: ['Suceava', 'Fălticeni', 'Rădăuți', 'Câmpulung Moldovenesc', 'Vatra Dornei']
  },
  {
    county: 'Teleorman',
    cities: ['Alexandria', 'Turnu Măgurele', 'Roșiori de Vede', 'Zimnicea', 'Videle']
  },
  {
    county: 'Timiș',
    cities: ['Timișoara', 'Lugoj', 'Sânnicolau Mare', 'Jimbolia', 'Buziaș']
  },
  {
    county: 'Tulcea',
    cities: ['Tulcea', 'Babadag', 'Măcin', 'Isaccea', 'Sulina']
  },
  {
    county: 'Vaslui',
    cities: ['Vaslui', 'Bârlad', 'Huși', 'Negrești', 'Murgeni']
  },
  {
    county: 'Vâlcea',
    cities: ['Râmnicu Vâlcea', 'Drăgășani', 'Băbeni', 'Călimănești', 'Brezoi']
  },
  {
    county: 'Vrancea',
    cities: ['Focșani', 'Adjud', 'Mărășești', 'Panciu', 'Odobești']
  }
];

interface LocationSelectorProps {
  selectedCounty: string;
  selectedCity: string;
  onCountyChange: (county: string) => void;
  onCityChange: (city: string) => void;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedCounty,
  selectedCity,
  onCountyChange,
  onCityChange,
  className = ''
}) => {
  const [isCountyOpen, setIsCountyOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const countyRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Update available cities when county changes
  useEffect(() => {
    if (selectedCounty) {
      const locationData = romanianLocations.find(
        location => location.county === selectedCounty
      );
      setAvailableCities(locationData?.cities || []);
      
      // Reset selected city if it's not in the current county
      if (selectedCity && locationData && !locationData.cities.includes(selectedCity)) {
        onCityChange('');
      }
    } else {
      setAvailableCities([]);
      if (selectedCity) {
        onCityChange('');
      }
    }
  }, [selectedCounty, onCityChange, selectedCity]);

  // Handle click outside of dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countyRef.current && !countyRef.current.contains(event.target as Node)) {
        setIsCountyOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter counties based on search term
  const filteredCounties = romanianLocations
    .map(location => location.county)
    .filter(county => 
      county.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Handle county selection
  const handleCountySelect = (county: string) => {
    onCountyChange(county);
    setIsCountyOpen(false);
    setSearchTerm('');
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    onCityChange(city);
    setIsCityOpen(false);
  };

  // Clear selections
  const clearCountySelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCountyChange('');
    setSearchTerm('');
  };

  const clearCitySelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCityChange('');
  };

  return (
    <div className={`flex flex-col md:flex-row gap-3 ${className}`}>
      {/* County Selector */}
      <div ref={countyRef} className="relative w-full">
        <div
          className="flex items-center justify-between w-full px-4 py-3 border rounded-lg cursor-pointer hover:border-indigo-300"
          onClick={() => setIsCountyOpen(!isCountyOpen)}
        >
          <div className="flex items-center">
            <MapPin size={18} className="text-gray-400 mr-2" />
            {selectedCounty ? (
              <span className="text-gray-800">{selectedCounty}</span>
            ) : (
              <span className="text-gray-500">Selectează județul</span>
            )}
          </div>
          <div className="flex items-center">
            {selectedCounty && (
              <button
                type="button"
                onClick={clearCountySelection}
                className="p-1 hover:bg-gray-100 rounded-full mr-1"
              >
                <X size={14} className="text-gray-500" />
              </button>
            )}
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isCountyOpen ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {isCountyOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg">
            <div className="p-2">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Caută județ..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredCounties.length > 0 ? (
                filteredCounties.map((county) => (
                  <div
                    key={county}
                    className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                      selectedCounty === county ? 'bg-indigo-100' : ''
                    }`}
                    onClick={() => handleCountySelect(county)}
                  >
                    {county}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">Niciun județ găsit</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* City Selector */}
      <div ref={cityRef} className="relative w-full">
        <div
          className={`flex items-center justify-between w-full px-4 py-3 border rounded-lg ${
            !selectedCounty
              ? 'bg-gray-100 cursor-not-allowed text-gray-400'
              : 'cursor-pointer hover:border-indigo-300'
          }`}
          onClick={() => {
            if (selectedCounty) {
              setIsCityOpen(!isCityOpen);
            }
          }}
        >
          <div className="flex items-center">
            <MapPin size={18} className="text-gray-400 mr-2" />
            {selectedCity ? (
              <span className="text-gray-800">{selectedCity}</span>
            ) : (
              <span className="text-gray-500">
                {selectedCounty ? 'Selectează orașul' : 'Selectează mai întâi județul'}
              </span>
            )}
          </div>
          <div className="flex items-center">
            {selectedCity && (
              <button
                type="button"
                onClick={clearCitySelection}
                className="p-1 hover:bg-gray-100 rounded-full mr-1"
              >
                <X size={14} className="text-gray-500" />
              </button>
            )}
            {selectedCounty && (
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform duration-200 ${
                  isCityOpen ? 'transform rotate-180' : ''
                }`}
              />
            )}
          </div>
        </div>

        {isCityOpen && selectedCounty && (
          <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg">
            <div className="max-h-60 overflow-y-auto">
              {availableCities.length > 0 ? (
                availableCities.map((city) => (
                  <div
                    key={city}
                    className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                      selectedCity === city ? 'bg-indigo-100' : ''
                    }`}
                    onClick={() => handleCitySelect(city)}
                  >
                    {city}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">Niciun oraș disponibil</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
