import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Eye, Clock, Star, Share, User, Pencil, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useApi';
import EditPlantDialog from '@/components/EditPlantDialog';
import ContactButton from '@/components/ContactButton';

interface Plant {
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

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
}

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, loading: favoriteLoading, toggleFavorite } = useFavorites(id);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditPlant = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleBack = () => {
    // If there is no meaningful history, go home
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  const handleUpdatePlant = async (plantId: string, updates: Partial<Plant>) => {
    try {
      const { error } = await supabase
        .from('plants')
        .update(updates)
        .eq('id', plantId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Update local state
      setPlant(prev => prev ? { ...prev, ...updates } : null);

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

  const handleDeletePlant = async (plantId: string) => {
    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', plantId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "¡Eliminado!",
        description: "La planta ha sido eliminada correctamente",
      });

      navigate('/profile');
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
    const fetchPlant = async () => {
      if (!id || !user) return;
      
      setLoading(true);
      try {
        // Fetch plant data relying on RLS: owners can see their own plants, others ven activas
        const { data: plantData, error: plantError } = await supabase
          .from('plants')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (plantError) throw plantError;
        
        if (!plantData) {
          setLoading(false);
          return;
        }

        setPlant(plantData);

        // Fetch seller profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', plantData.user_id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          setSeller(profileData);
        }

        // Increment view count (ignored on failure due to RLS for non-owners)
        await supabase
          .from('plants')
          .update({ views_count: (plantData.views_count || 0) + 1 })
          .eq('id', id);

      } catch (error) {
        console.error('Error fetching plant:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la planta",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [id, user]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#122118] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-[#122118] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Planta no encontrada</h1>
          <Button 
            onClick={() => navigate('/')}
            className="bg-[#38e07b] hover:bg-[#2dc76a] text-[#122118] font-bold"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const handleContact = async () => {
    if (!plant || !seller) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      
      // Don't allow contacting yourself
      if (user.id === plant.user_id) {
        toast({
          title: "No puedes contactarte a ti mismo",
          description: "Esta es tu propia publicación",
          variant: "destructive"
        });
        return;
      }
      
      // Check if a conversation already exists for this specific plant
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('plant_id', plant.id)
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${plant.user_id}),and(participant_1.eq.${plant.user_id},participant_2.eq.${user.id})`)
        .maybeSingle();
      
      if (existingConversation) {
        navigate(`/chat/${existingConversation.id}`);
      } else {
        // Create new conversation with plant_id
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert([{
            participant_1: user.id,
            participant_2: plant.user_id,
            plant_id: plant.id
          }])
          .select()
          .single();
        
        if (newConversation) {
          navigate(`/chat/${newConversation.id}`);
        }
      }
    } catch (error) {
      console.error('Error al iniciar conversación:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la conversación",
        variant: "destructive"
      });
    }
  };

  const getPlantTypeLabel = (saleType: string, price: number | null) => {
    switch (saleType) {
      case 'sell':
        return price ? `€${price}` : 'Venta';
      case 'exchange':
        return 'Intercambio';
      case 'gift':
        return 'Regalo';
      case 'all':
        return price ? `€${price} · Intercambio · Regalo` : 'Todas las opciones';
      default:
        return 'Venta';
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, string> = {
      interior: '🌿 Plantas de Interior',
      exterior: '🌳 Plantas de Exterior',
      suculentas: '🌵 Suculentas y Cactus',
      frutales: '🍎 Árboles Frutales',
      aromaticas: '🌱 Plantas Aromáticas',
      flores: '🌸 Plantas con Flores',
      trepadoras: '🍃 Plantas Trepadoras',
      otras: '🌺 Otras Plantas'
    };
    return categoryLabels[category] || category;
  };

  const handleFavoriteClick = () => {
    toggleFavorite();
  };

  const handleReserve = async () => {
    if (!plant) return;
    
    try {
      const { error } = await supabase
        .from('plants')
        .update({ status: 'reserved' })
        .eq('id', plant.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Update local state
      setPlant(prev => prev ? { ...prev, status: 'reserved' } : null);

      toast({
        title: "¡Reservado!",
        description: "Tu planta ha sido marcada como reservada",
      });
    } catch (error) {
      console.error('Error reserving plant:', error);
      toast({
        title: "Error",
        description: "No se pudo reservar la planta",
        variant: "destructive"
      });
    }
  };

  const mainImage = plant.images && plant.images.length > 0 ? plant.images[0] : '/placeholder.svg';
  const sellerName = seller?.name || `Usuario ${plant.user_id.slice(0, 8)}`;
  const isOwner = user?.id === plant.user_id;

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background font-spline justify-between overflow-x-hidden">
      <div className="flex-grow">
        {/* Hero Image Section */}
        <div className="relative">
          {/* Header Buttons */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="text-white bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full"
            >
              <Share className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Hero Image */}
          <div className="relative h-[400px] w-full">
            {plant.images && plant.images.length > 0 && (
              <>
                <div 
                  className="absolute inset-0 bg-center bg-no-repeat bg-cover" 
                  style={{ backgroundImage: `url("${plant.images[currentImageIndex]}")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>

                {plant.status === 'reserved' && !isOwner && (
                  <div className="absolute top-20 right-4 z-20">
                    <div className="flex items-center gap-1 bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      <Bookmark className="h-4 w-4 fill-purple-600" />
                      Reservado
                    </div>
                  </div>
                )}

                {/* Thumbnail Images */}
                {plant.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                    {plant.images.slice(0, 3).map((image, index) => (
                      <div 
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-16 w-16 bg-center bg-no-repeat bg-cover rounded-lg cursor-pointer ${
                          currentImageIndex === index ? 'border-2 border-primary' : 'border-2 border-white'
                        }`}
                        style={{ backgroundImage: `url("${image}")` }}
                      ></div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 pb-32">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-white text-3xl font-bold leading-tight tracking-tight">{plant.title}</h1>
              <p className="text-lg font-bold text-primary mt-2">
                {getPlantTypeLabel(plant.sale_type, plant.price)}
              </p>
            </div>
          </div>

          <p className="text-gray-300 text-base font-normal leading-relaxed mt-4">
            {plant.description}
          </p>

          {plant.exchange_for && (
            <div className="mt-4">
              <h3 className="text-white text-sm font-bold mb-2">Busca a cambio:</h3>
              <p className="text-gray-300 text-sm">{plant.exchange_for}</p>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-white text-lg font-bold leading-tight tracking-tight mb-4">Información del vendedor</h3>
            <div 
              className="flex items-center gap-4 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => navigate(`/user-profile/${plant.user_id}`)}
            >
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-16 w-16 border-4 border-primary bg-muted"
                style={{ 
                  backgroundImage: `url("${seller?.avatar_url || '/placeholder.svg'}")` 
                }}
              ></div>
              <div>
                <p className="text-white text-lg font-semibold leading-normal">
                  {sellerName}
                </p>
                <p className="text-secondary text-base font-normal leading-normal">
                  {plant.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border">
        <div className="p-4 flex gap-4">
          {isOwner ? (
            <>
              <Button 
                onClick={handleEditPlant}
                className="flex w-full items-center justify-center rounded-full h-14 px-6 bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90"
              >
                <span className="truncate">Editar</span>
              </Button>
              <Button 
                onClick={handleReserve}
                disabled={plant.status === 'reserved'}
                className="flex w-full items-center justify-center rounded-full h-14 px-6 bg-white/10 text-white text-lg font-bold border border-white/20 hover:bg-white/20 disabled:opacity-50"
              >
                <span className="truncate">{plant.status === 'reserved' ? '✓ Reservado' : 'Reservar'}</span>
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleFavoriteClick}
                disabled={favoriteLoading}
                className="flex w-full items-center justify-center rounded-full h-14 px-6 bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90"
              >
                <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                <span className="truncate">{isFavorite ? 'Guardado' : 'Guardar'}</span>
              </Button>
              <Button 
                onClick={handleContact}
                className="flex w-full items-center justify-center rounded-full h-14 px-6 bg-white/10 text-white text-lg font-bold border border-white/20 hover:bg-white/20"
              >
                <span className="truncate">Contactar</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <EditPlantDialog
        plant={plant}
        isOpen={editDialogOpen}
        onClose={handleCloseEditDialog}
        onUpdate={handleUpdatePlant}
        onDelete={handleDeletePlant}
      />
    </div>
  );
};

export default PlantDetail;