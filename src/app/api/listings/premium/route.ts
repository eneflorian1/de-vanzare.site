import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/listings/premium
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    // Găsim anunțurile premium care sunt active
    const premiumListings = await prisma.listing.findMany({
      where: {
        isPremium: true,
        status: 'ACTIVE'
      },
      include: {
        category: true,
        location: true,
        image: {
          where: {
            isPrimary: true
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Formatăm datele pentru a include toate imaginile și detaliile relevante
    const formattedListings = premiumListings.map(listing => {
      const primaryImage = listing.image[0];
      
      return {
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        price: listing.price,
        currency: listing.currency,
        description: listing.description,
        location: {
          city: listing.location?.city || '',
          county: listing.location?.county || ''
        },
        category: {
          name: listing.category?.name || '',
          slug: listing.category?.slug || ''
        },
        images: [{
          id: primaryImage?.id,
          imageUrl: primaryImage?.imageUrl || '/images/default-listing.jpg',
          isPrimary: true
        }],
        createdAt: listing.createdAt
      };
    });

    return NextResponse.json(formattedListings);
  } catch (error) {
    console.error('Error fetching premium listings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 