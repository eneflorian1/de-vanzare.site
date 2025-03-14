import { NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  // Set response timeout
  const timeout = setTimeout(() => {
    console.error('Upload operation timed out');
    // We can't abort the operation here, but we'll log it
  }, 20000); // 20 seconds timeout for server processing
  
  try {
    console.log('Starting file upload process...');
    const formData = await request.formData();
    
    // Verifică dacă există multiple fișiere sau un singur fișier
    let files = [];
    
    if (formData.has('file')) {
      const file = formData.get('file') as File;
      if (file) files.push(file);
    } else if (formData.has('images')) {
      const images = formData.getAll('images');
      for (const image of images) {
        if (image instanceof File) {
          files.push(image);
        }
      }
    } else {
      // Iterate through all form data to find files
      for (const [name, value] of formData.entries()) {
        if (value instanceof File) {
          files.push(value);
        }
      }
    }
    
    if (files.length === 0) {
      console.error('No files received in request');
      return NextResponse.json(
        { error: 'No files received' },
        { status: 400 }
      );
    }

    console.log(`Received ${files.length} files for processing`);
    const uploadResults = [];

    // Creează calea către directorul public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Verifică dacă directorul uploads există, dacă nu, îl creează
    if (!fs.existsSync(uploadsDir)) {
      console.log('Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    console.log('Upload directory confirmed:', uploadsDir);

    // Procesează toate fișierele
    for (const file of files) {
      console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

      // Verifică tipul fișierului
      if (!file.type.startsWith('image/')) {
        console.error(`Invalid file type: ${file.type}`);
        uploadResults.push({
          error: `File ${file.name} must be an image`,
          success: false
        });
        continue;
      }
      
      // Verifică dimensiunea fișierului (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        console.error(`File too large: ${file.size} bytes`);
        uploadResults.push({
          error: `File ${file.name} exceeds maximum allowed size (5MB)`,
          success: false
        });
        continue;
      }

      // Generează un nume unic pentru fișier
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const filePath = path.join(uploadsDir, fileName);
      console.log('Saving file to:', filePath);

      // Convertește File în ArrayBuffer și apoi în Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Salvează fișierul
      try {
        fs.writeFileSync(filePath, buffer);
        console.log(`File successfully saved to disk at: ${filePath}`);
        
        // Returnează URL-ul public al imaginii
        const imageUrl = `/uploads/${fileName}`;
        uploadResults.push({
          fileName,
          url: imageUrl,
          success: true
        });
      } catch (writeError) {
        console.error('Error writing file to disk:', writeError);
        uploadResults.push({
          error: `Failed to write file ${file.name} to disk: ${writeError.message}`,
          success: false
        });
      }
    }

    // Returnează rezultatele pentru toate fișierele
    clearTimeout(timeout);
    return NextResponse.json({ 
      urls: uploadResults.filter(res => res.success).map(res => res.url),
      results: uploadResults,
      success: uploadResults.some(res => res.success)
    });
    
  } catch (error) {
    console.error('Error uploading files:', error);
    // Log mai detaliat pentru debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    
    clearTimeout(timeout);
    
    // Send a more informative error message
    return NextResponse.json(
      { 
        error: 'Error uploading files', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};