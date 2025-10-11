// js/flights.js - Gestión completa de vuelos CON CARGA AUTOMÁTICA DEL WIZARD
import { db, auth } from './firebase-config.js';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { APIsIntegration } from './apis-integration.js';
import { Notifications } from './notifications.js';

export const FlightsHandler = {
  currentTripId: null,
  myFlights: [],
  
  // Información de equipaje por aerolínea
  airlineBaggage: {
    'AM': {
      name: 'Aeroméxico',
      personalItem: { dimensions: '45 x 35 x 20 cm', weight: 'Incluido en carry-on' },
      carryOn: { dimensions: '56 x 36 x 23 cm', weight: '10 kg' },
      checked: { dimensions: '158 cm lineales (suma)', weight: '23 kg', quantity: '1 maleta gratis' },
      notes: 'Segunda maleta: $50 USD. Exceso de peso (23-32kg): $75 USD'
    },
    'UA': {
      name: 'United Airlines',
      personalItem: { dimensions: '43 x 25 x 22 cm', weight: 'Incluido' },
      carryOn: { dimensions: '56 x 35 x 22 cm', weight: 'Sin límite' },
      checked: { dimensions: '157 cm lineales', weight: '23 kg', quantity: '1 maleta gratis (internacional)' },
      notes: 'Segunda maleta: $100 USD. Exceso de peso: $100 USD'
    },
    'AA': {
      name: 'American Airlines',
      personalItem: { dimensions: '45 x 35 x 20 cm', weight: 'Incluido' },
      carryOn: { dimensions: '56 x 36 x 23 cm', weight: 'Sin límite' },
      checked: { dimensions: '158 cm lineales', weight: '23 kg', quantity: '1 maleta gratis (internacional)' },
      notes: 'Segunda maleta: $100 USD. Exceso: $100-200 USD'
    },
    'NH': {
      name: 'ANA (All Nippon Airways)',
      personalItem: { dimensions: '40 x 30 x 10 cm', weight: '2 piezas total 10kg' },
      carryOn: { dimensions: '55 x 40 x 25 cm', weight: '10 kg (2 piezas)' },
      checked: { dimensions: '158 cm lineales', weight: '23 kg', quantity: '2 maletas gratis' },
      notes: '¡2 maletas gratis en internacional! Tercera maleta: 15,000 JPY'
    },
    'JL': {
      name: 'Japan Airlines (JAL)',
      personalItem: { dimensions: '40 x 30 x 10 cm', weight: 'Incluido en 10kg total' },
      carryOn: { dimensions: '55 x 40 x 25 cm', weight: '10 kg total' },
      checked: { dimensions: '203 cm lineales', weight: '23 kg', quantity: '2 maletas gratis' },
      notes: '¡2 maletas gratis! Exceso: 15,000-30,000 JPY'
    },
    'DEFAULT': {
      name: 'Aerolínea General',
      personalItem: { dimensions: '40 x 30 x 15 cm', weight: 'Varía' },
      carryOn: { dimensions: '55 x 40 x 23 cm', weight: '7-10 kg' },
      checked: { dimensions: '158 cm lineales', weight: '23 kg', quantity: '1 maleta típicamente' },
      notes: 'Consulta las políticas específicas de tu aerolínea'
    }
  },

  async init(tripId) {
    this.currentTripId = tripId;
    this.render();
    
    if (auth.currentUser && tripId) {
      // 🔥 NUEVO: Cargar vuelos del wizard primero
      await this.loadWizardFlights();
      await this.listenToFlights();
    }
  },

  // 🔥 NUEVO: Cargar vuelos del wizard automáticamente
  async loadWizardFlights() {
    try {
      const tripRef = doc(db, 'trips', this.currentTripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) return;
      
      const tripData = tripSnap.data();
      const wizardFlights = tripData.flights || {};
      
      // Verificar si ya tenemos los vuelos del wizard en módulos/flights
      const flightsModuleRef = doc(db, 'trips', this.currentTripId, 'modules', 'flights');
      const flightsModuleSnap = await getDoc(flightsModuleRef);
      
      let existingFlights = [];
      if (flightsModuleSnap.exists()) {
        existingFlights = flightsModuleSnap.data().flights || [];
      }
      
      // Crear array de vuelos del wizard si existen
      const wizardFlightsArray = [];
      
      if (wizardFlights.outbound && wizardFlights.outbound.flightNumber) {
        // Verificar que no exista ya
        const alreadyExists = existingFlights.some(f => 
          f.flightNumber === wizardFlights.outbound.flightNumber && 
          f.type === 'outbound'
        );
        
        if (!alreadyExists) {
          wizardFlightsArray.push({
            type: 'outbound',
            date: wizardFlights.outbound.date || '',
            airline: wizardFlights.outbound.airline || '',
            flightNumber: wizardFlights.outbound.flightNumber || '',
            from: wizardFlights.outbound.from || '',
            to: wizardFlights.outbound.to || '',
            departureTime: '',
            arrivalTime: '',
            duration: '',
            notes: '🎯 Añadido desde el wizard de viaje',
            addedAt: new Date().toISOString(),
            fromWizard: true
          });
        }
      }
      
      if (wizardFlights.return && wizardFlights.return.flightNumber) {
        // Verificar que no exista ya
        const alreadyExists = existingFlights.some(f => 
          f.flightNumber === wizardFlights.return.flightNumber && 
          f.type === 'return'
        );
        
        if (!alreadyExists) {
          wizardFlightsArray.push({
            type: 'return',
            date: wizardFlights.return.date || '',
            airline: wizardFlights.return.airline || '',
            flightNumber: wizardFlights.return.flightNumber || '',
            from: wizardFlights.return.from || '',
            to: wizardFlights.return.to || '',
            departureTime: '',
            arrivalTime: '',
            duration: '',
            notes: '🎯 Añadido desde el wizard de viaje',
            addedAt: new Date().toISOString(),
            fromWizard: true
          });
        }
      }
      
      // Si hay vuelos del wizard que no existen, agregarlos
      if (wizardFlightsArray.length > 0) {
        const combinedFlights = [...existingFlights, ...wizardFlightsArray];
        
        await setDoc(flightsModuleRef, {
          flights: combinedFlights,
          updatedAt: new Date().toISOString()
        });
        
        console.log('✅ Vuelos del wizard cargados automáticamente:', wizardFlightsArray.length);
      }
    } catch (error) {
      console.error('❌ Error cargando vuelos del wizard:', error);
    }
  },

  async listenToFlights() {
    const flightsRef = doc(db, 'trips', this.currentTripId, 'modules', 'flights');
    
    onSnapshot(flightsRef, (docSnap) => {
      if (docSnap.exists()) {
        this.myFlights = docSnap.data().flights || [];
        this.renderMyFlights();
        this.renderBaggageInfoDynamic(); // 🔥 Actualizar equipaje dinámicamente
      }
    });
  },

  render() {
    const container = document.getElementById('content-flights');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-6xl mx-auto p-4 md:p-6">
        <h2 class="text-4xl font-bold mb-6 text-gray-800 dark:text-white">✈️ Gestión de Vuelos</h2>

        <!-- Mis Vuelos Registrados -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div class="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h3 class="text-2xl font-bold dark:text-white flex items-center gap-2">
              🎫 Mis Vuelos
            </h3>
            <button 
              id="addFlightBtn"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              ➕ Agregar Vuelo
            </button>
          </div>
          
          <div id="myFlightsList">
            ${this.renderMyFlightsInitial()}
          </div>
        </div>

        <!-- Formulario de Agregar Vuelo (Hidden) -->
        <div id="addFlightForm" class="hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          ${this.renderAddFlightForm()}
        </div>

        <div class="grid lg:grid-cols-2 gap-6 mb-6">
          <!-- Flight Tracker -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
              📡 Track de Vuelo en Tiempo Real
            </h3>
            <p class="text-sm opacity-90 mb-4">
              Monitorea el estado de cualquier vuelo en tiempo real
            </p>
            
            <div class="space-y-3">
              <input 
                type="text"
                id="trackFlightNumber"
                placeholder="Ej: AM58, UA882"
                class="w-full p-3 rounded-lg text-gray-800 font-semibold"
              >
              <input 
                type="date"
                id="trackFlightDate"
                class="w-full p-3 rounded-lg text-gray-800 font-semibold"
              >
              <button 
                id="trackFlightBtn"
                class="w-full bg-white text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition font-bold"
              >
                🔍 Rastrear Vuelo
              </button>
            </div>

            <div id="flightTrackResult" class="mt-4">
              <!-- Results will appear here -->
            </div>
          </div>

          <!-- Búsqueda de Vuelos Baratos -->
          <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6">
            <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
              💰 Encuentra Vuelos Baratos
            </h3>
            <p class="text-sm opacity-90 mb-4">
              Compara precios en las mejores plataformas
            </p>
            
            <div class="space-y-3">
              ${this.renderFlightSearchLinks()}
            </div>
          </div>
        </div>

        <!-- Información de Equipaje -->
        <div id="baggageInfo" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          ${this.renderBaggageInfo()}
        </div>

        <!-- Tips de Vuelos -->
        ${this.renderFlightTips()}
      </div>
    `;

    this.attachEventListeners();
  },

  renderMyFlightsInitial() {
    if (this.myFlights.length === 0) {
      return `
        <div class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-6xl mb-4">✈️</div>
          <p class="text-lg font-semibold">No hay vuelos registrados</p>
          <p class="text-sm">Agrega tus vuelos para tener toda la información en un solo lugar</p>
        </div>
      `;
    }

    return '<div id="flightsListContainer"></div>';
  },

  renderMyFlights() {
    const container = document.getElementById('flightsListContainer');
    if (!container) {
      // Si el container no existe, actualizar todo el contenido
      const listContainer = document.getElementById('myFlightsList');
      if (listContainer && this.myFlights.length > 0) {
        listContainer.innerHTML = '<div id="flightsListContainer"></div>';
        this.renderMyFlights(); // Llamar recursivamente
      }
      return;
    }

    if (this.myFlights.length === 0) {
      document.getElementById('myFlightsList').innerHTML = this.renderMyFlightsInitial();
      return;
    }

    container.innerHTML = this.myFlights.map((flight, index) => `
      <div class="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-4 border-l-4 border-blue-500">
        <div class="flex justify-between items-start mb-3 flex-wrap gap-2">
          <div class="flex-1">
            <span class="text-xs font-bold text-blue-600 dark:text-blue-400">${flight.type === 'outbound' ? '🛫 IDA' : '🛬 VUELTA'}</span>
            <h4 class="text-lg font-bold dark:text-white">${flight.airline} ${flight.flightNumber}</h4>
            ${flight.date ? `<p class="text-xs text-gray-500 dark:text-gray-400">📅 ${new Date(flight.date).toLocaleDateString('es')}</p>` : ''}
          </div>
          <div class="flex gap-2">
            ${flight.flightNumber ? `
              <button 
                onclick="FlightsHandler.trackFlight('${flight.flightNumber}', '${flight.date || ''}')"
                class="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                📡 Track
              </button>
            ` : ''}
            <button 
              onclick="FlightsHandler.deleteFlight(${index})"
              class="text-red-500 hover:text-red-700 p-2"
              title="Eliminar vuelo"
            >
              🗑️
            </button>
          </div>
        </div>
        
        ${flight.from && flight.to ? `
          <div class="grid grid-cols-3 gap-2 items-center mb-3">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Salida</p>
              <p class="font-bold dark:text-white">${flight.from}</p>
              ${flight.departureTime ? `<p class="text-sm text-gray-600 dark:text-gray-300">${flight.departureTime}</p>` : ''}
            </div>
            <div class="text-center">
              <p class="text-2xl text-gray-400">→</p>
              ${flight.duration ? `<p class="text-xs text-gray-500 dark:text-gray-400">${flight.duration}</p>` : ''}
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 dark:text-gray-400">Llegada</p>
              <p class="font-bold dark:text-white">${flight.to}</p>
              ${flight.arrivalTime ? `<p class="text-sm text-gray-600 dark:text-gray-300">${flight.arrivalTime}</p>` : ''}
            </div>
          </div>
        ` : ''}

        ${flight.notes ? `
          <div class="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
            📝 ${flight.notes}
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  renderAddFlightForm() {
    return `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold dark:text-white">➕ Agregar Vuelo</h3>
        <button 
          id="cancelAddFlight"
          class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕ Cancelar
        </button>
      </div>

      <form id="flightForm">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Vuelo
            </label>
            <select 
              id="flightType"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="outbound">🛫 Ida</option>
              <option value="return">🛬 Vuelta</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Fecha del Vuelo
            </label>
            <input 
              type="date"
              id="flightDate"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Aerolínea
            </label>
            <input 
              type="text"
              id="flightAirline"
              placeholder="Ej: Aeroméxico"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Número de Vuelo
            </label>
            <input 
              type="text"
              id="flightNumber"
              placeholder="Ej: AM58"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Desde (Código)
            </label>
            <input 
              type="text"
              id="flightFrom"
              placeholder="Ej: MTY, MEX"
              maxlength="3"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Hacia (Código)
            </label>
            <input 
              type="text"
              id="flightTo"
              placeholder="Ej: NRT, HND"
              maxlength="3"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Hora de Salida
            </label>
            <input 
              type="time"
              id="flightDepartureTime"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Hora de Llegada
            </label>
            <input 
              type="time"
              id="flightArrivalTime"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Duración (opcional)
            </label>
            <input 
              type="text"
              id="flightDuration"
              placeholder="Ej: 14h 30m"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Notas (opcional)
            </label>
            <textarea 
              id="flightNotes"
              rows="2"
              placeholder="Confirmación #12345, Asiento 24A, etc."
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-4">
          <button 
            type="button"
            id="cancelAddFlightBtn"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            💾 Guardar Vuelo
          </button>
        </div>
      </form>
    `;
  },

  renderFlightSearchLinks() {
    const searchEngines = [
      { name: 'Skyscanner', url: 'https://www.skyscanner.com', icon: '🔍', color: 'bg-blue-500' },
      { name: 'Google Flights', url: 'https://www.google.com/flights', icon: '🛫', color: 'bg-red-500' },
      { name: 'Kayak', url: 'https://www.kayak.com', icon: '🚤', color: 'bg-orange-500' },
      { name: 'Momondo', url: 'https://www.momondo.com', icon: '🌍', color: 'bg-purple-500' }
    ];

    return searchEngines.map(engine => `
      <a 
        href="${engine.url}" 
        target="_blank"
        class="${engine.color} bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg flex items-center justify-between transition border-2 border-white/30"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl">${engine.icon}</span>
          <span class="font-bold">${engine.name}</span>
        </div>
        <span class="text-2xl">→</span>
      </a>
    `).join('');
  },

  renderBaggageInfo() {
    const airlines = this.myFlights.map(f => f.flightNumber.match(/^[A-Z]{2}/)?.[0]).filter(Boolean);
    const uniqueAirlines = [...new Set(airlines)];
    
    if (uniqueAirlines.length === 0) {
      return `
        <h3 class="text-2xl font-bold mb-4 dark:text-white">📦 Información de Equipaje</h3>
        <p class="text-gray-600 dark:text-gray-400">
          Agrega tus vuelos para ver las políticas de equipaje específicas de tu aerolínea.
        </p>
      `;
    }

    return `
      <h3 class="text-2xl font-bold mb-4 dark:text-white">📦 Políticas de Equipaje</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Información específica para ${uniqueAirlines.length > 1 ? 'tus aerolíneas' : 'tu aerolínea'}
      </p>

      <div class="space-y-6">
        ${uniqueAirlines.map(code => {
          const info = this.airlineBaggage[code] || this.airlineBaggage['DEFAULT'];
          return `
            <div class="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <h4 class="text-xl font-bold mb-4 dark:text-white">${info.name}</h4>
              
              <div class="grid md:grid-cols-3 gap-4 mb-4">
                <div class="p-4 bg-white dark:bg-gray-700 rounded-lg">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">👜 OBJETO PERSONAL</p>
                  <p class="text-sm font-bold dark:text-white mb-1">${info.personalItem.dimensions}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-300">${info.personalItem.weight}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Mochila, cartera, laptop
                  </p>
                </div>

                <div class="p-4 bg-white dark:bg-gray-700 rounded-lg">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">🎒 CARRY-ON</p>
                  <p class="text-sm font-bold dark:text-white mb-1">${info.carryOn.dimensions}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-300">${info.carryOn.weight}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Va en compartimento superior
                  </p>
                </div>

                <div class="p-4 bg-white dark:bg-gray-700 rounded-lg">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">💼 MALETA FACTURADA</p>
                  <p class="text-sm font-bold dark:text-white mb-1">${info.checked.dimensions}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-300 mb-1">${info.checked.weight}</p>
                  <p class="text-xs font-semibold text-green-600 dark:text-green-400">${info.checked.quantity}</p>
                </div>
              </div>

              <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p class="text-xs font-semibold text-gray-800 dark:text-white mb-1">💡 Información Adicional:</p>
                <p class="text-xs text-gray-700 dark:text-gray-300">${info.notes}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p class="text-sm font-bold text-gray-800 dark:text-white mb-2">📏 ¿Cómo medir correctamente?</p>
        <ul class="text-xs text-gray-700 dark:text-gray-300 space-y-1">
          <li>• <strong>Dimensiones:</strong> Largo x Ancho x Alto (incluye ruedas y manijas)</li>
          <li>• <strong>Lineales:</strong> Suma de las 3 medidas (ej: 70+50+30 = 150cm)</li>
          <li>• <strong>Peso:</strong> Incluye todo lo que va dentro de la maleta</li>
        </ul>
      </div>
    `;
  },

  // 🔥 NUEVO: Renderizar equipaje dinámicamente cuando cambian los vuelos
  renderBaggageInfoDynamic() {
    const container = document.getElementById('baggageInfo');
    if (container) {
      container.innerHTML = this.renderBaggageInfo();
    }
  },

  renderFlightTips() {
    return `
      <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg p-6 mt-6">
        <h3 class="text-2xl font-bold mb-4">💡 Tips para Vuelos Internacionales</h3>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">⏰ Llega 3 horas antes</p>
            <p class="text-sm opacity-90">Para vuelos internacionales, especialmente si facturas maletas.</p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">📱 Descarga tu boarding pass</p>
            <p class="text-sm opacity-90">Muchas aerolíneas permiten check-in online 24hrs antes.</p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">🎫 Imprime confirmación</p>
            <p class="text-sm opacity-90">Lleva impreso el itinerario por si pierdes batería.</p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">💊 Medicamentos en carry-on</p>
            <p class="text-sm opacity-90">Nunca pongas medicamentos importantes en maleta facturada.</p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">🔋 Power bank < 27,000 mAh</p>
            <p class="text-sm opacity-90">Baterías externas solo en carry-on, máx 100Wh.</p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">🧴 Líquidos 100ml máx</p>
            <p class="text-sm opacity-90">Bolsa transparente de 1L para líquidos en carry-on.</p>
          </div>
        </div>
      </div>
    `;
  },

  attachEventListeners() {
    // Agregar vuelo
    const addBtn = document.getElementById('addFlightBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showAddFlightForm());
    }

    // Cancelar agregar vuelo
    const cancelBtns = document.querySelectorAll('#cancelAddFlight, #cancelAddFlightBtn');
    cancelBtns.forEach(btn => {
      btn.addEventListener('click', () => this.hideAddFlightForm());
    });

    // Submit form
    const form = document.getElementById('flightForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveFlight();
      });
    }

    // Track flight
    const trackBtn = document.getElementById('trackFlightBtn');
    if (trackBtn) {
      trackBtn.addEventListener('click', () => {
        const flightNumber = document.getElementById('trackFlightNumber').value;
        const date = document.getElementById('trackFlightDate').value;
        this.trackFlight(flightNumber, date);
      });
    }
  },

  showAddFlightForm() {
    document.getElementById('addFlightForm').classList.remove('hidden');
    document.getElementById('addFlightForm').scrollIntoView({ behavior: 'smooth' });
  },

  hideAddFlightForm() {
    document.getElementById('addFlightForm').classList.add('hidden');
    document.getElementById('flightForm').reset();
  },

  async saveFlight() {
    const flightData = {
      type: document.getElementById('flightType').value,
      date: document.getElementById('flightDate').value,
      airline: document.getElementById('flightAirline').value,
      flightNumber: document.getElementById('flightNumber').value.toUpperCase(),
      from: document.getElementById('flightFrom').value.toUpperCase(),
      to: document.getElementById('flightTo').value.toUpperCase(),
      departureTime: document.getElementById('flightDepartureTime').value || '',
      arrivalTime: document.getElementById('flightArrivalTime').value || '',
      duration: document.getElementById('flightDuration').value || '',
      notes: document.getElementById('flightNotes').value || '',
      addedAt: new Date().toISOString()
    };

    try {
      this.myFlights.push(flightData);
      
      const flightsRef = doc(db, 'trips', this.currentTripId, 'modules', 'flights');
      await setDoc(flightsRef, {
        flights: this.myFlights,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      Notifications.success('✅ Vuelo guardado correctamente');
      this.hideAddFlightForm();
    } catch (error) {
      console.error('Error guardando vuelo:', error);
      Notifications.error('❌ Error al guardar el vuelo');
    }
  },

  async deleteFlight(index) {
    if (!confirm('¿Eliminar este vuelo?')) return;

    try {
      this.myFlights.splice(index, 1);
      
      const flightsRef = doc(db, 'trips', this.currentTripId, 'modules', 'flights');
      await setDoc(flightsRef, {
        flights: this.myFlights,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      Notifications.success('✅ Vuelo eliminado');
    } catch (error) {
      console.error('Error eliminando vuelo:', error);
      Notifications.error('❌ Error al eliminar');
    }
  },

  async trackFlight(flightNumber, date) {
    if (!flightNumber) {
      Notifications.error('Ingresa un número de vuelo');
      return;
    }

    const resultDiv = document.getElementById('flightTrackResult');
    resultDiv.innerHTML = `
      <div class="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
        <p class="text-sm">🔄 Buscando información...</p>
      </div>
    `;

    try {
      const result = await APIsIntegration.searchFlights(flightNumber, date || null);
      
      if (result.success && result.data.length > 0) {
        const flight = result.data[0];
        
        resultDiv.innerHTML = `
          <div class="p-4 bg-white/20 rounded-lg backdrop-blur-sm">
            <p class="text-xs font-bold mb-2">${flight.airline.name} ${flight.flight.iata}</p>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-xs opacity-80">Salida</p>
                <p class="font-bold">${flight.departure.airport}</p>
                <p class="text-xs">${new Date(flight.departure.scheduled).toLocaleString()}</p>
              </div>
              <div>
                <p class="text-xs opacity-80">Llegada</p>
                <p class="font-bold">${flight.arrival.airport}</p>
                <p class="text-xs">${new Date(flight.arrival.scheduled).toLocaleString()}</p>
              </div>
            </div>
            <div class="mt-3 p-2 ${flight.flight_status === 'scheduled' ? 'bg-green-500/30' : 'bg-yellow-500/30'} rounded">
              <p class="text-xs font-bold">
                Estado: ${flight.flight_status === 'scheduled' ? '✅ Programado' : '⏱️ ' + flight.flight_status}
              </p>
            </div>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `
          <div class="p-4 bg-red-500/20 rounded-lg backdrop-blur-sm border border-red-400/50">
            <p class="text-sm">❌ No se encontró información del vuelo</p>
            <p class="text-xs opacity-80 mt-1">Verifica el número de vuelo y la fecha</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error tracking flight:', error);
      resultDiv.innerHTML = `
        <div class="p-4 bg-red-500/20 rounded-lg backdrop-blur-sm border border-red-400/50">
          <p class="text-sm">❌ Error al rastrear el vuelo</p>
          <p class="text-xs opacity-80 mt-1">${error.message}</p>
        </div>
      `;
    }
  }
};

window.FlightsHandler = FlightsHandler;
export default FlightsHandler;
