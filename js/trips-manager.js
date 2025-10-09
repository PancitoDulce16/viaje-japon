// js/trips-manager.js - Sistema de Gestión de Viajes Compartidos

import { db, auth } from './firebase-config.js';
import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const TripsManager = {
  currentTrip: null,
  userTrips: [],
  unsubscribe: null,

  // Inicializar trips del usuario
  async initUserTrips() {
    if (!auth.currentUser) {
      console.log('⚠️ Usuario no autenticado');
      return;
    }

    const userId = auth.currentUser.uid;
    
    // Query trips donde el usuario es miembro
    const tripsRef = collection(db, 'trips');
    const q = query(tripsRef, where('members', 'array-contains', userId));

    // Listener en tiempo real
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.userTrips = [];
      snapshot.forEach((doc) => {
        this.userTrips.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ Trips cargados:', this.userTrips.length);
      this.renderTripsList();

      // Si no hay trip seleccionado, seleccionar el primero
      if (!this.currentTrip && this.userTrips.length > 0) {
        this.selectTrip(this.userTrips[0].id);
      }
    });
  },

  // Crear nuevo viaje
  async createTrip(tripData) {
    if (!auth.currentUser) {
      alert('⚠️ Debes iniciar sesión para crear un viaje');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newTrip = {
        info: {
          name: tripData.name,
          destination: tripData.destination || 'Japón',
          dateStart: tripData.dateStart,
          dateEnd: tripData.dateEnd,
          createdBy: userId,
          createdAt: new Date().toISOString()
        },
        members: [userId],
        flights: {
          outbound: tripData.outboundFlight || null,
          return: tripData.returnFlight || null
        },
        accommodations: tripData.accommodations || [],
        cities: tripData.cities || [],
        activities: {
          checklist: {}
        },
        expenses: []
      };

      await setDoc(doc(db, 'trips', tripId), newTrip);
      
      console.log('✅ Viaje creado:', tripId);
      alert('✅ ¡Viaje creado exitosamente!');
      
      // Seleccionar el nuevo viaje
      this.selectTrip(tripId);
      
      return tripId;
    } catch (error) {
      console.error('❌ Error creando viaje:', error);
      alert('Error al crear viaje. Intenta de nuevo.');
      throw error;
    }
  },

  // Seleccionar trip actual
  async selectTrip(tripId) {
    try {
      const tripRef = doc(db, 'trips', tripId);
      const tripSnap = await getDoc(tripRef);

      if (tripSnap.exists()) {
        this.currentTrip = {
          id: tripId,
          ...tripSnap.data()
        };

        // Guardar en localStorage
        localStorage.setItem('currentTripId', tripId);

        console.log('✅ Trip seleccionado:', this.currentTrip.info.name);
        
        // Actualizar UI
        this.updateTripHeader();
        
        // 🔥 RE-INICIALIZAR todos los módulos para el nuevo trip
        if (window.ItineraryHandler && window.ItineraryHandler.reinitialize) {
          window.ItineraryHandler.reinitialize();
        }
        if (window.BudgetTracker && window.BudgetTracker.reinitialize) {
          window.BudgetTracker.reinitialize();
        }
        
        // Cerrar modal si está abierto
        this.closeTripsListModal();
        
        console.log('🔄 Módulos re-inicializados para el trip:', tripId);
      }
    } catch (error) {
      console.error('❌ Error seleccionando trip:', error);
    }
  },

  // Invitar miembro al viaje
  async inviteMember(tripId, memberEmail) {
    try {
      // Aquí implementaremos la búsqueda por email
      // Por ahora, asumimos que tienes el userId
      alert('🚧 Función de invitar en desarrollo. Por ahora, comparte el Trip ID: ' + tripId);
    } catch (error) {
      console.error('❌ Error invitando miembro:', error);
    }
  },

  // Actualizar info del viaje
  async updateTripInfo(tripId, updates) {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, updates);
      console.log('✅ Trip actualizado');
    } catch (error) {
      console.error('❌ Error actualizando trip:', error);
    }
  },

  // Renderizar lista de viajes
  renderTripsList() {
    const container = document.getElementById('tripsListContainer');
    if (!container) return;

    if (this.userTrips.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400 mb-4">No tienes viajes creados</p>
          <button 
            onclick="TripsManager.showCreateTripModal()" 
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            ➕ Crear Primer Viaje
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-3">
        ${this.userTrips.map(trip => `
          <div 
            class="p-4 bg-white dark:bg-gray-700 rounded-lg border-2 ${
              this.currentTrip && this.currentTrip.id === trip.id 
                ? 'border-blue-500' 
                : 'border-gray-200 dark:border-gray-600'
            } hover:shadow-lg transition cursor-pointer"
            onclick="TripsManager.selectTrip('${trip.id}')"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-bold text-lg dark:text-white">${trip.info.name}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  ${new Date(trip.info.dateStart).toLocaleDateString('es')} - 
                  ${new Date(trip.info.dateEnd).toLocaleDateString('es')}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  👥 ${trip.members.length} miembro${trip.members.length > 1 ? 's' : ''}
                </p>
              </div>
              ${this.currentTrip && this.currentTrip.id === trip.id ? '<span class="text-blue-500 text-2xl">✓</span>' : ''}
            </div>
          </div>
        `).join('')}
        
        <button 
          onclick="TripsManager.showCreateTripModal()" 
          class="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <span class="text-gray-600 dark:text-gray-400 font-semibold">➕ Crear Nuevo Viaje</span>
        </button>
      </div>
    `;
  },

  // Mostrar modal para crear viaje
  showCreateTripModal() {
    const modal = document.getElementById('modal-create-trip');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  // Cerrar modal de crear viaje
  closeCreateTripModal() {
    const modal = document.getElementById('modal-create-trip');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      
      // Limpiar formulario
      const form = document.getElementById('createTripForm');
      if (form) form.reset();
    }
  },

  // Manejar formulario de crear viaje
  async handleCreateTripForm(e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById('tripName').value,
      destination: document.getElementById('tripDestination').value || 'Japón',
      dateStart: document.getElementById('tripDateStart').value,
      dateEnd: document.getElementById('tripDateEnd').value,
      outboundFlight: {
        flightNumber: document.getElementById('outboundFlightNumber').value,
        airline: document.getElementById('outboundAirline').value,
        date: document.getElementById('outboundDate').value,
        from: document.getElementById('outboundFrom').value,
        to: document.getElementById('outboundTo').value
      },
      returnFlight: {
        flightNumber: document.getElementById('returnFlightNumber').value,
        airline: document.getElementById('returnAirline').value,
        date: document.getElementById('returnDate').value,
        from: document.getElementById('returnFrom').value,
        to: document.getElementById('returnTo').value
      },
      accommodations: []
    };

    // Validaciones básicas
    if (!formData.name || !formData.dateStart || !formData.dateEnd) {
      alert('⚠️ Por favor completa los campos obligatorios (Nombre y Fechas)');
      return;
    }

    // Validar que fecha de fin sea después de inicio
    if (new Date(formData.dateEnd) <= new Date(formData.dateStart)) {
      alert('⚠️ La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    await this.createTrip(formData);
    this.closeCreateTripModal();
  },

  // Actualizar header con info del trip actual
  updateTripHeader() {
    const headerContainer = document.getElementById('currentTripHeader');
    if (!headerContainer || !this.currentTrip) return;

    const startDate = new Date(this.currentTrip.info.dateStart);
    const endDate = new Date(this.currentTrip.info.dateEnd);
    const daysUntil = Math.ceil((startDate - new Date()) / (1000 * 60 * 60 * 24));

    headerContainer.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <h2 class="text-xl font-bold text-white">${this.currentTrip.info.name}</h2>
          <p class="text-sm text-white/80">
            ${startDate.toLocaleDateString('es')} - ${endDate.toLocaleDateString('es')}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-white/80">
            ${daysUntil > 0 ? `Faltan ${daysUntil} días` : daysUntil === 0 ? '¡HOY!' : 'En curso'}
          </p>
          <button 
            onclick="TripsManager.showTripsListModal()"
            class="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition"
          >
            Cambiar viaje
          </button>
        </div>
      </div>
    `;
  },

  // Mostrar modal de lista de viajes
  showTripsListModal() {
    const modal = document.getElementById('modal-trips-list');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.renderTripsList();
    }
  },

  // Cerrar modal de lista de viajes
  closeTripsListModal() {
    const modal = document.getElementById('modal-trips-list');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // Cleanup
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
};

// Exponer globalmente
window.TripsManager = TripsManager;

// Inicializar cuando auth cambia
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
  if (user) {
    TripsManager.initUserTrips();
  }
});
