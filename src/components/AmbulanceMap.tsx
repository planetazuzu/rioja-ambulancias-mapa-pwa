import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ambulancesData, LA_RIOJA_CENTER, Ambulance } from '../data/ambulances';
import { MapPin, Navigation, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Extend Leaflet to include AwesomeMarkers
declare global {
  interface Window {
    L: typeof L & {
      AwesomeMarkers: {
        icon: (options: {
          icon: string;
          markerColor: string;
          prefix: string;
        }) => L.Icon;
      };
    };
  }
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

interface FilterState {
  showSVB: boolean;
  showSVA: boolean;
  show24h: boolean;
  show12h: boolean;
}

const AmbulanceMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const coverageRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const userLocationRef = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [nearestAmbulance, setNearestAmbulance] = useState<Ambulance | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    showSVB: true,
    showSVA: true,
    show24h: true,
    show12h: true
  });

  const getMarkerIcon = (ambulance: Ambulance) => {
    const isSVA = ambulance.tipo === 'SVA';
    const is24h = ambulance.horario === '24 h';

    // Color based on type and schedule
    let markerColor = 'red'; // Default red
    if (isSVA && is24h) markerColor = 'red'; // Red for SVA 24h
    else if (isSVA && !is24h) markerColor = 'orange'; // Orange for SVA 12h
    else if (!isSVA && is24h) markerColor = 'blue'; // Blue for SVB 24h
    else markerColor = 'green'; // Green for SVB 12h

    // Check if AwesomeMarkers is available
    if (window.L && window.L.AwesomeMarkers) {
      return window.L.AwesomeMarkers.icon({
        icon: 'ambulance',
        markerColor: markerColor,
        prefix: 'fa'
      });
    }

    // Fallback to div icon if AwesomeMarkers is not loaded
    const color = markerColor === 'red' ? '#dc2626' : 
                  markerColor === 'orange' ? '#f97316' :
                  markerColor === 'blue' ? '#2563eb' : '#16a34a';

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      className: 'custom-div-icon',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestAmbulance = (userLat: number, userLng: number): Ambulance => {
    return ambulancesData.reduce((nearest, current) => {
      const currentDistance = calculateDistance(userLat, userLng, current.lat, current.lng);
      const nearestDistance = calculateDistance(userLat, userLng, nearest.lat, nearest.lng);
      return currentDistance < nearestDistance ? current : nearest;
    });
  };

  const getCurrentLocation = () => {
    console.log('Getting current location...');
    if (!navigator.geolocation) {
      console.log('Geolocation not available');
      toast.error('La geolocalización no está disponible en este navegador');
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      const {
        latitude,
        longitude
      } = position.coords;
      console.log('Got location:', latitude, longitude);
      setUserLocation({
        lat: latitude,
        lng: longitude
      });
      const nearest = findNearestAmbulance(latitude, longitude);
      setNearestAmbulance(nearest);
      const distance = calculateDistance(latitude, longitude, nearest.lat, nearest.lng).toFixed(1);
      toast.success(`Ambulancia más cercana: ${nearest.nombre} (${distance} km)`);

      // Add user location marker
      if (mapInstanceRef.current) {
        if (userLocationRef.current) {
          mapInstanceRef.current.removeLayer(userLocationRef.current);
        }
        userLocationRef.current = L.marker([latitude, longitude], {
          icon: L.divIcon({
            html: `
                <div style="
                  background-color: #10b981;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                "></div>
              `,
            className: 'user-location-icon',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(mapInstanceRef.current);

        // Pan to user location
        mapInstanceRef.current.setView([latitude, longitude], 12);
      }
    }, error => {
      console.error('Error getting location:', error);
      toast.error('No se pudo obtener la ubicación');
    });
  };

  const updateMapDisplay = () => {
    console.log('Updating map display...');
    if (!mapInstanceRef.current) {
      console.log('Map instance not available yet');
      return;
    }

    // Clear existing layers
    markersRef.current.clearLayers();
    coverageRef.current.clearLayers();

    // Filter ambulances based on current filters
    const filteredAmbulances = ambulancesData.filter(ambulance => {
      const typeMatch = filters.showSVB && ambulance.tipo === 'SVB' || filters.showSVA && ambulance.tipo === 'SVA';
      const scheduleMatch = filters.show24h && ambulance.horario === '24 h' || filters.show12h && ambulance.horario === '12 h (día)';
      return typeMatch && scheduleMatch;
    });
    console.log('Filtered ambulances:', filteredAmbulances.length);

    // Add markers for filtered ambulances
    filteredAmbulances.forEach(ambulance => {
      // Add marker with FontAwesome icon
      const marker = L.marker([ambulance.lat, ambulance.lng], {
        icon: getMarkerIcon(ambulance)
      });
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-sm">${ambulance.nombre}</h3>
          <p class="text-xs text-gray-600">Tipo: ${ambulance.tipo}</p>
          <p class="text-xs text-gray-600">Horario: ${ambulance.horario}</p>
        </div>
      `);
      markersRef.current.addLayer(marker);
    });

    // Add layers to map
    markersRef.current.addTo(mapInstanceRef.current);
    console.log('Map display updated successfully');
  };

  useEffect(() => {
    console.log('Map component mounting...');
    console.log('Map ref current:', mapRef.current);
    if (!mapRef.current) {
      console.log('Map ref is null, cannot initialize map');
      return;
    }
    try {
      console.log('Initializing map...');
      // Initialize map
      const map = L.map(mapRef.current, {
        center: [LA_RIOJA_CENTER.lat, LA_RIOJA_CENTER.lng],
        zoom: 10,
        zoomControl: true
      });
      console.log('Map created successfully');

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      console.log('Tile layer added');
      mapInstanceRef.current = map;

      // Initial display
      updateMapDisplay();
      console.log('Map initialization complete');
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Error al cargar el mapa');
    }
    return () => {
      console.log('Cleaning up map...');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);
  useEffect(() => {
    console.log('Filters changed:', filters);
    updateMapDisplay();
  }, [filters]);
  const toggleFilter = (filterKey: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  console.log('Rendering AmbulanceMap component');
  return <div className="flex flex-col lg:flex-row h-screen bg-background">
      {/* Controls Sidebar */}
      <div className="lg:w-80 w-full lg:h-full h-auto bg-card border-r border-border p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Mapa de Ambulancias en La Rioja</h1>
          </div>

          {/* Location Button */}
          <Button onClick={getCurrentLocation} className="w-full flex items-center gap-2" variant="outline">
            <Navigation className="w-4 h-4" />
            Mi Ubicación
          </Button>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button variant={filters.showSVB ? "default" : "outline"} size="sm" onClick={() => toggleFilter('showSVB')} className="text-xs">
                  {filters.showSVB ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                  SVB
                </Button>
                <Button variant={filters.showSVA ? "default" : "outline"} size="sm" onClick={() => toggleFilter('showSVA')} className="text-xs">
                  {filters.showSVA ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                  SVA
                </Button>
                <Button variant={filters.show24h ? "default" : "outline"} size="sm" onClick={() => toggleFilter('show24h')} className="text-xs">
                  {filters.show24h ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                  24h
                </Button>
                <Button variant={filters.show12h ? "default" : "outline"} size="sm" onClick={() => toggleFilter('show12h')} className="text-xs">
                  {filters.show12h ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                  12h
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Leyenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span>SVA 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>SVA 12h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span>SVB 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span>SVB 12h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nearest Ambulance */}
          {nearestAmbulance && userLocation && <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ambulancia Más Cercana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <p className="font-medium">{nearestAmbulance.nombre}</p>
                  <p className="text-muted-foreground">
                    Distancia: {calculateDistance(userLocation.lat, userLocation.lng, nearestAmbulance.lat, nearestAmbulance.lng).toFixed(1)} km
                  </p>
                </div>
              </CardContent>
            </Card>}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" style={{
        minHeight: '400px',
        backgroundColor: '#f0f0f0'
      }} />
        {!mapInstanceRef.current && <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-600">Cargando mapa...</p>
          </div>}
      </div>
    </div>;
};

export default AmbulanceMap;
