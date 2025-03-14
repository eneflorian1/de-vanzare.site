'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Grid, List, ChevronDown, Plus, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Footer from './Footer';
import { useCategories } from './CategoryProvider';
import CategoryBrowserModal from './CategoryBrowserModal';

const HomePage = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const { mainCategories, isLoading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [premiumListings, setPremiumListings] = useState<any[]>([]);
  const [loadingPremium, setLoadingPremium] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Încărcăm anunțurile premium la încărcarea paginii
    const fetchPremiumListings = async () => {
      try {
        setLoadingPremium(true);
        const response = await fetch('/api/listings/premium?limit=20');
        if (response.ok) {
          const data = await response.json();
          setPremiumListings(data);
        }
      } catch (error) {
        console.error('Eroare la încărcarea anunțurilor premium:', error);
      } finally {
        setLoadingPremium(false);
      }
    };

    fetchPremiumListings();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/anunturi?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/anunturi');
    }
  };

  const handleCategoryClick = (categorySlug: string, categoryName: string) => {
    setSelectedCategory(categorySlug);
    router.push(`/anunturi?category=${encodeURIComponent(categorySlug)}`);
  };

  // Calculează numărul total de pagini pentru anunțurile premium
  const totalPages = Math.ceil(premiumListings.length / itemsPerPage);
  
  // Obține anunțurile pentru pagina curentă
  const getCurrentListings = () => {
    const start = currentPage * itemsPerPage;
    return premiumListings.slice(start, start + itemsPerPage);
  };

  // Navigare între pagini
  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Implementează rotație automată la fiecare 7 secunde
  useEffect(() => {
    if (!loadingPremium && premiumListings.length > itemsPerPage) {
      const interval = setInterval(() => {
        goToNextPage();
      }, 7000);
      
      return () => clearInterval(interval);
    }
  }, [loadingPremium, premiumListings.length, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Background - eliminăm grid-ul și păstrăm doar gradientul */}
      <div className="absolute top-0 h-[400px] w-full z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600" />
      </div>

      {/* Hero Section */}
      <motion.section 
        className="relative pt-32 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.div
              className="relative mb-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <motion.h1 
                className="relative text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Găsește exact ce cauți
              </motion.h1>
            </motion.div>
            
            <motion.p 
              className="text-xl mb-12 text-white/90"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Mii de anunțuri verificate te așteaptă
            </motion.p>
            
            <motion.div 
              className="relative bg-white rounded-lg p-2 flex items-center shadow-xl"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <Search className="text-gray-400 w-6 h-6 ml-2" />
              <input 
                type="text" 
                placeholder="Ce cauți?"
                className="w-full px-4 py-3 outline-none text-gray-700 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <button
                onClick={handleSearch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg transition-colors font-semibold"
              >
                Caută
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Categories */}
      <section className="py-12 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Categorii populare</h2>
            <Link 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsCategoryModalOpen(true);
              }}
              className="text-indigo-600 flex items-center hover:text-indigo-800"
            >
              Vezi toate
              <ChevronDown className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoriesLoading ? (
              // Skeleton loader for categories
              [...Array(8)].map((_, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-100 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              mainCategories.slice(0, 8).map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug, category.name)}
                  className={`p-4 rounded-lg transition-all ${
                    selectedCategory === category.slug 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm opacity-80">100+ anunțuri</p>
                  </motion.div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Anunțuri Premium</h2>
            <div className="flex items-center space-x-2">
              <motion.button 
                className={`p-2 rounded-lg ${viewType === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                whileHover={{ scale: 1.1 }}
                onClick={() => setViewType('grid')}
              >
                <Grid size={20} />
              </motion.button>
              <motion.button 
                className={`p-2 rounded-lg ${viewType === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                whileHover={{ scale: 1.1 }}
                onClick={() => setViewType('list')}
              >
                <List size={20} />
              </motion.button>
            </div>
          </div>
          
          <div className="relative">
            <div className={viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'space-y-4'}>
              {loadingPremium ? (
                // Afișăm placeholder de încărcare
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="w-1/2 h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="w-full h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="w-2/3 h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
                        <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : premiumListings.length > 0 ? (
                getCurrentListings().map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <div 
                      onClick={() => router.push(`/anunturi/${listing.slug}`)}
                      className="cursor-pointer"
                    >
                      <div className="w-full h-48 relative">
                        <img 
                          src={listing.images && listing.images.length > 0 
                            ? listing.images[0].imageUrl
                            : '/images/default-listing.jpg'
                          } 
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-indigo-600 font-semibold">
                            {listing.category?.name || ''}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            className="text-gray-400 hover:text-red-500"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Logica pentru adăugare la favorite
                            }}
                          >
                            <Heart size={20} />
                          </motion.button>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                          {listing.title}
                        </h3>
                        <p className="text-gray-600 mb-2 line-clamp-1">
                          {listing.location?.city}, {listing.location?.county}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-indigo-600">
                            {new Intl.NumberFormat('ro-RO', {
                              style: 'currency',
                              currency: listing.currency
                            }).format(listing.price)}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                          >
                            Vezi detalii
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">Nu există anunțuri premium în acest moment.</p>
                </div>
              )}
            </div>
            
            {/* Butoane de navigare */}
            {premiumListings.length > itemsPerPage && (
              <>
                <button 
                  onClick={goToPrevPage}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
                >
                  <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <button 
                  onClick={goToNextPage}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
                >
                  <ChevronRight size={24} className="text-gray-700" />
                </button>
              </>
            )}
          </div>
          
          {/* Indicatori de pagină */}
          {premiumListings.length > itemsPerPage && (
            <div className="flex justify-center mt-6 space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-3 h-3 rounded-full ${
                    currentPage === index ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Vedem mai multe anunțuri */}
          <div className="mt-8 text-center">
            <Link href="/anunturi?premium=true" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Vezi toate anunțurile premium &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <Link href="/anunturi/nou">
        <motion.div
          className="fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg cursor-pointer z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center space-x-2">
            <span>Adaugă anunț</span>
            <Plus size={20} />
          </div>
        </motion.div>
      </Link>

      {/* Category Browser Modal */}
      <CategoryBrowserModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
      />

      {/* Înlocuim vechiul footer cu noul component */}
      <Footer />
    </div>
  );
};

export default HomePage;
