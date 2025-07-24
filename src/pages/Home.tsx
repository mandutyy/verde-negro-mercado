
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import PlantCard from '@/components/PlantCard';
import { Button } from '@/components/ui/button';

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Todas');
  
  const categories = ['Todas', 'Interior', 'Exterior', 'Suculentas', 'Frutales', 'Aromáticas'];
  
  const mockPlants = [
    {
      id: '1',
      title: 'Monstera Deliciosa - Planta grande',
      price: 45,
      location: 'Madrid',
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
      isFavorite: false,
      isExchange: false
    },
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
      id: '3',
      title: 'Ficus Lyrata en maceta decorativa',
      price: 35,
      location: 'Valencia',
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=300&fit=crop',
      isFavorite: false,
      isExchange: false
    },
    {
      id: '4',
      title: 'Pothos dorado - Muy sano',
      price: 15,
      location: 'Sevilla',
      image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=300&fit=crop',
      isFavorite: false,
      isExchange: false
    },
    {
      id: '5',
      title: 'Palmera Areca - Decorativa',
      price: 60,
      location: 'Bilbao',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
      isFavorite: true,
      isExchange: false
    },
    {
      id: '6',
      title: 'Sansevieria - Perfecta para principiantes',
      price: 0,
      location: 'Málaga',
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
      isFavorite: false,
      isExchange: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-plant-subtle pb-20">
      <Header title="PlantSwap" showSearch />
      
      <div className="px-4 py-4">
        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 mb-6 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className={`whitespace-nowrap ${
                activeCategory === category 
                  ? 'bg-plant-500 hover:bg-plant-600 text-white' 
                  : 'border-plant-300 text-plant-700 hover:bg-plant-50'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* News Section */}
        <div className="bg-gradient-plant rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-plant-100">Noticias PlantApp</span>
          </div>
          
          <h2 className="text-xl font-bold mb-3">🌱 ¡Más de 10,000 plantas intercambiadas este mes!</h2>
          <p className="text-plant-100 mb-4 text-sm leading-relaxed">
            Los usuarios han ahorrado más de €25,000 intercambiando plantas en lugar de comprarlas. 
            <span className="font-semibold"> María de Barcelona</span> consiguió 15 plantas nuevas sin gastar ni un euro.
          </p>
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs"
              onClick={() => navigate('/upload')}
            >
              Vender 💰
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs"
              onClick={() => navigate('/upload')}
            >
              Intercambiar 🔄
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs"
              onClick={() => navigate('/upload')}
            >
              Regalar 🎁
            </Button>
          </div>
        </div>

        {/* Plants Grid */}
        <div className="grid grid-cols-2 gap-4">
          {mockPlants.map((plant) => (
            <PlantCard key={plant.id} {...plant} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
