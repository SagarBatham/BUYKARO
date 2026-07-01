import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useAuthStore, useCartStore } from '@/store';
import { authAPI, cartAPI, productAPI } from '@/lib/apiServices';

export const useAuth = () => {
  const { user, setUser, setToken, logout } = useAuthStore();
  const { setItems: setCartItems } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        logout();
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();
        const currentUser = response.data?.user || response.data?.data;
        if (currentUser) {
          setUser(currentUser);
          setToken(token);

          try {
            const cartResponse = await cartAPI.getCart();
            const backendItems = cartResponse.data?.cart?.items || cartResponse.data?.items || [];
            const normalizedBackendItems = Array.isArray(backendItems)
              ? await Promise.all(
                  backendItems.map(async (item: any) => {
                    const productId = item.productId?.toString?.() || item.product?.toString?.();
                    let title = item.title || item.product?.title || '';
                    let price = Number(item.price?.amount ?? item.price ?? 0);
                    const quantity = item.quantity || item.qty || 1;

                    if ((!title || !price) && productId) {
                      try {
                        const productResponse = await productAPI.getProductById(productId);
                        const product = productResponse.data?.product || productResponse.data?.data;
                        title = title || product?.title || '';
                        price = price || Number(product?.price?.amount || 0);
                      } catch (productError) {
                        console.warn('Failed to load product details during auth cart sync:', productId, productError);
                      }
                    }

                    return {
                      productId,
                      title,
                      price,
                      quantity,
                    };
                  })
                )
              : [];

            if (normalizedBackendItems.length > 0) {
              setCartItems(normalizedBackendItems);
            } else {
              const localCartItems = useCartStore.getState().items;
              if (localCartItems.length > 0) {
                await Promise.all(
                  localCartItems.map((item) => cartAPI.addItem(item.productId, item.quantity))
                );
              }
            }
          } catch (syncError) {
            console.warn('Failed to synchronize cart with backend:', syncError);
          }
        } else {
          logout();
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return { user, loading };
};
