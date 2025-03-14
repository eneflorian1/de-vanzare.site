'use client';

import { motion } from 'framer-motion';
import { Users, Target, Shield, Award } from 'lucide-react';
import Footer from '@/components/Footer';

export default function DespreNoiPage() {
  const teamMembers = [
    {
      name: 'Alexandru Popescu',
      role: 'CEO & Founder',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Maria Ionescu',
      role: 'Marketing Director',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Dan Marinescu',
      role: 'Technical Lead',
      image: '/api/placeholder/150/150'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Siguranță și Încredere',
      description: 'Verificăm fiecare anunț pentru a asigura o experiență sigură.'
    },
    {
      icon: Target,
      title: 'Focusați pe Calitate',
      description: 'Promovăm doar anunțuri de calitate, verificate și relevante.'
    },
    {
      icon: Users,
      title: 'Comunitate Puternică',
      description: 'Construim o comunitate bazată pe respect și încredere.'
    },
    {
      icon: Award,
      title: 'Experiență Verificată',
      description: 'Peste 10 ani de experiență în domeniul anunțurilor online.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Despre De-Vanzare.ro
            </h1>
            <p className="text-xl text-indigo-100">
              Conectăm oamenii cu oportunitățile perfecte, făcând procesul de 
              vânzare-cumpărare mai simplu și mai sigur ca niciodată.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Misiunea Noastră */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Misiunea Noastră
            </h2>
            <p className="text-lg text-gray-600">
              Ne-am propus să revoluționăm modul în care oamenii vând și cumpără 
              în România. Prin tehnologie și inovație, facem tranzacțiile mai 
              sigure, mai rapide și mai plăcute pentru toată lumea.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Valorile Noastre */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Valorile Noastre
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Echipa */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Echipa Noastră
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-800">
                  {member.name}
                </h3>
                <p className="text-gray-600">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-indigo-600 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">
              Alătură-te comunității noastre
            </h2>
            <p className="text-xl mb-8">
              Descoperă cea mai mare platformă de anunțuri din România
            </p>
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
              Creează cont gratuit
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}