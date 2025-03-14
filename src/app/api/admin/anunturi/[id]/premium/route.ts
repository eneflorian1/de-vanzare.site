import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

// PUT /api/admin/anunturi/[id]/premium
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificăm autentificarea și drepturile de admin
    const token = await getToken({ req: request as any });
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { isPremium } = await request.json();

    // Validare
    if (typeof isPremium !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid isPremium value' },
        { status: 400 }
      );
    }

    // Verificăm dacă anunțul există
    const existingListing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Anunțul nu a fost găsit' },
        { status: 404 }
      );
    }

    // Actualizăm statusul premium al anunțului
    const updatedListing = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: { isPremium },
    });

    return NextResponse.json({
      success: true,
      message: isPremium ? 'Anunț marcat ca premium' : 'Status premium dezactivat',
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/anunturi/[id]/premium:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 