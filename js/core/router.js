// js/router.js - Sistema de routing simple para la aplicación
class Router {
    constructor() {
        this.routes = {
            '/': 'login.html',
            '/login': 'login.html',
            '/dashboard': 'dashboard.html',
            '/index.html': 'login.html'
        };
        
        this.currentRoute = window.location.pathname;
        this.init();
    }

    init() {
        // Configurar eventos de navegación
        this.setupNavigationEvents();
        
        // Manejar navegación inicial
        this.handleInitialNavigation();
        
        console.log('✅ Router inicializado');
    }

    setupNavigationEvents() {
        // Interceptar enlaces internos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && this.isInternalLink(link.href)) {
                e.preventDefault();
                this.navigate(link.pathname);
            }
        });

        // Manejar navegación del navegador (back/forward)
        window.addEventListener('popstate', (e) => {
            this.currentRoute = window.location.pathname;
            this.handleRouteChange();
        });
    }

    isInternalLink(href) {
        try {
            const url = new URL(href, window.location.origin);
            return url.origin === window.location.origin;
        } catch {
            return false;
        }
    }

    navigate(pathname) {
        if (this.currentRoute === pathname) return;

        // Actualizar la URL sin recargar la página
        window.history.pushState({}, '', pathname);
        this.currentRoute = pathname;
        
        this.handleRouteChange();
    }

    handleInitialNavigation() {
        // Verificar si la ruta actual es válida
        const targetPage = this.routes[this.currentRoute];
        
        if (targetPage && !this.isCurrentPage(targetPage)) {
            // Redirigir a la página correcta
            window.location.href = targetPage;
        }
    }

    handleRouteChange() {
        const targetPage = this.routes[this.currentRoute];
        
        if (targetPage) {
            // Cargar la página correspondiente
            this.loadPage(targetPage);
        } else {
            // Página no encontrada - redirigir al login
            this.navigate('/');
        }
    }

    isCurrentPage(page) {
        return window.location.pathname === `/${page}` || 
               window.location.pathname === page;
    }

    loadPage(page) {
        // Para una SPA simple, redirigir a la página
        if (!this.isCurrentPage(page)) {
            window.location.href = page;
        }
    }

    // Método para navegar programáticamente
    goTo(route) {
        this.navigate(route);
    }

    // Método para obtener la ruta actual
    getCurrentRoute() {
        return this.currentRoute;
    }

    // Método para verificar si una ruta está activa
    isActiveRoute(route) {
        return this.currentRoute === route;
    }
}

// Crear instancia global del router
window.router = new Router();

// Exportar para uso en otros módulos
export { Router };
