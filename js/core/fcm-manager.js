// js/fcm-manager.js - Firebase Cloud Messaging Manager

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { db, auth } from './firebase-config.js';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { Notifications } from './notifications.js';

export const FCMManager = {
    messaging: null,
    vapidKey: 'BDSm_gI_3g8L-yC0G8zPz_...YOUR_VAPID_KEY_HERE...', // Reemplaza con tu VAPID key de Firebase

    async init() {
        console.log('🔔 Inicializando Firebase Cloud Messaging...');
        try {
            this.messaging = getMessaging();

            // Listener para notificaciones recibidas mientras la app está en primer plano
            onMessage(this.messaging, (payload) => {
                console.log('✉️ Mensaje recibido en primer plano: ', payload);
                Notifications.info(payload.notification.body, 8000, payload.notification.title);
            });

        } catch (error) {
            console.error('❌ No se pudo inicializar FCM:', error);
        }
    },

    async requestPermissionAndToken() {
        if (!this.messaging || !auth.currentUser) {
            console.warn('⚠️ FCM no inicializado o usuario no autenticado.');
            return;
        }

        console.log('🙏 Solicitando permiso para notificaciones...');
        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                console.log('✅ Permiso de notificación concedido.');
                const currentToken = await getToken(this.messaging, { vapidKey: this.vapidKey });

                if (currentToken) {
                    console.log('🔑 Token FCM obtenido:', currentToken);
                    await this.saveTokenToServer(currentToken);
                } else {
                    console.warn('⚠️ No se pudo obtener el token de registro. Solicita permiso de nuevo.');
                }
            } else {
                console.warn('🚫 Permiso de notificación denegado.');
            }
        } catch (error) {
            console.error('❌ Error al obtener el token FCM:', error);
        }
    },

    async saveTokenToServer(token) {
        if (!auth.currentUser) return;

        const userId = auth.currentUser.uid;
        const userProfileRef = doc(db, 'users', userId);

        try {
            const userDoc = await getDoc(userProfileRef);
            const userData = userDoc.exists() ? userDoc.data() : {};
            const tokens = userData.fcmTokens || [];

            if (!tokens.includes(token)) {
                tokens.push(token);
                await setDoc(userProfileRef, { fcmTokens: tokens }, { merge: true });
                console.log('✅ Token FCM guardado en el perfil del usuario.');
            } else {
                console.log('ℹ️ El token FCM ya existe para este usuario.');
            }
        } catch (error) {
            console.error('❌ Error al guardar el token en Firestore:', error);
        }
    }
};

// Exponer globalmente
window.FCMManager = FCMManager;

// Inicializar FCM cuando el usuario inicia sesión
window.addEventListener('auth:initialized', async () => {
    await FCMManager.init();
});