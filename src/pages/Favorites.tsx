
import Header from '@/components/Header';
import PlantCard from '@/components/PlantCard';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const favoritePlants = [
    {
      id: '2',
      title: 'Colección de suculentas variadas',
      price: 0,
      location: 'Barcelona',
      image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
      isFavorite: true,
      isExchange: true
    },
    {
      id: '5',
      title: 'Palmera Areca - Decorativa',
      price: 60,
      location: 'Bilbao',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
      isFavorite: true,
      isExchange: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-plant-subtle pb-20">
      <Header title="Favoritos" />
      
      <div className="px-4 py-4">
        {favoritePlants.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {favoritePlants.map((plant) => (
              <PlantCard key={plant.id} {...plant} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-plant-100 p-4 rounded-full mb-4">
              <Heart size={48} className="text-plant-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sin favoritos aún
            </h3>
            <p className="text-gray-600 max-w-sm">
              Guarda las plantas que más te gusten tocando el corazón
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
