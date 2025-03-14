'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Grid, List, ChevronDown, Sliders, MapPin } from 'lucide-react';

interface CategoryListingsProps {
  category: string;
}

const CategoryListings = ({ category }: CategoryListingsProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');

  // Mock data - în producție ar veni din API
  const listings = [
    {
      id: 1,
      title: "BMW Seria 5 2023",
      price: "45.000 €",
      location: "București, Sector 1",
      image: "/api/placeholder/400/300",
      date: "Acum 2 zile",
      description: "BMW Seria 5 în stare impecabilă, primul proprietar...",
      features: ["2023", "15.000 km", "Hybrid"]
    },
    // ... alte anunțuri
  ];

  const filters = {
    price: {
      min: "",
      max: ""
    },
    features: [] as string[],
    location: "" as string
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Categorie */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Anunțuri în categoria {category}
          </h1>
          <p className="text-gray-600">
            {listings.length} anunțuri găsite
          </p>
        </div>

        {/* Filtre și Sortare */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg"
              >
                <Sliders size={20} />
                <span>Filtre</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                <MapPin size={20} />
                <span>Locație</span>
              </motion.button>
            </div>

            <div className="flex items-center space-x-4">
              <select 
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Cele mai recente</option>
                <option value="price_asc">Preț crescător</option>
                <option value="price_desc">Preț descrescător</option>
              </select>

              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button 
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={20} />
                </button>
                <button 
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de anunțuri */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
            >
              <div className={`flex ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}>
                <div className={`${viewMode === 'list' ? 'w-1/3' : 'w-full'}`}>
                  <img 
                    src={listing.image} 
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className={`p-4 ${viewMode === 'list' ? 'w-2/3' : 'w-full'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {listing.title}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Heart size={20} />
                    </motion.button>
                  </div>
                  <p className="text-gray-600 mb-2">{listing.location}</p>
                  {viewMode === 'list' && (
                    <p className="text-gray-600 mb-4">{listing.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {listing.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-indigo-600">
                      {listing.price}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {listing.date}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Paginare */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                className={`w-10 h-10 rounded-lg ${
                  page === 1 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListings; 