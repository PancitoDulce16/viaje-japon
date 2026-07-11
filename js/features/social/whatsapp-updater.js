/**
 * WhatsApp Trip Updater
 * Compone mensajes de actualización del viaje y los abre en WhatsApp (wa.me)
 * listos para enviar. No existe una API pública para enviar WhatsApp sin
 * intervención del usuario, así que el flujo real es: elegir contacto → se
 * abre WhatsApp con el mensaje precargado → el usuario confirma el envío.
 */
import { escapeHTML } from '../../utils/helpers.js';

class WhatsAppUpdater {
  constructor() {
    this.currentTrip = null;
    this.contactGroups = [];
    this.scheduledMessages = [];
    this.sentMessages = [];
    this.pendingSend = null;
    this.reminderTimers = [];

    // Templates de mensajes
    this.MESSAGE_TEMPLATES = {
      arrival: {
        name: 'Llegada segura',
        icon: '✈️',
        category: 'safety',
        templates: [
          '✈️ Aterricé en {city}! Todo bien, el hotel es increíble 🏨',
          '🛬 Llegué safe a {city}! Ya estoy en el hotel descansando',
          '✈️ Update: Aterrizamos! {city} es hermoso desde el aire 🌆',
          '🛬 Touchdown en {city}! Lista para la aventura 🎌'
        ]
      },
      daily_highlight: {
        name: 'Highlight del día',
        icon: '✨',
        category: 'experience',
        templates: [
          '✨ Hoy en {city}: {activity}! Fue increíble 🎉',
          '🌟 Best moment del día: {activity} en {location}',
          '✨ Update del día: Hoy fuimos a {location}. Mind = blown 🤯',
          '💫 Día {dayNumber}: {activity}. No puedo creer que estoy aquí!'
        ]
      },
      food_find: {
        name: 'Descubrimiento food',
        icon: '🍜',
        category: 'food',
        templates: [
          '🍜 ALERTA RAMEN: Acabo de probar el mejor ramen de mi vida en {location}!',
          '😍 Food update: {food} en {location}. Necesito traer esto a casa!',
          '🍱 Comiendo {food} en {location}... esto es otro nivel',
          '🍜 Hoy probé {food}. Mi vida cambió. {location} es el spot!'
        ]
      },
      hidden_gem: {
        name: 'Hidden gem',
        icon: '💎',
        category: 'discovery',
        templates: [
          '💎 Encontré un lugar secreto en {city}: {location}! Zero turistas',
          '🗺️ Hidden gem del día: {location}. Nadie sabe de esto!',
          '💎 Les tengo que contar de {location}... este lugar es mágico ✨',
          '🔍 Descubrí {location} por casualidad. Best find ever!'
        ]
      },
      cultural_moment: {
        name: 'Momento cultural',
        icon: '⛩️',
        category: 'culture',
        templates: [
          '⛩️ Hoy visitamos {location}. La cultura japonesa es increíble',
          '🎎 Experiencia cultural: {activity} en {location}. Mind-blowing',
          '⛩️ {location} me dejó sin palabras. Qué hermoso',
          '🎌 Cultural moment: {activity}. Esto no lo olvido nunca'
        ]
      },
      funny_moment: {
        name: 'Momento gracioso',
        icon: '😂',
        category: 'fun',
        templates: [
          '😂 No van a creer lo que me pasó: {story}',
          '🤣 Anécdota del día: {story} JAJAJA',
          '😂 Momento random: {story}. Solo en Japón!',
          '🤣 Les tengo que contar: {story} 😂'
        ]
      },
      safety_checkin: {
        name: 'Check-in seguridad',
        icon: '✅',
        category: 'safety',
        templates: [
          '✅ Daily check-in! Todo bien por {city} 🙌',
          '✅ Update rápido: Estoy bien! Hoy en {city}',
          '✅ All good! Día {dayNumber} completado ✨',
          '✅ Check-in: Safe and having fun en {city}!'
        ]
      },
      evening_recap: {
        name: 'Recap nocturno',
        icon: '🌙',
        category: 'recap',
        templates: [
          '🌙 Día {dayNumber} done! Highlights: {highlights}. Buenas noches desde {city}!',
          '✨ Recap del día: {highlights}. Agotada pero feliz 😊',
          '🌙 Terminando el día en {city}. Hoy fue: {highlights}',
          '⭐ Cerrando día {dayNumber}: {highlights}. Tomorrow: más aventuras!'
        ]
      },
      weather_update: {
        name: 'Update del clima',
        icon: '🌸',
        category: 'info',
        templates: [
          '🌸 Clima en {city}: {weather}! Perfecto para {activity}',
          '☀️ Update: Hace {weather} acá. Ideal para explorar!',
          '🌸 El clima hoy: {weather}. {city} está hermoso',
          '⛅ Weather report: {weather} en {city}'
        ]
      },
      countdown_return: {
        name: 'Countdown regreso',
        icon: '🏠',
        category: 'info',
        templates: [
          '🏠 Quedan {days} días... ya extraño pero también no quiero volver!',
          '⏰ Update: {days} días más en Japón. El tiempo vuela!',
          '🏠 Countdown: {days} días restantes de esta aventura',
          '⏰ Solo {days} días más... aprovechando cada segundo!'
        ]
      }
    };

    this.loadState();
    this.scheduleReminders();
  }

