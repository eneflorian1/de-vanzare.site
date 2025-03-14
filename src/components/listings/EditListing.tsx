'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Upload, X, Trash2, ArrowLeft } from 'lucide-react';

interface EditListingProps {
  id?: string;
  slug?: string;
}

export default function EditListing({ id, slug }: EditListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isFromAdmin, setIsFromAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'RON',
    category: '',
    location: {
      county: '',
      city: ''
    },
    contact: {
      phone: '',
      email: ''
    },
    images: [] as string[]
  });

  useEffect(() => {
    // Verificăm dacă utilizatorul vine din admin panel
    const admin = searchParams.get('admin');
    if (admin === 'true' && session?.user?.role === 'ADMIN') {
      setIsFromAdmin(true);
    }
    
    if (id || slug) {
      fetchListing();
    }
  }, [id, slug, searchParams, session]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${slug || id}`);
      if (!response.ok) throw new Error('Eroare la încărcarea anunțului');
      
      const data = await response.json();
      console.log('Data received from API:', data);
      
      // Ne asigurăm că avem structura corectă pentru a evita erorile
      setListing({
        title: data.title || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        currency: data.currency || 'RON',
        category: data.category?.id || data.categoryId || '',
        location: {
          county: data.location?.county || data.county || '',
          city: data.location?.city || data.city || ''
        },
        contact: {
          phone: data.contact?.phone || data.phone || data.user?.phone || '',
          email: data.contact?.email || data.email || data.user?.email || ''
        },
        images: Array.isArray(data.images) 
          ? data.images.map(img => typeof img === 'string' ? img : img.imageUrl || img.url || '')
          : []
      });
    } catch (error) {
      toast.error('Eroare la încărcarea anunțului');
      console.error('Error fetching listing:', error);
      router.push('/anunturi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pregătim datele pentru a fi trimise către API
      const apiData = {
        title: listing.title,
        description: listing.description,
        price: parseFloat(listing.price) || 0,
        currency: listing.currency,
        category: listing.category,
        location: {
          county: listing.location?.county || '',
          city: listing.location?.city || ''
        },
        contact: {
          phone: listing.contact?.phone || '',
          email: listing.contact?.email || ''
        },
        images: listing.images
      };

      console.log('Sending data to API:', apiData);

      const response = await fetch(`/api/listings/${slug || id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la salvarea anunțului');
      }

      toast.success('Anunț actualizat cu succes');
      
      // Redirect înapoi la lista de anunțuri din admin sau la pagina anunțului
      if (isFromAdmin) {
        router.push('/admin/anunturi');
      } else {
        router.push(`/anunturi/${slug || id}`);
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error(error instanceof Error ? error.message : 'Eroare la salvarea anunțului');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const formData = new FormData();
    
    // Adăugăm toate fișierele în formData
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      setLoading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la încărcarea imaginilor');
      }

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (!data.success) {
        throw new Error('Eroare la încărcarea imaginilor');
      }

      // Adăugăm URL-urile noi la imaginile existente
      if (data.urls && Array.isArray(data.urls)) {
        setListing(prev => ({
          ...prev,
          images: [...prev.images, ...data.urls]
        }));
        toast.success(`${data.urls.length} imagini încărcate cu succes`);
      } else {
        throw new Error('Format invalid de răspuns pentru imagini');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error instanceof Error ? error.message : 'Eroare la încărcarea imaginilor');
    } finally {
      setLoading(false);
      // Resetăm input-ul pentru a putea selecta din nou aceleași fișiere
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    try {
      // Îmai excludem imaginea din lista actuală fără a face apel la server
      // deoarece vom șterge legăturile în baza de date la salvare
      setListing(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== imageUrl)
      }));
      toast.success('Imagine ștearsă din form. Se va actualiza la salvare.');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Eroare la ștergerea imaginii');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Editare anunț</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Înapoi
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Imagini */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-700">
                Fotografii anunț
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {listing.images.map((image, index) => {
                  // Construim URL-ul complet dacă este necesar
                  const imageUrl = image.startsWith('/') 
                    ? `${window.location.origin}${image}` 
                    : image;
                  
                  return (
                    <div key={index} className="relative aspect-square">
                      <img 
                        src={imageUrl} 
                        alt={`Imagine ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          // În caz de eroare, încărcăm o imagine implicită
                          const target = e.target as HTMLImageElement;
                          console.error(`Failed to load image: ${target.src}`);
                          target.src = '/images/default-listing.jpg';
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => handleImageDelete(image)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
                <div className="aspect-square rounded-lg border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 bg-gray-50 relative">
                  <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                  <span className="text-sm text-gray-500">Adaugă poze</span>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                </div>
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
                  value={listing.title}
                  onChange={(e) => setListing({...listing, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Descriere
                </label>
                <textarea
                  rows={6}
                  value={listing.description}
                  onChange={(e) => setListing({...listing, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Preț și Categorie */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Preț
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={listing.price}
                    onChange={(e) => setListing({...listing, price: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <select 
                    value={listing.currency}
                    onChange={(e) => setListing({...listing, currency: e.target.value})}
                    className="absolute right-2 top-1/2 -translate-y-1/2 border-l pl-2"
                  >
                    <option value="EUR">EUR</option>
                    <option value="RON">RON</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Categorie
                </label>
                <select 
                  value={listing.category}
                  onChange={(e) => setListing({...listing, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Selectează categorie</option>
                  <option value="auto">Auto</option>
                  <option value="imobiliare">Imobiliare</option>
                  <option value="electronice">Electronice</option>
                </select>
              </div>
            </div>

            {/* Locație */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Județ
                </label>
                <input
                  type="text"
                  value={listing.location?.county || ''}
                  onChange={(e) => setListing({
                    ...listing, 
                    location: {...(listing.location || {}), county: e.target.value}
                  })}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Oraș
                </label>
                <input
                  type="text"
                  value={listing.location?.city || ''}
                  onChange={(e) => setListing({
                    ...listing, 
                    location: {...(listing.location || {}), city: e.target.value}
                  })}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={listing.contact?.phone || ''}
                  onChange={(e) => setListing({
                    ...listing, 
                    contact: {...(listing.contact || {}), phone: e.target.value}
                  })}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={listing.contact?.email || ''}
                  onChange={(e) => setListing({
                    ...listing, 
                    contact: {...(listing.contact || {}), email: e.target.value}
                  })}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Butoane */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Anulează
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Se salvează...' : 'Salvează modificările'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}