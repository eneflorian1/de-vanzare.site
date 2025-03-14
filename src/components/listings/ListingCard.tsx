'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Listing, ListingImage, Category, Location } from '@prisma/client';
import { getImagePath } from '@/lib/imageUtils';
import { DollarSign, Euro, PoundSterling } from 'lucide-react';

interface ListingCardProps {
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
    images: {
      id: number;
      imageUrl: string;
      isPrimary: boolean;
    }[];
    slug: string;
  };
  priority?: boolean;
}

export default function ListingCard({ listing, priority = false }: ListingCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.error('Trebuie să fii autentificat pentru a adăuga la favorite');
      router.push('/auth/login');
      return;
    }

    await toggleFavorite(listing.id);
  };

  return (
    <Link href={`/anunturi/${listing.slug}`}>
      <motion.div
        className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative aspect-[4/3]">
          <div className="relative w-full h-full">
            <Image
              src={listing.images && listing.images.length > 0 ? listing.images[0].imageUrl : '/images/default-listing.jpg'}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={false}
            />
            {(!listing.images || listing.images.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-2xl font-bold drop-shadow-lg">Fără Imagini</p>
              </div>
            )}
          </div>
          <motion.button
            onClick={handleFavoriteClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`absolute top-2 right-2 p-2 rounded-full z-30 ${
              isFavorite(listing.id)
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-5 h-5" fill={isFavorite(listing.id) ? "currentColor" : "none"} />
          </motion.button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
            {listing.title}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg font-bold text-indigo-600">
              {formatPrice(listing.price)} {listing.currency}
            </p>
          </div>

          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{listing.location.city}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}