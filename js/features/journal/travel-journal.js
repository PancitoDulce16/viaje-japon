/**
 * 📔 TRAVEL JOURNAL
 * =================
 *
 * Personal travel diary to record experiences, memories, and photos
 * No external APIs required - uses Firebase + localStorage
 */

import { journalState } from './journal-state.js';
import { enhanceDialog } from '../../ui/dialog-a11y.js';

const escapeMarkup = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

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
      addBtn.onclick=()=>this.showEntryModal();
    }
  }

  /**
   * Show entry creation modal
   */
  showEntryModal(entry = null) {
    const scope=this.journalScope(),entryId=entry?.id||crypto.randomUUID();
    this.entryModals ||= new Set();
    const isEdit = !!entry;

    const modal = document.createElement('div');
    modal.className = 'journal-modal-overlay';
    modal.setAttribute('aria-label', isEdit ? 'Editar entrada del diario' : 'Nueva entrada del diario');
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
              value="${entry ? escapeMarkup(entry.title) : ''}">
          </div>

          <div class="form-group">
            <label>Fecha</label>
            <input type="date" id="entry-date" class="form-input"
              value="${escapeMarkup(entry ? entry.date : new Date().toISOString().split('T')[0])}">
          </div>

          <div class="form-group">
            <label>Contenido</label>
            <textarea id="entry-content" class="form-textarea" rows="8"
              placeholder="Escribe tus experiencias, pensamientos, y recuerdos del día...">${entry ? escapeMarkup(entry.content) : ''}</textarea>
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
              value="${entry && entry.tags ? escapeMarkup(entry.tags.join(', ')) : ''}">
          </div>

          <div class="form-group">
            <label>Ubicación (opcional)</label>
            <input type="text" id="entry-location" class="form-input"
              placeholder="Ej: Shibuya, Tokio"
              value="${entry ? escapeMarkup(entry.location || '') : ''}">
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
    this.entryModals.add(modal);
    enhanceDialog(modal,{onClose:()=>modal.remove()});
    modal.querySelectorAll('input,textarea').forEach(input=>{const label=input.parentElement.querySelector('label');if(label)label.htmlFor=input.id;});

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
      if(modal.saving)return;
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

      modal.saving=true;const controls=[...modal.querySelectorAll('input,textarea,button')];controls.forEach(control=>control.disabled=true);
      try{
        const saved=isEdit?await this.updateEntry(entryId,entryData,scope):await this.addEntry(entryData,scope,entryId);
        if(saved){modal.remove();this.entryModals.delete(modal);}
      }finally{modal.saving=false;controls.forEach(control=>control.disabled=false);}

    });
  }

  /**
   * Add new entry
   */
  renderEntries() {
    const container = document.getElementById('journal-entries-list');
    if (!container) return;

    // Update stats
    this.updateStats();

    // Render entries
    if(this.loadState==='loading'&&!this.entries.length){container.innerHTML='<p role="status">Cargando diario...</p>';return;}
    if(this.loadState==='error'&&!this.entries.length){container.innerHTML='<p role="alert">No se pudo cargar el diario de este viaje.</p><button onclick="window.TravelJournal.loadEntries()">Reintentar</button>';return;}
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

    container.innerHTML = (this.loadState==='error'?'<p role="alert">No se pudo sincronizar. Se muestra la copia local de este viaje.</p>':'')+this.entries.map(entry => this.renderEntry(entry)).join('');

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

    const entryDate = window.TimeUtils ? window.TimeUtils.parseDate(entry.date) : new Date(entry.date);
    const formattedDate = Number.isFinite(entryDate?.getTime()) ? entryDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Fecha no disponible';

    return `
      <div class="journal-entry">
        <div class="entry-header">
          <div class="entry-date">${formattedDate}</div>
          <div class="entry-mood">${moodEmoji}</div>
        </div>
        <h3 class="entry-title">${escapeMarkup(entry.title)}</h3>
        ${entry.location ? `<div class="entry-location">📍 ${escapeMarkup(entry.location)}</div>` : ''}
        <div class="entry-content">${this.formatContent(entry.content)}</div>
        ${entry.tags && entry.tags.length > 0 ? `
          <div class="entry-tags">
            ${entry.tags.map(tag => `<span class="entry-tag">#${escapeMarkup(tag)}</span>`).join('')}
          </div>
        ` : ''}
        <div class="entry-footer">
          <div class="entry-meta">
            <span>${entry.wordCount || 0} palabras</span>
          </div>
          <div class="entry-actions">
            <button class="btn-icon edit-entry-btn" data-entry-id="${escapeMarkup(entry.id)}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-entry-btn" data-entry-id="${escapeMarkup(entry.id)}" title="Eliminar">
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
    return escapeMarkup(content)
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
  async show() {
    await this.initialize();
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

Object.assign(TravelJournal.prototype,journalState);

// Global instance
if (typeof window !== 'undefined') {
  window.TravelJournal = new TravelJournal();
  window.addEventListener('tripSelected',()=>window.TravelJournal.reinitialize());
  window.addEventListener('auth:initialized',()=>window.TravelJournal.reinitialize());
  window.addEventListener('auth:loggedOut',()=>window.TravelJournal.cleanup());
  console.log('📔 Travel Journal loaded!');
}
