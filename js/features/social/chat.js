// js/chat.js - Botón flotante que abre el chat grupal
//
// 🔧 Este archivo ANTES tenía su propia implementación completa de chat
// (modal, listener de Firestore, envío de mensajes) corriendo en paralelo a
// GroupChat (group-chat.js) - dos sistemas separados escribiendo en la MISMA
// colección de Firestore (trips/{tripId}/chat) con esquemas de campo
// distintos ({text,createdAt,uid,author} vs {message,timestamp,userId,
// userEmail,userName}), y GroupChat.init() no tenía ningún botón real que lo
// activara en toda la app - era la implementación más completa (avatares de
// color por usuario, indicador de "escribiendo", borrar mensajes propios)
// pero estaba completamente muerta. Ahora este archivo solo crea el botón
// flotante (el único punto de entrada real que existía) y lo conecta al
// modal real (#modal-chat, ya definido en modals.js) vía GroupChat.open().

export const ChatHandler = {
  init() {
    this.renderChatButton();
  },

  renderChatButton() {
    if (document.getElementById('chatBtn')) return; // ya existe

    let container = document.querySelector('.floating-btn-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'z-40 fixed flex flex-col gap-3 stagger-fade-in floating-btn-container';
      // style inline (no clases bottom-24/right-8 de Tailwind): el runtime CDN de
      // Tailwind no siempre genera la regla CSS para clases insertadas dinámicamente
      // vía JS - ya pasó antes con otro componente esta sesión. bottom:96px en vez de
      // 32px porque #main-fab-button ya ocupa esa esquina (bottom:20px, 60px alto) -
      // con 32px quedaban exactamente superpuestos.
      container.style.bottom = '96px';
      container.style.right = '32px';
      document.body.appendChild(container);
    }

    container.insertAdjacentHTML('beforeend', `
      <button id="chatBtn" data-tooltip="💬 Chat del Viaje" class="floating-btn ripple bounce-click gpu-accelerated tooltip-success" aria-label="Abrir chat del viaje" style="animation-delay: 0.6s">
        <i class="fas fa-comments"></i>
      </button>
    `);

    document.getElementById('chatBtn').addEventListener('click', () => {
      if (window.GroupChat) {
        window.GroupChat.open();
      }
    });
  },

  cleanup() {
    const chatBtn = document.getElementById('chatBtn');
    if (chatBtn) chatBtn.remove();
  }
};

window.ChatHandler = ChatHandler;

window.addEventListener('auth:initialized', () => {
  ChatHandler.init();
});

window.addEventListener('auth:loggedOut', () => {
  ChatHandler.cleanup();
});
