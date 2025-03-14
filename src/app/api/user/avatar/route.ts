import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    // Verificăm autentificarea
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obținem utilizatorul din baza de date
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Procesăm fișierul
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Verificăm tipul fișierului
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Verificăm dimensiunea fișierului (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Generăm un nume unic pentru fișier
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Creăm calea către directorul public/uploads/avatars
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    
    // Verificăm dacă directorul există și îl creăm dacă nu
    if (!fs.existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, fileName);
    
    // Convertim fișierul în buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Scriem fișierul pe disc
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      console.error('Error writing file:', error);
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
    }
    
    // Construim URL-ul imaginii
    const imageUrl = `/uploads/avatars/${fileName}`;
    
    // Actualizăm utilizatorul în baza de date
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: imageUrl }
      });
    } catch (error) {
      console.error('Error updating user avatar:', error);
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 