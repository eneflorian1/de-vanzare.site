import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { id, token } = await request.json();
    
    if (!id || !token) {
      return NextResponse.json(
        { error: 'ID-ul anunțului și token-ul sunt obligatorii' },
        { status: 400 }
      );
    }
    
    const listingId = parseInt(id);
    
    if (isNaN(listingId)) {
      return NextResponse.json(
        { error: 'ID-ul anunțului trebuie să fie un număr' },
        { status: 400 }
      );
    }
    
    // Verificăm dacă există un token valid pentru acest anunț
    const validationRecord = await prisma.listingvalidation.findFirst({
      where: {
        listingId,
        token,
        validated: false,
        expiresAt: {
          gt: new Date() // Token-ul nu a expirat
        }
      }
    });
    
    if (!validationRecord) {
      return NextResponse.json(
        { error: 'Token de validare invalid sau expirat' },
        { status: 400 }
      );
    }
    
    // Obținem anunțul
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Anunțul nu a fost găsit' },
        { status: 404 }
      );
    }
    
    // Actualizăm statusul anunțului la ACTIVE
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: { status: 'ACTIVE' }
    });
    
    // Marcăm token-ul ca validat
    await prisma.listingvalidation.update({
      where: { id: validationRecord.id },
      data: { validated: true }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Anunțul tău a fost validat cu succes și este acum activ!',
      slug: updatedListing.slug
    });
  } catch (error) {
    console.error('Error validating listing:', error);
    return NextResponse.json(
      { 
        error: 'A apărut o eroare la validarea anunțului',
        details: error instanceof Error ? error.message : 'Eroare necunoscută'
      },
      { status: 500 }
    );
  }
} 