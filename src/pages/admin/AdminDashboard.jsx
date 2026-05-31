import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, fetchAllUsers } from '../../services/api';
import { Users, ShoppingBag, DollarSign, Clock, UserPlus, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      fetchAllUsers({ limit: 5 })
    ])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data);
        setRecentUsers(usersRes.data.users || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const cards = [
    { title: 'Total Revenue', value: `₹${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Pending Orders', value: stats?.pendingOrders || 0, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, Admin. Here's what's happening across your platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Revenue Growth (Last 7 Days)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenueOverTime}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Users size={20} className="text-purple-500" />
            User Registration Growth
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-1"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <UserPlus size={20} className="text-emerald-500" />
              New Customers
            </h3>
            <Link to="/admin/users" className="text-xs text-blue-500 font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{user.email}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-sm text-gray-500 italic py-4">No recent users yet.</p>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-1"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            Trending Products
          </h3>
          <div className="space-y-4">
            {stats?.trendingProducts?.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded object-cover" />
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{p.category}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-primary">{p.trendingScore}</p>
                  <p className="text-[10px] text-gray-400">Score</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-1"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            Stock Alerts
          </h3>
          <div className="space-y-4">
            {stats?.lowStockAlerts?.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded object-cover opacity-80" />
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm truncate">{p.name}</p>
                    <p className="text-[10px] text-red-600 font-bold uppercase">Only {p.stock} left</p>
                  </div>
                </div>
                <Link to="/admin/products" className="text-[10px] bg-red-600 text-white px-3 py-1 rounded-full font-bold hover:bg-red-700 transition-colors">
                  Restock
                </Link>
              </div>
            ))}
            {(!stats?.lowStockAlerts || stats.lowStockAlerts.length === 0) && (
              <p className="text-sm text-gray-500 italic py-4">No critical stock alerts.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
