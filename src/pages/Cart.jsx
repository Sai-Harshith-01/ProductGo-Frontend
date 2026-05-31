import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';

export default function Cart() {
  const { items, updateQty, removeItem, total, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const cartTotal = total();

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">shopping_bag</span>
        <h2 className="font-h2 text-h2 text-primary mb-2">Your Bag is Empty</h2>
        <p className="font-body-md text-on-surface-variant mb-8">Looks like you haven't added anything yet.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-primary text-white font-button px-8 py-3 rounded-lg uppercase tracking-widest hover:opacity-90 transition-all"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="font-h1 text-h1 text-primary mb-12">Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-8">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-6 pb-8 border-b border-outline-variant/30">
              {/* Image */}
              <div className="w-32 aspect-[3/4] bg-surface-container rounded-lg overflow-hidden shrink-0 cursor-pointer" onClick={() => navigate(`/product/${item.productId}`)}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline">image</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-body-lg font-bold text-primary cursor-pointer hover:underline" onClick={() => navigate(`/product/${item.productId}`)}>
                    {item.name}
                  </h3>
                  <button onClick={() => removeItem(item.productId)} className="text-outline hover:text-error transition-colors p-1">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
                
                <p className="font-label-sm text-on-surface-variant mb-auto">{item.category}</p>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-outline-variant rounded-lg">
                    <button
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="p-2 hover:bg-surface-container transition-colors rounded-l-lg text-primary"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="px-4 font-button text-primary">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      className="p-2 hover:bg-surface-container transition-colors rounded-r-lg text-primary"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                  <span className="font-h3 font-bold text-primary">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-low p-8 rounded-xl sticky top-24">
            <h2 className="font-h3 text-h3 text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8 font-body-md text-on-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="h-px bg-outline-variant/30 my-4" />
              <div className="flex justify-between font-bold text-primary text-lg">
                <span>Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-primary text-white font-button px-6 py-4 rounded-lg uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Checkout'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
