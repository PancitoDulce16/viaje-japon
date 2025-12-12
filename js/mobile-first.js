/**
 * 📱 MOBILE-FIRST FUNCTIONALITY
 * ==============================
 *
 * Mobile-optimized features:
 * - Bottom navigation
 * - Swipe gestures
 * - Pull-to-refresh
 * - Touch optimizations
 * - Haptic feedback (where supported)
 */

class MobileFirst {
  constructor() {
    this.initialized = false;
    this.isMobile = window.innerWidth <= 768;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.swipeThreshold = 50; // pixels
    this.pullThreshold = 80; // pixels for pull-to-refresh

    // Current active tab
    this.activeTab = 'itinerary';

    console.log('📱 Mobile-First System initialized');
  }

  /**
   * Initialize all mobile features
   */
  init() {
    if (this.initialized) return;

    // Create bottom navigation
    this.createBottomNav();

    // Initialize swipe gestures
    this.initSwipeGestures();

    // Initialize pull-to-refresh
    this.initPullToRefresh();

    // Initialize touch optimizations
    this.initTouchOptimizations();

    // Handle orientation changes
    this.handleOrientationChange();

    // Update on resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      this.handleOrientationChange();
    });

    this.initialized = true;
    console.log('📱 Mobile features initialized');
  }

  /**
   * Create mobile bottom navigation
   */
  createBottomNav() {
    // Check if already exists
    if (document.getElementById('mobile-bottom-nav')) return;

    const nav = document.createElement('div');
    nav.id = 'mobile-bottom-nav';
    nav.className = 'mobile-bottom-nav';

    nav.innerHTML = `
      <div class="mobile-bottom-nav-items">
        <div class="mobile-nav-item active" data-tab="itinerary">
          <i class="far fa-calendar-alt"></i>
          <span>Itinerario</span>
        </div>
        <div class="mobile-nav-item" data-tab="map">
          <i class="fas fa-map-marked-alt"></i>
          <span>Mapa</span>
        </div>
        <div class="mobile-nav-item" data-tab="budget">
          <i class="fas fa-yen-sign"></i>
          <span>Presupuesto</span>
        </div>
        <div class="mobile-nav-item" data-tab="tools">
          <i class="fas fa-tools"></i>
          <span>Herramientas</span>
        </div>
        <div class="mobile-nav-item" data-tab="more">
          <i class="fas fa-ellipsis-h"></i>
          <span>Más</span>
        </div>
      </div>
    `;

    document.body.appendChild(nav);

    // Add click handlers
    nav.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });
  }

  /**
   * Switch tab and update UI
   */
  switchTab(tabName) {
    this.activeTab = tabName;

    // Update bottom nav active state
    const nav = document.getElementById('mobile-bottom-nav');
    if (nav) {
      nav.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
          item.classList.add('active');
        }
      });
    }

    // Trigger haptic feedback if supported
    this.hapticFeedback('light');

    // Handle special tabs
    if (tabName === 'budget') {
      // Open budget intelligence
      if (window.BudgetIntelligenceUI) {
        const tripData = window.BudgetIntelligenceUI.getMockTripData();
        window.BudgetIntelligenceUI.showDashboard(tripData);
      }
    } else if (tabName === 'tools') {
      // Show tools menu
      this.showToolsMenu();
    } else if (tabName === 'more') {
      // Show more menu
      this.showMoreMenu();
    } else {
      // Switch to regular tab
      const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
      if (tabBtn && tabBtn.click) {
        tabBtn.click();
      }
    }

    console.log('📱 Switched to tab:', tabName);
  }

  /**
   * Show tools quick menu
   */
  showToolsMenu() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-end justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-t-3xl w-full p-6 slide-in-bottom">
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
        <h3 class="text-xl font-bold mb-4">🛠️ Herramientas</h3>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <button class="tool-btn flex flex-col items-center gap-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20" onclick="window.GeoOptimizerUI.runOptimization(); this.closest('.fixed').remove();">
            <i class="fas fa-route text-2xl text-purple-600"></i>
            <span class="text-sm">Optimizar Ruta</span>
          </button>
          <button class="tool-btn flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20" onclick="window.CulturalKnowledgeUI.showGuide(); this.closest('.fixed').remove();">
            <i class="fas fa-torii-gate text-2xl text-blue-600"></i>
            <span class="text-sm">Guía Cultural</span>
          </button>
          <button class="tool-btn flex flex-col items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20" onclick="window.MLTestPanel?.openPanel(); this.closest('.fixed').remove();">
            <i class="fas fa-brain text-2xl text-green-600"></i>
            <span class="text-sm">ML Panel</span>
          </button>
          <button class="tool-btn flex flex-col items-center gap-2 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20" onclick="window.AIChatUI?.open(); this.closest('.fixed').remove();">
            <i class="fas fa-robot text-2xl text-yellow-600"></i>
            <span class="text-sm">AI Chat</span>
          </button>
          <button class="tool-btn flex flex-col items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20" onclick="alert('JR Pass Calculator'); this.closest('.fixed').remove();">
            <i class="fas fa-train text-2xl text-red-600"></i>
            <span class="text-sm">JR Pass</span>
          </button>
          <button class="tool-btn flex flex-col items-center gap-2 p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20" onclick="alert('Ramen Passport'); this.closest('.fixed').remove();">
            <i class="fas fa-bowl-rice text-2xl text-pink-600"></i>
            <span class="text-sm">Ramen</span>
          </button>
          <button class="tool-btn flex flex-col items-center gap-2 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20" onclick="window.TravelerProfilesUI?.showProfileSelector(); this.closest('.fixed').remove();">
            <i class="fas fa-user-circle text-2xl text-indigo-600"></i>
            <span class="text-sm">Mi Perfil</span>
          </button>
          <button class="tool-btn flex flex-col items-center gap-2 p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20" onclick="window.LiveModeUI?.activate(); this.closest('.fixed').remove();">
            <i class="fas fa-map-marker-alt text-2xl text-teal-600"></i>
            <span class="text-sm">Modo Live</span>
          </button>
        </div>
        <button class="w-full py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold" onclick="this.closest('.fixed').remove();">
          Cerrar
        </button>
      </div>
    `;

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    document.body.appendChild(modal);
  }

  /**
   * Show more menu
   */
  showMoreMenu() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-end justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-t-3xl w-full p-6 slide-in-bottom">
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
        <h3 class="text-xl font-bold mb-4">⚙️ Más Opciones</h3>
        <div class="space-y-3 mb-4">
          <button class="w-full flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700" onclick="window.TravelerProfilesUI?.showProfileSelector(); this.closest('.fixed').remove();">
            <i class="fas fa-user-circle text-xl text-purple-600"></i>
            <span>Mi Perfil de Viajero</span>
          </button>
          <button class="w-full flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700" onclick="alert('Settings'); this.closest('.fixed').remove();">
            <i class="fas fa-cog text-xl"></i>
            <span>Configuración</span>
          </button>
          <button class="w-full flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700" onclick="alert('Export'); this.closest('.fixed').remove();">
            <i class="fas fa-download text-xl"></i>
            <span>Exportar Itinerario</span>
          </button>
          <button class="w-full flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700" onclick="alert('Share'); this.closest('.fixed').remove();">
            <i class="fas fa-share text-xl"></i>
            <span>Compartir Viaje</span>
          </button>
          <button class="w-full flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700" onclick="alert('Help'); this.closest('.fixed').remove();">
            <i class="fas fa-question-circle text-xl"></i>
            <span>Ayuda</span>
          </button>
        </div>
        <button class="w-full py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold" onclick="this.closest('.fixed').remove();">
          Cerrar
        </button>
      </div>
    `;

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    document.body.appendChild(modal);
  }

  /**
   * Initialize swipe gestures
   */
  initSwipeGestures() {
    const content = document.getElementById('main-content');
    if (!content) return;

    content.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    content.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;
      this.handleSwipe();
    }, { passive: true });
  }

  /**
   * Handle swipe gesture
   */
  handleSwipe() {
    const diffX = this.touchEndX - this.touchStartX;
    const diffY = this.touchEndY - this.touchStartY;

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.swipeThreshold) {
      if (diffX > 0) {
        // Swipe right
        this.onSwipeRight();
      } else {
        // Swipe left
        this.onSwipeLeft();
      }
    }
  }

  /**
   * Handle swipe right
   */
  onSwipeRight() {
    console.log('📱 Swipe right detected');
    this.hapticFeedback('light');
    // Could navigate to previous tab or go back
  }

  /**
   * Handle swipe left
   */
  onSwipeLeft() {
    console.log('📱 Swipe left detected');
    this.hapticFeedback('light');
    // Could navigate to next tab or open side menu
  }

  /**
   * Initialize pull-to-refresh
   */
  initPullToRefresh() {
    if (!this.isMobile) return;

    let startY = 0;
    let pulling = false;

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!pulling) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > this.pullThreshold && window.scrollY === 0) {
        this.showPullIndicator();
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!pulling) return;

      const endY = e.changedTouches[0].clientY;
      const diff = endY - startY;

      if (diff > this.pullThreshold) {
        this.triggerRefresh();
      }

      this.hidePullIndicator();
      pulling = false;
    }, { passive: true });
  }

  /**
   * Show pull-to-refresh indicator
   */
  showPullIndicator() {
    let indicator = document.getElementById('ptr-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'ptr-indicator';
      indicator.className = 'ptr-indicator pulling';
      indicator.innerHTML = `
        <i class="fas fa-arrow-down"></i>
        <span>Suelta para actualizar</span>
      `;
      document.body.appendChild(indicator);
    }
    indicator.classList.add('pulling');
  }

  /**
   * Hide pull indicator
   */
  hidePullIndicator() {
    const indicator = document.getElementById('ptr-indicator');
    if (indicator) {
      indicator.classList.remove('pulling');
      setTimeout(() => indicator.remove(), 300);
    }
  }

  /**
   * Trigger refresh
   */
  triggerRefresh() {
    console.log('📱 Pull-to-refresh triggered');

    const indicator = document.getElementById('ptr-indicator');
    if (indicator) {
      indicator.classList.add('refreshing');
      indicator.innerHTML = `
        <i class="fas fa-sync ptr-spinner"></i>
        <span>Actualizando...</span>
      `;
    }

    this.hapticFeedback('medium');

    // Simulate refresh (replace with actual refresh logic)
    setTimeout(() => {
      this.hidePullIndicator();
      console.log('✅ Refresh complete');
    }, 1500);
  }

  /**
   * Initialize touch optimizations
   */
  initTouchOptimizations() {
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });

    // Add touch-friendly classes
    document.querySelectorAll('button, a, .clickable').forEach(el => {
      el.classList.add('tappable');
    });
  }

  /**
   * Handle orientation change
   */
  handleOrientationChange() {
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    document.body.dataset.orientation = orientation;
    console.log('📱 Orientation:', orientation);
  }

  /**
   * Haptic feedback (if supported)
   */
  hapticFeedback(type = 'light') {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'success':
          navigator.vibrate([10, 50, 10]);
          break;
        case 'error':
          navigator.vibrate([50, 100, 50]);
          break;
      }
    }

    // iOS Haptic Feedback (if available)
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic) {
      window.webkit.messageHandlers.haptic.postMessage(type);
    }
  }

  /**
   * Show mobile toast notification
   */
  showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 slide-in-bottom';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.MobileFirst = new MobileFirst();

  // Auto-init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    window.MobileFirst.init();
  });

  console.log('📱 Mobile-First System loaded!');
}
