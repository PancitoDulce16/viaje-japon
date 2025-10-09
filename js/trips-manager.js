// js/trips-manager.js - Sistema de Gestión de Viajes con Invitación Mejorada

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

  // Generar código único de 6 caracteres
  generateTripCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres confusos
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  // Inicializar trips del usuario
  async initUserTrips() {
    if (!auth.currentUser) {
      console.log('⚠️ Usuario no autenticado');
      return;
    }

    const userId = auth.currentUser.uid;
    
    const tripsRef = collection(db, 'trips');
    const q = query(tripsRef, where('members', 'array-contains', userId));

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

      if (!this.currentTrip && this.userTrips.length > 0) {
        this.selectTrip(this.userTrips[0].id);
      } else if (!this.currentTrip && this.userTrips.length === 0) {
        console.log('⚠️ No hay trips, mostrar mensaje de bienvenida');
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
      const shareCode = this.generateTripCode();

      const newTrip = {
        info: {
          name: tripData.name,
          destination: tripData.destination || 'Japón',
          dateStart: tripData.dateStart,
          dateEnd: tripData.dateEnd,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          shareCode: shareCode, // Código compartible
          creatorEmail: auth.currentUser.email
        },
        members: [userId],
        memberEmails: [auth.currentUser.email],
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
      
      // 🔥 NUEVO: Solo copiar plantilla SI el usuario lo pidió
      if (tripData.useTemplate) {
        await this.copyItineraryTemplate(tripId);
        alert(`✅ ¡Viaje creado exitosamente!\n\n📋 Se incluyó la plantilla de itinerario de 15 días.\n\n🔗 Código para compartir: ${shareCode}\n\nComparte este código con tu hermano para que se una al viaje.`);
      } else {
        alert(`✅ ¡Viaje creado exitosamente!\n\n🔗 Código para compartir: ${shareCode}\n\nComparte este código con tu hermano para que se una al viaje.`);
      }
      
      console.log('✅ Viaje creado:', tripId, 'Código:', shareCode);
      
      this.selectTrip(tripId);
      
      return tripId;
    } catch (error) {
      console.error('❌ Error creando viaje:', error);
      alert('Error al crear viaje. Intenta de nuevo.');
      throw error;
    }
  },

  // Copiar plantilla de itinerario (OPCIONAL)
  async copyItineraryTemplate(tripId) {
    try {
      const { ITINERARY_DATA } = await import('./itinerary-data.js');
      
      const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
      
      await setDoc(itineraryRef, {
        days: ITINERARY_DATA,
        lastUpdated: new Date().toISOString(),
        isTemplate: true
      });
      
      console.log('✅ Plantilla de itinerario copiada al trip:', tripId);
    } catch (error) {
      console.error('❌ Error copiando plantilla de itinerario:', error);
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

        localStorage.setItem('currentTripId', tripId);

        console.log('✅ Trip seleccionado:', this.currentTrip.info.name);
        
        this.updateTripHeader();
        
        // Re-inicializar módulos
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
        
        this.closeTripsListModal();
        
        console.log('🔄 Todos los módulos re-inicializados para el trip:', tripId);
      }
    } catch (error) {
      console.error('❌ Error seleccionando trip:', error);
    }
  },

  // 🔥 NUEVO: Invitar por Email
  async inviteMemberByEmail() {
    if (!this.currentTrip) {
      alert('⚠️ Debes seleccionar un viaje primero');
      return;
    }

    const email = prompt('📧 Ingresa el email de la persona que quieres invitar:');
    
    if (!email || email.trim() === '') {
      return;
    }

    try {
      // Buscar usuario por email (esto requeriría una Cloud Function)
      // Por ahora, solo agregamos el email a la lista de invitados pendientes
      
      const tripRef = doc(db, 'trips', this.currentTrip.id);
      
      await updateDoc(tripRef, {
        pendingInvites: arrayUnion(email.trim().toLowerCase())
      });

      alert(`✅ Invitación enviada a ${email}\n\n⚠️ Nota: Por ahora, comparte con ellos el código del viaje:\n\n🔗 ${this.currentTrip.info.shareCode}\n\nEllos pueden ingresar este código al hacer click en "Unirse a un Viaje"`);
      
      console.log('✅ Email agregado a invitaciones pendientes:', email);
    } catch (error) {
      console.error('❌ Error invitando por email:', error);
      alert('Error al enviar invitación. Intenta de nuevo.');
    }
  },

  // 🔥 NUEVO: Mostrar código para compartir
  showShareCode() {
    if (!this.currentTrip) {
      alert('⚠️ Debes seleccionar un viaje primero');
      return;
    }

    const shareCode = this.currentTrip.info.shareCode;
    const tripName = this.currentTrip.info.name;
    
    const message = `🔗 Código del viaje: ${shareCode}\n\n📝 Viaje: ${tripName}\n\n👉 Para unirse:\n1. Abre la app\n2. Click en "Unirse a un Viaje"\n3. Ingresa este código: ${shareCode}`;
    
    // Copiar al portapapeles
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareCode).then(() => {
        alert(`${message}\n\n✅ Código copiado al portapapeles!`);
      }).catch(() => {
        alert(message);
      });
    } else {
      alert(message);
    }
  },

  // 🔥 NUEVO: Unirse con código
  async joinTripWithCode() {
    const code = prompt('🔗 Ingresa el código de 6 dígitos del viaje:');
    
    if (!code || code.trim() === '') {
      return;
    }

    try {
      // Buscar trip por shareCode
      const tripsRef = collection(db, 'trips');
      const q = query(tripsRef, where('info.shareCode', '==', code.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('⚠️ No se encontró ningún viaje con ese código.\n\nVerifica que el código sea correcto (6 caracteres).');
        return;
      }

      const tripDoc = querySnapshot.docs[0];
      const tripId = tripDoc.id;
      const tripData = tripDoc.data();
      const userId = auth.currentUser.uid;
      const userEmail = auth.currentUser.email;

      // Verificar si ya es miembro
      if (tripData.members.includes(userId)) {
        alert('✅ Ya eres miembro de este viaje. Seleccionándolo...');
        this.selectTrip(tripId);
        return;
      }

      // Agregar como miembro
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        members: arrayUnion(userId),
        memberEmails: arrayUnion(userEmail)
      });

      alert(`✅ ¡Te has unido al viaje exitosamente!\n\n📝 ${tripData.info.name}`);
      this.selectTrip(tripId);
      console.log('✅ Usuario se unió al trip:', tripId);
    } catch (error) {
      console.error('❌ Error uniéndose al trip:', error);
      alert('Error al unirse al viaje. Intenta de nuevo.');
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
            onclick="TripsManager.joinTripWithCode()" 
            class="mt-3 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold block w-full"
          >
            🔗 Unirse con Código
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
                  ${trip.info.shareCode ? `• 🔗 ${trip.info.shareCode}` : ''}
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
          onclick="TripsManager.joinTripWithCode()" 
          class="w-full p-4 border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition"
        >
          <span class="text-green-600 dark:text-green-400 font-semibold">🔗 Unirse con Código</span>
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
      
      const form = document.getElementById('createTripForm');
      if (form) form.reset();
    }
  },

  // Manejar formulario de crear viaje
  async handleCreateTripForm(e) {
    e.preventDefault();

    const useTemplate = document.getElementById('useItineraryTemplate').checked;

    const formData = {
      name: document.getElementById('tripName').value,
      destination: document.getElementById('tripDestination').value || 'Japón',
      dateStart: document.getElementById('tripDateStart').value,
      dateEnd: document.getElementById('tripDateEnd').value,
      useTemplate: useTemplate, // 🔥 NUEVO: Solo usar plantilla si está marcado
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

    if (!formData.name || !formData.dateStart || !formData.dateEnd) {
      alert('⚠️ Por favor completa los campos obligatorios (Nombre y Fechas)');
      return;
    }

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
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex-1 min-w-[250px]">
          <h2 class="text-xl font-bold text-white">${this.currentTrip.info.name}</h2>
          <p class="text-sm text-white/80">
            ${startDate.toLocaleDateString('es')} - ${endDate.toLocaleDateString('es')}
          </p>
          <p class="text-xs text-white/60">
            ${this.currentTrip.members.length > 1 ? '🤝 Viaje colaborativo' : '👤 Viaje individual'}
            ${this.currentTrip.info.shareCode ? ` • 🔗 ${this.currentTrip.info.shareCode}` : ''}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-white/80">
            ${daysUntil > 0 ? `Faltan ${daysUntil} días` : daysUntil === 0 ? '¡HOY!' : 'En curso'}
          </p>
          <div class="flex gap-2 mt-2 flex-wrap">
            <button 
              onclick="TripsManager.showTripsListModal()"
              class="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition"
            >
              Cambiar viaje
            </button>
            <button 
              onclick="TripsManager.showShareCode()"
              class="text-xs bg-green-500/80 hover:bg-green-500 px-3 py-1 rounded transition"
              title="Compartir código del viaje"
            >
              🔗 Compartir
            </button>
            <button 
              onclick="TripsManager.inviteMemberByEmail()"
              class="text-xs bg-blue-500/80 hover:bg-blue-500 px-3 py-1 rounded transition"
              title="Invitar por email"
            >
              📧 Invitar
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // Header cuando no hay trip seleccionado
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
            onclick="TripsManager.joinTripWithCode()"
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

window.TripsManager = TripsManager;

import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
  if (user) {
    TripsManager.initUserTrips();
  }
});
