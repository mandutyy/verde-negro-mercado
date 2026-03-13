import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '@/hooks/useApi';
import PlantCard from '@/components/PlantCard';
import { ArrowLeft, Gift, Leaf } from 'lucide-react';

const FreePlants = () => {
  const navigate = useNavigate();
  const { data: plants = [], isLoading } = usePlants({ excludeUserId: true });

  const freePlants = useMemo(() => {
    return plants.filter(p => p.sale_type === 'gift');
  }, [plants]);

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background font-spline overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 glass-strong">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-foreground hover:bg-muted rounded-full p-1.5 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Gift size={16} className="text-emerald-400" />
            </div>
            <h1 className="text-foreground text-base font-bold">Plantas gratis</h1>
          </div>
        </div>
        <div className="px-4 pb-3">
          <p className="text-muted-foreground text-xs">
            Plantas que otros usuarios regalan. ¡Dales una segunda oportunidad! 🌱
          </p>
        </div>
      </div>

      {/* Plants Grid */}
      <div className="px-3 pt-3 pb-24 flex-grow">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-card border border-border/50 animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-2 space-y-1.5">
                  <div className="h-3 bg-muted rounded-full w-4/5" />
                  <div className="h-2.5 bg-muted rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : freePlants.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Gift size={32} className="text-emerald-400 opacity-60" />
            </div>
            <h3 className="text-base font-semibold mb-1.5 text-foreground">No hay plantas gratis ahora</h3>
            <p className="text-muted-foreground text-sm mb-5">Vuelve pronto o publica una planta para regalar</p>
            <button
              onClick={() => navigate('/upload?type=gift')}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm hover:brightness-110 transition-all shadow-md shadow-primary/20"
            >
              Regalar una planta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {freePlants.map((plant) => (
              <PlantCard
                key={plant.id}
                id={plant.id}
                title={plant.title}
                price={plant.price}
                location={plant.location || 'Sin ubicación'}
                image={plant.images && plant.images.length > 0 ? plant.images[0] : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=400&fit=crop'}
                saleType={plant.sale_type || 'gift'}
                isFavorite={false}
                status={plant.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreePlants;
