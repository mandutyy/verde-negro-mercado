import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import defaultProfileIcon from '@/assets/default-profile-icon.png';
import { Bookmark, ArrowLeft, Share2, Home, Plus, MessageCircle, User, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface Plant {
  id: string;
  title: string;
  description: string;
  price: number | null;
  location: string;
  images: string[];
  sale_type: string;
  exchange_for: string | null;
  user_id: string;
  created_at: string;
  status: string; // 'active' | 'reserved' | ...
}

interface Profile {
  name?: string;
  avatar_url?: string;
  bio?: string;
}

const Purchase = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [sellerProfile, setSellerProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlant();
    }
  }, [id, user]);

  const fetchPlant = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('id', id)
        .or(`status.in.(active,reserved),user_id.eq.${user?.id || 'null'}`)
        .maybeSingle();

      if (error) {
        console.error('Error fetching plant:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la planta",
          variant: "destructive"
        });
        return;
      }

      setPlant(data);

      // Fetch seller profile using secure function
      if (data.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .rpc('get_public_profile', { profile_user_id: data.user_id });

        if (!profileError && profileData && profileData.length > 0) {
          setSellerProfile({
            name: profileData[0].name,
            avatar_url: profileData[0].avatar_url,
            bio: null // Bio is not included in public profile data for security
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error inesperado",
        description: "Hubo un problema al cargar la planta",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!user || !plant) {
      navigate('/auth');
      return;
    }

    if (user.id === plant.user_id) {
      toast({
        title: "No puedes contactarte contigo mismo",
        description: "Esta es tu planta",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if conversation already exists between these two users
      const { data: existingConversations } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${plant.user_id}),and(participant_1.eq.${plant.user_id},participant_2.eq.${user.id})`);

      if (existingConversations && existingConversations.length > 0) {
        // Navigate to existing conversation
        navigate(`/chat/${existingConversations[0].id}`);
        return;
      }

      // Try to create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert([
          {
            participant_1: user.id,
            participant_2: plant.user_id,
            plant_id: plant.id,
          },
        ])
        .select()
        .single();

      if (error) {
        // If duplicate error, fetch the existing conversation
        if (error.code === '23505') {
          const { data: existingConv } = await supabase
            .from('conversations')
            .select('*')
            .or(`and(participant_1.eq.${user.id},participant_2.eq.${plant.user_id}),and(participant_1.eq.${plant.user_id},participant_2.eq.${user.id})`)
            .single();
          
          if (existingConv) {
            navigate(`/chat/${existingConv.id}`);
            return;
          }
        }
        throw error;
      }

      navigate(`/chat/${newConversation.id}`);
    } catch (error) {
      console.error('Error opening chat:', error);
      toast({
        title: "Error al abrir chat",
        description: "Hubo un problema al abrir la conversación",
        variant: "destructive"
      });
    }
  };

  const handleReserve = async () => {
    if (!user || !plant) {
      navigate('/auth');
      return;
    }

    if (user.id === plant.user_id) {
      toast({
        title: "No puedes reservar tu propia planta",
        description: "Esta es tu planta",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if reservation already exists
      const { data: existingReservation } = await supabase
        .from('reservations')
        .select('*')
        .eq('plant_id', plant.id)
        .eq('requester_id', user.id)
        .maybeSingle();

      if (existingReservation) {
        toast({
          title: "Ya has enviado una solicitud",
          description: "Ya tienes una reserva pendiente para esta planta",
        });
        return;
      }

      // Create reservation request
      const { error } = await supabase
        .from('reservations')
        .insert([
          {
            plant_id: plant.id,
            requester_id: user.id,
            seller_id: plant.user_id,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description: "El vendedor recibirá tu solicitud de reserva",
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Error al crear reserva",
        description: "Hubo un problema al enviar la solicitud",
        variant: "destructive"
      });
    }
  };

  const goHome = () => navigate('/');
  const goToAdd = () => navigate('/upload');
  const goToChat = () => navigate('/messages');
  const goToProfile = () => navigate('/profile');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground mt-2">Cargando planta...</p>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Planta no encontrada</h2>
          <p className="text-muted-foreground mb-4">Esta planta no existe o ya no está disponible</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

const canPurchase = plant.sale_type.includes('sell') && plant.price;
const canExchange = plant.sale_type.includes('exchange');
const isOwner = user?.id === plant.user_id;

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background font-spline justify-between overflow-x-hidden">
      <div className="flex-grow">
        {/* Hero Image Section */}
        <div className="relative">
          {/* Header Buttons */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
            <Button
              onClick={() => navigate(-1)}
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
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Hero Image */}
          <div className="relative h-[400px] w-full">
            {plant.images && plant.images.length > 0 && (
              <>
                <div 
                  className="absolute inset-0 bg-center bg-no-repeat bg-cover cursor-pointer" 
                  style={{ backgroundImage: `url("${plant.images[currentImageIndex]}")` }}
                  onClick={() => setImageModalOpen(true)}
                ></div>

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
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-white text-3xl font-bold leading-tight tracking-tight">{plant.title}</h1>
              <p className="text-lg font-bold text-primary mt-2">
                {canPurchase ? `€${plant.price}` : canExchange ? 'Intercambio' : 'Disponible'}
              </p>
            </div>
          </div>

          <p className="text-gray-300 text-base font-normal leading-relaxed mt-4">
            {plant.description}
          </p>

          <div className="mt-8">
            <h3 className="text-white text-lg font-bold leading-tight tracking-tight mb-4">Información del vendedor</h3>
            <div 
              className="flex items-center gap-4 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => navigate(`/user-profile/${plant.user_id}`)}
            >
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-16 w-16 border-4 border-primary bg-muted"
                style={{ 
                  backgroundImage: `url("${sellerProfile?.avatar_url || defaultProfileIcon}")` 
                }}
              ></div>
              <div>
                <p className="text-white text-lg font-semibold leading-normal">
                  {sellerProfile?.name || `Usuario ${plant.user_id.slice(-4)}`}
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
            <Button 
              onClick={() => navigate(`/plant/${plant.id}`)}
              className="flex w-full items-center justify-center rounded-full h-14 px-6 bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90"
            >
              <span className="truncate">Editar</span>
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleReserve}
                className="flex w-full items-center justify-center rounded-full h-14 px-6 bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90"
              >
                <span className="truncate">Reservar</span>
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

        {/* Bottom Navigation */}
        <div className="flex gap-2 border-t border-border px-4 pb-3 pt-2">
          <button 
            onClick={goHome}
            className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-white"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button 
            onClick={goToAdd}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-secondary"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">Add</span>
          </button>
          <button 
            onClick={goToChat}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-secondary"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs font-medium">Chat</span>
          </button>
          <button 
            onClick={goToProfile}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-secondary"
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
          <button
            onClick={() => setImageModalOpen(false)}
            className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          {plant?.images && (
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit
              wheel={{ smoothStep: 0.01 }}
              pinch={{ step: 5 }}
              doubleClick={{ disabled: false, step: 0.7 }}
            >
              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full flex items-center justify-center"
              >
                <img
                  src={plant.images[currentImageIndex]}
                  alt={plant.title}
                  className="w-full h-full object-contain"
                />
              </TransformComponent>
            </TransformWrapper>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Purchase;