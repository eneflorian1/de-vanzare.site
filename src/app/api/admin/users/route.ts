import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// GET /api/admin/users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const filter = searchParams.get('filter');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    let whereClause = {};

    if (filter) {
      switch (filter) {
        case 'activi':
          whereClause = { ...whereClause, status: 'ACTIVE' };
          break;
        case 'inactivi':
          whereClause = { ...whereClause, status: 'INACTIVE' };
          break;
        case 'admin':
          whereClause = { ...whereClause, role: 'ADMIN' };
          break;
      }
    }

    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { email: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { phone: { contains: search } }
        ]
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const formattedUsers = users.map(user => ({
      id: user.id,
      nume: `${user.firstName} ${user.lastName}`.trim() || 'Utilizator necunoscut',
      email: user.email,
      telefon: user.phone || 'Nespecificat',
      rol: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      dataInregistrare: user.createdAt.toISOString().split('T')[0],
      ultimulLogin: user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : 'Niciodată',
      anunturi: 0 // Temporar setăm la 0 până implementăm relația cu anunțurile
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: body.email,
        hashedPassword,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        role: body.role || 'USER',
        status: body.status || 'ACTIVE'
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Dacă există parolă nouă, o hașurăm
    if (data.password) {
      data.hashedPassword = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in PUT /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users
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

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}