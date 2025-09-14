import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Plant } from '@/hooks/useUserPlants';

interface UserPlantCardProps {
  plant: Plant;
  onEdit: (plant: Plant) => void;
}

const UserPlantCard: React.FC<UserPlantCardProps> = ({ plant, onEdit }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/plant/${plant.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking edit button
    onEdit(plant);
  };
  const getPlantTypeLabel = (saleType: string, price: number | null) => {
    switch (saleType) {
      case 'sell':
        return price ? `€${price}` : 'Venta';
      case 'exchange':
        return 'Intercambio';
      case 'gift':
        return 'Regalo';
      case 'all':
        return price ? `€${price} · Intercambio · Regalo` : 'Todas las opciones';
      default:
        return 'Venta';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600 text-white">Activo</Badge>;
      case 'sold':
        return <Badge variant="secondary" className="bg-gray-600 text-white">Vendido</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="border-gray-600 text-gray-400">Inactivo</Badge>;
      default:
        return null;
    }
  };

  const mainImage = plant.images && plant.images.length > 0 ? plant.images[0] : '/placeholder.svg';

  return (
    <Card 
      className="bg-[#1b3124] border-[#366348] overflow-hidden cursor-pointer hover:bg-[#264532] transition-colors"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div 
          className="w-full h-48 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${mainImage})` }}
        />
        <div className="absolute top-2 right-2">
          {getStatusBadge(plant.status)}
        </div>
        <div className="absolute top-2 left-2 flex gap-2">
          <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
            <Eye size={12} className="text-white" />
            <span className="text-white text-xs">{plant.views_count || 0}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
            <Heart size={12} className="text-white" />
            <span className="text-white text-xs">{plant.favorites_count || 0}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base mb-1 truncate">{plant.title}</h3>
            <p className="text-[#96c5a9] text-sm font-medium">
              {getPlantTypeLabel(plant.sale_type, plant.price)}
            </p>
            <p className="text-gray-400 text-xs mt-1 truncate">{plant.location}</p>
          </div>
          <Button
            onClick={handleEditClick}
            size="sm"
            className="ml-2 bg-[#38e07b] hover:bg-[#2dc76a] text-[#122118] flex-shrink-0"
          >
            <Edit size={14} className="mr-1" />
            Editar
          </Button>
        </div>

        <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">
          {plant.description}
        </p>

        <div className="mt-3 text-xs text-gray-500">
          Publicado: {new Date(plant.created_at).toLocaleDateString('es-ES')}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPlantCard;