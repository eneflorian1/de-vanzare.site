import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Acest middleware va trata toate rutele și va face redirecționări dacă e necesar
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Verifică dacă URL-ul conține '/anunturi/editeaza/'
  if (url.pathname.startsWith('/anunturi/editeaza/')) {
    const idMatch = url.pathname.match(/\/anunturi\/editeaza\/(\d+)$/);
    
    if (idMatch && idMatch[1]) {
      console.log(`Redirecting from edit with ID to edit with slug...`);
      // Vom lăsa redirecționarea să meargă prin pagina de client care va face fetch API-ului
      // pentru a obține slug-ul și apoi va redirecționa
      return NextResponse.next();
    }
  }
  
  // Verifică dacă URL-ul este exact '/anunturi?view=nou'
  if (url.pathname === '/anunturi' && url.searchParams.get('view') === 'nou') {
    console.log('Redirecting from /anunturi?view=nou to /anunturi/nou');
    url.pathname = '/anunturi/nou';
    url.searchParams.delete('view');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configurare pentru care rute să se aplice middleware-ul
export const config = {
  matcher: [
    // Aplicăm pe toate rutele de anunțuri
    '/anunturi/:path*',
  ],
};