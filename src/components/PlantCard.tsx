
import { Heart } from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useApi';

interface PlantCardProps {
  id: string;
  title: string;
  price: number | null;
  location: string;
  image: string;
  isFavorite?: boolean;
  saleType: string;
  status?: string;
}

const PlantCard = memo(({ 
  id, 
  title, 
  price, 
  location, 
  image, 
  isFavorite = false,
  saleType,
  status = 'active'
}: PlantCardProps) => {
  const navigate = useNavigate();
  const { isFavorite: favorite, loading: favoriteLoading, toggleFavorite } = useFavorites(id);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite();
  }, [toggleFavorite]);

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
      className="plant-card-hover bg-card rounded-lg shadow-sm border border-border overflow-hidden cursor-pointer hover:bg-muted transition-colors"
    >
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full aspect-square object-cover"
          loading="lazy"
        />
        <button
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
          className={cn(
            "absolute top-1.5 right-1.5 p-1 rounded-full transition-all duration-200",
            favorite 
              ? "bg-red-100 text-red-500" 
              : "bg-white/80 text-gray-400 hover:bg-white hover:text-red-500"
          )}
        >
          <Heart 
            size={14} 
            className={favorite ? "fill-current" : ""} 
          />
        </button>
      </div>
      
      <div className="p-2">
        <h3 className="font-semibold text-foreground text-xs line-clamp-1 mb-1">
          {title}
        </h3>
        
        <div className="mb-1 flex gap-1 flex-wrap">
          <span className={cn(
            "inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold",
            getSaleTypeDisplay(saleType).className
          )}>
            {getSaleTypeDisplay(saleType).text}
          </span>
          {status === 'reserved' && (
            <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">
              RESERVADO
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-end">
          <span className="text-[10px] text-muted-foreground line-clamp-1">
            {location}
          </span>
          {price && (
            <span className="text-xs font-bold text-primary">
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
