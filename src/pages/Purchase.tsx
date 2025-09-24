import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import defaultProfileIcon from '@/assets/default-profile-icon.png';
import { Bookmark, ArrowLeft, Share2, Home, Plus, MessageCircle, User } from 'lucide-react';

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
      // Check if conversation exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .or(
          `and(participant_1.eq.${user.id},participant_2.eq.${plant.user_id}),and(participant_1.eq.${plant.user_id},participant_2.eq.${user.id})`
        )
        .maybeSingle();

      if (existingConversation) {
        // Navigate to existing conversation
        navigate(`/chat/${existingConversation.id}`);
      } else {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert([
            {
              participant_1: user.id,
              participant_2: plant.user_id,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        navigate(`/chat/${newConversation.id}`);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast({
        title: "Error al abrir chat",
        description: "Hubo un problema al abrir la conversación",
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
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
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
                  className="absolute inset-0 bg-center bg-no-repeat bg-cover" 
                  style={{ backgroundImage: `url("${plant.images[currentImageIndex]}")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>

                {plant.status === 'reserved' && !isOwner && (
                  <div className="absolute bottom-4 right-4 z-20">
                    <div className="flex items-center gap-1 bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      <Bookmark className="h-4 w-4 fill-purple-600" />
                      Reservado
                    </div>
                  </div>
                )}
                {/* Thumbnail Images */}
                {plant.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex gap-2">
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
              <span className="text-3xl font-bold text-primary mt-2 inline-block">
                {canPurchase ? `€${plant.price}` : canExchange ? 'Intercambio' : 'Disponible'}
              </span>
            </div>
          </div>

          <p className="text-muted-foreground text-base font-normal leading-relaxed mt-4">
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

      {/* Contact Button */}
      <div className="sticky bottom-20 p-4">
        <Button 
          onClick={handleContact}
          className="flex w-full items-center justify-center rounded-full h-14 px-6 bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90"
        >
          <span className="truncate">Contact Seller</span>
        </Button>
      </div>
    </div>
  );
};

export default Purchase;