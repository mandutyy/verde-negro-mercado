
import { Heart } from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PlantCardProps {
  id: string;
  title: string;
  price: number | null;
  location: string;
  image: string;
  isFavorite?: boolean;
  saleType: string;
}

const PlantCard = memo(({ 
  id, 
  title, 
  price, 
  location, 
  image, 
  isFavorite = false,
  saleType 
}: PlantCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const navigate = useNavigate();

  const toggleFavorite = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(prev => !prev);
  }, []);

  const handleCardClick = useCallback(() => {
    navigate(`/purchase/${id}`);
  }, [navigate, id]);

  const getSaleTypeDisplay = (saleType: string) => {
    switch (saleType) {
      case 'gift':
        return { text: 'REGALO', className: 'bg-green-500 text-white' };
      case 'sell':
        return { text: 'VENTA', className: 'bg-blue-500 text-white' };
      case 'exchange':
        return { text: 'INTERCAMBIO', className: 'bg-yellow-500 text-black' };
      case 'all':
        return { 
          text: 'TODO', 
          className: 'bg-gradient-to-r from-green-500 via-blue-500 to-yellow-500 text-white animate-pulse' 
        };
      default:
        return { text: 'VENTA', className: 'bg-blue-500 text-white' };
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="plant-card-hover bg-[#1b3124] rounded-xl shadow-sm border border-[#366348] overflow-hidden cursor-pointer hover:bg-[#264532] transition-colors"
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
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 line-clamp-2">
          {title}
        </h3>
        
        {/* Sale type badge */}
        <div className="mb-3">
          <span className={cn(
            "inline-block px-2 py-1 rounded-full text-xs font-bold",
            getSaleTypeDisplay(saleType).className
          )}>
            {getSaleTypeDisplay(saleType).text}
          </span>
        </div>
        
        <div className="flex justify-between items-end">
          <span className="text-sm text-gray-300">
            {location}
          </span>
          {price && (
            <span className="text-lg font-bold text-[#38e07b]">
              {price}€
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

PlantCard.displayName = 'PlantCard';

export default PlantCard;
