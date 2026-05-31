import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import { fetchRecommendations } from '../services/aiService';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import Footer from '../components/Footer';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recent, setRecent] = useState([]);
  const [topCategory, setTopCategory] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // Parallel fetch for speed
    Promise.all([
      fetchProducts({ limit: 4, sort: '-createdAt' }),
      fetchRecommendations()
    ])
    .then(([prodRes, recRes]) => {
      setProducts(prodRes.data.products || []);
      setRecommended(recRes.data.recommended || []);
      setRecent(recRes.data.recentlyViewed || []);
      setTopCategory(recRes.data.topCategory);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center bg-[#f8f9fa] overflow-hidden">
        <div className="absolute inset-0 z-0 flex justify-end items-center">
          <div className="w-1/2 h-full hidden md:block">
            <img
              src="/images/hero.png"
              alt="Shop Smart. Track Better."
              className="w-full h-full object-cover object-left"
            />
          </div>
          {/* Mobile Background */}
          <div className="w-full h-full md:hidden absolute inset-0 opacity-20">
            <img
              src="/images/hero.png"
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f8f9fa] via-[#f8f9fa]/80 to-transparent z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              ProductGo Experience
            </span>
            <h1 className="font-h1 text-5xl md:text-7xl font-bold text-[#0f0f0f] mb-6 leading-[1.1]">
              Shop Smart.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Track Better.</span>
            </h1>
            <p className="font-body-lg text-lg text-gray-600 mb-10 max-w-lg leading-relaxed">
              A seamless shopping experience with real-time order tracking, secure payments, and modern aesthetics.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                to="/products"
                className="bg-[#0f0f0f] text-white font-button text-button px-10 py-4 rounded-lg hover:bg-gray-800 transition-all uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto text-center"
              >
                Shop Now
              </Link>
              <Link
                to="/products"
                className="bg-white text-[#0f0f0f] border border-gray-200 font-button text-button px-10 py-4 rounded-lg hover:bg-gray-50 transition-all uppercase tracking-widest w-full sm:w-auto text-center"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ──────────────────────────────────────────── */}
      <section className="py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">local_shipping</span>
              </div>
              <h3 className="font-h3 text-xl font-bold text-[#0f0f0f] mb-2">Real-Time Tracking</h3>
              <p className="text-gray-500 text-sm max-w-xs">Track your orders instantly with live status updates directly to your dashboard.</p>
            </div>
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h3 className="font-h3 text-xl font-bold text-[#0f0f0f] mb-2">Secure Payments</h3>
              <p className="text-gray-500 text-sm max-w-xs">Experience bank-grade security with seamless Razorpay checkout integration.</p>
            </div>
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <h3 className="font-h3 text-xl font-bold text-[#0f0f0f] mb-2">Fast Delivery</h3>
              <p className="text-gray-500 text-sm max-w-xs">Get your products delivered quickly with our optimized shipping network.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-h2 text-3xl font-bold text-[#0f0f0f] mb-2">Featured Products</h2>
            <p className="font-body-md text-gray-500">Handpicked selections for you.</p>
          </div>
          <Link
            to="/products"
            className="font-button text-sm text-secondary font-bold hover:text-primary transition-colors flex items-center gap-1"
          >
            Explore All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length > 0
            ? products.map((p) => <ProductCard key={p._id} product={p} />)
            : (
              <div className="col-span-4 text-center py-12 text-gray-500">
                No products yet. <Link to="/admin" className="text-secondary underline">Add some from admin →</Link>
              </div>
            )
          }
        </div>
      </section>

      {/* ── AI Personalized Recommendations ────────────────────────────── */}
      {!loading && recommended.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-6 border-t border-gray-100">
          <div className="mb-12">
            <h2 className="font-h2 text-3xl font-bold text-[#0f0f0f] mb-2">Recommended for You</h2>
            <p className="font-body-md text-gray-500">
              {topCategory ? `Based on your interest in ${topCategory}` : "Personalized picks based on your activity."}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommended.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Recently Viewed ────────────────────────────────────────────── */}
      {!loading && recent.length > 0 && (
        <section className="py-24 bg-gray-50 overflow-hidden">
           <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="font-h2 text-3xl font-bold text-[#0f0f0f] mb-2">Based on your activity</h2>
              <p className="font-body-md text-gray-500">Continue where you left off.</p>
            </div>
            <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
              {recent.map((p) => (
                <div key={p._id} className="min-w-[280px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
           </div>
        </section>
      )}

      {/* ── Category Banners ──────────────────────────────────────────── */}
      <section className="py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-h2 text-3xl font-bold text-[#0f0f0f] mb-4">Shop by Category</h2>
            <p className="font-body-md text-gray-500 max-w-xl mx-auto">
              Find exactly what you're looking for with our dedicated collections.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link to="/products?category=Electronics" className="group relative h-[400px] overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-shadow">
              <img src="/images/electronics.png" alt="Electronics" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <span className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">Collection</span>
                <h3 className="font-h3 text-3xl font-bold text-white mb-4">Electronics</h3>
                <span className="font-button text-sm bg-white text-[#0f0f0f] px-6 py-2 rounded-full w-max flex items-center gap-2 group-hover:bg-primary group-hover:text-white transition-colors">
                  Shop Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>
            
            <Link to="/products?category=Fashion" className="group relative h-[400px] overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-shadow">
              <img src="/images/fashion.png" alt="Fashion" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <span className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">Trend</span>
                <h3 className="font-h3 text-3xl font-bold text-white mb-4">Fashion</h3>
                <span className="font-button text-sm bg-white text-[#0f0f0f] px-6 py-2 rounded-full w-max flex items-center gap-2 group-hover:bg-primary group-hover:text-white transition-colors">
                  Shop Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>

            <Link to="/products?category=Accessories" className="group relative h-[400px] overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
              <img src="/images/accessories.png" alt="Accessories" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <span className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">Essentials</span>
                <h3 className="font-h3 text-3xl font-bold text-white mb-4">Accessories</h3>
                <span className="font-button text-sm bg-white text-[#0f0f0f] px-6 py-2 rounded-full w-max flex items-center gap-2 group-hover:bg-primary group-hover:text-white transition-colors">
                  Shop Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 bg-white/80 backdrop-blur-md border-t border-neutral-100 z-50 md:hidden shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
        <Link to="/"         className="flex flex-col items-center text-primary"><span className="material-symbols-outlined" style={{ fontVariationSettings:"'FILL' 1" }}>storefront</span><span className="text-[10px] font-bold uppercase tracking-widest mt-1">Shop</span></Link>
        <Link to="/products" className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">search</span><span className="text-[10px] font-medium uppercase tracking-widest mt-1">Explore</span></Link>
        <Link to="/cart"     className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">shopping_bag</span><span className="text-[10px] font-medium uppercase tracking-widest mt-1">Bag</span></Link>
        <Link to="/login"    className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">person</span><span className="text-[10px] font-medium uppercase tracking-widest mt-1">Profile</span></Link>
      </nav>
    </div>
  );
}
