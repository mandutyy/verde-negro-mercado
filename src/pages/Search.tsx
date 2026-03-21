import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search as SearchIcon, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { usePlants } from '@/hooks/useApi';

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedType, setSelectedType] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todas');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [priceTouched, setPriceTouched] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [showFilters, setShowFilters] = useState(false);

  const { data: plants = [], isLoading: loading } = usePlants({});

  useEffect(() => {
    if (plants.length > 0) {
      const prices = plants
        .map((p: any) => Number(p.price))
        .filter((n: number) => !isNaN(n) && n > 0);
      const computedMax = prices.length ? Math.ceil(Math.max(...prices) / 10) * 10 : 1000;
      setMaxPrice(computedMax);
      if (!priceTouched) {
        setPriceRange([0, computedMax]);
      }
    }
  }, [plants, priceTouched]);

  const plantTypes = [
    { value: 'Todas', label: 'Todas' },
    { value: 'interior', label: 'Interior' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'suculentas', label: 'Suculentas' },
    { value: 'flores', label: 'Flores' },
    { value: 'aromaticas', label: 'Aromáticas' },
    { value: 'frutales', label: 'Frutales' },
    { value: 'cactus', label: 'Cactus' },
    { value: 'hierbas', label: 'Hierbas' }
  ];
  
  const statusOptions = [
    { value: 'Todas', label: 'Todas' },
    { value: 'sell', label: 'En venta' },
    { value: 'exchange', label: 'Intercambio' },
    { value: 'gift', label: 'Regalo' }
  ];

  const filteredPlants = useMemo(() => {
    if (!hasSearched) return [];
    let filtered = [...plants];

    if (committedQuery.trim()) {
      const query = committedQuery.toLowerCase();
      filtered = filtered.filter(plant =>
        plant.title?.toLowerCase().includes(query) ||
        plant.description?.toLowerCase().includes(query) ||
        plant.location?.toLowerCase().includes(query) ||
        plant.category?.toLowerCase().includes(query)
      );
    }

    if (selectedType !== 'Todas') {
      filtered = filtered.filter(plant => plant.category === selectedType);
    }

    if (selectedStatus !== 'Todas') {
      filtered = filtered.filter(plant => {
        if (selectedStatus === 'sell') {
          return plant.sale_type === 'sell' || plant.sale_type?.includes('sell');
        }
        return plant.sale_type === selectedStatus || plant.sale_type?.includes(selectedStatus);
      });
    }

    if (priceTouched && (selectedStatus === 'Todas' || selectedStatus === 'sell')) {
      filtered = filtered.filter(plant => {
        if (!plant.price || plant.price === null) return true;
        const price = Number(plant.price);
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    if (selectedLocation !== 'Todas' && selectedLocation.trim()) {
      filtered = filtered.filter(plant =>
        plant.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    return filtered;
  }, [plants, committedQuery, selectedType, selectedStatus, priceRange, selectedLocation, priceTouched, hasSearched]);

  const clearSearch = () => {
    setSearchQuery('');
    setCommittedQuery('');
    setHasSearched(false);
  };

  const handleSearch = () => {
    setCommittedQuery(searchQuery);
    setHasSearched(true);
  };

  const getPlantTypeLabel = (saleType: string, price: number | null) => {
    switch (saleType) {
      case 'sell': return price ? `€${price}` : 'Venta';
      case 'exchange': return 'Intercambio';
      case 'gift': return 'Regalo';
      case 'all': return price ? `€${price} · Intercambio · Regalo` : 'Todas las opciones';
      default: return 'Venta';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center bg-background p-4 pb-2 justify-between sticky top-0 z-10">
        <button 
          onClick={() => navigate('/')}
          className="text-foreground flex size-10 items-center justify-center hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Buscar
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="px-4 pt-2 pb-24">
        {/* Search input */}
        <form className="relative mb-4" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            className="w-full rounded-full border-none bg-muted h-12 pl-12 pr-24 text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Buscar plantas, macetas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button 
                type="button"
                onClick={clearSearch}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="submit"
              className="bg-primary text-primary-foreground rounded-full h-8 px-4 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Collapsible filters */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <span>Filtros</span>
          <span className="text-xs">
            {showFilters ? '▲' : '▼'}
          </span>
        </button>

        {showFilters && (
          <section className="space-y-5 mb-5 pb-5 border-b border-border">
            <div>
              <h2 className="text-foreground text-sm font-bold mb-2">Tipo</h2>
              <div className="flex gap-2 flex-wrap">
                {plantTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`h-8 shrink-0 rounded-full px-3 text-xs font-medium transition-colors ${
                      selectedType === type.value
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-foreground text-sm font-bold mb-2">Estado</h2>
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`h-8 shrink-0 rounded-full px-3 text-xs font-medium transition-colors ${
                      selectedStatus === status.value
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-foreground text-sm font-bold">Precio</h2>
                <span className="text-foreground text-xs font-medium">
                  €{priceRange[0]} - €{priceRange[1]}
                </span>
              </div>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={(val) => {
                    setPriceTouched(true);
                    const next: [number, number] = [val[0] ?? 0, (val[1] ?? val[0] ?? maxPrice) as number];
                    setPriceRange(next);
                  }}
                  max={maxPrice}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <h2 className="text-foreground text-sm font-bold mb-2">Ubicación</h2>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  className="w-full rounded-full border-none bg-muted h-10 pl-11 pr-4 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Introduce una ubicación..."
                  value={selectedLocation === 'Todas' ? '' : selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value || 'Todas')}
                />
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-14 h-14 bg-muted rounded-full mx-auto flex items-center justify-center mb-3">
              <SearchIcon className="text-primary" size={22} />
            </div>
            <p className="text-muted-foreground text-sm text-center">
              Escribe y pulsa Buscar para ver resultados
            </p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground text-sm">Cargando...</div>
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-14 h-14 bg-muted rounded-full mx-auto flex items-center justify-center mb-3">
              <SearchIcon className="text-primary" size={22} />
            </div>
            <h3 className="text-foreground text-base font-bold mb-1 text-center">
              No se encontraron plantas
            </h3>
            <p className="text-muted-foreground text-sm text-center">
              Prueba a cambiar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredPlants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => navigate(`/plant/${plant.id}`)}
                className="cursor-pointer"
              >
                <div className="bg-card border border-border rounded-2xl overflow-hidden hover:bg-muted/50 transition-colors">
                  <div className="flex w-full">
                    <div 
                      className="w-28 h-28 bg-cover bg-center bg-no-repeat flex-shrink-0"
                      style={{
                        backgroundImage: `url("${plant.images && plant.images.length > 0 ? plant.images[0] : '/placeholder.svg'}")`
                      }}
                    ></div>
                    <div className="flex w-full grow flex-col items-stretch justify-center gap-0.5 p-3">
                      <p className="text-foreground text-base font-bold leading-tight">{plant.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {getPlantTypeLabel(plant.sale_type, plant.price)}
                      </p>
                      <p className="text-muted-foreground text-xs leading-normal">
                        {plant.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
