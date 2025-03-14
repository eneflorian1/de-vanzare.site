'use client';

import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NewListing from '@/components/listings/NewListing';
import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';

export default function ListingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const { data: session, status } = useSession();

  // Verifică dacă utilizatorul încearcă să acceseze pagina de creare anunț și nu este autentificat
  if (view === 'nou' && !session) {
    redirect('/auth/login?callbackUrl=/anunturi?view=nou');
  }

  // Afișează pagina de creare anunț doar pentru utilizatorii autentificați
  if (view === 'nou' && session) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <NewListing />
        </main>
        <Footer />
      </div>
    );
  }

  // Layout-ul standard pentru celelalte view-uri
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}