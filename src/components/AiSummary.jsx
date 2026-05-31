import { useEffect, useState } from 'react';
import { getSmartSummary } from '../services/aiService';

export default function AiSummary({ productId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      getSmartSummary(productId)
        .then((res) => setSummary(res.data))
        .catch(() => setSummary(null))
        .finally(() => setLoading(false));
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 animate-pulse space-y-3">
        <div className="h-6 bg-primary/10 rounded w-1/3" />
        <div className="h-4 bg-primary/10 rounded w-full" />
        <div className="h-4 bg-primary/10 rounded w-2/3" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden group">
      {/* Decorative Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold tracking-tighter uppercase shadow-lg">
        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
        AI Smart Pulse
      </div>

      <h3 className="font-h3 text-h3 text-primary flex items-center gap-2 mb-4">
        AI Highlights
      </h3>

      <p className="text-on-surface-variant font-body-md italic mb-6 leading-relaxed">
        "{summary.summary}"
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-green-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Why Users Love It
          </h4>
          <ul className="space-y-2">
            {summary.pros.map((pro, i) => (
              <li key={i} className="text-sm text-on-surface-variant flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                {pro}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-orange-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">info</span>
            Things to Note
          </h4>
          <ul className="space-y-2">
            {summary.cons.map((con, i) => (
              <li key={i} className="text-sm text-on-surface-variant flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-primary/10">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-xl">verified</span>
          <span className="text-sm font-bold">{summary.verdict}</span>
        </div>
      </div>
    </div>
  );
}
