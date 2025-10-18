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
  arrayUnion,
  deleteDoc
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

      // 🔥 CAMBIO: Ya NO copiamos plantillas genéricas
      // El itinerario se creará con el wizard inteligente
      Notifications.success(
        `🎉 Viaje "${tripData.name}" creado exitosamente!\n🔗 Código: ${shareCode}`,
        6000
      );
      
      console.log('✅ Viaje creado:', tripId, 'Código:', shareCode);
      
      // 🔥 IMPORTANTE: Esperar un poco para que Firebase propague
      setTimeout(() => {
        this.selectTrip(tripId);
      }, 500);
      
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
        if (window.FlightsHandler && window.FlightsHandler.init) {
          window.FlightsHandler.init(tripId);
        }
        if (window.HotelsHandler && window.HotelsHandler.init) {
          window.HotelsHandler.init(tripId);
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
              <div class="flex items-center gap-2">
                ${this.currentTrip && this.currentTrip.id === trip.id ? '<span class="text-blue-500 text-2xl">✓</span>' : ''}
                <button onclick="event.stopPropagation(); TripsManager.deleteTrip('${trip.id}')" class="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition" title="Eliminar Viaje">
                    <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"></path></svg>
                </button>
              </div>
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
      
      // Mostrar selección de tipo por defecto
      document.getElementById('tripTypeSelection').classList.remove('hidden');
      document.getElementById('simpleTripForm').classList.add('hidden');
    }
  },

  // Mostrar formulario simple
  showSimpleTripForm() {
    document.getElementById('tripTypeSelection').classList.add('hidden');
    document.getElementById('simpleTripForm').classList.remove('hidden');
    
    // Setup del formulario simple
    setTimeout(() => {
      const simpleForm = document.getElementById('createTripFormSimple');
      if (simpleForm) {
        simpleForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = {
            name: document.getElementById('simpleTripName').value,
            destination: 'Japón',
            dateStart: document.getElementById('simpleTripDateStart').value,
            dateEnd: document.getElementById('simpleTripDateEnd').value,
            useTemplate: false // Viaje simple NO usa plantilla
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
          this.closeCreateTripModal();
        });
      }
    }, 100);
  },

  // Mostrar wizard completo (llama al ItineraryBuilder)
  showFullTripWizard() {
    // Cerrar modal de crear viaje
    this.closeCreateTripModal();

    // Esperar un momento y abrir el wizard completo
    setTimeout(() => {
      if (window.ItineraryBuilder && window.ItineraryBuilder.showCreateItineraryWizard) {
        // 🔥 NUEVO: Pasar flag para que el wizard sepa que debe crear el trip
        window.ItineraryBuilder.showCreateItineraryWizard(true);
      } else {
        console.error('ItineraryBuilder no está disponible');
        Notifications.error('Error: El wizard de itinerario no está disponible');
      }
    }, 300);
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

    // Leer el radio button seleccionado
    const templateOption = document.querySelector('input[name="templateOption"]:checked')?.value;
    const useTemplate = templateOption === 'template15'; // Solo usar plantilla si seleccionaron template15

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

  // Actualizar header con info del trip actual (NUEVO DISEÑO CON ESTADÍSTICAS)
  updateTripHeader() {
    const headerContainer = document.getElementById('currentTripHeader');
    if (!headerContainer || !this.currentTrip) return;

    const startDate = new Date(this.currentTrip.info.dateStart);
    const endDate = new Date(this.currentTrip.info.dateEnd);
    const today = new Date();
    const daysUntil = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Calcular días pasados si el viaje ya comenzó
    const daysElapsed = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    const tripProgress = daysUntil <= 0 ? Math.min(100, (daysElapsed / totalDays) * 100) : 0;

    const collaborationStatus = this.currentTrip.members.length > 1
        ? `🤝 Viaje colaborativo • 🔗 ${this.currentTrip.info.shareCode}`
        : '👤 Viaje individual';

    headerContainer.innerHTML = `
      <div class="space-y-4">
        <!-- Fila 1: Título y acciones -->
        <div class="flex justify-between items-center w-full flex-wrap gap-4">
          <!-- Título principal y detalles del viaje -->
          <div class="flex-1">
              <h2 class="text-2xl md:text-3xl font-bold text-white animate__animated animate__fadeInDown">${this.currentTrip.info.name}</h2>
              <div class="flex items-center gap-4 text-white/80 text-xs mt-2 flex-wrap">
                  <span>📅 ${startDate.toLocaleDateString('es', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span class="hidden md:inline">|</span>
                  <span>${collaborationStatus}</span>
              </div>
          </div>

          <!-- Acciones y Countdown -->
          <div class="flex items-center gap-3 flex-wrap">
              <div class="text-right hidden sm:block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div class="text-2xl font-bold text-white">${daysUntil > 0 ? `${daysUntil}` : tripProgress < 100 ? `Día ${daysElapsed}` : '✅'}</div>
                  <div class="text-xs text-white/70">${daysUntil > 0 ? `días restantes` : tripProgress < 100 ? 'en progreso' : 'Completado'}</div>
              </div>
              <button
                onclick="TripsManager.showTripsListModal()"
                class="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition backdrop-blur-sm hover-lift"
              >
                Mis Viajes
              </button>
              <button
                onclick="TripsManager.showCreateTripModal()"
                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition backdrop-blur-sm flex items-center gap-2 hover-lift"
              >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                  <span class="hidden md:inline">Agregar Viaje</span>
              </button>
               <button
                onclick="TripsManager.showShareCode()"
                class="bg-green-500/90 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition backdrop-blur-sm flex items-center gap-2 hover-lift"
                title="Compartir código del viaje"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 4a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V4z"></path></svg>
                <span class="hidden md:inline">Compartir</span>
              </button>
              <button
                onclick="TripsManager.inviteMemberByEmail()"
                class="bg-purple-500/90 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition backdrop-blur-sm flex items-center gap-2 hover-lift"
                title="Invitar por email"
              >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                  <span class="hidden md:inline">Invitar</span>
              </button>
          </div>
        </div>

        <!-- Fila 2: Dashboard de Estadísticas Visuales -->
        <div id="tripStatsDashboard" class="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <!-- Loading placeholder -->
          <div class="col-span-full text-center text-white/60 text-sm py-2">
            <i class="fas fa-spinner animate-spin mr-2"></i>Cargando estadísticas...
          </div>
        </div>
      </div>
    `;

    // Cargar estadísticas de forma asíncrona
    this.loadTripStatistics();
  },

  // 🔥 NUEVO: Cargar y mostrar estadísticas del viaje
  async loadTripStatistics() {
    if (!this.currentTrip) return;

    const statsContainer = document.getElementById('tripStatsDashboard');
    if (!statsContainer) return;

    try {
      // Obtener datos de itinerario
      const itineraryRef = doc(db, `trips/${this.currentTrip.id}/data`, 'itinerary');
      const itinerarySnap = await getDoc(itineraryRef);
      const itineraryData = itinerarySnap.exists() ? itinerarySnap.data() : null;

      // Contar actividades totales
      const totalActivities = itineraryData?.days?.reduce((sum, day) => sum + (day.activities?.length || 0), 0) || 0;

      // Contar actividades completadas (si existe ese campo)
      const completedActivities = itineraryData?.days?.reduce((sum, day) => {
        return sum + (day.activities?.filter(a => a.completed)?.length || 0);
      }, 0) || 0;

      const activityProgress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

      // Obtener gastos totales
      const expenses = this.currentTrip.expenses || [];
      const totalBudget = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

      // Calcular presupuesto estimado (ejemplo: ¥15000 por día por persona)
      const startDate = new Date(this.currentTrip.info.dateStart);
      const endDate = new Date(this.currentTrip.info.dateEnd);
      const tripDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const estimatedBudget = tripDays * 15000 * this.currentTrip.members.length;
      const budgetProgress = estimatedBudget > 0 ? (totalBudget / estimatedBudget) * 100 : 0;

      // Información de vuelos
      const hasOutboundFlight = this.currentTrip.flights?.outbound?.flightNumber;
      const hasReturnFlight = this.currentTrip.flights?.return?.flightNumber;
      const flightsBooked = (hasOutboundFlight ? 1 : 0) + (hasReturnFlight ? 1 : 0);

      // Información de alojamientos
      const accommodationsCount = this.currentTrip.accommodations?.length || 0;

      // Calcular progreso del viaje (días)
      const today = new Date();
      const daysUntil = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
      const totalDays = tripDays;
      const tripProgress = daysUntil <= 0 ? Math.min(100, (daysElapsed / totalDays) * 100) : 0;

      // Renderizar cards de estadísticas
      statsContainer.innerHTML = `
        <!-- Card 1: Progreso del Viaje -->
        <div class="stat-card bg-gradient-to-br from-blue-500/90 to-cyan-500/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover-lift">
          <div class="flex items-center justify-between mb-2">
            <div class="text-white/90 text-sm font-semibold">Progreso del Viaje</div>
            <div class="text-2xl">🗓️</div>
          </div>
          <div class="text-3xl font-bold text-white mb-2">${totalDays} días</div>
          <div class="text-white/80 text-xs mb-3">
            ${daysUntil > 0 ? `Comienza en ${daysUntil} días` : tripProgress < 100 ? `Día ${daysElapsed} de ${totalDays}` : 'Viaje completado'}
          </div>
          <div class="w-full bg-white/20 rounded-full h-2">
            <div class="bg-white h-2 rounded-full transition-all duration-500" style="width: ${tripProgress}%"></div>
          </div>
        </div>

        <!-- Card 2: Actividades del Itinerario -->
        <div class="stat-card bg-gradient-to-br from-purple-500/90 to-pink-500/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover-lift">
          <div class="flex items-center justify-between mb-2">
            <div class="text-white/90 text-sm font-semibold">Actividades</div>
            <div class="text-2xl">📍</div>
          </div>
          <div class="text-3xl font-bold text-white mb-2">${totalActivities}</div>
          <div class="text-white/80 text-xs mb-3">
            ${completedActivities > 0 ? `${completedActivities} completadas` : 'Planificadas'}
          </div>
          <div class="w-full bg-white/20 rounded-full h-2">
            <div class="bg-white h-2 rounded-full transition-all duration-500" style="width: ${activityProgress}%"></div>
          </div>
        </div>

        <!-- Card 3: Presupuesto -->
        <div class="stat-card bg-gradient-to-br from-green-500/90 to-emerald-500/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover-lift">
          <div class="flex items-center justify-between mb-2">
            <div class="text-white/90 text-sm font-semibold">Presupuesto</div>
            <div class="text-2xl">💰</div>
          </div>
          <div class="text-3xl font-bold text-white mb-2">¥${totalBudget.toLocaleString()}</div>
          <div class="text-white/80 text-xs mb-3">
            ${budgetProgress > 0 ? `${budgetProgress.toFixed(0)}% del estimado` : 'Sin gastos registrados'}
          </div>
          <div class="w-full bg-white/20 rounded-full h-2">
            <div class="bg-white h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, budgetProgress)}%"></div>
          </div>
        </div>

        <!-- Card 4: Reservas -->
        <div class="stat-card bg-gradient-to-br from-orange-500/90 to-red-500/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover-lift">
          <div class="flex items-center justify-between mb-2">
            <div class="text-white/90 text-sm font-semibold">Reservas</div>
            <div class="text-2xl">✈️</div>
          </div>
          <div class="flex gap-4 items-center mb-2">
            <div>
              <div class="text-2xl font-bold text-white">${flightsBooked}/2</div>
              <div class="text-white/80 text-xs">Vuelos</div>
            </div>
            <div class="w-px h-10 bg-white/30"></div>
            <div>
              <div class="text-2xl font-bold text-white">${accommodationsCount}</div>
              <div class="text-white/80 text-xs">Hoteles</div>
            </div>
          </div>
          <div class="text-white/80 text-xs">
            ${flightsBooked === 2 && accommodationsCount > 0 ? '✅ Todo listo' : '⚠️ Pendiente'}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      statsContainer.innerHTML = `
        <div class="col-span-full text-center text-white/60 text-sm py-2">
          ⚠️ No se pudieron cargar las estadísticas
        </div>
      `;
    }
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

  // NUEVO: Eliminar un viaje
  async deleteTrip(tripId) {
    const tripToDelete = this.userTrips.find(t => t.id === tripId);
    if (!tripToDelete) {
      Notifications.error('No se encontró el viaje a eliminar.');
      return;
    }

    // Doble confirmación
    if (!confirm(`¿Estás seguro de que quieres eliminar el viaje "${tripToDelete.info.name}"?`)) {
      return;
    }
    if (!confirm(`Esta acción es PERMANENTE y no se puede deshacer. Se borrarán todos los datos asociados (itinerario, gastos, etc.).\n\n¿REALMENTE quieres continuar?`)) {
      return;
    }

    try {
      // Eliminar sub-colecciones (importante para una limpieza completa)
      await deleteDoc(doc(db, `trips/${tripId}/data`, 'itinerary'));
      await deleteDoc(doc(db, `trips/${tripId}/data`, 'notes'));
      await deleteDoc(doc(db, `trips/${tripId}/activities`, 'checklist'));

      // Eliminar el documento principal del viaje
      await deleteDoc(doc(db, 'trips', tripId));

      Notifications.success(`Viaje "${tripToDelete.info.name}" eliminado.`);

      // Si el viaje eliminado era el actual, limpiar el estado
      if (this.currentTrip && this.currentTrip.id === tripId) {
        this.currentTrip = null;
        localStorage.removeItem('currentTripId');

        // Si quedan más viajes, selecciona el primero. Si no, muestra el estado vacío.
        if (this.userTrips.length > 0) {
          this.selectTrip(this.userTrips[0].id);
        } else {
          this.updateTripHeaderEmpty();
        }
      }
    } catch (error) {
      console.error('❌ Error eliminando el viaje:', error);
      Notifications.error('Ocurrió un error al eliminar el viaje.');
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

try {
  if (typeof auth !== 'undefined' && auth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        TripsManager.initUserTrips();
      }
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        try { TripsManager.initUserTrips(); } catch (e) { console.warn('TripsManager init deferred failed:', e); }
      });
    } else {
      try { TripsManager.initUserTrips(); } catch (e) { console.warn('TripsManager init immediate failed:', e); }
    }
  }
} catch (e) {
  console.warn('Error setting up auth listener for TripsManager:', e);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try { TripsManager.initUserTrips(); } catch (err) { console.warn('TripsManager fallback failed:', err); }
    });
  } else {
    try { TripsManager.initUserTrips(); } catch (err) { console.warn('TripsManager fallback immediate failed:', err); }
  }
}
