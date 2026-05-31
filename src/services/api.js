import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — auto logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────
export const loginUser    = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);

// ── Products ─────────────────────────────────────────────────────
export const fetchProducts  = (params) => api.get('/products', { params });
export const fetchProductById = (id)   => api.get(`/products/${id}`);
export const createProduct  = (data)   => api.post('/products', data);
export const updateProduct  = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct  = (id)     => api.delete(`/products/${id}`);

// ── Upload ───────────────────────────────────────────────────────
export const uploadImage = (id, formData) =>
  api.post(`/upload/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const bulkUploadProducts = (formData) =>
  api.post('/products/bulk-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// ── Payments & Orders ────────────────────────────────────────────
export const createPaymentOrder = (data) => api.post('/payment/create-order', data);
export const verifyPayment      = (data) => api.post('/payment/verify', data);
export const demoPayment        = (data) => api.post('/payment/demo', data);

export const fetchMyOrders = (params) => api.get('/orders/my', { params });

export const fetchAllOrders   = (params)  => api.get('/admin/orders', { params });
export const updateOrderStatus = (id, status) =>
  api.put(`/admin/orders/${id}/status`, { status });
export const updatePaymentStatus = (id, paymentStatus) =>
  api.put(`/admin/orders/${id}/payment`, { paymentStatus });

export const getDashboardStats = () => api.get('/admin/dashboard-stats');
export const fetchAllUsers = (params) => api.get('/admin/users', { params });
export const blockUser = (id) => api.put(`/admin/users/${id}/block`);

// ── Notifications ────────────────────────────────────────────────
export const fetchMyNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

// ── AI Services ──────────────────────────────────────────────────
export const generateAIProductSummary = (data) => api.post('/ai/smart-summary', data);

export default api;
