// js/firebase-config.js - Configuración de Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// 🔥 TU CONFIGURACIÓN DE FIREBASE
// REEMPLAZA ESTO con tu firebaseConfig del paso anterior
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",                    // ← Reemplazar
  authDomain: "viaje-japon.firebaseapp.com",    // ← Reemplazar
  projectId: "viaje-japon",                      // ← Reemplazar
  storageBucket: "viaje-japon.appspot.com",     // ← Reemplazar
  messagingSenderId: "123456789012",             // ← Reemplazar
  appId: "1:123456789012:web:XXXXX"             // ← Reemplazar
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
