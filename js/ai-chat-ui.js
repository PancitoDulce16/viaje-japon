/**
 * 💬 AI CHAT UI - Interface for Conversational AI
 * ===============================================
 *
 * Beautiful chat interface to talk with the AI.
 *
 * Features:
 * - Floating chat button
 * - Full chat panel with history
 * - Typing indicators
 * - Quick suggestions
 * - Feedback buttons (thumbs up/down)
 * - Action execution
 * - Voice input (future)
 */

class AIChatUI {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isTyping = false;

    this.init();
  }

  init() {
    // Create chat button
    this.createChatButton();

    // Create chat panel
    this.createChatPanel();

    // Setup event listeners
    this.setupEventListeners();

    console.log('💬 AI Chat UI initialized');
  }

  /**
   * 🔘 Create floating chat button
   */
  createChatButton() {
    const button = document.createElement('button');
    button.id = 'ai-chat-button';
    button.className = 'fixed bottom-6 right-6 z-[999] w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center text-white text-2xl hover:scale-110';
    button.innerHTML = '🤖';
    button.title = 'Habla con la IA';

    // Add to DOM
    document.body.appendChild(button);

    this.chatButton = button;
  }

  /**
   * 💬 Create chat panel
   */
  createChatPanel() {
    const panel = document.createElement('div');
    panel.id = 'ai-chat-panel';
    panel.className = 'fixed bottom-24 right-6 z-[998] w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hidden flex-col overflow-hidden border-2 border-purple-300 dark:border-purple-700';

    panel.innerHTML = `
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🤖</span>
          <div>
            <div class="font-bold">AI Assistant</div>
            <div class="text-xs text-purple-100">Powered by ML Brain</div>
          </div>
        </div>
        <button id="ai-chat-close" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Messages Container -->
      <div id="ai-chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        <div class="ai-message">
          <div class="flex items-start gap-2">
            <span class="text-2xl">🤖</span>
            <div class="flex-1 bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
              <p class="text-gray-900 dark:text-white">¡Hola! Soy tu asistente de viajes. Puedo ayudarte a optimizar tu itinerario, agregar actividades, ajustar presupuesto y más.</p>
              <p class="text-gray-600 dark:text-gray-400 text-sm mt-2">¿En qué te puedo ayudar hoy?</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Suggestions -->
      <div id="ai-chat-suggestions" class="px-4 py-2 bg-gray-100 dark:bg-gray-800 flex flex-wrap gap-2 hidden">
      </div>

      <!-- Typing Indicator -->
      <div id="ai-typing-indicator" class="px-4 py-2 hidden">
        <div class="flex items-center gap-2 text-gray-500">
          <span class="text-xl">🤖</span>
          <div class="flex gap-1">
            <span class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </div>
          <span class="text-sm">AI está pensando...</span>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="flex gap-2">
          <input
            type="text"
            id="ai-chat-input"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            placeholder="Escribe tu mensaje..."
          />
          <button
            id="ai-chat-send"
            class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
          >
            Enviar
          </button>
        </div>
        <div class="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <span>💡 Prueba: "Agrega más templos" o "Hazlo más barato"</span>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.chatPanel = panel;
  }

  /**
   * 🎯 Setup event listeners
   */
  setupEventListeners() {
    // Toggle chat panel
    this.chatButton.addEventListener('click', () => this.toggleChat());

    // Close button
    document.getElementById('ai-chat-close').addEventListener('click', () => this.toggleChat());

    // Send message
    document.getElementById('ai-chat-send').addEventListener('click', () => this.sendMessage());

    // Enter key to send
    document.getElementById('ai-chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  /**
   * 🔄 Toggle chat panel
   */
  toggleChat() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.chatPanel.classList.remove('hidden');
      this.chatPanel.classList.add('flex');
      document.getElementById('ai-chat-input').focus();

      // Track opening
      if (window.GamificationSystem) {
        window.GamificationSystem.trackAction('aiChatOpened', 1);
      }
    } else {
      this.chatPanel.classList.add('hidden');
      this.chatPanel.classList.remove('flex');
    }
  }

  /**
   * 📤 Send user message
   */
  async sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Clear input
    input.value = '';

    // Add user message to UI
    this.addMessage('user', message);

    // Show typing indicator
    this.showTyping();

    try {
      // Send to Conversational AI
      const response = await window.ConversationalAI.chat(message, {
        itinerary: window.currentTrip?.itinerary,
        userProfile: window.MLBrain?.userProfile
      });

      // Hide typing indicator
      this.hideTyping();

      // Add AI response
      this.addMessage('ai', response.text, {
        suggestions: response.suggestions,
        actions: response.actions,
        confidence: response.confidence,
        insights: response.insights
      });

      // Track interaction
      if (window.GamificationSystem) {
        window.GamificationSystem.trackAction('aiMessagesExchanged', 1);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      this.hideTyping();
      this.addMessage('ai', 'Lo siento, tuve un problema procesando tu mensaje. ¿Podrías intentarlo de nuevo?');
    }
  }

  /**
   * 💬 Add message to chat
   */
  addMessage(type, text, options = {}) {
    const container = document.getElementById('ai-chat-messages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;

    if (type === 'user') {
      messageDiv.innerHTML = `
        <div class="flex items-start gap-2 justify-end">
          <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-3 shadow max-w-[80%]">
            <p>${this.escapeHtml(text)}</p>
          </div>
          <span class="text-2xl">👤</span>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="flex items-start gap-2">
          <span class="text-2xl">🤖</span>
          <div class="flex-1">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow max-w-[90%]">
              <p class="text-gray-900 dark:text-white whitespace-pre-line">${this.formatText(text)}</p>
              ${options.confidence !== undefined ? `
                <div class="mt-2 flex items-center gap-2 text-xs">
                  <span class="text-gray-500">Confianza:</span>
                  <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="bg-purple-500 h-2 rounded-full" style="width: ${options.confidence * 100}%"></div>
                  </div>
                  <span class="font-semibold ${options.confidence >= 0.7 ? 'text-green-600' : 'text-yellow-600'}">
                    ${(options.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ` : ''}
            </div>

            ${options.actions && options.actions.length > 0 ? `
              <div class="mt-2 flex flex-wrap gap-2">
                ${options.actions.map((action, i) => `
                  <button
                    onclick="window.AIChatUI.executeAction(${i}, ${JSON.stringify(action).replace(/"/g, '&quot;')})"
                    class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
                  >
                    ✨ ${this.actionToText(action)}
                  </button>
                `).join('')}
              </div>
            ` : ''}

            ${options.suggestions && options.suggestions.length > 0 ? `
              <div class="mt-2 flex flex-wrap gap-2">
                ${options.suggestions.map(sug => `
                  <button
                    onclick="window.AIChatUI.clickSuggestion('${this.escapeHtml(sug.text)}')"
                    class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    ${this.escapeHtml(sug.text)}
                  </button>
                `).join('')}
              </div>
            ` : ''}

            <div class="mt-2 flex gap-2">
              <button
                onclick="window.AIChatUI.giveFeedback('thumbs_up', ${this.messages.length})"
                class="text-gray-400 hover:text-green-500 transition"
                title="Útil"
              >
                👍
              </button>
              <button
                onclick="window.AIChatUI.giveFeedback('thumbs_down', ${this.messages.length})"
                class="text-gray-400 hover:text-red-500 transition"
                title="No útil"
              >
                👎
              </button>
            </div>
          </div>
        </div>
      `;
    }

    container.appendChild(messageDiv);

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;

    // Store message
    this.messages.push({
      type,
      text,
      options,
      timestamp: Date.now()
    });
  }

  /**
   * ⌨️ Show typing indicator
   */
  showTyping() {
    this.isTyping = true;
    document.getElementById('ai-typing-indicator').classList.remove('hidden');

    // Scroll to bottom
    const container = document.getElementById('ai-chat-messages');
    container.scrollTop = container.scrollHeight;
  }

  /**
   * ⌨️ Hide typing indicator
   */
  hideTyping() {
    this.isTyping = false;
    document.getElementById('ai-typing-indicator').classList.add('hidden');
  }

  /**
   * 🎯 Execute AI action
   */
  async executeAction(index, action) {
    console.log('Executing action:', action);

    try {
      const result = await window.ConversationalAI.executeAction(action);

      if (result.success) {
        this.addMessage('ai', `✅ ${result.message}`);

        // Record positive feedback
        await window.ConversationalAI.recordFeedback('accept', {
          metrics: result.changes
        });

        // Refresh current trip if needed
        if (window.currentTrip && window.TripsManager) {
          // Trigger reload
          console.log('Itinerary updated');
        }
      } else {
        this.addMessage('ai', `⚠️ ${result.message || 'No pude completar la acción'}`);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      this.addMessage('ai', '❌ Hubo un error ejecutando la acción.');
    }
  }

  /**
   * 💬 Click suggestion
   */
  clickSuggestion(text) {
    const input = document.getElementById('ai-chat-input');
    input.value = text;
    input.focus();
  }

  /**
   * 👍 Give feedback
   */
  async giveFeedback(type, messageIndex) {
    console.log(`Feedback: ${type} on message ${messageIndex}`);

    try {
      await window.ConversationalAI.recordFeedback(type);

      // Show confirmation
      const emoji = type === 'thumbs_up' ? '✅' : '📝';
      const text = type === 'thumbs_up' ? 'Gracias por tu feedback positivo!' : 'Gracias, voy a mejorar.';

      this.addMessage('ai', `${emoji} ${text}`);

    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  }

  /**
   * 🔧 Convert action to readable text
   */
  actionToText(action) {
    const texts = {
      'add_activity': `Agregar ${action.category || 'actividad'}`,
      'remove_activity': `Quitar ${action.category || 'actividad'}`,
      'adjust_budget': `${action.direction === 'reduce' ? 'Reducir' : 'Aumentar'} presupuesto`,
      'change_pace': `Cambiar a ${action.pace}`,
      'optimize_routes': 'Optimizar rutas',
      'regenerate_day': `Regenerar día ${action.day || ''}`
    };

    return texts[action.type] || action.type;
  }

  /**
   * 🎨 Format text (markdown-like)
   */
  formatText(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // **bold**
      .replace(/\*(.+?)\*/g, '<em>$1</em>') // *italic*
      .replace(/`(.+?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">$1</code>') // `code`
      .replace(/\n/g, '<br>'); // newlines
  }

  /**
   * 🛡️ Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize on DOM load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.AIChatUI = new AIChatUI();
    console.log('💬 AI Chat UI ready!');
  });
}
