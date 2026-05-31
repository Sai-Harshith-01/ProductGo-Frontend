import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../services/api';
import { Sun, Moon, Eye, EyeOff } from 'lucide-react';

// Password strength helper
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'bg-red-500', 'bg-yellow-400', 'bg-blue-400', 'bg-secondary'];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw]     = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password !== form.confirm)              { toast.error('Passwords do not match');     return; }
    if (!agreed)                                      { toast.error('Please accept the terms');   return; }
    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-background dark:bg-gray-900 transition-colors duration-300">
        
        {/* Theme Toggle Button */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="fixed top-6 right-6 z-[60] p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-primary dark:text-yellow-400 hover:scale-110 transition-all"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* ── Left panel ─────── */}
        <section className="relative w-full md:w-5/12 lg:w-2/5 bg-primary-container dark:bg-gray-800 text-on-tertiary p-8 md:p-12 flex flex-col justify-between overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-on-secondary-container/20 rounded-full blur-[120px]" />
          <div className="relative z-10">
            <div className="text-xl font-bold tracking-widest uppercase text-white font-h1 mb-12">ProductGo</div>
            <div className="space-y-4 max-w-sm">
              <h1 className="font-h1 text-4xl text-white leading-tight">Create Account</h1>
              <p className="font-body-lg text-on-primary-container dark:text-gray-400 max-w-xs">
                Join our community of innovators and start building your future today with professional grade tools.
              </p>
            </div>
          </div>
        </section>

        {/* ── Right form panel ──────────────────────────────────────── */}
        <section className="flex-grow bg-surface dark:bg-gray-900 p-8 md:p-12 lg:p-24 flex items-center justify-center transition-colors duration-300">
          <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400" htmlFor="full-name">Full Name</label>
                <input
                  id="full-name" type="text" placeholder="Enter your full name"
                  value={form.name} onChange={set('name')}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-body-md text-on-surface dark:text-white focus:outline-none focus:border-secondary transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400" htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email" type="email" placeholder="name@company.com"
                  value={form.email} onChange={set('email')}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-body-md text-on-surface dark:text-white focus:outline-none focus:border-secondary transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400" htmlFor="reg-pw">Password</label>
                <div className="relative">
                  <input
                    id="reg-pw" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    value={form.password} onChange={set('password')}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-body-md text-on-surface dark:text-white focus:outline-none focus:border-secondary transition-all"
                  />
                  <button type="button" onClick={() => setShowPw((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-on-surface transition-colors">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Strength indicator */}
                {form.password && (
                  <div className="pt-2 flex flex-col gap-2">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex-1 rounded-full transition-colors ${i <= strength ? STRENGTH_COLORS[strength] : 'bg-gray-200 dark:bg-gray-700'}`} />
                      ))}
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${strength >= 3 ? 'text-secondary' : 'text-gray-500 dark:text-gray-400'}`}>
                      {STRENGTH_LABELS[strength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400" htmlFor="confirm-pw">Confirm Password</label>
                <input
                  id="confirm-pw" type="password" placeholder="••••••••"
                  value={form.confirm} onChange={set('confirm')}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-body-md text-on-surface dark:text-white focus:outline-none focus:border-secondary transition-all"
                />
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-[11px] text-red-500 font-bold">Passwords do not match</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="terms">
                  I agree to the <a href="#" className="text-secondary font-bold hover:underline">Terms</a> and{' '}
                  <a href="#" className="text-secondary font-bold hover:underline">Privacy Policy</a>.
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full bg-[#0f0f0f] dark:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Sign Up'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary dark:text-blue-400 font-bold hover:underline">Log in</Link>
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
