'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import Footer from '@/components/Footer';

interface FAQ {
  category: string;
  questions: {
    question: string;
    answer: string;
  }[];
}

export default function IntrebariFrecventePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});

  const faqs: FAQ[] = [
    {
      category: 'Cont și Autentificare',
      questions: [
        {
          question: 'Cum îmi creez un cont nou?',
          answer: 'Pentru a crea un cont nou, apasă butonul "Înregistrare" din colțul din dreapta sus al paginii. Completează formularul cu datele tale și urmează instrucțiunile pentru a-ți activa contul.'
        },
        {
          question: 'Am uitat parola. Cum o pot recupera?',
          answer: 'Accesează pagina de autentificare și apasă pe link-ul "Ai uitat parola?". Introdu adresa de email asociată contului tău și vei primi instrucțiuni pentru resetarea parolei.'
        }
      ]
    },
    {
      category: 'Anunțuri',
      questions: [
        {
          question: 'Cum pot posta un anunț nou?',
          answer: 'Pentru a posta un anunț nou, autentifică-te în cont și apasă butonul "Adaugă anunț" din partea de sus a paginii. Completează toate informațiile necesare și adaugă fotografii relevante.'
        },
        {
          question: 'Cât timp rămâne activ un anunț?',
          answer: 'Anunțurile standard rămân active timp de 30 de zile. Poți oricând să le reînnoiești sau să le promovezi pentru vizibilitate extra.'
        },
        {
          question: 'Pot edita un anunț după ce l-am publicat?',
          answer: 'Da, poți edita anunțul oricând din secțiunea "Anunțurile mele" din contul tău. Modificările vor fi vizibile imediat după salvare.'
        }
      ]
    },
    {
      category: 'Siguranță și Securitate',
      questions: [
        {
          question: 'Cum pot raporta un anunț suspect?',
          answer: 'Folosește butonul "Raportează" de pe pagina anunțului pentru a semnala conținut suspect. Echipa noastră va analiza raportarea în cel mai scurt timp.'
        },
        {
          question: 'Ce măsuri de siguranță oferiți pentru tranzacții?',
          answer: 'Recomandăm întâlnirea față în față în locuri publice pentru verificarea produselor și folosirea metodelor sigure de plată. Nu trimitem niciodată emailuri pentru a solicita date bancare.'
        }
      ]
    },
    {
      category: 'Plăți și Facturare',
      questions: [
        {
          question: 'Ce metode de plată acceptați?',
          answer: 'Acceptăm plăți prin card bancar (Visa, Mastercard), transfer bancar și diverse portofele electronice pentru serviciile premium.'
        },
        {
          question: 'Cum pot obține o factură pentru serviciile plătite?',
          answer: 'Facturile se generează automat după fiecare plată și pot fi descărcate din secțiunea "Facturi" din contul tău.'
        }
      ]
    }
  ];

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-6">Întrebări Frecvente</h1>
            <p className="text-xl mb-8">
              Găsește rapid răspunsurile la cele mai comune întrebări
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Caută în întrebări..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-800 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const key = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openQuestions[key];

                    return (
                      <motion.div
                        key={questionIndex}
                        initial={false}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                        >
                          <span className="text-lg font-medium text-gray-800">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 text-gray-500 transform transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 py-4 bg-gray-50 text-gray-600">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Niciun rezultat găsit
              </h3>
              <p className="text-gray-600">
                Nu am găsit nicio întrebare care să corespundă căutării tale.
                Încearcă să folosești alte cuvinte cheie.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Nu ai găsit răspunsul căutat?
            </h2>
            <p className="text-gray-600 mb-6">
              Echipa noastră de suport este aici să te ajute cu orice întrebare
            </p>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Contactează Suportul
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}