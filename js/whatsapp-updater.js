/**
 * WhatsApp Trip Updater
 * Sistema para enviar actualizaciones automáticas del viaje por WhatsApp
 */

class WhatsAppUpdater {
  constructor() {
    this.currentTrip = null;
    this.contactGroups = [];
    this.scheduledMessages = [];
    this.messageTemplates = [];
    this.sentMessages = [];

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
          '✅ Update rápido: Estoy bien! Hoy en {location}',
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

    // Grupos de contactos predefinidos
    this.CONTACT_GROUPS = [
      { id: 'family', name: 'Familia', icon: '👨‍👩‍👧‍👦', contacts: [] },
      { id: 'close_friends', name: 'Amigos cercanos', icon: '👯‍♀️', contacts: [] },
      { id: 'work', name: 'Trabajo', icon: '💼', contacts: [] },
      { id: 'all', name: 'Todos', icon: '📢', contacts: [] }
    ];

    this.initMockData();
  }

  /**
   * Inicializa datos mock
   */
  initMockData() {
    // Trip actual mock
    this.currentTrip = {
      startDate: '2025-02-15',
      endDate: '2025-02-24',
      currentDay: 3,
      totalDays: 10,
      currentCity: 'Tokyo'
    };

    // Mensajes programados
    this.scheduledMessages = [
      {
        id: 'sched1',
        template: 'evening_recap',
        scheduledFor: '2025-02-17 20:00',
        recipients: ['family'],
        status: 'pending',
        variables: {
          dayNumber: 3,
          city: 'Tokyo',
          highlights: 'Shibuya, teamLab, mejor ramen ever'
        }
      },
      {
        id: 'sched2',
        template: 'safety_checkin',
        scheduledFor: '2025-02-18 10:00',
        recipients: ['family'],
        status: 'pending',
        variables: {
          city: 'Tokyo',
          dayNumber: 4
        }
      },
      {
        id: 'sched3',
        template: 'daily_highlight',
        scheduledFor: '2025-02-18 18:00',
        recipients: ['close_friends', 'family'],
        status: 'pending',
        variables: {
          city: 'Kyoto',
          activity: 'Fushimi Inari',
          location: 'Kyoto'
        }
      }
    ];

    // Mensajes enviados
    this.sentMessages = [
      {
        id: 'sent1',
        template: 'arrival',
        sentAt: '2025-02-15 08:30',
        recipients: ['family', 'close_friends'],
        message: '✈️ Aterricé en Tokyo! Todo bien, el hotel es increíble 🏨',
        delivered: true
      },
      {
        id: 'sent2',
        template: 'food_find',
        sentAt: '2025-02-15 19:45',
        recipients: ['close_friends'],
        message: '🍜 ALERTA RAMEN: Acabo de probar el mejor ramen de mi vida en Shibuya!',
        delivered: true
      },
      {
        id: 'sent3',
        template: 'evening_recap',
        sentAt: '2025-02-15 22:00',
        recipients: ['family'],
        message: '🌙 Día 1 done! Highlights: Llegada, ramen increíble, primeras impresiones. Buenas noches desde Tokyo!',
        delivered: true
      },
      {
        id: 'sent4',
        template: 'daily_highlight',
        sentAt: '2025-02-16 17:30',
        recipients: ['close_friends'],
        message: '✨ Hoy en Tokyo: Akihabara! Fue increíble 🎉',
        delivered: true
      }
    ];

    // Grupos de contactos con datos
    this.contactGroups = [
      {
        id: 'family',
        name: 'Familia',
        icon: '👨‍👩‍👧‍👦',
        contacts: [
          { name: 'Mamá', phone: '+34 XXX XXX XXX' },
          { name: 'Papá', phone: '+34 XXX XXX XXX' },
          { name: 'Hermana', phone: '+34 XXX XXX XXX' }
        ]
      },
      {
        id: 'close_friends',
        name: 'Amigos cercanos',
        icon: '👯‍♀️',
        contacts: [
          { name: 'Ana', phone: '+34 XXX XXX XXX' },
          { name: 'Carlos', phone: '+34 XXX XXX XXX' },
          { name: 'Laura', phone: '+34 XXX XXX XXX' }
        ]
      },
      {
        id: 'work',
        name: 'Trabajo',
        icon: '💼',
        contacts: [
          { name: 'Jefe', phone: '+34 XXX XXX XXX' }
        ]
      }
    ];
  }

