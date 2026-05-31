import { useEffect, useState } from 'react';
import { fetchMyOrders, verifyPayment } from '../services/api';
import { socket } from '../services/socket';
import toast from 'react-hot-toast';

const TRACKING_STEPS = ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then(({ data }) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    socket.on('order_updated', (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    });

    return () => {
      socket.off('order_updated');
    };
  }, []);

  const handleRetryPayment = async (order) => {
    if (!order.razorpayOrderId) {
      toast.error('Cannot retry payment for this order.');
      return;
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SkQ1Lb5E1byEvM',
      amount: order.totalAmount * 100,
      currency: 'INR',
      name: 'ProductGo',
      description: 'Retry Payment',
      order_id: order.razorpayOrderId,
      handler: async function (response) {
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast.success('Payment successful!');
          setOrders(prev => prev.map(o => o._id === order._id ? { ...o, paymentStatus: 'paid' } : o));
        } catch (err) {
          toast.error('Payment verification failed');
          setOrders(prev => prev.map(o => o._id === order._id ? { ...o, paymentStatus: 'failed' } : o));
        }
      },
      theme: { color: '#000000' },
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      toast.error(response.error.description || 'Payment Failed');
      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, paymentStatus: 'failed' } : o));
    });
    rzp.open();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLACED': return 'bg-yellow-100 text-yellow-800';
      case 'PACKED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-6">
        <div className="h-8 skeleton rounded w-48 mb-8" />
        {[1, 2, 3].map(i => <div key={i} className="h-48 skeleton rounded-xl w-full" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">receipt_long</span>
        <h2 className="font-h2 text-h2 text-primary mb-2">No Orders Yet</h2>
        <p className="font-body-md text-on-surface-variant mb-8">When you place orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="font-h1 text-h1 text-primary mb-12">My Orders</h1>

      <div className="space-y-8">
        {orders.map((order) => {
          const currentStepIdx = TRACKING_STEPS.indexOf(order.orderStatus);
          const isCancelled = order.orderStatus === 'CANCELLED';

          return (
            <div key={order._id} className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="bg-surface-container-low px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30">
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">Order Placed</p>
                    <p className="font-body-md font-medium text-primary">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">Total</p>
                    <p className="font-body-md font-medium text-primary">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">Order #</p>
                    <p className="font-body-md font-medium text-primary">{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">Payment</p>
                    <div className="flex items-center gap-2">
                      <p className={`font-body-md font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-error'}`}>
                        {order.paymentStatus || 'pending'}
                      </p>
                      {(order.paymentStatus === 'pending' || order.paymentStatus === 'failed') && (
                        <button onClick={() => handleRetryPayment(order)} className="px-2 py-0.5 bg-primary text-white text-[10px] uppercase tracking-widest rounded hover:opacity-90 transition-opacity">
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Tracking Bar */}
              {!isCancelled && (
                <div className="px-6 py-8 border-b border-outline-variant/30 overflow-x-auto">
                  <div className="flex items-center justify-between min-w-[600px] relative">
                    {/* Background line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-outline-variant/30 -translate-y-1/2 z-0" />
                    {/* Progress line */}
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out"
                      style={{ width: `${currentStepIdx > 0 ? (currentStepIdx / (TRACKING_STEPS.length - 1)) * 100 : 0}%` }}
                    />
                    
                    {TRACKING_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      
                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${isCompleted ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-surface-container text-outline'}`}>
                            {isCompleted ? <span className="material-symbols-outlined text-[16px] font-bold">check</span> : <span className="w-2 h-2 rounded-full bg-outline-variant" />}
                          </div>
                          <span className={`text-[10px] font-bold tracking-wider ${isCurrent ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {step.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="p-6">
                <div className="space-y-6">
                  {order.products.map((item) => (
                    <div key={item._id} className="flex gap-4">
                      <div className="w-20 aspect-[3/4] bg-surface-container rounded overflow-hidden shrink-0">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-outline text-sm">image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-body-md font-bold text-primary mb-1">{item.product?.name || 'Unknown Product'}</h4>
                        <p className="text-label-sm text-on-surface-variant mb-2">Qty: {item.quantity}</p>
                        <p className="font-body-md font-medium text-primary">₹{item.product?.price?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
