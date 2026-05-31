import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { createPaymentOrder, verifyPayment, demoPayment } from '../services/api';

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const cartTotal = total();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  const handlePayment = async () => {
    setLoading(true);
    try {
      const payload = {
        products: items.map(i => ({ product: i.productId, quantity: i.quantity }))
      };

      if (isDemoMode) {
        // Mock loading time
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        await demoPayment(payload);
        toast.success('Payment Successful (Demo Mode)! Order Placed.');
        clearCart();
        navigate('/orders');
        return;
      }
      
      // 1. Create Razorpay order
      const { data: orderParams } = await createPaymentOrder(payload);

      // 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SkQ1Lb5E1byEvM', // Provide fallback from backend env
        amount: orderParams.amount,
        currency: orderParams.currency,
        name: 'ProductGo',
        description: 'Order Payment',
        order_id: orderParams.razorpayOrderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful & Order placed!');
            clearCart();
            navigate('/orders');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#000000',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description || 'Payment Failed');
      });
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex flex-col items-center mb-8">
        <h1 className="font-h2 text-h2 text-primary text-center">Secure Checkout</h1>
        {isDemoMode && (
          <span className="mt-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-yellow-200">
            Demo Mode Enabled (No real payment)
          </span>
        )}
      </div>
      
      <div className="bg-surface-container-low p-8 rounded-xl shadow-sm">
        <h2 className="font-h3 mb-4">Order Summary</h2>
        <div className="space-y-4 mb-8">
          {items.map(item => (
            <div key={item.productId} className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                <div>
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-sm text-on-surface-variant">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <span className="font-h3">Total Amount</span>
          <span className="font-h2 font-bold text-primary">₹{cartTotal.toFixed(2)}</span>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary text-white font-button px-6 py-4 rounded-lg uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isDemoMode ? (
            'Pay Now (Demo Mode)'
          ) : (
            'Pay with Razorpay'
          )}
        </button>
      </div>
    </div>
  );
}
