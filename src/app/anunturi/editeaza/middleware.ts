import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Acest middleware redirecționează request-urile de la /anunturi/editeaza/ID către /anunturi/editeaza/SLUG
export async function middleware(request: NextRequest) {
  // Obține ID-ul din URL
  const pathname = request.nextUrl.pathname;
  const idMatch = pathname.match(/\/anunturi\/editeaza\/(\d+)$/);
  
  if (idMatch && idMatch[1]) {
    const id = parseInt(idMatch[1]);
    
    try {
      // Caută anunțul după ID pentru a obține slug-ul
      const listing = await prisma.listing.findUnique({
        where: { id },
        select: { slug: true }
      });
      
      // Dacă anunțul există, redirecționează către URL-ul cu slug
      if (listing?.slug) {
        return NextResponse.redirect(
          new URL(`/anunturi/${listing.slug}/edit`, request.url)
        );
      }
    } catch (error) {
      console.error('Error in middleware:', error);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/anunturi/editeaza/:id*',
};