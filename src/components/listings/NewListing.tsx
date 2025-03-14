'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, ImagePlus, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useCategories } from '@/components/CategoryProvider';
import AutocompleteLocationSelector from '@/components/AutocompleteLocationSelector';
import { toast } from 'react-hot-toast';

interface FormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  condition: string;
  categoryId: string;
  county: string;
  city: string;
  email: string;
  phone: string;
  negotiable: boolean;
  images: Array<{
    url: string;
    order: number;
    isPrimary: boolean;
  }>;
}

const NewListing = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [isFromAdmin, setIsFromAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // Category state
  const { mainCategories, categories, isLoading: categoriesLoading } = useCategories();
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [subcategories, setSubcategories] = useState<any[]>([]);

  // Adăugăm un state pentru locație
  const [selectedLocation, setSelectedLocation] = useState<{ city: string, county: string } | null>(null);

  // Adăugăm un efect pentru a prelua datele utilizatorului
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (sessionStatus === 'authenticated' && session?.user?.id) {
        try {
          console.log('Fetching user profile data...');
          const response = await fetch('/api/user/profile');  // Endpoint-ul corect pentru profilul utilizatorului
          if (response.ok) {
            const userData = await response.json();
            console.log('User profile data received:', userData);
            
            // Actualizăm formData cu datele din profil
            setFormData(prev => ({
              ...prev,
              phone: userData.phone || prev.phone, // Folosim phone din profil
              email: session.user.email || prev.email,
              // Adăugăm prenumele utilizatorului în titlu dacă este gol
              
            }));
            
            // Setăm locația dacă există în profil
            if (userData.city && userData.county) {
              setSelectedLocation({
                city: userData.city,
                county: userData.county
              });
            }
          } else {
            console.error('Failed to fetch profile data:', await response.text());
          }
        } catch (error) {
          console.error('Eroare la preluarea datelor profilului:', error);
        }
      }
    };

    fetchUserProfile();
  }, [session, sessionStatus]);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    currency: 'RON',
    condition: 'USED',
    categoryId: '',
    county: '',
    city: '',
    email: '',
    phone: '',
    negotiable: false,
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // When main category changes, update subcategories
  useEffect(() => {
    if (selectedMainCategory) {
      // Găsim categoria principală selectată
      const mainCat = mainCategories.find(cat => cat.id.toString() === selectedMainCategory);
      if (mainCat) {
        // Filtrăm doar subcategoriile care aparțin categoriei principale selectate
        const subs = categories.filter(cat => cat.parentId === mainCat.id);
        setSubcategories(subs);
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }, [selectedMainCategory, categories, mainCategories]);

  useEffect(() => {
    // Verificăm dacă utilizatorul vine din admin panel
    if (searchParams) {
      const admin = searchParams.get('admin');
      if (admin === 'true' && session?.user?.role === 'ADMIN') {
        setIsFromAdmin(true);
      }
    }
  }, [searchParams, session?.user?.role]);

  // Adăugăm un efect pentru a monitoriza starea de autentificare și valorile formularului
  useEffect(() => {
    console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');
    console.log('Form email value:', formData.email);
    console.log('Session email:', session?.user?.email || 'No session email');
  }, [session, formData.email]);

  // Actualizăm formData când se schimbă locația
  useEffect(() => {
    if (selectedLocation) {
      setFormData(prev => ({
        ...prev,
        city: selectedLocation.city,
        county: selectedLocation.county
      }));
    }
  }, [selectedLocation]);

  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log('Main category changed to:', value);
    setSelectedMainCategory(value);
    // Reset subcategory when main category changes
    setFormData(prev => ({
      ...prev,
      categoryId: ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Helper function to add image to form data
  const addImageToForm = (imageUrl: string) => {
    setFormData(prev => {
      const newImages = [...(prev.images || []), {
        url: imageUrl,
        order: prev.images?.length || 0,
        isPrimary: (prev.images?.length || 0) === 0
      }];
      return {
        ...prev,
        images: newImages
      };
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        setIsUploading(true);
        setError('');
        
        const files = Array.from(e.target.files);
        const remainingSlots = 10 - formData.images.length;
        const filesToProcess = files.slice(0, remainingSlots);
        
        if (files.length > remainingSlots) {
          setError(`Doar primele ${remainingSlots} imagini au fost adăugate. Maxim 10 imagini sunt permise.`);
        }

        const newImages = filesToProcess.map(file => ({
          url: URL.createObjectURL(file),
          order: formData.images.length + filesToProcess.indexOf(file),
          isPrimary: formData.images.length === 0 && filesToProcess.indexOf(file) === 0
        }));

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));
        
      } catch (error) {
        console.error('Error handling files:', error);
        setError('Eroare la procesarea imaginilor. Folosiți butonul "Imagine implicită".');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      setLoading(true);
      
      // Procesăm imaginile înainte de a trimite formularul
      let processedImages = [];
      
      // Dacă nu avem nicio imagine, folosim implicit imaginea default
      if (formData.images.length === 0) {
        processedImages = [{
          imageUrl: '/images/default-listing.jpg',
          order: 0,
          isPrimary: true
        }];
      } else {
        console.log('Procesare imagini înainte de trimitere...');
        
        // Procesăm fiecare imagine pentru a ne asigura că sunt încărcate pe server
        for (let i = 0; i < formData.images.length; i++) {
          const img = formData.images[i];
          let finalUrl = img.url;
          
          console.log(`Procesare imagine ${i+1}: ${img.url}`);
          
          // Verificăm dacă URL-ul este unul temporar (blob) sau un URL deja pe server
          if (img.url.startsWith('blob:') || img.url.startsWith('data:')) {
            try {
              // Convertim URL-ul blob într-un fișier
              const response = await fetch(img.url);
              const blob = await response.blob();
              const file = new File([blob], `image-${i}.jpg`, { type: 'image/jpeg' });
              
              console.log(`Încărcare imagine ${i+1} pe server...`);
              
              // Încărcăm imaginea pe server folosind FormData
              const uploadFormData = new FormData();
              uploadFormData.append('file', file);
              
              const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
              });
              
              if (!uploadResponse.ok) {
                throw new Error(`Eroare la încărcarea imaginii ${i+1}`);
              }
              
              const uploadData = await uploadResponse.json();
              console.log(`Răspuns de la server pentru imaginea ${i+1}:`, uploadData);
              
              if (uploadData.success && uploadData.urls && uploadData.urls.length > 0) {
                finalUrl = uploadData.urls[0];
                console.log(`URL final pentru imaginea ${i+1}:`, finalUrl);
              } else {
                throw new Error(`Nu s-a putut obține URL-ul pentru imaginea ${i+1}`);
              }
            } catch (error) {
              console.error(`Eroare la procesarea imaginii ${i}:`, error);
              // În caz de eroare, folosim imaginea default
              finalUrl = '/images/default-listing.jpg';
            }
          }
          
          processedImages.push({
            imageUrl: finalUrl,
            order: img.order,
            isPrimary: img.isPrimary
          });
        }
      }
      
      console.log('Imagini procesate:', processedImages);
      
      // Folosim URL-urile reale ale imaginilor încărcate
      const apiData = {
        ...formData,
        images: processedImages
      };

      console.log('Formatted API data:', JSON.stringify(apiData, null, 2));

      // Verificăm dacă utilizatorul este autentificat
      const isAuthenticated = sessionStatus === 'authenticated';
      
      // Adăugăm informația despre autentificare în cerere
      const endpoint = isAuthenticated ? '/api/listings' : '/api/listings/unverified';
      
      // Afișăm un toast pentru a indica că anunțul se procesează
      toast.loading('Se procesează anunțul...', { id: 'processing-listing' });
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        toast.dismiss('processing-listing');
        toast.error('Răspunsul de la server nu este în formatul așteptat');
        throw new Error('Răspunsul de la server nu este în formatul așteptat');
      }

      // Închidem toast-ul de procesare
      toast.dismiss('processing-listing');

      if (!response.ok) {
        console.error('Server returned error:', data);
        toast.error(data.details || data.error || 'Eroare la publicarea anunțului');
        throw new Error(data.details || data.error || 'Eroare la publicarea anunțului');
      }

      // Verificăm dacă răspunsul conține o redirectare
      if (data.redirectTo) {
        console.log('Redirecting to:', data.redirectTo);
        toast.success(data.message || 'Anunțul a fost creat cu succes!');
        router.push(data.redirectTo);
        return;
      }

      // Pentru utilizatori neautentificați, afișăm un mesaj despre email-ul de confirmare
      if (!isAuthenticated) {
        toast.success('Un email de confirmare a fost trimis la adresa dvs. Vă rugăm să confirmați anunțul prin link-ul din email.');
        
        // După 3 secunde, redirectăm utilizatorul către pagina de anunțuri
        setTimeout(() => {
          router.push('/anunturi?status=pending');
        }, 3000);
        
        return;
      }

      // Pentru utilizatori autentificați, afișăm un mesaj de succes și redirectăm imediat
      toast.success('Anunțul a fost publicat cu succes!');
      
      // Redirect to the newly created listing
      if (data.slug) {
        console.log('Redirecting to:', `/anunturi/${data.slug}`);
        router.push(`/anunturi/${data.slug}`);
      } else {
        console.warn('No slug in response data, redirecting to listings page');
        router.push('/anunturi');
      }
    } catch (error) {
      console.error('Error publishing listing:', error);
      toast.error(error instanceof Error ? error.message : 'Eroare la publicarea anunțului');
      setError(error instanceof Error ? error.message : 'Eroare la publicarea anunțului');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Funcție pentru gestionarea schimbării locației
  const handleLocationChange = (location: { city: string, county: string } | null) => {
    setSelectedLocation(location);
    if (location) {
      setFormData(prev => ({
        ...prev,
        city: location.city,
        county: location.county
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        city: '',
        county: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {isFromAdmin && (
          <div className="max-w-4xl mx-auto mb-4">
            <button
              onClick={() => router.push('/admin/anunturi')}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Înapoi la panou admin</span>
            </button>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Adaugă un anunț nou</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            {/* Imagini - reorganizăm designul */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-lg font-semibold text-gray-700">
                  Fotografii anunț
                </label>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image 
                      src={img.url} 
                      alt={`Imagine ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover rounded-lg"
                      onError={() => {
                        // Înlocuiește cu imagine implicită în caz de eroare
                        const newImages = [...formData.images];
                        newImages[index] = {...newImages[index], url: '/images/default-listing.jpg'};
                        setFormData({...formData, images: newImages});
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Butonul de adăugare poze se mută sub pozele deja încărcate */}
              {formData.images.length < 10 && (
                <div className="flex">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={handleUploadClick}
                    className="aspect-square w-1/2 md:w-1/4 rounded-lg border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 bg-gray-50"
                  >
                    <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                    <span className="text-sm text-gray-500">Adaugă poze</span>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                    />
                  </motion.div>
                </div>
              )}
              
              <div className="text-sm">
                <p className="text-gray-500">
                  {formData.images.length === 0 
                    ? "Adăugați cel puțin o imagine pentru anunțul dvs. (recomandat)"
                    : `${formData.images.length} ${formData.images.length === 1 ? 'imagine adăugată' : 'imagini adăugate'} (maxim 10)`
                  }
                </p>
              </div>
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
                  Categorie principală
                </label>
                {categoriesLoading ? (
                  <div className="w-full border rounded-lg p-4 flex items-center justify-center gap-2 bg-gray-50">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    <span className="text-sm text-gray-500">Se încarcă categoriile...</span>
                  </div>
                ) : (
                  <select 
                    value={selectedMainCategory}
                    onChange={handleMainCategoryChange}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Selectează o categorie principală</option>
                    {mainCategories
                      .filter(cat => !cat.parentId)  // Filtrăm doar categoriile principale
                      .filter((cat, index, self) => 
                        // Eliminăm duplicatele bazate pe nume
                        index === self.findIndex(c => c.name === cat.name)
                      )
                      // Eliminăm categoriile Auto și Electronice
                      .filter(cat => cat.name !== 'Auto' && cat.name !== 'Electronice')
                      .map(cat => (
                        <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                      ))
                    }
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Subcategorie
                </label>
                <select 
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    !selectedMainCategory ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={!selectedMainCategory || subcategories.length === 0}
                  required
                >
                  <option value="">Selectează o subcategorie</option>
                  {subcategories.map(cat => (
                    <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                  ))}
                </select>
                {selectedMainCategory && subcategories.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600">
                    Nu există subcategorii disponibile. Vă rugăm să alegeți altă categorie principală.
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  name="negotiable"
                  checked={formData.negotiable}
                  onChange={(e) => setFormData(prev => ({...prev, negotiable: e.target.checked}))}
                  className="h-5 w-5 text-indigo-600"
                />
                <label className="ml-2 text-gray-700">
                  Preț negociabil
                </label>
              </div>
            </div>

            {/* Locație - înlocuim cu AutocompleteLocationSelector */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-700">
                Locație
              </label>
              <AutocompleteLocationSelector
                selectedLocation={selectedLocation}
                onLocationChange={handleLocationChange}
                placeholder="Introdu numele localității (ex: Alexandria)"
                className="w-full"
              />
            </div>

            {/* Stare */}
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

            {/* Contact */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-700">
                Informații contact
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+4</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0760123456"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: 10 cifre (ex: 0760123456)</p>
                </div>
                <div className="relative">
                  {sessionStatus === 'authenticated' && session?.user?.email ? (
                    <>
                      <input
                        type="email"
                        name="email"
                        value={session.user.email}
                        className="w-full px-4 py-3 rounded-lg border bg-gray-100 opacity-70 cursor-not-allowed"
                        placeholder="Email"
                        disabled={true}
                        readOnly={true}
                      />
                      <div className="mt-1 text-xs text-indigo-600 font-medium">
                        * Email-ul este preluat automat din contul tău
                      </div>
                    </>
                  ) : (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Email"
                      required
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Butoane */}
            <div className="flex justify-end space-x-4 pt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-lg border hover:bg-gray-50"
                onClick={() => router.back()}
                disabled={loading || isSubmitting}
              >
                Anulează
              </motion.button>
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-3 rounded-lg bg-indigo-600 text-white ${
                  loading || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                }`}
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? 'Se procesează...' : 'Publică anunțul'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default NewListing;