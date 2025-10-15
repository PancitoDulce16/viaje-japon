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

  init() {
    console.log('🔐 Inicializando autenticación...');
    
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupLandingPage();
      });
    } else {
      this.setupLandingPage();
    }
    
    // CAMBIO: Manejar el resultado de la redirección al cargar la página
    this.handleRedirectResult();

    // Listener de cambios de autenticación (solo si auth está inicializado)
    if (typeof auth !== 'undefined' && auth) {
      try {
        onAuthStateChanged(auth, (user) => {
          this.currentUser = user;

          if (user) {
            console.log('✅ Usuario autenticado:', user.email);
            this.showAppDashboard();
            this.updateUserInfo(user);
          } else {
            console.log('⚠️ No hay usuario autenticado');
            this.showLandingPage();
          }
        });
      } catch (err) {
        console.error('❌ Error registrando onAuthStateChanged:', err);
        this.showLandingPage();
      }
    } else {
      console.warn('⚠️ Firebase Auth no está inicializado. Se mostrará la landing page sin sesión.');
      this.showLandingPage();
    }
  },

  // NUEVA FUNCIÓN: Maneja el resultado del login por redirección
  async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        // El usuario ha vuelto del inicio de sesión de Google
        console.log('✅ Redirección de Google exitosa:', result.user.email);
      }
    } catch (error) {
      console.error('❌ Error en el resultado de la redirección:', error);
      this.handleAuthError(error);
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
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login exitoso');
    } catch (error) {
      console.error('❌ Error en login:', error);
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
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Registro exitoso');
      alert('✅ Cuenta creada exitosamente!');
    } catch (error) {
      console.error('❌ Error en registro:', error);
      this.handleAuthError(error);
    }
  },

  // CAMBIO: Login con Google ahora usa redirección
  async loginWithGoogle() {
    console.log('🔑 Redirigiendo para login con Google...');
    try {
      await signInWithRedirect(auth, googleProvider);
      // La página se redirigirá, así que no se ejecutará más código aquí.
    } catch (error) {
      console.error('❌ Error al iniciar redirección con Google:', error);
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
