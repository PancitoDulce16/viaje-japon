// js/trips-manager.js - Sistema de Gestión de Viajes con Invitación Mejorada

import { db, auth } from './firebase-config.js';
import { Notifications } from './notifications.js';
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
          updatedAt: new Date().toISOString(),
          shareCode: shareCode,
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
        Notifications.success(
          `🎉 Viaje "${tripData.name}" creado con plantilla de itinerario!\n🔗 Código: ${shareCode}`,
          6000
        );
      } else {
        Notifications.success(
          `🎉 Viaje "${tripData.name}" creado exitosamente!\n🔗 Código: ${shareCode}`,
          6000
        );
      }
      
      console.log('✅ Viaje creado:', tripId, 'Código:', shareCode);
      
      this.selectTrip(tripId);
      
      return tripId;
    } catch (error) {
      console.error('❌ Error creando viaje:', error);
      Notifications.error('Error al crear el viaje. Inténtalo de nuevo.');
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
        
        // Actualizar updatedAt
        await updateDoc(tripRef, {
          'info.updatedAt': new Date().toISOString()
        });

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

      Notifications.info(
        `📧 Comparte el código con ${email}:\n${this.currentTrip.info.shareCode}`,
        6000
      );
      
      console.log('✅ Email agregado a invitaciones pendientes:', email);
    } catch (error) {
      console.error('❌ Error invitando por email:', error);
      Notifications.error('Error al enviar invitación. Inténtalo de nuevo.');
    }
  },

  // 🔥 NUEVO: Mostrar código para compartir
  async showShareCode() {
    if (!this.currentTrip) {
      alert('⚠️ Debes seleccionar un viaje primero');
      return;
    }

    let shareCode = this.currentTrip.info?.shareCode;
    
    // Si no existe shareCode, generarlo y guardarlo
    if (!shareCode) {
      console.log('⚠️ No hay shareCode, generando uno nuevo...');
      shareCode = this.generateTripCode();
      
      try {
        const tripRef = doc(db, 'trips', this.currentTrip.id);
        await updateDoc(tripRef, {
          'info.shareCode': shareCode
        });
        
        // Actualizar localmente
        if (!this.currentTrip.info) this.currentTrip.info = {};
        this.currentTrip.info.shareCode = shareCode;
        
        console.log('✅ ShareCode generado y guardado:', shareCode);
      } catch (error) {
        console.error('❌ Error guardando shareCode:', error);
        alert('Error al generar código. Intenta de nuevo.');
        return;
      }
    }

    const tripName = this.currentTrip.info?.name || 'Viaje';
    
    // Crear modal personalizado
    const modalHtml = `
      <div id="shareCodeModal" class="modal active" style="z-index: 9999;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
          <div class="text-center">
            <div class="text-6xl mb-4">🔗</div>
            <h2 class="text-2xl font-bold dark:text-white mb-2">Código del viaje</h2>
            <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 mb-4">
              <p class="text-4xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">${shareCode}</p>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <strong>Viaje:</strong> ${tripName}
            </p>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 text-left">
              <p class="text-sm font-semibold dark:text-white mb-2">👉 Para unirse:</p>
              <ol class="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                <li>Abre la app</li>
                <li>Click en "Unirse a un Viaje"</li>
                <li>Ingresa este código: <strong>${shareCode}</strong></li>
              </ol>
            </div>
            <button 
              onclick="TripsManager.copyShareCode('${shareCode}')"
              class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold mb-2"
            >
              📋 Copiar Código
            </button>
            <button 
              onclick="TripsManager.closeShareCodeModal()"
              class="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Agregar modal al DOM
    const existingModal = document.getElementById('shareCodeModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden';
  },

  // Copiar código al portapapeles
  copyShareCode(code) {
    // Método alternativo más compatible
    const textArea = document.createElement('textarea');
    textArea.value = code;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      textArea.remove();
      
      if (successful) {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ ¡Copiado!';
        btn.classList.add('bg-green-600', 'hover:bg-green-700');
        btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('bg-green-600', 'hover:bg-green-700');
          btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }, 2000);
      } else {
        alert('Copia este código manualmente: ' + code);
      }
    } catch (err) {
      textArea.remove();
      alert('Copia este código manualmente: ' + code);
    }
  },

  // Cerrar modal de compartir
  closeShareCodeModal() {
    const modal = document.getElementById('shareCodeModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
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
        Notifications.warning('No se encontró ningún viaje con ese código.');
        return;
      }

      const tripDoc = querySnapshot.docs[0];
      const tripId = tripDoc.id;
      const tripData = tripDoc.data();
      const userId = auth.currentUser.uid;
      const userEmail = auth.currentUser.email;

      // Verificar si ya es miembro
      if (tripData.members.includes(userId)) {
        Notifications.info('Ya eres miembro de este viaje.');
        this.selectTrip(tripId);
        return;
      }

      // Agregar como miembro
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        members: arrayUnion(userId),
        memberEmails: arrayUnion(userEmail)
      });

      Notifications.success(`🎉 Te uniste a "${tripData.info.name}"!`);
      this.selectTrip(tripId);
      console.log('✅ Usuario se unió al trip:', tripId);
    } catch (error) {
      console.error('❌ Error uniéndose al trip:', error);
      Notifications.error('Error al unirse al viaje. Inténtalo de nuevo.');
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
        ${this.userTrips.map(trip => {
          const updatedDate = trip.info.updatedAt ? new Date(trip.info.updatedAt).toLocaleDateString('es', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : '';
          
          return `
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
                ${updatedDate ? `
                  <p class="text-xs text-gray-400 dark:text-gray-600 mt-1">
                    📅 Última actualización: ${updatedDate}
                  </p>
                ` : ''}
              </div>
              ${this.currentTrip && this.currentTrip.id === trip.id ? '<span class="text-blue-500 text-2xl">✓</span>' : ''}
            </div>
          </div>
        `}).join('')}
        
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
    // 🔥 ARREGLO: Cerrar el modal de lista de viajes si está abierto
    this.closeTripsListModal();
    
    const modal = document.getElementById('modal-create-trip');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  // 🆕 NUEVO: Mostrar formulario simple
  showSimpleTripForm() {
    // Cerrar modal actual
    this.closeCreateTripModal();
    
    // Crear formulario simple
    const formHtml = `
      <div id="simpleTripFormModal" class="modal active" style="z-index: 10000;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold dark:text-white">📋 Crear Viaje Simple</h2>
              <button onclick="TripsManager.closeSimpleTripForm()" class="text-3xl hover:text-red-600 transition">&times;</button>
            </div>

            <form id="simpleTripForm" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre del Viaje *</label>
                <input 
                  id="simpleTripName" 
                  type="text" 
                  required
                  class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ej: Viaje a Japón 2025"
                >
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fecha Inicio *</label>
                  <input 
                    id="simpleTripDateStart" 
                    type="date" 
                    required
                    class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fecha Fin *</label>
                  <input 
                    id="simpleTripDateEnd" 
                    type="date" 
                    required
                    class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                </div>
              </div>

              <div class="flex gap-3 mt-6">
                <button 
                  type="button"
                  onclick="TripsManager.closeSimpleTripForm()"
                  class="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  ✨ Crear Viaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHtml);
    
    // Setup form handler
    document.getElementById('simpleTripForm').addEventListener('submit', (e) => {
      this.handleSimpleTripForm(e);
    });
  },

  closeSimpleTripForm() {
    const modal = document.getElementById('simpleTripFormModal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  },

  async handleSimpleTripForm(e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById('simpleTripName').value,
      destination: 'Japón',
      dateStart: document.getElementById('simpleTripDateStart').value,
      dateEnd: document.getElementById('simpleTripDateEnd').value,
      useTemplate: false
    };

    if (!formData.name || !formData.dateStart || !formData.dateEnd) {
      alert('⚠️ Por favor completa todos los campos');
      return;
    }

    if (new Date(formData.dateEnd) <= new Date(formData.dateStart)) {
      alert('⚠️ La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    await this.createTrip(formData);
    this.closeSimpleTripForm();
  },

  // 🆕 NUEVO: Mostrar wizard completo
  showFullTripWizard() {
    // Cerrar modal actual
    this.closeCreateTripModal();
    
    // Llamar al wizard del ItineraryBuilder
    if (window.ItineraryBuilder) {
      window.ItineraryBuilder.showCreateItineraryWizard();
    } else {
      Notifications.error('El sistema de itinerarios no está disponible');
    }
  },

  // Cerrar modal de crear viaje
  closeCreateTripModal() {
    const modal = document.getElementById('modal-create-trip');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
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
