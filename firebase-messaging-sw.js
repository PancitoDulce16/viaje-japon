// firebase-messaging-sw.js - Service worker dedicado de Firebase Cloud Messaging
// Debe vivir en la raíz del sitio (no en /js/) porque su scope por defecto es "/".
// Usa los scripts "compat" porque los service workers no soportan imports ES
// module-style del SDK modular sin bundler.

importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

// Mismos valores públicos que js/core/firebase-config.js (las API keys de
// Firebase client-side son públicas por diseño, la seguridad va en las
// Firestore Security Rules, no en ocultar esto).
firebase.initializeApp({
  apiKey: "AIzaSyAfydxW2angrEgZ7TT2PJxv7RGGUUiGbW4",
  authDomain: "japan-itin-dev.firebaseapp.com",
  projectId: "japan-itin-dev",
  storageBucket: "japan-itin-dev.firebasestorage.app",
  messagingSenderId: "545081226259",
  appId: "1:545081226259:web:d06fd9962e05d42d40fbe6"
});

const messaging = firebase.messaging();

// Notificaciones push recibidas con la app en segundo plano / cerrada
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje en segundo plano:', payload);

  const notificationTitle = payload.notification?.title || 'Japitin';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/images/icons/icon-192.png',
    badge: '/images/icons/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