  /**
   * Clave de almacenamiento local, aislada por viaje
   */
  get storageKey() {
    const tripId = window.TripsManager?.currentTrip?.id || 'default';
    return `whatsappUpdater_${tripId}`;
  }

  /**
   * Carga contactos, recordatorios e historial desde localStorage
   */
  loadState() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(this.storageKey) || 'null');
    } catch (error) {
      saved = null;
    }

    this.contactGroups = saved?.contactGroups || [
      { id: 'family', name: 'Familia', icon: '👨‍👩‍👧‍👦', contacts: [] },
      { id: 'close_friends', name: 'Amigos cercanos', icon: '👯‍♀️', contacts: [] },
      { id: 'work', name: 'Trabajo', icon: '💼', contacts: [] }
    ];
    this.scheduledMessages = saved?.scheduledMessages || [];
    this.sentMessages = saved?.sentMessages || [];
  }

  /**
   * Persiste el estado actual en localStorage
   */
  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify({
      contactGroups: this.contactGroups,
      scheduledMessages: this.scheduledMessages,
      sentMessages: this.sentMessages
    }));
  }

  /**
   * Calcula el estado real del viaje (día actual, ciudad, etc) a partir
   * de los datos reales del viaje/itinerario, no de datos de ejemplo
   */
  getTripStatus() {
    const trip = window.TripsManager?.currentTrip;
    const destination = trip?.info?.destination || 'Japón';

    if (!trip?.info?.dateStart || !trip?.info?.dateEnd || !window.TimeUtils) {
      return { startDate: null, endDate: null, currentDay: 0, totalDays: 0, currentCity: destination };
    }

    const today = window.TimeUtils.toISODate(new Date());
    const totalDays = window.TimeUtils.daysBetween(trip.info.dateStart, trip.info.dateEnd) + 1;
    const rawDay = window.TimeUtils.daysBetween(trip.info.dateStart, today) + 1;
    const currentDay = Math.min(Math.max(rawDay, 1), totalDays);

    const days = window.ItineraryHandler?.currentItinerary?.days || [];
    const todayEntry = days.find(d => d.date === today);
    const currentCity = todayEntry?.city || days[Math.min(currentDay, days.length) - 1]?.city || destination;

    return { startDate: trip.info.dateStart, endDate: trip.info.dateEnd, currentDay, totalDays, currentCity };
  }

  /**
   * Variables automáticas disponibles para rellenar templates
   */
  getTemplateVariables() {
    const status = this.currentTrip || this.getTripStatus();
    const daysLeft = status.endDate && window.TimeUtils
      ? Math.max(0, window.TimeUtils.daysBetween(window.TimeUtils.toISODate(new Date()), status.endDate))
      : 0;

    return {
      city: status.currentCity,
      dayNumber: status.currentDay || 1,
      days: daysLeft
    };
  }

  /**
   * Abre el WhatsApp Updater
   */
  open() {
    this.currentTrip = this.getTripStatus();

    const modal = document.createElement('div');
    modal.id = 'whatsappUpdaterModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-strong flex items-center justify-center z-50 p-4 animate-fadeInUp';

    modal.innerHTML = `
      <div class="glass-card rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col glow-green hover-lift">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 gradient-animated text-white p-6 relative overflow-hidden">
          <div class="shimmer absolute inset-0"></div>
          <div class="relative z-10">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold mb-2">📱 WhatsApp Trip Updater</h2>
              <p class="text-white/90">Prepara el mensaje y ábrelo directo en WhatsApp</p>
            </div>
            <button onclick="window.whatsappUpdater?.close()" class="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Trip Status -->
          <div class="mt-4 grid grid-cols-3 gap-4">
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.currentTrip.totalDays ? `Día ${this.currentTrip.currentDay}/${this.currentTrip.totalDays}` : '—'}</div>
              <div class="text-sm text-white/80">Progreso</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.sentMessages.length}</div>
              <div class="text-sm text-white/80">Mensajes enviados</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.scheduledMessages.length}</div>
              <div class="text-sm text-white/80">Recordatorios</div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <div class="flex">
            <button onclick="window.whatsappUpdater?.showTab('quick')"
                    id="tab-quick"
                    class="px-6 py-3 font-medium border-b-2 border-green-500 text-green-600 dark:text-green-400 tab-button">
              ⚡ Envío Rápido
            </button>
            <button onclick="window.whatsappUpdater?.showTab('scheduled')"
                    id="tab-scheduled"
                    class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button">
              📅 Recordatorios
            </button>
            <button onclick="window.whatsappUpdater?.showTab('templates')"
                    id="tab-templates"
                    class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button">
              📝 Templates
            </button>
            <button onclick="window.whatsappUpdater?.showTab('contacts')"
                    id="tab-contacts"
                    class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button">
              👥 Contactos
            </button>
            <button onclick="window.whatsappUpdater?.showTab('history')"
                    id="tab-history"
                    class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button">
              📜 Historial
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6" id="whatsappContent">
          ${this.renderQuickSendTab()}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Renderiza tab de envío rápido
   */
  renderQuickSendTab() {
    return `
      <div class="space-y-6">
        <!-- Quick Actions -->
        <div class="grid md:grid-cols-3 gap-4">
          <button onclick="window.whatsappUpdater?.selectTemplate('safety_checkin')"
                  class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 hover:shadow-lg transition-all text-left">
            <div class="text-4xl mb-3">✅</div>
            <div class="font-bold text-gray-900 dark:text-white mb-1">Estoy bien!</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Check-in de seguridad rápido</div>
          </button>

          <button onclick="window.whatsappUpdater?.selectTemplate('daily_highlight')"
                  class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6 hover:shadow-lg transition-all text-left">
            <div class="text-4xl mb-3">✨</div>
            <div class="font-bold text-gray-900 dark:text-white mb-1">Highlight del día</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Comparte tu momento favorito</div>
          </button>

          <button onclick="window.whatsappUpdater?.selectTemplate('food_find')"
                  class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-xl p-6 hover:shadow-lg transition-all text-left">
            <div class="text-4xl mb-3">🍜</div>
            <div class="font-bold text-gray-900 dark:text-white mb-1">Food find!</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Comparte tu descubrimiento culinario</div>
          </button>
        </div>

        <!-- Template Categories -->
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">📝 Selecciona un template</h3>
          <div class="grid md:grid-cols-2 gap-4">
            ${Object.entries(this.MESSAGE_TEMPLATES).map(([key, template]) => `
              <button onclick="window.whatsappUpdater?.selectTemplate('${key}')"
                      class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-green-400 dark:hover:border-green-600 transition-all text-left">
                <div class="flex items-center gap-3">
                  <div class="text-3xl">${template.icon}</div>
                  <div class="flex-1">
                    <div class="font-bold text-gray-900 dark:text-white">${template.name}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">${template.templates.length} opciones</div>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Custom Message -->
        <div class="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 class="font-bold text-gray-900 dark:text-white mb-4">✍️ Mensaje personalizado</h3>
          <form onsubmit="window.whatsappUpdater?.sendCustomMessage(event)" class="space-y-4">
            <textarea placeholder="Escribe tu mensaje..."
                      rows="4"
                      class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:bg-gray-700 dark:text-white"
                      required></textarea>

            <div class="flex gap-4">
              <select class="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 dark:bg-gray-700 dark:text-white" required>
                <option value="">Selecciona destinatarios...</option>
                ${this.contactGroups.map(group => `
                  <option value="${group.id}">${group.icon} ${group.name} (${group.contacts.length})</option>
                `).join('')}
              </select>

              <button type="submit"
                      class="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all">
                📤 Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Muestra el formulario para personalizar y enviar un template
   */
  selectTemplate(templateKey) {
    const template = this.MESSAGE_TEMPLATES[templateKey];
    if (!template) return;

    const autoFields = this.getTemplateVariables();
    const placeholders = [...new Set((template.templates.join(' ').match(/\{(\w+)\}/g) || []).map(p => p.slice(1, -1)))];
    const manualFields = placeholders.filter(p => !(p in autoFields));

    const content = document.getElementById('whatsappContent');
    if (!content) return;

    content.innerHTML = `
      <div class="space-y-6">
        <button onclick="window.whatsappUpdater?.showTab('quick')" class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">← Volver</button>
        <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="text-4xl">${template.icon}</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">${template.name}</h3>
          </div>

          <form onsubmit="window.whatsappUpdater?.previewTemplateMessage(event, '${templateKey}')" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Elige una variante</label>
              <select name="variantIndex" class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                ${template.templates.map((t, i) => `<option value="${i}">${t}</option>`).join('')}
              </select>
            </div>

            ${manualFields.map(field => `
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">${field}</label>
                <input name="field_${field}" type="text" required
                       class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
            `).join('')}

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destinatarios</label>
              <select name="recipientGroup" class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                <option value="">Selecciona...</option>
                ${this.contactGroups.map(g => `<option value="${g.id}">${g.icon} ${g.name} (${g.contacts.length})</option>`).join('')}
              </select>
            </div>

            <button type="submit" class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all">
              Continuar →
            </button>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Rellena el mensaje con la variante y campos elegidos y pasa al selector de contacto
   */
  previewTemplateMessage(event, templateKey) {
    event.preventDefault();
    const data = new FormData(event.target);
    const template = this.MESSAGE_TEMPLATES[templateKey];
    const variant = template.templates[Number(data.get('variantIndex')) || 0];
    const groupId = data.get('recipientGroup');

    const variables = { ...this.getTemplateVariables() };
    for (const [key, value] of data.entries()) {
      if (key.startsWith('field_')) variables[key.slice(6)] = value;
    }

    const message = this.fillTemplate(variant, variables);
    this.showRecipientPicker(templateKey, message, groupId);
  }

  /**
   * Envía mensaje personalizado: pasa directo al selector de contacto
   */
  sendCustomMessage(event) {
    event.preventDefault();
    const form = event.target;
    const message = form.querySelector('textarea').value.trim();
    const groupId = form.querySelector('select').value;
    if (!message || !groupId) return;

    form.reset();
    this.showRecipientPicker('custom', message, groupId);
  }

  /**
   * Construye el link wa.me para un contacto y mensaje dados
   */
  buildWaLink(phone, message) {
    const digits = (phone || '').replace(/[^\d]/g, '');
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Muestra la lista de contactos del grupo elegido; cada uno abre WhatsApp
   * directamente con el mensaje precargado
   */
  showRecipientPicker(templateKey, message, groupId) {
    const group = this.contactGroups.find(g => g.id === groupId);
    const content = document.getElementById('whatsappContent');
    if (!content) return;

    this.pendingSend = { templateKey, groupId, message };

    if (!group || group.contacts.length === 0) {
      content.innerHTML = `
        <div class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-400 mb-4">El grupo "${group?.name || groupId}" todavía no tiene contactos.</p>
          <button onclick="window.whatsappUpdater?.showTab('contacts')" class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all">Añadir contactos</button>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="space-y-6">
        <button onclick="window.whatsappUpdater?.showTab('quick')" class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">← Volver</button>

        <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <p class="text-gray-800 dark:text-gray-200">${escapeHTML(message)}</p>
        </div>

        <div>
          <h4 class="font-bold text-gray-900 dark:text-white mb-3">Toca un contacto para abrir WhatsApp con el mensaje listo:</h4>
          <div class="space-y-2">
            ${group.contacts.map((c, i) => `
              <a href="${this.buildWaLink(c.phone, message)}" target="_blank" rel="noopener"
                 onclick="window.whatsappUpdater?.recordSent(${i})"
                 class="flex items-center justify-between bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-green-400 transition-all">
                <span class="font-medium text-gray-900 dark:text-white">${c.name}</span>
                <span class="text-green-600">📤 Enviar</span>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Registra en el historial que se abrió WhatsApp para un contacto concreto
   */
  recordSent(contactIndex) {
    if (!this.pendingSend) return;
    const { templateKey, groupId, message } = this.pendingSend;
    const group = this.contactGroups.find(g => g.id === groupId);
    const contact = group?.contacts[contactIndex];

    this.sentMessages.unshift({
      id: `sent_${Date.now()}`,
      template: templateKey,
      sentAt: new Date().toISOString(),
      recipient: contact?.name || 'Desconocido',
      recipientGroup: groupId,
      message
    });

    this.saveState();
    window.Notifications?.show(`📤 WhatsApp abierto para ${contact?.name || 'el contacto'}`, 'success');
  }

  /**
   * Renderiza tab de recordatorios
   */
  renderScheduledTab() {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">📅 Recordatorios</h3>
          <button onclick="window.whatsappUpdater?.scheduleNewMessage()"
                  class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all">
            ➕ Programar recordatorio
          </button>
        </div>

        ${this.scheduledMessages.length > 0 ? `
          <div class="space-y-4">
            ${this.scheduledMessages.map(msg => this.renderScheduledMessage(msg)).join('')}
          </div>
        ` : `
          <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="text-6xl mb-4">📅</div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">No hay recordatorios programados</p>
            <button onclick="window.whatsappUpdater?.scheduleNewMessage()"
                    class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all">
              Programar el primero
            </button>
          </div>
        `}
      </div>
    `;
  }

  /**
   * Renderiza un recordatorio programado
   */
  renderScheduledMessage(msg) {
    const template = this.MESSAGE_TEMPLATES[msg.template];
    const group = this.contactGroups.find(g => g.id === msg.recipientGroup);
    const scheduledDate = new Date(msg.scheduledFor);
    const isDue = scheduledDate <= new Date();
    // Vista previa con los datos actuales del viaje (la variante/campos
    // personalizados todavía no se eligen a esta altura del flujo, así que
    // se muestra la primera variante rellenada con las variables automáticas).
    const previewVariant = template?.templates?.[0];
    const preview = previewVariant ? this.fillTemplate(previewVariant, this.getTemplateVariables()) : '';

    return `
      <div class="bg-white dark:bg-gray-800 border-2 ${isDue ? 'border-green-400 dark:border-green-600' : 'border-gray-200 dark:border-gray-700'} rounded-xl p-6">
        <div class="flex items-start gap-4">
          <div class="text-4xl">${template?.icon || '💬'}</div>
          <div class="flex-1">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h4 class="font-bold text-gray-900 dark:text-white">${template?.name || 'Mensaje'}</h4>
                <div class="text-sm text-gray-600 dark:text-gray-400">Para: ${group?.name || 'Grupo eliminado'}</div>
              </div>
              <span class="px-3 py-1 ${isDue ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'} rounded-full text-xs font-medium">
                ${isDue ? '🔔 Listo para enviar' : '⏰ Pendiente'}
              </span>
            </div>

            <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              📅 ${scheduledDate.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>

            ${preview ? `
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                <p class="text-gray-700 dark:text-gray-300 text-sm">${escapeHTML(preview)}</p>
              </div>
            ` : ''}

            <div class="flex gap-2 flex-wrap">
              <button onclick="window.whatsappUpdater?.selectTemplate('${msg.template}')"
                      class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all text-sm">
                📤 Enviar ahora
              </button>
              <button onclick="window.whatsappUpdater?.scheduleNewMessage('${msg.id}')"
                      class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all text-sm">
                ✏️ Editar
              </button>
              <button onclick="window.whatsappUpdater?.deleteScheduled('${msg.id}')"
                      class="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-sm">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Formulario para programar o editar un recordatorio
   */
  scheduleNewMessage(editId = null) {
    const editing = editId ? this.scheduledMessages.find(m => m.id === editId) : null;
    const content = document.getElementById('whatsappContent');
    if (!content) return;

    content.innerHTML = `
      <div class="space-y-6">
        <button onclick="window.whatsappUpdater?.showTab('scheduled')" class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">← Volver</button>
        <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${editing ? 'Editar recordatorio' : 'Programar recordatorio'}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Japitin te avisará dentro de la app a la hora elegida para que compongas y envíes el mensaje (necesita la app abierta).</p>

          <form onsubmit="window.whatsappUpdater?.saveScheduledMessage(event, ${editing ? `'${editing.id}'` : 'null'})" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template</label>
              <select name="template" class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                ${Object.entries(this.MESSAGE_TEMPLATES).map(([key, t]) => `
                  <option value="${key}" ${editing?.template === key ? 'selected' : ''}>${t.icon} ${t.name}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha y hora</label>
              <input type="datetime-local" name="scheduledFor" required
                     value="${editing ? editing.scheduledFor.slice(0, 16) : ''}"
                     class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destinatarios</label>
              <select name="recipientGroup" class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                <option value="">Selecciona...</option>
                ${this.contactGroups.map(g => `
                  <option value="${g.id}" ${editing?.recipientGroup === g.id ? 'selected' : ''}>${g.icon} ${g.name}</option>
                `).join('')}
              </select>
            </div>

            <button type="submit" class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all">
              ${editing ? 'Guardar cambios' : 'Programar'}
            </button>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Guarda (crea o edita) un recordatorio y arma su aviso
   */
  saveScheduledMessage(event, editId) {
    event.preventDefault();
    const data = new FormData(event.target);
    const entry = {
      id: editId || `sched_${Date.now()}`,
      template: data.get('template'),
      // Se guarda tal cual el valor local del input datetime-local (sin
      // convertir a UTC) para que el formulario de edición pueda
      // pre-rellenarlo con slice(0, 16) sin desfasarse por zona horaria.
      scheduledFor: data.get('scheduledFor'),
      recipientGroup: data.get('recipientGroup'),
      status: 'pending'
    };

    if (editId) {
      const idx = this.scheduledMessages.findIndex(m => m.id === editId);
      if (idx >= 0) this.scheduledMessages[idx] = entry;
    } else {
      this.scheduledMessages.push(entry);
    }

    this.saveState();
    this.armReminder(entry);

    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    window.Notifications?.show('✅ Recordatorio guardado', 'success');
    this.showTab('scheduled');
  }

  /**
   * Arma los avisos para todos los recordatorios pendientes (al abrir la app)
   */
  scheduleReminders() {
    this.reminderTimers.forEach(t => clearTimeout(t));
    this.reminderTimers = [];
    this.scheduledMessages
      .filter(m => m.status === 'pending')
      .forEach(m => this.armReminder(m));
  }

  /**
   * Arma un único aviso (setTimeout, solo funciona con la app abierta)
   */
  armReminder(entry) {
    const msUntil = new Date(entry.scheduledFor).getTime() - Date.now();
    const MAX_TIMEOUT = 2 ** 31 - 1; // límite máximo de setTimeout en el navegador
    if (msUntil <= 0 || msUntil > MAX_TIMEOUT) return;

    const timer = setTimeout(() => {
      const template = this.MESSAGE_TEMPLATES[entry.template];
      window.Notifications?.show(`🔔 Recordatorio: "${template?.name || 'mensaje'}" listo para enviar`, 'info');
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Japitin', {
          body: `${template?.name || 'Mensaje'} listo para enviar por WhatsApp`,
          icon: '/images/icons/icon-192.png'
        });
      }
    }, msUntil);

    this.reminderTimers.push(timer);
  }

  /**
   * Renderiza tab de templates
   */
  renderTemplatesTab() {
    return `
      <div class="space-y-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">📝 Biblioteca de Templates</h3>

        ${Object.entries(this.MESSAGE_TEMPLATES).map(([key, template]) => `
          <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="text-4xl">${template.icon}</div>
              <div class="flex-1">
                <h4 class="font-bold text-gray-900 dark:text-white">${template.name}</h4>
                <div class="text-sm text-gray-600 dark:text-gray-400">${template.templates.length} variaciones</div>
              </div>
              <button onclick="window.whatsappUpdater?.selectTemplate('${key}')"
                      class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all text-sm">
                Usar →
              </button>
            </div>

            <div class="space-y-2">
              ${template.templates.map((text) => `
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p class="text-gray-700 dark:text-gray-300 text-sm">${text}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Renderiza tab de contactos
   */
  renderContactsTab() {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">👥 Grupos de Contactos</h3>
          <button onclick="window.whatsappUpdater?.addContact()"
                  class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all">
            ➕ Añadir contacto
          </button>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          ${this.contactGroups.map(group => `
            <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="text-4xl">${group.icon}</div>
                <div class="flex-1">
                  <h4 class="font-bold text-gray-900 dark:text-white">${group.name}</h4>
                  <div class="text-sm text-gray-600 dark:text-gray-400">${group.contacts.length} contactos</div>
                </div>
              </div>

              <div class="space-y-2">
                ${group.contacts.map(contact => `
                  <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white text-sm">${contact.name}</div>
                      <div class="text-xs text-gray-600 dark:text-gray-400">${contact.phone}</div>
                    </div>
                    <button onclick="window.whatsappUpdater?.removeContact('${group.id}', '${contact.name}')"
                            class="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded p-1 transition-all">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                `).join('')}

                ${group.contacts.length === 0 ? `
                  <div class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                    No hay contactos en este grupo
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Formulario para añadir un contacto real
   */
  addContact(groupId = null) {
    const content = document.getElementById('whatsappContent');
    if (!content) return;

    content.innerHTML = `
      <div class="space-y-6">
        <button onclick="window.whatsappUpdater?.showTab('contacts')" class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">← Volver</button>
        <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 max-w-md">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">➕ Añadir contacto</h3>
          <form onsubmit="window.whatsappUpdater?.saveContact(event)" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
              <input name="name" type="text" required class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono (con código de país)</label>
              <input name="phone" type="tel" required placeholder="+34612345678"
                     class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grupo</label>
              <select name="groupId" class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                ${this.contactGroups.map(g => `<option value="${g.id}" ${g.id === groupId ? 'selected' : ''}>${g.icon} ${g.name}</option>`).join('')}
              </select>
            </div>
            <button type="submit" class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all">Guardar</button>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Valida y guarda el contacto nuevo
   */
  saveContact(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const phone = data.get('phone').trim();
    const digits = phone.replace(/[^\d]/g, '');

    if (digits.length < 8) {
      window.Notifications?.show('❌ Número de teléfono inválido. Incluye el código de país.', 'error');
      return;
    }

    const group = this.contactGroups.find(g => g.id === data.get('groupId'));
    if (!group) return;

    group.contacts.push({ name: data.get('name').trim(), phone });
    this.saveState();
    window.Notifications?.show('✅ Contacto añadido', 'success');
    this.showTab('contacts');
  }

  /**
   * Renderiza tab de historial
   */
  renderHistoryTab() {
    return `
      <div class="space-y-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">📜 Historial de Mensajes</h3>

        ${this.sentMessages.length > 0 ? `
          <div class="space-y-3">
            ${this.sentMessages.map(msg => {
              const template = this.MESSAGE_TEMPLATES[msg.template] || { icon: '✍️', name: 'Mensaje personalizado' };
              return `
                <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div class="flex items-start gap-4">
                    <div class="text-3xl">${template.icon}</div>
                    <div class="flex-1">
                      <div class="flex items-start justify-between mb-2">
                        <div>
                          <div class="font-medium text-gray-900 dark:text-white">${template.name}</div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">
                            ${new Date(msg.sentAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                        <span class="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs">
                          📤 Abierto en WhatsApp
                        </span>
                      </div>

                      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-2">
                        <p class="text-gray-700 dark:text-gray-300 text-sm">${escapeHTML(msg.message)}</p>
                      </div>

                      <div class="text-xs text-gray-600 dark:text-gray-400">
                        Para: ${msg.recipient}
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="text-6xl mb-4">📜</div>
            <p class="text-gray-600 dark:text-gray-400">No hay mensajes enviados aún</p>
          </div>
        `}
      </div>
    `;
  }

  /**
   * Cambia de tab
   */
  showTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.className = 'px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button';
    });

    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
      activeTab.className = 'px-6 py-3 font-medium border-b-2 border-green-500 text-green-600 dark:text-green-400 tab-button';
    }

    const content = document.getElementById('whatsappContent');
    if (!content) return;

    switch (tabName) {
      case 'quick':
        content.innerHTML = this.renderQuickSendTab();
        break;
      case 'scheduled':
        content.innerHTML = this.renderScheduledTab();
        break;
      case 'templates':
        content.innerHTML = this.renderTemplatesTab();
        break;
      case 'contacts':
        content.innerHTML = this.renderContactsTab();
        break;
      case 'history':
        content.innerHTML = this.renderHistoryTab();
        break;
    }
  }

  /**
   * Rellena un template con variables
   */
  fillTemplate(template, variables) {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return result;
  }

  /**
   * Elimina un recordatorio programado
   */
  deleteScheduled(msgId) {
    if (confirm('¿Eliminar este recordatorio?')) {
      this.scheduledMessages = this.scheduledMessages.filter(m => m.id !== msgId);
      this.saveState();
      this.scheduleReminders();
      this.showTab('scheduled');
    }
  }

  /**
   * Elimina un contacto
   */
  removeContact(groupId, contactName) {
    if (confirm(`¿Eliminar a ${contactName}?`)) {
      const group = this.contactGroups.find(g => g.id === groupId);
      if (group) {
        group.contacts = group.contacts.filter(c => c.name !== contactName);
        this.saveState();
        this.showTab('contacts');
      }
    }
  }

  /**
   * Cierra el updater
   */
  close() {
    if (window.ModalManager) {
      window.ModalManager.closeModal('whatsappUpdaterModal');
    } else {
      document.getElementById('whatsappUpdaterModal')?.remove();
    }
  }
}

// Exportar globalmente
window.WhatsAppUpdater = WhatsAppUpdater;

console.log('✅ WhatsApp Updater loaded');

export default WhatsAppUpdater;
