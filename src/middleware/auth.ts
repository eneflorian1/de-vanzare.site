import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  // Lista de rute care nu necesită autentificare
  const publicPaths = ['/auth/autentificare', '/auth/inregistrare', '/auth/recuperare-parola'];
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Obține token-ul din cookie
  const token = request.cookies.get('authToken')?.value;

  // Verifică dacă este o rută publică
  if (isPublicPath) {
    // Dacă userul este deja autentificat, redirecționează la dashboard
    if (token) {
      try {
        await verifyToken(token);
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } catch {
        // Token invalid, lasă userul să continue pe ruta publică
      }
    }
    return NextResponse.next();
  }

  // Verifică dacă există token pentru rutele protejate
  if (!token) {
    return NextResponse.redirect(new URL('/auth/autentificare', request.url));
  }

  try {
    // Verifică validitatea token-ului
    const verified = await verifyToken(token);
    
    // Verifică rolul pentru rutele admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const payload = verified.payload as { role: string };
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Adaugă informațiile user-ului în headers pentru a fi accesibile în API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', verified.payload.sub as string);
    requestHeaders.set('x-user-role', (verified.payload as { role: string }).role);

    return NextResponse.next({
      headers: requestHeaders,
    });
  } catch (error) {
    // Token invalid sau expirat
    return NextResponse.redirect(new URL('/auth/autentificare', request.url));
  }
}

async function verifyToken(token: string) {
  const textEncoder = new TextEncoder();
  const secretKey = textEncoder.encode(SECRET_KEY);
  
  return await jwtVerify(token, secretKey);
}

// Configurare pentru care rute să aplice middleware-ul
export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/:path*',
    '/api/admin/:path*'
  ]
};