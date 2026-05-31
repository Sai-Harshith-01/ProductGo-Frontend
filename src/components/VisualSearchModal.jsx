import { useState } from 'react';
import { visualSearch } from '../services/aiService';
import ProductCard from './ProductCard';

export default function VisualSearchModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      handleUpload(selected);
    }
  };

  const handleUpload = async (selectedFile) => {
    setLoading(true);
    setResults([]);
    setMessage('');
    
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await visualSearch(formData);
      setResults(res.data.products);
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong with the visual search.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              Visual Discovery
            </h2>
            <p className="text-neutral-500 text-sm">Upload an image to find similar items</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {!file && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
              <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-primary">add_a_photo</span>
              </div>
              <p className="text-lg font-semibold text-neutral-900">Click to upload or drag and drop</p>
              <p className="text-sm text-neutral-500 mt-2">Any product photo or lifestyle image</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Analysis Status */}
              <div className="flex items-center gap-6 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                {file && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md">
                    <img src={URL.createObjectURL(file)} alt="Upload" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  {loading ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 text-primary font-bold">
                        <span className="animate-spin material-symbols-outlined">refresh</span>
                        AI is analyzing your image...
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-1/2 animate-shimmer"></div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">{message}</h3>
                      <button 
                        onClick={() => { setFile(null); setResults([]); }}
                        className="text-primary text-sm font-semibold hover:underline mt-1"
                      >
                        Try another photo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Results Grid */}
              {!loading && results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}

              {!loading && results.length === 0 && !message.includes('Something') && (
                <div className="text-center py-10">
                  <p className="text-neutral-500">No matching products found. Try a different category!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
