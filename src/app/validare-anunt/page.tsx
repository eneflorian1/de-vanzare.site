'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ValidareAnuntPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [listingSlug, setListingSlug] = useState<string | null>(null);

  useEffect(() => {
    const validateListing = async () => {
      try {
        const id = searchParams.get('id');
        const token = searchParams.get('token');

        if (!id || !token) {
          setStatus('error');
          setMessage('Link de validare invalid. Lipsesc parametrii necesari.');
          return;
        }

        const response = await fetch('/api/listings/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Anunțul tău a fost validat cu succes!');
          setListingSlug(data.slug);
        } else {
          setStatus('error');
          setMessage(data.error || 'A apărut o eroare la validarea anunțului.');
        }
      } catch (error) {
        console.error('Error validating listing:', error);
        setStatus('error');
        setMessage('A apărut o eroare la validarea anunțului. Te rugăm să încerci din nou.');
      }
    };

    validateListing();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Validare Anunț
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-600">Se validează anunțul tău...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Validare reușită!</h3>
              <p className="text-gray-600 text-center mb-6">{message}</p>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {listingSlug && (
                  <Link
                    href={`/anunturi/${listingSlug}`}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Vezi anunțul
                  </Link>
                )}
                <Link
                  href="/"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Pagina principală
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-6">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Validare eșuată</h3>
              <p className="text-gray-600 text-center mb-6">{message}</p>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Link
                  href="/"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Pagina principală
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Contactează-ne
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 