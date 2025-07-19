import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  onLocationSelect: (location: { name: string; coordinates: [number, number] }) => void;
  initialLocation?: { name: string; coordinates: [number, number] };
}

const LocationMap: React.FC<LocationMapProps> = ({ onLocationSelect, initialLocation }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    // Para usar Mapbox, necesitas introducir tu token público
    // Los tokens públicos de Mapbox son seguros para usar en el frontend
    setShowTokenInput(true);
  }, []);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;
    
    const initialCoords = initialLocation?.coordinates || [-3.7038, 40.4168]; // Madrid por defecto
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCoords,
      zoom: 6,
    });

    // Añadir controles de navegación
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Crear marcador inicial
    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat(initialCoords)
      .addTo(map.current);

    // Listener para cuando se mueve el marcador
    marker.current.on('dragend', () => {
      if (marker.current) {
        const lngLat = marker.current.getLngLat();
        reverseGeocode([lngLat.lng, lngLat.lat]);
      }
    });

    // Listener para clicks en el mapa
    map.current.on('click', (e) => {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      if (marker.current) {
        marker.current.setLngLat(coordinates);
      }
      
      reverseGeocode(coordinates);
    });
  };

  const reverseGeocode = async (coordinates: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${mapboxToken}&language=es&country=ES`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const place = data.features[0];
        const locationName = place.place_name_es || place.place_name;
        
        onLocationSelect({
          name: locationName,
          coordinates
        });
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.startsWith('pk.')) {
      setShowTokenInput(false);
      initializeMap(mapboxToken);
    } else {
      alert('Por favor, introduce un token válido de Mapbox (debe empezar con "pk.")');
    }
  };

  if (showTokenInput) {
    return (
      <div className="space-y-4 p-4 border border-plant-200 rounded-lg bg-plant-50">
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-plant-500 mb-2" />
          <h3 className="text-lg font-semibold text-plant-800 mb-2">
            Configurar Mapa
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Para usar el mapa, necesitas un token de Mapbox. 
            <br />
            Obtén uno gratuito en{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-plant-600 underline"
            >
              mapbox.com
            </a>
          </p>
        </div>
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Introduce tu token de Mapbox (pk.ey...)"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="border-plant-200 focus:border-plant-400"
          />
          <button
            onClick={handleTokenSubmit}
            className="w-full bg-plant-500 text-white py-2 px-4 rounded-md hover:bg-plant-600 transition-colors"
          >
            Activar Mapa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-plant-700 font-medium flex items-center gap-2">
        <MapPin size={16} />
        Haz clic en el mapa o arrastra el marcador para seleccionar tu ubicación
      </div>
      <div 
        ref={mapContainer} 
        className="h-64 w-full rounded-lg border border-plant-200 shadow-sm" 
      />
    </div>
  );
};

export default LocationMap;