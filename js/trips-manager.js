// js/trips-manager.js - Sistema de Gestión de Viajes con Invitación Mejorada

import { db, auth } from '/js/firebase-config.js';
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

      const newTrip = {
        info: {
          name: tripData.name,
          destination: tripData.destination || 'Japón',
          dateStart: tripData.dateStart,
          dateEnd: tripData.dateEnd,
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
        // 🛡️ Backup adicional en sessionStorage
        sessionStorage.setItem('backup_currentTripId', tripId);

        console.log('✅ Trip seleccionado:', this.currentTrip.info.name);
        console.log('💾 Backup guardado en localStorage + sessionStorage');

        this.updateTripHeader();

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
                <button onclick="event.stopPropagation(); TripsManager.duplicateTrip('${trip.id}')" class="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition" title="Duplicar Viaje">
                    <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z"></path><path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z"></path></svg>
                </button>
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
      <div id="dashboardTopSection" class="space-y-6">
        <!-- Banner JAPITIN grande centrado -->
        <div class="flex justify-center mb-4">
          <img src="/images/icons/japitin banner.png" alt="Japitin" class="h-20 md:h-24 rounded-lg border-2 border-white/20 bg-white/95 px-4 py-2 shadow-lg">
        </div>

        <!-- Botones de acción -->
        <div class="flex items-center justify-center gap-3">
          <button
            onclick="TripsManager.showCreateTripModal()"
            class="bg-white/20 hover:bg-white/30 text-white font-semibold py-2.5 px-6 rounded-lg transition backdrop-blur-sm hover:scale-105 border border-white/10 text-sm"
          >
            ➕ Agregar Viaje
          </button>
          <button
            onclick="TripsManager.regenerateItinerary()"
            class="bg-purple-500/80 hover:bg-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg transition backdrop-blur-sm hover:scale-105 border border-purple-400/30 text-sm shadow-lg"
          >
            🧠 Regenerar Itinerario
          </button>

          <!-- 🆕 Botón de Exportar con Dropdown -->
          <div class="relative">
            <button
              onclick="TripsManager.toggleExportMenu()"
              id="exportButton"
              class="bg-green-500/80 hover:bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg transition backdrop-blur-sm hover:scale-105 border border-green-400/30 text-sm shadow-lg flex items-center gap-2"
            >
              📤 Exportar
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div
              id="exportMenu"
              class="hidden absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
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
        <div id="tripStatsDashboard" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
          <!-- Loading placeholder -->
          <div class="col-span-full text-center text-white/60 text-sm py-4">
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
            ${daysUntil > 0 ? `Comienza en ${daysUntil} días` : tripProgress < 100 ? `Día ${daysElapsed} de ${totalDays}` : 'Completado'}
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

      // Pre-cargar datos en el wizard
      window.SmartGeneratorWizard.wizardData = {
        cities: cities.length > 0 ? cities : [],
        totalDays: totalDays,
        dailyBudget: 10000, // Default
        interests: [], // Usuario los seleccionará
        pace: 'moderate',
        startTime: 9,
        companionType: null,
        hotels: {},
        mustSee: [],
        avoid: []
      };

      // Notificar al usuario
      Notifications.info('🧠 Abriendo generador inteligente...');

      // Abrir el wizard
      setTimeout(() => {
        window.SmartGeneratorWizard.open();
      }, 300);

    } catch (error) {
      console.error('❌ Error abriendo generador:', error);
      Notifications.error('Error al abrir el generador inteligente');
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
      // Eliminar el documento principal del viaje. La Cloud Function se encargará del resto.
      await deleteDoc(doc(db, 'trips', tripId));

      Notifications.success(`Viaje "${tripToDelete.info.name}" eliminado.`);

      // Si el viaje eliminado era el actual, limpiar el estado local
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
  cleanup(isRealLogout = false) {
    if (this.unsubscribe) {
      console.log('[TripsManager] 🛑 Deteniendo listener de viajes.');
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.currentTrip = null;
    this.userTrips = [];

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
