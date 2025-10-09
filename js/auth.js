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
    
    this.setupLandingPage();
    
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

  setupLandingPage() {
    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');
    const loginForm = document.getElementById('landingLoginForm');
    const registerForm = document.getElementById('landingRegisterForm');

    if (loginTabBtn) {
      loginTabBtn.addEventListener('click', () => {
        loginTabBtn.classList.add('border-blue-500', 'text-blue-600');
        loginTabBtn.classList.remove('border-transparent', 'text-gray-500');
        registerTabBtn.classList.remove('border-green-500', 'text-green-600');
        registerTabBtn.classList.add('border-transparent', 'text-gray-500');
        
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      });
    }

    if (registerTabBtn) {
      registerTabBtn.addEventListener('click', () => {
        registerTabBtn.classList.add('border-green-500', 'text-green-600');
        registerTabBtn.classList.remove('border-transparent', 'text-gray-500');
        loginTabBtn.classList.remove('border-blue-500', 'text-blue-600');
        loginTabBtn.classList.add('border-transparent', 'text-gray-500');
        
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLandingLogin();
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLandingRegister();
      });
    }

    const googleBtn = document.getElementById('landingGoogleLogin');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        this.loginWithGoogle();
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  },

  async handleLandingLogin() {
    const email = document.getElementById('landingLoginEmail').value;
    const password = document.getElementById('landingLoginPassword').value;

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

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Registro exitoso');
      alert('✅ Cuenta creada exitosamente!');
    } catch (error) {
      console.error('❌ Error en registro:', error);
      this.handleAuthError(error);
    }
  },

  async loginWithGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log('✅ Login con Google exitoso');
    } catch (error) {
      console.error('❌ Error en login con Google:', error);
      this.handleAuthError(error);
    }
  },

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
    
    if (landingPage) landingPage.classList.remove('hidden');
    if (appDashboard) appDashboard.classList.add('hidden');
  },

  showAppDashboard() {
    const landingPage = document.getElementById('landingPage');
    const appDashboard = document.getElementById('appDashboard');
    
    if (landingPage) landingPage.classList.add('hidden');
    if (appDashboard) appDashboard.classList.remove('hidden');
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
    }
    
    alert(message);
  }
};

window.AuthHandler = AuthHandler;
