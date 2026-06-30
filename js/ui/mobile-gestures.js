/**
 * 📱 MOBILE GESTURES
 * ==================
 *
 * Gestos táctiles para móviles
 * IMPROVED.md Priority #6
 */

class MobileGestures {
  constructor() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.pullStartY = 0;
    this.isPulling = false;
    this.enabled = this.isMobileDevice();
  }

  /**
   * Detectar si es dispositivo móvil
   */
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Inicializar gestos
   */
  init() {
    if (!this.enabled) {
      console.log('📱 Mobile Gestures: Desktop detected, skipping mobile gestures');
      return;
    }

    this.setupSwipeGestures();
    this.setupPullToRefresh();
    this.setupLongPress();
    this.setupPinchZoom();

    console.log('📱 Mobile Gestures initialized');
  }

  /**
   * Swipe gestures (izquierda/derecha)
   */
  setupSwipeGestures() {
    // Swipe en días del itinerario
    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('.day-card, .activity-card');
      if (!target) return;

      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
      target.dataset.swipeActive = 'true';
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const target = e.target.closest('.day-card, .activity-card');
      if (!target || target.dataset.swipeActive !== 'true') return;

      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;

      this.handleSwipe(target);
      delete target.dataset.swipeActive;
    }, { passive: true });
  }

  /**
   * Manejar swipe
   */
  handleSwipe(element) {
    const diffX = this.touchEndX - this.touchStartX;
    const diffY = this.touchEndY - this.touchStartY;

    // Solo swipe horizontal (no vertical)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe derecha → día anterior
        this.onSwipeRight(element);
      } else {
        // Swipe izquierda → día siguiente
        this.onSwipeLeft(element);
      }
    }
  }

  /**
   * Swipe a la derecha (día anterior)
   */
  onSwipeRight(element) {
    if (element.classList.contains('day-card')) {
      const prevButton = element.querySelector('.prev-day-btn');
      if (prevButton && !prevButton.disabled) {
        prevButton.click();
        this.showSwipeFeedback(element, '← Día anterior');
      }
    }
  }

  /**
   * Swipe a la izquierda (día siguiente)
   */
  onSwipeLeft(element) {
    if (element.classList.contains('day-card')) {
      const nextButton = element.querySelector('.next-day-btn');
      if (nextButton && !nextButton.disabled) {
        nextButton.click();
        this.showSwipeFeedback(element, 'Día siguiente →');
      }
    }
  }

  /**
   * Feedback visual del swipe
   */
  showSwipeFeedback(element, message) {
    const feedback = document.createElement('div');
    feedback.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-6 py-3 rounded-full shadow-2xl z-[100000] animate-scale-in';
    feedback.textContent = message;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.classList.add('opacity-0', 'scale-95');
      setTimeout(() => feedback.remove(), 300);
    }, 1500);
  }

  /**
   * Pull to refresh
   */
  setupPullToRefresh() {
    let startY = 0;
    let pulling = false;
    let pullIndicator = null;

    const createPullIndicator = () => {
      if (pullIndicator) return pullIndicator;

      pullIndicator = document.createElement('div');
      pullIndicator.className = 'fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-purple-600 to-transparent flex items-center justify-center text-white transform -translate-y-full transition-transform z-50';
      pullIndicator.innerHTML = '<span class="animate-bounce">↓ Suelta para recargar</span>';
      document.body.appendChild(pullIndicator);
      return pullIndicator;
    };

    document.addEventListener('touchstart', (e) => {
      // Solo en el inicio de la página
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!pulling) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 0 && window.scrollY === 0) {
        const indicator = createPullIndicator();
        const pullDistance = Math.min(diff, 100);
        indicator.style.transform = `translateY(${pullDistance - 100}%)`;

        if (pullDistance >= 80) {
          indicator.innerHTML = '<span class="animate-spin text-2xl">🔄</span>';
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!pulling) return;

      const currentY = e.changedTouches[0].clientY;
      const diff = currentY - startY;

      if (diff > 80 && window.scrollY === 0) {
        // Trigger refresh
        this.onPullToRefresh();
      }

      // Reset
      if (pullIndicator) {
        pullIndicator.style.transform = 'translateY(-100%)';
        setTimeout(() => {
          if (pullIndicator) {
            pullIndicator.remove();
            pullIndicator = null;
          }
        }, 300);
      }

      pulling = false;
    }, { passive: true });
  }

  /**
   * Acción al hacer pull to refresh
   */
  onPullToRefresh() {
    if (window.showToast) {
      window.showToast('Recargando... 🔄', 'info', 1500);
    }

    // Recargar datos
    setTimeout(() => {
      if (window.render && typeof window.render === 'function') {
        window.render();
      } else {
        window.location.reload();
      }
    }, 500);
  }

  /**
   * Long press (mantener presionado)
   */
  setupLongPress() {
    let pressTimer;

    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('.activity-card, .day-card, button');
      if (!target) return;

      pressTimer = setTimeout(() => {
        this.onLongPress(target, e);
      }, 500);
    }, { passive: true });

    document.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    }, { passive: true });

    document.addEventListener('touchmove', () => {
      clearTimeout(pressTimer);
    }, { passive: true });
  }

  /**
   * Acción al hacer long press
   */
  onLongPress(element, event) {
    // Vibrar si está disponible
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Mostrar menú contextual
    if (element.classList.contains('activity-card')) {
      this.showContextMenu(element, event);
    }
  }

  /**
   * Mostrar menú contextual
   */
  showContextMenu(element, event) {
    const menu = document.createElement('div');
    menu.className = 'fixed bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[100000] p-2 animate-scale-in';
    menu.style.left = `${event.touches[0].clientX}px`;
    menu.style.top = `${event.touches[0].clientY}px`;

    menu.innerHTML = `
      <button class="w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition flex items-center gap-2">
        <span>✏️</span> Editar
      </button>
      <button class="w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition flex items-center gap-2">
        <span>🔄</span> Mover
      </button>
      <button class="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition flex items-center gap-2">
        <span>🗑️</span> Eliminar
      </button>
    `;

    document.body.appendChild(menu);

    // Cerrar al hacer click fuera
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
        document.removeEventListener('touchstart', closeMenu);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', closeMenu);
      document.addEventListener('touchstart', closeMenu);
    }, 100);
  }

  /**
   * Pinch to zoom (para mapas)
   */
  setupPinchZoom() {
    let initialDistance = 0;
    let currentScale = 1;

    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('.map-container, .image-zoomable');
      if (!target || e.touches.length !== 2) return;

      initialDistance = this.getDistance(e.touches[0], e.touches[1]);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      const target = e.target.closest('.map-container, .image-zoomable');
      if (!target || e.touches.length !== 2) return;

      e.preventDefault();

      const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance;

      currentScale = Math.min(Math.max(0.5, scale), 3);
      target.style.transform = `scale(${currentScale})`;
    });
  }

  /**
   * Calcular distancia entre dos toques
   */
  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.MobileGestures = new MobileGestures();

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.MobileGestures.init());
  } else {
    window.MobileGestures.init();
  }

  console.log('📱 Mobile Gestures loaded!');
}
