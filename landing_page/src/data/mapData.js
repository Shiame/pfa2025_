// Mock data for the map visualization
export const anomalyTypes = [
  { 
    id: 1, 
    name: 'Agression', 
    color: '#DC2626', // alert-600
    description: 'Incidents impliquant des agressions physiques ou verbales'
  },
  { 
    id: 2, 
    name: 'Corruption', 
    color: '#D97706', // warning-600
    description: 'Signalements liés à des actes de corruption ou d\'abus de pouvoir'
  },
  { 
    id: 3, 
    name: 'Hygiène', 
    color: '#059669', // success-600
    description: 'Problèmes liés à l\'hygiène et à la salubrité publique'
  },
  { 
    id: 4, 
    name: 'Infrastructure', 
    color: '#2563EB', // primary-600
    description: 'Problèmes d\'infrastructure urbaine (routes, bâtiments, etc.)'
  },
  { 
    id: 5, 
    name: 'Nuisance sonore', 
    color: '#7C3AED', // purple-600
    description: 'Plaintes concernant des nuisances sonores excessives'
  },
  { 
    id: 6, 
    name: 'Sécurité', 
    color: '#DB2777', // pink-600
    description: 'Problèmes liés à la sécurité publique'
  },
];

// Mock data for map markers
export const anomalyMarkers = [
  {
    id: 1,
    typeId: 1, // Agression
    lat: 48.858844,
    lng: 2.294351,
    count: 28,
  },
  {
    id: 2,
    typeId: 2, // Corruption
    lat: 48.863791,
    lng: 2.313305,
    count: 43,
  },
  {
    id: 3,
    typeId: 3, // Hygiène
    lat: 48.869622,
    lng: 2.307242,
    count: 35,
  },
  {
    id: 4,
    typeId: 4, // Infrastructure
    lat: 48.855541,
    lng: 2.312822,
    count: 52,
  },
  {
    id: 5,
    typeId: 5, // Nuisance sonore
    lat: 48.853319,
    lng: 2.348787,
    count: 19,
  },
  {
    id: 6,
    typeId: 1, // Agression
    lat: 48.861553,
    lng: 2.339058,
    count: 17,
  },
  {
    id: 7,
    typeId: 6, // Sécurité
    lat: 48.849428,
    lng: 2.337494,
    count: 31,
  },
  {
    id: 8,
    typeId: 3, // Hygiène
    lat: 48.872622,
    lng: 2.332188,
    count: 26,
  },
  {
    id: 9,
    typeId: 2, // Corruption
    lat: 48.843812,
    lng: 2.326694,
    count: 22,
  },
  {
    id: 10,
    typeId: 4, // Infrastructure
    lat: 48.837374,
    lng: 2.347594,
    count: 45,
  },
];

export const calculateMarkerSize = (count) => {
  // Dynamically calculate the size based on the count
  const baseSize = 40;
  const sizeFactor = 0.5;
  return baseSize + count * sizeFactor;
};

// Get anomaly type by ID
export const getAnomalyTypeById = (typeId) => {
  return anomalyTypes.find(type => type.id === typeId);
};