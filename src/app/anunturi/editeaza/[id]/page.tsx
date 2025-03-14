'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Upload, X, ImagePlus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface FormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  condition: string;
  categoryId: string;
  county: string;
  city: string;
  negotiable: boolean;
  images: Array<{
    id?: number;
    url: string;
    order: number;
    isPrimary: boolean;
  }>;
}

interface Category {
  id: string;
  name: string;
}

export default function EditAnuntPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    currency: 'RON',
    condition: 'USED',
    categoryId: '',
    county: '',
    city: '',
    negotiable: false,
    images: []
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (status === 'unauthenticated') {
        toast.error('Trebuie să fii autentificat pentru a edita un anunț');
        router.push('/auth/login');
        return;
      }

      if (status === 'authenticated') {
        fetchAnuntDetails();
        fetchCategories();
      }
    };

    checkAuth();
  }, [params.id, status]);

  const fetchAnuntDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Anunțul nu a fost găsit');
          router.push('/auth/contul-meu/anunturi');
          return;
        }
        throw new Error('Eroare la încărcarea anunțului');
      }
      
      const anunt = await response.json();
      
      // Verificăm dacă utilizatorul curent este proprietarul anunțului
      if (session?.user?.id !== anunt.userId && session?.user?.role !== 'ADMIN') {
        toast.error('Nu ai permisiunea de a edita acest anunț');
        router.push('/auth/contul-meu/anunturi');
        return;
      }
      
      setFormData({
        title: anunt.title || '',
        description: anunt.description || '',
        price: anunt.price.toString() || '',
        currency: anunt.currency || 'RON',
        condition: anunt.condition || 'USED',
        categoryId: anunt.categoryId?.toString() || '',
        county: anunt.location?.county || '',
        city: anunt.location?.city || '',
        negotiable: anunt.negotiable || false,
        images: anunt.images?.map((img: any) => ({
          id: img.id,
          url: img.imageUrl || img.url,
          order: img.order || 0,
          isPrimary: img.isPrimary || false
        })) || []
      });
    } catch (error) {
      console.error('Error fetching anunt details:', error);
      setError('A apărut o eroare la încărcarea anunțului');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        // Folosim categorii hardcodate în caz de eroare
        setCategories([
          { id: '1', name: 'Auto' },
          { id: '2', name: 'Imobiliare' },
          { id: '3', name: 'Electronice' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Folosim categorii hardcodate în caz de eroare
      setCategories([
        { id: '1', name: 'Auto' },
        { id: '2', name: 'Imobiliare' },
        { id: '3', name: 'Electronice' },
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result) {
          const newImages = [...formData.images];
          newImages.push({
            url: reader.result.toString(),
            order: formData.images.length,
            isPrimary: formData.images.length === 0
          });
          
          setFormData({
            ...formData,
            images: newImages
          });
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    // Dacă am șters imaginea primară și mai există imagini, setăm prima imagine ca primară
    if (formData.images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const setImageAsPrimary = (index: number) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Validăm datele
      if (!formData.title) throw new Error('Titlul este obligatoriu');
      if (!formData.description) throw new Error('Descrierea este obligatorie');
      if (!formData.price) throw new Error('Prețul este obligatoriu');
      if (!formData.categoryId) throw new Error('Categoria este obligatorie');
      if (!formData.county || !formData.city) throw new Error('Locația este obligatorie');
      if (formData.images.length === 0) throw new Error('Trebuie să adaugi cel puțin o imagine');
      
      // Formatăm datele pentru API
      const apiData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        condition: formData.condition,
        categoryId: parseInt(formData.categoryId),
        county: formData.county,
        city: formData.city,
        negotiable: formData.negotiable,
        images: formData.images.map((img) => ({
          id: img.id,
          imageUrl: img.url,
          order: img.order,
          isPrimary: img.isPrimary
        }))
      };
      
      // Trimitem cererea de actualizare
      const response = await fetch(`/api/listings/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la actualizarea anunțului');
      }
      
      toast.success('Anunț actualizat cu succes!');
      router.push('/auth/contul-meu/anunturi');
    } catch (error: any) {
      console.error('Error updating anunt:', error);
      setError(error.message || 'A apărut o eroare la actualizarea anunțului');
      toast.error(error.message || 'A apărut o eroare la actualizarea anunțului');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/auth/contul-meu/anunturi')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
          >
            <ArrowLeft className="mr-2" size={20} />
            Înapoi la anunțurile mele
          </button>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Editează anunțul</h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Imagini */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  Fotografii anunț
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={img.url}
                        alt={`Imagine ${index + 1}`}
                        width={200}
                        height={200}
                        className={`w-full h-full object-cover rounded-lg ${img.isPrimary ? 'ring-2 ring-indigo-600' : ''}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/default-listing.jpg';
                        }}
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setImageAsPrimary(index)}
                            className="bg-indigo-600 text-white rounded-full p-1 hover:bg-indigo-700"
                            title="Setează ca imagine principală"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                          title="Șterge imaginea"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {img.isPrimary && (
                        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                          Principală
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {formData.images.length < 10 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Adaugă poze</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                <p className="text-sm text-gray-500">
                  {formData.images.length === 0 
                    ? "Adăugați cel puțin o imagine pentru anunțul dvs."
                    : `${formData.images.length} ${formData.images.length === 1 ? 'imagine adăugată' : 'imagini adăugate'} (maxim 10)`}
                </p>
              </div>
              
              {/* Titlu și Descriere */}
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Titlu anunț
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: iPhone 13 Pro Max, 256GB, Stare perfectă"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Descriere
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Descrie în detaliu produsul sau serviciul tău..."
                    required
                  />
                </div>
              </div>
              
              {/* Categorie și Preț */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Categorie
                  </label>
                  <select 
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Selectează o categorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Preț
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Preț"
                      required
                    />
                    <select 
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="absolute right-2 top-1/2 -translate-y-1/2 border-l pl-2"
                    >
                      <option value="RON">RON</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Locație */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  Locație
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input 
                    type="text"
                    name="county"
                    value={formData.county}
                    onChange={handleInputChange}
                    className="px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Județul"
                    required
                  />
                  
                  <input 
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Orașul"
                    required
                  />
                </div>
              </div>
              
              {/* Stare și Negociabil */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Stare produs
                  </label>
                  <select 
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="NEW">Nou</option>
                    <option value="USED">Utilizat</option>
                    <option value="REFURBISHED">Recondiționat</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="negotiable"
                    checked={formData.negotiable}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-indigo-600"
                  />
                  <label className="ml-2 text-gray-700">
                    Preț negociabil
                  </label>
                </div>
              </div>
              
              {/* Butoane */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/auth/contul-meu/anunturi')}
                  className="px-6 py-3 rounded-lg border hover:bg-gray-50"
                  disabled={submitting}
                >
                  Anulează
                </button>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Se salvează...' : 'Salvează modificările'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}