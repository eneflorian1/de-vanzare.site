import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET pentru a obține datele profilului
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
        county: true,
        address: true,
        notifyEmail: true,
        notifyPhone: true,
        avatar: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT pentru a actualiza datele profilului
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received profile update data:', body);
    
    const {
      firstName,
      lastName,
      phone,
      city,
      county,
      address,
      notifyEmail,
      notifyPhone,
      avatar,
    } = body;

    // Validare date
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Numele și prenumele sunt obligatorii' },
        { status: 400 }
      );
    }

    // Validare număr de telefon (dacă există)
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Numărul de telefon trebuie să conțină exact 10 cifre' },
        { status: 400 }
      );
    }

    // Construim obiectul de date pentru actualizare
    const updateData = {
      firstName,
      lastName,
      phone,
      city,
      county,
      address,
      notifyEmail,
      notifyPhone,
    };

    // Adăugăm avatar doar dacă există
    if (avatar) {
      updateData.avatar = avatar;
    }

    console.log('Updating user with data:', updateData);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    console.log('User updated successfully:', updatedUser);

    const { hashedPassword: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}