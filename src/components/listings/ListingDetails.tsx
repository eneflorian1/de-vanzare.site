'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import MessageDialog from '@/components/messages/MessageDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Euro, PoundSterling, Heart, Share2, Flag, Phone, Mail, MapPin, Clock, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import toast from 'react-hot-toast';
import NoImagePlaceholder from '@/components/ui/NoImagePlaceholder';
import Image from 'next/image';

interface ListingDetailsProps {
  listing: {
    id: number;
    title: string;
    price: number;
    currency: string;
    location: {
      city: string;
      county: string;
    };
    createdAt: Date;
    description: string;
    condition: string;
    negotiable: boolean;
    slug: string;
    viewsCount: number;
    images: {
      id: number;
      imageUrl: string;
      isPrimary: boolean;
      order: number;
    }[];
    user: {
      id: number;
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      createdAt: Date;
      avatar?: string;
    };
  };
}

// Currency icon component
const CurrencyIcon = ({ currency }: { currency: string }) => {
  switch(currency) {
    case 'EUR': return <Euro className="h-5 w-5" />;
    case 'USD': return <DollarSign className="h-5 w-5" />;
    case 'GBP': return <PoundSterling className="h-5 w-5" />;
    default: return <span className="text-sm font-medium">RON</span>;
  }
};

const ListingDetails = ({ listing }: ListingDetailsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isFromAdmin, setIsFromAdmin] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [viewsCount, setViewsCount] = useState(listing.viewsCount || 0);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  useEffect(() => {
    // Verificăm dacă utilizatorul vine din admin panel
    const admin = searchParams.get('admin');
    if (admin === 'true' && session?.user?.role === 'ADMIN') {
      setIsFromAdmin(true);
    }

    // Incrementăm contorul de vizualizări când componenta este montată
    const incrementViewCount = async () => {
      try {
        const response = await fetch(`/api/listings/view/${listing.id}`, {
          method: 'POST',
        });
        
        if (response.ok) {
          const data = await response.json();
          setViewsCount(data.viewsCount);
        }
      } catch (error) {
        console.error('Error incrementing view count:', error);
      }
    };

    // Incrementăm doar dacă nu suntem în modul admin
    if (!isFromAdmin) {
      incrementViewCount();
    }
  }, [listing.id, searchParams, session, isFromAdmin]);

  // Verificăm dacă avem imagini
  const hasImages = listing.images && listing.images.length > 0;
  const currentImage = hasImages ? listing.images[currentImageIndex] : null;

  const nextImage = () => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleFavoriteClick = async () => {
    if (!session?.user) {
      toast.error('Trebuie să fii autentificat pentru a adăuga la favorite');
      router.push('/auth/login');
      return;
    }
    await toggleFavorite(listing.id);
  };

  const handleContactClick = () => {
    if (!session?.user) {
      toast.error('Trebuie să fii autentificat pentru a contacta vânzătorul');
      router.push('/auth/login');
      return;
    }
    setIsMessageDialogOpen(true);
  };

  const handleReportClick = () => {
    if (!session?.user) {
      toast.error('Trebuie să fii autentificat pentru a raporta un anunț');
      router.push('/auth/login');
      return;
    }
    // Implementare raportare
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/anunturi/${listing.slug}`;
    const shareTitle = listing.title;
    const shareText = `${listing.title} - ${formatPrice(listing.price)} ${listing.currency}`;
    
    try {
      if (navigator.share) {
        // Pentru dispozitive mobile
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Mulțumim pentru distribuire!');
      } else {
        // Fallback pentru desktop - copiere în clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link-ul a fost copiat în clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('A apărut o eroare la distribuire');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isFromAdmin && (
        <div className="max-w-6xl mx-auto mb-4">
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        {/* Galerie Foto */}
        <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
          {hasImages && currentImage ? (
            <>
              <motion.img
                key={currentImageIndex}
                src={currentImage.imageUrl.startsWith('/') 
                  ? `${typeof window !== 'undefined' ? window.location.origin : ''}${currentImage.imageUrl}` 
                  : currentImage.imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  // În caz de eroare, încărcăm o imagine implicită
                  const target = e.target as HTMLImageElement;
                  console.error(`Failed to load image: ${target.src}`);
                  target.src = '/images/default-listing.jpg';
                }}
              />
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full min-h-[400px]">
              <NoImagePlaceholder className="w-full h-full" variant="product" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Detalii principale */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{listing.title}</h1>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleFavoriteClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-full ${
                      isFavorite(listing.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className="w-6 h-6" fill={isFavorite(listing.id) ? "currentColor" : "none"} />
                  </motion.button>
                  <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <Share2 className="w-6 h-6" />
                  </motion.button>
                  <motion.button
                    onClick={handleReportClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <Flag className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <h2 className="text-3xl font-bold text-indigo-600 flex items-center gap-2">
                  <CurrencyIcon currency={listing.currency} />
                  {formatPrice(listing.price)}
                  {listing.negotiable && <span className="text-sm ml-2">(Negociabil)</span>}
                </h2>
                <span className="text-gray-500">•</span>
                <div className="flex items-center text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  {listing.location.city}, {listing.location.county}
                </div>
                <span className="text-gray-500">•</span>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(listing.createdAt).toLocaleDateString('ro-RO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-gray-500 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm">
                  {viewsCount} {viewsCount === 1 ? 'vizualizare' : 'vizualizări'}
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Descriere</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
                
                <h3 className="text-xl font-semibold">Detalii</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                    Stare: {listing.condition}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar cu informații contact */}
          <div className="space-y-6">
            <motion.div 
              className="bg-white rounded-lg p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-semibold mb-4">Informații vânzător</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 mr-3 relative overflow-hidden rounded-full">
                    {listing.user.avatar ? (
                      <Image 
                        src={listing.user.avatar} 
                        alt={`${listing.user.firstName} ${listing.user.lastName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <NoImagePlaceholder variant="user" className="w-full h-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{listing.user.firstName} {listing.user.lastName}</p>
                    <p className="text-sm text-gray-500">
                      Membru din {new Date(listing.user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {showPhoneNumber ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{listing.user.phone}</span>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg flex items-center justify-center space-x-2"
                    onClick={() => setShowPhoneNumber(true)}
                  >
                    <Phone className="w-5 h-5" />
                    <span>Afișează numărul de telefon</span>
                  </motion.button>
                )}

                {session?.user?.email !== listing.user.email ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 border border-indigo-600 text-indigo-600 rounded-lg flex items-center justify-center space-x-2"
                    onClick={handleContactClick}
                  >
                    <Mail className="w-5 h-5" />
                    <span>Trimite mesaj</span>
                  </motion.button>
                ) : null}

                {/* Dialog de mesaje */}
                {isMessageDialogOpen && (
                  <MessageDialog
                    isOpen={isMessageDialogOpen}
                    onClose={() => setIsMessageDialogOpen(false)}
                    receiverId={listing.user.id}
                    listingId={listing.id}
                    listingTitle={listing.title}
                  />
                )}
              </div>
            </motion.div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Sfaturi de siguranță</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Întâlnește vânzătorul în locuri publice</li>
                <li>• Verifică produsul înainte de cumpărare</li>
                <li>• Nu trimite bani în avans</li>
                <li>• Raportează anunțurile suspecte</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ListingDetails;