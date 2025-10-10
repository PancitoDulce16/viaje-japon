// data/airlines-data.js - Base de Datos de Aerolíneas

export const AIRLINES = [
  // Aerolíneas Mexicanas
  { 
    id: 'AM', 
    name: 'Aeroméxico', 
    logo: '🇲🇽', 
    country: 'México',
    color: '#C11033',
    website: 'https://aeromexico.com'
  },
  { 
    id: 'Y4', 
    name: 'Volaris', 
    logo: '🇲🇽', 
    country: 'México',
    color: '#A61F69',
    website: 'https://volaris.com'
  },
  { 
    id: 'VB', 
    name: 'VivaAerobus', 
    logo: '🇲🇽', 
    country: 'México',
    color: '#00B140',
    website: 'https://vivaaerobus.com'
  },
  
  // Aerolíneas Estadounidenses
  { 
    id: 'AA', 
    name: 'American Airlines', 
    logo: '🇺🇸', 
    country: 'Estados Unidos',
    color: '#0078D2',
    website: 'https://aa.com'
  },
  { 
    id: 'UA', 
    name: 'United Airlines', 
    logo: '🇺🇸', 
    country: 'Estados Unidos',
    color: '#004EA2',
    website: 'https://united.com'
  },
  { 
    id: 'DL', 
    name: 'Delta Airlines', 
    logo: '🇺🇸', 
    country: 'Estados Unidos',
    color: '#003366',
    website: 'https://delta.com'
  },
  
  // Aerolíneas Canadienses
  { 
    id: 'AC', 
    name: 'Air Canada', 
    logo: '🇨🇦', 
    country: 'Canadá',
    color: '#E01D24',
    website: 'https://aircanada.com'
  },
  
  // Aerolíneas Europeas
  { 
    id: 'BA', 
    name: 'British Airways', 
    logo: '🇬🇧', 
    country: 'Reino Unido',
    color: '#CC0033',
    website: 'https://britishairways.com'
  },
  { 
    id: 'AF', 
    name: 'Air France', 
    logo: '🇫🇷', 
    country: 'Francia',
    color: '#002157',
    website: 'https://airfrance.com'
  },
  { 
    id: 'LH', 
    name: 'Lufthansa', 
    logo: '🇩🇪', 
    country: 'Alemania',
    color: '#FFD800',
    website: 'https://lufthansa.com'
  },
  { 
    id: 'IB', 
    name: 'Iberia', 
    logo: '🇪🇸', 
    country: 'España',
    color: '#EC0033',
    website: 'https://iberia.com'
  },
  { 
    id: 'KL', 
    name: 'KLM', 
    logo: '🇳🇱', 
    country: 'Países Bajos',
    color: '#00A1E4',
    website: 'https://klm.com'
  },
  
  // Aerolíneas Asiáticas
  { 
    id: 'NH', 
    name: 'All Nippon Airways (ANA)', 
    logo: '🇯🇵', 
    country: 'Japón',
    color: '#00479D',
    website: 'https://ana.co.jp'
  },
  { 
    id: 'JL', 
    name: 'Japan Airlines (JAL)', 
    logo: '🇯🇵', 
    country: 'Japón',
    color: '#CC0033',
    website: 'https://jal.co.jp'
  },
  { 
    id: 'KE', 
    name: 'Korean Air', 
    logo: '🇰🇷', 
    country: 'Corea del Sur',
    color: '#004EA2',
    website: 'https://koreanair.com'
  },
  { 
    id: 'CX', 
    name: 'Cathay Pacific', 
    logo: '🇭🇰', 
    country: 'Hong Kong',
    color: '#006564',
    website: 'https://cathaypacific.com'
  },
  { 
    id: 'SQ', 
    name: 'Singapore Airlines', 
    logo: '🇸🇬', 
    country: 'Singapur',
    color: '#003366',
    website: 'https://singaporeair.com'
  },
  { 
    id: 'TG', 
    name: 'Thai Airways', 
    logo: '🇹🇭', 
    country: 'Tailandia',
    color: '#47137A',
    website: 'https://thaiairways.com'
  },
  
  // Aerolíneas Low-Cost Asiáticas
  { 
    id: 'Z0', 
    name: 'Peach Aviation', 
    logo: '🇯🇵', 
    country: 'Japón (Low-Cost)',
    color: '#F94092',
    website: 'https://flypeach.com'
  },
  { 
    id: 'JW', 
    name: 'Vanilla Air', 
    logo: '🇯🇵', 
    country: 'Japón (Low-Cost)',
    color: '#FFD700',
    website: 'https://vanilla-air.com'
  },
  { 
    id: 'MM', 
    name: 'Skymark Airlines', 
    logo: '🇯🇵', 
    country: 'Japón (Low-Cost)',
    color: '#003366',
    website: 'https://skymark.co.jp'
  },
  
  // Otras
  { 
    id: 'QR', 
    name: 'Qatar Airways', 
    logo: '🇶🇦', 
    country: 'Qatar',
    color: '#5C0A2E',
    website: 'https://qatarairways.com'
  },
  { 
    id: 'EK', 
    name: 'Emirates', 
    logo: '🇦🇪', 
    country: 'Emiratos Árabes',
    color: '#D71921',
    website: 'https://emirates.com'
  },
  { 
    id: 'AZ', 
    name: 'Alitalia', 
    logo: '🇮🇹', 
    country: 'Italia',
    color: '#006643',
    website: 'https://alitalia.com'
  }
];

