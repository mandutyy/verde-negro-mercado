import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = (plantId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if plant is favorited
  useEffect(() => {
    if (user && plantId) {
      checkFavoriteStatus();
    }
  }, [user, plantId]);

  const checkFavoriteStatus = async () => {
    if (!user || !plantId) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('plant_id', plantId)
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para marcar favoritos",
        variant: "destructive"
      });
      return;
    }

    if (!plantId) return;

    setLoading(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('plant_id', plantId);

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: "Eliminado de favoritos",
          description: "La planta se ha eliminado de tus favoritos"
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([
            {
              user_id: user.id,
              plant_id: plantId
            }
          ]);

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: "Añadido a favoritos",
          description: "La planta se ha añadido a tus favoritos"
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isFavorite,
    loading,
    toggleFavorite
  };
};

export const useUserFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          plant_id,
          created_at,
          plants (
            id,
            title,
            description,
            price,
            images,
            location,
            sale_type,
            status,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out favorites where the plant might have been deleted
      const validFavorites = data?.filter(fav => fav.plants) || [];
      setFavorites(validFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    refetch: fetchFavorites
  };
};