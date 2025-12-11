/**
 * 📱 MOBILE UX - Gestures & Mobile Optimization
 * ==============================================
 *
 * Handles mobile-specific interactions:
 * - Swipe gestures (left/right/up/down)
 * - Bottom navigation
 * - Pull-to-refresh
 * - Haptic feedback
 * - Touch handling
 */

class MobileUX {
  constructor() {
    this.isMobile = this.detectMobile();
    this.touchStart = { x: 0, y: 0, time: 0 };
    this.touchEnd = { x: 0, y: 0, time: 0 };
    this.swipeThreshold = 50; // Minimum distance for swipe
    this.swipeTimeThreshold = 300; // Maximum time for swipe (ms)

    // Gesture handlers
    this.handlers = {
      swipeLeft: [],
      swipeRight: [],
      swipeUp: [],
      swipeDown: [],
      longPress: []
    };

    console.log('📱 Mobile UX initializing...');
  }

  /**
   * Initialize mobile UX
   */
  initialize() {
    if (!this.isMobile) {
      console.log('📱 Desktop detected, skipping mobile optimizations');
      return;
    }

    console.log('📱 Mobile detected, applying optimizations...');

    this.setupGestures();
    this.setupBottomNav();
    this.setupPullToRefresh();
    this.setupHapticFeedback();
    this.setupSafeAreas();
    this.setupMobileOptimizations();

    console.log('✅ Mobile UX initialized');
  }

  /**
   * Detect mobile device
   */
  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check user agent
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // Check screen width
    const isMobileWidth = window.innerWidth < 768;

