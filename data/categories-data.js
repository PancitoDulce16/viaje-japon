// data/categories-data.js - Categorías de Intereses

export const CATEGORIES = [
  {
    id: 'culture',
    name: 'Cultura',
    icon: '🏛️',
    color: 'purple',
    description: 'Templos, museos, historia y tradiciones'
  },
  {
    id: 'food',
    name: 'Gastronomía',
    icon: '🍜',
    color: 'red',
    description: 'Restaurantes, mercados y experiencias culinarias'
  },
  {
    id: 'nature',
    name: 'Naturaleza',
    icon: '🌿',
    color: 'green',
    description: 'Parques, jardines y paisajes naturales'
  },
  {
    id: 'shopping',
    name: 'Compras',
    icon: '🛍️',
    color: 'pink',
    description: 'Tiendas, centros comerciales y mercados'
  },
  {
    id: 'nightlife',
    name: 'Vida Nocturna',
    icon: '🌃',
    color: 'indigo',
    description: 'Bares, clubs y entretenimiento nocturno'
  },
  {
    id: 'adventure',
    name: 'Aventura',
    icon: '🏔️',
    color: 'orange',
    description: 'Deportes extremos y actividades al aire libre'
  },
  {
    id: 'relaxation',
    name: 'Relajación',
    icon: '🧘',
    color: 'blue',
    description: 'Spas, onsens y actividades tranquilas'
  },
  {
    id: 'photography',
    name: 'Fotografía',
    icon: '📸',
    color: 'yellow',
    description: 'Lugares instagrameables y vistas panorámicas'
  },
  {
    id: 'anime',
    name: 'Anime/Manga',
    icon: '🎮',
    color: 'violet',
    description: 'Tiendas, cafés temáticos y cultura otaku'
  },
  {
    id: 'family',
    name: 'Familia',
    icon: '👨‍👩‍👧‍👦',
    color: 'cyan',
    description: 'Actividades para todas las edades'
  }
];

export const TEMPLATES = [
  {
    id: 'cultural',
    name: 'Inmersión Cultural',
    description: 'Enfocado en templos, museos y experiencias tradicionales',
    categories: ['culture', 'food', 'photography'],
    icon: '🏛️',
    color: 'purple',
    pace: 'moderate'
  },
  {
    id: 'foodie',
    name: 'Tour Gastronómico',
    description: 'Los mejores restaurantes, mercados y experiencias culinarias',
    categories: ['food', 'culture'],
    icon: '🍜',
    color: 'red',
    pace: 'relaxed'
  },
  {
    id: 'adventure',
    name: 'Aventura Extrema',
    description: 'Actividades al aire libre, deportes y naturaleza',
    categories: ['adventure', 'nature', 'photography'],
    icon: '🏔️',
    color: 'orange',
    pace: 'intense'
  },
  {
    id: 'relaxed',
    name: 'Viaje Relajado',
    description: 'Ritmo tranquilo con spas, cafés y paseos',
    categories: ['relaxation', 'food', 'shopping'],
    icon: '🧘',
    color: 'blue',
    pace: 'relaxed'
  },
  {
    id: 'otaku',
    name: 'Paraíso Otaku',
    description: 'Anime, manga, cafés temáticos y cultura pop japonesa',
    categories: ['anime', 'shopping', 'food'],
    icon: '🎮',
    color: 'violet',
    pace: 'moderate'
  },
  {
    id: 'complete',
    name: 'Experiencia Completa',
    description: 'Un balance perfecto de todo tipo de actividades',
    categories: ['culture', 'food', 'nature', 'shopping', 'photography'],
    icon: '✨',
    color: 'gradient',
    pace: 'moderate'
  },
  {
    id: 'family',
    name: 'Viaje Familiar',
    description: 'Actividades para todas las edades con ritmo flexible',
    categories: ['family', 'nature', 'culture', 'food'],
    icon: '👨‍👩‍👧‍👦',
    color: 'cyan',
    pace: 'relaxed'
  },
  {
    id: 'photographer',
    name: 'Safari Fotográfico',
    description: 'Los mejores spots para fotos en Japón',
    categories: ['photography', 'nature', 'culture'],
    icon: '📸',
    color: 'yellow',
    pace: 'moderate'
  }
];
