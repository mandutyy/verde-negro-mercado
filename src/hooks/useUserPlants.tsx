import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Plant {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  exchange_for: string | null;
  location: string;
  sale_type: string;
  images: string[];
  status: string;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useUserPlants = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadUserPlants = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlants(data || []);
    } catch (error) {
      console.error('Error loading user plants:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus plantas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlant = async (plantId: string, updates: Partial<Plant>) => {
    try {
      const { error } = await supabase
        .from('plants')
        .update(updates)
        .eq('id', plantId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Update local state
      setPlants(prev => prev.map(plant => 
        plant.id === plantId ? { ...plant, ...updates } : plant
      ));

      toast({
        title: "¡Actualizado!",
        description: "Los cambios se han guardado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error updating plant:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la planta",
        variant: "destructive"
      });
      return false;
    }
  };

  const deletePlant = async (plantId: string) => {
    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', plantId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Update local state
      setPlants(prev => prev.filter(plant => plant.id !== plantId));

      toast({
        title: "¡Eliminado!",
        description: "La planta ha sido eliminada correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error deleting plant:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la planta",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    loadUserPlants();
  }, [user]);

  return {
    plants,
    loading,
    loadUserPlants,
    updatePlant,
    deletePlant
  };
};