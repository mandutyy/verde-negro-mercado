
import { Heart } from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PlantCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  isFavorite?: boolean;
  isExchange?: boolean;
}

const PlantCard = memo(({ 
  id, 
  title, 
  price, 
  location, 
  image, 
  isFavorite = false,
  isExchange = false 
}: PlantCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const navigate = useNavigate();

  const toggleFavorite = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(prev => !prev);
  }, []);

  const handleCardClick = useCallback(() => {
    navigate(`/plant/${id}`);
  }, [navigate, id]);

  return (
    <div 
      onClick={handleCardClick}
      className="plant-card-hover bg-white rounded-xl shadow-sm border border-plant-100 overflow-hidden cursor-pointer"
    >
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <button
          onClick={toggleFavorite}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all duration-200",
            favorite 
              ? "bg-red-100 text-red-500" 
              : "bg-white/80 text-gray-400 hover:bg-white hover:text-red-500"
          )}
        >
          <Heart 
            size={20} 
            className={favorite ? "fill-current" : ""} 
          />
        </button>
        {isExchange && (
          <div className="absolute top-3 left-3 bg-plant-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Intercambio
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-plant-600">
            {isExchange ? 'Intercambio' : `${price}€`}
          </span>
          <span className="text-sm text-gray-500">
            {location}
          </span>
        </div>
      </div>
    </div>
  );
});

PlantCard.displayName = 'PlantCard';

export default PlantCard;
