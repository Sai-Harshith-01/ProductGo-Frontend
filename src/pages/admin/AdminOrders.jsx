import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAllOrders, updateOrderStatus, updatePaymentStatus } from '../../services/api';
import { socket } from '../../services/socket';
import { Package, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const ORDER_STATUSES = ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAllOrders({ limit: 100 })
      .then(res => setOrders(res.data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    const handleOrderUpdate = (updatedOrder) => {
      setOrders(prev => {
        const exists = prev.find(o => o._id === updatedOrder._id);
        if (exists) {
          return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
        }
        return [updatedOrder, ...prev];
      });
      // Optional: you can show a toast for new/updated order here if you like
    };

    socket.on('order_updated', handleOrderUpdate);
    socket.on('new_order', handleOrderUpdate);

    return () => {
      socket.off('order_updated', handleOrderUpdate);
      socket.off('new_order', handleOrderUpdate);
    };
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      toast.success('Order status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await updatePaymentStatus(orderId, newStatus);
      setOrders(orders.map(o => o._id === orderId ? { ...o, paymentStatus: newStatus } : o));
      toast.success('Payment status updated');
    } catch (err) {
      toast.error('Failed to update payment status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLACED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'PACKED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && o.paymentStatus === 'pending') ||
                         (filter === 'paid' && o.paymentStatus === 'paid') ||
                         (filter === 'shipped' && o.orderStatus === 'SHIPPED');
    
    const searchLower = search.toLowerCase();
    const matchesSearch = o._id.toLowerCase().includes(searchLower) ||
                          (o.user?.name || '').toLowerCase().includes(searchLower) ||
                          (o.user?.email || '').toLowerCase().includes(searchLower);
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage fulfillment and payment status.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            {['all', 'pending', 'paid', 'shipped'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No orders found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Total</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {filteredOrders.map(order => (
                  <motion.tr 
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium font-mono text-blue-600 dark:text-blue-400">
                      {order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium">{order.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-bold">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                        {order.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex items-center gap-2">
                      <select
                        value={order.orderStatus || 'PLACED'}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <select
                        value={order.paymentStatus || 'pending'}
                        onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-red-500 font-medium"
                        title="Admin Fallback Only"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Mark Paid</option>
                        <option value="failed">Mark Failed</option>
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
