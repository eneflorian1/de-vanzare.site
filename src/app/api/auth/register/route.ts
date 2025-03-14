import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password, city, address } = body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) { // city și address sunt opționale
      return NextResponse.json(
        { error: 'Toate câmpurile sunt obligatorii' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Acest email este deja înregistrat' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'USER',
        city,
        address
      }
    });

    // Return the user without hashedPassword
    const { hashedPassword: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: 'Cont creat cu succes', 
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'A apărut o eroare la înregistrare' },
      { status: 500 }
    );
  }
}