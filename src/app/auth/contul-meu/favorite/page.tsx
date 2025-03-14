'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Clock, MapPin, Tag, Heart } from 'lucide-react';
import Link from 'next/link';

interface Image {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

interface Listing {
  id: number;
  title: string;
  price: number;
  description: string;
  status: string;
  viewsCount: number;
  createdAt: string;
  images: Image[];
  category: {
    name: string;
  };
  location: {
    city: string;
    county: string;
  };
}

export default function FavoritePage() {
  const [favorite, setFavorite] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorite() {
      try {
        const response = await fetch('/api/favorite');
        if (response.ok) {
          const data = await response.json();
          setFavorite(data);
        }
      } catch (error) {
        console.error('Error fetching favorite:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorite();
  }, []);

  const handleRemoveFavorite = async (id: number) => {
    try {
      const response = await fetch(`/api/favorite/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorite(favorite.filter(anunt => anunt.id !== id));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Anunțuri favorite</h1>
      {favorite.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Nu ai niciun anunț favorit.</p>
          <Link
            href="/anunturi"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Explorează anunțuri
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {favorite.map((anunt) => (
            <motion.div
              key={anunt.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-64 h-48 relative">
                  <img
                    src={anunt.images.find(img => img.isPrimary)?.imageUrl || '/placeholder.png'}
                    alt={anunt.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm flex items-center">
                    <Eye size={16} className="mr-1" />
                    {anunt.viewsCount}
                  </div>
                </div>

                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link 
                        href={`/anunturi/${anunt.id}`}
                        className="text-xl font-semibold text-gray-800 mb-2 hover:text-indigo-600"
                      >
                        {anunt.title}
                      </Link>
                      <p className="text-2xl font-bold text-indigo-600 mb-2">
                        {anunt.price.toLocaleString()} RON
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      onClick={() => handleRemoveFavorite(anunt.id)}
                    >
                      <Heart size={20} fill="currentColor" />
                    </motion.button>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{anunt.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {new Date(anunt.createdAt).toLocaleDateString('ro-RO')}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {anunt.location.city}, {anunt.location.county}
                    </div>
                    <div className="flex items-center">
                      <Tag size={16} className="mr-1" />
                      {anunt.category.name}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}