  /**
   * Abre el WhatsApp Updater
   */
  open() {
    const modal = document.createElement('div');
    modal.id = 'whatsappUpdaterModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-strong flex items-center justify-center z-50 p-4 animate-fadeInUp';

    const daysRemaining = Math.ceil((new Date(this.currentTrip.endDate) - new Date()) / (1000 * 60 * 60 * 24));

    modal.innerHTML = `
      <div class="glass-card rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col glow-green hover-lift">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 gradient-animated text-white p-6 relative overflow-hidden">
          <div class="shimmer absolute inset-0"></div>
          <div class="relative z-10">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold mb-2">📱 WhatsApp Trip Updater</h2>
              <p class="text-white/90">Mantén a todos informados automáticamente</p>
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
              <div class="text-2xl font-bold">Día ${this.currentTrip.currentDay}/${this.currentTrip.totalDays}</div>
              <div class="text-sm text-white/80">Progreso</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.sentMessages.length}</div>
              <div class="text-sm text-white/80">Mensajes enviados</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.scheduledMessages.length}</div>
              <div class="text-sm text-white/80">Programados</div>
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
              📅 Programados
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
          <button onclick="window.whatsappUpdater?.quickSend('safety_checkin')"
                  class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 hover:shadow-lg transition-all text-left">
            <div class="text-4xl mb-3">✅</div>
            <div class="font-bold text-gray-900 dark:text-white mb-1">Estoy bien!</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Check-in de seguridad rápido</div>
          </button>

          <button onclick="window.whatsappUpdater?.quickSend('daily_highlight')"
                  class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6 hover:shadow-lg transition-all text-left">
            <div class="text-4xl mb-3">✨</div>
            <div class="font-bold text-gray-900 dark:text-white mb-1">Highlight del día</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Comparte tu momento favorito</div>
          </button>

          <button onclick="window.whatsappUpdater?.quickSend('food_find')"
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
                📤 Enviar ahora
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza tab de mensajes programados
   */
  renderScheduledTab() {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">📅 Mensajes Programados</h3>
          <button onclick="window.whatsappUpdater?.scheduleNewMessage()"
                  class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all">
            ➕ Programar mensaje
          </button>
        </div>

        ${this.scheduledMessages.length > 0 ? `
          <div class="space-y-4">
            ${this.scheduledMessages.map(msg => this.renderScheduledMessage(msg)).join('')}
          </div>
        ` : `
          <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="text-6xl mb-4">📅</div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">No hay mensajes programados</p>
            <button onclick="window.whatsappUpdater?.scheduleNewMessage()"
                    class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all">
              Programar primer mensaje
            </button>
          </div>
        `}
      </div>
    `;
  }

