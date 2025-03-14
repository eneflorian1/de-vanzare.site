import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getImagePath } from '@/lib/imageUtils';
import { DollarSign, Euro, PoundSterling } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Listing, ListingImage, Category, Location } from '@prisma/client';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getListing(slug: string) {
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      images: true,
      category: true,
      location: true,
    },
  });

  if (!listing) {
    return null;
  }

  return {
    ...listing,
    price: Number(listing.price),
    location: {
      ...listing.location,
    }
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

export default async function ListingPage({ params }: PageProps) {
  const listing = await getListing(params.slug);

  if (!listing) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="space-y-4">
            <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
              {listing.images[0] && (
                <Image
                  src={getImagePath(listing.images[0].imageUrl)}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {listing.images.slice(1).map((image) => (
                <div key={image.id} className="aspect-square relative rounded-lg overflow-hidden">
                  <Image
                    src={getImagePath(image.imageUrl)}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <div className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <CurrencyIcon currency={listing.currency} />
              {formatPrice(listing.price)}
            </div>
            <div className="text-gray-600">
              <p><strong>Locație:</strong> {listing.location.city}, {listing.location.county}</p>
              <p><strong>Categorie:</strong> {listing.category.name}</p>
            </div>
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-2">Descriere</h2>
              <p>{listing.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}