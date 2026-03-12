import { Heart } from 'lucide-react';
import { useCallback, memo } from 'react';
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

  const getSaleTypeDisplay = (type: string) => {
    switch (type) {
      case 'gift':
        return { text: 'Regalo', className: 'bg-emerald-500/90 text-white' };
      case 'sell':
        return { text: 'Venta', className: 'bg-blue-500/90 text-white' };
      case 'exchange':
        return { text: 'Cambio', className: 'bg-amber-500/90 text-white' };
      case 'all':
        return { text: 'Todo', className: 'bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 text-white' };
      default:
        return { text: 'Venta', className: 'bg-blue-500/90 text-white' };
    }
  };

  const saleDisplay = getSaleTypeDisplay(saleType);

  return (
    <div 
      onClick={handleCardClick}
      className="plant-card-hover bg-card rounded-xl overflow-hidden cursor-pointer border border-border/40 shadow-sm"
    >
      {/* Image */}
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full aspect-[4/5] object-cover"
          loading="lazy"
        />
        
        {/* Gradient overlay at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
          className={cn(
            "absolute top-1.5 right-1.5 p-1 rounded-full transition-all duration-200 shadow-sm",
            favorite 
              ? "bg-red-500/20 text-red-400 backdrop-blur-sm" 
              : "bg-black/30 text-white/70 backdrop-blur-sm hover:text-red-400"
          )}
        >
          <Heart 
            size={12} 
            className={favorite ? "fill-current" : ""} 
          />
        </button>

        {/* Sale type badge on image */}
        <span className={cn(
          "absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide backdrop-blur-sm",
          saleDisplay.className
        )}>
          {saleDisplay.text}
        </span>

        {status === 'reserved' && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-orange-500/90 text-white backdrop-blur-sm">
            Reservado
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="p-1.5 pt-1.5">
        <h3 className="font-medium text-foreground text-[11px] leading-tight line-clamp-1">
          {title}
        </h3>
        
        <div className="flex justify-between items-center mt-0.5">
          <span className="text-[9px] text-muted-foreground line-clamp-1 flex-1 mr-1">
            {location}
          </span>
          {price != null && price > 0 && (
            <span className="text-[11px] font-bold text-primary shrink-0">
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
