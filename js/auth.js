import { auth, googleProvider } from './firebase-config.js';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect, // CAMBIO: Usaremos redirección en lugar de popup
  getRedirectResult,  // CAMBIO: Para obtener el resultado después de volver
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

export const AuthHandler = {
  currentUser: null,
  _authReadyPromise: null,
  _authReadyResolve: null,

  showAuthLoading(message = 'Verificando autenticación...') {
    const landingPage = document.getElementById('landingPage');
    const appDashboard = document.getElementById('appDashboard');

    // Hide both pages
    if (landingPage) landingPage.classList.add('hidden');
    if (appDashboard) appDashboard.classList.add('hidden');

    // Show loading screen
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

  async init() {
    console.log('🔐 Inicializando autenticación...');

    // Show loading screen
    this.showAuthLoading('Iniciando aplicación...');

    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    this.setupLandingPage();

    // IMPORTANT: Wait for redirect result BEFORE setting up onAuthStateChanged
    // This ensures we process Google login before checking auth state
    console.log('⏳ Verificando resultado de redirección de Google...');
    this.showAuthLoading('Procesando inicio de sesión...');
    await this.handleRedirectResult();
    console.log('✅ Resultado de redirección procesado');

    // Create a promise that resolves when auth state is determined
    return new Promise((resolve, reject) => {
      // Listener de cambios de autenticación (solo si auth está inicializado)
      if (typeof auth !== 'undefined' && auth) {
        try {
          let authCheckCount = 0;
          let resolved = false;
          let unsubscribe;

          // Timeout de 5 segundos (aumentado desde 1s) para dar más tiempo a Firebase
          const timeout = setTimeout(() => {
            if (!resolved) {
              console.warn('⚠️ Auth state check timeout después de 5 segundos');
              this.showLandingPage();
              resolved = true;
              if (unsubscribe) unsubscribe();
              resolve(null);
            }
          }, 5000);

          unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
              authCheckCount++;
              this.currentUser = user;

              console.log(`🔍 Auth check #${authCheckCount}:`, user ? `Usuario: ${user.email}` : 'Sin usuario');

              if (user) {
                console.log('✅ Usuario autenticado:', user.email);
                this.showAppDashboard();
                this.updateUserInfo(user);

                // Resolve with user and unsubscribe
                if (!resolved) {
                  clearTimeout(timeout);
                  resolved = true;
                  unsubscribe();
                  resolve(user);
                }
              } else if (authCheckCount === 1) {
                // First check with no user - wait for potential second check
                console.log('⏳ Primera verificación sin usuario, esperando posible actualización...');
                // El timeout global manejará la resolución
              } else if (authCheckCount > 1 && !user) {
                // Second check still no user - resolve immediately
                console.log('⚠️ Segunda verificación confirma: no hay usuario');
                if (!resolved) {
                  clearTimeout(timeout);
                  this.showLandingPage();
                  resolved = true;
                  unsubscribe();
                  resolve(null);
                }
              }
            },
            (error) => {
              // Error handler para onAuthStateChanged
              clearTimeout(timeout);
              console.error('❌ Error en auth state changed:', error);
              this.showLandingPage();
              if (unsubscribe) unsubscribe();
              if (!resolved) {
                resolved = true;
                reject(error);
              }
            }
          );
        } catch (err) {
          console.error('❌ Error registrando onAuthStateChanged:', err);
          this.showLandingPage();
          reject(err);
        }
      } else {
        const error = new Error('Firebase Auth no está inicializado');
        console.error('❌', error);
        this.showLandingPage();
        reject(error);
      }
    });
  },

  // NUEVA FUNCIÓN: Maneja el resultado del login por redirección
  async handleRedirectResult() {
    try {
      console.log('📥 Llamando a getRedirectResult...');
      const result = await getRedirectResult(auth);
      console.log('📦 Resultado de getRedirectResult:', result ? `Usuario: ${result.user.email}` : 'null (no hay redirect pendiente)');

      if (result) {
        // El usuario ha vuelto del inicio de sesión de Google
        console.log('✅ Redirección de Google exitosa:', result.user.email);
        return result;
      } else {
        console.log('ℹ️ No hay resultado de redirección (carga normal de página)');
        return null;
      }
    } catch (error) {
      console.error('❌ Error en el resultado de la redirección:', error);
      this.handleAuthError(error);
      return null;
    }
  },

  // Setup de la landing page
  setupLandingPage() {
    console.log('🎨 Setup de landing page');
    
    // ... (El código de los tabs de Login/Register no cambia) ...
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

    // Google login button
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

    setTimeout(() => {
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          console.log('🔘 Click en logout');
          this.logout();
        });
        console.log('✅ Event listener de logout agregado');
      }
    }, 500);
  },

  // ... (Las funciones de login y registro con email/contraseña no cambian) ...
  async handleLandingLogin() {
    const email = document.getElementById('landingLoginEmail').value;
    const password = document.getElementById('landingLoginPassword').value;

    console.log('📧 Intentando login con:', email);
    this.showAuthLoading('Iniciando sesión...');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login exitoso');
      // Loading screen will be hidden by showAppDashboard
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
      // Loading screen will be hidden by showAppDashboard
    } catch (error) {
      console.error('❌ Error en registro:', error);
      this.hideAuthLoading();
      this.handleAuthError(error);
    }
  },

  // CAMBIO: Login con Google ahora usa redirección
  async loginWithGoogle() {
    console.log('🔑 Redirigiendo para login con Google...');
    this.showAuthLoading('Redirigiendo a Google...');

    try {
      await signInWithRedirect(auth, googleProvider);
      // La página se redirigirá, así que no se ejecutará más código aquí.
      // Loading screen will remain visible during redirect
    } catch (error) {
      console.error('❌ Error al iniciar redirección con Google:', error);
      this.hideAuthLoading();
      this.handleAuthError(error);
    }
  },

  // ... (El resto de las funciones no cambian) ...
  async logout() {
    try {
      await signOut(auth);
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      alert('Error al cerrar sesión');
    }
  },

  showLandingPage() {
    this.hideAuthLoading(); // Hide loading screen first
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
    this.hideAuthLoading(); // Hide loading screen first
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
    if (userEmailDisplay) {
      userEmailDisplay.textContent = user.email;
    }
  },

  handleAuthError(error) {
    let message = 'Error en autenticación';
    switch (error.code) {
      case 'auth/invalid-email':
        message = '⚠️ Email inválido';
        break;
      case 'auth/user-not-found':
        message = '⚠️ No existe cuenta con este email';
        break;
      case 'auth/wrong-password':
        message = '⚠️ Contraseña incorrecta';
        break;
      case 'auth/email-already-in-use':
        message = '⚠️ Este email ya está registrado';
        break;
      case 'auth/weak-password':
        message = '⚠️ La contraseña es muy débil (mínimo 6 caracteres)';
        break;
      // Ya no son necesarios los errores de popup
      default:
        message = `⚠️ Error: ${error.message}`;
    }
    alert(message);
  }
};

window.AuthHandler = AuthHandler;
