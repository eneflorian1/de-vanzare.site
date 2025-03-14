import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ListingDetails from '@/components/listings/ListingDetails';
import { Decimal } from '@prisma/client/runtime/library';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getListing(slug: string) {
  try {
    // Folosim SQL raw pentru a obține anunțul și relațiile sale
    const query = `
      SELECT 
        l.id, l.title, l.description, l.price, l.currency, l.condition, 
        l.status, l.viewsCount, l.negotiable, l.createdAt, l.updatedAt, l.slug,
        l.userId, l.categoryId, l.locationId,
        c.name as categoryName, c.slug as categorySlug,
        loc.city, loc.county,
        u.id as userId, u.firstName, u.lastName, u.email, u.phone, u.createdAt as userCreatedAt,
        u.avatar as userAvatar
      FROM listing l
      JOIN category c ON l.categoryId = c.id
      JOIN location loc ON l.locationId = loc.id
      JOIN user u ON l.userId = u.id
      WHERE l.slug = ?
      LIMIT 1
    `;

    const listings = await prisma.$queryRawUnsafe(query, slug);
    const listingArray = listings as any[];
    
    if (listingArray.length === 0) {
      return null;
    }

    const listing = listingArray[0];

    // Obținem imaginile pentru anunț
    const imagesQuery = `
      SELECT id, imageUrl, isPrimary, \`order\`
      FROM image
      WHERE listingId = ?
    `;
    
    const images = await prisma.$queryRawUnsafe(imagesQuery, listing.id);

    // Obținem și imaginile din tabelul listingimage
    const listingImagesQuery = `
      SELECT id, imageUrl, isPrimary, \`order\`
      FROM listingimage
      WHERE listingId = ?
    `;
    
    const listingImages = await prisma.$queryRawUnsafe(listingImagesQuery, listing.id);

    // Combinăm imaginile din ambele tabele
    const combinedImages = [
      ...(images as any[]).map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary === 1,
        order: img.order || 0
      })),
      ...(listingImages as any[]).map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary === 1,
        order: img.order || 0
      }))
    ];

    // Construim obiectul final cu structura așteptată de componenta ListingDetails
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: parseFloat(listing.price.toString()),
      currency: listing.currency,
      condition: listing.condition,
      status: listing.status,
      viewsCount: listing.viewsCount,
      negotiable: listing.negotiable === 1,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      slug: listing.slug,
      images: combinedImages,
      category: {
        id: listing.categoryId,
        name: listing.categoryName,
        slug: listing.categorySlug
      },
      location: {
        city: listing.city,
        county: listing.county
      },
      user: {
        id: listing.userId,
        firstName: listing.firstName,
        lastName: listing.lastName,
        email: listing.email,
        phone: listing.phone,
        createdAt: listing.userCreatedAt,
        avatar: listing.userAvatar || null
      }
    };
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

export default async function ListingPage({ params }: PageProps) {
  const listing = await getListing(params.slug);

  if (!listing) {
    notFound();
  }

  return <ListingDetails listing={listing} />;
}