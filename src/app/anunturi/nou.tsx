'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NouRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const admin = searchParams.get('admin');
    const redirectUrl = admin === 'true' 
      ? '/anunturi/nou?admin=true' 
      : '/anunturi/nou';
    
    router.replace(redirectUrl);
  }, [router, searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecționare...</p>
      </div>
    </div>
  );
}