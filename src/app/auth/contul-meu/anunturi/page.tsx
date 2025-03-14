'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Clock, MapPin, Tag, Trash2, Edit } from 'lucide-react';
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

export default function AnunturileMelePage() {
  const [anunturi, setAnunturi] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnunturi() {
      try {
        const response = await fetch('/api/anunturi/ale-mele');
        if (response.ok) {
          const data = await response.json();
          setAnunturi(data);
        }
      } catch (error) {
        console.error('Error fetching anunturi:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnunturi();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Ești sigur că vrei să ștergi acest anunț?')) {
      return;
    }

    try {
      const response = await fetch(`/api/anunturi/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnunturi(anunturi.filter(anunt => anunt.id !== id));
      }
    } catch (error) {
      console.error('Error deleting anunt:', error);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Anunțurile mele</h1>
        <motion.a
          href="/anunturi?view=nou"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Adaugă anunț nou
        </motion.a>
      </div>
      
      {anunturi.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Nu ai niciun anunț publicat încă.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {anunturi.map((anunt) => (
            <motion.div
              key={anunt.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-64 h-48 relative">
                  <img
                    src={anunt.images?.length ? (anunt.images.find(img => img.isPrimary)?.imageUrl || anunt.images[0]?.imageUrl || '/images/default-listing.jpg') : '/images/default-listing.jpg'}
                    alt={anunt.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/default-listing.jpg';
                      console.error(`Failed to load image: ${target.src}`);
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-medium flex items-center shadow-sm">
                    <Eye size={16} className="mr-1 text-indigo-600" />
                    <span>{anunt.viewsCount} {anunt.viewsCount === 1 ? 'vizualizare' : 'vizualizări'}</span>
                  </div>
                </div>

                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        {anunt.title}
                      </h2>
                      <p className="text-2xl font-bold text-indigo-600 mb-2">
                        {anunt.price.toLocaleString()} RON
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/anunturi/${anunt.slug}/edit`}
                        passHref
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <Edit size={20} />
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        onClick={() => handleDelete(anunt.id)}
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </div>
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
    </div>
  );
}