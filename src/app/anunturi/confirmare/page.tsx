'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Mail } from 'lucide-react';

export default function ConfirmarePage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'success';
  const emailError = searchParams.get('email') === 'error';
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState<React.ReactNode>(null);
  
  useEffect(() => {
    // Setăm titlul, mesajul și iconița în funcție de status
    switch (status) {
      case 'success':
        setTitle('Anunț creat cu succes!');
        setMessage('Anunțul tău a fost creat cu succes și este în așteptare pentru validare. Un email de confirmare a fost trimis la adresa ta de email. Te rugăm să verifici căsuța de email și să confirmi anunțul prin link-ul din email.');
        setIcon(<CheckCircle className="h-16 w-16 text-green-500" />);
        break;
      case 'partial':
        setTitle('Anunț creat parțial!');
        if (emailError) {
          setMessage('Anunțul tău a fost creat cu succes, dar a apărut o eroare la trimiterea emailului de validare. Te rugăm să contactezi suportul pentru a valida anunțul.');
        } else {
          setMessage('Anunțul tău a fost creat cu succes, dar a apărut o eroare la generarea link-ului de validare. Te rugăm să contactezi suportul pentru a valida anunțul.');
        }
        setIcon(<AlertTriangle className="h-16 w-16 text-yellow-500" />);
        break;
      case 'error':
      default:
        setTitle('Eroare la crearea anunțului');
        setMessage('A apărut o eroare la crearea anunțului. Te rugăm să încerci din nou sau să contactezi suportul dacă problema persistă.');
        setIcon(<XCircle className="h-16 w-16 text-red-500" />);
        break;
    }
  }, [status, emailError]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          <div className="flex flex-col items-center justify-center py-6">
            {icon}
            <p className="text-gray-600 text-center mt-4 mb-6">{message}</p>
            
            {status === 'success' && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
                <Mail className="h-6 w-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Verifică-ți emailul</h3>
                  <p className="mt-2 text-sm text-blue-700">
                    Am trimis un email cu un link de confirmare. Dacă nu găsești emailul în Inbox, verifică și folderul Spam.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Link
                href="/"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Pagina principală
              </Link>
              <Link
                href="/anunturi"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Vezi anunțuri
              </Link>
              {(status === 'partial' || status === 'error') && (
                <Link
                  href="/contact"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Contactează suportul
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 