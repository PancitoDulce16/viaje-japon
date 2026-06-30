// ====================================================================================
// AUTH.JS CORREGIDO Y ROBUSTO v2.0
// Descripción: Se ha refactorizado la función 'init' para eliminar la condición de
// carrera del temporizador, asegurando un flujo de autenticación predecible y fiable.
// Versión 2.0: Corregido exports y funciones signIn/signUp
// ====================================================================================

import { auth, googleProvider } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

// ====================================================================================
// EVENTOS PERSONALIZADOS
// Estos eventos comunican el estado de la autenticación a otros módulos.
// ====================================================================================
const authInitializedEvent = (user) => new CustomEvent('auth:initialized', { detail: { user } });
const authLoggedOutEvent = new CustomEvent('auth:loggedOut');

export const AuthHandler = {
  currentUser: null,
  authUnsubscribe: null,

  showAuthLoading(message = 'Verificando autenticación...') {
    const landingPage = document.getElementById('landingPage');
    const appDashboard = document.getElementById('appDashboard');

    if (landingPage) landingPage.classList.add('hidden');
    if (appDashboard) appDashboard.classList.add('hidden');

    let loadingScreen = document.getElementById('authLoadingScreen');
    if (!loadingScreen) {
      loadingScreen = document.createElement('div');
      loadingScreen.id = 'authLoadingScreen';
      loadingScreen.className = 'fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center z-50';
      loadingScreen.innerHTML = `
        <div class="text-center text-white">
          <div class="mb-6">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
          </div>
          <h2 class="text-2xl font-bold mb-2" id="authLoadingMessage">${message}</h2>
          <p class="text-white/80 text-sm">Por favor espera...</p>
        </div>
      `;
      document.body.appendChild(loadingScreen);
    } else {
      loadingScreen.classList.remove('hidden');
      const messageEl = document.getElementById('authLoadingMessage');
      if (messageEl) messageEl.textContent = message;
    }
  },

  hideAuthLoading() {
    const loadingScreen = document.getElementById('authLoadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  },

  // =================================================================================
  // FUNCIÓN 'INIT' RECONSTRUIDA - LA SOLUCIÓN AL PROBLEMA
  // =================================================================================
  async init() {
    console.log('🔐 Inicializando autenticación (versión robusta)...');

    // ✅ IMPORTANTE: Prevenir múltiples llamadas a init()
    if (this.authUnsubscribe) {
      console.warn('⚠️ Auth ya está inicializado. Cancelando llamada duplicada.');
      return this.currentUser;
    }

    this.showAuthLoading('Iniciando...');

    // 1. Configurar la persistencia de la sesión
    try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('✅ Persistencia configurada correctamente.');
    } catch (err) {
        console.error('❌ Error configurando persistence:', err);
    }

    // 2. Esperar a que el DOM esté listo para evitar errores de elementos no encontrados.
    if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    // Asignar listeners a los botones de la landing page solo si existen los elementos
    // (No configurar en login.html porque tiene su propio sistema)
    const landingLoginForm = document.getElementById('landingLoginForm');
    if (landingLoginForm) {
        this.setupLandingPage();
    }

    // 3. Configurar listener permanente de autenticación
    return new Promise(async (resolve) => {
        // PRIMERO: Verificamos si venimos de una redirección de Google.
        let redirectHandled = false;
        try {
            this.showAuthLoading('Procesando inicio de sesión...');
            console.log('📥 Verificando resultado de redirección de Google...');
            const result = await getRedirectResult(auth);

            if (result && result.user) {
                // ¡Éxito! El usuario acaba de iniciar sesión por redirección.
                console.log('✅ Usuario autenticado por redirección:', result.user.displayName || result.user.email);
                this.currentUser = result.user;
                redirectHandled = true;

                // NO llamar a showAppDashboard aquí, dejar que onAuthStateChanged lo maneje
                console.log('✅ Redirección procesada exitosamente, esperando onAuthStateChanged...');
            } else {
                console.log('ℹ️ No hay resultado de redirección pendiente.');
            }

        } catch (error) {
            console.error('🛑 Error procesando el resultado de la redirección:', error);
            this.handleAuthError(error);
            // Aunque falle la redirección, continuamos para ver si hay una sesión activa.
        }

        // SEGUNDO: Configurar listener PERMANENTE de autenticación
        // Este listener permanece activo y detectará los cambios de auth
        let isFirstCall = true;
        this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('🔔 onAuthStateChanged triggered. User:', user ? user.email : 'null', 'First call:', isFirstCall, 'Redirect handled:', redirectHandled);

            if (user) {
                // El usuario ya tenía una sesión activa o acaba de iniciar sesión.
                console.log(`✅ Sesión activa encontrada para: ${user.displayName || user.email}`);
                this.currentUser = user;

                // Mostrar dashboard
                this.showAppDashboard();
                this.updateUserInfo(this.currentUser);
                
                // Disparamos el evento para que otros módulos se inicialicen.
                console.log('🚀 Disparando evento auth:initialized');
                window.dispatchEvent(authInitializedEvent(this.currentUser));
            } else {
                // No hay redirección Y no hay sesión activa. El usuario no está logueado.
                console.log('🚫 No hay sesión activa. Mostrando landing page.');
                this.showLandingPage();
            }

            // Resolver la promesa solo en la primera llamada
            if (isFirstCall) {
                isFirstCall = false;
                console.log('✅ Promesa de auth resuelta');
                resolve(this.currentUser);
            }
        });
    });
  },

  // Setup de la landing page (sin cambios)
  setupLandingPage() {
    console.log('🎨 Setup de landing page');

    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');
    const loginForm = document.getElementById('landingLoginForm');
    const registerForm = document.getElementById('landingRegisterForm');

    if (loginTabBtn && registerTabBtn && loginForm && registerForm) {
      loginTabBtn.addEventListener('click', () => {
        loginTabBtn.className = 'auth-tab-btn flex-1 px-4 py-2 font-semibold border-b-2 border-blue-500 text-blue-600 dark:text-blue-400';
        registerTabBtn.className = 'auth-tab-btn flex-1 px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300';

        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      });

      registerTabBtn.addEventListener('click', () => {
        registerTabBtn.className = 'auth-tab-btn flex-1 px-4 py-2 font-semibold border-b-2 border-green-500 text-green-600 dark:text-green-400';
        loginTabBtn.className = 'auth-tab-btn flex-1 px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300';

        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
      });

      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLandingLogin();
      });

      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLandingRegister();
      });

      console.log('✅ Event listeners de login/register agregados');
    } else {
      console.warn('⚠️ Elementos de landing page no encontrados');
    }

    const googleBtn = document.getElementById('landingGoogleLogin');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        console.log('🔘 Click en Google login');
        this.loginWithGoogle();
      });
      console.log('✅ Event listener de Google agregado');
    } else {
      console.warn('⚠️ Botón de Google no encontrado');
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        console.log('🔘 Click en logout');
        this.logout();
      });
      console.log('✅ Event listener de logout agregado');
    }
  },

  async handleLandingLogin() {
    const email = document.getElementById('landingLoginEmail').value;
    const password = document.getElementById('landingLoginPassword').value;

    if (!email || !password) {
      this.showError('Por favor ingresa tu email y contraseña');
      return;
    }

    console.log('📧 Intentando login con:', email);
    this.showAuthLoading('Iniciando sesión...');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login exitoso con email/password:', userCredential.user.email);
      console.log('🔄 Esperando que onAuthStateChanged detecte el cambio...');
      // onAuthStateChanged se encargará de mostrar el dashboard
    } catch (error) {
      console.error('❌ Error en login:', error);
      this.hideAuthLoading();
      this.handleAuthError(error);
    }
  },

  async handleLandingRegister() {
    const email = document.getElementById('landingRegisterEmail').value;
    const password = document.getElementById('landingRegisterPassword').value;
    const confirmPassword = document.getElementById('landingRegisterConfirmPassword').value;

    if (!email || !password || !confirmPassword) {
      this.showError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      this.showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    console.log('📧 Intentando registro con:', email);
    this.showAuthLoading('Creando cuenta...');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Registro exitoso:', userCredential.user.email);
      console.log('🔄 Esperando que onAuthStateChanged detecte el cambio...');
      // onAuthStateChanged se encargará de mostrar el dashboard
    } catch (error) {
      console.error('❌ Error en registro:', error);
      this.hideAuthLoading();
      this.handleAuthError(error);
    }
  },

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('❌ Error en signIn:', error);
      this.handleAuthError(error);
      return null;
    }
  },

  async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('❌ Error en signUp:', error);
      this.handleAuthError(error);
      return null;
    }
  },

  async loginWithGoogle() {
    console.log('🔑 Iniciando login con Google...');
    this.showAuthLoading('Abriendo ventana de Google...');

    try {
      // Usar popup en lugar de redirect para evitar problemas con service worker
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Login con Google exitoso:', result.user.email);
      // onAuthStateChanged se encargará de mostrar el dashboard
      return result.user;
    } catch (error) {
      console.error('❌ Error al iniciar login con Google:', error);
      this.hideAuthLoading();

      // Si el popup fue bloqueado, intentar con redirect como fallback
      if (error.code === 'auth/popup-blocked') {
        this.showError('El popup fue bloqueado. Intentando con redirección...', 'info');
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error('❌ Error en redirect fallback:', redirectError);
          this.handleAuthError(redirectError);
        }
      } else {
        this.handleAuthError(error);
      }
      return null;
    }
  },

  async logout() {
    try {
      console.log('🔐 Iniciando logout real...');
      // 🛡️ PROTECCIÓN: Marcar explícitamente que esto es un logout REAL
      sessionStorage.setItem('isRealLogout', 'true');

      await signOut(auth);
      this.currentUser = null;
      console.log('✅ Sesión cerrada');

      // 🚨 SECURITY: Limpiar datos sensibles del localStorage
      console.log('🧹 Limpiando localStorage por seguridad...');
      localStorage.removeItem('currentTripId');
      localStorage.removeItem('checkedActivities');
      sessionStorage.removeItem('authenticated');

      // Disparamos el evento de logout para que otros módulos limpien su estado.
      console.log('📢 Disparando evento auth:loggedOut (logout real)');
      window.dispatchEvent(authLoggedOutEvent);

      // Limpiar flag después de 1 segundo
      setTimeout(() => {
        sessionStorage.removeItem('isRealLogout');
      }, 1000);

      // onAuthStateChanged se encargará de mostrar la landing page
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      this.showError('Error al cerrar sesión');
      sessionStorage.removeItem('isRealLogout');
    }
  },

  showLandingPage() {
    // ✅ Protección: NO mostrar landing si hay usuario autenticado
    if (auth.currentUser) {
      console.warn('⚠️ Bloqueado showLandingPage() - usuario autenticado detectado');
      this.showAppDashboard();
      return;
    }

    this.hideAuthLoading();
    const landingPage = document.getElementById('landingPage');
    const appDashboard = document.getElementById('appDashboard');

    // 🔧 Si no existen los elementos (estamos en login.html), no hacer nada
    if (!landingPage && !appDashboard) {
      console.log('ℹ️ Elementos de landing/dashboard no encontrados (probablemente en login.html)');
      return;
    }

    if (landingPage) {
      landingPage.classList.remove('hidden');
      console.log('👋 Landing page mostrada');
    }
    if (appDashboard) {
      appDashboard.classList.add('hidden');
      console.log('📱 Dashboard ocultado');
    }
  },

  showAppDashboard() {
    // ✅ Protección: NO mostrar dashboard si NO hay usuario autenticado
    if (!auth.currentUser) {
      console.warn('⚠️ Bloqueado showAppDashboard() - no hay usuario autenticado');
      this.showLandingPage();
      return;
    }

    this.hideAuthLoading();
    const landingPage = document.getElementById('landingPage');
    const appDashboard = document.getElementById('appDashboard');

    // 🔧 Si no existen los elementos (estamos en login.html), no hacer nada
    // login.js se encargará de redirigir al dashboard
    if (!landingPage && !appDashboard) {
      console.log('ℹ️ Elementos de landing/dashboard no encontrados (probablemente en login.html)');
      return;
    }

    if (landingPage) {
      landingPage.classList.add('hidden');
      console.log('👋 Landing page ocultada');
    }
    if (appDashboard) {
      appDashboard.classList.remove('hidden');
      console.log('📱 Dashboard mostrado');
    }
  },

  updateUserInfo(user) {
    // Email ahora se muestra en el perfil de usuario
    // Esta función ya no necesita actualizar el navbar
  },

  showError(message, type = 'error') {
    console.error('🔴 Error de auth:', message);

    // Opción 1: Usar sistema de notificaciones si está disponible
    if (window.Notifications && typeof window.Notifications.show === 'function') {
      window.Notifications.show(message, type);
      return;
    }

    // Opción 2: Crear un toast visible en la UI
    this.showErrorToast(message);
  },

  showErrorToast(message) {
    // Crear un toast de error temporal
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl z-[9999] animate__animated animate__fadeInDown';
    toast.style.maxWidth = '400px';
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-semibold text-sm">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-white/80 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      toast.classList.add('animate__fadeOutUp');
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  },

  handleAuthError(error) {
    let message = 'Error en autenticación';
    switch (error.code) {
      case 'auth/invalid-email': message = '⚠️ Email inválido'; break;
      case 'auth/user-not-found': message = '⚠️ No existe cuenta con este email'; break;
      case 'auth/wrong-password': message = '⚠️ Contraseña incorrecta'; break;
      case 'auth/email-already-in-use': message = '⚠️ Este email ya está registrado'; break;
      case 'auth/weak-password': message = '⚠️ La contraseña es muy débil (mínimo 6 caracteres)'; break;
      case 'auth/invalid-credential': message = '⚠️ Email o contraseña incorrectos'; break;
      default: message = `⚠️ Error: ${error.message}`;
    }
    this.showError(message);
  }
};

window.AuthHandler = AuthHandler;
