// js/firebase-config.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// PEGA TU CONFIG AQUÍ
const firebaseConfig = {
  apiKey: "AIzaSyAfydxW2angrEgZ7TT2PJxv7RGGUUiGbW4",
  authDomain: "japan-itin-dev.firebaseapp.com",
  projectId: "japan-itin-dev",
  storageBucket: "japan-itin-dev.firebasestorage.app",
  messagingSenderId: "545081226259",
  appId: "1:545081226259:web:d06fd9962e05d42d40fbe6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };

console.log('🔥 Firebase inicializado correctamente');
