/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  👤 USER PROFILE WIDGET
 *  Widget de perfil kawaii fijo en esquina superior derecha
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

(function() {
    'use strict';

    // Crear widget de perfil cuando el DOM esté listo
    function createUserProfileWidget() {
        // Verificar si ya existe
        if (document.getElementById('user-profile-widget')) {
            return;
        }

        // Crear el widget
        const widget = document.createElement('div');
        widget.id = 'user-profile-widget';

        // Obtener email del usuario de Firebase Auth
        const user = firebase.auth().currentUser;
        const userEmail = user ? user.email : '';

        // Obtener inicial del email
        const initial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

        widget.innerHTML = `
            <div class="user-avatar">${initial}</div>
            <div class="user-email-text" title="${userEmail}">${userEmail}</div>
        `;

        // Añadir al body
        document.body.appendChild(widget);

        // Hacer click para mostrar menú de usuario (futuro)
        widget.addEventListener('click', () => {
            // Aquí puedes añadir un menú desplegable en el futuro
            console.log('User profile clicked');
        });
    }

    // Esperar a que Firebase Auth esté listo
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Pequeño delay para asegurar que el DOM está completamente cargado
            setTimeout(createUserProfileWidget, 100);
        }
    });

    // También intentar crear cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(createUserProfileWidget, 200);
        });
    } else {
        setTimeout(createUserProfileWidget, 100);
    }
})();
