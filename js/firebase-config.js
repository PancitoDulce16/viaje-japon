// js/firebase-config.js - Runtime loader (safe stub)
// This file should NOT contain secrets in the repository. During CI/deploy a generated
// version will be created from secrets. For local development copy js/firebase-config.example.js
// to js/firebase-config.js and fill values.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Accept runtime config via window.FIREBASE_CONFIG or a generated file that sets window.FIREBASE_CONFIG.
const cfg = (typeof window !== 'undefined' && window.FIREBASE_CONFIG) ? window.FIREBASE_CONFIG : null;

if (!cfg || !cfg.apiKey) {
  console.warn('Firebase config not found. Create js/firebase-config.js from js/firebase-config.example.js or set window.FIREBASE_CONFIG before initializing.');
}

const firebaseConfig = cfg || {};

// Initialize Firebase only if config present
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
