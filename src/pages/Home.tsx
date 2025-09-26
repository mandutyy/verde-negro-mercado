import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePlants } from '@/hooks/useApi';
import PlantCard from '@/components/PlantCard';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Usar el nuevo hook con caché
  const { data: plants = [], isLoading: loading, error } = usePlants({ 
    excludeUserId: true,
    category: activeCategory 
  });

  // Filtrar plantas por búsqueda
  const filteredPlants = useMemo(() => {
    if (!searchQuery.trim()) return plants;
    
    return plants.filter(plant => 
      plant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [plants, searchQuery]);

  const categories = [
    { value: "all", label: "Todas" },
    { value: "interior", label: "Interior" },
    { value: "exterior", label: "Exterior" },
    { value: "suculentas", label: "Suculentas" },
    { value: "semillas", label: "Semillas" },
  ];

  const goToHome = () => navigate('/');
  const goToUpload = () => navigate('/upload');
  const goToMessages = () => navigate('/messages');
  const goToProfile = () => navigate('/profile');

  const handlePlantClick = (plantId: string) => {
    navigate(`/purchase/${plantId}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    } else {
      const weeks = Math.floor(diffInHours / 168);
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    }
  };

  const getPlantTypeLabel = (saleType: string, price: number | null) => {
    if (saleType.includes('sell') && price) return 'Venta';
    if (saleType.includes('exchange')) return 'Intercambio';
    if (saleType.includes('gift')) return 'Regalo';
    return 'Disponible';
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background font-spline justify-between overflow-x-hidden">
      <div className="flex-grow">
        {/* Header */}
        <div className="flex items-center gap-3 bg-background px-4 py-3 sticky top-0 z-20">
          <h1 className="text-white text-lg md:text-xl font-bold tracking-tight">Plantificar</h1>
          <button 
            onClick={() => navigate('/search')}
            className="ml-2 flex flex-1 min-w-0 h-10"
          >
            <div className="flex w-full items-stretch rounded-full h-full">
              <div className="text-secondary flex border-none bg-muted items-center justify-center pl-4 rounded-l-full border-r-0">
                <span className="material-symbols-outlined">search</span>
              </div>
              <div className="form-input flex w-full min-w-0 flex-1 overflow-hidden rounded-r-full text-white focus:outline-0 focus:ring-0 border-none bg-muted h-full placeholder:text-secondary px-4 text-base font-normal leading-normal items-center">
                <span className="text-secondary">Buscar plantas</span>
              </div>
            </div>
          </button>
        </div>


        {/* Category Filters */}
        <div className="flex gap-3 px-4 py-2 overflow-x-auto whitespace-nowrap sticky top-[64px] z-10 bg-background border-t-0">
          {categories.map((category) => (
            <button 
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 ${
                activeCategory === category.value 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}
            >
              <p className={`text-xs md:text-sm font-${activeCategory === category.value ? 'bold' : 'medium'} ${
                activeCategory === category.value ? 'text-black' : 'text-white'
              }`}>
                {category.label}
              </p>
            </button>
          ))}
        </div>

        {/* Plants Grid */}
        <div className="p-4 space-y-6 pb-24">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col items-stretch justify-start rounded-2xl overflow-hidden bg-[#1b3124] shadow-lg animate-pulse">
                <div className="w-full aspect-square bg-[#264532]"></div>
                <div className="flex w-full grow flex-col items-stretch justify-center gap-1 p-4">
                  <div className="h-6 bg-[#264532] rounded mb-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-[#264532] rounded w-20"></div>
                    <div className="h-4 bg-[#264532] rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))
          ) : plants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[#96c5a9] mb-4">
                <span className="material-symbols-outlined text-6xl mb-3 opacity-50 block">local_florist</span>
                <h3 className="text-lg font-semibold mb-2 text-white">No hay plantas disponibles</h3>
                <p className="text-[#96c5a9]">Sé el primero en publicar una planta</p>
              </div>
              <button 
                onClick={goToUpload}
                className="bg-[#38e07b] text-[#122118] px-6 py-2 rounded-full font-semibold hover:bg-[#38e07b]/90"
              >
                Publicar mi primera planta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {plants
                .filter(plant => {
                  if (activeCategory === 'all') return true;
                  return plant.category?.toLowerCase() === activeCategory;
                })
                .filter(plant => {
                  if (!searchQuery) return true;
                  return plant.title.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map((plant) => (
                  <PlantCard
                    key={plant.id}
                    id={plant.id}
                    title={plant.title}
                    price={plant.price}
                    location={plant.location || 'Ubicación no especificada'}
                    image={plant.images && plant.images.length > 0 ? plant.images[0] : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=400&fit=crop'}
                    saleType={plant.sale_type || 'sell'}
                    isFavorite={false}
                    status={plant.status}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;