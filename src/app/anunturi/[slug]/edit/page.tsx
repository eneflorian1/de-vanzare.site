'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EditListing from '@/components/listings/EditListing';
import { toast } from 'react-hot-toast';

type Props = {
  params: {
    slug: string;
  };
};

export default function EditListingPage({ params: { slug } }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOwner, setIsOwner] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Verificăm dacă userul vine din panoul de admin (query param admin=true)
    const searchParams = new URLSearchParams(window.location.search);
    const isAdmin = searchParams.get('admin') === 'true';
    
    const checkOwnership = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        // Dacă userul este admin și a venit dintr-o pagină admin, îl considerăm proprietar
        if (isAdmin && session?.user?.role === 'ADMIN') {
          setIsOwner(true);
          setLoading(false);
          return;
        }

        try {
          const response = await fetch(`/api/listings/${slug}/check-ownership`);
          const data = await response.json();
          
          setIsOwner(data.isOwner);
          
          if (!data.isOwner) {
            toast.error('Nu aveți permisiunea de a edita acest anunț');
            router.push(`/anunturi/${slug}`);
          }
        } catch (error) {
          toast.error('A apărut o eroare la verificarea drepturilor de acces');
          router.push(`/anunturi/${slug}`);
        }
      }
      setLoading(false);
    };

    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      checkOwnership();
    }
  }, [slug, status, session, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session?.user || !isOwner) {
    return null;
  }

  return <EditListing id={slug} />;
}