
export interface Ambulance {
  nombre: string;
  tipo: 'SVB' | 'SVA';
  horario: '24 h' | '12 h (día)';
  lat: number;
  lng: number;
}

export const ambulancesData: Ambulance[] = [
  { "nombre": "Arnedo SVB", "tipo": "SVB", "horario": "24 h", "lat": 42.2251, "lng": -2.1042 },
  { "nombre": "Calahorra SVB", "tipo": "SVB", "horario": "24 h", "lat": 42.3055, "lng": -1.9651 },
  { "nombre": "Calahorra SVA", "tipo": "SVA", "horario": "24 h", "lat": 42.3055, "lng": -1.9651 },
  { "nombre": "Alfaro SVB", "tipo": "SVB", "horario": "24 h", "lat": 42.1796, "lng": -1.7504 },
  { "nombre": "Cervera del Río Alhama SVB", "tipo": "SVB", "horario": "24 h", "lat": 41.9938, "lng": -1.9985 },
  { "nombre": "Nájera SVB", "tipo": "SVB", "horario": "24 h", "lat": 42.4177, "lng": -2.7347 },
  { "nombre": "Santo Domingo de la Calzada SVB", "tipo": "SVB", "horario": "24 h", "lat": 42.4407, "lng": -2.9546 },
  { "nombre": "Haro SVB", "tipo": "SVB", "horario": "24 h", "lat": 42.5766, "lng": -2.8490 },
  { "nombre": "Haro SVA", "tipo": "SVA", "horario": "24 h", "lat": 42.5766, "lng": -2.8490 },
  { "nombre": "Villamediana de Iregua SVB", "tipo": "SVB", "horario": "24 h", "lat": 42.4300, "lng": -2.4125 },
  { "nombre": "Ribafrecha SVB", "tipo": "SVB", "horario": "24 h", "lat": 42.3627, "lng": -2.3565 },
  { "nombre": "CARPA Logroño SVB (1)", "tipo": "SVB", "horario": "24 h", "lat": 42.4631, "lng": -2.4520 },
  { "nombre": "CARPA Logroño SVB (2)", "tipo": "SVB", "horario": "24 h", "lat": 42.4611, "lng": -2.4500 },
  { "nombre": "CARPA Logroño SVA", "tipo": "SVA", "horario": "24 h", "lat": 42.4621, "lng": -2.4510 },
  { "nombre": "Logroño - Cascajos SVB", "tipo": "SVB", "horario": "12 h (día)", "lat": 42.45833, "lng": -2.44024 },
  { "nombre": "Logroño - Siete Infantes SVA", "tipo": "SVA", "horario": "12 h (día)", "lat": 42.4580, "lng": -2.4600 },
  { "nombre": "Villanueva de Cameros SVB", "tipo": "SVB", "horario": "24 h", "lat": 42.1377, "lng": -2.6566 },
  { "nombre": "Cenicero SVB", "tipo": "SVB", "horario": "12 h (día)", "lat": 42.5145, "lng": -2.6942 }
];

// La Rioja center coordinates
export const LA_RIOJA_CENTER = {
  lat: 42.287,
  lng: -2.54
};
