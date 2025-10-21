// js/chat.js - Módulo de Chat en Tiempo Real por Viaje

import { db, auth } from './firebase-config.js';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { Notifications } from './notifications.js';

export const ChatHandler = {
  currentTripId: null,
  unsubscribe: null,
  isModalOpen: false,

  init(tripId) {
    this.currentTripId = tripId;
    this.renderChatButton();
  },

  renderChatButton() {
    const container = document.querySelector('.floating-btn-container'); // Necesitamos un contenedor
    if (!container) {
        // Si no existe, lo creamos y añadimos al body
        const btnContainer = document.createElement('div');
        btnContainer.className = 'z-40 fixed bottom-8 right-8 flex flex-col gap-3 stagger-fade-in floating-btn-container';
        document.body.appendChild(btnContainer);
    }

    const chatBtn = `
      <button id="chatBtn" data-tooltip="💬 Chat del Viaje" class="floating-btn ripple bounce-click gpu-accelerated tooltip-success" aria-label="Abrir chat del viaje" style="animation-delay: 0.6s">
        <i class="fas fa-comments"></i>
      </button>
    `;
    document.querySelector('.floating-btn-container').insertAdjacentHTML('beforeend', chatBtn);
    
    document.getElementById('chatBtn').addEventListener('click', () => this.showChatModal());
  },

  showChatModal() {
    if (!this.currentTripId) {
      Notifications.warning('Selecciona un viaje para usar el chat.');
      return;
    }
    this.isModalOpen = true;

    const modalHtml = `
      <div id="chatModal" class="modal active" style="z-index: 10001;">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full h-[80vh] flex flex-col">
          <!-- Header -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <h3 class="text-lg font-bold dark:text-white flex items-center gap-2">
              <i class="fas fa-comments text-blue-500"></i> Chat del Viaje
            </h3>
            <button onclick="ChatHandler.closeChatModal()" class="text-gray-500 hover:text-red-500 transition">✕</button>
          </div>

          <!-- Messages -->
          <div id="chatMessages" class="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
            <!-- Mensajes se renderizan aquí -->
            <p class="text-center text-sm text-gray-400">Cargando mensajes...</p>
          </div>

          <!-- Input -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div class="flex items-center gap-2">
              <input
                id="chatInput"
                type="text"
                placeholder="Escribe un mensaje..."
                class="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <button id="sendChatBtn" class="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('chatModal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    this.listenForMessages();
    this.attachInputListeners();
  },

  closeChatModal() {
    this.isModalOpen = false;
    const modal = document.getElementById('chatModal');
    if (modal) modal.remove();
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  },

  listenForMessages() {
    if (this.unsubscribe) this.unsubscribe();

    const messagesRef = collection(db, `trips/${this.currentTripId}/chat`);
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      this.renderMessages(messages);
    }, (error) => {
      console.error("Error escuchando mensajes:", error);
      Notifications.error("No se pudo cargar el chat.");
    });
  },

  renderMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (messages.length === 0) {
      container.innerHTML = '<p class="text-center text-sm text-gray-400 my-auto">Sé el primero en enviar un mensaje. ¡Hola! 👋</p>';
      return;
    }

    const currentUserId = auth.currentUser?.uid;

    container.innerHTML = messages.map(msg => {
      const isMe = msg.uid === currentUserId;
      const timestamp = msg.createdAt?.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) || '';
      
      return `
        <div class="flex ${isMe ? 'justify-end' : 'justify-start'} mb-3">
          <div class="max-w-xs lg:max-w-md">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 ${isMe ? 'text-right' : 'text-left'}">
              ${msg.author.split('@')[0]} <span class="ml-1">${timestamp}</span>
            </div>
            <div class="${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'} p-3 rounded-lg">
              <p class="text-sm">${this.escapeHtml(msg.text)}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  attachInputListeners() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');

    if (input && sendBtn) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
      sendBtn.addEventListener('click', () => this.sendMessage());
    }
  },

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();

    if (!text) return;

    const { uid, email } = auth.currentUser;

    try {
      const messagesRef = collection(db, `trips/${this.currentTripId}/chat`);
      await addDoc(messagesRef, {
        text: text,
        createdAt: serverTimestamp(),
        uid: uid,
        author: email
      });

      input.value = '';
      input.focus();
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      Notifications.error("No se pudo enviar el mensaje.");
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  reinitialize(tripId) {
    this.currentTripId = tripId;
    if (this.isModalOpen) {
      this.listenForMessages();
    }
  }
};

window.ChatHandler = ChatHandler;

window.addEventListener('auth:initialized', () => {
    const tripId = localStorage.getItem('currentTripId');
    if (tripId) {
        ChatHandler.init(tripId);
    }
});

window.addEventListener('auth:loggedOut', () => {
    if (ChatHandler.unsubscribe) ChatHandler.unsubscribe();
    const chatBtn = document.getElementById('chatBtn');
    if(chatBtn) chatBtn.remove();
});