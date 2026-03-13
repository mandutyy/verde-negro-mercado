import { useState, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePlants } from '@/hooks/useApi';
import PlantCard from '@/components/PlantCard';
import { Search, Leaf, Flower2, Sprout, TreePine, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const CommunityContent = lazy(() => import('@/components/CommunityContent'));

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mainTab, setMainTab] = useState<'plantas' | 'comunidad'>('plantas');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const { data: plants = [], isLoading: loading } = usePlants({ 
    excludeUserId: true,
    category: activeCategory 
  });

  const categories = [
    { value: "all", label: "Todas", icon: Sparkles },
    { value: "interior", label: "Interior", icon: Flower2 },
    { value: "exterior", label: "Exterior", icon: TreePine },
    { value: "suculentas", label: "Suculentas", icon: Leaf },
    { value: "semillas", label: "Semillas", icon: Sprout },
  ];

  const filteredPlants = useMemo(() => {
    if (activeCategory === 'all') return plants;
    return plants.filter(p => p.category?.toLowerCase() === activeCategory);
  }, [plants, activeCategory]);

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background font-spline overflow-x-hidden">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 glass-strong">
        {/* Logo + Search */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Leaf size={16} className="text-primary" />
            </div>
            <h1 className="text-foreground text-base font-bold tracking-tight">Plantificar</h1>
          </div>
          <button 
            onClick={() => navigate('/search')}
            className="ml-1 flex flex-1 min-w-0 h-9"
          >
            <div className="flex w-full items-center rounded-full bg-muted/80 border border-border/50 px-3 gap-2 h-full">
              <Search size={15} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground text-sm">Buscar plantas...</span>
            </div>
          </button>
        </div>

        {/* Main Tabs: Plantas / Comunidad */}
        <div className="flex px-4 gap-1">
          <button
            onClick={() => setMainTab('plantas')}
            className={cn(
              'flex-1 py-2.5 text-sm font-bold text-center transition-all',
              mainTab === 'plantas'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            🌿 Plantas
          </button>
          <button
            onClick={() => setMainTab('comunidad')}
            className={cn(
              'flex-1 py-2.5 text-sm font-bold text-center transition-all',
              mainTab === 'comunidad'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            💬 Comunidad
          </button>
        </div>

        {/* Sub-filters for Plantas tab */}
        {mainTab === 'plantas' && (
          <div className="px-4 pb-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
            >
              <span className="font-medium">
                {activeCategory === 'all' ? 'Filtrar por categoría' : categories.find(c => c.value === activeCategory)?.label}
              </span>
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showFilters && (
              <div className="flex gap-2 pt-1 pb-1 overflow-x-auto scrollbar-hide">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.value;
                  return (
                    <button 
                      key={category.value}
                      onClick={() => setActiveCategory(category.value)}
                      className={cn(
                        'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all duration-200',
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' 
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border/30'
                      )}
                    >
                      <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                      <span className={cn('text-xs', isActive ? 'font-bold' : 'font-medium')}>
                        {category.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {mainTab === 'plantas' ? (
        <div className="px-3 pt-3 pb-24 flex-grow">
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="rounded-xl overflow-hidden bg-card border border-border/50 animate-pulse">
                  <div className="aspect-square bg-muted"></div>
                  <div className="p-2 space-y-1.5">
                    <div className="h-3 bg-muted rounded-full w-4/5"></div>
                    <div className="h-2.5 bg-muted rounded-full w-2/3"></div>
                    <div className="flex justify-between">
                      <div className="h-2.5 bg-muted rounded-full w-1/3"></div>
                      <div className="h-2.5 bg-muted rounded-full w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Leaf size={32} className="text-primary opacity-60" />
              </div>
              <h3 className="text-base font-semibold mb-1.5 text-foreground">No hay plantas disponibles</h3>
              <p className="text-muted-foreground text-sm mb-5">Sé el primero en publicar una planta</p>
              <button 
                onClick={() => navigate('/upload')}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm hover:brightness-110 transition-all shadow-md shadow-primary/20"
              >
                Publicar mi primera planta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredPlants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  id={plant.id}
                  title={plant.title}
                  price={plant.price}
                  location={plant.location || 'Sin ubicación'}
                  image={plant.images && plant.images.length > 0 ? plant.images[0] : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=400&fit=crop'}
                  saleType={plant.sale_type || 'sell'}
                  isFavorite={false}
                  status={plant.status}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        }>
          <CommunityContent />
        </Suspense>
      )}
    </div>
  );
};

export default Home;
