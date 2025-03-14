import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { Listing, Favorite, Image, Category, Location } from '@prisma/client';

// Definim tipurile pentru a evita erorile de linter
interface ListingWithRelations extends Listing {
  category: Category;
  location: Location;
  image: Image[];
}

interface FavoriteWithRelations extends Favorite {
  listing: ListingWithRelations;
}

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(token.sub || '0');

    // Obținem anunțurile favorite
    // Folosim any pentru a evita erorile de linter cu Prisma
    const favorites = await prisma.$queryRaw`
      SELECT 
        f.id as favoriteId, 
        l.id, l.title, l.price, l.description, l.status, l.viewsCount, l.createdAt,
        c.name as categoryName,
        loc.city, loc.county,
        i.id as imageId, i.imageUrl, i.isPrimary
      FROM favorite f
      JOIN listing l ON f.listingId = l.id
      JOIN category c ON l.categoryId = c.id
      JOIN location loc ON l.locationId = loc.id
      LEFT JOIN image i ON l.id = i.listingId
      WHERE f.userId = ${userId}
      ORDER BY f.createdAt DESC
    `;

    // Procesăm rezultatele pentru a grupa imaginile pe anunțuri
    const anunturiMap = new Map();
    
    for (const row of favorites as any[]) {
      if (!anunturiMap.has(row.id)) {
        anunturiMap.set(row.id, {
          id: row.id,
          title: row.title,
          price: parseFloat(row.price),
          description: row.description,
          status: row.status,
          viewsCount: row.viewsCount,
          createdAt: row.createdAt.toISOString(),
          images: [],
          category: {
            name: row.categoryName
          },
          location: {
            city: row.city,
            county: row.county
          }
        });
      }
      
      // Adăugăm imaginea doar dacă există
      if (row.imageId) {
        const anunt = anunturiMap.get(row.id);
        // Verificăm să nu adăugăm aceeași imagine de mai multe ori
        if (!anunt.images.some((img: any) => img.id === row.imageId)) {
          anunt.images.push({
            id: row.imageId,
            imageUrl: row.imageUrl,
            isPrimary: row.isPrimary === 1 // Convertim din 0/1 în boolean
          });
        }
      }
    }
    
    const anunturiFavorite = Array.from(anunturiMap.values());

    return NextResponse.json(anunturiFavorite);
  } catch (error) {
    console.error('Error fetching favorite:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request as any });

    if (!token) {
      return NextResponse.json(
        { error: 'Neautorizat' },
        { status: 401 }
      );
    }

    const userId = parseInt(token.sub || '0');
    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json(
        { error: 'ID-ul anunțului este obligatoriu' },
        { status: 400 }
      );
    }

    // Verificăm dacă anunțul există
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Anunțul nu a fost găsit' },
        { status: 404 }
      );
    }

    // Verificăm dacă anunțul este deja favorit
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: userId,
          listingId: listingId
        }
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Anunțul este deja în lista de favorite' },
        { status: 400 }
      );
    }

    // Adăugăm anunțul la favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: userId,
        listingId: listingId
      }
    });

    // Creăm o notificare pentru proprietarul anunțului
    if (listing.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: listing.userId,
          type: 'FAVORITE',
          title: 'Anunț adăugat la favorite',
          content: `Cineva a adăugat anunțul tău "${listing.title}" la favorite`,
          relatedId: listingId
        }
      });
    }

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Eroare internă server' },
      { status: 500 }
    );
  }
}