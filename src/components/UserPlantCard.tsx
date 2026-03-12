import React from 'react';
import { Edit, Eye, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Plant {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  exchange_for: string | null;
  location: string;
  sale_type: string;
  images: string[];
  status: string;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface UserPlantCardProps {
  plant: Plant;
  onEdit: (plant: Plant) => void;
}

const UserPlantCard: React.FC<UserPlantCardProps> = ({ plant, onEdit }) => {
  const navigate = useNavigate();

  const handleCardClick = () => navigate(`/plant/${plant.id}`);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(plant);
  };

  const getSaleTypeDisplay = (saleType: string) => {
    switch (saleType) {
      case 'gift': return { text: 'Regalo', className: 'bg-emerald-500/90 text-white' };
      case 'sell': return { text: 'Venta', className: 'bg-blue-500/90 text-white' };
      case 'exchange': return { text: 'Cambio', className: 'bg-amber-500/90 text-white' };
      case 'all': return { text: 'Todo', className: 'bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 text-white' };
      default: return { text: 'Venta', className: 'bg-blue-500/90 text-white' };
    }
  };

  const mainImage = plant.images && plant.images.length > 0 ? plant.images[0] : '/placeholder.svg';
  const saleDisplay = getSaleTypeDisplay(plant.sale_type);

  return (
    <div
      onClick={handleCardClick}
      className="plant-card-hover bg-card rounded-xl overflow-hidden cursor-pointer border border-border/40 shadow-sm"
    >
      {/* Image */}
      <div className="relative">
        <img
          src={mainImage}
          alt={plant.title}
          className="w-full aspect-square object-cover"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Stats overlay top-left */}
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          <div className="flex items-center gap-0.5 bg-black/40 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <Eye size={10} className="text-white/80" />
            <span className="text-white text-[9px] font-medium">{plant.views_count || 0}</span>
          </div>
          <div className="flex items-center gap-0.5 bg-black/40 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <Heart size={10} className="text-white/80" />
            <span className="text-white text-[9px] font-medium">{plant.favorites_count || 0}</span>
          </div>
        </div>

        {/* Edit button top-right */}
        <button
          onClick={handleEditClick}
          className="absolute top-1.5 right-1.5 h-7 w-7 rounded-lg bg-primary/90 text-primary-foreground flex items-center justify-center backdrop-blur-sm shadow-sm"
        >
          <Edit size={12} />
        </button>

        {/* Status badge */}
        {plant.status !== 'active' && (
          <span className={cn(
            "absolute top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-sm",
            plant.status === 'reserved' ? "bg-orange-500/90 text-white" :
            plant.status === 'sold' ? "bg-muted/80 text-foreground" :
            "bg-muted/60 text-muted-foreground"
          )}>
            {plant.status === 'reserved' ? 'Reservado' : plant.status === 'sold' ? 'Vendido' : 'Inactivo'}
          </span>
        )}

        {/* Sale type badge bottom-left */}
        <span className={cn(
          "absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide backdrop-blur-sm",
          saleDisplay.className
        )}>
          {saleDisplay.text}
        </span>
      </div>

      {/* Content */}
      <div className="p-2">
        <h3 className="font-medium text-foreground text-[11px] leading-tight line-clamp-1">{plant.title}</h3>
        <div className="flex justify-between items-center mt-0.5">
          <span className="text-[9px] text-muted-foreground line-clamp-1 flex-1 mr-1">
            {plant.location}
          </span>
          {plant.price != null && plant.price > 0 && (
            <span className="text-[11px] font-bold text-primary shrink-0">{plant.price}€</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPlantCard;