    // Check touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return isMobileUA || (isMobileWidth && hasTouch);
  }

  /**
   * Setup gesture detection
   */
  setupGestures() {
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

    console.log('✅ Gestures enabled');
  }

  /**
   * Handle touch start
   */
  handleTouchStart(e) {
    const touch = e.touches[0];
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Start long press detection
    this.longPressTimer = setTimeout(() => {
      this.triggerGesture('longPress', { x: touch.clientX, y: touch.clientY });
    }, 500);
  }

  /**
   * Handle touch move
   */
  handleTouchMove(e) {
    // Cancel long press if user moves
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }

    // Get current touch position
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;

    // Show swipe indicators
    if (Math.abs(deltaX) > 30) {
      this.showSwipeIndicator(deltaX > 0 ? 'right' : 'left');
    }
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(e) {
    // Clear long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }

    const touch = e.changedTouches[0];
    this.touchEnd = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Detect swipe
    this.detectSwipe();

    // Hide swipe indicators
    this.hideSwipeIndicators();
  }

  /**
   * Detect swipe direction and trigger handlers
   */
  detectSwipe() {
    const deltaX = this.touchEnd.x - this.touchStart.x;
    const deltaY = this.touchEnd.y - this.touchStart.y;
    const deltaTime = this.touchEnd.time - this.touchStart.time;

    // Check if it's a valid swipe
    if (deltaTime > this.swipeTimeThreshold) {
      return; // Too slow
    }

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Horizontal swipe
    if (absDeltaX > this.swipeThreshold && absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        this.triggerGesture('swipeRight', { distance: deltaX, time: deltaTime });
      } else {
        this.triggerGesture('swipeLeft', { distance: Math.abs(deltaX), time: deltaTime });
      }
    }

    // Vertical swipe
    if (absDeltaY > this.swipeThreshold && absDeltaY > absDeltaX) {
      if (deltaY > 0) {
        this.triggerGesture('swipeDown', { distance: deltaY, time: deltaTime });
      } else {
        this.triggerGesture('swipeUp', { distance: Math.abs(deltaY), time: deltaTime });
      }
    }
  }

  /**
   * Trigger gesture handlers
   */
  triggerGesture(gestureType, data) {
    const handlers = this.handlers[gestureType];
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }

    console.log(`👆 Gesture: ${gestureType}`, data);
  }

  /**
   * Register gesture handler
   */
  on(gestureType, handler) {
    if (this.handlers[gestureType]) {
      this.handlers[gestureType].push(handler);
    }
  }

  /**
   * Show swipe indicator
   */
  showSwipeIndicator(direction) {
    let indicator = document.querySelector(`.swipe-indicator--${direction}`);

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = `swipe-indicator swipe-indicator--${direction}`;
      indicator.innerHTML = direction === 'left' ? '←' : '→';
      document.body.appendChild(indicator);
    }

    indicator.classList.add('swipe-indicator--active');
  }

  /**
   * Hide swipe indicators
   */
  hideSwipeIndicators() {
    document.querySelectorAll('.swipe-indicator').forEach(indicator => {
      indicator.classList.remove('swipe-indicator--active');
    });
  }

  /**
   * Setup bottom navigation
   */
  setupBottomNav() {
    // Create bottom nav if it doesn't exist
    if (!document.querySelector('.mobile-bottom-nav')) {
      this.createBottomNav();
    }

    // Handle bottom nav clicks
    document.querySelectorAll('.mobile-bottom-nav__item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all items
        document.querySelectorAll('.mobile-bottom-nav__item').forEach(i => {
          i.classList.remove('mobile-bottom-nav__item--active');
        });

        // Add active class to clicked item
        item.classList.add('mobile-bottom-nav__item--active');

        // Trigger haptic feedback
        this.triggerHaptic('light');

        // Navigate
        const target = item.dataset.target;
        if (target) {
          this.navigateTo(target);
        }
      });
    });

    console.log('✅ Bottom navigation ready');
  }

  /**
   * Create bottom navigation HTML
   */
  createBottomNav() {
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'mobile-bottom-nav';
    bottomNav.innerHTML = `
      <div class="mobile-bottom-nav__items">
        <a href="#" class="mobile-bottom-nav__item mobile-bottom-nav__item--active" data-target="home">
          <div class="mobile-bottom-nav__icon">🏠</div>
          <div class="mobile-bottom-nav__label">Inicio</div>
        </a>
        <a href="#" class="mobile-bottom-nav__item" data-target="itinerary">
          <div class="mobile-bottom-nav__icon">📅</div>
          <div class="mobile-bottom-nav__label">Itinerario</div>
        </a>
        <a href="#" class="mobile-bottom-nav__item" data-target="budget">
          <div class="mobile-bottom-nav__icon">💰</div>
          <div class="mobile-bottom-nav__label">Presupuesto</div>
        </a>
        <a href="#" class="mobile-bottom-nav__item" data-target="map">
          <div class="mobile-bottom-nav__icon">🗺️</div>
          <div class="mobile-bottom-nav__label">Mapa</div>
        </a>
        <a href="#" class="mobile-bottom-nav__item" data-target="more">
          <div class="mobile-bottom-nav__icon">⋯</div>
          <div class="mobile-bottom-nav__label">Más</div>
        </a>
      </div>
    `;

    document.body.appendChild(bottomNav);
  }

  /**
   * Navigate to section
   */
  navigateTo(target) {
    console.log(`📱 Navigating to: ${target}`);

    // Hide all sections
    document.querySelectorAll('[data-section]').forEach(section => {
      section.style.display = 'none';
    });

    // Show target section
    const targetSection = document.querySelector(`[data-section="${target}"]`);
    if (targetSection) {
      targetSection.style.display = 'block';
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('mobile:navigate', {
      detail: { target }
    }));
  }

  /**
   * Setup pull-to-refresh
   */
  setupPullToRefresh() {
    let startY = 0;
    let isPulling = false;
    let pullDistance = 0;

    document.addEventListener('touchstart', (e) => {
      // Only on top of page
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (window.scrollY === 0 && startY > 0) {
        const currentY = e.touches[0].clientY;
        pullDistance = currentY - startY;

        if (pullDistance > 0) {
          isPulling = true;
          this.updatePullToRefresh(pullDistance);
        }
      }
    }, { passive: false });

    document.addEventListener('touchend', () => {
      if (isPulling && pullDistance > 80) {
        this.triggerRefresh();
      }

      isPulling = false;
      pullDistance = 0;
      startY = 0;
      this.hidePullToRefresh();
    }, { passive: true });

    console.log('✅ Pull-to-refresh enabled');
  }

  /**
   * Update pull-to-refresh indicator
   */
  updatePullToRefresh(distance) {
    let indicator = document.querySelector('.pull-to-refresh');

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'pull-to-refresh';
      indicator.innerHTML = '<div class="pull-to-refresh__spinner"></div>';
      document.body.insertBefore(indicator, document.body.firstChild);
    }

    if (distance > 20) {
      indicator.classList.add('pull-to-refresh--visible');
    }
  }

  /**
   * Hide pull-to-refresh indicator
   */
  hidePullToRefresh() {
    const indicator = document.querySelector('.pull-to-refresh');
    if (indicator) {
      indicator.classList.remove('pull-to-refresh--visible');
    }
  }

  /**
   * Trigger refresh
   */
  async triggerRefresh() {
    console.log('🔄 Refreshing...');

    // Trigger haptic
    this.triggerHaptic('medium');

    // Dispatch event
    window.dispatchEvent(new CustomEvent('mobile:refresh'));

    // Hide indicator after delay
    setTimeout(() => {
      this.hidePullToRefresh();
    }, 1000);
  }

  /**
   * Setup haptic feedback
   */
  setupHapticFeedback() {
    // Check if vibration API is available
    this.hapticSupported = 'vibrate' in navigator;

    if (this.hapticSupported) {
      console.log('✅ Haptic feedback supported');
    }

    // Add haptic to buttons
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, .btn, a[href]');
      if (target) {
        const hapticType = target.dataset.haptic || 'light';
        this.triggerHaptic(hapticType);
      }
    }, { passive: true });
  }

  /**
   * Trigger haptic feedback
   */
  triggerHaptic(type = 'light') {
    if (!this.hapticSupported) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 20, 10],
      error: [20, 10, 20, 10, 20]
    };

    const pattern = patterns[type] || patterns.light;
    navigator.vibrate(pattern);
  }

  /**
   * Setup safe areas
   */
  setupSafeAreas() {
    // Add CSS variables for safe areas
    const root = document.documentElement;

    // Check if safe areas are supported
    if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
      console.log('✅ Safe areas supported');
    }
  }

  /**
   * Setup mobile optimizations
   */
  setupMobileOptimizations() {
    // Prevent zoom on input focus
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
    }

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });

    // Add mobile class to body
    document.body.classList.add('is-mobile');

    console.log('✅ Mobile optimizations applied');
  }

  /**
   * Check if mobile
   */
  get isDevice() {
    return this.isMobile;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.MobileUX = new MobileUX();

  // Auto-initialize on mobile
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.MobileUX.initialize();
    });
  } else {
    window.MobileUX.initialize();
  }

  console.log('📱 Mobile UX loaded!');
}
