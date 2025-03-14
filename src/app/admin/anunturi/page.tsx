'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AnunturiPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedFilter, setSelectedFilter] = useState('toate');
  const [anunturi, setAnunturi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { id: 'toate', label: 'Toate' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'INACTIVE', label: 'Inactive' },
    { id: 'PENDING', label: 'În așteptare' }
  ];

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchAnunturi();
    }
  }, [selectedFilter, currentPage, searchQuery, status, session]);

  const fetchAnunturi = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        filter: selectedFilter !== 'toate' ? selectedFilter : '',
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/admin/anunturi?${queryParams}`);
      if (!response.ok) throw new Error('Eroare la încărcarea anunțurilor');
      
      const data = await response.json();
      setAnunturi(data.anunturi);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err.message);
      toast.error('Eroare la încărcarea anunțurilor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm('Ești sigur că vrei să ștergi acest anunț?')) return;

    try {
      const response = await fetch(`/api/listings/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Eroare la ștergerea anunțului');
      
      toast.success('Anunț șters cu succes');
      fetchAnunturi();
    } catch (err) {
      toast.error('Eroare la ștergerea anunțului');
    }
  };

  const handleEdit = (slug) => {
    router.push(`/anunturi/${slug}/edit?admin=true`);
  };

  const handleView = (slug) => {
    router.push(`/anunturi/${slug}?admin=true`);
  };

  const handleTogglePremium = async (id, isPremium) => {
    try {
      const response = await fetch(`/api/admin/anunturi/${id}/premium`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPremium }),
      });

      if (!response.ok) throw new Error('Eroare la actualizarea statusului premium');
      
      toast.success(isPremium ? 'Anunț marcat ca premium' : 'Status premium dezactivat');
      fetchAnunturi();
    } catch (err) {
      toast.error('Eroare la actualizarea statusului premium');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Anunțuri</h1>
            <p className="text-gray-600">Gestionează toate anunțurile de pe platformă</p>
          </div>
          <button
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
            onClick={() => router.push('/anunturi/nou?admin=true')}
          >
            <Plus size={20} />
            <span>Adaugă anunț</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută anunțuri..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-500" />
              <div className="flex space-x-2">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedFilter === filter.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Anunturi Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titlu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preț
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premium
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data publicării
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vizualizări
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {anunturi.map((anunt) => (
                <tr 
                  key={anunt.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{anunt.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{anunt.category?.name || 'Necategorizat'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('ro-RO', { 
                        style: 'currency', 
                        currency: anunt.currency 
                      }).format(anunt.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(anunt.status)}`}>
                      {anunt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={anunt.isPremium || false}
                          onChange={() => handleTogglePremium(anunt.id, !anunt.isPremium)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                      {anunt.isPremium && (
                        <span className="ml-2 text-xs font-medium text-indigo-600">Premium</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(anunt.createdAt).toLocaleDateString('ro-RO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {anunt.viewsCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(anunt.slug)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Vizualizează anunț"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(anunt.slug)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Editează anunț"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(anunt.slug)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Șterge anunț"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Pagina <span className="font-medium">{currentPage}</span> din{' '}
                <span className="font-medium">{totalPages}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
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
                className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Următor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}