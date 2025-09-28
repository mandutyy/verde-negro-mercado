import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DataProviderProps {
  children: ReactNode;
}

const DataContext = createContext<{}>({});

export const useDataContext = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }: DataProviderProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Precargar datos críticos cuando el usuario se autentica
  useEffect(() => {
    if (!user) return;

    const prefetchData = async () => {
      try {
        // Precargar plantas públicas (excluyendo las del usuario)
        queryClient.prefetchQuery({
          queryKey: ['plants', { excludeUserId: true }],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('plants')
              .select('*')
              .in('status', ['active', 'reserved'])
              .neq('user_id', user.id)
              .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
          },
          staleTime: 5 * 60 * 1000, // 5 minutos
        });

        // Precargar todas las plantas (para búsquedas)
        queryClient.prefetchQuery({
          queryKey: ['plants', {}],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('plants')
              .select('*')
              .in('status', ['active', 'reserved'])
              .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
          },
          staleTime: 5 * 60 * 1000,
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
          staleTime: 3 * 60 * 1000,
        });

        // Precargar favoritos del usuario
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
          staleTime: 3 * 60 * 1000,
        });

        // Precargar conversaciones
        queryClient.prefetchQuery({
          queryKey: ['conversations', user.id],
          queryFn: async () => {
            const { data, error } = await supabase
              .rpc('get_conversations_with_last_message', { user_uuid: user.id });

            if (error) throw error;
            return data || [];
          },
          staleTime: 2 * 60 * 1000,
        });

      } catch (error) {
        console.error('Error prefetching data:', error);
      }
    };

    // Precargar inmediatamente
    prefetchData();

    // Precargar cada vez que el usuario cambie de pestaña y vuelva
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        prefetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, queryClient]);

  return (
    <DataContext.Provider value={{}}>
      {children}
    </DataContext.Provider>
  );
};