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
  userColors: new Map(), // Cache de colores por usuario

  // Paleta de colores vibrantes para cada usuario
  colorPalette: [
    { bg: 'from-purple-500 to-purple-700', avatar: 'from-purple-400 to-purple-600', text: 'text-white' },
    { bg: 'from-pink-500 to-pink-700', avatar: 'from-pink-400 to-pink-600', text: 'text-white' },
    { bg: 'from-blue-500 to-blue-700', avatar: 'from-blue-400 to-blue-600', text: 'text-white' },
    { bg: 'from-green-500 to-green-700', avatar: 'from-green-400 to-green-600', text: 'text-white' },
    { bg: 'from-orange-500 to-orange-700', avatar: 'from-orange-400 to-orange-600', text: 'text-white' },
    { bg: 'from-teal-500 to-teal-700', avatar: 'from-teal-400 to-teal-600', text: 'text-white' },
    { bg: 'from-indigo-500 to-indigo-700', avatar: 'from-indigo-400 to-indigo-600', text: 'text-white' },
    { bg: 'from-rose-500 to-rose-700', avatar: 'from-rose-400 to-rose-600', text: 'text-white' },
    { bg: 'from-cyan-500 to-cyan-700', avatar: 'from-cyan-400 to-cyan-600', text: 'text-white' },
    { bg: 'from-amber-500 to-amber-700', avatar: 'from-amber-400 to-amber-600', text: 'text-white' },
  ],

  // Obtener color consistente para un usuario
  getUserColor(userId, isCurrentUser = false) {
    // Usuario actual siempre tiene gradiente especial púrpura-rosa
    if (isCurrentUser) {
      return {
        bg: 'from-purple-600 via-pink-600 to-purple-600',
        avatar: 'from-purple-500 to-pink-500',
        text: 'text-white'
      };
    }

    // Si ya tiene color asignado, reutilizar
    if (this.userColors.has(userId)) {
      return this.userColors.get(userId);
    }

    // Asignar nuevo color basado en hash del userId
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = hash % this.colorPalette.length;
    const color = this.colorPalette[colorIndex];

    this.userColors.set(userId, color);
    return color;
  },

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
        <div class="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-5 rounded-t-xl shadow-lg relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div class="relative z-10">
            <h3 class="font-bold text-lg flex items-center gap-2">
              <span class="text-2xl animate-bounce-slow">💬</span>
              <span>${tripName}</span>
            </h3>
            <p class="text-xs text-white/90 mt-1 flex items-center gap-2">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Chat grupal en tiempo real
            </p>
          </div>
        </div>

        <!-- Messages Container -->
        <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-900 dark:to-purple-900/10">
          <!-- Messages will be rendered here -->
        </div>

        <!-- Typing Indicator -->
        <div id="typingIndicator" class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hidden">
          <span class="inline-flex gap-1">
            <span class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </span>
          <span class="ml-2">Alguien está escribiendo...</span>
        </div>

        <!-- Input Area -->
        <div class="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-lg">
          <div class="flex gap-2">
            <input
              type="text"
              id="chatInput"
              placeholder="Escribe un mensaje... 💭"
              class="flex-1 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-gray-400"
              maxlength="500"
            >
            <button
              id="sendMessageBtn"
              class="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="text-xl">➤</span>
            </button>
          </div>
          <div class="flex justify-between items-center mt-3 px-1">
            <p class="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <span>👤</span>
              ${currentUser.email.split('@')[0]}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span>💬</span>
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
          <div class="text-6xl mb-3 animate-bounce-slow">💬</div>
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

      // Obtener colores para este usuario
      const userColor = this.getUserColor(msg.userId, isCurrentUser);

      return `
        <div class="flex ${isCurrentUser ? 'justify-end' : 'justify-start'} gap-2 animate-fade-in-up group">
          ${!isCurrentUser && showAvatar ? `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br ${userColor.avatar} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg ring-2 ring-white dark:ring-gray-800 transform hover:scale-110 transition-transform">
              ${username.charAt(0).toUpperCase()}
            </div>
          ` : !isCurrentUser ? '<div class="w-8"></div>' : ''}

          <div class="${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]">
            ${showAvatar && !isCurrentUser ? `
              <p class="text-xs font-semibold mb-1 px-2 bg-gradient-to-r ${userColor.avatar} bg-clip-text text-transparent">${username}</p>
            ` : ''}

            <div class="bg-gradient-to-r ${userColor.bg} ${userColor.text} rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
              <p class="text-sm break-words leading-relaxed">${this.escapeHtml(msg.message)}</p>
            </div>

            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 px-2 font-medium">${time}</p>
          </div>

          ${isCurrentUser && msg.id ? `
            <button
              onclick="GroupChat.deleteMessage('${msg.id}')"
              class="text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 text-xs transform hover:scale-110"
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
