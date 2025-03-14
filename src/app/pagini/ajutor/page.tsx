'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, Book, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

interface Category {
  title: string;
  icon: any;
  articles: {
    id: number;
    title: string;
    content: string;
  }[];
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const categories: Category[] = [
    {
      title: 'Cont și securitate',
      icon: HelpCircle,
      articles: [
        {
          id: 1,
          title: 'Cum îmi creez un cont?',
          content: 'Pentru a crea un cont, accesați butonul "Înregistrare" din colțul din dreapta sus. Completați formularul cu datele necesare și urmați pașii pentru verificarea contului.'
        },
        {
          id: 2,
          title: 'Cum îmi resetez parola?',
          content: 'Accesați pagina de autentificare și dați click pe "Ai uitat parola?". Introduceți adresa de email asociată contului și veți primi instrucțiuni pentru resetarea parolei.'
        }
      ]
    },
    {
      title: 'Anunțuri',
      icon: Book,
      articles: [
        {
          id: 3,
          title: 'Cum postez un anunț?',
          content: 'Din contul dvs., accesați butonul "Adaugă anunț nou". Completați toate informațiile necesare, adăugați poze de calitate și descrieri detaliate pentru a crește șansele de vânzare.'
        },
        {
          id: 4,
          title: 'Cât timp rămâne activ un anunț?',
          content: 'Anunțurile rămân active 30 de zile de la data publicării. Puteți reînnoi anunțul din panoul de control al contului dvs.'
        }
      ]
    },
    {
      title: 'Comunicare',
      icon: MessageCircle,
      articles: [
        {
          id: 5,
          title: 'Cum contactez un vânzător?',
          content: 'Puteți contacta vânzătorul folosind butonul "Contactează" din pagina anunțului. Mesajele sunt trimise prin sistemul nostru intern de mesagerie.'
        },
        {
          id: 6,
          title: 'Cum blochez un utilizator?',
          content: 'Din conversația cu utilizatorul respectiv, accesați meniul cu 3 puncte și selectați opțiunea "Blochează utilizator".'
        }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

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
              Cum te putem ajuta?
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Găsește rapid răspunsuri la întrebările tale
            </p>
            
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Caută în articole..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {filteredCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="mb-8"
              >
                <button
                  onClick={() => setExpandedCategory(
                    expandedCategory === category.title ? null : category.title
                  )}
                  className="w-full flex items-center justify-between bg-white p-4 rounded-lg shadow-sm hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {category.title}
                    </h2>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transform transition-transform ${
                      expandedCategory === category.title ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedCategory === category.title && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-4"
                  >
                    {category.articles.map((article) => (
                      <div
                        key={article.id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedArticle(
                            expandedArticle === article.id ? null : article.id
                          )}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                        >
                          <h3 className="text-lg font-medium text-gray-900">
                            {article.title}
                          </h3>
                          <ChevronDown
                            className={`h-5 w-5 text-gray-500 transform transition-transform ${
                              expandedArticle === article.id ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {expandedArticle === article.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-4 pb-4"
                          >
                            <p className="text-gray-600 leading-relaxed">
                              {article.content}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nu ai găsit ce căutai?
            </h2>
            <p className="text-gray-600 mb-6">
              Echipa noastră de suport este aici să te ajute cu orice întrebare.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Contactează suportul
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}