
import React from 'react';
import { MapPin, Navigation, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterState, UserLocation } from '../types/ambulance';
import { Ambulance } from '../data/ambulances';
import { calculateDistance } from '../utils/mapUtils';

interface MapSidebarProps {
  filters: FilterState;
  userLocation: UserLocation | null;
  nearestAmbulance: Ambulance | null;
  onLocationClick: () => void;
  onToggleFilter: (filterKey: keyof FilterState) => void;
}

const MapSidebar: React.FC<MapSidebarProps> = ({
  filters,
  userLocation,
  nearestAmbulance,
  onLocationClick,
  onToggleFilter
}) => {
  return (
    <div className="lg:w-80 w-full lg:h-full h-auto bg-card border-r border-border p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Mapa de Ambulancias en La Rioja</h1>
        </div>

        {/* Location Button */}
        <Button onClick={onLocationClick} className="w-full flex items-center gap-2" variant="outline">
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
              <Button 
                variant={filters.showSVB ? "default" : "outline"} 
                size="sm" 
                onClick={() => onToggleFilter('showSVB')} 
                className="text-xs"
              >
                {filters.showSVB ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                SVB
              </Button>
              <Button 
                variant={filters.showSVA ? "default" : "outline"} 
                size="sm" 
                onClick={() => onToggleFilter('showSVA')} 
                className="text-xs"
              >
                {filters.showSVA ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                SVA
              </Button>
              <Button 
                variant={filters.show24h ? "default" : "outline"} 
                size="sm" 
                onClick={() => onToggleFilter('show24h')} 
                className="text-xs"
              >
                {filters.show24h ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                24h
              </Button>
              <Button 
                variant={filters.show12h ? "default" : "outline"} 
                size="sm" 
                onClick={() => onToggleFilter('show12h')} 
                className="text-xs"
              >
                {filters.show12h ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                12h
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nearest Ambulance */}
        {nearestAmbulance && userLocation && (
          <Card>
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
          </Card>
        )}
      </div>
    </div>
  );
};

export default MapSidebar;
