import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/listings/view/[id] - Incrementează numărul de vizualizări pentru un anunț
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = parseInt(params.id);
    
    if (isNaN(listingId)) {
      return NextResponse.json({ error: 'ID anunț invalid' }, { status: 400 });
    }

    // Verificăm dacă anunțul există
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Anunț negăsit' }, { status: 404 });
    }

    // Incrementăm contorul de vizualizări
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: { viewsCount: { increment: 1 } },
      select: { viewsCount: true }
    });

    return NextResponse.json({ 
      success: true, 
      viewsCount: updatedListing.viewsCount 
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: 'Eroare internă server' },
      { status: 500 }
    );
  }
} 