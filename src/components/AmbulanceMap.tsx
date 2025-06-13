
import React from 'react';
import { useAmbulanceMap } from '../hooks/useAmbulanceMap';
import MapSidebar from './MapSidebar';

const AmbulanceMap: React.FC = () => {
  const {
    mapRef,
    mapInstanceRef,
    userLocation,
    nearestAmbulance,
    filters,
    getCurrentLocation,
    toggleFilter
  } = useAmbulanceMap();

  console.log('Rendering AmbulanceMap component');
  
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background">
      {/* Controls Sidebar */}
      <MapSidebar
        filters={filters}
        userLocation={userLocation}
        nearestAmbulance={nearestAmbulance}
        onLocationClick={getCurrentLocation}
        onToggleFilter={toggleFilter}
      />

      {/* Map */}
      <div className="flex-1 relative">
        <div 
          ref={mapRef} 
          className="w-full h-full" 
          style={{
            minHeight: '400px',
            backgroundColor: '#f0f0f0'
          }} 
        />
        {!mapInstanceRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmbulanceMap;
