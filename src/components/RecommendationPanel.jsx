import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Sparkles } from 'lucide-react';

export default function RecommendationPanel({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary px-1">
        <Sparkles size={12} />
        Top 3 AI Recommended Matches
      </div>
      <div className="grid grid-cols-1 gap-3">
        {products.map((p, idx) => (
          <div 
            key={idx} 
            className="group bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/20"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0">
                <img src={`https://source.unsplash.com/400x400/?${p.category},${p.name}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-neutral-900 truncate">{p.name}</h4>
                <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed italic">
                  "{p.reasoning}"
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-bold text-primary">₹{p.price.toLocaleString()}</span>
                  <Link 
                    to={`/product/${p.id}`} 
                    className="text-[10px] font-bold px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-primary transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
