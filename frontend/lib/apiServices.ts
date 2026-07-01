// Auth API
import {
  authApi,
  productApi,
  cartApi,
  orderApi,
  paymentApi,
  notificationApi,
  aiBuddyApi,
  sellerApi,
} from './api';

export const authAPI = {
  register: async (data: {
    username?: string;
    email: string;
    password: string;
    fullName: { firstName: string; lastName: string };
  }) => authApi.post('/api/auth/register', data),

  login: async (email: string, password: string) =>
    authApi.post('/api/auth/login', { email, password }),

  logout: () => authApi.post('/api/auth/logout'),

  getCurrentUser: () => authApi.get('/api/auth/me'),
  updateProfile: async (data: any) => authApi.patch('/api/auth/me', data),

  addAddress: async (address: any) => authApi.post('/api/auth/users/me/addresses', address),

  getAddresses: () => authApi.get('/api/auth/users/me/addresses'),

  updateAddress: async (id: string, data: any) =>
    authApi.put(`/api/auth/users/me/addresses/${id}`, data),

  deleteAddress: async (id: string) => authApi.delete(`/api/auth/users/me/addresses/${id}`),
};

// Product API
export const productAPI = {
  getProducts: async (params?: any) => productApi.get('/api/products/', { params }),

  getProductById: async (id: string) => productApi.get(`/api/products/${id}`),

  searchProducts: async (query: string) =>
    productApi.get('/api/products/', { params: { q: query } }),

  getProductsByCategory: async (category: string) =>
    productApi.get('/api/products/', { params: { category } }),

  createProduct: async (data: any) => productApi.post('/api/products/', data),

  updateProduct: async (id: string, data: any) =>
    productApi.put(`/api/products/${id}`, data),

  deleteProduct: async (id: string) => productApi.delete(`/api/products/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => cartApi.get('/api/cart'),

  addItem: async (productId: string, quantity: number) =>
    cartApi.post('/api/cart/items', { productId, qty: quantity }),

  updateItem: async (productId: string, quantity: number) =>
    cartApi.patch(`/api/cart/items/${productId}`, { qty: quantity }),

  removeItem: async (productId: string) =>
    cartApi.delete(`/api/cart/items/${productId}`),

  clearCart: () => cartApi.delete('/api/cart'),
};

// Order API
export const orderAPI = {
  createOrder: async (data: any) => orderApi.post('/api/orders', data),

  getOrders: () => orderApi.get('/api/orders/me'),

  getOrderById: async (id: string) => orderApi.get(`/api/orders/${id}`),

  cancelOrder: async (id: string) =>
    orderApi.post(`/api/orders/${id}/cancel`),

  updateShippingAddress: async (id: string, address: any) =>
    orderApi.patch(`/api/orders/${id}/address`, { address }),
};

// Payment API
export const paymentAPI = {
  createRazorpayOrder: async (orderId: string, amount: number) =>
    paymentApi.post('/api/payments/razorpay/order', { orderId, amount }),

  verifyPayment: async (data: any) =>
    paymentApi.post('/api/payments/razorpay/verify', data),

  getPaymentByOrder: async (orderId: string) =>
    paymentApi.get(`/api/payments/order/${orderId}`),
};

// Seller Dashboard API
export const sellerAPI = {
  getMetrics: () => sellerApi.get('/api/seller/dashboard/metrics'),

  getOrders: () => sellerApi.get('/api/seller/dashboard/orders'),

  getProducts: () => sellerApi.get('/api/seller/dashboard/products'),
};
