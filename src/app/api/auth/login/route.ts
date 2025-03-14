import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Verifică dacă email-ul există
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        hashedPassword: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email sau parolă invalidă' },
        { status: 401 }
      );
    }

    // Verify status if it exists in the schema
    if (user.status && user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Contul este inactiv sau suspendat' },
        { status: 403 }
      );
    }

    // Verifică parola
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email sau parolă invalidă' },
        { status: 401 }
      );
    }

    // Generează JWT
    const token = await generateToken(user);

    // Try to update last login if the field exists in schema
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
    } catch (updateError) {
      // If lastLogin doesn't exist in the schema, ignore the error
      console.log('Note: Could not update lastLogin - field may not exist');
    }

    // Setează cookie-ul cu token-ul
    cookies().set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 zile
    });

    // Returnează datele utilizatorului (fără parolă)
    const { hashedPassword: _, ...userData } = user;
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function generateToken(user: any) {
  const textEncoder = new TextEncoder();
  const secretKey = textEncoder.encode(SECRET_KEY);

  const token = await new SignJWT({
    sub: user.id.toString(),
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

  return token;
}