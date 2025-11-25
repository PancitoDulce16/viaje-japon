// js/claude-assistant.js - Claude AI Assistant para el itinerario

import { auth } from './firebase-init.js';

export const ClaudeAssistant = {
  isOpen: false,
  conversationHistory: [],

  /**
   * Inicializar el asistente
   */
  init() {
    console.log('🤖 Claude Assistant initialized');
  },

  /**
   * Abrir el asistente
   */
  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.renderAssistant();
  },

  /**
   * Cerrar el asistente
   */
  close() {
    const modal = document.getElementById('claudeAssistantModal');
    if (modal) {
      modal.remove();
    }
    this.isOpen = false;
  },

  /**
   * Renderizar UI del asistente
   */
  renderAssistant() {
    const modalHTML = `
      <div id="claudeAssistantModal" class="fixed inset-0 z-[9999999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:w-full sm:max-w-2xl h-[85vh] sm:h-[600px] flex flex-col overflow-hidden">

          <!-- Header -->
          <div class="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span class="text-2xl">🤖</span>
              </div>
              <div>
                <h3 class="font-bold text-lg">Claude Assistant</h3>
                <p class="text-xs text-purple-100">Tu asistente de viaje IA</p>
              </div>
            </div>
            <button onclick="window.ClaudeAssistant.close()" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Messages Container -->
          <div id="assistantMessages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            <!-- Mensaje de bienvenida -->
            <div class="flex gap-3">
              <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white text-sm">🤖</span>
              </div>
              <div class="flex-1">
                <div class="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 shadow-sm">
                  <p class="text-gray-800 dark:text-gray-200">
                    ¡Hola! 👋 Soy tu asistente de viaje IA. Puedo ayudarte con:
                  </p>
                  <ul class="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>✨ Sugerencias de actividades basadas en tu ubicación</li>
                    <li>🗺️ Optimización de rutas para tu día</li>
                    <li>💡 Recomendaciones personalizadas de lugares</li>
                    <li>🕐 Información sobre horarios, costos y cómo llegar</li>
                    <li>🍜 Restaurantes y comida cerca de ti</li>
                  </ul>
                  <p class="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                    ¿En qué puedo ayudarte hoy?
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
            <div class="flex gap-2 flex-nowrap">
              <button onclick="window.ClaudeAssistant.sendQuickMessage('¿Qué lugares recomiendas visitar hoy?')" class="px-3 py-1.5 bg-white dark:bg-gray-700 text-sm rounded-full whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                🗺️ Qué visitar hoy
              </button>
              <button onclick="window.ClaudeAssistant.sendQuickMessage('Optimiza mi ruta de hoy')" class="px-3 py-1.5 bg-white dark:bg-gray-700 text-sm rounded-full whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                ⚡ Optimizar ruta
              </button>
              <button onclick="window.ClaudeAssistant.sendQuickMessage('¿Dónde puedo comer cerca?')" class="px-3 py-1.5 bg-white dark:bg-gray-700 text-sm rounded-full whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                🍜 Restaurantes
              </button>
            </div>
          </div>

          <!-- Input Area -->
          <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <form onsubmit="window.ClaudeAssistant.sendMessage(event)" class="flex gap-2">
              <input
                type="text"
                id="assistantInput"
                placeholder="Escribe tu pregunta..."
                class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white focus:outline-none"
                autocomplete="off"
              />
              <button
                type="submit"
                class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition font-semibold shadow-lg"
              >
                Enviar
              </button>
            </form>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Focus en el input
    setTimeout(() => {
      document.getElementById('assistantInput')?.focus();
    }, 100);
  },

  /**
   * Enviar mensaje rápido (desde botones)
   */
  async sendQuickMessage(message) {
    const input = document.getElementById('assistantInput');
    if (input) {
      input.value = message;
    }
    await this.processMessage(message);
  },

  /**
   * Enviar mensaje desde el form
   */
  async sendMessage(event) {
    event.preventDefault();

    const input = document.getElementById('assistantInput');
    const message = input.value.trim();

    if (!message) return;

    input.value = '';
    await this.processMessage(message);
  },

  /**
   * Procesar y enviar mensaje a Claude
   */
  async processMessage(message) {
    const messagesContainer = document.getElementById('assistantMessages');
    if (!messagesContainer) return;

    // Agregar mensaje del usuario
    this.addUserMessage(message);

    // Agregar indicador de carga
    this.addLoadingMessage();

    try {
      // Obtener contexto del itinerario actual
      const context = this.getCurrentItineraryContext();

      // Obtener token del usuario
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      const token = await user.getIdToken();

      // Llamar a la Firebase Function
      const response = await fetch('https://claudeassistant-e3d6icl2na-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: message,
          context: context
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la respuesta');
      }

      const data = await response.json();

      // Remover indicador de carga
      this.removeLoadingMessage();

      // Agregar respuesta de Claude
      this.addAssistantMessage(data.response);

      // Guardar en historial
      this.conversationHistory.push({
        role: 'user',
        content: message
      }, {
        role: 'assistant',
        content: data.response
      });

    } catch (error) {
      console.error('❌ Error en Claude Assistant:', error);

      this.removeLoadingMessage();
      this.addAssistantMessage(
        `Lo siento, ocurrió un error: ${error.message}. Por favor, intenta de nuevo.`,
        true
      );
    }
  },

  /**
   * Obtener contexto del itinerario actual
   */
  getCurrentItineraryContext() {
    try {
      // Obtener el itinerario actual desde el módulo ItineraryHandler
      const itinerary = window.ItineraryHandler?.currentItinerary;

      if (!itinerary || !itinerary.days) {
        return {
          message: 'No hay itinerario cargado'
        };
      }

      // Obtener día actual seleccionado
      const selectedDate = window.ItineraryHandler?.selectedDate;
      const currentDay = itinerary.days.find(d => d.date === selectedDate);

      return {
        tripInfo: {
          totalDays: itinerary.days.length,
          currentDay: currentDay?.day || 1,
          currentDate: selectedDate
        },
        todayActivities: currentDay ? {
          date: currentDay.date,
          city: currentDay.city,
          activities: currentDay.activities?.map(act => ({
            time: act.time,
            title: act.title || act.activity,
            location: act.location,
            category: act.category
          }))
        } : null,
        allDays: itinerary.days.map(d => ({
          day: d.day,
          date: d.date,
          city: d.city,
          activitiesCount: d.activities?.length || 0
        }))
      };
    } catch (error) {
      console.error('Error obteniendo contexto:', error);
      return {
        message: 'Error obteniendo contexto del itinerario'
      };
    }
  },

  /**
   * Agregar mensaje del usuario
   */
  addUserMessage(message) {
    const messagesContainer = document.getElementById('assistantMessages');
    const messageHTML = `
      <div class="flex gap-3 justify-end">
        <div class="flex-1 flex justify-end">
          <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl rounded-tr-none p-4 shadow-sm max-w-[80%]">
            <p>${this.escapeHtml(message)}</p>
          </div>
        </div>
        <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-sm">👤</span>
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },

  /**
   * Agregar mensaje del asistente
   */
  addAssistantMessage(message, isError = false) {
    const messagesContainer = document.getElementById('assistantMessages');
    const bgClass = isError ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800';
    const textClass = isError ? 'text-red-800 dark:text-red-200' : 'text-gray-800 dark:text-gray-200';

    const messageHTML = `
      <div class="flex gap-3">
        <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-white text-sm">🤖</span>
        </div>
        <div class="flex-1">
          <div class="${bgClass} rounded-2xl rounded-tl-none p-4 shadow-sm">
            <div class="${textClass} whitespace-pre-wrap">${this.formatMarkdown(message)}</div>
          </div>
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },

  /**
   * Agregar indicador de carga
   */
  addLoadingMessage() {
    const messagesContainer = document.getElementById('assistantMessages');
    const loadingHTML = `
      <div id="loadingMessage" class="flex gap-3">
        <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-white text-sm">🤖</span>
        </div>
        <div class="flex-1">
          <div class="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 shadow-sm">
            <div class="flex gap-2">
              <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', loadingHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },

  /**
   * Remover indicador de carga
   */
  removeLoadingMessage() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
      loadingMessage.remove();
    }
  },

  /**
   * Formatear markdown básico
   */
  formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/- (.*?)(?=<br>|$)/g, '• $1');
  },

  /**
   * Escapar HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Exportar globalmente
window.ClaudeAssistant = ClaudeAssistant;

console.log('✅ Claude Assistant module loaded');

export default ClaudeAssistant;
