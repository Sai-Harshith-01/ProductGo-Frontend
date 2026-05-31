import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

/**
 * ProductCard — Premium design with glassmorphism, dynamic hover effects, and micro-animations.
 * Props: product { _id, name, price, category, images, stock }
 */
export default function ProductCard({ product }) {
  const navigate   = useNavigate();
  const addItem    = useCartStore((s) => s.addItem);

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to bag`);
  };

  return (
    <div
      className="group relative flex flex-col bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] cursor-pointer"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* Glow Effect behind the card on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low/50">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container-high/50">
            <span className="material-symbols-outlined text-5xl text-outline/50">image</span>
          </div>
        )}

        {/* Gradient Overlay for Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Out of stock badge */}
        {product.stock === 0 && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-error/90 backdrop-blur-md text-on-error text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
              Sold Out
            </span>
          </div>
        )}

        {/* Wishlist btn */}
        <div className="absolute top-4 right-4 z-10 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
            onClick={(e) => { e.stopPropagation(); toast.success('Added to wishlist!'); }}
          >
            <span className="material-symbols-outlined text-primary text-[18px] transition-colors hover:text-error">favorite</span>
          </button>
        </div>

        {/* Quick Add Button on Image Hover */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10 w-[90%]">
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="w-full py-3 bg-white/90 backdrop-blur-md rounded-xl font-button text-primary hover:bg-primary hover:text-white transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-5 flex flex-col flex-grow relative z-10 bg-white/50 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[12px] font-semibold text-secondary uppercase tracking-widest mb-1">
            {product.category || 'Collection'}
          </p>
          <div className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md">
            <span className="material-symbols-outlined text-[14px] text-amber-400" style={{ fontVariationSettings:"'FILL' 1" }}>star</span>
            <span className="text-label-sm font-bold text-primary">4.9</span>
          </div>
        </div>

        <h3 className="font-h3 text-[18px] leading-tight font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2 mb-4">
          {product.name}
        </h3>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <span className="text-label-sm text-on-surface-variant block mb-1">Price</span>
            <span className="font-h3 text-[20px] font-extrabold text-primary">
              ₹{product.price.toFixed(2)}
            </span>
          </div>
          
          {/* Subtle Add to Cart Icon (for mobile or small screens without hover) */}
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-secondary hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed group-hover:shadow-md md:hidden"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