  /**
   * Renderiza un mensaje programado
   */
  renderScheduledMessage(msg) {
    const template = this.MESSAGE_TEMPLATES[msg.template];
    const scheduledDate = new Date(msg.scheduledFor);
    const now = new Date();
    const isPast = scheduledDate < now;

    return `
      <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div class="flex items-start gap-4">
          <div class="text-4xl">${template.icon}</div>
          <div class="flex-1">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h4 class="font-bold text-gray-900 dark:text-white">${template.name}</h4>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Para: ${msg.recipients.map(r => this.contactGroups.find(g => g.id === r)?.name).join(', ')}
                </div>
              </div>
              <span class="px-3 py-1 ${isPast ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'} rounded-full text-xs font-medium">
                ${msg.status === 'pending' ? '⏰ Pendiente' : '✓ Enviado'}
              </span>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
              <p class="text-gray-700 dark:text-gray-300">
                ${this.fillTemplate(template.templates[0], msg.variables)}
              </p>
            </div>

            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                📅 ${scheduledDate.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>

              <div class="flex gap-2">
                <button onclick="window.whatsappUpdater?.editScheduled('${msg.id}')"
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
      </div>
    `;
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
              <button onclick="window.whatsappUpdater?.useTemplate('${key}')"
                      class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all text-sm">
                Usar →
              </button>
            </div>

            <div class="space-y-2">
              ${template.templates.map((text, index) => `
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
   * Renderiza tab de historial
   */
  renderHistoryTab() {
    return `
      <div class="space-y-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">📜 Historial de Mensajes</h3>

        ${this.sentMessages.length > 0 ? `
          <div class="space-y-3">
            ${this.sentMessages.map(msg => {
              const template = this.MESSAGE_TEMPLATES[msg.template];
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
                        <span class="px-2 py-1 ${msg.delivered ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700'} rounded-full text-xs">
                          ${msg.delivered ? '✓✓ Entregado' : '⏳ Enviando'}
                        </span>
                      </div>

                      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-2">
                        <p class="text-gray-700 dark:text-gray-300 text-sm">${msg.message}</p>
                      </div>

                      <div class="text-xs text-gray-600 dark:text-gray-400">
                        Enviado a: ${msg.recipients.map(r => this.contactGroups.find(g => g.id === r)?.name).join(', ')}
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
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.className = 'px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button';
    });

    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
      activeTab.className = 'px-6 py-3 font-medium border-b-2 border-green-500 text-green-600 dark:text-green-400 tab-button';
    }

    // Update content
    const content = document.getElementById('whatsappContent');
    if (!content) return;

    switch(tabName) {
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
   * Envío rápido con template predefinido
   */
  quickSend(templateKey) {
    // TODO: Implementar modal de confirmación y envío
    alert(`Enviando mensaje de tipo: ${this.MESSAGE_TEMPLATES[templateKey].name}`);
  }

  /**
   * Selecciona un template para personalizar
   */
  selectTemplate(templateKey) {
    // TODO: Abrir modal con el template seleccionado y opciones de personalización
    console.log('Selected template:', templateKey);
  }

  /**
   * Usa un template directamente
   */
  useTemplate(templateKey) {
    this.selectTemplate(templateKey);
  }

  /**
   * Envía mensaje personalizado
   */
  sendCustomMessage(event) {
    event.preventDefault();
    // TODO: Implementar envío con API de WhatsApp Business
    alert('✓ Mensaje enviado!');
    event.target.reset();
  }

  /**
   * Programa un nuevo mensaje
   */
  scheduleNewMessage() {
    // TODO: Abrir modal para programar mensaje
    alert('Programar mensaje - Modal coming soon!');
  }

  /**
   * Edita mensaje programado
   */
  editScheduled(msgId) {
    console.log('Edit scheduled:', msgId);
  }

  /**
   * Elimina mensaje programado
   */
  deleteScheduled(msgId) {
    if (confirm('¿Eliminar este mensaje programado?')) {
      this.scheduledMessages = this.scheduledMessages.filter(m => m.id !== msgId);
      this.showTab('scheduled');
    }
  }

  /**
   * Añade un contacto
   */
  addContact() {
    // TODO: Modal para añadir contacto
    alert('Añadir contacto - Modal coming soon!');
  }

  /**
   * Elimina un contacto
   */
  removeContact(groupId, contactName) {
    if (confirm(`¿Eliminar a ${contactName}?`)) {
      const group = this.contactGroups.find(g => g.id === groupId);
      if (group) {
        group.contacts = group.contacts.filter(c => c.name !== contactName);
        this.showTab('contacts');
      }
    }
  }

  /**
   * Cierra el updater
   */
  close() {
    document.getElementById('whatsappUpdaterModal')?.remove();
  }
}

// Exportar globalmente
window.WhatsAppUpdater = WhatsAppUpdater;

console.log('✅ WhatsApp Updater loaded');

export default WhatsAppUpdater;
