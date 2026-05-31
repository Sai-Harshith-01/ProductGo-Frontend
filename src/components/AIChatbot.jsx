import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, Zap, Brain } from 'lucide-react';
import { orchestrateQuery } from '../services/aiService';
import RecommendationPanel from './RecommendationPanel';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI Shopping Advisor. I can understand English, Hindi, and Telugu. How can I assist you today?', mood: 'helpful' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await orchestrateQuery(userText);
      const { chat_response, recommendations, mood, intent } = res.data;

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: chat_response,
        recommendations: recommendations,
        mood: mood,
        intent: intent
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'I am currently recalibrating my brain. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl border border-neutral-100 flex flex-col overflow-hidden"
          >
            {/* AI Header */}
            <div className="p-4 bg-neutral-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Brain className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">ProductGo AI</h3>
                  <div className="flex items-center gap-1 text-[10px] text-primary">
                    <Zap size={10} fill="currentColor" />
                    <span>Autonomous Agent Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-neutral-50/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${
                    m.role === 'user' 
                      ? 'bg-neutral-900 text-white rounded-tr-none shadow-md' 
                      : 'bg-white text-neutral-800 rounded-tl-none border border-neutral-100 shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{m.content}</p>
                    
                    {/* Inline Intent/Mood Badges */}
                    {!m.role === 'user' && m.intent && (
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-neutral-100 text-[10px] font-bold rounded-full text-neutral-500 uppercase tracking-tighter">
                          Intent: {m.intent.intent_type}
                        </span>
                        <span className="px-2 py-0.5 bg-neutral-100 text-[10px] font-bold rounded-full text-neutral-500 uppercase tracking-tighter">
                          Mood: {m.mood.urgency}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Recommendations Injection */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="mt-4 w-full">
                      <RecommendationPanel products={m.recommendations} />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-neutral-100 shadow-sm flex gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-neutral-100 flex gap-3">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Talk to our Autonomous Agent..."
                className="flex-1 px-5 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button type="submit" className="p-3 bg-neutral-900 text-white rounded-2xl hover:bg-primary transition-all shadow-lg shadow-neutral-900/10">
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all group"
      >
        <div className="relative">
          <Brain size={32} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-4 border-neutral-900 group-hover:scale-110 transition-transform" />
        </div>
      </button>
    </div>
  );
}
