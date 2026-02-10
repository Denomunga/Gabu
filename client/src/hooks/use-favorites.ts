import { useState, useEffect } from 'react';
import { Product } from '@shared/schema';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  // Check authentication status
  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem("token"));
    syncToken();

    const onAuthChanged = () => syncToken();
    const onFocus = () => syncToken();

    window.addEventListener("auth-changed", onAuthChanged as EventListener);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("auth-changed", onAuthChanged as EventListener);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  // Fetch favorites from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setFavorites([]);
        return;
      }

      const res = await axios.get(`${API_URL}/api/favorites`, {
        params: { _ts: Date.now() },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Extract product IDs from favorites response
      const favoriteIds = res.data
        .map((fav: any) => fav.productId?._id || fav.productId?.id || fav.productId)
        .filter(Boolean)
        .map((id: any) => id?.toString?.() ?? String(id));

      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (productId: string) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated - cannot add favorite');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(`${API_URL}/api/favorites`, 
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("useFavorites - Added favorite to server:", productId);
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  };

  const removeFavorite = async (productId: string) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated - cannot remove favorite');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      console.log("useFavorites - Removing favorite from server:", productId);
      await axios.delete(`${API_URL}/api/favorites/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("useFavorites - Removed favorite from server:", productId);
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated - cannot toggle favorite');
      return;
    }

    const normalizedProductId = productId?.toString?.() ?? String(productId);
    const currentlyFavorite = favorites.includes(normalizedProductId);
    console.log("useFavorites - Toggling favorite:", { productId, currentlyFavorite });

    setFavorites((prev) => {
      const exists = prev.includes(normalizedProductId);
      if (exists) return prev.filter((id) => id !== normalizedProductId);
      return [...prev, normalizedProductId];
    });

    try {
      if (currentlyFavorite) {
        await removeFavorite(normalizedProductId);
      } else {
        await addFavorite(normalizedProductId);
      }
      // Refetch to ensure server state is in sync
      await fetchFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Refetch to reset state on error
      await fetchFavorites();
    }
  };

  const isFavorite = (productId: string) => {
    const normalizedProductId = productId?.toString?.() ?? String(productId);
    return favorites.includes(normalizedProductId);
  };

  const sortProductsByFavorites = <T extends Product>(products: T[] | undefined): T[] => {
    if (!products) return [];
    
    return [...products].sort((a, b) => {
      const aId = (a._id || a.id)?.toString();
      const bId = (b._id || b.id)?.toString();
      
      if (!aId || !bId) return 0;
      
      const aIsFav = isFavorite(aId);
      const bIsFav = isFavorite(bId);
      
      // Favorites come first
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      return 0;
    });
  };

  return {
    favorites,
    loading,
    isAuthenticated,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    sortProductsByFavorites,
    refetch: fetchFavorites,
  };
}
