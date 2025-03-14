'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Heart, User, Menu, Search, ChevronDown, LogOut, MessageSquare, FileText, PlusCircle } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUnreadNotifications();
      
      // Adăugăm un listener pentru evenimentul notificationsUpdated
      const handleNotificationsUpdated = () => {
        fetchUnreadNotifications();
      };
      
      window.addEventListener('notificationsUpdated', handleNotificationsUpdated);
      
      return () => {
        window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
      };
    }
  }, [status]);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Eroare la încărcarea notificărilor');
      const notifications = await response.json();
      const unreadCount = notifications.filter((n: any) => !n.isRead).length;
      setUnreadNotifications(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <motion.header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-lg' 
          : 'bg-gradient-to-r from-indigo-500 to-purple-600'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className={`text-2xl font-bold ${
              isScrolled ? 'text-indigo-600' : 'text-white'
            } hover:opacity-80`}
          >
            de<span style={{ fontSize: '0.6em' }}>-</span>Vanzare<span style={{ fontSize: '0.4em' }}>.ro</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/anunturi"
              className={`${
                isScrolled ? 'text-gray-700' : 'text-white'
              } hover:opacity-80`}
            >
              Anunțuri
            </Link>
            
            {status === 'authenticated' && (
              <>
                <Link 
                  href="/notificari"
                  className={`flex items-center relative ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  } hover:opacity-80`}
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`flex items-center space-x-2 ${
                      isScrolled 
                        ? 'border-2 border-indigo-600 text-indigo-600 bg-white' 
                        : 'bg-white/20 backdrop-blur-sm text-white border-2 border-white'
                    } px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300`}
                  >
                    <User size={20} />
                    <span>{session.user.name || 'Contul meu'}</span>
                    <ChevronDown size={16} />
                  </button>

                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50"
                    >
                      <Link
                        href="/auth/contul-meu/anunturi"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        onClick={closeMenu}
                      >
                        <FileText size={16} />
                        <span>Anunțurile mele</span>
                      </Link>
                      <Link
                        href="/auth/contul-meu/favorite"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        onClick={closeMenu}
                      >
                        <Heart size={16} />
                        <span>Favorite</span>
                      </Link>
                      <Link
                        href="/auth/contul-meu/mesaje"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        onClick={closeMenu}
                      >
                        <MessageSquare size={16} />
                        <span>Mesaje</span>
                      </Link>
                      
                      <Link
                        href="/auth/contul-meu/profil"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        onClick={closeMenu}
                      >
                        <User size={16} />
                        <span>Profil</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>Deconectare</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            )}

            {status !== 'authenticated' && (
              <Link
                href="/auth/autentificare"
                className={`flex items-center space-x-2 ${
                  isScrolled 
                    ? 'border-2 border-indigo-600 text-indigo-600 bg-white' 
                    : 'bg-white/20 backdrop-blur-sm text-white border-2 border-white'
                } px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300`}
              >
                <User size={20} />
                <span>Autentificare</span>
              </Link>
            )}
            
            {/* Buton adăugare anunț pentru desktop - mutat în dreapta */}
            <Link 
              href="/anunturi/nou"
              className={`flex items-center space-x-2 ${
                isScrolled 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg' 
                  : 'bg-white text-indigo-600 shadow-md hover:shadow-lg'
              } px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 font-medium`}
            >
              <PlusCircle size={20} />
              <span>Adaugă anunț</span>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Buton adăugare anunț pentru mobile */}
            <Link 
              href="/anunturi/nou"
              className={`flex items-center justify-center ${
                isScrolled 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                  : 'bg-white text-indigo-600'
              } p-2 rounded-full hover:opacity-90 transition-colors duration-300`}
              aria-label="Adaugă anunț"
            >
              <PlusCircle size={24} />
            </Link>
            
            <button 
              className={`${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-white shadow-lg rounded-b-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col px-4 pt-2 pb-4">
              <Link 
                href="/anunturi"
                className="py-2 text-gray-700 hover:text-indigo-600"
                onClick={closeMenu}
              >
                Anunțuri
              </Link>
              
              <Link 
                href="/contact"
                className="py-2 text-gray-700 hover:text-indigo-600"
                onClick={closeMenu}
              >
                Contact
              </Link>

              {status === 'authenticated' ? (
                <>
                  <Link 
                    href="/notificari"
                    className="py-2 text-gray-700 hover:text-indigo-600 flex items-center justify-between"
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <Bell size={20} className="mr-2" />
                      <span>Notificări</span>
                    </div>
                    {unreadNotifications > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                  
                  <Link 
                    href="/auth/contul-meu/anunturi"
                    className="py-2 text-gray-700 hover:text-indigo-600 flex items-center"
                    onClick={closeMenu}
                  >
                    <FileText size={20} className="mr-2" />
                    <span>Anunțurile mele</span>
                  </Link>

                  <Link 
                    href="/auth/contul-meu/favorite"
                    className="py-2 text-gray-700 hover:text-indigo-600 flex items-center"
                    onClick={closeMenu}
                  >
                    <Heart size={20} className="mr-2" />
                    <span>Favorite</span>
                  </Link>

                  <Link 
                    href="/auth/contul-meu/profil"
                    className="py-2 text-gray-700 hover:text-indigo-600 flex items-center"
                    onClick={closeMenu}
                  >
                    <User size={20} className="mr-2" />
                    <span>Profil</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="py-2 text-red-600 hover:text-red-700 text-left w-full flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Deconectare</span>
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth/autentificare"
                  className="py-2 text-gray-700 hover:text-indigo-600"
                  onClick={closeMenu}
                >
                  Autentificare
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Navbar;