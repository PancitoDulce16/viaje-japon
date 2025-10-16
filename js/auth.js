// ====================================================================================
// AUTH.JS CORREGIDO Y ROBUSTO
// Descripción: Se ha refactorizado la función 'init' para eliminar la condición de
// carrera del temporizador, asegurando un flujo de autenticación predecible y fiable.
// ====================================================================================

import { auth, googleProvider } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

export const AuthHandler = {
  currentUser: null,

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
    // Asignar listeners a los botones de la landing page ahora que el DOM está listo.
    this.setupLandingPage();

    // 3. Proceso de autenticación centralizado y sin "carreras"
    return new Promise(async (resolve) => {
        // PRIMERO: Verificamos si venimos de una redirección de Google.
        try {
            this.showAuthLoading('Procesando inicio de sesión...');
            console.log('📥 Verificando resultado de redirección de Google...');
            const result = await getRedirectResult(auth);
            
            if (result && result.user) {
                // ¡Éxito! El usuario acaba de iniciar sesión por redirección.
                console.log('✅ Usuario autenticado por redirección:', result.user.displayName);
                this.currentUser = result.user;
                this.showAppDashboard();
                this.updateUserInfo(this.currentUser);
                return resolve(this.currentUser); // Terminamos y resolvemos la promesa.
            }
            console.log('ℹ️ No hay resultado de redirección pendiente.');

        } catch (error) {
            console.error('🛑 Error procesando el resultado de la redirección:', error);
            this.handleAuthError(error);
            // Aunque falle la redirección, continuamos para ver si hay una sesión activa.
        }

        // SEGUNDO: Si no hubo redirección, escuchamos el estado actual del usuario.
        // onAuthStateChanged es el método más fiable para saber el estado de autenticación.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Dejamos de escuchar inmediatamente para que no se ejecute múltiples veces.

            if (user) {
                // El usuario ya tenía una sesión activa.
                console.log(`✅ Sesión activa encontrada para: ${user.displayName}`);
                this.currentUser = user;
                this.showAppDashboard();
                this.updateUserInfo(this.currentUser);
            } else {
                // No hay redirección Y no hay sesión activa. El usuario no está logueado.
                console.log('🚫 No hay sesión activa. Mostrando landing page.');
                this.showLandingPage();
            }
            
            // En cualquier caso (con o sin usuario), la verificación ha terminado.
            return resolve(this.currentUser); // Resolvemos la promesa.
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

    console.log('📧 Intentando login con:', email);
    this.showAuthLoading('Iniciando sesión...');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login exitoso');
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

    if (password !== confirmPassword) {
      alert('⚠️ Las contraseñas no coinciden');
      return;
    }

    console.log('📧 Intentando registro con:', email);
    this.showAuthLoading('Creando cuenta...');

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Registro exitoso');
      alert('✅ Cuenta creada exitosamente!');
    } catch (error) {
      console.error('❌ Error en registro:', error);
      this.hideAuthLoading();
      this.handleAuthError(error);
    }
  },

  async loginWithGoogle() {
    console.log('🔑 Redirigiendo para login con Google...');
    this.showAuthLoading('Redirigiendo a Google...');

    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error('❌ Error al iniciar redirección con Google:', error);
      this.hideAuthLoading();
      this.handleAuthError(error);
    }
  },

  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      console.log('✅ Sesión cerrada');
      // No es necesario llamar a showLandingPage, onAuthStateChanged lo hará.
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      alert('Error al cerrar sesión');
    }
  },

  showLandingPage() {
    this.hideAuthLoading();
    const landingPage = document.getElementById('landingPage');
    const appDashboard = document.getElementById('appDashboard');
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
    this.hideAuthLoading();
    const landingPage = document.getElementById('landingPage');
    const appDashboard = document.getElementById('appDashboard');
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
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    if (userEmailDisplay && user) {
      userEmailDisplay.textContent = user.email;
    }
  },

  handleAuthError(error) {
    let message = 'Error en autenticación';
    switch (error.code) {
      case 'auth/invalid-email': message = '⚠️ Email inválido'; break;
      case 'auth/user-not-found': message = '⚠️ No existe cuenta con este email'; break;
      case 'auth/wrong-password': message = '⚠️ Contraseña incorrecta'; break;
      case 'auth/email-already-in-use': message = '⚠️ Este email ya está registrado'; break;
      case 'auth/weak-password': message = '⚠️ La contraseña es muy débil (mínimo 6 caracteres)'; break;
      default: message = `⚠️ Error: ${error.message}`;
    }
    alert(message);
  }
};

window.AuthHandler = AuthHandler;
