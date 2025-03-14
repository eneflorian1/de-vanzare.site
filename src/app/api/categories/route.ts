import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Opțional, preluăm parametrul slug pentru a returna o categorie specifică
    const slug = searchParams.get('slug');
    // Opțional, preluăm parametrul id pentru a returna o categorie specifică
    const id = searchParams.get('id') ? parseInt(searchParams.get('id')!) : null;
    // Opțional, pentru a returna doar categoriile principale
    const mainOnly = searchParams.get('mainOnly') === 'true';
    
    // Construim query-ul pentru prisma
    let query: any = {
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    };
    
    // Dacă avem slug, căutăm după slug
    if (slug) {
      query.where.slug = slug;
    }
    
    // Dacă avem id, căutăm după id
    if (id) {
      query.where.id = id;
    }
    
    // Dacă vrem doar categoriile principale
    if (mainOnly) {
      query.where.parentId = null;
    }
    
    // Preluăm categoriile din baza de date
    const categories = await prisma.category.findMany(query);
    
    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
