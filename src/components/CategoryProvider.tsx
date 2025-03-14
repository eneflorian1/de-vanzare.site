'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  description: string | null;
  iconName: string | null;
  children?: Category[];
}

interface CategoryContextType {
  categories: Category[];
  mainCategories: Category[];
  isLoading: boolean;
  error: string | null;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getCategoryById: (id: number) => Category | undefined;
  getCategoryChildrenById: (id: number) => Category[];
  getCategoryChildrenBySlug: (slug: string) => Category[];
}

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  mainCategories: [],
  isLoading: true,
  error: null,
  getCategoryBySlug: () => undefined,
  getCategoryById: () => undefined,
  getCategoryChildrenById: () => [],
  getCategoryChildrenBySlug: () => []
});

export const useCategories = () => useContext(CategoryContext);

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider = ({ children }: CategoryProviderProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categories', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Eroare la preluarea categoriilor');
        }
        
        const data = await response.json();
        
        if (data.success) {
          const allCategories = data.categories || [];
          
          // Mapăm categoriile pentru a organiza structura părinte-copil
          const categoryMap = new Map();
          allCategories.forEach((cat: Category) => {
            categoryMap.set(cat.id, { ...cat, children: [] });
          });
          
          // Construim arborele de categorii
          const rootCategories: Category[] = [];
          categoryMap.forEach((cat) => {
            if (cat.parentId === null) {
              rootCategories.push(cat);
            } else {
              const parent = categoryMap.get(cat.parentId);
              if (parent) {
                parent.children = parent.children || [];
                parent.children.push(cat);
              }
            }
          });
          
          setCategories(allCategories);
          setMainCategories(rootCategories);
        } else {
          throw new Error(data.error || 'Eroare la preluarea categoriilor');
        }
      } catch (e) {
        console.error('Eroare la preluarea categoriilor:', e);
        setError(e instanceof Error ? e.message : 'Eroare la preluarea categoriilor');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Funcții utilitare pentru a obține categorii
  const getCategoryBySlug = (slug: string) => {
    return categories.find(cat => cat.slug === slug);
  };

  const getCategoryById = (id: number) => {
    return categories.find(cat => cat.id === id);
  };

  const getCategoryChildrenById = (id: number) => {
    return categories.filter(cat => cat.parentId === id);
  };

  const getCategoryChildrenBySlug = (slug: string) => {
    const category = getCategoryBySlug(slug);
    if (!category) return [];
    return getCategoryChildrenById(category.id);
  };

  const value = {
    categories,
    mainCategories,
    isLoading,
    error,
    getCategoryBySlug,
    getCategoryById,
    getCategoryChildrenById,
    getCategoryChildrenBySlug
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
