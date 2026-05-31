import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  fetchProducts, 
  uploadImage, 
  deleteProduct, 
  createProduct, 
  updateProduct, 
  generateAIProductSummary,
  bulkUploadProducts 
} from '../../services/api';
import { 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  Edit, 
  Search, 
  Sparkles, 
  Upload, 
  Download, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', price: '', description: '', category: '', stock: '' });
  const [newProductImages, setNewProductImages] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    fetchProducts({ limit: 100 })
      .then(res => setProducts(res.data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleImageUpload = async (productId, files) => {
    if (!files || files.length === 0) return;
    
    setUploadingId(productId);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await uploadImage(productId, formData);
      setProducts(products.map(p => p._id === productId ? { ...p, images: res.data.images } : p));
      toast.success('Images uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingId(null);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setBulkUploading(true);
    const formData = new FormData();
    formData.append('file', bulkFile);

    try {
      const res = await bulkUploadProducts(formData);
      toast.success(res.data.message);
      setShowBulkModal(false);
      setBulkFile(null);
      loadProducts(); // Reload to see new products
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk upload failed');
    } finally {
      setBulkUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "name,price,description,category,stock,images\n" +
                      "Modern Watch,2999,Premium AI-ready smartwatch,Electronics,50,\n" +
                      "Canvas Sneakers,1499,Casual comfort shoes,Fashion,100,";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleGenerateAI = async () => {
    if (!formData.name || !formData.category) {
      toast.error('Please provide Name and Category for AI generation');
      return;
    }
    
    setGeneratingAI(true);
    try {
      const res = await generateAIProductSummary({
        product_name: formData.name,
        category: formData.category,
        description: formData.description || 'New premium product'
      });
      
      if (res.data && res.data.summary) {
        setFormData(prev => ({
          ...prev,
          description: res.data.summary
        }));
        toast.success('Description generated with AI!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'AI generation failed';
      toast.error(msg);
      console.error('AI Error:', err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      let savedProduct;
      if (editingId) {
        const res = await updateProduct(editingId, payload);
        savedProduct = res.data;
      } else {
        const res = await createProduct(payload);
        savedProduct = res.data;
      }

      if (newProductImages && newProductImages.length > 0) {
        const imgData = new FormData();
        for (let i = 0; i < newProductImages.length; i++) {
          imgData.append('images', newProductImages[i]);
        }
        const uploadRes = await uploadImage(savedProduct._id, imgData);
        savedProduct.images = uploadRes.data.images;
      }

      if (editingId) {
        setProducts(products.map(p => p._id === editingId ? savedProduct : p));
        toast.success('Product updated successfully');
      } else {
        setProducts([savedProduct, ...products]);
        toast.success('Product created successfully');
      }
      
      closeModal();
    } catch (err) {
      toast.error(`Failed to ${editingId ? 'update' : 'create'} product`);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', description: '', category: '', stock: '' });
    setNewProductImages(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category || '',
      stock: product.stock
    });
    setNewProductImages(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.category && p.category.toLowerCase().includes(search.toLowerCase())));

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Products Management</h1>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your catalog, stock, and images.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setShowBulkModal(true)}
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Upload size={20} />
            Bulk Upload
          </button>
          <button 
            onClick={openAddModal} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-gray-500 mt-1">Get started by creating a new product or uploading a CSV.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product, idx) => (
            <motion.div 
              key={product._id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(idx * 0.05, 0.5) }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-900 relative group">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={48} opacity={0.5} />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  <label className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full cursor-pointer backdrop-blur-md transition-colors" title="Upload Images">
                    {uploadingId === product._id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImageIcon size={20} />
                    )}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(product._id, e.target.files)} />
                  </label>
                  <button onClick={() => openEditModal(product)} className="bg-blue-500/80 hover:bg-blue-500 text-white p-2 rounded-full backdrop-blur-md transition-colors" title="Edit">
                    <Edit size={20} />
                  </button>
                  <button onClick={() => handleDeleteProduct(product._id)} className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-colors" title="Delete">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-500">{product.category || 'General'}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock} in stock
                  </span>
                </div>
                <h4 className="font-bold text-lg leading-tight mb-1 line-clamp-1">{product.name}</h4>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="font-bold text-xl">₹{product.price.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">{product.images?.length || 0} images</span>
                </div>
              </div>
            </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <input required type="number" step="0.01" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input required type="number" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input required type="text" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Images {editingId && '(Leaves existing if empty)'}</label>
                <input type="file" multiple accept="image/*" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={e => setNewProductImages(e.target.files)} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">Description</label>
                  <button 
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={generatingAI}
                    className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    {generatingAI ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    Generate with AI
                  </button>
                </div>
                <textarea className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={closeModal} className="px-4 py-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium rounded-lg transition-colors">Save Product</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Bulk Upload Products</h2>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 flex gap-3 items-start">
              <Sparkles className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>AI Magic:</strong> If you leave the image column empty, our AI will automatically generate high-quality product images for you!
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">1. Download Template</label>
                <button 
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <Download size={18} className="text-gray-400" />
                  <span className="text-sm font-medium">Download CSV Template</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">2. Upload Filled CSV</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => setBulkFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-xl transition-colors ${bulkFile ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    <FileText size={32} className={bulkFile ? 'text-blue-600' : 'text-gray-400'} />
                    <p className="mt-2 text-sm font-medium">
                      {bulkFile ? bulkFile.name : 'Select or drop CSV file'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 py-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBulkUpload}
                  disabled={bulkUploading || !bulkFile}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {bulkUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Start Upload'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
