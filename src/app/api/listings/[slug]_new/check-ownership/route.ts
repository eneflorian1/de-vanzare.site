import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ isOwner: false }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id: Number(params.id),
      },
      select: {
        userId: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ isOwner: false }, { status: 404 });
    }

    // Verificăm dacă utilizatorul curent este proprietarul anunțului
    // sau dacă este administrator
    const isOwner = 
      listing.userId === session.user.id || 
      session.user.role === 'ADMIN';

    return NextResponse.json({ isOwner });
  } catch (error) {
    console.error('Error checking listing ownership:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}