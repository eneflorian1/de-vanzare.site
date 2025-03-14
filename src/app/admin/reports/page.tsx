'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  PieChartIcon,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('luna');
  const [data, setData] = useState({
    stats: {
      revenue: { value: 0, change: '0%' },
      newUsers: { value: 0, change: '0%' },
      conversion: { value: 0, change: '0%' }
    },
    categoryDistribution: [],
    recentActivity: [],
    dailyRevenue: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reports?period=${selectedPeriod}`);
      if (!response.ok) throw new Error('Eroare la încărcarea datelor');
      
      const reportData = await response.json();
      setData(reportData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { id: 'azi', label: 'Astăzi' },
    { id: 'saptamana', label: 'Săptămâna' },
    { id: 'luna', label: 'Luna' },
    { id: 'an', label: 'Anul' }
  ];

  const stats = [
    {
      title: 'Venit Total',
      value: new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON'
      }).format(data.stats.revenue.value),
      change: data.stats.revenue.change,
      trend: data.stats.revenue.change.startsWith('+') ? 'up' : 'down',
      icon: DollarSign
    },
    {
      title: 'Utilizatori Noi',
      value: data.stats.newUsers.value,
      change: data.stats.newUsers.change,
      trend: data.stats.newUsers.change.startsWith('+') ? 'up' : 'down',
      icon: Users
    },
    {
      title: 'Conversie',
      value: `${data.stats.conversion.value}%`,
      change: data.stats.conversion.change,
      trend: data.stats.conversion.change.startsWith('+') ? 'up' : 'down',
      icon: RefreshCw
    }
  ];

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/admin/reports/export?period=${selectedPeriod}`);
      if (!response.ok) throw new Error('Eroare la exportul raportului');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raport-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Eroare la export:', error);
      alert('A apărut o eroare la exportul raportului');
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center py-16"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div><p className="mt-4 text-gray-600">Se încarcă...</p></div></div>;
  if (error) return <div className="h-full flex items-center justify-center py-16"><div className="text-center text-red-600"><div className="text-4xl mb-4">⚠️</div><p>{error}</p></div></div>;

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
            <h1 className="text-3xl font-bold text-gray-800">Rapoarte</h1>
            <p className="text-gray-600">Analizează performanța platformei</p>
          </div>
          <motion.button
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportReport}
          >
            <Download size={20} />
            <span>Exportă Raport</span>
          </motion.button>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-gray-500" />
              <span className="text-gray-700 font-medium">Perioadă:</span>
            </div>
            <div className="flex space-x-2">
              {periods.map(period => (
                <motion.button
                  key={period.id}
                  className={`px-4 py-2 rounded-lg ${
                    selectedPeriod === period.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPeriod(period.id)}
                >
                  {period.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              className="bg-white rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <stat.icon className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                  </div>
                </div>
                <div className={`flex items-center ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp size={20} className="mr-1" />
                  ) : (
                    <TrendingDown size={20} className="mr-1" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Venituri</h2>
              <div className="flex items-center text-sm text-gray-500">
                <BarChart2 size={16} className="mr-1" />
                <span>Evoluție venituri</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('ro-RO', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => new Intl.NumberFormat('ro-RO', {
                      style: 'currency',
                      currency: 'RON'
                    }).format(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    name="Venit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Categories Chart */}
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Distribuție Categorii</h2>
              <div className="flex items-center text-sm text-gray-500">
                <PieChartIcon size={16} className="mr-1" />
                <span>Top Categorii</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Table */}
        <motion.div 
          className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-800">Activitate Recentă</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acțiune
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Utilizator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Detalii
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recentActivity.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}