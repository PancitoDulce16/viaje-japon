// js/login.js - Lógica específica para la página de login
import { AuthHandler } from '../core/auth.js';
import { Notifications } from '../core/notifications.js';
import '../core/firebase-config.js'; // Inicializar Firebase

class LoginManager {
    constructor() {
        this.currentForm = 'login';
        this.init();
    }

    async init() {
        try {
            console.log('🔐 Inicializando página de login...');
            
            // Inicializar notificaciones
            Notifications.init();
            
            // Inicializar Firebase Auth
            await AuthHandler.init();
            
            // Verificar si ya está autenticado
            const user = AuthHandler.currentUser;
            if (user) {
                console.log('✅ Usuario ya autenticado, redirigiendo al dashboard...');
                this.redirectToDashboard();
                return;
            }
            
            // Configurar eventos
            this.setupEventListeners();
            
            console.log('✅ Página de login inicializada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar página de login:', error);
            this.showError('Error al inicializar la aplicación. Por favor, recarga la página.');
        }
    }

    setupEventListeners() {
        // Formularios
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const googleLoginBtn = document.getElementById('googleLogin');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => this.handleGoogleLogin());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showError('Por favor, completa todos los campos');
            return;
        }

        try {
            this.showLoading('Iniciando sesión...');
            
            const user = await AuthHandler.signIn(email, password);
            
            if (user) {
                console.log('✅ Login exitoso:', user.email);
                Notifications.show('¡Bienvenido! Redirigiendo al dashboard...', 'success');
                
                // Redirigir al dashboard después de un breve delay
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showError(this.getAuthErrorMessage(error.code));
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (!email || !password || !confirmPassword) {
            this.showError('Por favor, completa todos los campos');
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

        try {
            this.showLoading('Creando cuenta...');
            
            const user = await AuthHandler.signUp(email, password);
            
            if (user) {
                console.log('✅ Registro exitoso:', user.email);
                Notifications.show('¡Cuenta creada exitosamente! Redirigiendo al dashboard...', 'success');
                
                // Redirigir al dashboard después de un breve delay
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showError(this.getAuthErrorMessage(error.code));
        }
    }

    async handleGoogleLogin() {
        try {
            this.showLoading('Iniciando sesión con Google...');
            
            const user = await AuthHandler.loginWithGoogle();
            
            if (user) {
                console.log('✅ Login con Google exitoso:', user.email);
                Notifications.show('¡Bienvenido! Redirigiendo al dashboard...', 'success');
                
                // Redirigir al dashboard después de un breve delay
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Error en login con Google:', error);
            this.showError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
        }
    }

    getAuthErrorMessage(errorCode) {
        const messages = {
            'auth/user-not-found': 'No existe una cuenta con este email',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/email-already-in-use': 'Ya existe una cuenta con este email',
            'auth/weak-password': 'La contraseña es demasiado débil',
            'auth/invalid-email': 'Email inválido',
            'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde',
            'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
            'auth/popup-closed-by-user': 'Se canceló el login con Google'
        };
        
        return messages[errorCode] || 'Error de autenticación. Inténtalo de nuevo.';
    }

    showLoading(message) {
        // Crear overlay de loading
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        loadingOverlay.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p class="text-gray-700 dark:text-gray-300">${message}</p>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    showError(message) {
        this.hideLoading();
        Notifications.show(message, 'error');
    }

    redirectToDashboard() {
        // Guardar información de autenticación en sessionStorage
        sessionStorage.setItem('authenticated', 'true');
        
        // Redirigir al dashboard
        window.location.href = '/dashboard.html';
    }
}

// Modules are deferred — DOM is already ready when this runs
new LoginManager();

// Exportar para uso en otros módulos si es necesario
export { LoginManager };
