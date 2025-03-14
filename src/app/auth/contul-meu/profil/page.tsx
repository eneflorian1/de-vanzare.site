'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Upload } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import toast from 'react-hot-toast';
import NoImagePlaceholder from '@/components/ui/NoImagePlaceholder';
import AutocompleteLocationSelector from '@/components/AutocompleteLocationSelector';
import Image from 'next/image';

export default function ProfilPage() {
  const { data: session, status, update } = useSession();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    county: '',
    notifyEmail: true,
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ city: string, county: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        city: session.user.city || '',
        county: session.user.county || '',
        notifyEmail: session.user.notifyEmail ?? true,
        avatar: session.user.image || ''
      });
      
      if (session.user.city && session.user.county) {
        setSelectedLocation({
          city: session.user.city,
          county: session.user.county
        });
      }
      
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setFormData(prev => ({
          ...prev,
          ...userData
        }));
        
        if (userData.city && userData.county) {
          setSelectedLocation({
            city: userData.city,
            county: userData.county
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Nu am putut încărca datele profilului');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      toast.error('Imaginea este prea mare. Dimensiunea maximă este de 5MB.');
      return;
    }
    
    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Eroare la încărcarea imaginii');
      }
      
      const data = await response.json();
      
      // Actualizăm formData cu noua imagine
      setFormData(prev => ({
        ...prev,
        avatar: data.imageUrl
      }));
      
      // Actualizăm sesiunea cu noua imagine
      await update({
        ...session,
        user: {
          ...session?.user,
          image: data.imageUrl
        }
      });
      
      toast.success('Imaginea de profil a fost actualizată cu succes!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('A apărut o eroare la încărcarea imaginii');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validăm numărul de telefon (10 cifre)
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Numărul de telefon trebuie să conțină exact 10 cifre');
      setLoading(false);
      return;
    }
    
    try {
      // Ne asigurăm că avem datele de locație în formData
      const dataToSend = {
        ...formData,
        city: selectedLocation?.city || formData.city,
        county: selectedLocation?.county || formData.county
      };
      
      console.log('Sending profile data:', dataToSend);
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Actualizăm formData cu noile valori
      setFormData(prev => ({
        ...prev,
        ...updatedUser
      }));
      
      // Actualizăm și selectedLocation dacă există în răspuns
      if (updatedUser.city && updatedUser.county) {
        setSelectedLocation({
          city: updatedUser.city,
          county: updatedUser.county
        });
      }
      
      // Actualizăm sesiunea cu noile date
      await update({
        ...session,
        user: {
          ...session?.user,
          ...updatedUser
        }
      });
      
      toast.success('Profilul a fost actualizat cu succes!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('A apărut o eroare la actualizarea profilului');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return window.location.href = '/auth/autentificare';
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profilul meu</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {/* Imagine profil */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            {formData.avatar ? (
              <div className="w-24 h-24 rounded-full overflow-hidden relative">
                <Image
                  src={formData.avatar}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <NoImagePlaceholder className="w-24 h-24 rounded-full" variant="user" />
            )}
            <button 
              type="button"
              onClick={handleImageClick}
              className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-sm text-gray-600">
              Membru din {session?.user?.createdAt ? format(new Date(session.user.createdAt), 'MMMM yyyy', { locale: ro }) : 'recent'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date personale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prenume
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                pattern="[0-9]{10}"
                placeholder="Introduceți 10 cifre (ex: 0760123456)"
                title="Numărul de telefon trebuie să conțină exact 10 cifre"
              />
              <p className="mt-1 text-xs text-gray-500">Format: 10 cifre (ex: 0760123456)</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Locație
              </label>
              <AutocompleteLocationSelector
                selectedLocation={selectedLocation}
                onLocationChange={handleLocationChange}
                placeholder="Caută oraș sau județ..."
                className="w-full"
              />
            </div>
          </div>

          {/* Notificări */}
          <div className="bg-gray-50 p-4 rounded-md space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Preferințe notificări
            </h3>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="notifyEmail"
                  checked={formData.notifyEmail}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Vreau să primesc notificări pe email
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>Salvează modificările</span>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}