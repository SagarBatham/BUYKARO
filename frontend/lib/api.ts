import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store';

const normalizeUrl = (url: string) => url.replace(/\/$/, '')

const API_BASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
const AUTH_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_AUTH_SERVICE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
);
const PRODUCT_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
);
const CART_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_CART_SERVICE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
);
const NOTIFICATION_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'
);
const PAYMENT_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_PAYMENT_SERVICE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
);
const ORDER_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_ORDER_SERVICE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
);
const AI_BUDDY_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_AI_BUDDY_SERVICE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'
);
const SELLER_DASHBOARD_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_SELLER_DASHBOARD_SERVICE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007'
);

const createApiClient = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const api: AxiosInstance = createApiClient(API_BASE_URL);
const authApi: AxiosInstance = createApiClient(AUTH_BASE_URL);
const productApi: AxiosInstance = createApiClient(PRODUCT_BASE_URL);
const cartApi: AxiosInstance = createApiClient(CART_BASE_URL);
const orderApi: AxiosInstance = createApiClient(ORDER_BASE_URL);
const paymentApi: AxiosInstance = createApiClient(PAYMENT_BASE_URL);
const notificationApi: AxiosInstance = createApiClient(NOTIFICATION_BASE_URL);
const aiBuddyApi: AxiosInstance = createApiClient(AI_BUDDY_BASE_URL);
const sellerApi: AxiosInstance = createApiClient(SELLER_DASHBOARD_BASE_URL);

export { authApi, productApi, cartApi, orderApi, paymentApi, notificationApi, aiBuddyApi, sellerApi };
export default api;
