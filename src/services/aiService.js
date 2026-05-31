import api from './api';

export const trackEvent = async (eventData) => {
  try {
    // Only log if not already logging (optional throttle)
    await api.post('/events/log', eventData);
  } catch (err) {
    // Silent fail for analytics
    console.error("Tracking error:", err);
  }
};

export const fetchRecommendations = () => api.get('/recommendations');
export const chatQuery = (data) => api.post('/chatbot/query', data);
export const fetchLiveActivity = () => api.get('/activity');

export const visualSearch = (formData) => api.post('/ai/visual-search', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const getSmartSummary = (productId) => api.get(`/ai/summary/${productId}`);

// ── Python AI Microservice Calls ───────────────────────────────────────────
export const orchestrateQuery = (query) => api.post('/ai/orchestrate', { query });
export const analyzeReviews = (reviews) => api.post('/ai/analyze-reviews', { reviews });
export const generateSmartSummary = (productData) => api.post('/ai/smart-summary', productData);
