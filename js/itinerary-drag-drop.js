// js/itinerary-drag-drop.js - Sistema Drag & Drop para Itinerarios

import { db, auth } from './firebase-config.js';
import { Notifications } from './notifications.js';
import { doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const DragDropManager = {
  draggedElement: null,
  draggedActivity: null,
  draggedFromDay: null,
  originalIndex: null,

  init() {
    console.log('🎯 Inicializando Drag & Drop Manager');
    this.setupDragListeners();
  },

  setupDragListeners() {
    // Usar event delegation en el contenedor principal
    document.addEventListener('dragstart', this.handleDragStart.bind(this));
    document.addEventListener('dragend', this.handleDragEnd.bind(this));
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
    document.addEventListener('dragenter', this.handleDragEnter.bind(this));
    document.addEventListener('dragleave', this.handleDragLeave.bind(this));
  },

  makeActivitiesDraggable() {
    const activities = document.querySelectorAll('.activity-card');
    
    activities.forEach((card, index) => {
      card.setAttribute('draggable', 'true');
      card.dataset.activityIndex = index;
      card.style.cursor = 'move';
      
      // Agregar icono de drag
      if (!card.querySelector('.drag-handle')) {
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-move';
        dragHandle.innerHTML = '⋮⋮';
        dragHandle.style.fontSize = '20px';
        card.style.position = 'relative';
        card.insertBefore(dragHandle, card.firstChild);
      }
    });
  },

  handleDragStart(e) {
    const card = e.target.closest('.activity-card');
    if (!card) return;

    this.draggedElement = card;
    this.draggedFromDay = parseInt(document.querySelector('.day-btn.bg-red-600')?.dataset.day);
    this.originalIndex = parseInt(card.dataset.activityIndex);

    // Obtener datos de la actividad
    const activityId = card.querySelector('.activity-checkbox')?.dataset.id;
    this.draggedActivity = { id: activityId, index: this.originalIndex };

    card.classList.add('opacity-50', 'scale-95');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', card.innerHTML);

    console.log('🎯 Drag Start:', { day: this.draggedFromDay, index: this.originalIndex });
  },

  handleDragEnd(e) {
    const card = e.target.closest('.activity-card');
    if (!card) return;

    card.classList.remove('opacity-50', 'scale-95');
    
    // Limpiar todos los indicadores
    document.querySelectorAll('.activity-card').forEach(c => {
      c.classList.remove('border-t-4', 'border-blue-500', 'border-b-4');
    });

    console.log('🎯 Drag End');
  },

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const card = e.target.closest('.activity-card');
    if (!card || card === this.draggedElement) return;

    const rect = card.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    
    // Limpiar otros indicadores
    document.querySelectorAll('.activity-card').forEach(c => {
      if (c !== card) {
        c.classList.remove('border-t-4', 'border-blue-500', 'border-b-4');
      }
    });

    // Mostrar indicador arriba o abajo
    if (e.clientY < midpoint) {
      card.classList.add('border-t-4', 'border-blue-500');
      card.classList.remove('border-b-4');
    } else {
      card.classList.add('border-b-4', 'border-blue-500');
      card.classList.remove('border-t-4');
    }
  },

  handleDragEnter(e) {
    e.preventDefault();
  },

  handleDragLeave(e) {
    const card = e.target.closest('.activity-card');
    if (!card) return;
    
    // Solo remover si realmente salimos del elemento
    if (!card.contains(e.relatedTarget)) {
      card.classList.remove('border-t-4', 'border-blue-500', 'border-b-4');
    }
  },

  async handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    const targetCard = e.target.closest('.activity-card');
    if (!targetCard || targetCard === this.draggedElement) {
      this.cleanup();
      return;
    }

    const targetIndex = parseInt(targetCard.dataset.activityIndex);
    const rect = targetCard.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const dropBelow = e.clientY > midpoint;

    // Calcular nuevo índice
    let newIndex = dropBelow ? targetIndex + 1 : targetIndex;
    
    // Ajustar si se mueve hacia abajo en el mismo día
    if (this.originalIndex < newIndex && this.draggedFromDay === parseInt(document.querySelector('.day-btn.bg-red-600')?.dataset.day)) {
      newIndex--;
    }

    console.log('🎯 Drop:', { from: this.originalIndex, to: newIndex });

    // Reordenar actividades
    await this.reorderActivities(this.draggedFromDay, this.originalIndex, newIndex);

    this.cleanup();
  },

  cleanup() {
    document.querySelectorAll('.activity-card').forEach(card => {
      card.classList.remove('border-t-4', 'border-blue-500', 'border-b-4', 'opacity-50', 'scale-95');
    });
    
    this.draggedElement = null;
    this.draggedActivity = null;
    this.draggedFromDay = null;
    this.originalIndex = null;
  },

  async reorderActivities(dayNumber, fromIndex, toIndex) {
    if (fromIndex === toIndex) return;

    try {
      const tripId = window.TripsManager?.currentTrip?.id;
      if (!tripId) {
        Notifications.error('No hay viaje seleccionado');
        return;
      }

      const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
      const itinerarySnap = await getDoc(itineraryRef);
      
      if (!itinerarySnap.exists()) {
        Notifications.error('No se encontró el itinerario');
        return;
      }

      const itinerary = itinerarySnap.data();
      const day = itinerary.days.find(d => d.day === dayNumber);
      
      if (!day) {
        Notifications.error('No se encontró el día');
        return;
      }

      // Reordenar array
      const [movedActivity] = day.activities.splice(fromIndex, 1);
      day.activities.splice(toIndex, 0, movedActivity);

      // Recalcular horarios automáticamente
      this.recalculateTimes(day.activities);

      // Guardar en Firebase
      await updateDoc(itineraryRef, { days: itinerary.days });

      Notifications.success('✨ Actividad reordenada!');
      
      // Re-renderizar
      if (window.ItineraryHandler?.reinitialize) {
        await window.ItineraryHandler.reinitialize();
      }

    } catch (error) {
      console.error('❌ Error reordenando:', error);
      Notifications.error('Error al reordenar actividad');
    }
  },

  recalculateTimes(activities) {
    let currentTime = { hours: 9, minutes: 0 }; // Empieza a las 9 AM

    activities.forEach(activity => {
      // Formatear hora
      activity.time = `${String(currentTime.hours).padStart(2, '0')}:${String(currentTime.minutes).padStart(2, '0')}`;
      
      // Calcular siguiente hora basado en duración
      const duration = activity.duration || 60;
      currentTime.minutes += duration;
      
      // Ajustar horas
      while (currentTime.minutes >= 60) {
        currentTime.hours++;
        currentTime.minutes -= 60;
      }

      // Agregar tiempo de traslado (15 min entre actividades)
      currentTime.minutes += 15;
      if (currentTime.minutes >= 60) {
        currentTime.hours++;
        currentTime.minutes -= 60;
      }
    });

    console.log('⏰ Horarios recalculados automáticamente');
  },

  // Mover actividad a otro día
  async moveToDay(activityId, fromDay, toDay) {
    try {
      const tripId = window.TripsManager?.currentTrip?.id;
      if (!tripId) return;

      const itineraryRef = doc(db, `trips/${tripId}/data`, 'itinerary');
      const itinerarySnap = await getDoc(itineraryRef);
      
      if (!itinerarySnap.exists()) return;

      const itinerary = itinerarySnap.data();
      const sourceDayData = itinerary.days.find(d => d.day === fromDay);
      const targetDayData = itinerary.days.find(d => d.day === toDay);
      
      if (!sourceDayData || !targetDayData) return;

      // Encontrar y mover actividad
      const activityIndex = sourceDayData.activities.findIndex(a => a.id === activityId);
      if (activityIndex === -1) return;

      const [activity] = sourceDayData.activities.splice(activityIndex, 1);
      targetDayData.activities.push(activity);

      // Recalcular horarios en ambos días
      this.recalculateTimes(sourceDayData.activities);
      this.recalculateTimes(targetDayData.activities);

      await updateDoc(itineraryRef, { days: itinerary.days });

      Notifications.success(`Movido a Día ${toDay}!`);
      
      if (window.ItineraryHandler?.reinitialize) {
        await window.ItineraryHandler.reinitialize();
      }

    } catch (error) {
      console.error('❌ Error moviendo actividad:', error);
      Notifications.error('Error al mover actividad');
    }
  }
};

window.DragDropManager = DragDropManager;
