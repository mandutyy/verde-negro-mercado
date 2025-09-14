import { useState } from 'react';
import { ArrowLeft, Search as SearchIcon, X, MapPin, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Intercambio');
  const [priceRange, setPriceRange] = useState([15, 150]);
  const [selectedLocation, setSelectedLocation] = useState('Cerca de mí');

  const plantTypes = ['Todas', 'Interior', 'Exterior', 'Suculentas', 'Cactus'];
  const statusOptions = ['En venta', 'Intercambio', 'Regalo'];
  const locationOptions = ['Cerca de mí', 'Madrid, España', 'Barcelona, España'];

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background dark justify-between overflow-x-hidden">
      <div className="flex flex-col">
        {/* Header */}
        <header className="flex items-center bg-background p-4 pb-2 justify-between sticky top-0 z-10">
          <button 
            onClick={() => navigate('/')}
            className="text-foreground flex size-10 items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Buscar
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
          {/* Search Bar */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              className="w-full rounded-full border-none bg-card h-12 pl-12 pr-10 text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Buscar plantas, macetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Filters */}
          <section className="space-y-6">
            {/* Plant Type Filter */}
            <div>
              <h2 className="text-foreground text-lg font-bold mb-3">Tipo</h2>
              <div className="flex gap-3 flex-wrap">
                {plantTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium transition-colors ${
                      selectedType === type
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-card text-foreground hover:bg-accent'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h2 className="text-foreground text-lg font-bold mb-3">Estado</h2>
              <div className="flex gap-3 flex-wrap">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-card text-foreground hover:bg-accent'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-foreground text-lg font-bold">Precio</h2>
                <span className="text-foreground font-medium">
                  ${priceRange[0]} - ${priceRange[1]}
                </span>
              </div>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={200}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <h2 className="text-foreground text-lg font-bold mb-3">Ubicación</h2>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <select 
                  className="w-full appearance-none rounded-full border-none bg-card h-12 pl-12 pr-10 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={20} />
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="flex px-4 py-3">
          <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-primary text-primary-foreground text-lg font-bold tracking-wide hover:bg-primary/90 transition-colors">
            <span className="truncate">Mostrar 345 resultados</span>
          </button>
        </div>
        <div className="h-5 bg-background"></div>
      </footer>
    </div>
  );
};

export default Search;