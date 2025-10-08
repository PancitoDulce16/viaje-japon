// js/firebase-config.js - Configuración de Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// 🔥 TU CONFIGURACIÓN DE FIREBASE
// REEMPLAZA ESTO con tu firebaseConfig del paso anterior
const firebaseConfig = {
  apiKey: "AIzaSyAfydxW2angrEgZ7TT2PJxv7RGGUUiGbW4",
  authDomain: "japan-itin-dev.firebaseapp.com",
  projectId: "japan-itin-dev",
  storageBucket: "japan-itin-dev.firebasestorage.app",
  messagingSenderId: "545081226259",
  appId: "1:545081226259:web:d06fd9962e05d42d40fbe6",
  measurementId: "G-DJ00DQ3MC8
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Exportar para usar en otros archivos
export { app, db, auth, storage };

console.log('🔥 Firebase inicializado correctamente');
