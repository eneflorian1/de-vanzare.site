'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck } from 'lucide-react';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Shield,
      title: 'Informații colectate',
      content: `Colectăm următoarele tipuri de informații:
      - Informații de identificare (nume, email, telefon)
      - Informații despre dispozitiv și browser
      - Informații despre utilizarea serviciului
      - Cookie-uri și tehnologii similare`
    },
    {
      icon: Lock,
      title: 'Utilizarea informațiilor',
      content: `Folosim informațiile colectate pentru:
      - Furnizarea și îmbunătățirea serviciilor
      - Personalizarea experienței utilizatorului
      - Comunicări despre serviciu și actualizări
      - Prevenirea fraudelor și asigurarea securității`
    },
    {
      icon: Eye,
      title: 'Partajarea informațiilor',
      content: `Putem partaja informațiile cu:
      - Furnizori de servicii
      - Parteneri de afaceri
      - Autorități legale (când este necesar)
      - Alte părți cu consimțământul dvs.`
    },
    {
      icon: UserCheck,
      title: 'Drepturile utilizatorului',
      content: `Aveți următoarele drepturi:
      - Acces la datele personale
      - Rectificarea datelor incorecte
      - Ștergerea datelor ("dreptul de a fi uitat")
      - Restricționarea prelucrării
      - Portabilitatea datelor
      - Opoziția la prelucrare`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 py-20">
        <div className="absolute inset-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Politica de confidențialitate
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Protejarea datelor tale personale este prioritatea noastră
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <p className="text-gray-600 leading-relaxed mb-8">
              Această politică de confidențialitate descrie modul în care colectăm, folosim și protejăm
              informațiile personale pe care ni le furnizați prin utilizarea site-ului nostru.
              Vă rugăm să citiți cu atenție această politică pentru a înțelege angajamentul nostru
              de a vă respecta confidențialitatea și modul în care vom trata informațiile dvs.
            </p>

            <div className="space-y-12">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                        <Icon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {section.title}
                      </h2>
                    </div>
                    <div className="pl-14">
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Footer section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact pentru probleme de confidențialitate
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Dacă aveți întrebări sau preocupări legate de politica noastră de confidențialitate sau de 
              modul în care tratăm datele dvs. personale, vă rugăm să ne contactați:
            </p>
            <ul className="text-gray-600 space-y-2">
              <li>Email: privacy@de-vanzare.ro</li>
              <li>Telefon: +40 721 234 567</li>
              <li>Adresă: Strada Exemplu nr. 123, București, România</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8 text-gray-500 text-sm"
          >
            Ultima actualizare: Februarie 2024
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}