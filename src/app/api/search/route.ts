import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { isValidCurrency } from '@/lib/currency-helpers';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    console.log('Raw search URL:', request.url);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    
    // Extrageți parametrii de căutare
    const query = searchParams.get('query') || '';
    const categorySlug = searchParams.get('category') || undefined;
    const minPriceStr = searchParams.get('minPrice');
    const maxPriceStr = searchParams.get('maxPrice');
    const city = searchParams.get('city') || undefined;
    const county = searchParams.get('county') || undefined;
    const sortBy = searchParams.get('sortBy') || 'recent';
    const premium = searchParams.get('premium') === 'true';
    
    // Validare și conversie pentru prețuri
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    
    try {
      if (minPriceStr) {
        minPrice = parseFloat(minPriceStr);
        if (isNaN(minPrice) || minPrice < 0) {
          throw new Error('Preț minim invalid');
        }
      }
      
      if (maxPriceStr) {
        maxPrice = parseFloat(maxPriceStr);
        if (isNaN(maxPrice) || maxPrice < 0) {
          throw new Error('Preț maxim invalid');
        }
      }
      
      // Verifică dacă prețul minim este mai mare decât cel maxim
      if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
        throw new Error('Prețul minim nu poate fi mai mare decât prețul maxim');
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Eroare la validarea prețurilor'
      }, { status: 400 });
    }
    
    // Construim condițiile WHERE pentru SQL
    let whereConditions = "WHERE l.status IN ('ACTIVE', 'PENDING')";
    const params: any[] = [];
    
    // Adăugăm condiția pentru premium dacă e specificată
    if (premium) {
      whereConditions += " AND l.isPremium = 1";
    }
    
    // Adăugăm condiția pentru căutare text
    if (query && query.trim() !== '') {
      whereConditions += " AND (l.title LIKE ? OR l.description LIKE ?)";
      const searchTerm = `%${query.trim()}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // Adăugăm condiția pentru categorie
    if (categorySlug && categorySlug !== 'toate') {
      whereConditions += " AND c.slug = ?";
      params.push(categorySlug);
    }
    
    // Adăugăm condițiile pentru preț
    if (minPrice !== undefined) {
      whereConditions += " AND l.price >= ?";
      params.push(minPrice);
    }
    
    if (maxPrice !== undefined) {
      whereConditions += " AND l.price <= ?";
      params.push(maxPrice);
    }
    
    // Adăugăm condiția pentru locație
    if (city && county) {
      whereConditions += " AND loc.city = ? AND loc.county = ?";
      params.push(city, county);
    }
    
    // Determinăm ordinea de sortare
    let orderBy = "";
    switch (sortBy) {
      case 'price_asc':
        orderBy = "ORDER BY l.price ASC";
        break;
      case 'price_desc':
        orderBy = "ORDER BY l.price DESC";
        break;
      case 'popular':
        orderBy = "ORDER BY l.viewsCount DESC";
        break;
      default:
        orderBy = "ORDER BY l.createdAt DESC";
    }
    
    // Construim și executăm interogarea SQL
    const query1 = `
      SELECT 
        l.id, l.title, l.description, l.price, l.currency, l.condition, 
        l.status, l.viewsCount, l.negotiable, l.createdAt, l.updatedAt,
        l.userId, l.categoryId, l.locationId, l.slug,
        c.name as categoryName, c.slug as categorySlug,
        loc.city, loc.county,
        u.firstName, u.lastName, u.email, u.phone
      FROM listing l
      JOIN category c ON l.categoryId = c.id
      JOIN location loc ON l.locationId = loc.id
      JOIN user u ON l.userId = u.id
      ${whereConditions}
      ${orderBy}
      LIMIT 100
    `;
    
    const listings = await prisma.$queryRawUnsafe(query1, ...params);
    
    // Obținem ID-urile anunțurilor pentru a face interogări separate pentru imagini
    const listingIds = (listings as any[]).map(l => l.id);
    
    // Nu avem anunțuri, returnăm un array gol
    if (listingIds.length === 0) {
      return NextResponse.json({
        success: true,
        listings: []
      });
    }
    
    // Obținem imaginile pentru anunțuri
    const query2 = `
      SELECT id, listingId, imageUrl, isPrimary, \`order\`
      FROM image
      WHERE listingId IN (${listingIds.map(() => '?').join(',')})
    `;
    
    const images = await prisma.$queryRawUnsafe(query2, ...listingIds);
    
    // Obținem și imaginile din tabelul listingimage
    const query3 = `
      SELECT id, listingId, imageUrl, isPrimary, \`order\`
      FROM listingimage
      WHERE listingId IN (${listingIds.map(() => '?').join(',')})
    `;
    
    const listingImages = await prisma.$queryRawUnsafe(query3, ...listingIds);
    
    // Combinăm datele pentru a crea răspunsul
    const formattedListings = (listings as any[]).map(listing => {
      // Găsim toate imaginile pentru acest anunț
      const combinedImages = [
        ...(images as any[]).filter(img => img.listingId === listing.id).map(img => ({
          id: img.id,
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary === 1
        })),
        ...(listingImages as any[]).filter(img => img.listingId === listing.id).map(img => ({
          id: img.id,
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary === 1
        }))
      ];
      
      // Returnăm anunțul cu toate relațiile
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
          phone: listing.phone
        }
      };
    });
    
    return NextResponse.json({
      success: true,
      listings: formattedListings
    });
    
  } catch (error) {
    console.error('Error searching listings:', error);
    return NextResponse.json({
      success: false,
      error: 'A apărut o eroare la căutarea anunțurilor',
      details: error instanceof Error ? error.message : 'Eroare necunoscută'
    }, { status: 500 });
  }
}