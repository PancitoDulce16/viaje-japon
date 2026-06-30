/* ========================================
   RAMEN PASSPORT
   Sistema de tracking de ramen shops
   ======================================== */

// Tipos de ramen más populares
const TIPOS_RAMEN = [
  { id: 'shoyu', nombre: 'Shoyu (醤油)', descripcion: 'Base de salsa de soja', icono: '🍜' },
  { id: 'miso', nombre: 'Miso (味噌)', descripcion: 'Base de pasta de miso', icono: '🍲' },
  { id: 'shio', nombre: 'Shio (塩)', descripcion: 'Base de sal', icono: '🧂' },
  { id: 'tonkotsu', nombre: 'Tonkotsu (豚骨)', descripcion: 'Caldo de huesos de cerdo', icono: '🐷' },
  { id: 'tantanmen', nombre: 'Tantanmen (担々麺)', descripcion: 'Estilo picante chino', icono: '🌶️' },
  { id: 'tsukemen', nombre: 'Tsukemen (つけ麺)', descripcion: 'Fideos para mojar', icono: '🥢' },
  { id: 'abura', nombre: 'Abura Soba (油そば)', descripcion: 'Sin caldo, mezclado', icono: '🍝' }
];

// Regiones rameneras famosas
const REGIONES_RAMEN = [
  { id: 'tokyo', nombre: 'Tokyo', especialidad: 'Shoyu Ramen' },
  { id: 'sapporo', nombre: 'Sapporo', especialidad: 'Miso Ramen' },
  { id: 'hakata', nombre: 'Hakata (Fukuoka)', especialidad: 'Tonkotsu Ramen' },
  { id: 'kitakata', nombre: 'Kitakata', especialidad: 'Shoyu Ramen espeso' },
  { id: 'yokohama', nombre: 'Yokohama', especialidad: 'Iekei Ramen' }
];

// Toppings populares
const TOPPINGS = [
  'Chashu (cerdo)', 'Ajitsuke Tamago (huevo marinado)', 'Menma (brotes bambú)',
  'Negi (cebollín)', 'Nori (alga)', 'Naruto (fish cake)',
  'Moyashi (brotes soja)', 'Corn', 'Butter', 'Kikurage (hongos)'
];

// Shops famosos (ejemplos)
const SHOPS_FAMOSOS = [
  { nombre: 'Ichiran', ciudad: 'Multiple', tipo: 'tonkotsu', rating: 4.5 },
  { nombre: 'Ippudo', ciudad: 'Multiple', tipo: 'tonkotsu', rating: 4.7 },
  { nombre: 'Afuri', ciudad: 'Tokyo', tipo: 'shoyu', rating: 4.6 },
  { nombre: 'Nakiryu', ciudad: 'Tokyo', tipo: 'tantanmen', rating: 4.8 },
  { nombre: 'Tsuta', ciudad: 'Tokyo', tipo: 'shoyu', rating: 4.7 },
  { nombre: 'Fuunji', ciudad: 'Tokyo', tipo: 'tsukemen', rating: 4.6 }
];

// Clase para gestionar el passport
class RamenPassport {
  constructor() {
    this.visitas = this.cargarVisitas();
  }

  cargarVisitas() {
    const saved = localStorage.getItem('ramen_passport');
    return saved ? JSON.parse(saved) : [];
  }

  guardarVisitas() {
    localStorage.setItem('ramen_passport', JSON.stringify(this.visitas));
  }

  agregarVisita(visita) {
    const nuevaVisita = {
      id: Date.now(),
      fecha: visita.fecha || new Date().toISOString(),
      nombre: visita.nombre,
      ciudad: visita.ciudad,
      tipo: visita.tipo,
      rating: visita.rating || 0,
      precio: visita.precio || 0,
      toppings: visita.toppings || [],
      notas: visita.notas || '',
      foto: visita.foto || null
    };

    this.visitas.push(nuevaVisita);
    this.guardarVisitas();
    return nuevaVisita;
  }

  editarVisita(id, datos) {
    const index = this.visitas.findIndex(v => v.id === id);
    if (index !== -1) {
      this.visitas[index] = { ...this.visitas[index], ...datos };
      this.guardarVisitas();
      return this.visitas[index];
    }
    return null;
  }

  eliminarVisita(id) {
    this.visitas = this.visitas.filter(v => v.id !== id);
    this.guardarVisitas();
  }

  obtenerEstadisticas() {
    const total = this.visitas.length;
    const tiposVisitados = [...new Set(this.visitas.map(v => v.tipo))];
    const ciudadesVisitadas = [...new Set(this.visitas.map(v => v.ciudad))];

    const ratingPromedio = total > 0
      ? (this.visitas.reduce((sum, v) => sum + v.rating, 0) / total).toFixed(1)
      : 0;

    const precioPromedio = total > 0
      ? Math.round(this.visitas.reduce((sum, v) => sum + v.precio, 0) / total)
      : 0;

    const tipoFavorito = this.obtenerMasFrecuente(this.visitas.map(v => v.tipo));
    const ciudadFavorita = this.obtenerMasFrecuente(this.visitas.map(v => v.ciudad));

    return {
      total,
      tiposVisitados: tiposVisitados.length,
      ciudadesVisitadas: ciudadesVisitadas.length,
      ratingPromedio,
      precioPromedio,
      tipoFavorito,
      ciudadFavorita
    };
  }

  obtenerMasFrecuente(arr) {
    if (arr.length === 0) return 'N/A';
    const frecuencias = {};
    arr.forEach(item => {
      frecuencias[item] = (frecuencias[item] || 0) + 1;
    });
    return Object.keys(frecuencias).reduce((a, b) =>
      frecuencias[a] > frecuencias[b] ? a : b
    );
  }

  obtenerTopRamen(limite = 5) {
    return [...this.visitas]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limite);
  }

  buscar(termino) {
    termino = termino.toLowerCase();
    return this.visitas.filter(v =>
      v.nombre.toLowerCase().includes(termino) ||
      v.ciudad.toLowerCase().includes(termino) ||
      v.tipo.toLowerCase().includes(termino)
    );
  }
}

// Export
if (typeof window !== 'undefined') {
  window.RamenPassport = RamenPassport;
  window.RamenData = {
    tipos: TIPOS_RAMEN,
    regiones: REGIONES_RAMEN,
    toppings: TOPPINGS,
    shopsFamosos: SHOPS_FAMOSOS
  };
}
