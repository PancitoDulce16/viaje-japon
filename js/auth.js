// js/auth.js - Sistema de Autenticación CON SEGURIDAD

import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

export const AuthHandler = {
  currentUser: null,

  // Inicializar - detecta cambios en auth state
  init() {
    // Verificar si Firebase está configurado
    if (!auth || !auth.app) {
      console.log('⚠️ Firebase no configurado - Modo offline');
      this.showUnauthenticatedUI();
      return;
    }

    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      
      if (user) {
        console.log('✅ Usuario autenticado:', user.email);
        this.showAuthenticatedUI(user);
      } else {
        console.log('❌ Usuario no autenticado');
        this.showUnauthenticatedUI();
      }
    });

    // Configurar event listeners del modal después de que se renderice
    this.setupModalListeners();
  },

  // Configurar event listeners del modal
  setupModalListeners() {
    // Esperar a que el modal se renderice
    setTimeout(() => {
      // Tabs switching
      const loginTab = document.getElementById('loginTab');
      const registerTab = document.getElementById('registerTab');
      const loginForm = document.getElementById('loginForm');
      const registerForm = document.getElementById('registerForm');

      if (loginTab) {
        loginTab.addEventListener('click', () => {
          this.switchToLoginTab();
        });
      }

      if (registerTab) {
        registerTab.addEventListener('click', () => {
          this.switchToRegisterTab();
        });
      }

      // Form submissions
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleLoginForm(e);
        });
      }

      if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleRegisterForm(e);
        });
      }

      // Forgot password link
      const forgotPasswordLink = document.getElementById('forgotPasswordLink');
      if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.showForgotPasswordPrompt();
        });
      }

      console.log('✅ Event listeners del modal configurados');
    }, 500);
  },

  // Cambiar a tab de login
  switchToLoginTab() {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginTab && registerTab && loginForm && registerForm) {
      loginTab.classList.add('border-blue-500', 'text-blue-600');
      loginTab.classList.remove('border-transparent', 'text-gray-500');
      registerTab.classList.remove('border-blue-500', 'text-blue-600');
      registerTab.classList.add('border-transparent', 'text-gray-500');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    }
  },

  // Cambiar a tab de registro
  switchToRegisterTab() {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginTab && registerTab && loginForm && registerForm) {
      registerTab.classList.add('border-blue-500', 'text-blue-600');
      registerTab.classList.remove('border-transparent', 'text-gray-500');
      loginTab.classList.remove('border-blue-500', 'text-blue-600');
      loginTab.classList.add('border-transparent', 'text-gray-500');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    }
  },

  // Registrar nuevo usuario
  async register(email, password) {
    if (!auth || !auth.app) {
      alert('⚠️ Firebase no está configurado. La app funciona en modo offline por ahora.');
      return;
    }

    try {
      console.log('🔄 Intentando registrar usuario:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Usuario registrado exitosamente:', userCredential.user.email);
      alert('✅ ¡Cuenta creada exitosamente!\n\nYa puedes usar todas las funciones de sincronización.');
      this.closeAuthModal();
      return userCredential.user;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      
      // Mensajes de error en español
      const errorMessages = {
        'auth/email-already-in-use': 'Este email ya está registrado. Intenta iniciar sesión.',
        'auth/invalid-email': 'Email inválido. Verifica el formato.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/operation-not-allowed': 'El registro con email/contraseña no está habilitado en Firebase Console.\n\n👉 Ve a Authentication > Sign-in method > Email/Password y actívalo.',
        'auth/network-request-failed': 'Error de red. Verifica tu conexión a internet.'
      };
      
      alert('❌ Error al crear cuenta:\n\n' + (errorMessages[error.code] || error.message));
      throw error;
    }
  },

  // Iniciar sesión
  async login(email, password) {
    if (!auth || !auth.app) {
      alert('⚠️ Firebase no está configurado. La app funciona en modo offline por ahora.');
      return;
    }

    try {
      console.log('🔄 Intentando iniciar sesión:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sesión iniciada exitosamente:', userCredential.user.email);
      alert('✅ ¡Bienvenido de vuelta!');
      this.closeAuthModal();
      return userCredential.user;
    } catch (error) {
      console.error('❌ Error en login:', error);
      console.error('Código de error:', error.code);
      
      const errorMessages = {
        'auth/user-not-found': 'Usuario no encontrado. ¿Necesitas registrarte?',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/invalid-email': 'Email inválido.',
        'auth/user-disabled': 'Usuario deshabilitado.',
        'auth/invalid-credential': 'Email o contraseña incorrectos.',
        'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde o restablece tu contraseña.',
        'auth/network-request-failed': 'Error de red. Verifica tu conexión a internet.'
      };
      
      alert('❌ Error al iniciar sesión:\n\n' + (errorMessages[error.code] || error.message));
      throw error;
    }
  },

  // Login con Google
  async loginWithGoogle() {
    if (!auth || !auth.app) {
      alert('⚠️ Firebase no está configurado. La app funciona en modo offline por ahora.');
      return;
    }

    try {
      console.log('🔄 Intentando login con Google...');
      const provider = new GoogleAuthProvider();
      
      // Forzar selección de cuenta
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Login con Google exitoso:', result.user.email);
      alert('✅ ¡Bienvenido!\n\nSesión iniciada con Google.');
      this.closeAuthModal();
      return result.user;
    } catch (error) {
      console.error('❌ Error en Google login:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Usuario cerró el popup');
        return;
      }

      if (error.code === 'auth/popup-blocked') {
        alert('❌ El popup fue bloqueado por tu navegador.\n\n👉 Habilita popups para este sitio.');
        return;
      }

      if (error.code === 'auth/unauthorized-domain') {
        alert('❌ Este dominio no está autorizado.\n\n👉 Ve a Firebase Console > Authentication > Settings > Authorized domains\n\nY agrega: ' + window.location.hostname);
        return;
      }
      
      alert('❌ Error al iniciar sesión con Google:\n\n' + error.message);
      throw error;
    }
  },

  // Restablecer contraseña
  async resetPassword(email) {
    if (!auth || !auth.app) {
      alert('⚠️ Firebase no está configurado.');
      return;
    }

    if (!email || !email.trim()) {
      alert('⚠️ Por favor ingresa tu email.');
      return;
    }

    try {
      console.log('🔄 Enviando email de recuperación a:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Email de recuperación enviado');
      alert('✅ ¡Email enviado!\n\nRevisa tu bandeja de entrada (y spam) para restablecer tu contraseña.\n\nEl link expira en 1 hora.');
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de recuperación:', error);
      
      const errorMessages = {
        'auth/invalid-email': 'Email inválido. Verifica el formato.',
        'auth/user-not-found': 'No existe una cuenta con este email.',
        'auth/too-many-requests': 'Demasiados intentos. Intenta de nuevo en unos minutos.',
        'auth/network-request-failed': 'Error de red. Verifica tu conexión a internet.'
      };
      
      alert('❌ Error al enviar email de recuperación:\n\n' + (errorMessages[error.code] || error.message));
      throw error;
    }
  },

  // Mostrar prompt para olvidé mi contraseña
  showForgotPasswordPrompt() {
    const email = prompt('🔑 Restablecer Contraseña\n\nIngresa tu email y te enviaremos un link para crear una nueva contraseña:');
    
    if (email) {
      this.resetPassword(email.trim());
    }
  },

  // Cerrar sesión
  async logout() {
    if (!auth || !auth.app) {
      alert('⚠️ Firebase no está configurado.');
      return;
    }

    try {
      await signOut(auth);
      console.log('✅ Sesión cerrada');
      alert('✅ Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('❌ Error al cerrar sesión');
    }
  },

  // UI cuando está autenticado
  showAuthenticatedUI(user) {
    // Actualizar header con info del usuario
    const authButton = document.getElementById('authButton');
    if (authButton) {
      const displayName = user.displayName || user.email.split('@')[0];
      authButton.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-sm hidden md:inline text-white">👋 ${displayName}</span>
          <button 
            onclick="AuthHandler.logout()" 
            class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition font-semibold"
          >
            Salir
          </button>
        </div>
      `;
    }

    // Mostrar badge de sincronización en modales
    document.querySelectorAll('.sync-badge').forEach(badge => {
      badge.innerHTML = `
        <div class="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <span class="text-sm text-green-600 dark:text-green-400">☁️ Sincronizado con Firebase</span>
        </div>
      `;
    });
  },

  // UI cuando NO está autenticado
  showUnauthenticatedUI() {
    const authButton = document.getElementById('authButton');
    if (authButton) {
      authButton.innerHTML = `
        <button 
          onclick="AuthHandler.showAuthModal()" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition text-sm font-semibold"
        >
          Iniciar Sesión
        </button>
      `;
    }

    // Mostrar badge de modo offline
    document.querySelectorAll('.sync-badge').forEach(badge => {
      badge.innerHTML = `
        <div class="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <span class="text-sm text-yellow-600 dark:text-yellow-400">📱 Modo offline - Inicia sesión para sincronizar</span>
        </div>
      `;
    });
  },

  // Mostrar modal de auth
  showAuthModal() {
    if (!auth || !auth.app) {
      alert('⚠️ Firebase no está configurado todavía.\n\n' +
            'La app funciona en modo offline.\n\n' + 
            'Tus datos se guardan solo en tu navegador.\n\n' +
            '👉 Para habilitar sincronización:\n' +
            '1. Configura firebase-config.js con tu proyecto\n' +
            '2. Recarga la página');
      return;
    }

    const modal = document.getElementById('modal-auth');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Reconfigurar listeners cada vez que se abre el modal
      this.setupModalListeners();
    }
  },

  // Cerrar modal de auth
  closeAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      
      // Limpiar formularios
      const loginForm = document.getElementById('loginForm');
      const registerForm = document.getElementById('registerForm');
      if (loginForm) loginForm.reset();
      if (registerForm) registerForm.reset();
    }
  },

  // Manejar formulario de registro
  handleRegisterForm(e) {
    e.preventDefault();
    console.log('📝 Formulario de registro enviado');
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    console.log('Email:', email);
    console.log('Password length:', password.length);

    // Validaciones de seguridad
    if (!email || !password || !confirmPassword) {
      alert('⚠️ Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      alert('❌ Las contraseñas no coinciden\n\nVerifica que ambas contraseñas sean iguales.');
      return;
    }

    if (password.length < 6) {
      alert('❌ Contraseña muy corta\n\nLa contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('❌ Email inválido\n\nVerifica que el formato sea correcto (ejemplo@dominio.com)');
      return;
    }

    // Validación de contraseña segura (recomendación)
    if (password.length < 8) {
      const proceed = confirm('⚠️ Contraseña débil\n\nTu contraseña tiene menos de 8 caracteres. Se recomienda usar al menos 8 caracteres.\n\n¿Deseas continuar de todas formas?');
      if (!proceed) return;
    }

    this.register(email, password);
  },

  // Manejar formulario de login
  handleLoginForm(e) {
    e.preventDefault();
    console.log('📝 Formulario de login enviado');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log('Email:', email);
    console.log('Password length:', password.length);

    if (!email || !password) {
      alert('⚠️ Por favor completa todos los campos');
      return;
    }
    
    this.login(email, password);
  }
};

// Exponer globalmente
window.AuthHandler = AuthHandler;
