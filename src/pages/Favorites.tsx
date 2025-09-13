
import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockPlants } from '@/data/mockPlants';

const Favorites = () => {
  const navigate = useNavigate();
  
  // Usar plantas de mockPlants para mantener consistencia
  const favoritePlants = [
    {
      ...mockPlants[0], // Monstera Deliciosa
      category: 'Planta de interior',
      transactionType: 'sale'
    },
    {
      ...mockPlants[1], // Colección de suculentas
      category: 'Planta suculenta', 
      transactionType: 'exchange'
    },
    {
      ...mockPlants[2], // Ficus Lyrata
      category: 'Planta de interior',
      transactionType: 'sale'
    },
    {
      ...mockPlants[3], // Pothos dorado
      category: 'Planta trepadora',
      transactionType: 'sale'
    },
    {
      ...mockPlants[4], // Palmera Areca
      category: 'Planta de interior',
      transactionType: 'sale'
    },
    {
      ...mockPlants[5], // Sansevieria
      category: 'Planta de interior',
      transactionType: 'exchange'
    }
  ];

  const getTransactionTypeDisplay = (type: string, price: number) => {
    switch (type) {
      case 'sale':
        return { label: 'En venta', color: 'text-[var(--primary-color)]', showPrice: true };
      case 'exchange':
        return { label: 'Intercambio', color: 'text-yellow-500', showPrice: false };
      case 'gift':
        return { label: 'Regalado', color: 'text-blue-400', showPrice: false };
      default:
        return { label: 'En venta', color: 'text-[var(--primary-color)]', showPrice: true };
    }
  };

  const handlePlantClick = (plantId: string) => {
    navigate(`/plant/${plantId}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent, plantId: string) => {
    e.stopPropagation();
    console.log('Toggling favorite for plant:', plantId);
    // TODO: Implement favorite toggle logic
  };

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

        {/* Plants Grid */}
        <div className="grid grid-cols-2 gap-4 p-4">
          {favoritePlants.map((plant) => {
            const transactionInfo = getTransactionTypeDisplay(plant.type, plant.price);
            
            return (
              <div 
                key={plant.id} 
                className="relative group cursor-pointer"
                onClick={() => handlePlantClick(plant.id)}
              >
                <div 
                  className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-2xl"
                  style={{ backgroundImage: `url("${plant.image}")` }}
                />
                <div className="absolute top-2 right-2">
                  <button 
                    className="bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:text-[var(--primary-color)] transition-colors"
                    onClick={(e) => handleFavoriteClick(e, plant.id)}
                  >
                    <Heart size={24} fill="currentColor" />
                  </button>
                </div>
                <div className="mt-2 text-white">
                  <p className="text-base font-medium leading-normal">{plant.title}</p>
                  <p className="text-sm text-zinc-400">{plant.category}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm font-semibold ${transactionInfo.color}`}>
                      {transactionInfo.label}
                    </p>
                    {transactionInfo.showPrice && (
                      <p className="text-base font-bold text-white">
                        {plant.priceDisplay}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
