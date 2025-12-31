// js/feedback-tracker.js - Sistema de Feedback para Machine Learning

import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { Notifications } from './notifications.js';

/**
 * 🎯 Sistema de Feedback del Usuario
 * Recolecta datos de interacciones para entrenar modelos de ML
 * @namespace FeedbackTracker
 */
export const FeedbackTracker = {
  sessionData: {
    clicks: [],
    views: [],
    likes: [],
    dislikes: [],
    sessionStart: Date.now()
  },

  /**
   * Inicializar sistema de feedback
   */
  init() {
    console.log('🎯 Feedback Tracker initialized');
    this.setupEventListeners();
    this.startSessionTracking();
  },

  /**
   * Setup de event listeners globales
   */
  setupEventListeners() {
    // Track clicks en actividades
    document.addEventListener('click', (e) => {
      const activityCard = e.target.closest('[data-activity-id]');
      if (activityCard) {
        const activityId = activityCard.dataset.activityId;
        const activityName = activityCard.dataset.activityName || 'Unknown';
        this.trackClick(activityId, activityName);
      }

      // Track likes
      if (e.target.closest('.like-activity-btn')) {
        const btn = e.target.closest('.like-activity-btn');
        const activityId = btn.dataset.activityId;
        const activityName = btn.dataset.activityName;
        this.trackLike(activityId, activityName);
      }

      // Track dislikes
      if (e.target.closest('.dislike-activity-btn')) {
        const btn = e.target.closest('.dislike-activity-btn');
        const activityId = btn.dataset.activityId;
        const activityName = btn.dataset.activityName;
        this.trackDislike(activityId, activityName);
      }
    });
  },

  /**
   * Iniciar tracking de sesión
   */
  startSessionTracking() {
    this.sessionData.sessionStart = Date.now();

    // Guardar sesión cada 5 minutos
    setInterval(() => {
      this.saveSessionData();
    }, 5 * 60 * 1000);

    // Guardar al cerrar página
    window.addEventListener('beforeunload', () => {
      this.saveSessionData();
    });
  },

  /**
   * Track click en actividad
   */
  trackClick(activityId, activityName) {
    const clickData = {
      activityId,
      activityName,
      timestamp: Date.now(),
      type: 'click'
    };

    this.sessionData.clicks.push(clickData);
    console.log('👆 Click tracked:', activityName);
  },

  /**
   * Track tiempo de visualización de actividad
   */
  trackView(activityId, activityName, viewDuration) {
    const viewData = {
      activityId,
      activityName,
      viewDuration,
      timestamp: Date.now(),
      type: 'view'
    };

    this.sessionData.views.push(viewData);
    console.log('👁️ View tracked:', activityName, `${viewDuration}ms`);
  },

  /**
   * Track like de actividad
   */
  async trackLike(activityId, activityName) {
    if (!auth.currentUser) {
      Notifications.warning('Inicia sesión para guardar tus favoritos');
      return;
    }

    const likeData = {
      activityId,
      activityName,
      timestamp: Date.now(),
      type: 'like',
      userId: auth.currentUser.uid
    };

    this.sessionData.likes.push(likeData);

    // Guardar en Firestore
    try {
      const userDoc = doc(db, 'users', auth.currentUser.uid);

      // Primero verificar si el documento existe
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists()) {
        // Documento existe, actualizar
        console.log('✅ User doc exists, updating...');
        await updateDoc(userDoc, {
          likedActivities: arrayUnion({
            activityId,
            activityName,
            likedAt: new Date().toISOString()
          })
        });
      } else {
        // Documento no existe, crear
        console.log('📝 User doc does not exist, creating...');
        await setDoc(userDoc, {
          likedActivities: [{
            activityId,
            activityName,
            likedAt: new Date().toISOString()
          }],
          userId: auth.currentUser.uid,
          email: auth.currentUser.email,
          createdAt: new Date().toISOString()
        });
      }

      Notifications.success(`❤️ ${activityName} guardado en favoritos`);
      console.log('✅ Like saved successfully:', activityName);
    } catch (error) {
      console.error('❌ Error saving like - Full details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        userId: auth.currentUser?.uid
      });
      Notifications.error('Error al guardar favorito');
    }
  },

  /**
   * Track dislike de actividad
   */
  async trackDislike(activityId, activityName) {
    if (!auth.currentUser) {
      return;
    }

    console.log('🔍 DEBUG trackDislike - Starting:', {
      activityId,
      activityName,
      userId: auth.currentUser.uid
    });

    const dislikeData = {
      activityId,
      activityName,
      timestamp: Date.now(),
      type: 'dislike',
      userId: auth.currentUser.uid
    };

    this.sessionData.dislikes.push(dislikeData);

    // Guardar en Firestore
    try {
      const userDoc = doc(db, 'users', auth.currentUser.uid);

      // Primero verificar si el documento existe
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists()) {
        // Documento existe, actualizar
        await updateDoc(userDoc, {
          dislikedActivities: arrayUnion({
            activityId,
            activityName,
            dislikedAt: new Date().toISOString()
          })
        });
      } else {
        // Documento no existe, crear
        console.log('📝 User doc does not exist, creating...');
        await setDoc(userDoc, {
          dislikedActivities: [{
            activityId,
            activityName,
            dislikedAt: new Date().toISOString()
          }],
          userId: auth.currentUser.uid,
          email: auth.currentUser.email,
          createdAt: new Date().toISOString()
        });
      }

      Notifications.info(`👎 No verás más "${activityName}"`);
      console.log('✅ Dislike saved successfully:', activityName);
    } catch (error) {
      console.error('❌ Error saving dislike - Full details:', {
        code: error.code,
        message: error.message,
        userId: auth.currentUser?.uid
      });
    }
  },

  /**
   * Guardar datos de sesión en Firestore
   */
  async saveSessionData() {
    if (!auth.currentUser) {
      console.log('⚠️ No user logged in, skipping session save');
      return;
    }

    const sessionDuration = Date.now() - this.sessionData.sessionStart;
    const sessionId = `${auth.currentUser.uid}_${this.sessionData.sessionStart}`;

    try {
      const sessionDoc = doc(db, 'userSessions', sessionId);

      await setDoc(sessionDoc, {
        userId: auth.currentUser.uid,
        sessionStart: new Date(this.sessionData.sessionStart).toISOString(),
        sessionDuration,
        clicks: this.sessionData.clicks,
        views: this.sessionData.views,
        likes: this.sessionData.likes,
        dislikes: this.sessionData.dislikes,
        totalClicks: this.sessionData.clicks.length,
        totalViews: this.sessionData.views.length,
        totalLikes: this.sessionData.likes.length,
        totalDislikes: this.sessionData.dislikes.length,
        savedAt: new Date().toISOString()
      });

      console.log('✅ Session data saved successfully:', {
        clicks: this.sessionData.clicks.length,
        likes: this.sessionData.likes.length,
        dislikes: this.sessionData.dislikes.length
      });
    } catch (error) {
      console.error('❌ Error saving session data - Full details:', {
        code: error.code,
        message: error.message,
        sessionId: sessionId,
        userId: auth.currentUser?.uid
      });
    }
  },

  /**
   * Obtener actividades que le gustaron al usuario
   */
  async getUserLikedActivities() {
    if (!auth.currentUser) return [];

    try {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists()) {
        return userSnap.data().likedActivities || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting liked activities:', error);
      return [];
    }
  },

  /**
   * Obtener actividades que NO le gustaron al usuario
   */
  async getUserDislikedActivities() {
    if (!auth.currentUser) return [];

    try {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists()) {
        return userSnap.data().dislikedActivities || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting disliked activities:', error);
      return [];
    }
  },

  /**
   * Obtener estadísticas del usuario para ML
   */
  async getUserMLStats() {
    if (!auth.currentUser) return null;

    try {
      const liked = await this.getUserLikedActivities();
      const disliked = await this.getUserDislikedActivities();

      // Analizar patrones
      const likedCategories = {};
      const likedCities = {};
      const likedPriceRanges = {};

      liked.forEach(activity => {
        // Aquí podrías analizar más datos si guardas más info
        // Por ahora solo contamos
      });

      return {
        totalLikes: liked.length,
        totalDislikes: disliked.length,
        likedActivities: liked,
        dislikedActivities: disliked,
        preferenceRatio: liked.length / (liked.length + disliked.length) || 0
      };
    } catch (error) {
      console.error('Error getting ML stats:', error);
      return null;
    }
  },

  /**
   * Agregar botones de feedback a un elemento de actividad
   */
  addFeedbackButtons(activityElement, activityId, activityName) {
    const feedbackHTML = `
      <div class="feedback-buttons flex gap-2 mt-2">
        <button
          class="like-activity-btn px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors"
          data-activity-id="${activityId}"
          data-activity-name="${activityName}"
          title="Me gusta - Recomendar más como esta"
        >
          ❤️ Me gusta
        </button>
        <button
          class="dislike-activity-btn px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          data-activity-id="${activityId}"
          data-activity-name="${activityName}"
          title="No me interesa - No mostrar similar"
        >
          👎 No me interesa
        </button>
      </div>
    `;

    const container = activityElement.querySelector('.activity-content') || activityElement;
    container.insertAdjacentHTML('beforeend', feedbackHTML);
  }
};

// Exponer globalmente
window.FeedbackTracker = FeedbackTracker;

console.log('🎯 Feedback Tracker module loaded');

export default FeedbackTracker;
