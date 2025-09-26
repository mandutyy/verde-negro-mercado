import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

// Hook para obtener plantas con caché optimizado
export const usePlants = (filters?: { category?: string; userId?: string; excludeUserId?: boolean }) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['plants', filters],
    queryFn: async () => {
      let query = supabase
        .from('plants')
        .select('*')
        .in('status', ['active', 'reserved']);

      // Aplicar filtros
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.excludeUserId && user) {
        query = query.neq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos sin recargar
    gcTime: 10 * 60 * 1000, // 10 minutos en caché
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: true
  });
};

// Hook para obtener una planta específica
export const usePlant = (plantId?: string) => {
  return useQuery({
    queryKey: ['plant', plantId],
    queryFn: async () => {
      if (!plantId) return null;
      
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('id', plantId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!plantId
  });
};

// Hook para favoritos con caché
export const useFavorites = (plantId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isFavorite = false } = useQuery({
    queryKey: ['favorite', user?.id, plantId],
    queryFn: async () => {
      if (!user || !plantId) return false;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('plant_id', plantId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!user && !!plantId
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user || !plantId) throw new Error('Missing user or plantId');

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('plant_id', plantId);
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, plant_id: plantId }]);
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (newFavoriteStatus) => {
      // Actualizar caché inmediatamente
      queryClient.setQueryData(['favorite', user?.id, plantId], newFavoriteStatus);
      
      // Invalidar la lista de favoritos del usuario
      queryClient.invalidateQueries({ queryKey: ['userFavorites', user?.id] });

      toast({
        title: newFavoriteStatus ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: newFavoriteStatus 
          ? "La planta se ha añadido a tus favoritos"
          : "La planta se ha eliminado de tus favoritos"
      });
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos",
        variant: "destructive"
      });
    }
  });

  return {
    isFavorite,
    loading: toggleFavoriteMutation.isPending,
    toggleFavorite: () => {
      if (!user) {
        toast({
          title: "Inicia sesión",
          description: "Debes iniciar sesión para marcar favoritos",
          variant: "destructive"
        });
        return;
      }
      toggleFavoriteMutation.mutate();
    }
  };
};

// Hook para obtener favoritos del usuario
export const useUserFavorites = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userFavorites', user?.id],
    queryFn: async () => {
      if (!user) return [];

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
      
      return data?.filter(fav => fav.plants) || [];
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!user
  });
};

// Hook para plantas del usuario
export const useUserPlants = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userPlants', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!user
  });
};

// Hook para precargar datos críticos
export const usePrefetchData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const prefetchPlants = () => {
    queryClient.prefetchQuery({
      queryKey: ['plants', { excludeUserId: true }],
      queryFn: async () => {
        let query = supabase
          .from('plants')
          .select('*')
          .in('status', ['active', 'reserved']);

        if (user) {
          query = query.neq('user_id', user.id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      },
      staleTime: 5 * 60 * 1000
    });
  };

  const prefetchUserData = () => {
    if (!user) return;

    // Precargar favoritos
    queryClient.prefetchQuery({
      queryKey: ['userFavorites', user.id],
      queryFn: async () => {
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
        return data?.filter(fav => fav.plants) || [];
      },
      staleTime: 3 * 60 * 1000
    });

    // Precargar plantas del usuario
    queryClient.prefetchQuery({
      queryKey: ['userPlants', user.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      staleTime: 3 * 60 * 1000
    });
  };

  return {
    prefetchPlants,
    prefetchUserData
  };
};