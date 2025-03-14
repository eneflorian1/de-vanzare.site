'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Search } from 'lucide-react';
import { useCategories } from './CategoryProvider';

interface CategoryBrowserProps {
  onClose?: () => void;
}

const CategoryBrowser: React.FC<CategoryBrowserProps> = ({ onClose }) => {
  const router = useRouter();
  const { mainCategories, categories, isLoading } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(null);

  // Handle category selection and navigation
  const handleCategoryClick = (category: any) => {
    if (category.parentId === null) {
      // Main category clicked, show subcategories
      setSelectedMainCategory(category.id);
    } else {
      // Subcategory clicked, navigate to listings
      navigateToCategory(category.slug);
    }
  };

  // Navigate to listings page with category filter
  const navigateToCategory = (slug: string) => {
    router.push(`/anunturi?category=${encodeURIComponent(slug)}`);
    if (onClose) onClose();
  };

  // Get subcategories for selected main category
  const getSubcategories = (mainCategoryId: number) => {
    return categories.filter(cat => cat.parentId === mainCategoryId);
  };

  // Filter categories based on search term
  const filteredCategories = searchTerm
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Search input */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Caută categorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Search results */}
      {searchTerm && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Rezultate căutare</h3>
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredCategories.map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg hover:bg-indigo-50 cursor-pointer flex items-center justify-between"
                  onClick={() => navigateToCategory(category.slug)}
                >
                  <span className="text-gray-800">{category.name}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nicio categorie găsită pentru "{searchTerm}"</p>
          )}
        </div>
      )}

      {/* Category browser */}
      {!searchTerm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main categories list */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Categorii principale</h3>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-1">
                {mainCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg cursor-pointer ${
                      selectedMainCategory === category.id
                        ? 'bg-indigo-100 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category.name}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Subcategories */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              {selectedMainCategory
                ? mainCategories.find(cat => cat.id === selectedMainCategory)?.name || 'Subcategorii'
                : 'Selectează o categorie principală'}
            </h3>
            {selectedMainCategory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getSubcategories(selectedMainCategory).map((subcat) => (
                  <motion.div
                    key={subcat.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 rounded-lg hover:bg-indigo-50 cursor-pointer flex items-center justify-between"
                    onClick={() => navigateToCategory(subcat.slug)}
                  >
                    <span className="text-gray-800">{subcat.name}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                <p>Selectați o categorie din stânga pentru a vedea subcategoriile</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryBrowser;
