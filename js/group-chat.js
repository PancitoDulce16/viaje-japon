// js/group-chat.js - CHAT GRUPAL EN TIEMPO REAL

import { db, auth } from '/js/firebase-config.js';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const GroupChat = {
  messages: [],
  unsubscribe: null,
  isTyping: false,
  typingTimeout: null,

  getCurrentTripId() {
    if (window.TripsManager && window.TripsManager.currentTrip) {
      return window.TripsManager.currentTrip.id;
    }
    return localStorage.getItem('currentTripId');
  },

  init() {
    const tripId = this.getCurrentTripId();
    if (!tripId) {
      this.renderEmptyState();
      return;
    }

    if (!auth.currentUser) {
      this.renderLoginRequired();
      return;
    }

    this.initRealtimeSync();
    this.renderChatUI();
    this.setupEventListeners();
  },

  initRealtimeSync() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const tripId = this.getCurrentTripId();
    if (!tripId || !auth.currentUser) return;

    const messagesRef = collection(db, `trips/${tripId}/chat`);
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(100));

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.messages = [];
      snapshot.forEach((doc) => {
        this.messages.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Ordenar mensajes por tiempo (más antiguos primero para mostrar)
      this.messages.reverse();
      this.renderMessages();

      // Scroll al final
      setTimeout(() => this.scrollToBottom(), 100);
    });
  },

  renderChatUI() {
    const container = document.getElementById('chatModalContent');
    if (!container) return;

    const currentUser = auth.currentUser;
    const tripName = window.TripsManager?.currentTrip?.info?.name || 'Chat del Viaje';

    container.innerHTML = `
      <div class="flex flex-col h-[600px] max-h-[80vh]">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-xl">
          <h3 class="font-bold text-lg">💬 ${tripName}</h3>
          <p class="text-xs text-white/80">Chat grupal en tiempo real</p>
        </div>

        <!-- Messages Container -->
        <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          <!-- Messages will be rendered here -->
        </div>

        <!-- Typing Indicator -->
        <div id="typingIndicator" class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hidden">
          <span class="animate-pulse">● ● ●</span> Alguien está escribiendo...
        </div>

        <!-- Input Area -->
        <div class="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div class="flex gap-2">
            <input
              type="text"
              id="chatInput"
              placeholder="Escribe un mensaje..."
              class="flex-1 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxlength="500"
            >
            <button
              id="sendMessageBtn"
              class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-bold transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </div>
          <div class="flex justify-between items-center mt-2">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              ${currentUser.email.split('@')[0]}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              <span id="messageCount">${this.messages.length}</span> mensajes
            </p>
          </div>
        </div>
      </div>
    `;

    this.renderMessages();
  },

  renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (this.messages.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-6xl mb-3">💬</div>
          <p class="text-gray-500 dark:text-gray-400 font-semibold">No hay mensajes aún</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">¡Sé el primero en escribir!</p>
        </div>
      `;
      return;
    }

    const currentUserId = auth.currentUser?.uid;

    container.innerHTML = this.messages.map((msg, index) => {
      const isCurrentUser = msg.userId === currentUserId;
      const showAvatar = index === 0 || this.messages[index - 1].userId !== msg.userId;
      const username = msg.userName || msg.userEmail?.split('@')[0] || 'Usuario';
      const time = this.formatTime(msg.timestamp);

      return `
        <div class="flex ${isCurrentUser ? 'justify-end' : 'justify-start'} gap-2 animate-fade-in-up">
          ${!isCurrentUser && showAvatar ? `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              ${username.charAt(0).toUpperCase()}
            </div>
          ` : !isCurrentUser ? '<div class="w-8"></div>' : ''}

          <div class="${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]">
            ${showAvatar && !isCurrentUser ? `
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">${username}</p>
            ` : ''}

            <div class="${isCurrentUser
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border dark:border-gray-600'
            } rounded-2xl px-4 py-2 shadow-md">
              <p class="text-sm break-words">${this.escapeHtml(msg.message)}</p>
            </div>

            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 px-2">${time}</p>
          </div>

          ${isCurrentUser && msg.id ? `
            <button
              onclick="GroupChat.deleteMessage('${msg.id}')"
              class="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 text-xs"
              title="Eliminar mensaje"
            >
              🗑️
            </button>
          ` : ''}
        </div>
      `;
    }).join('');

    // Update message count
    const messageCount = document.getElementById('messageCount');
    if (messageCount) {
      messageCount.textContent = this.messages.length;
    }
  },

  setupEventListeners() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');

    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      input.addEventListener('input', () => {
        // Typing indicator logic (podría implementarse con Firebase Realtime Database)
        this.handleTyping();
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }
  },

  async sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    const tripId = this.getCurrentTripId();
    if (!tripId || !auth.currentUser) {
      window.Notifications?.warning('Debes iniciar sesión para enviar mensajes');
      return;
    }

    try {
      const messagesRef = collection(db, `trips/${tripId}/chat`);
      await addDoc(messagesRef, {
        message: message,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      });

      input.value = '';
      window.Notifications?.show('Mensaje enviado', 'success');

    } catch (error) {
      console.error('❌ Error sending message:', error);
      window.Notifications?.error('Error al enviar mensaje');
    }
  },

  async deleteMessage(messageId) {
    const confirmed = await window.Dialogs?.confirm({
      title: '🗑️ ¿Eliminar Mensaje?',
      message: '¿Estás seguro de que deseas eliminar este mensaje?',
      okText: 'Sí, eliminar',
      isDestructive: true
    });

    if (!confirmed) return;

    const tripId = this.getCurrentTripId();
    if (!tripId) return;

    try {
      await deleteDoc(doc(db, `trips/${tripId}/chat`, messageId));
      window.Notifications?.show('Mensaje eliminado', 'success');
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      window.Notifications?.error('Error al eliminar mensaje');
    }
  },

  handleTyping() {
    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Set typing indicator
    this.isTyping = true;

    // Clear after 2 seconds of inactivity
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
    }, 2000);
  },

  scrollToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },

  formatTime(timestamp) {
    if (!timestamp) return '';

    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) {
      return 'Ahora';
    }

    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `Hace ${mins} min`;
    }

    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    }

    // This week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }

    // Older
    return date.toLocaleDateString('es', { month: 'short', day: 'numeric' });
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  renderEmptyState() {
    const container = document.getElementById('chatModalContent');
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4">💬</div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Chat Grupal</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">Para usar el chat, primero debes seleccionar un viaje.</p>
        <button onclick="TripsManager.showTripsListModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
          📂 Ver Mis Viajes
        </button>
      </div>
    `;
  },

  renderLoginRequired() {
    const container = document.getElementById('chatModalContent');
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🔒</div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Inicia Sesión</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">Debes iniciar sesión para usar el chat grupal.</p>
        <button onclick="window.location.href='/'" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
          🔑 Iniciar Sesión
        </button>
      </div>
    `;
  },

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }
};

// Cleanup on auth state change
window.addEventListener('auth:loggedOut', () => {
  GroupChat.cleanup();
});

// Export to window
window.GroupChat = GroupChat;
