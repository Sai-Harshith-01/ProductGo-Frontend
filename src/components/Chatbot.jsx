import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, ShoppingCart } from 'lucide-react';
import { chatQuery } from '../services/aiService';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Chatbot() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I am your AI Stylist. I can speak English, Hindi (नमस्ते) and Telugu (నమస్కారం). How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await chatQuery({ message: userMsg, userId: user?.id });
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: res.data.message, 
        products: res.data.products 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-[60] md:bottom-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#0f0f0f] p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-primary" />
                <span className="font-bold">AI Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.type === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                    {m.text}
                    {m.products && m.products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {m.products.map(p => (
                          <Link to={`/product/${p._id}`} key={p._id} className="flex items-center gap-2 bg-white p-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                            <img src={p.images?.[0]} alt="" className="w-10 h-10 object-cover rounded" />
                            <div className="flex-1 overflow-hidden">
                              <p className="font-bold text-xs truncate">{p.name}</p>
                              <p className="text-primary font-bold text-[10px]">₹{p.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                placeholder="English, हिंदी or తెలుగు..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <button type="submit" className="bg-[#0f0f0f] text-white p-2 rounded-xl hover:bg-primary transition-all">
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#0f0f0f] text-white flex items-center justify-center shadow-2xl hover:bg-primary transition-colors relative"
      >
        <MessageSquare size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white animate-pulse" />
      </motion.button>
    </div>
  );
}
