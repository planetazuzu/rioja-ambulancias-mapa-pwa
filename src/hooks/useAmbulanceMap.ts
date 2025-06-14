import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ambulancesData, LA_RIOJA_CENTER, Ambulance } from '../data/ambulances';
import { FilterState, UserLocation } from '../types/ambulance';
import { calculateDistance, findNearestAmbulance, getMarkerIcon } from '../utils/mapUtils';
import { toast } from 'sonner';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

export const useAmbulanceMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const coverageRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const userLocationRef = useRef<L.Marker | null>(null);
  
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearestAmbulance, setNearestAmbulance] = useState<Ambulance | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    showSVB: true,
    showSVA: true,
    show24h: true,
    show12h: true
  });

  const updateMapDisplay = () => {
    console.log('Updating map display...');
    if (!mapInstanceRef.current) {
      console.log('Map instance not available yet');
      return;
    }

    // Clear existing layers
    markersRef.current.clearLayers();
    coverageRef.current.clearLayers();

    // Filter ambulances based on current filters - FIXED LOGIC
    const filteredAmbulances = ambulancesData.filter(ambulance => {
      // Check type filter
      const typeMatch = (filters.showSVB && ambulance.tipo === 'SVB') || 
                       (filters.showSVA && ambulance.tipo === 'SVA');
      
      // Check schedule filter  
      const scheduleMatch = (filters.show24h && ambulance.horario === '24 h') || 
                           (filters.show12h && ambulance.horario === '12 h (día)');
      
      return typeMatch && scheduleMatch;
    });
    
    console.log('Current filters:', filters);
    console.log('Total ambulances:', ambulancesData.length);
    console.log('Filtered ambulances:', filteredAmbulances.length);
    console.log('Filtered ambulance types:', filteredAmbulances.map(a => a.tipo));

    // Add markers and coverage circles for filtered ambulances
    filteredAmbulances.forEach(ambulance => {
      // Add marker
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

      // Add coverage circles with fill
      const cobertura10 = L.circle([ambulance.lat, ambulance.lng], {
        color: "blue",
        fill: true,
        fillColor: "blue",
        fillOpacity: 0.18,
        radius: 10000, // 10 km
        weight: 1.5
      });

      const cobertura15 = L.circle([ambulance.lat, ambulance.lng], {
        color: "red",
        fill: true,
        fillColor: "red",
        fillOpacity: 0.12,
        radius: 15000, // 15 km
        weight: 1.5
      });

      coverageRef.current.addLayer(cobertura10);
      coverageRef.current.addLayer(cobertura15);
    });

    // Add layers to map
    markersRef.current.addTo(mapInstanceRef.current);
    coverageRef.current.addTo(mapInstanceRef.current);
    console.log('Map display updated successfully');
  };

  const getCurrentLocation = () => {
    console.log('Getting current location...');
    if (!navigator.geolocation) {
      console.log('Geolocation not available');
      toast.error('La geolocalización no está disponible en este navegador');
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      console.log('Got location:', latitude, longitude);
      setUserLocation({ lat: latitude, lng: longitude });
      const nearest = findNearestAmbulance(latitude, longitude, ambulancesData);
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

  const toggleFilter = (filterKey: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  // Initialize map
  useEffect(() => {
    console.log('Map component mounting...');
    console.log('Map ref current:', mapRef.current);
    if (!mapRef.current) {
      console.log('Map ref is null, cannot initialize map');
      return;
    }
    try {
      console.log('Initializing map...');
      const map = L.map(mapRef.current, {
        center: [LA_RIOJA_CENTER.lat, LA_RIOJA_CENTER.lng],
        zoom: 10,
        zoomControl: true
      });
      console.log('Map created successfully');

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      console.log('Tile layer added');
      mapInstanceRef.current = map;

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

  // Update map when filters change
  useEffect(() => {
    console.log('Filters changed:', filters);
    updateMapDisplay();
  }, [filters]);

  return {
    mapRef,
    mapInstanceRef,
    userLocation,
    nearestAmbulance,
    filters,
    getCurrentLocation,
    toggleFilter
  };
};
