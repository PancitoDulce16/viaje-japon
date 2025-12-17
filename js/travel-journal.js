/**
 * 📔 TRAVEL JOURNAL
 * =================
 *
 * Personal travel diary to record experiences, memories, and photos
 * No external APIs required - uses Firebase + localStorage
 */

import { db, auth } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  where
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export class TravelJournal {
  constructor() {
    this.entries = [];
    this.initialized = false;
    this.currentTripId = null;
    this.unsubscribe = null;
  }

  /**
   * Initialize journal
   */
  async initialize() {
    if (this.initialized) return;

    console.log('📔 Travel Journal initializing...');

    // Get current trip ID
    this.currentTripId = this.getCurrentTripId();

    // Load entries
    await this.loadEntries();

    // Setup UI
    this.setupUI();

    // Setup real-time sync
    if (this.currentTripId && auth.currentUser) {
      this.setupRealtimeSync();
    }

    this.initialized = true;
    console.log('✅ Travel Journal ready with', this.entries.length, 'entries');
  }

  /**
   * Get current trip ID
   */
  getCurrentTripId() {
    if (window.TripsManager && window.TripsManager.currentTrip) {
      return window.TripsManager.currentTrip.id;
    }
    return localStorage.getItem('currentTripId');
  }

  /**
   * Load entries from Firebase or localStorage
   */
  async loadEntries() {
    // Try Firebase first
    if (this.currentTripId && auth.currentUser) {
      try {
        const entriesRef = collection(db, `trips/${this.currentTripId}/journal`);
        const q = query(entriesRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);

        this.entries = [];
        snapshot.forEach((doc) => {
          this.entries.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Save to localStorage as backup
        localStorage.setItem('journal_entries', JSON.stringify(this.entries));
      } catch (error) {
        console.error('❌ Error loading from Firebase:', error);
        this.loadFromLocalStorage();
      }
    } else {
      this.loadFromLocalStorage();
    }
  }

  /**
   * Load from localStorage
   */
  loadFromLocalStorage() {
    const stored = localStorage.getItem('journal_entries');
    this.entries = stored ? JSON.parse(stored) : [];
  }

  /**
   * Setup real-time sync
   */
  setupRealtimeSync() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const entriesRef = collection(db, `trips/${this.currentTripId}/journal`);
    const q = query(entriesRef, orderBy('timestamp', 'desc'));

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.entries = [];
      snapshot.forEach((doc) => {
        this.entries.push({
          id: doc.id,
          ...doc.data()
        });
      });

      localStorage.setItem('journal_entries', JSON.stringify(this.entries));
      this.renderEntries();
    }, (error) => {
      console.error('❌ Realtime sync error:', error);
    });
  }

  /**
   * Setup UI
   */
  setupUI() {
    // Create journal container if doesn't exist
    let container = document.getElementById('travel-journal-container');
    if (!container) {
      container = this.createJournalContainer();
    }

    // Render entries
    this.renderEntries();

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Create journal container
   */
  createJournalContainer() {
    const container = document.createElement('div');
    container.id = 'travel-journal-container';
    container.className = 'travel-journal-container hidden';
    container.innerHTML = `
      <div class="journal-header">
        <h2>📔 Mi Diario de Viaje</h2>
        <button id="add-journal-entry-btn" class="btn-primary">
          <i class="fas fa-plus"></i> Nueva Entrada
        </button>
      </div>

      <div class="journal-stats">
        <div class="stat-card">
          <span class="stat-value" id="journal-total-entries">0</span>
          <span class="stat-label">Entradas</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" id="journal-total-photos">0</span>
          <span class="stat-label">Fotos</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" id="journal-total-words">0</span>
          <span class="stat-label">Palabras</span>
        </div>
      </div>

      <div id="journal-entries-list" class="journal-entries-list"></div>
    `;

    // Find a good place to insert it
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    if (mainContent) {
      mainContent.appendChild(container);
    }

    return container;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const addBtn = document.getElementById('add-journal-entry-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showEntryModal());
    }
  }

  /**
   * Show entry creation modal
   */
  showEntryModal(entry = null) {
    const isEdit = !!entry;

    const modal = document.createElement('div');
    modal.className = 'journal-modal-overlay';
    modal.innerHTML = `
      <div class="journal-modal">
        <div class="modal-header">
          <h3>${isEdit ? '✏️ Editar' : '📝 Nueva'} Entrada</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Título</label>
            <input type="text" id="entry-title" class="form-input"
              placeholder="Ej: Día increíble en Tokio"
              value="${entry ? entry.title : ''}">
          </div>

          <div class="form-group">
            <label>Fecha</label>
            <input type="date" id="entry-date" class="form-input"
              value="${entry ? entry.date : new Date().toISOString().split('T')[0]}">
          </div>

          <div class="form-group">
            <label>Contenido</label>
            <textarea id="entry-content" class="form-textarea" rows="8"
              placeholder="Escribe tus experiencias, pensamientos, y recuerdos del día...">${entry ? entry.content : ''}</textarea>
            <div class="char-count">
              <span id="word-count">0</span> palabras
            </div>
          </div>

          <div class="form-group">
            <label>Estado de ánimo</label>
            <div class="mood-selector">
              <button class="mood-btn" data-mood="amazing">🤩 Increíble</button>
              <button class="mood-btn" data-mood="happy">😊 Feliz</button>
              <button class="mood-btn" data-mood="good">🙂 Bien</button>
              <button class="mood-btn" data-mood="tired">😴 Cansado</button>
              <button class="mood-btn" data-mood="challenging">😅 Desafiante</button>
            </div>
          </div>

          <div class="form-group">
            <label>Etiquetas</label>
            <input type="text" id="entry-tags" class="form-input"
              placeholder="Separadas por comas: templo, comida, aventura"
              value="${entry && entry.tags ? entry.tags.join(', ') : ''}">
          </div>

          <div class="form-group">
            <label>Ubicación (opcional)</label>
            <input type="text" id="entry-location" class="form-input"
              placeholder="Ej: Shibuya, Tokio"
              value="${entry ? entry.location || '' : ''}">
          </div>
        </div>
        <div class="modal-footer">
          <button id="cancel-entry-btn" class="btn-secondary">Cancelar</button>
          <button id="save-entry-btn" class="btn-primary">
            ${isEdit ? 'Guardar Cambios' : 'Crear Entrada'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Word count
    const content = modal.querySelector('#entry-content');
    const wordCount = modal.querySelector('#word-count');
    content.addEventListener('input', () => {
      const words = content.value.trim().split(/\s+/).filter(w => w.length > 0).length;
      wordCount.textContent = words;
    });
    content.dispatchEvent(new Event('input')); // Initial count

    // Mood selector
    let selectedMood = entry ? entry.mood : null;
    modal.querySelectorAll('.mood-btn').forEach(btn => {
      if (entry && btn.dataset.mood === entry.mood) {
        btn.classList.add('selected');
      }
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedMood = btn.dataset.mood;
      });
    });

    // Close handlers
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('#cancel-entry-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Save handler
    modal.querySelector('#save-entry-btn').addEventListener('click', async () => {
      const title = modal.querySelector('#entry-title').value.trim();
      const date = modal.querySelector('#entry-date').value;
      const contentText = modal.querySelector('#entry-content').value.trim();
      const tags = modal.querySelector('#entry-tags').value
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      const location = modal.querySelector('#entry-location').value.trim();

      if (!title || !contentText) {
        alert('Por favor completa al menos el título y el contenido');
        return;
      }

      const entryData = {
        title,
        date,
        content: contentText,
        mood: selectedMood || 'good',
        tags,
        location,
        wordCount: contentText.split(/\s+/).filter(w => w.length > 0).length,
        timestamp: entry ? entry.timestamp : Date.now()
      };

      if (isEdit) {
        await this.updateEntry(entry.id, entryData);
      } else {
        await this.addEntry(entryData);
      }

      modal.remove();
    });
  }

  /**
   * Add new entry
   */
  async addEntry(entryData) {
    try {
      // Save to Firebase if available
      if (this.currentTripId && auth.currentUser) {
        const entriesRef = collection(db, `trips/${this.currentTripId}/journal`);
        const docRef = await addDoc(entriesRef, entryData);
        entryData.id = docRef.id;
      } else {
        entryData.id = `local_${Date.now()}`;
      }

      // Add to local array
      this.entries.unshift(entryData);

      // Save to localStorage
      localStorage.setItem('journal_entries', JSON.stringify(this.entries));

      // Re-render
      this.renderEntries();

      console.log('✅ Entry added successfully');
    } catch (error) {
      console.error('❌ Error adding entry:', error);
      alert('Error al guardar la entrada. Intenta de nuevo.');
    }
  }

  /**
   * Update entry
   */
  async updateEntry(entryId, entryData) {
    try {
      // Update in Firebase if available
      if (this.currentTripId && auth.currentUser && !entryId.startsWith('local_')) {
        const entryRef = doc(db, `trips/${this.currentTripId}/journal`, entryId);
        await updateDoc(entryRef, entryData);
      }

      // Update in local array
      const index = this.entries.findIndex(e => e.id === entryId);
      if (index !== -1) {
        this.entries[index] = { ...this.entries[index], ...entryData };
      }

      // Save to localStorage
      localStorage.setItem('journal_entries', JSON.stringify(this.entries));

      // Re-render
      this.renderEntries();

      console.log('✅ Entry updated successfully');
    } catch (error) {
      console.error('❌ Error updating entry:', error);
      alert('Error al actualizar la entrada. Intenta de nuevo.');
    }
  }

  /**
   * Delete entry
   */
  async deleteEntry(entryId) {
    if (!confirm('¿Estás segura de que quieres eliminar esta entrada?')) {
      return;
    }

    try {
      // Delete from Firebase if available
      if (this.currentTripId && auth.currentUser && !entryId.startsWith('local_')) {
        const entryRef = doc(db, `trips/${this.currentTripId}/journal`, entryId);
        await deleteDoc(entryRef);
      }

      // Remove from local array
      this.entries = this.entries.filter(e => e.id !== entryId);

      // Save to localStorage
      localStorage.setItem('journal_entries', JSON.stringify(this.entries));

      // Re-render
      this.renderEntries();

      console.log('✅ Entry deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting entry:', error);
      alert('Error al eliminar la entrada. Intenta de nuevo.');
    }
  }

  /**
   * Render all entries
   */
  renderEntries() {
    const container = document.getElementById('journal-entries-list');
    if (!container) return;

    // Update stats
    this.updateStats();

    // Render entries
    if (this.entries.length === 0) {
      container.innerHTML = `
        <div class="journal-empty-state">
          <div class="empty-icon">📔</div>
          <h3>Tu diario está vacío</h3>
          <p>Comienza a escribir tus experiencias y recuerdos del viaje</p>
          <button class="btn-primary" onclick="window.TravelJournal.showEntryModal()">
            <i class="fas fa-plus"></i> Crear Primera Entrada
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.entries.map(entry => this.renderEntry(entry)).join('');

    // Setup entry action listeners
    container.querySelectorAll('.edit-entry-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const entryId = e.target.closest('.edit-entry-btn').dataset.entryId;
        const entry = this.entries.find(e => e.id === entryId);
        if (entry) this.showEntryModal(entry);
      });
    });

    container.querySelectorAll('.delete-entry-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const entryId = e.target.closest('.delete-entry-btn').dataset.entryId;
        this.deleteEntry(entryId);
      });
    });
  }

  /**
   * Render single entry
   */
  renderEntry(entry) {
    const moodEmoji = {
      'amazing': '🤩',
      'happy': '😊',
      'good': '🙂',
      'tired': '😴',
      'challenging': '😅'
    }[entry.mood] || '🙂';

    const formattedDate = new Date(entry.date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div class="journal-entry">
        <div class="entry-header">
          <div class="entry-date">${formattedDate}</div>
          <div class="entry-mood">${moodEmoji}</div>
        </div>
        <h3 class="entry-title">${entry.title}</h3>
        ${entry.location ? `<div class="entry-location">📍 ${entry.location}</div>` : ''}
        <div class="entry-content">${this.formatContent(entry.content)}</div>
        ${entry.tags && entry.tags.length > 0 ? `
          <div class="entry-tags">
            ${entry.tags.map(tag => `<span class="entry-tag">#${tag}</span>`).join('')}
          </div>
        ` : ''}
        <div class="entry-footer">
          <div class="entry-meta">
            <span>${entry.wordCount || 0} palabras</span>
          </div>
          <div class="entry-actions">
            <button class="btn-icon edit-entry-btn" data-entry-id="${entry.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-entry-btn" data-entry-id="${entry.id}" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Format content with paragraphs
   */
  formatContent(content) {
    return content
      .split('\n')
      .filter(p => p.trim())
      .map(p => `<p>${p}</p>`)
      .join('');
  }

  /**
   * Update stats
   */
  updateStats() {
    const totalEntries = this.entries.length;
    const totalPhotos = this.entries.reduce((sum, e) => sum + (e.photos?.length || 0), 0);
    const totalWords = this.entries.reduce((sum, e) => sum + (e.wordCount || 0), 0);

    const totalEntriesEl = document.getElementById('journal-total-entries');
    const totalPhotosEl = document.getElementById('journal-total-photos');
    const totalWordsEl = document.getElementById('journal-total-words');

    if (totalEntriesEl) totalEntriesEl.textContent = totalEntries;
    if (totalPhotosEl) totalPhotosEl.textContent = totalPhotos;
    if (totalWordsEl) totalWordsEl.textContent = totalWords.toLocaleString();
  }

  /**
   * Show journal
   */
  show() {
    const container = document.getElementById('travel-journal-container');
    if (container) {
      // Hide other sections
      document.querySelectorAll('.tab-content, .analytics-dashboard').forEach(el => {
        el.classList.add('hidden');
      });

      container.classList.remove('hidden');
      this.renderEntries();
    }
  }

  /**
   * Hide journal
   */
  hide() {
    const container = document.getElementById('travel-journal-container');
    if (container) {
      container.classList.add('hidden');
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.TravelJournal = new TravelJournal();
  console.log('📔 Travel Journal loaded!');
}
