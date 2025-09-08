
import Header from '@/components/Header';
import { Settings, Star, Package, Heart, MessageCircle, LogIn } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PlantCard from '@/components/PlantCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-plant-subtle">
        <Header title="Mi Perfil" />
        
        <div className="px-4 py-8 flex flex-col items-center justify-center">
          <Card className="border-plant-200 shadow-sm w-full max-w-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-plant-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <LogIn size={32} className="text-plant-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Inicia sesión
                </h2>
                <p className="text-gray-600 text-sm">
                  Accede a tu cuenta para ver tu perfil y gestionar tus plantas
                </p>
              </div>
              
              <Button 
                className="w-full bg-plant-600 hover:bg-plant-700 text-white"
                onClick={() => navigate('/auth')}
              >
                <LogIn size={16} className="mr-2" />
                Iniciar sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const userPlants = [
    {
      id: '7',
      title: 'Mi Pilea Peperomioides',
      price: 25,
      location: 'Madrid',
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
      isFavorite: false,
      isExchange: false
    },
    {
      id: '8',
      title: 'Cactus en maceta artesanal',
      price: 0,
      location: 'Madrid',
      image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
      isFavorite: false,
      isExchange: true
    }
  ];

  const stats = [
    { icon: Package, label: 'Publicadas', value: '12' },
    { icon: Star, label: 'Valoración', value: '4.8' },
    { icon: Heart, label: 'Favoritos', value: '8' },
    { icon: MessageCircle, label: 'Intercambios', value: '5' }
  ];

  return (
    <div className="min-h-screen bg-gradient-plant-subtle pb-20">
      <Header title="Mi Perfil" />
      
      <div className="px-4 py-4">
        {/* Profile Info */}
        <Card className="border-plant-200 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-plant-100 text-plant-700 text-xl font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">Juan Díaz</h2>
                <p className="text-gray-600">Madrid, España</p>
                <p className="text-sm text-plant-600 mt-1">
                  Miembro desde marzo 2024
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-plant-300"
                onClick={() => navigate('/edit-profile')}
              >
                <Settings size={16} className="mr-2" />
                Editar perfil
              </Button>
            </div>
            
            <p className="text-gray-700 text-sm">
              🌱 Amante de las plantas desde siempre. Me encanta intercambiar y ayudar a otros con sus jardines urbanos.
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-plant-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Icon size={20} className="text-plant-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* My Plants */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Mis plantas
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-plant-300 text-plant-600"
              onClick={() => navigate('/my-plants')}
            >
              Ver todas
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {userPlants.map((plant) => (
              <PlantCard key={plant.id} {...plant} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-plant-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones rápidas
            </h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start border-plant-300"
                onClick={() => navigate('/my-plants')}
              >
                <Package size={16} className="mr-3" />
                Gestionar mis plantas
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-plant-300"
                onClick={() => navigate('/my-reviews')}
              >
                <Star size={16} className="mr-3" />
                Mis valoraciones
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-plant-300"
                onClick={() => navigate('/edit-profile')}
              >
                <Settings size={16} className="mr-3" />
                Editar perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
