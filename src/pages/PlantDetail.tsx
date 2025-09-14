import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Eye, Clock, Star, MessageCircle, Share, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPlant = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch plant data
        const { data: plantData, error: plantError } = await supabase
          .from('plants')
          .select('*')
          .eq('id', id)
          .eq('status', 'active')
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

        // Increment view count
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
  }, [id]);
  
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
      
      // Buscar conversación existente
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${plant.user_id}),and(participant_1.eq.${plant.user_id},participant_2.eq.${user.id})`)
        .maybeSingle();
      
      if (existingConversation) {
        navigate(`/chat/${existingConversation.id}`);
      } else {
        // Crear nueva conversación
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert([{
            participant_1: user.id,
            participant_2: plant.user_id
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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const mainImage = plant.images && plant.images.length > 0 ? plant.images[0] : '/placeholder.svg';
  const sellerName = seller?.name || `Usuario ${plant.user_id.slice(0, 8)}`;

  return (
    <div className="min-h-screen bg-[#122118] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#122118]/95 backdrop-blur border-b border-[#366348]">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-[#1b3124]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className="text-white hover:bg-[#1b3124]"
            >
              <Heart 
                className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
              />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-[#1b3124]"
            >
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pb-32">
        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <img 
              src={mainImage}
              alt={plant.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Image indicators */}
          {plant.images && plant.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-2">
                {plant.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-6">
          {/* Title and Price */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {plant.title}
            </h1>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-[#38e07b]">
                {getPlantTypeLabel(plant.sale_type, plant.price)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {plant.views_count || 0}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(plant.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="h-4 w-4" />
            <span>{plant.location}</span>
          </div>

          {/* Category Badge */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-[#264532] text-[#38e07b] border-[#366348]">
              {getCategoryLabel(plant.category)}
            </Badge>
          </div>

          {/* Plant Details */}
          <Card className="bg-[#1b3124] border-[#366348]">
            <CardHeader>
              <CardTitle className="text-white">Detalles de la planta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Categoría</div>
                  <div className="font-medium text-white">{getCategoryLabel(plant.category)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Estado</div>
                  <div className="font-medium text-white">{plant.status === 'active' ? 'Disponible' : 'No disponible'}</div>
                </div>
              </div>
              
              <Separator className="bg-[#366348]" />
              
              <div>
                <div className="text-sm text-gray-400 mb-2">Descripción</div>
                <p className="text-white leading-relaxed">
                  {plant.description}
                </p>
              </div>

              {plant.exchange_for && (
                <>
                  <Separator className="bg-[#366348]" />
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Busca a cambio</div>
                    <p className="text-white leading-relaxed">
                      {plant.exchange_for}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card className="bg-[#1b3124] border-[#366348]">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={seller?.avatar_url || ''} />
                  <AvatarFallback className="bg-[#264532] text-white">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-white">
                    {sellerName}
                  </h3>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-white">4.8</span>
                    <span className="text-sm text-gray-400">
                      (125 valoraciones)
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div>Miembro desde {new Date(plant.created_at).toLocaleDateString('es-ES')}</div>
                    <div>Responde rápidamente</div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#366348] text-white hover:bg-[#264532]"
                  onClick={() => navigate(`/user-profile/${plant.user_id}`)}
                >
                  Ver perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#122118] border-t border-[#366348]">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={handleContact}
            className="w-full bg-[#38e07b] hover:bg-[#2dc76a] text-[#122118] font-bold"
            size="lg"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Contactar con {sellerName}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;