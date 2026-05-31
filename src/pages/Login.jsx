import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Sun, Moon, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const login      = useAuthStore((s) => s.login);

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="bg-background dark:bg-gray-900 text-on-background dark:text-gray-100 font-body-md min-h-screen flex flex-col md:flex-row transition-colors duration-300">
        
        {/* Theme Toggle Button */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="fixed top-6 right-6 z-[60] p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-primary dark:text-yellow-400 hover:scale-110 transition-all"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* ── Left brand panel ──────── */}
        <section className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-white dark:bg-gray-800 px-6 transition-colors duration-300">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="text-2xl font-bold tracking-widest uppercase text-primary dark:text-blue-400 font-h1 mb-6">ProductGo</div>
            <h2 className="font-h1 text-4xl text-primary dark:text-white tracking-tight mb-4">Welcome Back</h2>
            <p className="font-body-md text-on-surface-variant dark:text-gray-400 max-w-sm">
              Enter your credentials to access your personalized dashboard and shop your favorites.
            </p>
          </div>
        </section>

        {/* ── Right form panel ──────────────────────────────────────── */}
        <section className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6 py-12 z-20 transition-colors duration-300">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl border border-white/50 dark:border-gray-700 transition-all">

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-xs font-bold text-primary dark:text-blue-400 hover:underline underline-offset-4">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0f0f0f] dark:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Sign In'}
                </button>
              </div>

              {/* Register link */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-primary dark:text-blue-400 hover:underline">
                  Create Account
                </Link>
              </p>
            </form>
          </div>
        </section>

        {/* Minimal footer */}
        <footer className="fixed bottom-0 left-0 w-full p-6 hidden md:block z-10 pointer-events-none">
          <div className="flex justify-between items-center max-w-7xl mx-auto opacity-40 text-gray-600 dark:text-gray-400">
            <p className="text-xs">© 2026 ProductGo</p>
            <div className="flex gap-6 pointer-events-auto">
              <a className="text-xs hover:underline underline-offset-4" href="#">Privacy</a>
              <a className="text-xs hover:underline underline-offset-4" href="#">Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
