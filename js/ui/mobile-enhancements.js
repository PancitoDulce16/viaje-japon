// js/mobile-enhancements.js - Mejoras para experiencia móvil

export const MobileEnhancements = {
  // Detectar si es dispositivo móvil
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Detectar si es iOS
  isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  },

  // Detectar si es Android
  isAndroid() {
    return /Android/i.test(navigator.userAgent);
  },

  // Inicializar mejoras móviles
  init() {
    console.log('📱 Inicializando mejoras móviles...');

    // Agregar clase mobile al body si es móvil
    if (this.isMobile()) {
      document.body.classList.add('is-mobile');

      if (this.isIOS()) {
        document.body.classList.add('is-ios');
      }

      if (this.isAndroid()) {
        document.body.classList.add('is-android');
      }
    }

    // Optimizaciones de performance
    this.optimizeScrolling();

    // Mejorar experiencia táctil
    this.enhanceTouchExperience();

    // Detectar orientación
    this.handleOrientation();

    // Prevenir zoom no deseado
    this.preventUnwantedZoom();

    // Agregar soporte para swipe gestures
    this.addSwipeGestures();

    // Mejorar input focus en iOS
    this.fixIOSInputFocus();

    // Optimizar viewport
    this.optimizeViewport();

    // PWA install prompt
    this.handlePWAInstall();

    console.log('✅ Mejoras móviles activadas');
  },

  // Optimizar scrolling en móvil
  optimizeScrolling() {
    // Usar scroll passivo para mejor performance
    const supportsPassive = this.checkPassiveSupport();

    if (supportsPassive) {
      window.addEventListener('scroll', () => {}, { passive: true });
      window.addEventListener('touchstart', () => {}, { passive: true });
      window.addEventListener('touchmove', () => {}, { passive: true });
    }

    // Prevenir scroll bouncing en iOS en modales
    document.addEventListener('touchmove', (e) => {
      const modal = e.target.closest('.modal');
      if (modal && modal.classList.contains('active')) {
        const scrollContainer = e.target.closest('.modal > div');
        if (scrollContainer) {
          const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
          if (!isScrollable) {
            e.preventDefault();
          }
        }
      }
    }, { passive: false });
  },

  // Verificar soporte para passive listeners
  checkPassiveSupport() {
    let passiveSupported = false;
    try {
      const options = {
        get passive() {
          passiveSupported = true;
          return false;
        }
      };
      window.addEventListener('test', null, options);
      window.removeEventListener('test', null, options);
    } catch (err) {
      passiveSupported = false;
    }
    return passiveSupported;
  },

  // Mejorar experiencia táctil
  enhanceTouchExperience() {
    // Agregar feedback visual en botones al tocar
    document.addEventListener('touchstart', (e) => {
      const button = e.target.closest('button, a, .clickable');
      if (button && !button.classList.contains('no-touch-feedback')) {
        button.style.opacity = '0.7';
        button.style.transform = 'scale(0.97)';
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const button = e.target.closest('button, a, .clickable');
      if (button) {
        button.style.opacity = '';
        button.style.transform = '';
      }
    }, { passive: true });

    document.addEventListener('touchcancel', (e) => {
      const button = e.target.closest('button, a, .clickable');
      if (button) {
        button.style.opacity = '';
        button.style.transform = '';
      }
    }, { passive: true });
  },

  // Manejar cambios de orientación
  handleOrientation() {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;

      if (isLandscape) {
        document.body.classList.add('landscape');
        document.body.classList.remove('portrait');
      } else {
        document.body.classList.add('portrait');
        document.body.classList.remove('landscape');
      }

      // Ajustar altura del viewport en iOS
      if (this.isIOS()) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Ejecutar al inicio
    handleOrientationChange();
  },

  // Prevenir zoom no deseado en iOS
  preventUnwantedZoom() {
    if (!this.isIOS()) return;

    // Prevenir zoom en double tap en elementos específicos
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        // Double tap detectado
        const target = e.target;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    }, false);
  },

  // Agregar gestos de swipe
  addSwipeGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const minSwipeDistance = 50;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;

      this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY, minSwipeDistance);
    }, { passive: true });
  },

  // Procesar gesto de swipe
  handleSwipe(startX, startY, endX, endY, minDistance) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Verificar si es un swipe horizontal significativo
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minDistance) {
      if (deltaX > 0) {
        // Swipe derecha
        this.onSwipeRight();
      } else {
        // Swipe izquierda
        this.onSwipeLeft();
      }
    }

    // Verificar si es un swipe vertical significativo
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minDistance) {
      if (deltaY > 0) {
        // Swipe abajo
        this.onSwipeDown();
      } else {
        // Swipe arriba
        this.onSwipeUp();
      }
    }
  },

  // Handlers para swipes (pueden ser customizados)
  onSwipeLeft() {
    // Podría usarse para navegar entre tabs
    console.log('👆 Swipe left detectado');
  },

  onSwipeRight() {
    // Podría usarse para navegar entre tabs
    console.log('👆 Swipe right detectado');
  },

  onSwipeUp() {
    console.log('👆 Swipe up detectado');
  },

  onSwipeDown() {
    // Cerrar modales con swipe down
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      console.log('👆 Cerrando modal con swipe down');
      activeModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // Fix para focus en inputs en iOS
  fixIOSInputFocus() {
    if (!this.isIOS()) return;

    // Prevenir scroll al hacer focus en input
    document.addEventListener('focus', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Pequeño delay para que iOS termine su scroll automático
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    }, true);

    // Fix para viewport que se encoge cuando aparece el teclado
    const originalHeight = window.innerHeight;
    window.addEventListener('resize', () => {
      if (window.innerHeight < originalHeight) {
        // Teclado visible
        document.body.classList.add('keyboard-visible');
      } else {
        // Teclado oculto
        document.body.classList.remove('keyboard-visible');
      }
    });
  },

  // Optimizar viewport para móvil
  optimizeViewport() {
    // Agregar meta viewport si no existe
    let viewportMeta = document.querySelector('meta[name="viewport"]');

    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }

    // Configuración óptima para PWA móvil
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';

    // Agregar meta tags para iOS
    if (this.isIOS()) {
      this.addMetaTag('apple-mobile-web-app-capable', 'yes');
      this.addMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
      this.addMetaTag('apple-mobile-web-app-title', 'Japan Trip');
    }

    // Meta tags para Android
    if (this.isAndroid()) {
      this.addMetaTag('mobile-web-app-capable', 'yes');
    }
  },

  // Agregar meta tag helper
  addMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    } else {
      meta.content = content;
    }
  },

  // Manejar instalación de PWA
  handlePWAInstall() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevenir el prompt automático
      e.preventDefault();
      deferredPrompt = e;

      // Mostrar botón de instalación personalizado
      this.showInstallButton(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalada exitosamente');
      deferredPrompt = null;

      if (window.Notifications) {
        window.Notifications.success('¡App instalada! Ahora puedes acceder desde tu pantalla de inicio 🎉');
      }
    });

    // Detectar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      console.log('✅ App ejecutándose en modo PWA');
      document.body.classList.add('pwa-installed');
    }
  },

  // Mostrar botón de instalación
  showInstallButton(deferredPrompt) {
    // Solo mostrar en móvil
    if (!this.isMobile()) return;

    // Crear banner de instalación
    const installBanner = document.createElement('div');
    installBanner.id = 'pwa-install-banner';
    installBanner.className = 'fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-2xl z-50 animate-slide-up';
    installBanner.innerHTML = `
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="text-3xl">📱</div>
          <div>
            <div class="font-bold text-sm">Instala Japan Trip Planner</div>
            <div class="text-xs text-white/80">Acceso rápido desde tu pantalla de inicio</div>
          </div>
        </div>
        <div class="flex gap-2">
          <button id="pwa-install-btn" class="bg-white text-blue-600 font-bold px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm">
            Instalar
          </button>
          <button id="pwa-dismiss-btn" class="text-white/80 hover:text-white px-2 transition">
            ✕
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(installBanner);

    // Botón instalar
    document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`PWA install outcome: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar la PWA');
      }

      installBanner.remove();
      deferredPrompt = null;
    });

    // Botón cerrar
    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      installBanner.remove();
    });

    // Auto-cerrar después de 10 segundos
    setTimeout(() => {
      if (installBanner.parentNode) {
        installBanner.remove();
      }
    }, 10000);
  },

  // Vibración táctil (si está disponible)
  vibrate(pattern = [50]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },

  // Compartir nativo (Web Share API)
  async shareTrip(tripData) {
    if (!navigator.share) {
      console.warn('Web Share API no disponible');
      return false;
    }

    try {
      await navigator.share({
        title: tripData.name || 'Mi viaje a Japón',
        text: `¡Únete a mi viaje a Japón! Código: ${tripData.shareCode}`,
        url: window.location.href
      });
      console.log('✅ Compartido exitosamente');
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error compartiendo:', err);
      }
      return false;
    }
  },

  // Detectar conexión lenta
  detectSlowConnection() {
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

      if (connection) {
        const effectiveType = connection.effectiveType;

        // 'slow-2g', '2g', '3g', '4g'
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          console.warn('⚠️ Conexión lenta detectada');
          document.body.classList.add('slow-connection');

          if (window.Notifications) {
            window.Notifications.warning('Conexión lenta detectada. Algunas funciones pueden tardar más.');
          }

          return true;
        }
      }
    }

    return false;
  },

  // Detectar modo offline
  handleOffline() {
    window.addEventListener('online', () => {
      console.log('✅ Conexión restaurada');
      document.body.classList.remove('offline');

      if (window.Notifications) {
        window.Notifications.success('Conexión restaurada ✅');
      }
    });

    window.addEventListener('offline', () => {
      console.log('⚠️ Sin conexión');
      document.body.classList.add('offline');

      if (window.Notifications) {
        window.Notifications.warning('Sin conexión a internet. Trabajando en modo offline.');
      }
    });

    // Verificar estado inicial
    if (!navigator.onLine) {
      document.body.classList.add('offline');
    }
  }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    MobileEnhancements.init();
    MobileEnhancements.handleOffline();
    MobileEnhancements.detectSlowConnection();
  });
} else {
  MobileEnhancements.init();
  MobileEnhancements.handleOffline();
  MobileEnhancements.detectSlowConnection();
}

// Exportar para uso global
window.MobileEnhancements = MobileEnhancements;
