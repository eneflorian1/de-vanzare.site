import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/anunturi
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    let whereClause = {};
    if (status && status !== 'toate') {
      whereClause = {
        ...whereClause,
        status: status.toUpperCase(),
      };
    }

    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      };
    }

    const [anunturi, total] = await Promise.all([
      prisma.listing.findMany({
        skip,
        take: limit,
        where: whereClause,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.listing.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      anunturi,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/anunturi:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/anunturi
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const anunt = await prisma.listing.create({
      data: {
        ...body,
      },
    });
    return NextResponse.json(anunt);
  } catch (error) {
    console.error('Error in POST /api/admin/anunturi:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/anunturi
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const anunt = await prisma.listing.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json(anunt);
  } catch (error) {
    console.error('Error in PUT /api/admin/anunturi:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/anunturi
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await prisma.listing.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/anunturi:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}