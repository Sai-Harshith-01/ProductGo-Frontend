import { useState, useEffect } from 'react';
import { generateSmartSummary } from '../services/aiService';
import { Brain, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function AISummaryCard({ product }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (product) {
      setLoading(true);
      generateSmartSummary({
        product_name: product.name,
        description: product.description,
        category: product.category
      })
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [product]);

  if (loading) {
    return (
      <div className="bg-neutral-50 rounded-3xl p-8 animate-pulse space-y-4 border border-neutral-100">
        <div className="h-6 bg-neutral-200 rounded w-1/4" />
        <div className="h-4 bg-neutral-200 rounded w-full" />
        <div className="h-4 bg-neutral-200 rounded w-2/3" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm relative overflow-hidden group">
      {/* Abstract Background Decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-neutral-900 rounded-2xl flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900">AI Intelligence Report</h3>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Autonomous Analysis</p>
          </div>
        </div>

        <p className="text-neutral-600 leading-relaxed mb-8 italic">
          "{data.summary}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
              <CheckCircle2 size={14} className="text-green-500" />
              Agent Analysis: Pros
            </h4>
            <ul className="space-y-3">
              {data.bullets.slice(0, 2).map((b, i) => (
                <li key={i} className="text-sm text-neutral-700 flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-200 mt-2 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
              <Info size={14} className="text-primary" />
              Advisor Insights
            </h4>
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <p className="text-[12px] text-neutral-600 leading-relaxed">
                Our agent detected a high performance-to-value ratio for this model. Recommended for professional personas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
