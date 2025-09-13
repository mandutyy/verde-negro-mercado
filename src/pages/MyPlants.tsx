import Header from '@/components/Header';
import { Plus, Edit3, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const MyPlants = () => {
  const navigate = useNavigate();
  
  const myPlants = [
    {
      id: '1',
      title: 'Mi Pilea Peperomioides',
      price: 25,
      location: 'Madrid',
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
      status: 'Activa',
      views: 45,
      favorites: 8,
      isExchange: false
    },
    {
      id: '2',
      title: 'Cactus en maceta artesanal',
      price: 0,
      location: 'Madrid',
      image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
      status: 'Activa',
      views: 32,
      favorites: 12,
      isExchange: true
    },
    {
      id: '3',
      title: 'Monstera Deliciosa grande',
      price: 45,
      location: 'Madrid',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      status: 'Pausada',
      views: 67,
      favorites: 15,
      isExchange: false
    }
  ];

  const handleEditPlant = (plantId: string) => {
    console.log('Editando planta:', plantId);
    // Aquí iría la lógica para editar la planta
  };

  const handleDeletePlant = (plantId: string) => {
    console.log('Eliminando planta:', plantId);
    // Aquí iría la lógica para eliminar la planta
  };

  const handleViewDetails = (plantId: string) => {
    console.log('Ver detalles de planta:', plantId);
    // Aquí iría la navegación a los detalles de la planta
  };

  return (
    <div className="min-h-screen bg-gradient-plant-subtle pb-32">
      <Header title="Mis Plantas" showBackButton />
      
      <div className="px-4 py-4">
        {/* Add New Plant Button */}
        <Button 
          onClick={() => navigate('/upload')}
          className="w-full mb-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus size={20} className="mr-2" />
          Añadir nueva planta
        </Button>

        {/* Plants List */}
        <div className="space-y-4">
          {myPlants.map((plant) => (
            <Card key={plant.id} className="border-plant-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Plant Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={plant.image} 
                      alt={plant.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Plant Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate pr-2">
                        {plant.title}
                      </h3>
                      <Badge 
                        variant={plant.status === 'Activa' ? 'default' : 'secondary'}
                        className={plant.status === 'Activa' ? 'bg-primary text-primary-foreground' : ''}
                      >
                        {plant.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {plant.isExchange ? (
                        <span className="text-primary font-medium">Intercambio</span>
                      ) : (
                        <span className="font-medium">{plant.price}€</span>
                      )}
                      <span className="mx-2">•</span>
                      <span>{plant.location}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Eye size={12} className="mr-1" />
                      <span>{plant.views} visualizaciones</span>
                      <span className="mx-2">•</span>
                      <span>{plant.favorites} favoritos</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(plant.id)}
                        className="border-plant-300 text-plant-600"
                      >
                        <Eye size={14} className="mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlant(plant.id)}
                        className="border-plant-300 text-plant-600"
                      >
                        <Edit3 size={14} className="mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePlant(plant.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {myPlants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🌱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes plantas publicadas
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza publicando tu primera planta
            </p>
            <Button 
              onClick={() => navigate('/upload')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus size={16} className="mr-2" />
              Añadir planta
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPlants;