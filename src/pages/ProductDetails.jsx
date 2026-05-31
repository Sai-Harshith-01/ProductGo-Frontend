import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProductById, fetchProducts } from '../services/api';
import { trackEvent } from '../services/aiService';
import { useCartStore } from '../store/cartStore';
import SkeletonCard from '../components/SkeletonCard';
import AiSummary from '../components/AiSummary';
import AISummaryCard from '../components/AISummaryCard';

export default function ProductDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const addItem  = useCartStore((s) => s.addItem);

  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [qty,      setQty]      = useState(1);

  useEffect(() => {
    setLoading(true);
    setImgIdx(0);
    fetchProductById(id)
      .then(({ data }) => {
        setProduct(data);
        // load related by same category
        if (data.category) {
          fetchProducts({ category: data.category, limit: 4 })
            .then((r) => setRelated((r.data.products || []).filter((p) => p._id !== id)))
            .catch(() => {});
        }
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, qty);
    toast.success(`${product.name} added to bag`);
    
    // Log AI event
    trackEvent({
      eventType: "cart",
      productId: product._id,
      category: product.category
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter animate-pulse">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/5] skeleton rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square skeleton rounded-lg" />
              <div className="aspect-square skeleton rounded-lg" />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-8 skeleton rounded w-3/4" />
            <div className="h-12 skeleton rounded w-1/2" />
            <div className="h-4 skeleton rounded w-full" />
            <div className="h-4 skeleton rounded w-full" />
            <div className="h-14 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : [null];

  return (
    <div className="bg-surface text-on-surface font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:items-start">

          {/* ── Images (matches product_details_page_1 layout) ──── */}
          <section className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/5] overflow-hidden rounded-lg bg-surface-container">
              {images[imgIdx] ? (
                <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                  <span className="material-symbols-outlined text-7xl text-outline">image</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`aspect-square overflow-hidden rounded-lg bg-surface-container border-2 transition-colors ${i === imgIdx ? 'border-primary' : 'border-transparent'}`}
                  >
                    {img
                      ? <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-surface-container-high" />
                    }
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ── Details ──────────────────────────────────────────── */}
          <section className="lg:col-span-5 lg:sticky lg:top-24 space-y-stack-md">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
              <span>New Arrival</span>
              <span>•</span>
              <span>{product.category || 'General'}</span>
            </div>

            <div className="space-y-stack-sm">
              <h1 className="font-h1 text-h1 text-primary">{product.name}</h1>
              <p className="font-h2 text-h2 text-primary">₹{product.price.toFixed(2)}</p>
            </div>

            {/* Rating (static) */}
            <div className="flex items-center gap-4 py-2 border-y border-outline-variant">
              <div className="flex items-center text-primary">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings:"'FILL' 1" }}>star</span>
                ))}
                <span className="material-symbols-outlined text-[20px]">star</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">4.8 (124 Reviews)</span>
            </div>

            {/* Description */}
            {/* AI Intelligence Report */}
            <div className="mb-stack-md">
              <AISummaryCard product={product} />
            </div>

            {product.description && (
              <div className="space-y-4">
                <h3 className="font-h3 text-h3 text-primary">Description</h3>
                <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* AI Summary */}
            <AiSummary productId={product._id} />

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-error'}`} />
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Qty + Add (desktop) */}
            <div className="hidden lg:block pt-stack-md space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-outline-variant rounded-lg">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-3 hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="px-6 font-button text-button">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-3 hover:bg-surface-container transition-colors" disabled={product.stock === 0}>
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-5 bg-primary text-on-primary rounded-lg font-button text-button uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? 'Sold Out' : `Add to Bag — ₹${(product.price * qty).toFixed(2)}`}
              </button>
            </div>
          </section>
        </div>

        {/* ── Complete the Look (related products) ─────────────────── */}
        {related.length > 0 && (
          <section className="mt-stack-lg border-t border-neutral-100 pt-stack-lg">
            <h2 className="font-h2 text-h2 text-primary mb-stack-md">Complete The Look</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              {related.map((p) => (
                <div
                  key={p._id}
                  className="group space-y-4 cursor-pointer"
                  onClick={() => navigate(`/product/${p._id}`)}
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-container">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full bg-surface-container-high" />
                    }
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-body-md text-body-md text-primary group-hover:underline">{p.name}</h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">₹{p.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md z-[60] border-t border-neutral-100 px-margin-mobile py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full py-4 bg-primary text-on-primary rounded-lg font-button text-button uppercase tracking-widest active:scale-95 duration-150 transition-all disabled:opacity-40"
        >
          {product.stock === 0 ? 'Sold Out' : `Add to Bag — ₹${(product.price * qty).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
