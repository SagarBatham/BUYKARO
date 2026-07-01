import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { authAPI } from '@/lib/apiServices';

export const useAuth = () => {
  const { user, setUser, setToken, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data.data);
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return { user, loading };
};
