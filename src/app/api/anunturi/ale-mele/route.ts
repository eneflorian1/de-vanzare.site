import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

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

    const anunturi = await prisma.listing.findMany({
      where: {
        userId: userId
      },
      include: {
        category: true,
        location: true,
        images: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(anunturi);
  } catch (error) {
    console.error('Error fetching anunturi:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}