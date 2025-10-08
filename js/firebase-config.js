// js/firebase-config.js - Configuración de Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// 🔥 TU CONFIGURACIÓN DE FIREBASE
// REEMPLAZA TODO ESTE OBJETO con el que copiaste de Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",                    // ← REEMPLAZAR
  authDomain: "viaje-japon-xxxxx.firebaseapp.com",            // ← REEMPLAZAR
  projectId: "viaje-japon-xxxxx",                             // ← REEMPLAZAR
  storageBucket: "viaje-japon-xxxxx.appspot.com",            // ← REEMPLAZAR
  messagingSenderId: "123456789012",                          // ← REEMPLAZAR
  appId: "1:123456789012:web:abcdef123456"                   // ← REEMPLAZAR
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
console.log('✅ Proyecto:', firebaseConfig.projectId);
