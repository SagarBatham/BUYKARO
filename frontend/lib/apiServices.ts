// Auth API
import api from './api';

export const authAPI = {
  register: async (data: {
    username?: string;
    email: string;
    password: string;
    fullName: { firstName: string; lastName: string };
  }) => api.post('/api/auth/register', data),

  login: async (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  logout: () => api.post('/api/auth/logout'),

  getCurrentUser: () => api.get('/api/auth/me'),

  addAddress: async (address: any) => api.post('/api/auth/addresses', address),

  getAddresses: () => api.get('/api/auth/addresses'),

  updateAddress: async (id: string, data: any) =>
    api.put(`/api/auth/addresses/${id}`, data),

  deleteAddress: async (id: string) => api.delete(`/api/auth/addresses/${id}`),
};

// Product API
export const productAPI = {
  getProducts: async (params?: any) => api.get('/api/products', { params }),

  getProductById: async (id: string) => api.get(`/api/products/${id}`),

  searchProducts: async (query: string) =>
    api.get('/api/products', { params: { q: query } }),

  getProductsByCategory: async (category: string) =>
    api.get('/api/products', { params: { category } }),

  createProduct: async (data: any) => api.post('/api/products', data),

  updateProduct: async (id: string, data: any) =>
    api.put(`/api/products/${id}`, data),

  deleteProduct: async (id: string) => api.delete(`/api/products/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/api/cart'),

  addItem: async (productId: string, quantity: number) =>
    api.post('/api/cart/items', { productId, qty: quantity }),

  updateItem: async (productId: string, quantity: number) =>
    api.put(`/api/cart/items/${productId}`, { qty: quantity }),

  removeItem: async (productId: string) =>
    api.delete(`/api/cart/items/${productId}`),

  clearCart: () => api.delete('/api/cart'),
};

// Order API
export const orderAPI = {
  createOrder: async (data: any) => api.post('/api/orders', data),

  getOrders: () => api.get('/api/orders/me'),

  getOrderById: async (id: string) => api.get(`/api/orders/${id}`),

  cancelOrder: async (id: string) =>
    api.post(`/api/orders/${id}/cancel`),

  updateShippingAddress: async (id: string, address: any) =>
    api.patch(`/api/orders/${id}/address`, { address }),
};

// Payment API
export const paymentAPI = {
  createRazorpayOrder: async (orderId: string, amount: number) =>
    api.post('/api/payments/razorpay/order', { orderId, amount }),

  verifyPayment: async (data: any) =>
    api.post('/api/payments/razorpay/verify', data),
};

// Seller Dashboard API
export const sellerAPI = {
  getMetrics: () => api.get('/api/seller/dashboard/metrics'),

  getOrders: () => api.get('/api/seller/dashboard/orders'),

  getProducts: () => api.get('/api/seller/dashboard/products'),
};
