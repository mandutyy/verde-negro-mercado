import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

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
        <div className="flex items-center bg-background p-4 pb-2 justify-between sticky top-0 z-10">
          <h1 className="text-white text-xl font-bold tracking-tight flex-1 text-center pl-12">Plantify</h1>
          <div className="flex w-12 items-center justify-end">
            <button 
              onClick={() => navigate('/profile')}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0"
            >
              <span className="material-symbols-outlined text-white text-3xl">tune</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 sticky top-[76px] z-10 bg-background">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-full h-full">
              <div className="text-secondary flex border-none bg-muted items-center justify-center pl-4 rounded-l-full border-r-0">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-white focus:outline-0 focus:ring-0 border-none bg-muted h-full placeholder:text-secondary px-4 text-base font-normal leading-normal" 
                placeholder="Buscar plantas" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </label>
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 px-4 py-2 overflow-x-auto whitespace-nowrap sticky top-[140px] z-10 bg-background">
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
              <p className={`text-sm font-${activeCategory === category.value ? 'bold' : 'medium'} ${
                activeCategory === category.value ? 'text-black' : 'text-white'
              }`}>
                {category.label}
              </p>
            </button>
          ))}
        </div>

        {/* Plants Grid */}
        <div className="p-4 grid gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col items-stretch justify-start rounded-2xl overflow-hidden bg-card shadow-lg animate-pulse">
                <div className="w-full aspect-square bg-muted"></div>
                <div className="flex w-full grow flex-col items-stretch justify-center gap-1 p-4">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))
          ) : plants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-secondary mb-4">
                <span className="material-symbols-outlined text-6xl mb-3 opacity-50 block">local_florist</span>
                <h3 className="text-lg font-semibold mb-2 text-white">No hay plantas disponibles</h3>
                <p className="text-secondary">Sé el primero en publicar una planta</p>
              </div>
              <button 
                onClick={goToUpload}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold hover:bg-primary/90"
              >
                Publicar mi primera planta
              </button>
            </div>
          ) : (
            plants
              .filter(plant => {
                if (activeCategory === 'all') return true;
                return plant.category?.toLowerCase() === activeCategory;
              })
              .filter(plant => {
                if (!searchQuery) return true;
                return plant.title.toLowerCase().includes(searchQuery.toLowerCase());
              })
              .map((plant) => (
                <div 
                  key={plant.id}
                  onClick={() => handlePlantClick(plant.id)}
                  className="flex flex-col items-stretch justify-start rounded-2xl overflow-hidden bg-card shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <div 
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover" 
                    style={{
                      backgroundImage: `url("${plant.images && plant.images.length > 0 ? plant.images[0] : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=400&fit=crop'}")`,
                    }}
                  ></div>
                  <div className="flex w-full grow flex-col items-stretch justify-center gap-1 p-4">
                    <p className="text-white text-xl font-bold leading-tight">{plant.title}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-secondary text-base font-normal">
                        {getPlantTypeLabel(plant.sale_type || 'sell', plant.price)}
                      </p>
                      <p className="text-secondary text-sm font-light">
                        {formatTimeAgo(plant.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-card w-full">
        <div className="flex justify-around border-t border-border pt-2 pb-5">
          <a 
            onClick={goToHome}
            className="flex flex-col items-center justify-end gap-1 text-primary cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl">home</span>
            <p className="text-xs font-bold leading-normal">Inicio</p>
          </a>
          <a 
            onClick={goToUpload}
            className="flex flex-col items-center justify-end gap-1 text-secondary cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl">add_circle</span>
            <p className="text-xs font-medium leading-normal">Publicar</p>
          </a>
          <a 
            onClick={goToMessages}
            className="flex flex-col items-center justify-end gap-1 text-secondary cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl">chat_bubble</span>
            <p className="text-xs font-medium leading-normal">Mensajes</p>
          </a>
          <a 
            onClick={goToProfile}
            className="flex flex-col items-center justify-end gap-1 text-secondary cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl">person</span>
            <p className="text-xs font-medium leading-normal">Perfil</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;