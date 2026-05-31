import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useState, useEffect } from 'react';
import { fetchMyNotifications, markNotificationRead } from '../services/api';
import { socket } from '../services/socket';
import toast from 'react-hot-toast';
import VisualSearchModal from './VisualSearchModal';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const count = useCartStore((s) => s.count());
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('join', user.id);

      fetchMyNotifications()
        .then((res) => setNotifications(res.data))
        .catch(() => {});

      socket.on('new_notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        toast.success(notification.message, { icon: '🔔' });
      });

      return () => {
        socket.off('new_notification');
        socket.disconnect();
      };
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: 'read' } : n))
      );
    } catch (err) {}
  };

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  return (
    <header className="bg-white top-0 sticky z-50 border-b border-neutral-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto font-h1 antialiased tracking-tight">

        {/* Brand */}
        <Link to="/" className="text-lg font-bold tracking-widest uppercase text-neutral-900">
          ProductGo
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/"         className="text-neutral-900 font-semibold hover:opacity-70 transition-opacity">Shop</Link>
          <Link to="/products" className="text-neutral-500 hover:opacity-70 transition-opacity">New Arrivals</Link>
          <Link to="/products" className="text-neutral-500 hover:opacity-70 transition-opacity">Categories</Link>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          <Link to="/products" className="hover:opacity-70 text-neutral-900">
            <span className="material-symbols-outlined">search</span>
          </Link>

          <button 
            onClick={() => setIsVisualSearchOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-all shadow-md group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">photo_camera</span>
            <span className="text-[12px] font-bold pr-1">Visual Search</span>
          </button>

          {/* Cart badge */}
          <Link to="/cart" className="relative hover:opacity-70 text-neutral-900">
            <span className="material-symbols-outlined">shopping_cart</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="relative p-2 text-neutral-900 hover:opacity-70 transition-opacity"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant shadow-lg rounded-xl overflow-hidden z-50">
                    <div className="bg-surface-container-low p-4 font-bold border-b border-outline-variant">
                      Notifications
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-on-surface-variant">No notifications yet.</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleRead(n._id)}
                            className={`p-4 border-b border-outline-variant/30 cursor-pointer text-sm ${n.status === 'unread' ? 'bg-blue-50/30 font-semibold' : 'text-on-surface-variant'}`}
                          >
                            <p>{n.message}</p>
                            <span className="text-[10px] text-neutral-400 block mt-1">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {user.role === 'admin' && (
                <Link to="/admin" className="font-button text-label-sm text-secondary border-b border-secondary hover:opacity-70">
                  Admin
                </Link>
              )}
              <Link to="/orders" className="font-button text-label-sm text-on-surface-variant hover:opacity-70">
                Orders
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-4 py-2 border border-outline-variant rounded-lg font-button text-button hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex items-center gap-1 px-4 py-2 border border-outline-variant rounded-lg font-button text-button hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
      <VisualSearchModal isOpen={isVisualSearchOpen} onClose={() => setIsVisualSearchOpen(false)} />
    </header>
  );
}