// Función helper para buscar aerolínea por código
export function getAirlineByCode(code) {
  return AIRLINES.find(airline => airline.id === code);
}

// Función para obtener aerolíneas por región
export function getAirlinesByRegion(region) {
  const regionMap = {
    'america': ['México', 'Estados Unidos', 'Canadá'],
    'europe': ['Reino Unido', 'Francia', 'Alemania', 'España', 'Países Bajos', 'Italia'],
    'asia': ['Japón', 'Corea del Sur', 'Hong Kong', 'Singapur', 'Tailandia'],
    'middle-east': ['Qatar', 'Emiratos Árabes']
  };
  
  const countries = regionMap[region] || [];
  return AIRLINES.filter(airline => 
    countries.some(country => airline.country.includes(country))
  );
}

// Aeropuertos principales
export const AIRPORTS = {
  // México
  'MEX': { name: 'Aeropuerto Internacional de la Ciudad de México', city: 'Ciudad de México', country: 'México', code: 'MEX' },
  'MTY': { name: 'Aeropuerto Internacional de Monterrey', city: 'Monterrey', country: 'México', code: 'MTY' },
  'GDL': { name: 'Aeropuerto Internacional de Guadalajara', city: 'Guadalajara', country: 'México', code: 'GDL' },
  'CUN': { name: 'Aeropuerto Internacional de Cancún', city: 'Cancún', country: 'México', code: 'CUN' },
  'TIJ': { name: 'Aeropuerto Internacional de Tijuana', city: 'Tijuana', country: 'México', code: 'TIJ' },
  
  // Estados Unidos
  'LAX': { name: 'Los Angeles International Airport', city: 'Los Ángeles', country: 'Estados Unidos', code: 'LAX' },
  'SFO': { name: 'San Francisco International Airport', city: 'San Francisco', country: 'Estados Unidos', code: 'SFO' },
  'DFW': { name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'Estados Unidos', code: 'DFW' },
  'IAH': { name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'Estados Unidos', code: 'IAH' },
  'ORD': { name: 'O\'Hare International Airport', city: 'Chicago', country: 'Estados Unidos', code: 'ORD' },
  'JFK': { name: 'John F. Kennedy International Airport', city: 'Nueva York', country: 'Estados Unidos', code: 'JFK' },
  
  // Japón
  'NRT': { name: 'Narita International Airport', city: 'Tokyo', country: 'Japón', code: 'NRT' },
  'HND': { name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japón', code: 'HND' },
  'KIX': { name: 'Kansai International Airport', city: 'Osaka', country: 'Japón', code: 'KIX' },
  'NGO': { name: 'Chubu Centrair International Airport', city: 'Nagoya', country: 'Japón', code: 'NGO' },
  'FUK': { name: 'Fukuoka Airport', city: 'Fukuoka', country: 'Japón', code: 'FUK' },
  'CTS': { name: 'New Chitose Airport', city: 'Sapporo', country: 'Japón', code: 'CTS' },
  
  // Europa
  'LHR': { name: 'London Heathrow Airport', city: 'Londres', country: 'Reino Unido', code: 'LHR' },
  'CDG': { name: 'Charles de Gaulle Airport', city: 'París', country: 'Francia', code: 'CDG' },
  'FRA': { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Alemania', code: 'FRA' },
  'MAD': { name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'España', code: 'MAD' },
  'AMS': { name: 'Amsterdam Airport Schiphol', city: 'Ámsterdam', country: 'Países Bajos', code: 'AMS' },
  
  // Asia
  'ICN': { name: 'Incheon International Airport', city: 'Seúl', country: 'Corea del Sur', code: 'ICN' },
  'HKG': { name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', code: 'HKG' },
  'SIN': { name: 'Singapore Changi Airport', city: 'Singapur', country: 'Singapur', code: 'SIN' },
  'BKK': { name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Tailandia', code: 'BKK' },
  
  // Medio Oriente
  'DOH': { name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', code: 'DOH' },
  'DXB': { name: 'Dubai International Airport', city: 'Dubái', country: 'Emiratos Árabes', code: 'DXB' }
};

// Función helper para buscar aeropuerto
export function getAirportByCode(code) {
  return AIRPORTS[code];
}

// Función para buscar aeropuertos por texto
export function searchAirports(query) {
  const lowerQuery = query.toLowerCase();
  return Object.values(AIRPORTS).filter(airport =>
    airport.name.toLowerCase().includes(lowerQuery) ||
    airport.city.toLowerCase().includes(lowerQuery) ||
    airport.code.toLowerCase().includes(lowerQuery)
  );
}
