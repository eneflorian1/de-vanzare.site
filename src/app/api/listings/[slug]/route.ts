import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        slug: params.slug,
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

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Neautorizat' },
        { status: 401 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { slug: params.slug },
      select: { userId: true }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Anunțul nu a fost găsit' },
        { status: 404 }
      );
    }

    if (listing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Neautorizat' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received update data:', body);

    // Normalizăm datele pentru a asigura structura corectă
    const updateData: any = {
      title: body.title,
      description: body.description,
      price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      currency: body.currency,
      // Tratăm categoria, folosind id-ul din body.category sau direct body.categoryId
      category: {
        connect: {
          id: body.categoryId || body.category || (body.category && body.category.id)
        },
      },
      // Tratăm locația, folosind county și city din body.location
      location: {
        connectOrCreate: {
          where: {
            county_city: {
              county: body.location?.county || body.county,
              city: body.location?.city || body.city,
            },
          },
          create: {
            county: body.location?.county || body.county,
            city: body.location?.city || body.city,
          },
        },
      },
      // Tratăm imaginile
      images: {
        deleteMany: {},  // Ștergem imaginile existente
        create: (body.images || []).map((imageUrl: string) => ({
          imageUrl,
        })),
      },
      updatedAt: new Date(),
    };

    console.log('Normalized update data:', updateData);

    const updatedListing = await prisma.listing.update({
      where: {
        slug: params.slug
      },
      data: updateData,
      include: {
        category: true,
        location: true,
        images: true,
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

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Neautorizat' },
        { status: 401 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { slug: params.slug },
      select: { userId: true }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Anunțul nu a fost găsit' },
        { status: 404 }
      );
    }

    if (listing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Neautorizat' },
        { status: 401 }
      );
    }

    await prisma.$transaction([
      prisma.listingImage.deleteMany({
        where: { listing: { slug: params.slug } }
      }),
      prisma.favorite.deleteMany({
        where: { listing: { slug: params.slug } }
      }),
      prisma.message.deleteMany({
        where: { listing: { slug: params.slug } }
      }),
      prisma.listing.delete({
        where: { slug: params.slug }
      })
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