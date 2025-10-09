// js/auth.js - Sistema de Autenticación con Landing Page

import { auth, googleProvider } from './firebase-config.js';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
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
    
    // Listener de cambios de autenticación
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
  },

  // Setup de la landing page
  setupLandingPage() {
    console.log('🎨 Setup de landing page');
    
    // Tabs de Login/Register
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

      // Login form
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLandingLogin();
      });

      // Register form
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

    // Logout button (para cuando esté en dashboard)
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

  // Login desde landing page
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

  // Registro desde landing page
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

  // Login con Google
  async loginWithGoogle() {
    console.log('🔑 Intentando login con Google...');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Login con Google exitoso:', result.user.email);
    } catch (error) {
      console.error('❌ Error en login con Google:', error);
      this.handleAuthError(error);
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      alert('Error al cerrar sesión');
    }
  },

  // Mostrar landing page
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

  // Mostrar dashboard de la app
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

  // Actualizar info del usuario en el header
  updateUserInfo(user) {
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    if (userEmailDisplay) {
      userEmailDisplay.textContent = user.email;
    }
  },

  // Manejo de errores de autenticación
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
      case 'auth/popup-closed-by-user':
        message = 'Inicio de sesión cancelado';
        break;
      case 'auth/cancelled-popup-request':
        message = 'Popup cerrado';
        break;
      default:
        message = `⚠️ Error: ${error.message}`;
    }
    
    alert(message);
  }
};

window.AuthHandler = AuthHandler;
