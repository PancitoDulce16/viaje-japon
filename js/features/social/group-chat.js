// js/group-chat.js - CHAT GRUPAL EN TIEMPO REAL

import { db, auth } from '../../core/firebase-config.js';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc
} from 'firebase/firestore';

export const GroupChat = {
  messages: [],
  unsubscribe: null,
  unsubscribePins: null,
  unsubscribeTyping: null,
  pinnedMessageIds: [],
  replyingTo: null,
  typingUsers: [],
  unreadMessageIds: new Set(),
  lastReadAt: 0,
  muted: false,
  hiddenMessageIds: new Set(),
  isTyping: false,
  typingTimeout: null,
  userColors: new Map(), // Cache de colores por usuario

  // Tipos de papel por interlocutor. Cada mensaje es un objeto físico —
  // una notita, un ticket, una postal — no una burbuja de messenger
  // (referencia oficial: Desktop/Nueva carpeta → "Japitin chat ref.webp").
  // El estilo se resuelve en CSS vía [data-paper]; aquí solo se asigna,
  // para que la paleta viva en un único sitio (css/chat-washi.css).
  paperTones: ['sakura', 'sora', 'matcha', 'yuzu', 'fuji', 'kraft'],

  // Papel consistente para un usuario (mismo interlocutor = mismo papel
  // siempre, para poder reconocerlo de un vistazo sin leer el nombre).
  getUserColor(userId, isCurrentUser = false) {
    if (isCurrentUser) return { paper: 'mine' };

    if (this.userColors.has(userId)) {
      return this.userColors.get(userId);
    }

    // Hash estable del userId → tono de papel
    const hash = String(userId || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const tone = { paper: this.paperTones[hash % this.paperTones.length] };

    this.userColors.set(userId, tone);
    return tone;
  },

  getCurrentTripId() {
    if (window.TripsManager && window.TripsManager.currentTrip) {
      return window.TripsManager.currentTrip.id;
    }
    return localStorage.getItem('currentTripId');
  },

  /**
   * 🆕 Abre el modal de chat (#modal-chat, definido en modals.js pero nunca
   * mostrado por nadie - GroupChat.init() no tenía ningún trigger real en
   * toda la app, era código completamente muerto pese a ser la implementación
   * más completa de las dos que existían).
   */
  open() {
    const modal = document.getElementById('modal-chat');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.init();
  },

  /**
   * 🆕 Cierra el modal y desuscribe el listener de Firestore.
   */
  close() {
    const modal = document.getElementById('modal-chat');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
    this.markAsRead();
    this.cleanup();
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

    this.loadChatPreferences();
    this.initRealtimeSync();
    this.initPinsSync();
    this.initTypingSync();
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
          pending: doc.metadata.hasPendingWrites,
          ...doc.data()
        });
      });

      // Ordenar mensajes por tiempo (más antiguos primero para mostrar)
      this.messages.reverse();
      this.unreadMessageIds = new Set(this.messages.filter(message =>
        (message.userId ?? message.uid) !== auth.currentUser?.uid && this.timestampMillis(message.timestamp ?? message.createdAt) > this.lastReadAt
      ).map(message => message.id));
      this.renderMessages();

      setTimeout(() => this.unreadMessageIds.size ? this.scrollToMessage([...this.unreadMessageIds][0]) : this.scrollToBottom(), 100);
    });
  },

  renderChatUI() {
    const container = document.getElementById('chatModalContent');
    if (!container) return;

    const currentUser = auth.currentUser;
    const tripName = window.TripsManager?.currentTrip?.info?.name || 'Chat del Viaje';

    const me = (currentUser.displayName || currentUser.email.split('@')[0] || 'Tú').split(/[\s._-]+/)[0];

    const participantNames = [...new Set(this.messages.map(message =>
      message.userName || message.userEmail?.split('@')[0]
    ).filter(Boolean))].slice(0, 5);

    container.innerHTML = `
      <div class="jc-app">
        <aside class="jc-threads" id="chatThreads" aria-label="Conversaciones">
          <div class="jc-threads__head">
            <div><span class="jc-kicker">LIBRETA DE VIAJE</span><h2>Chats</h2></div>
            <button class="jc-iconbtn" type="button" onclick="GroupChat.focusComposer()" aria-label="Nuevo mensaje">＋</button>
          </div>
          <label class="jc-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" id="chatSearch" placeholder="Buscar mensajes" aria-label="Buscar mensajes">
          </label>
          <button class="jc-thread-card jc-thread-card--active" type="button">
            <img src="/images/illustrations/generated/companions/dog-explorer.png" alt="" aria-hidden="true">
            <span><b>${this.escapeHtml(tripName)}</b><small>${this.messages.length ? `${this.messages.length} mensajes` : 'Empieza la conversación'}</small></span>
            <time>ahora</time>
          </button>
          <div class="jc-thread-card jc-thread-card--tip">
            <img src="/images/illustrations/generated/characters/cat-thinking.webp" alt="" aria-hidden="true">
            <span><b>Tip Japitin</b><small>Guarda aquí acuerdos, reservas y recuerdos.</small></span>
          </div>
          <div class="jc-threads__foot"><span aria-hidden="true">文</span> Todo queda unido al viaje actual</div>
        </aside>

        <main class="jc-chat">
        <!-- Cabecera: el gato sostiene el hilo del viaje -->
        <div class="jc-head">
          <button class="jc-iconbtn jc-sidebar-toggle" type="button" id="chatSidebarToggle" aria-label="Mostrar conversaciones">☰</button>
          <img class="jc-head__cat" src="/images/illustrations/generated/characters/cat-explorer.webp"
               alt="" aria-hidden="true" loading="eager" width="52">
          <div class="jc-head__text">
            <h3>${this.escapeHtml(tripName)}</h3>
            <p><span class="jc-live" aria-hidden="true"></span> ${Math.max(participantNames.length, 1)} viajero${participantNames.length === 1 ? '' : 's'} · en tiempo real</p>
            <div class="jc-members" aria-label="Participantes">
              ${(participantNames.length ? participantNames : [me]).map((name, index) => `<span style="--i:${index}" title="${this.escapeHtml(name)}">${this.escapeHtml(name.charAt(0).toUpperCase())}</span>`).join('')}
            </div>
          </div>
          <button class="jc-iconbtn" id="chatMuteBtn" type="button" onclick="GroupChat.toggleMute()" aria-label="Silenciar chat">${this.muted ? '🔕' : '🔔'}</button>
          <button class="jc-iconbtn" type="button" onclick="GroupChat.scrollToBottom()" aria-label="Ir al mensaje más reciente">↓</button>
          <span class="jc-head__stamp" aria-hidden="true"><i>文</i></span>
        </div>

        <div id="chatPinnedBar" class="jc-pins" hidden></div>

        <!-- Hilo de mensajes: hoja de cuaderno -->
        <div id="chatMessages" class="jc-thread">
          <!-- Messages will be rendered here -->
        </div>

        <!-- Alguien escribiendo -->
        <div id="typingIndicator" class="jc-typing hidden">
          <span class="jc-typing__dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span>Alguien está escribiendo…</span>
        </div>

        <!-- Caja de mensaje: hoja en blanco sujeta con un clip -->
        <div class="jc-compose">
          <div id="chatReplyPreview" class="jc-reply-preview" hidden></div>
          <div class="jc-compose__row">
            <button type="button" class="jc-tool jc-tool--plus" onclick="GroupChat.toggleToolTray()" aria-label="Abrir herramientas" aria-expanded="false">＋</button>
            <div id="chatToolTray" class="jc-tooltray" hidden>
              <button type="button" class="jc-tool" id="chatEmojiBtn" aria-label="Agregar flor de sakura"><span>🌸</span><small>Sakura</small></button>
              <button type="button" class="jc-tool" onclick="GroupChat.toggleStickerPicker()" aria-label="Abrir stickers"><span>🐾</span><small>Sticker</small></button>
              <button type="button" class="jc-tool" onclick="GroupChat.sharePhoto()" aria-label="Compartir foto"><span>📷</span><small>Foto</small></button>
              <button type="button" class="jc-tool" onclick="GroupChat.shareAttachment()" aria-label="Adjuntar archivo o audio"><span>📎</span><small>Adjunto</small></button>
              <button type="button" class="jc-tool" onclick="GroupChat.createQuickPoll()" aria-label="Crear encuesta"><span>📊</span><small>Encuesta</small></button>
            </div>
            <input
              type="text"
              id="chatInput"
              placeholder="Escribe un mensaje…"
              class="jc-input"
              maxlength="500"
              aria-label="Escribe un mensaje"
            >
            <button id="sendMessageBtn" class="jc-send" aria-label="Enviar mensaje">
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
          <div id="chatStickerPicker" class="jc-sticker-picker" hidden>
            <div><b>Stickers Japitin</b><small>猫と柴 · neko & shiba</small></div>
            <div class="jc-sticker-grid">${['Amor','Risa','Sorpresa','Fiesta','Ramen','Mapa','Sueño','Foto','Hola'].map((label, index) => `<button type="button" onclick="GroupChat.sendSticker(${index}, '${label}')" aria-label="Enviar sticker ${label}"><i style="--sx:${index % 3};--sy:${Math.floor(index / 3)}"></i></button>`).join('')}</div>
          </div>
          <div class="jc-compose__meta">
            <span class="jc-me">${this.escapeHtml(me)}</span>
            <span id="chatConnectionState">● conectado</span>
            <span><b id="messageCount">${this.messages.length}</b> mensajes</span>
          </div>
        </div>
        </main>

        <aside class="jc-guide" aria-label="Guía del chat">
          <div class="jc-guide__title"><span>✿</span><h3>Tu chat Japitin</h3></div>
          <div class="jc-guide__card"><b>Notas de viaje</b><p>Cada mensaje se guarda como una pieza de tu diario.</p></div>
          <div class="jc-guide__card"><b>Reacciones kawaii</b><p>Marca acuerdos y momentos favoritos con corazones o sakura.</p></div>
          <div class="jc-guide__card"><b>Modo noche</b><p>El papel se transforma en una libreta iluminada por faroles.</p></div>
          <img class="jc-guide__mascot" src="/images/illustrations/generated/characters/dog-sleeping.webp" alt="Perrito Japitin descansando">
          <p class="jc-guide__tip">Tip: usa el chat para anotar reservas, puntos de encuentro y pequeños recuerdos.</p>
        </aside>
      </div>
    `;

    this.renderMessages();
    this.renderPinnedBar();
    this.renderReplyPreview();
  },

  renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (this.messages.length === 0) {
      // Vacío = una hoja en blanco esperando, no un icono gigante centrado
      container.innerHTML = `
        <div class="jc-empty">
          <img src="/images/illustrations/generated/characters/dog-hello.webp"
               alt="" aria-hidden="true" loading="eager" width="96">
          <p class="jc-empty__title">La libreta está en blanco</p>
          <p class="jc-empty__sub">Escribe lo primero y empieza el hilo del viaje.</p>
        </div>
      `;
      return;
    }

    const currentUserId = auth.currentUser?.uid;

    // 🔧 Antes había DOS implementaciones de chat separadas escribiendo en la misma
    // colección Firestore (trips/{tripId}/chat) con esquemas de campo distintos -
    // ChatHandler (chat.js, ahora retirado) usaba {text, createdAt, uid, author} y
    // este módulo usa {message, timestamp, userId, userEmail, userName}. Si alguien
    // ya mandó mensajes con el esquema viejo, se leen acá con fallback en vez de
    // desaparecer o mostrarse en blanco.
    const normalized = this.messages.map(msg => ({
      ...msg,
      message: msg.message ?? msg.text ?? '',
      userId: msg.userId ?? msg.uid ?? null,
      userEmail: msg.userEmail ?? msg.author ?? null,
      userName: msg.userName ?? (msg.author ? msg.author.split('@')[0] : null),
      timestamp: msg.timestamp ?? msg.createdAt ?? null
    }));

    const visible = normalized.filter(message => !this.hiddenMessageIds.has(message.id));

    container.innerHTML = visible.map((msg, index) => {
      const isCurrentUser = msg.userId === currentUserId;
      const showAvatar = index === 0 || visible[index - 1].userId !== msg.userId;
      const username = msg.userName || msg.userEmail?.split('@')[0] || 'Usuario';
      const time = this.formatTime(msg.timestamp);

      // Obtener colores para este usuario
      const userColor = this.getUserColor(msg.userId, isCurrentUser);

      // Rotación estable por índice: el hilo se ve como papeles pegados a
      // mano, no como una lista alineada. Determinista para que un mensaje
      // no "salte" de ángulo en cada re-render del listener de Firestore.
      const tilt = [-1.1, 0.8, -0.5, 1.3, -0.9][index % 5];

      const previousDate = index ? this.dateKey(visible[index - 1].timestamp) : '';
      const currentDate = this.dateKey(msg.timestamp);
      const dateSeparator = currentDate !== previousDate ? `<div class="jc-date-separator"><span>${this.formatDateLabel(msg.timestamp)}</span></div>` : '';
      const unreadSeparator = this.unreadMessageIds.has(msg.id) && !visible.slice(0, index).some(item => this.unreadMessageIds.has(item.id)) ? `<div class="jc-unread-separator"><span>${this.unreadMessageIds.size} mensaje${this.unreadMessageIds.size === 1 ? '' : 's'} sin leer</span></div>` : '';

      return `${dateSeparator}${unreadSeparator}
        <div class="jc-msg ${isCurrentUser ? 'jc-msg--mine' : ''} ${this.pinnedMessageIds.includes(msg.id) ? 'jc-msg--pinned' : ''}" data-message-id="${msg.id || ''}" data-paper="${userColor.paper}">
          ${!isCurrentUser ? (showAvatar ? `
            <span class="jc-avatar" aria-hidden="true">${this.escapeHtml(username.charAt(0).toUpperCase())}</span>
          ` : '<span class="jc-avatar jc-avatar--ghost" aria-hidden="true"></span>') : ''}

          <div class="jc-msg__col">
            ${showAvatar ? `<p class="jc-msg__who">${this.escapeHtml(username)}</p>` : ''}

            <div class="jc-note" style="--tilt:${tilt}deg">
              ${msg.replyTo?.message ? `<button class="jc-reply-quote" type="button" onclick="GroupChat.scrollToMessage('${this.escapeHtml(msg.replyTo.id || '')}')"><b>↩ ${this.escapeHtml(msg.replyTo.userName || 'Mensaje')}</b><span>${this.escapeHtml(msg.replyTo.message)}</span></button>` : ''}
              ${Number.isInteger(msg.stickerIndex) ? '' : `<p class="jc-note__text">${this.formatMessage(msg.message)}</p>`}
              ${Number.isInteger(msg.stickerIndex) ? `<div class="jc-post-sticker"><i style="--sx:${msg.stickerIndex % 3};--sy:${Math.floor(msg.stickerIndex / 3)}"></i></div>` : ''}
              ${this.safeImageUrl(msg.imageUrl || msg.photoURL) ? `<figure class="jc-polaroid"><img src="${this.safeImageUrl(msg.imageUrl || msg.photoURL)}" alt="Foto compartida" loading="lazy"></figure>` : ''}
              ${this.safeMediaUrl(msg.audioUrl) ? `<audio class="jc-audio" controls preload="metadata" src="${this.safeMediaUrl(msg.audioUrl)}"></audio>` : ''}
              ${this.safeMediaUrl(msg.fileUrl) ? `<a class="jc-file" href="${this.safeMediaUrl(msg.fileUrl)}" target="_blank" rel="noopener">📎 ${this.escapeHtml(msg.fileName || 'Abrir archivo')}</a>` : ''}
              ${msg.poll?.question ? this.renderPoll(msg) : ''}
              <span class="jc-note__time">${msg.pending ? '◷ enviando' : `✓ ${msg.editedAt ? 'editado · ' : ''}${time}`}</span>
              ${isCurrentUser && msg.id ? `
                <button
                  onclick="GroupChat.deleteMessage('${msg.id}')"
                  class="jc-note__del"
                  aria-label="Eliminar mensaje"
                  title="Eliminar mensaje"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
                       stroke-width="2" stroke-linecap="round" aria-hidden="true">
                    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>
                  </svg>
                </button>
                ${!Number.isInteger(msg.stickerIndex) ? `<button onclick="GroupChat.editMessage('${msg.id}')" class="jc-note__edit" aria-label="Editar mensaje" title="Editar mensaje">✎</button>` : ''}
              ` : ''}
            </div>
            ${msg.id ? `<div class="jc-reactions" aria-label="Acciones del mensaje">
              <button type="button" onclick="GroupChat.reactToMessage('${msg.id}', 'heart')" aria-label="Reaccionar con corazón">♥ <span>${this.reactionCount(msg, 'heart')}</span></button>
              <button type="button" onclick="GroupChat.reactToMessage('${msg.id}', 'sakura')" aria-label="Reaccionar con sakura">✿ <span>${this.reactionCount(msg, 'sakura')}</span></button>
              <button type="button" onclick="GroupChat.startReply('${msg.id}')" aria-label="Responder">↩</button>
              <button type="button" onclick="GroupChat.togglePin('${msg.id}')" aria-label="${this.pinnedMessageIds.includes(msg.id) ? 'Desfijar' : 'Fijar'} mensaje">${this.pinnedMessageIds.includes(msg.id) ? '📌' : '⌖'}</button>
              ${!isCurrentUser ? `<button type="button" onclick="GroupChat.hideMessage('${msg.id}')" aria-label="Ocultar mensaje">◌</button>` : ''}
              <details class="jc-actions"><summary aria-label="Convertir mensaje">＋</summary><div><button type="button" onclick="GroupChat.convertMessage('${msg.id}', 'activity')">Actividad</button><button type="button" onclick="GroupChat.convertMessage('${msg.id}', 'expense')">Gasto</button><button type="button" onclick="GroupChat.convertMessage('${msg.id}', 'task')">Tarea</button></div></details>
            </div>` : ''}
          </div>
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
    const emojiBtn = document.getElementById('chatEmojiBtn');
    const sidebarBtn = document.getElementById('chatSidebarToggle');
    const search = document.getElementById('chatSearch');

    if (input) {
      input.value = localStorage.getItem(this.preferenceKey('draft')) || '';
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      input.addEventListener('input', () => {
        localStorage.setItem(this.preferenceKey('draft'), input.value);
        this.handleTyping();
        this.renderMentionSuggestions(input.value);
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }
    emojiBtn?.addEventListener('click', () => {
      if (!input) return;
      input.value += `${input.value ? ' ' : ''}🌸`;
      input.focus();
    });
    sidebarBtn?.addEventListener('click', () => document.querySelector('.jc-app')?.classList.toggle('jc-app--threads-open'));
    search?.addEventListener('input', (event) => this.filterMessages(event.target.value));
    if (!this.connectionListenersAttached) {
      window.addEventListener('online', () => this.renderConnectionState());
      window.addEventListener('offline', () => this.renderConnectionState());
      this.connectionListenersAttached = true;
    }
    this.renderConnectionState();
  },

  focusComposer() {
    document.getElementById('chatInput')?.focus();
  },

  renderConnectionState() {
    const state = document.getElementById('chatConnectionState');
    if (!state) return;
    state.textContent = navigator.onLine ? '● conectado' : '◷ sin conexión · se enviará después';
    state.classList.toggle('offline', !navigator.onLine);
  },

  renderMentionSuggestions(value) {
    document.getElementById('chatMentionSuggestions')?.remove();
    if (!/(^|\s)@[\w.-]*$/.test(value)) return;
    const names = [...new Set(this.messages.map(message => message.userName || message.userEmail?.split('@')[0]).filter(Boolean))].slice(0, 6);
    if (!names.length) return;
    const box = document.createElement('div');
    box.id = 'chatMentionSuggestions'; box.className = 'jc-mention-suggestions';
    box.innerHTML = names.map(name => `<button type="button" data-mention="${this.escapeHtml(name)}">@${this.escapeHtml(name)}</button>`).join('');
    document.querySelector('.jc-compose')?.prepend(box);
    box.querySelectorAll('[data-mention]').forEach(button => button.addEventListener('click', () => {
      const input = document.getElementById('chatInput');
      input.value = input.value.replace(/@[\w.-]*$/, `@${button.dataset.mention} `); box.remove(); input.focus();
    }));
  },

  preferenceKey(suffix) { return `japitin_chat_${suffix}_${this.getCurrentTripId()}`; },

  loadChatPreferences() {
    this.lastReadAt = Number(localStorage.getItem(this.preferenceKey('read')) || 0);
    this.muted = localStorage.getItem(this.preferenceKey('muted')) === 'true';
    try { this.hiddenMessageIds = new Set(JSON.parse(localStorage.getItem(this.preferenceKey('hidden')) || '[]')); } catch { this.hiddenMessageIds = new Set(); }
  },

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem(this.preferenceKey('muted'), String(this.muted));
    const button = document.getElementById('chatMuteBtn');
    if (button) button.textContent = this.muted ? '🔕' : '🔔';
    window.Notifications?.show(this.muted ? 'Chat silenciado' : 'Notificaciones activadas', 'success');
  },

  hideMessage(messageId) {
    this.hiddenMessageIds.add(messageId);
    localStorage.setItem(this.preferenceKey('hidden'), JSON.stringify([...this.hiddenMessageIds]));
    this.renderMessages();
    window.Notifications?.show('Mensaje ocultado solo para ti', 'success');
  },

  markAsRead() {
    const newest = this.messages.at(-1);
    if (!newest) return;
    this.lastReadAt = Math.max(Date.now(), this.timestampMillis(newest.timestamp ?? newest.createdAt));
    localStorage.setItem(this.preferenceKey('read'), String(this.lastReadAt));
    this.unreadMessageIds.clear();
  },

  formatMessage(value = '') {
    return this.escapeHtml(value).replace(/(^|\s)(@[\w.-]+)/g, '$1<mark class="jc-mention">$2</mark>');
  },

  timestampMillis(timestamp) {
    if (!timestamp) return 0;
    if (timestamp.toMillis) return timestamp.toMillis();
    if (timestamp.seconds) return timestamp.seconds * 1000;
    const value = new Date(timestamp).getTime();
    return Number.isFinite(value) ? value : 0;
  },

  dateKey(timestamp) {
    const value = this.timestampMillis(timestamp);
    return value ? new Date(value).toDateString() : '';
  },

  formatDateLabel(timestamp) {
    const value = this.timestampMillis(timestamp);
    if (!value) return '';
    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' });
  },

  toggleStickerPicker() {
    const picker = document.getElementById('chatStickerPicker');
    if (picker) picker.hidden = !picker.hidden;
  },

  toggleToolTray() {
    const tray = document.getElementById('chatToolTray');
    const trigger = document.querySelector('.jc-tool--plus');
    if (!tray) return;
    tray.hidden = !tray.hidden;
    trigger?.setAttribute('aria-expanded', String(!tray.hidden));
    trigger?.classList.toggle('active', !tray.hidden);
  },

  async sendSticker(stickerIndex, label) {
    const tripId = this.getCurrentTripId();
    if (!tripId || !auth.currentUser || !Number.isInteger(stickerIndex) || stickerIndex < 0 || stickerIndex > 8) return;
    try {
      await addDoc(collection(db, `trips/${tripId}/chat`), {
        message: label,
        stickerIndex,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      });
      const picker = document.getElementById('chatStickerPicker');
      if (picker) picker.hidden = true;
      window.Notifications?.show('Sticker enviado', 'success');
    } catch (error) {
      console.error('Error enviando sticker:', error);
      window.Notifications?.error('No se pudo enviar el sticker');
    }
  },

  async sharePhoto() {
    const imageUrl = await window.Dialogs?.prompt({ title: 'Enviar foto', message: 'Pega el enlace público de tu foto.', placeholder: 'https://…' });
    let publicUrl = '';
    try { const parsed = new URL(imageUrl); if (['https:', 'http:'].includes(parsed.protocol)) publicUrl = parsed.href; } catch { /* invalid URL */ }
    if (!publicUrl) return imageUrl && window.Notifications?.warning('Ese enlace de foto no es válido');
    const caption = await window.Dialogs?.prompt({ title: 'Mensaje de la foto', message: 'Agrega un texto opcional.', placeholder: 'Mira esta foto…' });
    try {
      await addDoc(collection(db, `trips/${this.getCurrentTripId()}/chat`), {
        message: String(caption || 'Momento del viaje').slice(0, 500), imageUrl: publicUrl,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email, userName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        timestamp: serverTimestamp(), createdAt: new Date().toISOString()
      });
      window.Notifications?.show('Foto enviada', 'success');
    } catch (error) {
      console.error('Error compartiendo foto:', error);
      window.Notifications?.error('No se pudo publicar la foto');
    }
  },

  async shareAttachment() {
    const kind = await window.Dialogs?.prompt({ title: 'Adjuntar al chat', message: 'Escribe “audio” para una nota de voz o “archivo” para un documento.', placeholder: 'audio o archivo' });
    if (!kind) return;
    const urlValue = await window.Dialogs?.prompt({ title: kind.toLowerCase().includes('audio') ? 'Nota de voz' : 'Adjuntar archivo', message: 'Pega un enlace público HTTPS.', placeholder: 'https://…' });
    const url = this.normalizedMediaUrl(urlValue);
    if (!url) return urlValue && window.Notifications?.warning('El enlace no es válido');
    const isAudio = kind.toLowerCase().includes('audio');
    const name = isAudio ? 'Nota de voz' : (await window.Dialogs?.prompt({ title: 'Nombre del archivo', message: '¿Cómo quieres mostrarlo?', placeholder: 'Reserva del hotel.pdf' }) || 'Archivo adjunto');
    await this.sendStructuredMessage({ message: name, ...(isAudio ? { audioUrl: url } : { fileUrl: url, fileName: name }) });
  },

  async createQuickPoll() {
    const question = await window.Dialogs?.prompt({ title: 'Encuesta rápida', message: 'Pregunta para el grupo.', placeholder: '¿Dónde cenamos?' });
    if (!question) return;
    const optionsValue = await window.Dialogs?.prompt({ title: 'Opciones', message: 'Sepáralas con comas (2 a 4 opciones).', placeholder: 'Ramen, Sushi, Izakaya' });
    const options = String(optionsValue || '').split(',').map(value => value.trim()).filter(Boolean).slice(0, 4);
    if (options.length < 2) return window.Notifications?.warning('Agrega al menos dos opciones');
    await this.sendStructuredMessage({ message: question, poll: { question: question.slice(0, 160), options } });
  },

  async sendStructuredMessage(extra) {
    const tripId = this.getCurrentTripId();
    if (!tripId || !auth.currentUser) return;
    try {
      await addDoc(collection(db, `trips/${tripId}/chat`), {
        ...extra, userId: auth.currentUser.uid, userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        timestamp: serverTimestamp(), createdAt: new Date().toISOString()
      });
      window.Notifications?.show('Enviado al chat', 'success');
    } catch (error) {
      console.error('Error enviando adjunto:', error);
      window.Notifications?.error('No se pudo enviar');
    }
  },

  renderPoll(message) {
    const reactions = Array.isArray(message.reactions) ? message.reactions : [];
    const myVote = reactions.find(reaction => reaction.userId === auth.currentUser?.uid && String(reaction.emoji).startsWith('poll:'));
    return `<div class="jc-poll"><b>📊 ${this.escapeHtml(message.poll.question)}</b>${message.poll.options.map((option, index) => { const votes = reactions.filter(reaction => reaction.emoji === `poll:${index}`).length; return `<button type="button" class="${myVote?.emoji === `poll:${index}` ? 'active' : ''}" onclick="GroupChat.votePoll('${message.id}', ${index})"><span>${this.escapeHtml(option)}</span><i>${votes}</i></button>`; }).join('')}</div>`;
  },

  async votePoll(messageId, optionIndex) {
    const message = this.messages.find(item => item.id === messageId);
    if (!message || message.reactions?.some(reaction => reaction.userId === auth.currentUser?.uid && String(reaction.emoji).startsWith('poll:'))) return window.Notifications?.warning('Ya votaste en esta encuesta');
    await this.reactToMessage(messageId, `poll:${optionIndex}`);
  },

  normalizedMediaUrl(value) {
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  },

  safeMediaUrl(value) { return this.escapeHtml(this.normalizedMediaUrl(value)); },

  filterMessages(value = '') {
    const needle = value.trim().toLocaleLowerCase('es');
    document.querySelectorAll('.jc-msg').forEach(message => {
      const text = message.querySelector('.jc-note__text')?.textContent?.toLocaleLowerCase('es') || '';
      message.hidden = Boolean(needle) && !text.includes(needle);
    });
  },

  initPinsSync() {
    this.unsubscribePins?.();
    const tripId = this.getCurrentTripId();
    if (!tripId || !auth.currentUser) return;
    this.unsubscribePins = onSnapshot(doc(db, `trips/${tripId}/data`, 'chatPins'), snapshot => {
      this.pinnedMessageIds = snapshot.exists() && Array.isArray(snapshot.data().messageIds) ? snapshot.data().messageIds : [];
      this.renderPinnedBar();
      this.renderMessages();
    }, error => console.error('Error sincronizando mensajes fijados:', error));
  },

  initTypingSync() {
    this.unsubscribeTyping?.();
    const tripId = this.getCurrentTripId();
    if (!tripId) return;
    this.unsubscribeTyping = onSnapshot(collection(db, `trips/${tripId}/data`), snapshot => {
      const now = Date.now();
      this.typingUsers = snapshot.docs.filter(item => item.id.startsWith('typing_') && item.data().active && item.data().expiresAt > now && item.data().userId !== auth.currentUser?.uid).map(item => item.data().userName).filter(Boolean);
      this.renderTypingIndicator();
    });
  },

  renderTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (!indicator) return;
    indicator.classList.toggle('hidden', !this.typingUsers.length);
    const label = indicator.querySelector('span:last-child');
    if (label && this.typingUsers.length) label.textContent = `${this.typingUsers.slice(0, 2).join(' y ')} ${this.typingUsers.length === 1 ? 'está' : 'están'} escribiendo…`;
  },

  reactionCount(message, emoji) {
    return Array.isArray(message.reactions) ? message.reactions.filter(reaction => reaction.emoji === emoji).length : 0;
  },

  startReply(messageId) {
    const message = this.messages.find(item => item.id === messageId);
    if (!message) return;
    this.replyingTo = {
      id: message.id,
      message: (message.message ?? message.text ?? '').slice(0, 140),
      userName: message.userName || message.userEmail?.split('@')[0] || 'Viajero'
    };
    this.renderReplyPreview();
    this.focusComposer();
  },

  cancelReply() {
    this.replyingTo = null;
    this.renderReplyPreview();
  },

  renderReplyPreview() {
    const preview = document.getElementById('chatReplyPreview');
    if (!preview) return;
    preview.hidden = !this.replyingTo;
    preview.innerHTML = this.replyingTo ? `<span><b>Respondiendo a ${this.escapeHtml(this.replyingTo.userName)}</b>${this.escapeHtml(this.replyingTo.message)}</span><button type="button" onclick="GroupChat.cancelReply()" aria-label="Cancelar respuesta">×</button>` : '';
  },

  renderPinnedBar() {
    const bar = document.getElementById('chatPinnedBar');
    if (!bar) return;
    const pinned = this.pinnedMessageIds.map(id => this.messages.find(message => message.id === id)).filter(Boolean);
    bar.hidden = pinned.length === 0;
    bar.innerHTML = pinned.length ? `<span>📌 ${pinned.length}</span><button type="button" onclick="GroupChat.scrollToMessage('${pinned[pinned.length - 1].id}')">${this.escapeHtml((pinned[pinned.length - 1].message ?? pinned[pinned.length - 1].text ?? '').slice(0, 70))}</button>` : '';
  },

  scrollToMessage(messageId) {
    if (!messageId) return;
    const target = document.querySelector(`.jc-msg[data-message-id="${CSS.escape(messageId)}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target?.classList.add('jc-msg--focus');
    setTimeout(() => target?.classList.remove('jc-msg--focus'), 1600);
  },

  async togglePin(messageId) {
    const tripId = this.getCurrentTripId();
    if (!tripId || !messageId) return;
    const isPinned = this.pinnedMessageIds.includes(messageId);
    try {
      await setDoc(doc(db, `trips/${tripId}/data`, 'chatPins'), {
        messageIds: isPinned ? arrayRemove(messageId) : arrayUnion(messageId),
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.uid || null
      }, { merge: true });
      window.Notifications?.show(isPinned ? 'Mensaje desfijado' : 'Mensaje fijado', 'success');
    } catch (error) {
      console.error('Error fijando mensaje:', error);
      window.Notifications?.error('No se pudo actualizar el mensaje fijado');
    }
  },

  async convertMessage(messageId, type) {
    const message = this.messages.find(item => item.id === messageId);
    const messageText = (message?.message ?? message?.text ?? '').trim();
    if (!messageText) return;
    document.querySelectorAll('.jc-actions[open]').forEach(menu => menu.removeAttribute('open'));

    if (type === 'activity') {
      const day = window.ItineraryHandler?.currentDay || window.ItineraryHandler?.currentItinerary?.days?.[0]?.day || 1;
      this.close();
      window.DashboardApp?.switchTab('itinerary');
      setTimeout(() => {
        window.ItineraryHandler?.showActivityModal(null, day);
        const title = document.getElementById('activityTitle');
        const desc = document.getElementById('activityDesc');
        if (title) title.value = messageText.slice(0, 90);
        if (desc) desc.value = `Creado desde el chat · ${messageText}`;
      }, 120);
      return;
    }

    if (type === 'expense') {
      const amountValue = await window.Dialogs?.prompt({ title: 'Convertir en gasto', message: messageText, placeholder: 'Monto (ej. 2500)' });
      const amount = Number(String(amountValue || '').replace(/[^0-9.]/g, ''));
      if (!amount || amount <= 0) return;
      try {
        await addDoc(collection(db, `trips/${this.getCurrentTripId()}/expenses`), {
          desc: messageText.slice(0, 160), amount, category: 'Otros', timestamp: Date.now(),
          date: new Date().toISOString(), addedBy: auth.currentUser?.email || 'Usuario local', sourceMessageId: messageId
        });
        window.Notifications?.show('Gasto creado desde el chat', 'success');
      } catch (error) {
        console.error('Error creando gasto:', error);
        window.Notifications?.error('No se pudo crear el gasto');
      }
      return;
    }

    if (type === 'task') {
      const preparation = window.PreparationHandler;
      if (!preparation) return window.Notifications?.warning('Preparación todavía está cargando');
      preparation.packingList.misc ||= [];
      preparation.packingList.misc.push({ name: messageText.slice(0, 160), checked: false, isDefault: false, sourceMessageId: messageId });
      await preparation.savePackingList('Tarea creada desde el chat');
      window.Notifications?.show('Tarea añadida a Preparación', 'success');
    }
  },

  async reactToMessage(messageId, emoji) {
    const tripId = this.getCurrentTripId();
    const userId = auth.currentUser?.uid;
    if (!tripId || !userId || !messageId) return;
    const message = this.messages.find(item => item.id === messageId);
    if (message?.reactions?.some(reaction => reaction.userId === userId && reaction.emoji === emoji)) return;
    try {
      await updateDoc(doc(db, `trips/${tripId}/chat`, messageId), {
        reactions: arrayUnion({ userId, emoji })
      });
    } catch (error) {
      console.error('❌ Error reacting to message:', error);
      window.Notifications?.error('No se pudo guardar la reacción');
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
        createdAt: new Date().toISOString(),
        ...(this.replyingTo ? { replyTo: this.replyingTo } : {})
      });

      input.value = '';
      localStorage.removeItem(this.preferenceKey('draft'));
      this.cancelReply();
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
    const tripId = this.getCurrentTripId();
    const user = auth.currentUser;
    if (tripId && user) setDoc(doc(db, `trips/${tripId}/data`, `typing_${user.uid}`), {
      active: true, expiresAt: Date.now() + 3000, userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Viajero'
    }, { merge: true }).catch(() => {});

    // Clear after 2 seconds of inactivity
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      if (tripId && user) setDoc(doc(db, `trips/${tripId}/data`, `typing_${user.uid}`), { active: false, expiresAt: Date.now(), userId: user.uid }, { merge: true }).catch(() => {});
    }, 2000);
  },

  scrollToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
      this.markAsRead();
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

  async editMessage(messageId) {
    const message = this.messages.find(item => item.id === messageId);
    if (!message || (message.userId ?? message.uid) !== auth.currentUser?.uid) return;
    const edited = await window.Dialogs?.prompt({ title: 'Editar mensaje', message: 'Actualiza el texto.', placeholder: 'Mensaje', defaultValue: message.message ?? message.text ?? '' });
    if (!edited?.trim()) return;
    try {
      await updateDoc(doc(db, `trips/${this.getCurrentTripId()}/chat`, messageId), { message: edited.trim().slice(0, 500), editedAt: new Date().toISOString() });
      window.Notifications?.show('Mensaje editado', 'success');
    } catch (error) {
      console.error('Error editando mensaje:', error);
      window.Notifications?.error('No se pudo editar');
    }
  },

  safeImageUrl(value) {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.origin);
      return ['https:', 'http:'].includes(url.protocol) ? this.escapeHtml(url.href) : '';
    } catch {
      return '';
    }
  },

  renderEmptyState() {
    const container = document.getElementById('chatModalContent');
    if (!container) return;

    container.innerHTML = `
      <div class="jc-chat">
        <div class="jc-empty">
          <img src="/images/illustrations/generated/characters/cat-explorer.webp"
               alt="" aria-hidden="true" loading="eager" width="96">
          <p class="jc-empty__title">Aún no hay viaje abierto</p>
          <p class="jc-empty__sub">Elige un viaje para abrir su libreta de chat.</p>
          <button onclick="TripsManager.showTripsListModal()" class="jc-cta">Ver mis viajes</button>
        </div>
      </div>
    `;
  },

  renderLoginRequired() {
    const container = document.getElementById('chatModalContent');
    if (!container) return;

    container.innerHTML = `
      <div class="jc-chat">
        <div class="jc-empty">
          <img src="/images/illustrations/generated/characters/dog-hello.webp"
               alt="" aria-hidden="true" loading="eager" width="96">
          <p class="jc-empty__title">Inicia sesión primero</p>
          <p class="jc-empty__sub">Necesitas una cuenta para escribir en la libreta.</p>
          <button onclick="window.location.href='/'" class="jc-cta">Iniciar sesión</button>
        </div>
      </div>
    `;
  },

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.unsubscribePins) {
      this.unsubscribePins();
      this.unsubscribePins = null;
    }
    if (this.unsubscribeTyping) {
      this.unsubscribeTyping();
      this.unsubscribeTyping = null;
    }
    this.replyingTo = null;
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
