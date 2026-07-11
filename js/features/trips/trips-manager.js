// js/trips-manager.js - Sistema de Gestión de Viajes con Invitación Mejorada

import { db, auth } from '../../core/firebase-config.js';
import { Notifications } from '../../core/notifications.js';
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
} from 'firebase/firestore';

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

    console.log('🔍 DEBUG TripsManager - Inicializando listener de trips para userId:', userId);

    // 🔧 FIX: Limpiar listener previo si existe (evitar duplicados)
    if (this.unsubscribe) {
      console.warn('⚠️ Limpiando listener previo antes de crear uno nuevo');
      this.unsubscribe();
      this.unsubscribe = null;
    }

    // 🛡️ PROTECCIÓN: Restaurar currentTripId desde backup si se perdió
    const currentTripId = localStorage.getItem('currentTripId');
    const backupTripId = sessionStorage.getItem('backup_currentTripId');

    if (!currentTripId && backupTripId) {
      console.log('🔄 Restaurando currentTripId desde backup sessionStorage:', backupTripId);
      localStorage.setItem('currentTripId', backupTripId);
    }

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
        // 🔥 FIX: Intentar cargar el trip guardado con múltiples fallbacks
        let savedTripId = localStorage.getItem('currentTripId');

        // 🛡️ FALLBACK 1: Si no hay en localStorage, buscar en sessionStorage
        if (!savedTripId) {
          savedTripId = sessionStorage.getItem('backup_currentTripId');
          if (savedTripId) {
            console.log('🔄 Restaurando desde sessionStorage backup:', savedTripId);
            localStorage.setItem('currentTripId', savedTripId);
          }
        }

        if (savedTripId) {
          const savedTrip = this.userTrips.find(t => t.id === savedTripId);

          if (savedTrip) {
            console.log('✅ Restaurando trip guardado:', savedTripId);
            this.selectTrip(savedTripId);
          } else {
            console.warn('⚠️ Trip guardado no encontrado en trips del usuario');
            // 🛡️ FALLBACK 2: Seleccionar el más reciente (último modificado)
            const mostRecent = this.userTrips.sort((a, b) =>
              new Date(b.info?.lastModified || 0) - new Date(a.info?.lastModified || 0)
            )[0];
            console.log('🔄 Seleccionando trip más reciente:', mostRecent.id);
            this.selectTrip(mostRecent.id);
          }
        } else {
          console.log('ℹ️ No hay trip guardado, seleccionando el más reciente');
          // 🛡️ FALLBACK 3: Seleccionar el más reciente
          const mostRecent = this.userTrips.sort((a, b) =>
            new Date(b.info?.lastModified || 0) - new Date(a.info?.lastModified || 0)
          )[0];
          this.selectTrip(mostRecent.id);
        }
      } else if (!this.currentTrip && this.userTrips.length === 0) {
        console.log('⚠️ No hay trips, mostrar mensaje de bienvenida');
        this.updateTripHeaderEmpty();
      }
    }, (error) => {
      console.error('❌ ERROR en TripsManager onSnapshot - Full details:', {
        code: error.code,
        message: error.message,
        userId: userId,
        query: 'trips where members array-contains userId'
      });

      // 🔧 FIX: Limpiar listener en caso de error para evitar memory leak
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }

      // Mostrar mensaje al usuario
      this.userTrips = [];
      this.renderTripsList();
      this.updateTripHeaderEmpty();
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

      // 🔧 Firestore rechaza el documento COMPLETO si cualquier campo es
      // literalmente undefined (no null) - un solo llamador de createTrip()
      // que se olvide de mandar fechas (confirmado con la carga de
      // plantillas del wizard) tumbaba toda la creación del viaje con
      // "Unsupported field value: undefined". Fallback a hoy/+6 días en vez
      // de dejar que undefined llegue a setDoc().
      const todayISO = new Date().toISOString().split('T')[0];
      const fallbackEnd = new Date();
      fallbackEnd.setDate(fallbackEnd.getDate() + 6);

      const newTrip = {
        info: {
          name: tripData.name,
          destination: tripData.destination || 'Japón',
          dateStart: tripData.dateStart || todayISO,
          dateEnd: tripData.dateEnd || fallbackEnd.toISOString().split('T')[0],
          createdBy: userId,
          createdAt: new Date().toISOString(),
          shareCode: shareCode, // Código compartible
          creatorEmail: auth.currentUser.email,
          templateUsed: tripData.templateId || null // Track template usado
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

      // 🔥 NUEVO: Si hay template, cargar itinerario
      if (tripData.useTemplate && tripData.templateId) {
        console.log(`📋 Cargando template: ${tripData.templateId}`);
        await this.loadTemplateItinerary(tripId, tripData.templateId);
      }

      // 🏆 Tracking de gamificación
      if (window.GamificationSystem) {
        await window.GamificationSystem.trackAction('tripsCreated', 1);
      }

      Notifications.success(
        `🎉 Viaje "${tripData.name}" creado exitosamente!\n🔗 Código: ${shareCode}${tripData.useTemplate ? '\n✨ Itinerario cargado del template' : ''}`,
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

  // 🔥 NUEVO: Cargar itinerario desde template
  async loadTemplateItinerary(tripId, templateId) {
    try {
      console.log(`🔥 Cargando template "${templateId}" para trip ${tripId}`);

      // Cargar template desde attractions.json
      const response = await fetch(`/data/attractions.json?v=${Date.now()}`);
      const data = await response.json();

      if (!data.suggestedItinerary) {
        console.error('❌ Template no tiene suggestedItinerary');
        return;
      }

      // Crear estructura de itinerario para Firestore
      const itineraryData = {
        days: data.suggestedItinerary.map(day => ({
          day: day.day,
          date: day.date,
          title: day.title,
          city: day.city || day.location,
          cityId: day.cityId || 'tokyo',
          location: day.location,
          budget: day.budget || 0,
          hotel: day.hotel || '',
          activities: day.activities.map(act => ({
            id: act.id,
            time: act.time,
            duration: act.duration || 60,
            activity: act.activity || act.title,
            name: act.name || act.title,
            title: act.title,
            location: act.location,
            notes: act.notes || '',
            category: act.category || 'other',
            coordinates: act.coordinates || null
          }))
        })),
        hotels: {}, // Se puede agregar después
        version: 'v3'
      };

      // Guardar en Firestore (en la ruta correcta donde se lee)
      const itineraryRef = doc(db, 'trips', tripId, 'data', 'itinerary');
      await setDoc(itineraryRef, itineraryData);

      console.log(`✅ Template cargado: ${data.suggestedItinerary.length} días`);

    } catch (error) {
      console.error('❌ Error cargando template:', error);
      Notifications.error('El viaje se creó pero hubo un error cargando el template.');
    }
  },

  // Seleccionar trip actual
  async selectTrip(tripId, _isRetry = false) {
    try {
      const tripRef = doc(db, 'trips', tripId);
      const tripSnap = await getDoc(tripRef);

      if (tripSnap.exists()) {
        this.currentTrip = {
          id: tripId,
          ...tripSnap.data()
        };

        localStorage.setItem('currentTripId', tripId);
        // 🛡️ Backup adicional en sessionStorage
        sessionStorage.setItem('backup_currentTripId', tripId);

        console.log('✅ Trip seleccionado:', this.currentTrip.info.name);
        console.log('💾 Backup guardado en localStorage + sessionStorage');

        this.updateTripHeader();

        // Notificar a widgets (countdown, etc.) que hay un viaje activo
        window.dispatchEvent(new CustomEvent('tripSelected', {
          detail: { trip: this.currentTrip }
        }));

        // 🔧 FIX: Re-inicializar módulos EN PARALELO con await
        const initPromises = [];

        if (window.ItineraryHandler?.reinitialize) {
          initPromises.push(
            Promise.resolve(window.ItineraryHandler.reinitialize())
              .catch(err => console.error('Error reinit ItineraryHandler:', err))
          );
        }
        if (window.BudgetTracker?.reinitialize) {
          initPromises.push(
            Promise.resolve(window.BudgetTracker.reinitialize())
              .catch(err => console.error('Error reinit BudgetTracker:', err))
          );
        }
        if (window.PreparationHandler?.reinitialize) {
          initPromises.push(
            Promise.resolve(window.PreparationHandler.reinitialize())
              .catch(err => console.error('Error reinit PreparationHandler:', err))
          );
        }
        if (window.FlightsHandler?.init) {
          initPromises.push(
            Promise.resolve(window.FlightsHandler.init(tripId))
              .catch(err => console.error('Error reinit FlightsHandler:', err))
          );
        }
        if (window.HotelsHandler?.init) {
          initPromises.push(
            Promise.resolve(window.HotelsHandler.init(tripId))
              .catch(err => console.error('Error reinit HotelsHandler:', err))
          );
        }
        if (window.AppCore?.reinitialize) {
          initPromises.push(
            Promise.resolve(window.AppCore.reinitialize())
              .catch(err => console.error('Error reinit AppCore:', err))
          );
        }
        if (window.ChatHandler?.reinitialize) {
          initPromises.push(
            Promise.resolve(window.ChatHandler.reinitialize(tripId))
              .catch(err => console.error('Error reinit ChatHandler:', err))
          );
        }

        // Esperar a que TODOS terminen (no falla si uno falla)
        await Promise.allSettled(initPromises);

        this.closeTripsListModal();

        console.log('🔄 Todos los módulos re-inicializados para el trip:', tripId);
      }
    } catch (error) {
      // 🛡️ Justo después de crear un trip, el listener onSnapshot de la query
      // de trips puede disparar un auto-select inmediato (antes del setTimeout
      // de createTrip) cuando las reglas de seguridad de Firestore todavía no
      // "ven" el documento recién creado para un getDoc directo, aunque el
      // dato ya esté en el cache local. Reintentamos una vez antes de mostrar
      // el error - en el caso normal (trip ya existente) nunca debería pasar.
      if (error.code === 'permission-denied' && !_isRetry) {
        console.warn('⚠️ Permission-denied seleccionando trip recién creado, reintentando en 800ms...');
        await new Promise(resolve => setTimeout(resolve, 800));
        return this.selectTrip(tripId, true);
      }
      console.error('❌ Error seleccionando trip:', error);
    }
  },

  // 🔥 NUEVO: Invitar por Email
  async inviteMemberByEmail() {
    if (!this.currentTrip) {
      window.Notifications.warning('Debes seleccionar un viaje primero');
      return;
    }

    const email = await window.Dialogs.prompt({
        title: '📧 Invitar por Email',
        message: 'Ingresa el email de la persona que quieres invitar. Recibirá el código para unirse.'
    });
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

      Notifications.success(`✅ Invitación enviada a ${email}.`);
      
      console.log('✅ Invitación por email enviada a:', email);
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
    const code = await window.Dialogs.prompt({
        title: '🔗 Unirse a un Viaje',
        message: 'Ingresa el código de 6 caracteres que te compartieron.'
    });
    if (!code) {
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

  // ===== RENDER MEJORADO DE LISTA DE VIAJES =====
  renderTripsList() {
    const container = document.getElementById('tripsListContainer');
    if (!container) return;

    // Actualizar badge de cantidad de viajes
    const updateBadges = () => {
      const badge1 = document.getElementById('tripsCountBadge');
      const badge2 = document.getElementById('tripsCountBadgeMobile');
      if (badge1) badge1.textContent = this.userTrips.length;
      if (badge2) badge2.textContent = this.userTrips.length;
    };
    updateBadges();

    // ===== EMPTY STATE =====
    if (this.userTrips.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="mb-6">
            <div class="text-8xl mb-4">✈️</div>
            <h3 class="text-2xl font-bold dark:text-white mb-2">¡Comienza tu aventura!</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">Aún no tienes viajes creados</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button
              onclick="TripsManager.showCreateTripModal(); TripsManager.closeTripsListModal()"
              class="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all hover:scale-105"
            >
              <div class="text-4xl mb-3">➕</div>
              <div class="font-bold text-lg dark:text-white mb-1">Crear Primer Viaje</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Planifica tu aventura a Japón</div>
            </button>

            <button
              onclick="TripsManager.joinTripWithCode()"
              class="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border-2 border-green-200 dark:border-green-700 hover:shadow-lg transition-all hover:scale-105"
            >
              <div class="text-4xl mb-3">🔗</div>
              <div class="font-bold text-lg dark:text-white mb-1">Unirse a Viaje</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Ingresa un código compartido</div>
            </button>
          </div>
        </div>
      `;
      return;
    }

    // ===== CALCULAR STATS DE CADA VIAJE =====
    const tripsWithStats = this.userTrips.map(trip => {
      const today = new Date();
      const totalDays = window.TimeUtils.daysBetween(trip.info.dateStart, trip.info.dateEnd) + 1;
      const daysUntil = window.TimeUtils.daysBetween(today, trip.info.dateStart);
      const daysRemaining = window.TimeUtils.daysBetween(today, trip.info.dateEnd);

      let status = 'upcoming'; // upcoming, ongoing, past
      let statusText = 'Próximo';
      let statusColor = 'blue';

      if (daysRemaining < 0) {
        status = 'past';
        statusText = 'Finalizado';
        statusColor = 'gray';
      } else if (daysUntil <= 0 && daysRemaining >= 0) {
        status = 'ongoing';
        statusText = '¡En curso!';
        statusColor = 'green';
      } else if (daysUntil <= 7) {
        statusText = `En ${daysUntil} día${daysUntil > 1 ? 's' : ''}`;
        statusColor = 'orange';
      }

      return {
        ...trip,
        stats: { totalDays, daysUntil, daysRemaining, status, statusText, statusColor }
      };
    });

    // Ordenar: En curso > Próximos > Pasados
    const sorted = tripsWithStats.sort((a, b) => {
      if (a.stats.status === 'ongoing') return -1;
      if (b.stats.status === 'ongoing') return 1;
      if (a.stats.status === 'upcoming' && b.stats.status === 'past') return -1;
      if (a.stats.status === 'past' && b.stats.status === 'upcoming') return 1;
      return new Date(b.info.dateStart) - new Date(a.info.dateStart);
    });

    // ===== RENDER GRID DE CARDS =====
    container.innerHTML = `
      <!-- Barra de búsqueda y acciones -->
      <div class="mb-6 flex flex-col md:flex-row gap-3">
        <div class="flex-1 relative">
          <input
            type="text"
            id="tripsSearchInput"
            placeholder="🔍 Buscar viajes..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            oninput="TripsManager.filterTrips(this.value)"
          >
          <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        </div>
        <button
          onclick="TripsManager.showCreateTripModal(); TripsManager.closeTripsListModal()"
          class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
        >
          ➕ Nuevo Viaje
        </button>
      </div>

      <!-- Grid de Viajes -->
      <div id="tripsGrid" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        ${sorted.map(trip => this.renderTripCard(trip)).join('')}
      </div>

      <!-- Acciones adicionales -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
        <button
          onclick="TripsManager.joinTripWithCode()"
          class="w-full p-3 border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition text-center"
        >
          <span class="text-green-600 dark:text-green-400 font-semibold">🔗 Unirse a Viaje Compartido</span>
        </button>
      </div>
    `;
  },

  // Render individual trip card
  renderTripCard(trip) {
    const isActive = this.currentTrip && this.currentTrip.id === trip.id;
    const { stats } = trip;

    // Color del badge de status
    const statusColors = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };

    return `
      <div
        class="trip-card group relative p-5 rounded-xl border-2 transition-all hover:shadow-xl cursor-pointer ${
          isActive
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300'
        }"
        onclick="TripsManager.selectTrip('${trip.id}'); TripsManager.closeTripsListModal()"
        data-trip-name="${trip.info.name.toLowerCase()}"
      >
        <!-- Badge de activo -->
        ${isActive ? `
          <div class="absolute top-3 right-3">
            <span class="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <i class="fas fa-check-circle"></i> ACTIVO
            </span>
          </div>
        ` : ''}

        <!-- Header del card -->
        <div class="mb-4">
          <h3 class="font-bold text-xl dark:text-white mb-2 pr-20">${trip.info.name}</h3>

          <!-- Status badge -->
          <div class="flex items-center gap-2 mb-3">
            <span class="px-3 py-1 rounded-full text-xs font-bold ${statusColors[stats.statusColor]}">
              ${stats.statusText}
            </span>
            ${trip.members.length > 1 ? `
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
                <i class="fas fa-users"></i> ${trip.members.length} personas
              </span>
            ` : ''}
          </div>

          <!-- Fechas -->
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <i class="fas fa-calendar-alt"></i>
            <span>${window.TimeUtils.formatDate(trip.info.dateStart)}</span>
            <span>→</span>
            <span>${window.TimeUtils.formatDate(trip.info.dateEnd)}</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-2 mb-4 text-center">
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${stats.totalDays}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">días</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${trip.members.length}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">viajeros</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">${trip.info.shareCode || 'N/A'}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">código</div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onclick="event.stopPropagation(); TripsManager.duplicateTrip('${trip.id}')"
            class="flex-1 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition text-sm font-semibold"
            title="Duplicar Viaje"
          >
            <i class="fas fa-copy"></i> Duplicar
          </button>
          <button
            onclick="event.stopPropagation(); TripsManager.editTrip('${trip.id}')"
            class="flex-1 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition text-sm font-semibold"
            title="Editar Viaje"
          >
            <i class="fas fa-edit"></i> Editar
          </button>
          <button
            onclick="event.stopPropagation(); TripsManager.deleteTrip('${trip.id}')"
            class="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition text-sm font-semibold"
            title="Eliminar Viaje"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  },

  // Filtrar viajes por búsqueda
  filterTrips(searchTerm) {
    const cards = document.querySelectorAll('.trip-card');
    const term = searchTerm.toLowerCase();

    cards.forEach(card => {
      const tripName = card.dataset.tripName;
      if (tripName.includes(term)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  },

  // Editar viaje (placeholder)
  editTrip(tripId) {
    const trip = this.userTrips.find(t => t.id === tripId);
    if (!trip) {
      Notifications.error('No se encontró el viaje a editar.');
      return;
    }

    // Cerrar el modal de "Editar Viaje" anterior si quedó abierto
    document.getElementById('modal-edit-trip')?.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-edit-trip';
    modal.className = 'fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold dark:text-white flex items-center gap-2">✏️ Editar Viaje</h3>
          <button id="editTripCloseBtn" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>
        <form id="editTripForm" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre del Viaje *</label>
            <input id="editTripName" type="text" required
              class="w-full p-3 border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:outline-none"
              value="${(trip.info?.name || '').replace(/"/g, '&quot;')}">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Destino</label>
            <input id="editTripDestination" type="text"
              class="w-full p-3 border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:outline-none"
              value="${(trip.info?.destination || '').replace(/"/g, '&quot;')}">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fecha de Inicio *</label>
              <input id="editTripDateStart" type="date" required
                class="w-full p-3 border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:outline-none"
                value="${trip.info?.dateStart || ''}">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fecha de Fin *</label>
              <input id="editTripDateEnd" type="date" required
                class="w-full p-3 border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:outline-none"
                value="${trip.info?.dateEnd || ''}">
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            ⚠️ Cambiar las fechas no ajusta automáticamente el itinerario ya generado. Si cambias la duración del viaje, usa "Regenerar Itinerario" después.
          </p>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" id="editTripCancelBtn" class="px-5 py-2.5 rounded-lg border-2 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancelar</button>
            <button type="submit" class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">Guardar Cambios</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    document.getElementById('editTripCloseBtn').addEventListener('click', close);
    document.getElementById('editTripCancelBtn').addEventListener('click', close);

    document.getElementById('editTripForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('editTripName').value.trim();
      const destination = document.getElementById('editTripDestination').value.trim();
      const dateStart = document.getElementById('editTripDateStart').value;
      const dateEnd = document.getElementById('editTripDateEnd').value;

      if (!name || !dateStart || !dateEnd) {
        Notifications.warning('Por favor completa todos los campos obligatorios');
        return;
      }
      if (new Date(dateEnd) <= new Date(dateStart)) {
        Notifications.warning('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
      }

      try {
        await updateDoc(doc(db, 'trips', tripId), {
          'info.name': name,
          'info.destination': destination || 'Japón',
          'info.dateStart': dateStart,
          'info.dateEnd': dateEnd
        });

        // Reflejar el cambio localmente sin esperar al listener de Firestore
        if (this.currentTrip && this.currentTrip.id === tripId) {
          this.currentTrip.info.name = name;
          this.currentTrip.info.destination = destination || 'Japón';
          this.currentTrip.info.dateStart = dateStart;
          this.currentTrip.info.dateEnd = dateEnd;
          this.updateTripHeader();
        }

        Notifications.success(`✅ Viaje "${name}" actualizado`);
        close();
      } catch (error) {
        console.error('❌ Error actualizando el viaje:', error);
        Notifications.error('Ocurrió un error al guardar los cambios.');
      }
    });
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
        // 🔥 FIX: Remover listeners anteriores clonando el form
        const newForm = simpleForm.cloneNode(true);
        simpleForm.parentNode.replaceChild(newForm, simpleForm);

        newForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          const templateId = document.getElementById('simpleTripTemplate')?.value || '';

          console.log('🔥 DEBUG: Form submitted with templateId:', templateId);

          const formData = {
            name: document.getElementById('simpleTripName').value,
            destination: 'Japón',
            dateStart: document.getElementById('simpleTripDateStart').value,
            dateEnd: document.getElementById('simpleTripDateEnd').value,
            templateId: templateId, // 🔥 NUEVO: Template seleccionado
            useTemplate: templateId !== '' && templateId !== null // true si hay template
          };

          console.log('🔥 DEBUG: formData:', formData);

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

          // 🆕 Si el viaje se creó sin template, no queda ningún itinerario - en vez
          // de dejar al usuario con un viaje vacío hasta que descubra "Regenerar
          // Itinerario" por su cuenta, se abre directamente el mismo generador
          // inteligente (ciudades, intereses, ruta, aeropuertos, hoteles) que usa
          // esa opción, ya con las fechas de este viaje precargadas.
          if (!formData.useTemplate && window.SmartGeneratorWizard) {
            const startDate = new Date(formData.dateStart);
            const endDate = new Date(formData.dateEnd);
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            setTimeout(() => {
              Notifications.info('🧠 Vamos a armar tu itinerario...');
              window.SmartGeneratorWizard.open({
                totalDays,
                tripStartDate: formData.dateStart,
                tripEndDate: formData.dateEnd
              });
            }, 900); // Después del setTimeout(500ms) de createTrip() que selecciona/renderiza el viaje nuevo
          }
        });
      }
    }, 100);
  },

  // Mostrar wizard completo
  // 🔧 Antes abría ItineraryBuilder.showCreateItineraryWizard() - un wizard
  // paralelo y separado que nunca recibió ninguna de las mejoras de esta
  // sesión (intereses ponderados, ruta manual con ciudades repetidas,
  // aeropuertos, ayuda de hotel Yamanote, jetlag, validación de horarios...).
  // Ahora usa el mismo flujo "Viaje Simple" (nombre+fechas) seguido del
  // SmartGeneratorWizard real, en vez de mantener dos wizards divergentes.
  showFullTripWizard() {
    this.showSimpleTripForm();
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

    const today = new Date();
    const daysUntil = window.TimeUtils.daysBetween(today, this.currentTrip.info.dateStart);
    const totalDays = window.TimeUtils.daysBetween(this.currentTrip.info.dateStart, this.currentTrip.info.dateEnd) + 1;

    // Calcular días pasados si el viaje ya comenzó
    const daysElapsed = Math.max(0, window.TimeUtils.daysBetween(this.currentTrip.info.dateStart, today));
    const tripProgress = daysUntil <= 0 ? Math.min(100, (daysElapsed / totalDays) * 100) : 0;

    const collaborationStatus = this.currentTrip.members.length > 1
        ? `🤝 Viaje colaborativo • 🔗 ${this.currentTrip.info.shareCode}`
        : '👤 Viaje individual';

    headerContainer.innerHTML = `
      <div id="dashboardTopSection" class="space-y-6">
        <!-- Banner JAPITIN grande centrado - oculto en móvil: el header de arriba ya
             muestra la marca "Japitin", este banner solo añadía ~100px+ de alto
             redundante empujando el itinerario real fuera de la pantalla inicial. -->
        <div class="hidden md:flex justify-center mb-4">
          <img src="/images/icons/japitin banner.png" alt="Japitin" class="h-20 md:h-24 rounded-lg border-2 border-white/20 bg-white/95 px-4 py-2 shadow-lg">
        </div>

        <!-- Botones de acción -->
        <div class="flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-2">
          <button
            onclick="TripsManager.showCreateTripModal()"
            class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-3 sm:px-6 rounded-lg transition hover:scale-105 shadow-md text-sm"
          >
            ➕ <span>Agregar Viaje</span>
          </button>
          <button
            onclick="TripsManager.regenerateItinerary()"
            class="bg-purple-500/80 hover:bg-purple-600 text-white font-semibold py-2.5 px-3 sm:px-6 rounded-lg transition backdrop-blur-sm hover:scale-105 border border-purple-400/30 text-sm shadow-lg"
          >
            🧠 <span>Regenerar</span>
          </button>
          <button
            onclick="TripsManager.clearItinerary()"
            class="bg-red-500/80 hover:bg-red-600 text-white font-semibold py-2.5 px-3 sm:px-6 rounded-lg transition backdrop-blur-sm hover:scale-105 border border-red-400/30 text-sm shadow-lg"
          >
            🗑️ <span>Vaciar</span>
          </button>

          <!-- 🆕 Botón de Exportar con Dropdown -->
          <div class="relative">
            <button
              onclick="TripsManager.toggleExportMenu()"
              id="exportButton"
              class="bg-green-500/80 hover:bg-green-600 text-white font-semibold py-2.5 px-3 sm:px-6 rounded-lg transition backdrop-blur-sm hover:scale-105 border border-green-400/30 text-sm shadow-lg flex items-center gap-2"
            >
              📤 <span>Exportar</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div
              id="exportMenu"
              class="hidden fixed w-64 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-[10000] overflow-hidden"
              style="top: 60px; right: 20px;"
            >
              <div class="p-2">
                <button
                  onclick="TripsManager.exportCurrentTrip('pdf')"
                  class="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition flex items-center gap-3 text-gray-700 dark:text-gray-200"
                >
                  <span class="text-2xl">📄</span>
                  <div>
                    <div class="font-semibold text-sm">Exportar a PDF</div>
                    <div class="text-xs text-gray-500">Itinerario completo descargable</div>
                  </div>
                </button>

                <button
                  onclick="TripsManager.exportCurrentTrip('calendar')"
                  class="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition flex items-center gap-3 text-gray-700 dark:text-gray-200"
                >
                  <span class="text-2xl">📅</span>
                  <div>
                    <div class="font-semibold text-sm">Google Calendar</div>
                    <div class="text-xs text-gray-500">Agregar eventos a tu calendario</div>
                  </div>
                </button>

                <button
                  onclick="TripsManager.exportCurrentTrip('maps')"
                  class="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition flex items-center gap-3 text-gray-700 dark:text-gray-200"
                >
                  <span class="text-2xl">🗺️</span>
                  <div>
                    <div class="font-semibold text-sm">Google Maps</div>
                    <div class="text-xs text-gray-500">Abrir ruta completa en Maps</div>
                  </div>
                </button>

                <button
                  onclick="TripsManager.exportCurrentTrip('checklist')"
                  class="w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition flex items-center gap-3 text-gray-700 dark:text-gray-200"
                >
                  <span class="text-2xl">📋</span>
                  <div>
                    <div class="font-semibold text-sm">Lista de Tareas</div>
                    <div class="text-xs text-gray-500">Checklist descargable (.md)</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Fila 2: Dashboard de Estadísticas Visuales -->
        <div id="tripStatsDashboard" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 animate-fade-in">
          <!-- Loading placeholder -->
          <div class="col-span-full text-center text-white/60 text-sm py-4">
            <i class="fas fa-spinner animate-spin mr-2"></i>Cargando estadísticas...
          </div>
        </div>
      </div>
    `;

    // 🔧 Este header (banner + botones + tarjetas de stats) vuelve a renderizarse
    // cada vez que llega una actualización del listener de Firestore del viaje -
    // no solo una vez al cargar. Si el usuario está en otro tab (ej. Mapa) cuando
    // eso pasa, este re-render deshacía el display:none que switchTab() le había
    // puesto, y el header volvía a taparlo todo. Aplicar el estado correcto acá
    // también, no solo en switchTab().
    const topSection = document.getElementById('dashboardTopSection');
    if (topSection) {
      const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab
        || document.querySelector('.mobile-nav-item.active')?.dataset.tab
        || 'itinerary';
      topSection.classList.toggle('js-tab-hidden', activeTab !== 'itinerary');
    }

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

      // 🔔 Emitir evento de itinerario cargado para el AI Panel
      if (itineraryData) {
        window.dispatchEvent(new CustomEvent('itineraryLoaded', {
          detail: { itinerary: itineraryData, source: 'trip-statistics' }
        }));
      }

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
      const tripDays = window.TimeUtils.daysBetween(this.currentTrip.info.dateStart, this.currentTrip.info.dateEnd) + 1;
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
      const daysUntil = window.TimeUtils.daysBetween(today, this.currentTrip.info.dateStart);
      const daysElapsed = Math.max(0, window.TimeUtils.daysBetween(this.currentTrip.info.dateStart, today));
      const totalDays = tripDays;
      const tripProgress = daysUntil <= 0 ? Math.min(100, (daysElapsed / totalDays) * 100) : 0;

      // Renderizar cards de estadísticas (más compactas)
      statsContainer.innerHTML = `
        <!-- Card 1: Progreso del Viaje -->
        <div class="stat-card bg-gradient-to-br from-blue-500/90 to-cyan-500/90 dark:from-blue-900/60 dark:to-cyan-900/60 backdrop-blur-sm rounded-xl p-4 shadow-lg hover-lift border border-white/10 dark:border-blue-800/30 transition-all">
          <div class="flex items-center justify-between mb-2">
            <div class="text-white font-semibold text-xs tracking-wide uppercase">Progreso del Viaje</div>
            <div class="text-2xl">🗓️</div>
          </div>
          <div class="text-3xl font-bold text-white mb-2 leading-tight">${totalDays} días</div>
          <div class="text-white/90 text-xs mb-3 font-medium">
            ${daysUntil > 0
              ? `${window.TimeUtils.formatDate(this.currentTrip.info.dateStart, { day: 'numeric', month: 'short' })} - ${window.TimeUtils.formatDate(this.currentTrip.info.dateEnd, { day: 'numeric', month: 'short' })}`
              : tripProgress < 100 ? `Día ${daysElapsed} de ${totalDays}` : 'Completado'}
          </div>
          <div class="w-full bg-white/20 dark:bg-white/10 rounded-full h-2">
            <div class="bg-white dark:bg-blue-300 h-2 rounded-full transition-all duration-500" style="width: ${tripProgress}%"></div>
          </div>
        </div>

        <!-- Card 2: Actividades del Itinerario -->
        <div class="stat-card bg-gradient-to-br from-purple-500/90 to-pink-500/90 dark:from-purple-900/60 dark:to-pink-900/60 backdrop-blur-sm rounded-xl p-4 shadow-lg hover-lift border border-white/10 dark:border-purple-800/30 transition-all">
          <div class="flex items-center justify-between mb-2">
            <div class="text-white font-semibold text-xs tracking-wide uppercase">Actividades</div>
            <div class="text-2xl">📍</div>
          </div>
          <div class="text-3xl font-bold text-white mb-2 leading-tight">${totalActivities}</div>
          <div class="text-white/90 text-xs mb-3 font-medium">
            ${completedActivities > 0 ? `${completedActivities} completadas` : 'Planificadas'}
          </div>
          <div class="w-full bg-white/20 dark:bg-white/10 rounded-full h-2">
            <div class="bg-white dark:bg-purple-300 h-2 rounded-full transition-all duration-500" style="width: ${activityProgress}%"></div>
          </div>
        </div>

        <!-- Card 3: Presupuesto -->
        <div class="stat-card bg-gradient-to-br from-green-500/90 to-emerald-500/90 dark:from-green-900/60 dark:to-emerald-900/60 backdrop-blur-sm rounded-xl p-4 shadow-lg hover-lift border border-white/10 dark:border-green-800/30 transition-all">
          <div class="flex items-center justify-between mb-2">
            <div class="text-white font-semibold text-xs tracking-wide uppercase">Presupuesto</div>
            <div class="text-2xl">💰</div>
          </div>
          <div class="text-3xl font-bold text-white mb-2 leading-tight">¥${totalBudget.toLocaleString()}</div>
          <div class="text-white/90 text-xs mb-3 font-medium">
            ${budgetProgress > 0 ? `${budgetProgress.toFixed(0)}% del estimado` : 'Sin gastos registrados'}
          </div>
          <div class="w-full bg-white/20 dark:bg-white/10 rounded-full h-2">
            <div class="bg-white dark:bg-green-300 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, budgetProgress)}%"></div>
          </div>
        </div>

        <!-- Card 4: Reservas -->
        <div class="stat-card bg-gradient-to-br from-orange-500/90 to-red-500/90 dark:from-orange-900/60 dark:to-red-900/60 backdrop-blur-sm rounded-xl p-4 shadow-lg hover-lift border border-white/10 dark:border-orange-800/30 transition-all">
          <div class="flex items-center justify-between mb-2">
            <div class="text-white font-semibold text-xs tracking-wide uppercase">Reservas</div>
            <div class="text-2xl">✈️</div>
          </div>
          <div class="flex gap-4 items-center mb-2">
            <div>
              <div class="text-2xl font-bold text-white leading-tight">${flightsBooked}/2</div>
              <div class="text-white/90 text-xs font-medium mt-1">Vuelos</div>
            </div>
            <div class="w-px h-10 bg-white/30"></div>
            <div>
              <div class="text-2xl font-bold text-white leading-tight">${accommodationsCount}</div>
              <div class="text-white/90 text-xs font-medium mt-1">Hoteles</div>
            </div>
          </div>
          <div class="text-white/90 text-xs font-medium">
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

    // Estado vacío en el área del itinerario (antes quedaba en blanco)
    this.renderEmptyItineraryState();
  },

  // Estado vacío con CTA cuando el usuario no tiene ningún viaje
  renderEmptyItineraryState() {
    const container = document.getElementById('content-itinerary');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-2xl mx-auto my-10 px-4">
        <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-10 text-center border border-purple-100 dark:border-purple-900/40">
          <div class="text-7xl mb-4">🗾</div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">Tu aventura en Japón empieza aquí</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-8">
            Crea tu primer viaje y genera un itinerario completo con actividades,
            rutas optimizadas y presupuesto en menos de 3 minutos.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onclick="TripsManager.showCreateTripModal()"
              class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              ✨ Crear mi primer viaje
            </button>
            <button
              onclick="TripsManager.joinTripWithCode()"
              class="px-8 py-4 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 font-bold rounded-2xl border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 transition-all hover:scale-105"
            >
              🔗 Unirme con código
            </button>
          </div>
          <div class="grid grid-cols-3 gap-4 mt-10 text-sm text-gray-500 dark:text-gray-400">
            <div><div class="text-2xl mb-1">🏯</div>17 ciudades</div>
            <div><div class="text-2xl mb-1">🎯</div>Itinerario automático</div>
            <div><div class="text-2xl mb-1">👥</div>Modo colaborativo</div>
          </div>
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

  // NUEVO: Duplicar un viaje
  async duplicateTrip(tripId) {
    const tripToDuplicate = this.userTrips.find(t => t.id === tripId);
    if (!tripToDuplicate) {
      Notifications.error('No se encontró el viaje a duplicar.');
      return;
    }

    try {
      Notifications.info('🔄 Duplicando viaje...');

      const userId = auth.currentUser.uid;
      const newTripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newShareCode = this.generateTripCode();

      // Copiar datos del viaje original
      const newTrip = {
        info: {
          name: `Copia de ${tripToDuplicate.info.name}`,
          destination: tripToDuplicate.info.destination || 'Japón',
          dateStart: tripToDuplicate.info.dateStart,
          dateEnd: tripToDuplicate.info.dateEnd,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          shareCode: newShareCode,
          creatorEmail: auth.currentUser.email,
          templateUsed: tripToDuplicate.info.templateUsed || null
        },
        members: [userId],
        memberEmails: [auth.currentUser.email],
        flights: {
          outbound: tripToDuplicate.flights?.outbound || null,
          return: tripToDuplicate.flights?.return || null
        },
        accommodations: tripToDuplicate.accommodations || [],
        cities: tripToDuplicate.cities || [],
        activities: {
          checklist: tripToDuplicate.activities?.checklist || {}
        },
        expenses: [] // No copiar gastos (empezar desde cero)
      };

      // Crear nuevo viaje en Firestore
      await setDoc(doc(db, 'trips', newTripId), newTrip);

      // Copiar itinerario si existe
      try {
        const originalItineraryRef = doc(db, 'trips', tripId, 'data', 'itinerary');
        const originalItinerarySnap = await getDoc(originalItineraryRef);

        if (originalItinerarySnap.exists()) {
          const itineraryData = originalItinerarySnap.data();
          const newItineraryRef = doc(db, 'trips', newTripId, 'data', 'itinerary');

          // Copiar itinerario completo
          await setDoc(newItineraryRef, itineraryData);

          console.log('✅ Itinerario copiado exitosamente');
        }
      } catch (itineraryError) {
        console.warn('⚠️ No se pudo copiar el itinerario:', itineraryError);
      }

      Notifications.success(`🎉 Viaje duplicado: "${newTrip.info.name}"`);

      // Seleccionar el nuevo viaje
      setTimeout(() => {
        this.selectTrip(newTripId);
      }, 500);

      return newTripId;
    } catch (error) {
      console.error('❌ Error duplicando viaje:', error);
      Notifications.error('Error al duplicar el viaje. Inténtalo de nuevo.');
      throw error;
    }
  },

  // NUEVO: Regenerar itinerario usando el wizard inteligente
  async regenerateItinerary() {
    if (!this.currentTrip) {
      Notifications.warning('Debes seleccionar un viaje primero');
      return;
    }

    try {
      // Verificar que exista el SmartGeneratorWizard
      if (!window.SmartGeneratorWizard) {
        Notifications.error('El generador inteligente no está disponible');
        console.error('SmartGeneratorWizard no encontrado');
        return;
      }

      // Obtener datos del viaje actual
      const startDate = new Date(this.currentTrip.info.dateStart);
      const endDate = new Date(this.currentTrip.info.dateEnd);
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Calcular ciudades del viaje
      const cities = this.currentTrip.cities || [];

      // Notificar al usuario
      Notifications.info('🧠 Abriendo generador inteligente...');

      // Abrir el wizard con datos del viaje actual pre-cargados
      // (open() resetea a defaults completos y aplica este override encima,
      // en vez de reemplazar wizardData entero y perder campos nuevos)
      setTimeout(() => {
        window.SmartGeneratorWizard.open({
          cities: cities.length > 0 ? cities : [],
          totalDays: totalDays
        });
      }, 300);

    } catch (error) {
      console.error('❌ Error abriendo generador:', error);
      Notifications.error('Error al abrir el generador inteligente');
    }
  },

  /**
   * 🗑️ Vacía el itinerario (borra días/actividades) pero conserva el viaje
   * (vuelos, hoteles, fechas, miembros, etc.)
   */
  async clearItinerary() {
    if (!this.currentTrip) {
      Notifications.warning('Debes seleccionar un viaje primero');
      return;
    }

    const confirmed = await window.Dialogs.confirm({
      title: '🗑️ ¿Vaciar el itinerario?',
      message: 'Se eliminarán todos los días y actividades del itinerario. El viaje, vuelos y hoteles se conservan. Esta acción no se puede deshacer.',
      okText: 'Sí, vaciar itinerario',
      isDestructive: true
    });
    if (!confirmed) return;

    try {
      if (!window.ItineraryBuilder?.generateDays) {
        Notifications.error('No se pudo vaciar el itinerario (módulo no disponible)');
        return;
      }

      const emptyDays = window.ItineraryBuilder.generateDays(
        this.currentTrip.info.dateStart,
        this.currentTrip.info.dateEnd
      );

      const itineraryRef = doc(db, `trips/${this.currentTrip.id}/data`, 'itinerary');
      await setDoc(itineraryRef, { days: emptyDays });

      if (window.ItineraryHandler?.reinitialize) {
        await window.ItineraryHandler.reinitialize();
      }

      Notifications.success('🗑️ Itinerario vaciado. El viaje sigue intacto.');
    } catch (error) {
      console.error('❌ Error vaciando el itinerario:', error);
      Notifications.error('Ocurrió un error al vaciar el itinerario.');
    }
  },

  /**
   * 🆕 Toggle del menú de exportación
   */
  toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    if (!menu) return;

    if (menu.classList.contains('hidden')) {
      menu.classList.remove('hidden');
      menu.classList.add('animate-fade-in');

      // Cerrar al hacer click fuera
      setTimeout(() => {
        document.addEventListener('click', this.closeExportMenuOnClickOutside);
      }, 100);
    } else {
      menu.classList.add('hidden');
      document.removeEventListener('click', this.closeExportMenuOnClickOutside);
    }
  },

  /**
   * Cerrar menú de exportación al hacer click fuera
   */
  closeExportMenuOnClickOutside(event) {
    const menu = document.getElementById('exportMenu');
    const button = document.getElementById('exportButton');

    if (menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
      menu.classList.add('hidden');
      document.removeEventListener('click', TripsManager.closeExportMenuOnClickOutside);
    }
  },

  /**
   * 🆕 Exportar viaje actual
   */
  async exportCurrentTrip(format) {
    // Cerrar menú
    const menu = document.getElementById('exportMenu');
    if (menu) menu.classList.add('hidden');

    if (!this.currentTrip) {
      Notifications.warning('⚠️ Debes seleccionar un viaje primero');
      return;
    }

    if (!window.ExportManager) {
      Notifications.error('❌ El sistema de exportación no está disponible');
      console.error('ExportManager no encontrado');
      return;
    }

    console.log(`📤 Exportando viaje a ${format}:`, this.currentTrip);

    try {
      let success = false;

      switch (format) {
        case 'pdf':
          success = await window.ExportManager.exportToPDF(this.currentTrip);
          break;

        case 'calendar':
          success = window.ExportManager.exportToGoogleCalendar(this.currentTrip);
          break;

        case 'maps':
          success = window.ExportManager.exportToGoogleMaps(this.currentTrip);
          break;

        case 'checklist':
          success = window.ExportManager.exportToChecklist(this.currentTrip);
          break;

        default:
          Notifications.warning('⚠️ Formato de exportación no soportado');
          return;
      }

      if (success) {
        console.log(`✅ Exportación a ${format} exitosa`);
      }

    } catch (error) {
      console.error(`❌ Error exportando a ${format}:`, error);
      Notifications.error(`❌ Error al exportar: ${error.message}`);
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
    const confirmed1 = await window.Dialogs.confirm({
        title: `🗑️ ¿Eliminar "${tripToDelete.info.name}"?`,
        message: '¿Estás seguro de que quieres eliminar este viaje?',
        okText: 'Sí, continuar',
        isDestructive: true
    });
    if (!confirmed1) return;

    const confirmed2 = await window.Dialogs.confirm({
        title: '⚠️ ¡Acción Permanente!',
        message: 'Se borrarán todos los datos asociados (itinerario, gastos, etc.) y no se podrá recuperar. ¿REALMENTE quieres continuar?',
        okText: 'Sí, eliminar permanentemente',
        isDestructive: true
    });
    if (!confirmed2) {
      return;
    }
    try {
      // 🔥 FIX: Si el viaje que se borra es el que está abierto ahora mismo,
      // desconectar TODOS los listeners de Firestore (onSnapshot) que apuntan
      // a sus subcolecciones ANTES de borrar el documento padre. Si el doc se
      // borra primero, la Cloud Function que borra en cascada revoca el acceso
      // mientras esos listeners siguen activos, y Firestore les dispara un
      // error "permission-denied" en consola (favoritos, hoteles, vuelos,
      // gastos compartidos, packing list...). Desconectar antes elimina la
      // carrera de raíz en vez de solo silenciar el error.
      const isCurrentTrip = this.currentTrip && this.currentTrip.id === tripId;
      if (isCurrentTrip) {
        const tripScopedHandlers = [
          'FavoritesManager', 'HotelsHandler', 'FlightsHandler', 'BudgetTracker',
          'PreparationHandler', 'PackingList', 'ItineraryHandler', 'ChatHandler',
          'GroupChat', 'SocialFeatures', 'ReservationsManager', 'ActivityTimeline',
          'ExpenseSplitter', 'PhotoGallery', 'PreTripChecklist'
        ];
        tripScopedHandlers.forEach(name => {
          try {
            window[name]?.cleanup?.();
          } catch (cleanupError) {
            console.warn(`⚠️ Error limpiando ${name} antes de borrar el viaje:`, cleanupError);
          }
        });
      }

      // Eliminar el documento principal del viaje. La Cloud Function se encargará del resto.
      await deleteDoc(doc(db, 'trips', tripId));

      Notifications.success(`Viaje "${tripToDelete.info.name}" eliminado.`);

      // Si el viaje eliminado era el actual, limpiar el estado local
      if (isCurrentTrip) {
        this.currentTrip = null;
        localStorage.removeItem('currentTripId');
        window.dispatchEvent(new CustomEvent('tripSelected', { detail: { trip: null } }));

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
  cleanup(isRealLogout = false) {
    if (this.unsubscribe) {
      console.log('[TripsManager] 🛑 Deteniendo listener de viajes.');
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.currentTrip = null;
    this.userTrips = [];
    window.dispatchEvent(new CustomEvent('tripSelected', { detail: { trip: null } }));

    // 🛡️ PROTECCIÓN: Solo borrar currentTripId si es un logout REAL
    // NO borrarlo durante reinicios o cambios de estado temporal
    if (isRealLogout) {
      console.log('[TripsManager] 🗑️ Logout real - borrando currentTripId');
      localStorage.removeItem('currentTripId');
    } else {
      console.log('[TripsManager] 🔒 Reinicio temporal - conservando currentTripId');
      // Guardar backup adicional en sessionStorage por seguridad
      const currentTripId = localStorage.getItem('currentTripId');
      if (currentTripId) {
        sessionStorage.setItem('backup_currentTripId', currentTripId);
        console.log('[TripsManager] 💾 Backup creado en sessionStorage:', currentTripId);
      }
    }

    this.updateTripHeaderEmpty();
    this.renderTripsList();
    console.log('[TripsManager] 🧹 Estado de viajes limpiado.');
  }
};

window.TripsManager = TripsManager;

// ====================================================================================
// MANEJO DE EVENTOS DE AUTENTICACIÓN
// ====================================================================================

// 🔥 CRÍTICO: Inicializar automáticamente si el usuario ya está autenticado
// (Para casos donde el evento auth:initialized ya se disparó antes de cargar este módulo)
if (auth.currentUser) {
    console.log('[TripsManager] 🚀 Usuario ya autenticado al cargar módulo. Inicializando trips...');
    TripsManager.initUserTrips();
} else {
    console.log('[TripsManager] ⏳ Esperando autenticación...');
}

window.addEventListener('auth:initialized', (event) => {
    console.log('[TripsManager] ✨ Evento auth:initialized recibido. Inicializando viajes...');
    // Solo inicializar si no se inicializó antes
    if (TripsManager.userTrips.length === 0) {
        TripsManager.initUserTrips();
    } else {
        console.log('[TripsManager] ✅ Trips ya inicializados, saltando...');
    }
});

window.addEventListener('auth:loggedOut', () => {
    // 🛡️ Verificar si realmente es un logout o solo un cambio de estado temporal
    const isRealLogout = sessionStorage.getItem('isRealLogout') === 'true';

    if (isRealLogout) {
        console.log('[TripsManager] 🚫 Evento auth:loggedOut recibido (LOGOUT REAL). Limpiando todo...');
        TripsManager.cleanup(true); // TRUE = es un logout real, sí borrar currentTripId
    } else {
        console.log('[TripsManager] ⚠️ Evento auth:loggedOut recibido pero NO es logout real. Ignorando.');
        // No hacer nada - conservar los datos
    }
});
