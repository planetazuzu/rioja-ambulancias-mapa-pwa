
import React from 'react';
import { MapPin, Navigation, Eye, EyeOff, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from './ui/checkbox';
import { FilterState, UserLocation } from '../types/ambulance';
import { Ambulance, ambulancesData } from '../data/ambulances';
import { calculateDistance } from '../utils/mapUtils';

interface MapSidebarProps {
  filters: FilterState;
  userLocation: UserLocation | null;
  nearestAmbulance: Ambulance | null;
  onLocationClick: () => void;
  onToggleFilter: (filterKey: keyof FilterState) => void;
  ambulanceVisibility: Record<string, boolean>;
  toggleAmbulanceVisibility: (nombre: string) => void;
  setAllAmbulancesVisibility: (visible: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const MapSidebar: React.FC<MapSidebarProps> = ({
  filters,
  userLocation,
  nearestAmbulance,
  onLocationClick,
  onToggleFilter,
  ambulanceVisibility,
  toggleAmbulanceVisibility,
  setAllAmbulancesVisibility,
  isCollapsed,
  setIsCollapsed
}) => {
  // Saber si todas están seleccionadas
  const visibleCount = Object.values(ambulanceVisibility).filter(Boolean).length;
  const allChecked = visibleCount === ambulancesData.length;
  const someChecked = visibleCount > 0 && visibleCount < ambulancesData.length;

  return (
    <>
      {/* Botón hamburguesa - siempre visible */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50"
        size="icon"
        variant="outline"
      >
        {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-40 
        w-80 h-full 
        bg-card border-r border-border p-4 overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <div className="space-y-4 mt-16">
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

          {/* Filtros */}
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

          {/* Selector de "todas" y lista de ambulancias */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Capas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center gap-2">
                <Checkbox
                  id="toggle-all"
                  checked={allChecked}
                  onCheckedChange={(checked) => {
                    setAllAmbulancesVisibility(!!checked);
                  }}
                />
                <label htmlFor="toggle-all" className="text-xs font-semibold select-none cursor-pointer">
                  Seleccionar todas {someChecked && `(${visibleCount}/${ambulancesData.length})`}
                </label>
              </div>
              <div className="max-h-52 overflow-y-auto pr-2 space-y-1">
                {ambulancesData.map(ambulance => (
                  <div key={ambulance.nombre} className="flex items-center gap-2">
                    <Checkbox
                      id={`ambulance-${ambulance.nombre}`}
                      checked={ambulanceVisibility[ambulance.nombre]}
                      onCheckedChange={() => toggleAmbulanceVisibility(ambulance.nombre)}
                    />
                    <label htmlFor={`ambulance-${ambulance.nombre}`} className="text-xs cursor-pointer select-none">
                      {ambulance.nombre} <span className="text-[10px] text-muted-foreground">({ambulance.tipo})</span>
                    </label>
                  </div>
                ))}
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

      {/* Overlay para cuando el sidebar está abierto */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default MapSidebar;
