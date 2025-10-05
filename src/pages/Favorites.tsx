
import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserFavorites, useFavorites } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: favorites = [], isLoading: loading } = useUserFavorites();

const FavoritePlantCard = ({ plant }: { plant: any }) => {
  const navigate = useNavigate();
  const { toggleFavorite, loading: favoriteLoading } = useFavorites(plant.plants.id);

  const getTransactionTypeDisplay = (saleType: string, price: number) => {
    if (saleType?.includes('exchange')) {
      return { label: 'Intercambio', color: 'text-yellow-500', showPrice: false };
    }
    if (saleType?.includes('sell') && price) {
      return { label: 'En venta', color: 'text-[var(--primary-color)]', showPrice: true };
    }
    return { label: 'Disponible', color: 'text-blue-400', showPrice: false };
  };

  const handlePlantClick = () => {
    navigate(`/purchase/${plant.plants.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite();
  };

  const transactionInfo = getTransactionTypeDisplay(plant.plants.sale_type, plant.plants.price);
  const mainImage = plant.plants.images && plant.plants.images.length > 0 ? plant.plants.images[0] : '/placeholder.svg';

  return (
    <div 
      className="relative group cursor-pointer"
      onClick={handlePlantClick}
    >
      <div 
        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-2xl"
        style={{ backgroundImage: `url("${mainImage}")` }}
      />
      <div className="absolute top-2 right-2">
        <button 
          className="bg-black/50 backdrop-blur-sm p-2 rounded-full text-red-500 hover:text-red-400 transition-colors"
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
        >
          <Heart size={20} fill="currentColor" />
        </button>
      </div>
      <div className="mt-2 text-white">
        <p className="text-base font-medium leading-normal">{plant.plants.title}</p>
        <p className="text-sm text-zinc-400">{plant.plants.location}</p>
        <div className="flex items-center justify-between mt-1">
          <p className={`text-sm font-semibold ${transactionInfo.color}`}>
            {transactionInfo.label}
          </p>
          {transactionInfo.showPrice && (
            <p className="text-base font-bold text-white">
              €{plant.plants.price}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

  const handleLoginClick = () => {
    navigate('/auth');
  };

  if (!user) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#122118] text-white">
        <div className="flex-grow">
          {/* Header */}
          <div className="flex items-center bg-transparent p-4 pb-2 justify-between sticky top-0 z-10 backdrop-blur-sm bg-[#122118]/80">
            <button 
              onClick={() => navigate(-1)}
              className="text-white flex size-10 shrink-0 items-center justify-center"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
              Favoritos
            </h2>
          </div>

          {/* Not logged in message */}
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Heart size={64} className="text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Inicia sesión para ver favoritos</h3>
            <p className="text-gray-400 mb-6">Guarda tus plantas favoritas para verlas más tarde</p>
            <Button onClick={handleLoginClick} className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90">
              Iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#122118] text-white">
        <div className="flex-grow">
          {/* Header */}
          <div className="flex items-center bg-transparent p-4 pb-2 justify-between sticky top-0 z-10 backdrop-blur-sm bg-[#122118]/80">
            <button 
              onClick={() => navigate(-1)}
              className="text-white flex size-10 shrink-0 items-center justify-center"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
              Favoritos
            </h2>
          </div>

          {/* Loading */}
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
            <p className="text-white ml-3">Cargando favoritos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#122118] text-white">
      <div className="flex-grow">
        {/* Header */}
        <div className="flex items-center bg-transparent p-4 pb-2 justify-between sticky top-0 z-10 backdrop-blur-sm bg-[#122118]/80">
          <button 
            onClick={() => navigate(-1)}
            className="text-white flex size-10 shrink-0 items-center justify-center"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
            Favoritos ({favorites.length})
          </h2>
        </div>

        {/* Content */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Heart size={64} className="text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tienes favoritos</h3>
            <p className="text-gray-400 mb-6">Explora plantas y marca las que más te gusten con el corazón</p>
            <Button onClick={() => navigate('/')} className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90">
              Explorar plantas
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {favorites.map((favorite) => (
              <FavoritePlantCard key={favorite.id} plant={favorite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
