/* ========================================
   GOSHUIN BOOK - Libro Digital de Sellos
   Sistema para coleccionar sellos de templos
   ======================================== */

// Templos/Santuarios famosos
const TEMPLOS_FAMOSOS = [
  { nombre: 'Sensoji', ciudad: 'Tokyo (Asakusa)', tipo: 'Templo Budista', precio: 300 },
  { nombre: 'Meiji Jingu', ciudad: 'Tokyo (Shibuya)', tipo: 'Santuario Shintoista', precio: 500 },
  { nombre: 'Kiyomizu-dera', ciudad: 'Kyoto', tipo: 'Templo Budista', precio: 300 },
  { nombre: 'Fushimi Inari', ciudad: 'Kyoto', tipo: 'Santuario Shintoista', precio: 300 },
  { nombre: 'Kinkaku-ji', ciudad: 'Kyoto (Pabellón Dorado)', tipo: 'Templo Budista', precio: 300 },
  { nombre: 'Ginkaku-ji', ciudad: 'Kyoto (Pabellón Plateado)', tipo: 'Templo Budista', precio: 300 },
  { nombre: 'Todai-ji', ciudad: 'Nara', tipo: 'Templo Budista', precio: 300 },
  { nombre: 'Kasuga Taisha', ciudad: 'Nara', tipo: 'Santuario Shintoista', precio: 300 },
  { nombre: 'Itsukushima', ciudad: 'Miyajima (Hiroshima)', tipo: 'Santuario Shintoista', precio: 300 },
  { nombre: 'Nikko Toshogu', ciudad: 'Nikko', tipo: 'Santuario Shintoista', precio: 500 }
];

// Clase para gestionar el goshuin book
class GoshuinBook {
  constructor() {
    this.goshuin = this.cargarGoshuin();
  }

  cargarGoshuin() {
    const saved = localStorage.getItem('goshuin_book');
    return saved ? JSON.parse(saved) : [];
  }

  guardarGoshuin() {
    localStorage.setItem('goshuin_book', JSON.stringify(this.goshuin));
  }

  agregar(sello) {
    const nuevoSello = {
      id: Date.now(),
      fecha: sello.fecha || new Date().toISOString(),
      nombreTemplo: sello.nombreTemplo,
      ciudad: sello.ciudad,
      tipo: sello.tipo || 'Templo',
      precio: sello.precio || 300,
      notas: sello.notas || '',
      foto: sello.foto || null,
      coordenadas: sello.coordenadas || null
    };

    this.goshuin.push(nuevoSello);
    this.guardarGoshuin();
    return nuevoSello;
  }

  editar(id, datos) {
    const index = this.goshuin.findIndex(g => g.id === id);
    if (index !== -1) {
      this.goshuin[index] = { ...this.goshuin[index], ...datos };
      this.guardarGoshuin();
      return this.goshuin[index];
    }
    return null;
  }

  eliminar(id) {
    this.goshuin = this.goshuin.filter(g => g.id !== id);
    this.guardarGoshuin();
  }

  obtenerEstadisticas() {
    const total = this.goshuin.length;
    const ciudadesVisitadas = [...new Set(this.goshuin.map(g => g.ciudad))];
    const templos = this.goshuin.filter(g => g.tipo.includes('Templo')).length;
    const santuarios = this.goshuin.filter(g => g.tipo.includes('Santuario')).length;

    const costoTotal = this.goshuin.reduce((sum, g) => sum + (g.precio || 0), 0);

    return {
      total,
      ciudadesVisitadas: ciudadesVisitadas.length,
      templos,
      santuarios,
      costoTotal
    };
  }

  buscar(termino) {
    termino = termino.toLowerCase();
    return this.goshuin.filter(g =>
      g.nombreTemplo.toLowerCase().includes(termino) ||
      g.ciudad.toLowerCase().includes(termino) ||
      g.tipo.toLowerCase().includes(termino)
    );
  }

  exportarPDF() {
    // Placeholder para funcionalidad futura
    console.log('Exportar PDF con', this.goshuin.length, 'sellos');
  }
}

// Export
if (typeof window !== 'undefined') {
  window.GoshuinBook = GoshuinBook;
  window.GoshuinData = {
    templosFamosos: TEMPLOS_FAMOSOS
  };
}
