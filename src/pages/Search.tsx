import { useState, useEffect } from 'react';
import { ArrowLeft, Search as SearchIcon, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
// Interface for Plant type
interface Plant {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  exchange_for: string | null;
  location: string;
  sale_type: string;
  images: string[];
  status: string;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todas');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [priceTouched, setPriceTouched] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

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

  // Fetch all plants on component mount
  useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .eq('status', 'active') // Only show active plants in search
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const items = data || [];
        console.log('Fetched plants:', items.length);
        setPlants(items);

        // Compute dynamic max price
        const prices = items
          .map((p: any) => Number(p.price))
          .filter((n: number) => !isNaN(n));
        const computedMax = prices.length ? Math.ceil(Math.max(...prices) / 10) * 10 : 1000;
        setMaxPrice(computedMax);
        setPriceRange([0, computedMax]);
        setPriceTouched(false);
      } catch (error) {
        console.error('Error fetching plants:', error);
        setPlants([]);
        setMaxPrice(1000);
        setPriceRange([0, 1000]);
        setPriceTouched(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // Filter plants based on search criteria
  useEffect(() => {
    let filtered = [...plants];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plant =>
        plant.title?.toLowerCase().includes(query) ||
        plant.description?.toLowerCase().includes(query) ||
        plant.location?.toLowerCase().includes(query) ||
        plant.category?.toLowerCase().includes(query)
      );
    }

    // Filter by type/category
    if (selectedType !== 'Todas') {
      filtered = filtered.filter(plant => plant.category === selectedType);
    }

    // Filter by status/sale_type
    if (selectedStatus !== 'Todas') {
      filtered = filtered.filter(plant => {
        if (selectedStatus === 'sell') {
          return plant.sale_type === 'sell' || plant.sale_type?.includes('sell');
        }
        return plant.sale_type === selectedStatus || plant.sale_type?.includes(selectedStatus);
      });
    }

    // Filter by price range (apply only when user adjusts the slider)
    if (priceTouched && (selectedStatus === 'Todas' || selectedStatus === 'sell')) {
      filtered = filtered.filter(plant => {
        // If plant doesn't have price (gift/exchange), include it
        if (!plant.price || plant.price === null) {
          return true;
        }
        const price = Number(plant.price);
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    // Filter by location (basic contains search)
    if (selectedLocation !== 'Todas' && selectedLocation.trim()) {
      filtered = filtered.filter(plant =>
        plant.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    console.log('Filter results:', {
      total: plants.length,
      filtered: filtered.length,
      searchQuery,
      selectedType,
      selectedStatus,
      priceRange,
      selectedLocation
    });

    setFilteredPlants(filtered);
  }, [plants, searchQuery, selectedType, selectedStatus, priceRange, selectedLocation, priceTouched]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleShowResults = () => {
    setShowResults(true);
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

  if (showResults) {
    return (
      <div className="min-h-screen bg-[#122118]">
        {/* Header */}
        <header className="flex items-center bg-[#122118] p-4 pb-2 justify-between sticky top-0 z-10">
          <button 
            onClick={() => setShowResults(false)}
            className="text-white flex size-10 items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Resultados ({filteredPlants.length})
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Results */}
        <main className="p-4 pb-24">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-[#96c5a9]">Cargando plantas...</div>
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-[#366348] rounded-full mx-auto flex items-center justify-center mb-4">
                <SearchIcon className="text-[#38e07b] text-2xl" size={24} />
              </div>
              <h3 className="text-white text-lg font-bold mb-2 text-center">
                No se encontraron plantas
              </h3>
              <p className="text-[#96c5a9] text-sm mb-6 text-center">
                Prueba a cambiar los filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPlants.map((plant) => (
                <div
                  key={plant.id}
                  onClick={() => navigate(`/plant/${plant.id}`)}
                  className="cursor-pointer"
                >
                  <div className="bg-[#1b3124] border border-[#366348] rounded-2xl overflow-hidden hover:bg-[#264532] transition-colors">
                    <div className="flex w-full">
                      <div 
                        className="w-32 h-32 bg-cover bg-center bg-no-repeat flex-shrink-0"
                        style={{
                          backgroundImage: `url("${plant.images && plant.images.length > 0 ? plant.images[0] : '/placeholder.svg'}")`
                        }}
                      ></div>
                      <div className="flex w-full grow flex-col items-stretch justify-center gap-1 p-4">
                        <p className="text-white text-lg font-bold leading-tight">{plant.title}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-[#96c5a9] text-base font-normal">
                            {getPlantTypeLabel(plant.sale_type, plant.price)}
                          </p>
                        </div>
                        <p className="text-[#96c5a9] text-sm font-normal leading-normal">
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
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#122118] dark justify-between overflow-x-hidden">
      <div className="flex flex-col">
        {/* Header */}
        <header className="flex items-center bg-[#122118] p-4 pb-2 justify-between sticky top-0 z-10">
          <button 
            onClick={() => navigate('/')}
            className="text-white flex size-10 items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Buscar
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
          {/* Search Bar */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              className="w-full rounded-full border-none bg-[#264532] h-12 pl-12 pr-10 text-white placeholder:text-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-[#38e07b]"
              placeholder="Buscar plantas, macetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Filters */}
          <section className="space-y-6">
            {/* Plant Type Filter */}
            <div>
              <h2 className="text-white text-lg font-bold mb-3">Tipo</h2>
              <div className="flex gap-3 flex-wrap">
                {plantTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium transition-colors ${
                      selectedType === type.value
                        ? 'bg-[#38e07b] text-[#122118] font-bold'
                        : 'bg-[#264532] text-white hover:bg-[#366348]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h2 className="text-white text-lg font-bold mb-3">Estado</h2>
              <div className="flex gap-3 flex-wrap">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium transition-colors ${
                      selectedStatus === status.value
                        ? 'bg-[#38e07b] text-[#122118] font-bold'
                        : 'bg-[#264532] text-white hover:bg-[#366348]'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-white text-lg font-bold">Precio</h2>
                <span className="text-white font-medium">
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

            {/* Location Filter */}
            <div>
              <h2 className="text-white text-lg font-bold mb-3">Ubicación</h2>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  className="w-full rounded-full border-none bg-[#264532] h-12 pl-12 pr-4 text-white placeholder:text-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-[#38e07b]"
                  placeholder="Introduce una ubicación..."
                  value={selectedLocation === 'Todas' ? '' : selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value || 'Todas')}
                />
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#122118]/80 backdrop-blur-sm border-t border-[#366348]">
        <div className="flex px-4 py-3">
          <button 
            onClick={handleShowResults}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-[#38e07b] text-[#122118] text-lg font-bold tracking-wide hover:bg-[#32c970] transition-colors"
          >
            <span className="truncate">
              {loading ? 'Cargando...' : `Mostrar ${filteredPlants.length} resultado${filteredPlants.length !== 1 ? 's' : ''}`}
            </span>
          </button>
        </div>
        <div className="h-5 bg-[#122118]"></div>
      </footer>
    </div>
  );
};

export default Search;