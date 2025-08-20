import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { ArrowLeft, Star, Package, Heart, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PlantCard from '@/components/PlantCard';
import { mockPlants } from '@/data/mockPlants';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  // Buscar el vendedor en los datos de las plantas
  const sellerPlants = mockPlants.filter(plant => plant.seller.name === username);
  const seller = sellerPlants.length > 0 ? sellerPlants[0].seller : null;

  if (!seller) {
    return (
      <div className="min-h-screen bg-gradient-plant-subtle">
        <Header title="Perfil no encontrado" />
        <div className="px-4 py-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Usuario no encontrado
          </h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Package, label: 'Publicadas', value: sellerPlants.length.toString() },
    { icon: Star, label: 'Valoración', value: seller.rating.toString() },
    { icon: Heart, label: 'Favoritos', value: '12' },
    { icon: MessageCircle, label: 'Intercambios', value: '8' }
  ];

  const handleContact = () => {
    navigate(`/chat/seller-${seller.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-plant-subtle pb-20">
      <Header title={`Perfil de ${seller.name}`} />
      
      <div className="px-4 py-4">
        {/* Profile Info */}
        <Card className="border-plant-200 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={seller.avatar} />
                <AvatarFallback className="bg-plant-100 text-plant-700 text-xl font-semibold">
                  {seller.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{seller.name}</h2>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{seller.rating}</span>
                  <span className="text-sm text-plant-600">
                    ({seller.reviewCount} valoraciones)
                  </span>
                </div>
                <p className="text-sm text-plant-600">
                  {seller.joinDate}
                </p>
                <p className="text-sm text-plant-600">
                  {seller.responseTime}
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm">
              🌱 Vendedor activo en la plataforma. Especializado en plantas de interior y exterior.
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

        {/* User Plants */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Plantas de {seller.name}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {sellerPlants.slice(0, 4).map((plant) => (
              <PlantCard key={plant.id} {...plant} />
            ))}
          </div>
          
          {sellerPlants.length > 4 && (
            <div className="text-center mt-4">
              <Button variant="outline" size="sm" className="border-plant-300 text-plant-600">
                Ver todas ({sellerPlants.length})
              </Button>
            </div>
          )}
        </div>

        {/* Contact Button */}
        <Card className="border-plant-200 shadow-sm">
          <CardContent className="p-4">
            <Button 
              onClick={handleContact}
              className="w-full bg-plant-500 hover:bg-plant-600"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contactar con {seller.name}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;