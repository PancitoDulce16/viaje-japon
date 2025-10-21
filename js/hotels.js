// js/hotels.js - Gestión completa de hoteles
import { db, auth } from '/js/firebase-config.js';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { APIsIntegration } from './apis-integration.js';
import { Notifications } from './notifications.js';

export const HotelsHandler = {
  currentTripId: null,
  myHotels: [],
  recommendations: [],
  
  // Ciudades de Japón con códigos
  japanCities: {
    'TYO': { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    'KYO': { name: 'Kyoto', lat: 35.0116, lng: 135.7681 },
    'OSA': { name: 'Osaka', lat: 34.6937, lng: 135.5023 },
    'NAG': { name: 'Nagoya', lat: 35.1815, lng: 136.9066 },
    'FUK': { name: 'Fukuoka', lat: 33.5904, lng: 130.4017 },
    'SPK': { name: 'Sapporo', lat: 43.0642, lng: 141.3469 },
    'HKD': { name: 'Hakone', lat: 35.2324, lng: 139.1069 },
    'HIR': { name: 'Hiroshima', lat: 34.3853, lng: 132.4553 }
  },

  init(tripId) {
    this.currentTripId = tripId;
    this.render();
    
    if (auth.currentUser && tripId) {
      this.listenToHotels();
    }
  },

  async listenToHotels() {
    const hotelsRef = doc(db, 'trips', this.currentTripId, 'modules', 'hotels');
    
    onSnapshot(hotelsRef, (docSnap) => {
      if (docSnap.exists()) {
        this.myHotels = docSnap.data().hotels || [];
        this.renderMyHotels();
      }
    });
  },

  render() {
    const container = document.getElementById('content-hotels');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-6xl mx-auto p-4 md:p-6">
        <h2 class="text-4xl font-bold mb-6 text-gray-800 dark:text-white">🏨 Gestión de Hoteles</h2>

        <!-- Mis Reservas -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-bold dark:text-white flex items-center gap-2">
              🛏️ Mis Reservas
            </h3>
            <button 
              id="addHotelBtn"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              ➕ Agregar Hotel
            </button>
          </div>
          
          <div id="myHotelsList">
            ${this.renderMyHotelsInitial()}
          </div>
        </div>

        <!-- Formulario de Agregar Hotel (Hidden) -->
        <div id="addHotelForm" class="hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          ${this.renderAddHotelForm()}
        </div>

        <!-- Buscar Hoteles - Disabled (API key invalid) -->
        <div class="bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl shadow-lg p-6 mb-6 relative overflow-hidden">
          <div class="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
            ⚠️ No disponible
          </div>
          <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 opacity-60">
            🔍 Buscar Hoteles Disponibles
          </h3>
          <p class="text-sm opacity-70 mb-4">
            La API de búsqueda de hoteles requiere una clave válida
          </p>

          <div class="opacity-50 pointer-events-none">
            ${this.renderHotelSearchForm()}
          </div>

          <div class="mt-4 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
            <p class="text-sm">
              💡 <strong>Tip:</strong> Usa la sección "Mis Reservas" arriba para agregar manualmente tus hoteles, o visita las plataformas de reserva abajo para buscar y comparar precios.
            </p>
          </div>
        </div>

        <!-- Plataformas de Reserva -->
        ${this.renderBookingPlatforms()}

        <!-- Tips de Hoteles -->
        ${this.renderHotelTips()}
      </div>
    `;

    this.attachEventListeners();
  },

  renderMyHotelsInitial() {
    if (this.myHotels.length === 0) {
      return `
        <div class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-6xl mb-4">🏨</div>
          <p class="text-lg font-semibold">No hay hoteles registrados</p>
          <p class="text-sm">Agrega tus reservas para tener toda la información organizada</p>
        </div>
      `;
    }

    return '<div id="hotelsListContainer"></div>';
  },

  renderMyHotels() {
    const container = document.getElementById('hotelsListContainer');
    if (!container) return;

    if (this.myHotels.length === 0) {
      document.getElementById('myHotelsList').innerHTML = this.renderMyHotelsInitial();
      return;
    }

    container.innerHTML = this.myHotels.map((hotel, index) => `
      <div class="p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg mb-4 border-l-4 border-purple-500">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h4 class="text-lg font-bold dark:text-white">${hotel.name}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">📍 ${hotel.city}</p>
          </div>
          <div class="flex gap-2">
            ${hotel.bookingUrl ? `
              <a 
                href="${hotel.bookingUrl}" 
                target="_blank"
                class="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                🔗 Ver
              </a>
            ` : ''}
            <button 
              onclick="HotelsHandler.deleteHotel(${index})"
              class="text-red-500 hover:text-red-700"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div class="grid md:grid-cols-2 gap-4 mb-3">
          <div class="p-3 bg-white dark:bg-gray-700 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-in</p>
            <p class="font-semibold dark:text-white">${new Date(hotel.checkIn).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          </div>
          <div class="p-3 bg-white dark:bg-gray-700 rounded-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-out</p>
            <p class="font-semibold dark:text-white">${new Date(hotel.checkOut).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          </div>
        </div>

        ${hotel.price ? `
          <div class="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <p class="text-sm font-semibold text-green-700 dark:text-green-400">
              💰 ${hotel.price} ${hotel.currency || 'USD'}
              ${hotel.nights ? ` (${hotel.nights} noches)` : ''}
            </p>
          </div>
        ` : ''}

        ${hotel.address ? `
          <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">
            📧 ${hotel.address}
          </p>
        ` : ''}

        ${hotel.confirmationCode ? `
          <div class="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <p class="text-xs font-semibold text-gray-800 dark:text-white">
              🎫 Confirmación: ${hotel.confirmationCode}
            </p>
          </div>
        ` : ''}

        ${hotel.notes ? `
          <div class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
            📝 ${hotel.notes}
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  renderAddHotelForm() {
    return `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold dark:text-white">➕ Agregar Reserva de Hotel</h3>
        <button 
          id="cancelAddHotel"
          class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕ Cancelar
        </button>
      </div>

      <form id="hotelForm">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Hotel *
            </label>
            <input 
              type="text"
              id="hotelName"
              placeholder="Ej: APA Hotel Shinjuku"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Ciudad *
            </label>
            <select 
              id="hotelCity"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Selecciona ciudad</option>
              ${Object.entries(this.japanCities).map(([code, city]) => `
                <option value="${city.name}">${city.name}</option>
              `).join('')}
              <option value="Otra">Otra ciudad</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Check-in *
            </label>
            <input 
              type="date"
              id="hotelCheckIn"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Check-out *
            </label>
            <input 
              type="date"
              id="hotelCheckOut"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Precio Total (opcional)
            </label>
            <input 
              type="number"
              id="hotelPrice"
              placeholder="15000"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Moneda
            </label>
            <select 
              id="hotelCurrency"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="JPY">JPY (Yen)</option>
              <option value="USD" selected>USD (Dólares)</option>
              <option value="MXN">MXN (Pesos)</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Dirección (opcional)
            </label>
            <input 
              type="text"
              id="hotelAddress"
              placeholder="3-10-3 Shinjuku, Tokyo"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Código de Confirmación (opcional)
            </label>
            <input 
              type="text"
              id="hotelConfirmation"
              placeholder="ABC123456"
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              URL de Reserva (opcional)
            </label>
            <input 
              type="url"
              id="hotelUrl"
              placeholder="https://booking.com/..."
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Notas (opcional)
            </label>
            <textarea 
              id="hotelNotes"
              rows="2"
              placeholder="Desayuno incluido, cerca del metro, etc."
              class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-4">
          <button 
            type="button"
            id="cancelAddHotelBtn"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            💾 Guardar Hotel
          </button>
        </div>
      </form>
    `;
  },

  renderHotelSearchForm() {
    return `
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2 opacity-90">
            Ciudad
          </label>
          <select 
            id="searchCity"
            class="w-full p-3 border-2 border-white/30 rounded-lg bg-white/20 font-semibold backdrop-blur-sm text-gray-900"
          >
            <option value="" class="text-gray-900 bg-white">Selecciona ciudad</option>
            ${Object.entries(this.japanCities).map(([code, city]) => `
              <option value="${code}" class="text-gray-900 bg-white">${city.name}</option>
            `).join('')}
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2 opacity-90">
            Huéspedes
          </label>
          <input 
            type="number"
            id="searchGuests"
            value="2"
            min="1"
            max="10"
            class="w-full p-3 border-2 border-white/30 rounded-lg bg-white/20 font-semibold backdrop-blur-sm text-gray-900"
          >
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2 opacity-90">
            Check-in
          </label>
          <input 
            type="date"
            id="searchCheckIn"
            class="w-full p-3 border-2 border-white/30 rounded-lg bg-white/20 font-semibold backdrop-blur-sm text-gray-900"
          >
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2 opacity-90">
            Check-out
          </label>
          <input 
            type="date"
            id="searchCheckOut"
            class="w-full p-3 border-2 border-white/30 rounded-lg bg-white/20 font-semibold backdrop-blur-sm text-gray-900"
          >
        </div>

        <div class="md:col-span-2">
          <button 
            id="searchHotelsBtn"
            class="w-full bg-white text-purple-600 py-3 rounded-lg hover:bg-purple-50 transition font-bold text-lg"
          >
            🔍 Buscar Hoteles Disponibles
          </button>
        </div>
      </div>

      <div id="searchLoading" class="hidden mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm text-center">
        <p class="font-semibold">🔄 Buscando hoteles...</p>
        <p class="text-sm opacity-80 mt-1">Esto puede tomar unos segundos</p>
      </div>
    `;
  },

  renderEmptyRecommendations() {
    return `
      <div class="text-center py-8 text-gray-500 dark:text-gray-400">
        <div class="text-5xl mb-3">🏨</div>
        <p class="font-semibold">Sin recomendaciones aún</p>
        <p class="text-sm">Usa el buscador arriba para ver hoteles disponibles</p>
      </div>
    `;
  },

  renderRecommendations() {
    const container = document.getElementById('recommendationsList');
    if (!container) return;

    if (this.recommendations.length === 0) {
      container.innerHTML = this.renderEmptyRecommendations();
      return;
    }

    container.innerHTML = `
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${this.recommendations.map(hotel => `
          <div class="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-bold dark:text-white text-sm">${hotel.name}</h4>
              <span class="text-yellow-500 text-xs">⭐ ${hotel.rating || 'N/A'}</span>
            </div>
            
            <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
              📍 ${hotel.address || 'Dirección no disponible'}
            </p>

            ${hotel.price ? `
              <div class="mb-3 p-2 bg-green-100 dark:bg-green-900/30 rounded">
                <p class="text-sm font-bold text-green-700 dark:text-green-400">
                  💰 ${hotel.price} ${hotel.currency || 'USD'}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  ${hotel.nights ? `${hotel.nights} noches` : 'Precio total'}
                </p>
              </div>
            ` : ''}

            ${hotel.amenities && hotel.amenities.length > 0 ? `
              <div class="mb-3">
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Amenidades:</p>
                <div class="flex flex-wrap gap-1">
                  ${hotel.amenities.slice(0, 3).map(amenity => `
                    <span class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                      ${amenity}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <button 
              onclick="HotelsHandler.addRecommendationToMyHotels(${this.recommendations.indexOf(hotel)})"
              class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-semibold transition"
            >
              ➕ Agregar a Mis Hoteles
            </button>
          </div>
        `).join('')}
      </div>

      <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p class="text-sm text-gray-700 dark:text-gray-300">
          💡 <strong>Tip:</strong> Los precios son aproximados. Visita las plataformas de reserva para ver precios actuales y ofertas.
        </p>
      </div>
    `;
  },

  renderBookingPlatforms() {
    const platforms = [
      { name: 'Booking.com', url: 'https://www.booking.com', icon: '🏨', color: 'from-blue-500 to-blue-600' },
      { name: 'Agoda', url: 'https://www.agoda.com', icon: '🌏', color: 'from-red-500 to-pink-600' },
      { name: 'Hotels.com', url: 'https://www.hotels.com', icon: '🛏️', color: 'from-purple-500 to-indigo-600' },
      { name: 'Expedia', url: 'https://www.expedia.com', icon: '✈️', color: 'from-yellow-500 to-orange-600' },
      { name: 'Airbnb', url: 'https://www.airbnb.com', icon: '🏠', color: 'from-pink-500 to-red-600' }
    ];

    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h3 class="text-2xl font-bold mb-4 dark:text-white">🔗 Plataformas de Reserva</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Compara precios en diferentes plataformas para encontrar las mejores ofertas
        </p>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${platforms.map(platform => `
            <a 
              href="${platform.url}" 
              target="_blank"
              class="p-4 bg-gradient-to-r ${platform.color} text-white rounded-lg hover:shadow-lg transition transform hover:scale-105"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">${platform.icon}</span>
                  <span class="font-bold">${platform.name}</span>
                </div>
                <span class="text-xl">→</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderHotelTips() {
    return `
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
        <h3 class="text-2xl font-bold mb-4">💡 Tips para Hoteles en Japón</h3>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">🏨 Tipos de Alojamiento</p>
            <p class="text-sm opacity-90">Business hotels (básicos), Ryokan (tradicional), Capsule hotels (económicos), APA/Toyoko Inn (cadenas).</p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">🕐 Check-in/out</p>
            <p class="text-sm opacity-90">Check-in típicamente 15:00-16:00. Check-out 10:00-11:00. ¡Sé puntual!</p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">👞 Sin zapatos</p>
            <p class="text-sm opacity-90">En Ryokan y algunos hoteles, dejas zapatos en entrada. Usan pantuflas internas.</p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">🛁 Onsen privado</p>
            <p class="text-sm opacity-90">Muchos hoteles tienen baños onsen. Dúchate ANTES de entrar al onsen.</p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">📦 Envía tu maleta</p>
            <p class="text-sm opacity-90">Usa Takkyubin (¥2000-3000) para enviar maletas entre hoteles. ¡Muy cómodo!</p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p class="font-bold mb-2">🗣️ Inglés limitado</p>
            <p class="text-sm opacity-90">Muchos hoteles tienen poco inglés. Usa Google Translate o tarjetas con frases.</p>
          </div>
        </div>
      </div>
    `;
  },

  attachEventListeners() {
    // Agregar hotel
    const addBtn = document.getElementById('addHotelBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showAddHotelForm());
    }

    // Cancelar
    const cancelBtns = document.querySelectorAll('#cancelAddHotel, #cancelAddHotelBtn');
    cancelBtns.forEach(btn => {
      btn.addEventListener('click', () => this.hideAddHotelForm());
    });

    // Submit form
    const form = document.getElementById('hotelForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveHotel();
      });
    }

    // Search hotels
    const searchBtn = document.getElementById('searchHotelsBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.searchHotels());
    }
  },

  showAddHotelForm() {
    document.getElementById('addHotelForm').classList.remove('hidden');
    document.getElementById('addHotelForm').scrollIntoView({ behavior: 'smooth' });
  },

  hideAddHotelForm() {
    document.getElementById('addHotelForm').classList.add('hidden');
    document.getElementById('hotelForm').reset();
  },

  async saveHotel() {
    const checkIn = document.getElementById('hotelCheckIn').value;
    const checkOut = document.getElementById('hotelCheckOut').value;
    
    // Calculate nights
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

    const hotelData = {
      name: document.getElementById('hotelName').value,
      city: document.getElementById('hotelCity').value,
      checkIn,
      checkOut,
      nights,
      price: document.getElementById('hotelPrice').value || '',
      currency: document.getElementById('hotelCurrency').value,
      address: document.getElementById('hotelAddress').value || '',
      confirmationCode: document.getElementById('hotelConfirmation').value || '',
      bookingUrl: document.getElementById('hotelUrl').value || '',
      notes: document.getElementById('hotelNotes').value || '',
      addedAt: new Date().toISOString()
    };

    try {
      this.myHotels.push(hotelData);
      
      const hotelsRef = doc(db, 'trips', this.currentTripId, 'modules', 'hotels');
      await setDoc(hotelsRef, {
        hotels: this.myHotels,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      Notifications.success('✅ Hotel guardado correctamente');
      this.hideAddHotelForm();
    } catch (error) {
      console.error('Error guardando hotel:', error);
      Notifications.error('❌ Error al guardar el hotel');
    }
  },

  async deleteHotel(index) {
    if (!confirm('¿Eliminar esta reserva?')) return;

    try {
      this.myHotels.splice(index, 1);
      
      const hotelsRef = doc(db, 'trips', this.currentTripId, 'modules', 'hotels');
      await setDoc(hotelsRef, {
        hotels: this.myHotels,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      Notifications.success('✅ Hotel eliminado');
    } catch (error) {
      console.error('Error eliminando hotel:', error);
      Notifications.error('❌ Error al eliminar');
    }
  },

  async searchHotels() {
    const cityCode = document.getElementById('searchCity').value;
    const checkIn = document.getElementById('searchCheckIn').value;
    const checkOut = document.getElementById('searchCheckOut').value;
    const guests = parseInt(document.getElementById('searchGuests').value);

    if (!cityCode || !checkIn || !checkOut) {
      Notifications.error('⚠️ Completa todos los campos');
      return;
    }

    const loadingDiv = document.getElementById('searchLoading');
    const recommendationsDiv = document.getElementById('recommendationsList');

    loadingDiv.classList.remove('hidden');
    recommendationsDiv.innerHTML = '';

    try {
      console.log('🔍 Buscando hoteles:', { cityCode, checkIn, checkOut, guests });
      console.log('🔑 API Keys disponibles:', window.API_KEYS ? 'Sí' : 'No');
      console.log('🔑 LiteAPI configurada:', window.API_KEYS?.liteAPI?.apiKey ? 'Sí' : 'No');

      // Verificar que la API está configurada
      if (!window.API_KEYS || !window.API_KEYS.liteAPI || !window.API_KEYS.liteAPI.apiKey) {
        throw new Error('La API de hoteles no está configurada. Por favor contacta al administrador.');
      }

      const result = await APIsIntegration.searchHotels(cityCode, checkIn, checkOut, guests);

      console.log('📊 Resultado de búsqueda:', result);

      if (result.success && result.hotels && result.hotels.length > 0) {
        // Process and store recommendations
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

        this.recommendations = result.hotels.slice(0, 9).map(hotel => ({
          name: hotel.hotelName || hotel.name || 'Hotel',
          address: hotel.address || 'Dirección no disponible',
          price: hotel.rate?.totalAmount || null,
          currency: hotel.rate?.currency || 'USD',
          rating: hotel.starRating || null,
          nights: nights,
          amenities: hotel.amenities || [],
          city: this.japanCities[cityCode].name
        }));

        this.renderRecommendations();
        Notifications.success(`✅ ${result.hotels.length} hoteles encontrados`);
      } else {
        const errorMessage = result.message || result.error || 'No se encontraron hoteles disponibles';
        recommendationsDiv.innerHTML = `
          <div class="text-center py-8 text-gray-500 dark:text-gray-400">
            <div class="text-5xl mb-3">😕</div>
            <p class="font-semibold">No se encontraron hoteles</p>
            <p class="text-sm">${errorMessage}</p>
            <p class="text-xs mt-4 text-gray-400">Intenta con otras fechas o ciudad</p>
          </div>
        `;
        Notifications.error('❌ ' + errorMessage);
      }
    } catch (error) {
      console.error('❌ Error buscando hoteles:', error);

      let userMessage = error.message;
      let technicalDetails = '';

      // Mensajes más claros según el tipo de error
      if (error.message.includes('API de hoteles no está configurada')) {
        technicalDetails = 'Las claves de API no están disponibles en este entorno.';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        userMessage = 'Error de autenticación con la API de hoteles';
        technicalDetails = 'La clave API es inválida o ha expirado.';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        userMessage = 'Acceso denegado a la API de hoteles';
        technicalDetails = 'La API key no tiene permisos suficientes.';
      } else if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        userMessage = 'Límite de búsquedas excedido';
        technicalDetails = 'Has realizado demasiadas búsquedas. Intenta en unos minutos.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        userMessage = 'Error de conexión';
        technicalDetails = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }

      recommendationsDiv.innerHTML = `
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          <div class="text-5xl mb-3">⚠️</div>
          <p class="font-semibold text-lg mb-2">${userMessage}</p>
          <p class="text-sm mb-4">${technicalDetails}</p>
          <details class="mt-4 text-left max-w-md mx-auto">
            <summary class="cursor-pointer text-xs text-gray-400 hover:text-gray-600">Detalles técnicos</summary>
            <pre class="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto">${error.stack || error.message}</pre>
          </details>
        </div>
      `;
      Notifications.error('❌ ' + userMessage);
    } finally {
      loadingDiv.classList.add('hidden');
    }
  },

  addRecommendationToMyHotels(index) {
    const hotel = this.recommendations[index];
    if (!hotel) return;

    // Pre-fill the form with recommendation data
    this.showAddHotelForm();
    
    setTimeout(() => {
      document.getElementById('hotelName').value = hotel.name;
      document.getElementById('hotelCity').value = hotel.city;
      document.getElementById('hotelAddress').value = hotel.address;
      if (hotel.price) {
        document.getElementById('hotelPrice').value = hotel.price;
        document.getElementById('hotelCurrency').value = hotel.currency;
      }
    }, 100);

    Notifications.success('✅ Datos pre-cargados. Completa fechas y guarda.');
  }
};

window.HotelsHandler = HotelsHandler;
export default HotelsHandler;
