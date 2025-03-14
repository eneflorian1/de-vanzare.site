'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Home,
  Users,
  FileText,
  BarChart2,
  LogOut,
  Menu,
  X,
  Settings,
  Bell,
  Search
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle sidebar on mobile devices
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Close mobile menu when changing routes
    setMobileMenuOpen(false);
    
    // Nu facem nimic dacă suntem pe pagina de login
    if (pathname === '/admin/login') {
      return;
    }

    if (status === 'loading') return;

    // Dacă nu există sesiune și nu suntem pe pagina de login, redirecționăm către login
    if (!session) {
      router.push('/admin/login');
      return;
    }

    // Dacă există sesiune dar nu este admin, redirecționăm către homepage
    if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router, pathname]);

  // Pentru pagina de login nu afișăm loading și permitem renderarea
  if (pathname === '/admin/login') {
    return children;
  }

  // Pentru celelalte pagini, afișăm loading dacă se încarcă sesiunea
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Dacă nu există sesiune, nu renderăm nimic (se va face redirect)
  if (!session) {
    return null;
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Anunțuri', href: '/admin/anunturi', icon: FileText },
    { name: 'Utilizatori', href: '/admin/users', icon: Users },
    { name: 'Rapoarte', href: '/admin/reports', icon: BarChart2 },
  ];

  const handleLogout = async () => {
    router.push('/api/auth/signout');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'} ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-30' : 'hidden md:block'} bg-white transition-all duration-300 border-r border-gray-200 shadow-sm`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <h1 className="text-xl font-semibold text-indigo-600">Admin Panel</h1>
          ) : (
            <span className="text-xl font-bold text-indigo-600">AP</span>
          )}
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              setMobileMenuOpen(false);
            }}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-100 md:block hidden"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-100 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${sidebarOpen ? 'px-4' : 'justify-center'} py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <item.icon
                  size={20}
                  className={isActive ? 'text-indigo-600' : 'text-gray-500'}
                />
                {sidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? 'px-4 justify-start' : 'justify-center'} py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors`}
          >
            <LogOut size={20} className="text-gray-500" />
            {sidebarOpen && <span className="ml-3">Deconectare</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 mr-2 text-gray-400 rounded-md hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              
              <div className="hidden md:block max-w-md w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Caută..."
                    className="block w-full pl-10 pr-3 py-2 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 rounded-full hover:bg-gray-100">
                <Bell size={20} />
              </button>
              <button className="p-2 text-gray-400 rounded-full hover:bg-gray-100">
                <Settings size={20} />
              </button>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                  {session?.user?.name?.charAt(0) || 'A'}
                </div>
                {sidebarOpen && (
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'Admin'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}