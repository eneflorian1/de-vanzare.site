import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/listings/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        id: Number(params.id),
      },
      include: {
        category: true,
        location: true,
        images: true,
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Anunțul nu a fost găsit' },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Eroare internă server' },
      { status: 500 }
    );
  }
}

// PUT /api/listings/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Neautorizat' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Verificăm existența anunțului și drepturile de acces
    const existingListing = await prisma.listing.findUnique({
      where: {
        id: Number(params.id),
      },
      select: {
        userId: true,
      },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Anunțul nu a fost găsit' },
        { status: 404 }
      );
    }

    if (existingListing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Neautorizat' },
        { status: 401 }
      );
    }

    // Actualizăm anunțul
    const updatedListing = await prisma.listing.update({
      where: {
        id: Number(params.id),
      },
      data: {
        title: body.title,
        description: body.description,
        price: parseFloat(body.price),
        currency: body.currency,
        category: {
          connect: {
            id: body.categoryId || body.category.id
          },
        },
        location: {
          connectOrCreate: {
            where: {
              county_city: {
                county: body.location.county,
                city: body.location.city,
              },
            },
            create: {
              county: body.location.county,
              city: body.location.city,
            },
          },
        },
        // Actualizăm pozele doar dacă au fost modificate
        ...(body.images && {
          images: {
            deleteMany: {},
            create: body.images.map((imageUrl: string) => ({
              imageUrl,
            })),
          },
        }),
        updatedAt: new Date(),
      },
      include: {
        category: true,
        location: true,
        images: true,
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true
          },
        },
      },
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Eroare internă server' },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Neautorizat' },
        { status: 401 }
      );
    }

    // Verificăm existența anunțului și drepturile de acces
    const existingListing = await prisma.listing.findUnique({
      where: {
        id: Number(params.id),
      },
      select: {
        userId: true,
        images: true,
      },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Anunțul nu a fost găsit' },
        { status: 404 }
      );
    }

    if (existingListing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Neautorizat' },
        { status: 401 }
      );
    }

    // Ștergem anunțul și toate resursele asociate
    await prisma.$transaction([
      // Ștergem imaginile
      prisma.listingImage.deleteMany({
        where: {
          listingId: Number(params.id),
        },
      }),
      // Ștergem favoritele
      prisma.favorite.deleteMany({
        where: {
          listingId: Number(params.id),
        },
      }),
      // Ștergem mesajele
      prisma.message.deleteMany({
        where: {
          listingId: Number(params.id),
        },
      }),
      // Ștergem anunțul
      prisma.listing.delete({
        where: {
          id: Number(params.id),
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Eroare internă server' },
      { status: 500 }
    );
  }
}
