'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  User,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Hash
} from 'lucide-react';
import UserForm from '@/components/admin/users/UserForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  nume: string;
  email: string;
  telefon: string;
  rol: string;
  status: string;
  dataInregistrare: string;
  anunturi: number;
}

interface FilterOption {
  id: string;
  label: string;
}

const UsersPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('toti');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);

  const filters: FilterOption[] = [
    { id: 'toti', label: 'Toți Utilizatorii' },
    { id: 'activi', label: 'Activi' },
    { id: 'inactivi', label: 'Inactivi' },
    { id: 'admin', label: 'Administratori' }
  ];

  useEffect(() => {
    // Temporar am comentat verificarea pentru dezvoltare
    /*if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {*/
      fetchUsers();
    //}
  }, [selectedFilter, currentPage, searchQuery/*, status, session*/]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9',
        ...(selectedFilter !== 'toti' && { filter: selectedFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/admin/users?${queryParams}`);
      if (!response.ok) throw new Error('Eroare la încărcarea utilizatorilor');
      
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
      setTotalUsers(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare necunoscută');
      toast.error('Eroare la încărcarea utilizatorilor');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userData: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error('Eroare la adăugarea utilizatorului');

      await fetchUsers();
      setIsFormOpen(false);
      toast.success('Utilizator adăugat cu succes!');
    } catch (err) {
      toast.error('Eroare la adăugarea utilizatorului');
    }
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error('Eroare la actualizarea utilizatorului');

      await fetchUsers();
      setIsFormOpen(false);
      setSelectedUser(null);
      toast.success('Utilizator actualizat cu succes!');
    } catch (err) {
      toast.error('Eroare la actualizarea utilizatorului');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ești sigur că vrei să ștergi acest utilizator?')) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Eroare la ștergerea utilizatorului');
      
      await fetchUsers();
      toast.success('Utilizator șters cu succes!');
    } catch (err) {
      toast.error('Eroare la ștergerea utilizatorului');
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`);
      if (!response.ok) throw new Error('Eroare la încărcarea datelor utilizatorului');

      const userData = await response.json();
      setSelectedUser(userData);
      setIsFormOpen(true);
    } catch (err) {
      toast.error('Eroare la încărcarea datelor utilizatorului');
    }
  };

  const getRolBadgeColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-teal-100 text-teal-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'inactive':
        return 'text-red-500';
      case 'suspended':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center py-16">
        <div className="text-center text-red-600">
          <div className="text-4xl mb-4">⚠️</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div 
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Utilizatori</h1>
            <p className="text-gray-600">Gestionează {totalUsers} utilizatori ai platformei</p>
          </div>
          <motion.button
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedUser(null);
              setIsFormOpen(true);
            }}
          >
            <UserPlus size={20} />
            <span>Adaugă Utilizator</span>
          </motion.button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Caută după nume, email sau telefon..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-500" />
              <div className="flex space-x-2">
                {filters.map(filter => (
                  <motion.button
                    key={filter.id}
                    className={`px-4 py-2 rounded-lg ${
                      selectedFilter === filter.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFilterChange(filter.id)}
                  >
                    {filter.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <User size={24} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{user.nume}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRolBadgeColor(user.rol)}`}>
                        {user.rol === 'admin' ? (
                          <div className="flex items-center">
                            <Shield size={12} className="mr-1" />
                            Administrator
                          </div>
                        ) : 'Utilizator'}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center ${getStatusColor(user.status)}`}>
                    {user.status === 'active' ? (
                      <CheckCircle size={20} />
                    ) : (
                      <XCircle size={20} />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Mail size={16} className="mr-2" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone size={16} className="mr-2" />
                    <span className="text-sm">{user.telefon}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>Înregistrat:</span>
                    </div>
                    <span>{user.dataInregistrare}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Hash size={16} className="mr-2" />
                      <span>Anunțuri:</span>
                    </div>
                    <span>{user.anunturi}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleEdit(user.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Editează utilizator"
                  >
                    <Edit size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Șterge utilizator"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

{/* Pagination */}
{totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Arată {(currentPage - 1) * 9 + 1} până la {Math.min(currentPage * 9, totalUsers)} din{' '}
                <span className="font-medium">{totalUsers}</span> utilizatori
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                    currentPage === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Următor
              </button>
            </div>
          </div>
        )}

        {/* User Form Modal */}
        {isFormOpen && (
          <UserForm
            user={selectedUser}
            onSubmit={selectedUser ? handleUpdateUser : handleAddUser}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedUser(null);
            }}
            isEdit={!!selectedUser}
          />
        )}
      </motion.div>
    </div>
  );
};

export default UsersPage;