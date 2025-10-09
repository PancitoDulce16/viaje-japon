// js/trips-manager.js - Sistema de Gestión de Viajes Compartidos (MEJORADO)

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
      } else if (!this.currentTrip && this.userTrips.length === 0) {
        // Si no hay trips, mostrar mensaje de bienvenida
        console.log('⚠️ No hay trips, mostrar modal de crear trip');
        this.updateTripHeaderEmpty();
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
      
      // 🔥 NUEVO: Copiar plantilla de itinerario
      await this.copyItineraryTemplate(tripId);
      
      console.log('✅ Viaje creado:', tripId);
      alert('✅ ¡Viaje creado exitosamente!\n\nSe ha copiado una plantilla de itinerario de 15 días que puedes personalizar.');
      
      // Seleccionar el nuevo viaje
      this.selectTrip(tripId);
      
      return tripId;
    } catch (error) {
      console.error('❌ Error creando viaje:', error);
      alert('Error al crear viaje. Intenta de nuevo.');
      throw error;
    }
  },

  // 🔥 NUEVO: Copiar plantilla de itinerario al trip
  async copyItineraryTemplate(tripId) {
    try {
      // Importar la plantilla
      const { ITINERARY_DATA } = await import('./itinerary-data.js');
      
      // Guardar cada día del itinerario en Firestore
      const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
      
      await setDoc(itineraryRef, {
        days: ITINERARY_DATA,
        lastUpdated: new Date().toISOString(),
        isTemplate: true
      });
      
      console.log('✅ Plantilla de itinerario copiada al trip:', tripId);
    } catch (error) {
      console.error('❌ Error copiando plantilla de itinerario:', error);
      // No lanzar error, el trip se creó exitosamente
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
        if (window.PreparationHandler && window.PreparationHandler.reinitialize) {
          window.PreparationHandler.reinitialize();
        }
        if (window.AppCore && window.AppCore.reinitialize) {
          window.AppCore.reinitialize();
        }
        
        // Cerrar modal si está abierto
        this.closeTripsListModal();
        
        console.log('🔄 Todos los módulos re-inicializados para el trip:', tripId);
      }
    } catch (error) {
      console.error('❌ Error seleccionando trip:', error);
    }
  },

  // 🔥 NUEVO: Invitar miembro al viaje (MVP)
  async inviteMember() {
    if (!this.currentTrip) {
      alert('⚠️ Debes seleccionar un viaje primero');
      return;
    }

    const userIdToInvite = prompt('🔗 Para invitar a alguien, necesitas su User ID.\n\nPide a tu hermano que vaya a la consola del navegador (F12) y escriba:\n\nauth.currentUser.uid\n\nLuego ingresa ese User ID aquí:');
    
    if (!userIdToInvite || userIdToInvite.trim() === '') {
      return;
    }

    try {
      const tripRef = doc(db, 'trips', this.currentTrip.id);
      
      // Verificar si el usuario ya es miembro
      if (this.currentTrip.members.includes(userIdToInvite.trim())) {
        alert('⚠️ Este usuario ya es miembro del viaje');
        return;
      }

      await updateDoc(tripRef, {
        members: arrayUnion(userIdToInvite.trim())
      });

      alert('✅ ¡Miembro invitado exitosamente!\n\nAhora podrán ver y editar este viaje juntos.');
      console.log('✅ Miembro agregado al trip:', userIdToInvite);
    } catch (error) {
      console.error('❌ Error invitando miembro:', error);
      alert('Error al invitar. Verifica que el User ID sea correcto.');
    }
  },

  // 🔥 NUEVO: Copiar Trip ID para compartir
  copyTripId() {
    if (!this.currentTrip) {
      alert('⚠️ Debes seleccionar un viaje primero');
      return;
    }

    const tripId = this.currentTrip.id;
    
    // Copiar al portapapeles
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tripId).then(() => {
        alert(`✅ Trip ID copiado al portapapeles:\n\n${tripId}\n\nComparte este ID con tu hermano para que pueda unirse.`);
      }).catch(() => {
        // Fallback si clipboard no funciona
        prompt('📋 Copia este Trip ID:', tripId);
      });
    } else {
      // Fallback para navegadores antiguos
      prompt('📋 Copia este Trip ID:', tripId);
    }
  },

  // 🔥 NUEVO: Unirse a un trip existente
  async joinTrip() {
    const tripId = prompt('🔗 Ingresa el Trip ID que te compartieron:');
    
    if (!tripId || tripId.trim() === '') {
      return;
    }

    try {
      const tripRef = doc(db, 'trips', tripId.trim());
      const tripSnap = await getDoc(tripRef);

      if (!tripSnap.exists()) {
        alert('⚠️ No se encontró ningún viaje con ese ID. Verifica que esté correcto.');
        return;
      }

      const userId = auth.currentUser.uid;
      const tripData = tripSnap.data();

      // Verificar si ya es miembro
      if (tripData.members.includes(userId)) {
        alert('✅ Ya eres miembro de este viaje. Seleccionándolo...');
        this.selectTrip(tripId.trim());
        return;
      }

      // Agregar como miembro
      await updateDoc(tripRef, {
        members: arrayUnion(userId)
      });

      alert('✅ ¡Te has unido al viaje exitosamente!');
      this.selectTrip(tripId.trim());
      console.log('✅ Usuario se unió al trip:', tripId);
    } catch (error) {
      console.error('❌ Error uniéndose al trip:', error);
      alert('Error al unirse al viaje. Intenta de nuevo.');
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
          <button 
            onclick="TripsManager.joinTrip()" 
            class="mt-3 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold block w-full"
          >
            🔗 Unirse a un Viaje
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
              <div class="flex-1">
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

        <button 
          onclick="TripsManager.joinTrip()" 
          class="w-full p-4 border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition"
        >
          <span class="text-green-600 dark:text-green-400 font-semibold">🔗 Unirse a un Viaje</span>
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
          <p class="text-xs text-white/60">
            ${this.currentTrip.members.length > 1 ? '🤝 Viaje colaborativo' : '👤 Viaje individual'}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-white/80">
            ${daysUntil > 0 ? `Faltan ${daysUntil} días` : daysUntil === 0 ? '¡HOY!' : 'En curso'}
          </p>
          <div class="flex gap-2 mt-2">
            <button 
              onclick="TripsManager.showTripsListModal()"
              class="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition"
            >
              Cambiar viaje
            </button>
            ${this.currentTrip.members.length === 1 ? `
              <button 
                onclick="TripsManager.inviteMember()"
                class="text-xs bg-green-500/80 hover:bg-green-500 px-3 py-1 rounded transition"
                title="Invitar a alguien a este viaje"
              >
                + Invitar
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  // 🔥 NUEVO: Header cuando no hay trip seleccionado
  updateTripHeaderEmpty() {
    const headerContainer = document.getElementById('currentTripHeader');
    if (!headerContainer) return;

    headerContainer.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <h2 class="text-xl font-bold text-white">👋 ¡Bienvenido!</h2>
          <p class="text-sm text-white/80">
            Crea tu primer viaje o únete a uno existente
          </p>
        </div>
        <div class="flex gap-2">
          <button 
            onclick="TripsManager.showCreateTripModal()"
            class="text-xs bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition font-semibold"
          >
            ➕ Crear Viaje
          </button>
          <button 
            onclick="TripsManager.joinTrip()"
            class="text-xs bg-green-500/80 hover:bg-green-500 px-4 py-2 rounded transition font-semibold"
          >
            🔗 Unirse
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
