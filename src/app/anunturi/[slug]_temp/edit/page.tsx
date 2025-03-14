'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EditListing from '@/components/listings/EditListing';
import { toast } from 'react-hot-toast';

type Props = {
  params: {
    id: string;
  };
};

export default function EditListingPage({ params: { id } }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOwner, setIsOwner] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkOwnership = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const response = await fetch(`/api/listings/${id}/check-ownership`);
          const data = await response.json();
          
          setIsOwner(data.isOwner);
          
          if (!data.isOwner) {
            toast.error('Nu aveți permisiunea de a edita acest anunț');
            router.push(`/anunturi/${id}`);
          }
        } catch (error) {
          toast.error('A apărut o eroare la verificarea drepturilor de acces');
          router.push(`/anunturi/${id}`);
        }
      }
      setLoading(false);
    };

    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      checkOwnership();
    }
  }, [id, status, session, router]);

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

  return <EditListing id={id} />;
}