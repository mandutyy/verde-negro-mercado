import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { ArrowLeft, Star, Package, Heart, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PlantCard from '@/components/PlantCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const UserProfile = () => {
  const { username, id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        let userId = id;
        
        // Si es username, buscar el user_id
        if (username && !id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_id, name, avatar_url, bio, location')
            .eq('name', username)
            .maybeSingle();
          
          if (profileData) {
            userId = profileData.user_id;
            setProfile(profileData);
          }
        } else if (id) {
          // Si es ID, obtener el perfil
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_id, name, avatar_url, bio, location')
            .eq('user_id', id)
            .maybeSingle();
          
          setProfile(profileData);
        }

        if (userId) {
          // Obtener las plantas del usuario
          const { data: plantsData } = await supabase
            .from('plants')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false });
          
          setPlants(plantsData || []);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#122118] text-white">
        <Header title="Cargando perfil..." showBackButton />
        <div className="px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38e07b] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#122118] text-white">
        <Header title="Perfil no encontrado" showBackButton />
        <div className="px-4 py-8 text-center">
          <h2 className="text-xl font-semibold mb-4">
            Usuario no encontrado
          </h2>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Package, label: 'Publicadas', value: plants.length.toString() },
    { icon: Star, label: 'Valoración', value: '4.8' },
    { icon: Heart, label: 'Favoritos', value: '15' },
    { icon: MessageCircle, label: 'Intercambios', value: '6' }
  ];

  const handleContact = async () => {
    try {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      
      // Buscar conversación existente
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${currentUser.id},participant_2.eq.${profile.user_id}),and(participant_1.eq.${profile.user_id},participant_2.eq.${currentUser.id})`)
        .maybeSingle();
      
      if (existingConversation) {
        navigate(`/chat/${existingConversation.id}`);
      } else {
        // Crear nueva conversación
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert([{
            participant_1: currentUser.id,
            participant_2: profile.user_id
          }])
          .select()
          .single();
        
        if (newConversation) {
          navigate(`/chat/${newConversation.id}`);
        }
      }
    } catch (error) {
      console.error('Error al iniciar conversación:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#122118] text-white pb-32">
      <Header title={`Perfil de ${profile.name || 'Usuario'}`} showBackButton />
      
      <div className="px-4 py-4">
        {/* Profile Info */}
        <Card className="bg-[#1b3124] border-[#366348] shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-20 h-20 bg-center bg-no-repeat bg-cover rounded-full" 
                   style={{backgroundImage: `url("${profile.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'}")`}}>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{profile.name || 'Usuario'}</h2>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-[#f5d76e] text-[#f5d76e]" />
                  <span className="text-sm font-medium text-white">4.8</span>
                  <span className="text-sm text-[#96c5a9]">
                    (24 valoraciones)
                  </span>
                </div>
                <p className="text-sm text-[#96c5a9]">
                  Miembro desde Nov 2023
                </p>
                <p className="text-sm text-[#96c5a9]">
                  Responde en 2-3 horas
                </p>
              </div>
            </div>
            
            <p className="text-[#96c5a9] text-sm">
              {profile.bio || '🌱 Vendedor activo en la plataforma. Especializado en plantas de interior y exterior.'}
            </p>
            {profile.location && (
              <p className="text-[#96c5a9] text-sm mt-2">
                📍 {profile.location}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-[#1b3124] border-[#366348] shadow-sm">
                <CardContent className="p-4 text-center">
                  <Icon size={20} className="text-[#38e07b] mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-[#96c5a9]">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* User Plants */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Plantas de {profile.name || 'este usuario'}
          </h3>
          
          {plants.length === 0 ? (
            <Card className="bg-[#1b3124] border-[#366348] shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#366348] rounded-full mx-auto flex items-center justify-center mb-4">
                  <Package className="text-[#38e07b] h-8 w-8" />
                </div>
                <h4 className="text-white text-lg font-bold mb-2">
                  Sin plantas publicadas
                </h4>
                <p className="text-[#96c5a9] text-sm">
                  Este usuario aún no ha publicado ninguna planta
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {plants.slice(0, 6).map((plant) => (
                <div key={plant.id} className="relative group cursor-pointer" onClick={() => navigate(`/plant/${plant.id}`)}>
                  <div 
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-2xl"
                    style={{ backgroundImage: `url("${plant.images && plant.images[0] ? plant.images[0] : '/placeholder.svg'}")` }}
                  />
                  <div className="mt-2">
                    <p className="text-base font-medium leading-normal text-white">{plant.title}</p>
                    <p className="text-sm text-[#96c5a9]">{plant.location}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-sm font-semibold ${plant.sale_type?.includes('exchange') ? 'text-yellow-500' : 'text-[#38e07b]'}`}>
                        {plant.sale_type?.includes('exchange') ? 'Intercambio' : 'En venta'}
                      </p>
                      {plant.price && plant.sale_type?.includes('sell') && (
                        <p className="text-base font-bold text-white">
                          €{plant.price}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {plants.length > 6 && (
            <div className="text-center mt-4">
              <Button variant="outline" size="sm" className="border-[#366348] text-[#96c5a9] bg-[#1b3124] hover:bg-[#366348]">
                Ver todas ({plants.length})
              </Button>
            </div>
          )}
        </div>

        {/* Contact Button */}
        {currentUser?.id !== profile.user_id && (
          <Card className="bg-[#1b3124] border-[#366348] shadow-sm">
            <CardContent className="p-4">
              <Button 
                onClick={handleContact}
                className="w-full bg-[#38e07b] hover:bg-[#2dc76a] text-[#122118]"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contactar con {profile.name || 'usuario'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserProfile;