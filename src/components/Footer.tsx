import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/pagini/ajutor" className="hover:underline text-sm">Ajutor</Link>
            <Link href="/pagini/despre-noi" className="hover:underline text-sm">Despre noi</Link>
            <Link href="/pagini/intrebari-frecvente" className="hover:underline text-sm">Întrebări frecvente</Link>
            <Link href="/pagini/politica-confidentialitate" className="hover:underline text-sm">Politica de confidențialitate</Link>
            <Link href="/pagini/termeni-si-conditii" className="hover:underline text-sm">Termeni și condiții</Link>
            <Link href="/contact" className="hover:underline text-sm">Contact</Link>
          </div>
        </div>

        <div className="mt-8 pt-4 text-center text-xs sm:text-sm opacity-80 border-t border-white/20">
          © 2023 De-Vanzare.ro. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 