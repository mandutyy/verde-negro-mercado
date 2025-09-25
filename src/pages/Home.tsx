import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import PlantCard from '@/components/PlantCard';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlants();
  }, [user]);

  const fetchPlants = async () => {
    try {
      let query = supabase
        .from('plants')
        .select('*')
        .in('status', ['active', 'reserved']);

      // Exclude user's own plants if authenticated
      if (user) {
        query = query.neq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching plants:', error);
        return;
      }

      setPlants(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex items-center bg-background p-4 pb-1 justify-center sticky top-0 z-10">
          <h1 className="text-white text-lg md:text-xl font-bold tracking-tight">Plantificar</h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2 sticky top-[68px] z-10 bg-background">
          <button 
            onClick={() => navigate('/search')}
            className="flex flex-col min-w-40 h-12 w-full"
          >
            <div className="flex w-full flex-1 items-stretch rounded-full h-full">
              <div className="text-secondary flex border-none bg-muted items-center justify-center pl-4 rounded-l-full border-r-0">
                <span className="material-symbols-outlined">search</span>
              </div>
              <div className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-white focus:outline-0 focus:ring-0 border-none bg-muted h-full placeholder:text-secondary px-4 text-base font-normal leading-normal items-center">
                <span className="text-secondary">Buscar plantas</span>
              </div>
            </div>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 px-4 py-2 overflow-x-auto whitespace-nowrap sticky top-[116px] z-10 bg-background">
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