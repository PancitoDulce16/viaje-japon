// js/firebase-config.js - Firebase client configuration
// ⚠️ NOTA: Este archivo SÍ debe estar en Git
// Las API keys de Firebase client-side son públicas por diseño
// La seguridad se maneja con Firestore Security Rules, no ocultando este archivo

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { setLogLevel } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';

// Silenciar warnings de Firestore offline (modo offline es esperado)
setLogLevel('error'); // Solo mostrar errores críticos, no warnings

const firebaseConfig = {
  apiKey: "AIzaSyAfydxW2angrEgZ7TT2PJxv7RGGUUiGbW4",
  authDomain: "japan-itin-dev.firebaseapp.com",
  projectId: "japan-itin-dev",
  storageBucket: "japan-itin-dev.firebasestorage.app",
  messagingSenderId: "545081226259",
  appId: "1:545081226259:web:d06fd9962e05d42d40fbe6",
  measurementId: "G-DJ00DQ3MC8"
};

// Initialize Firebase
let app = null;
let db = null;
let auth = null;
let storage = null;
let googleProvider = null;

if (firebaseConfig && firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  console.log('🔥 Firebase initialized for project:', firebaseConfig.projectId || '(unknown)');
} else {
  console.warn('⚠️ Firebase not initialized because configuration is missing or incomplete.');
}

export { app, db, auth, storage, googleProvider };
