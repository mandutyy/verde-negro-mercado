
import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const navigate = useNavigate();
  
  const favoritePlants = [
    {
      id: '1',
      title: 'Monstera Deliciosa',
      category: 'Planta de interior',
      price: 25,
      transactionType: 'sale',
      image: 'https://images.unsplash.com/photo-1545239705-1564e58b4ed4?w=400&h=400&fit=crop'
    },
    {
      id: '2',
      title: 'Ficus Lyrata',
      category: 'Planta de interior',
      price: 0,
      transactionType: 'exchange',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop'
    },
    {
      id: '3',
      title: 'Sansevieria Trifasciata',
      category: 'Planta suculenta',
      price: 18,
      transactionType: 'sale',
      image: 'https://images.unsplash.com/photo-1493292596946-ec20ae47c4d6?w=400&h=400&fit=crop'
    },
    {
      id: '4',
      title: 'Calathea Ornata',
      category: 'Planta tropical',
      price: 0,
      transactionType: 'gift',
      image: 'https://images.unsplash.com/photo-1590320025107-a2b0f9c5d8bc?w=400&h=400&fit=crop'
    },
    {
      id: '5',
      title: 'Pothos',
      category: 'Planta trepadora',
      price: 12,
      transactionType: 'sale',
      image: 'https://images.unsplash.com/photo-1436018640332-42ec8b2d2e81?w=400&h=400&fit=crop'
    },
    {
      id: '6',
      title: 'ZZ Plant',
      category: 'Planta de interior',
      price: 0,
      transactionType: 'exchange',
      image: 'https://images.unsplash.com/photo-1544076804-0a1b9030b1bf?w=400&h=400&fit=crop'
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
    navigate(`/purchase/${plantId}`);
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
            const transactionInfo = getTransactionTypeDisplay(plant.transactionType, plant.price);
            
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
                        ${plant.price.toFixed(2)}
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
