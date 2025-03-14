'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export function useFavorites() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Încărcăm favoritele la inițializare
  useEffect(() => {
    if (session?.user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Funcție pentru a încărca favoritele
  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorite');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.map((item: any) => item.id));
      }
    } catch (error) {
      console.error('Eroare la încărcarea favoritelor:', error);
      toast.error('Nu am putut încărca favoritele');
    } finally {
      setLoading(false);
    }
  };

  // Verifică dacă un anunț este favorit
  const isFavorite = (listingId: number) => {
    return favorites.includes(listingId);
  };

  // Adaugă sau șterge un anunț din favorite
  const toggleFavorite = async (listingId: number) => {
    if (!session?.user) {
      toast.error('Trebuie să fii autentificat pentru a adăuga la favorite');
      return;
    }

    try {
      if (isFavorite(listingId)) {
        // Ștergem din favorite
        const response = await fetch(`/api/favorite/${listingId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setFavorites(favorites.filter(id => id !== listingId));
          toast.success('Anunț eliminat din favorite');
        } else {
          throw new Error('Eroare la eliminarea din favorite');
        }
      } else {
        // Adăugăm la favorite
        const response = await fetch('/api/favorite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ listingId }),
        });

        if (response.ok) {
          setFavorites([...favorites, listingId]);
          toast.success('Anunț adăugat la favorite');
        } else {
          throw new Error('Eroare la adăugarea în favorite');
        }
      }
    } catch (error) {
      console.error('Eroare la actualizarea favoritelor:', error);
      toast.error('A apărut o eroare. Te rugăm să încerci din nou.');
    }
  };

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
  };
} 