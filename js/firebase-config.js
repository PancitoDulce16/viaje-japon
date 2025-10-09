// js/firebase-config.js - Configuración de Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// 🔥 TU CONFIGURACIÓN DE FIREBASE
// REEMPLAZA TODO ESTE OBJETO con el que copiaste de Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAfydxW2angrEgZ7TT2PJxv7RGGUUiGbW4",
  authDomain: "japan-itin-dev.firebaseapp.com",
  projectId: "japan-itin-dev",
  storageBucket: "japan-itin-dev.firebasestorage.app",
  messagingSenderId: "545081226259",
  appId: "1:545081226259:web:d06fd9962e05d42d40fbe6",

};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Exportar para usar en otros archivos
export { app, db, auth, storage, googleProvider };

console.log('🔥 Firebase inicializado correctamente');
console.log('✅ Proyecto:', firebaseConfig.projectId);
