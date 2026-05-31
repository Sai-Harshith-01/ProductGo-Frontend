import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Zap } from 'lucide-react';
import { fetchLiveActivity } from '../services/aiService';

export default function LiveFeed() {
  const [activities, setActivities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const res = await fetchLiveActivity();
        if (res.data && res.data.length > 0) {
          setActivities(res.data);
        }
      } catch (err) {
        console.error("Live feed error:", err);
      }
    };

    loadActivity();
    const interval = setInterval(loadActivity, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activities.length);
    }, 5000); // Switch display every 5s
    return () => clearInterval(interval);
  }, [activities]);

  const current = activities[currentIndex];

  return (
    <div className="fixed bottom-36 left-6 z-[60] pointer-events-none md:bottom-10">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/80 backdrop-blur-md border border-gray-100 p-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-[280px]"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Zap size={14} className="fill-current" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <Zap size={10} /> Live Activity
              </p>
              <p className="text-xs font-bold text-gray-800 line-clamp-1">{current.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
