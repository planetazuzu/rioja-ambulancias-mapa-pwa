
import L from 'leaflet';
import { Ambulance } from '../data/ambulances';

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const findNearestAmbulance = (userLat: number, userLng: number, ambulances: Ambulance[]): Ambulance => {
  return ambulances.reduce((nearest, current) => {
    const currentDistance = calculateDistance(userLat, userLng, current.lat, current.lng);
    const nearestDistance = calculateDistance(userLat, userLng, nearest.lat, nearest.lng);
    return currentDistance < nearestDistance ? current : nearest;
  });
};

export const getMarkerIcon = (ambulance: Ambulance) => {
  const isSVA = ambulance.tipo === 'SVA';
  const is24h = ambulance.horario === '24 h';

  // Color based on type and schedule
  let markerColor = 'red'; // Default red
  if (isSVA && is24h) markerColor = 'red'; // Red for SVA 24h
  else if (isSVA && !is24h) markerColor = 'orange'; // Orange for SVA 12h
  else if (!isSVA && is24h) markerColor = 'blue'; // Blue for SVB 24h
  else markerColor = 'green'; // Green for SVB 12h

  // Use FontAwesome ambulance icon with colored background
  const color = markerColor === 'red' ? '#dc2626' : 
                markerColor === 'orange' ? '#f97316' :
                markerColor === 'blue' ? '#2563eb' : '#16a34a';

  return L.divIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        font-size: 14px;
        color: white;
      ">
        <i class="fas fa-ambulance"></i>
      </div>
    `,
    className: 'custom-ambulance-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

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
