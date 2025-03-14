'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Așteptăm să se încarce sesiunea
    if (status === 'loading') return;

    // Dacă utilizatorul nu este autentificat, îl redirecționăm către pagina de login
    if (!session) {
      router.push('/admin/login');
      return;
    }

    // Dacă utilizatorul nu are rol de admin, îl redirecționăm către homepage
    if (session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    // Dacă utilizatorul este admin, îl redirecționăm către dashboard
    router.push('/admin/dashboard');
  }, [router, session, status]);

  // Afișăm un indicator de încărcare în timp ce se face redirecționarea
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Se încarcă panoul de administrare...</p>
      </div>
    </div>
  );
} 