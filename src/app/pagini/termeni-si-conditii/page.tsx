'use client';

import { motion } from 'framer-motion';
import { FileText, Shield, AlertCircle, Scale } from 'lucide-react';
import Footer from '@/components/Footer';

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: 'Acceptarea termenilor',
      content: `Prin utilizarea serviciilor noastre, acceptați acești termeni și condiții în totalitate. 
      Vă rugăm să citiți cu atenție înainte de a utiliza platforma.
      
      În cazul în care nu sunteți de acord cu acești termeni, vă rugăm să nu utilizați serviciile noastre.`
    },
    {
      icon: Shield,
      title: 'Regulile platformei',
      content: `1. Este interzisă postarea de anunțuri false sau înșelătoare
2. Conținutul trebuie să respecte legile în vigoare
3. Este interzisă hărțuirea altor utilizatori
4. Respectați drepturile de proprietate intelectuală
5. Nu este permis spam-ul sau publicitatea excesivă`
    },
    {
      icon: AlertCircle,
      title: 'Limitarea răspunderii',
      content: `De-Vanzare.ro nu este responsabil pentru:
- Acuratețea informațiilor postate de utilizatori
- Calitatea produselor/serviciilor oferite
- Disputele între utilizatori
- Pierderi sau daune rezultate din utilizarea platformei`
    },
    {
      icon: Scale,
      title: 'Drepturi și obligații',
      content: `Drepturile utilizatorului:
- Postarea de anunțuri conform regulilor
- Contactarea altor utilizatori
- Ștergerea contului și a datelor personale

Obligațiile utilizatorului:
- Furnizarea de informații corecte
- Respectarea regulilor platformei
- Păstrarea confidențialității datelor de acces`
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
              Termeni și condiții
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Reguli și informații importante pentru utilizarea platformei
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
              Acești termeni și condiții constituie un acord legal între dumneavoastră și DeVanzare.site.
              Prin accesarea și utilizarea platformei noastre, confirmați că ați citit, înțeles și acceptat
              să respectați toți termenii și condițiile prezentate mai jos.
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

          {/* Additional Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Modificări ale termenilor
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Ne rezervăm dreptul de a modifica acești termeni și condiții în orice moment.
              Modificările vor intra în vigoare imediat după publicarea lor pe site.
              Continuarea utilizării platformei după publicarea modificărilor constituie
              acceptarea noilor termeni.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Pentru orice întrebări sau clarificări legate de acești termeni și condiții,
              vă rugăm să ne contactați:
            </p>
            <ul className="text-gray-600 space-y-2">
              <li>Email: legal@devanzare.site</li>
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