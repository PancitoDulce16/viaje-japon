// js/auth.js - Sistema de Autenticación

import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

export const AuthHandler = {
  currentUser: null,

  // Inicializar - detecta cambios en auth state
  init() {
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
  },

  // Registrar nuevo usuario
  async register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Usuario registrado:', userCredential.user.email);
      alert('✅ ¡Cuenta creada exitosamente!');
      this.closeAuthModal();
      return userCredential.user;
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Mensajes de error en español
      const errorMessages = {
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/invalid-email': 'Email inválido',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/operation-not-allowed': 'Operación no permitida'
      };
      
      alert('❌ ' + (errorMessages[error.code] || 'Error al crear cuenta'));
      throw error;
    }
  },

  // Iniciar sesión
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sesión iniciada:', userCredential.user.email);
      alert('✅ ¡Bienvenido de vuelta!');
      this.closeAuthModal();
      return userCredential.user;
    } catch (error) {
      console.error('Error en login:', error);
      
      const errorMessages = {
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-email': 'Email inválido',
        'auth/user-disabled': 'Usuario deshabilitado',
        'auth/invalid-credential': 'Credenciales inválidas'
      };
      
      alert('❌ ' + (errorMessages[error.code] || 'Error al iniciar sesión'));
      throw error;
    }
  },

  // Login con Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Login con Google exitoso:', result.user.email);
      alert('✅ ¡Bienvenido!');
      this.closeAuthModal();
      return result.user;
    } catch (error) {
      console.error('Error en Google login:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        return; // Usuario cerró el popup, no mostrar error
      }
      
      alert('❌ Error al iniciar sesión con Google');
      throw error;
    }
  },

  // Cerrar sesión
  async logout() {
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
      authButton.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-sm hidden md:inline">${user.email}</span>
          <button 
            onclick="AuthHandler.logout()" 
            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
          >
            Salir
          </button>
        </div>
      `;
    }

    // Mostrar badge de sincronización en modales
    document.querySelectorAll('.sync-badge').forEach(badge => {
      badge.innerHTML = `
        <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
          <span class="text-sm">☁️ Sincronizado</span>
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
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition text-sm"
        >
          Iniciar Sesión
        </button>
      `;
    }

    // Mostrar badge de modo offline
    document.querySelectorAll('.sync-badge').forEach(badge => {
      badge.innerHTML = `
        <div class="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <span class="text-sm">📱 Modo offline</span>
        </div>
      `;
    });
  },

  // Mostrar modal de auth
  showAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  // Cerrar modal de auth
  closeAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // Manejar formulario de registro
  handleRegisterForm(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
      alert('❌ Las contraseñas no coinciden');
      return;
    }

    this.register(email, password);
  },

  // Manejar formulario de login
  handleLoginForm(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    this.login(email, password);
  }
};

// Exponer globalmente
window.AuthHandler = AuthHandler;
