// js/modals.js
import { AppCore } from './core.js';
import { BudgetTracker } from './budget-tracker.js';

export const AppModals = {
  open(modalName) {
    const modal = document.getElementById(`modal-${modalName}`);
    if (!modal) return;
    modal.classList.add('active');
    if (modalName === 'notes') {
      document.getElementById('notesTextarea').value = localStorage.getItem('travelNotes') || '';
    }
    if (modalName === 'budget') {
      BudgetTracker.updateModal();
    }
  },

  close(modalName) {
    const modal = document.getElementById(`modal-${modalName}`);
    if (modal) modal.classList.remove('active');
  },

  saveNotes() {
    const notes = document.getElementById('notesTextarea').value;
    localStorage.setItem('travelNotes', notes);
    alert('✅ Notas guardadas!');
    this.close('notes');
  }
};

export const ModalRenderer = {
  renderModals() {
    const container = document.getElementById('modalsContainer');
    if (!container) return;
    container.innerHTML = `
      ${this.getEmergencyModal()}
      ${this.getBudgetModal()}
      ${this.getPhrasesModal()}
      ${this.getNotesModal()}
      ${this.getChecklistModal()}
    `;
  },

  getEmergencyModal() {
    return `
      <div id="modal-emergency" class="modal">
        <div class="modal-content max-w-2xl">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-red-600 dark:text-red-400">🚨 Emergencias</h2>
            <button class="modal-close-btn text-3xl hover:text-red-600" data-modal-close="emergency" aria-label="Cerrar modal">&times;</button>
          </div>
          <div class="space-y-4">
            <div class="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border-l-4 border-red-500">
              <h3 class="font-bold text-lg mb-3 dark:text-white">Japón</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center"><span class="dark:text-gray-300">🚓 Policía:</span><a href="tel:110" class="text-2xl font-bold text-red-600 dark:text-red-400">110</a></div>
                <div class="flex justify-between items-center"><span class="dark:text-gray-300">🚑 Ambulancia:</span><a href="tel:119" class="text-2xl font-bold text-red-600 dark:text-red-400">119</a></div>
              </div>
            </div>
            <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h3 class="font-bold mb-2 dark:text-white">🇨🇷 Embajada Costa Rica</h3>
              <p class="text-sm dark:text-gray-300">📞 <a href="tel:+81-3-3486-1812" class="font-semibold">+81-3-3486-1812</a></p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  getBudgetModal() {
    return `
      <div id="modal-budget" class="modal">
        <div class="modal-content max-w-2xl">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold dark:text-white">💰 Budget Tracker</h2>
            <button class="modal-close-btn text-3xl hover:text-red-600" data-modal-close="budget" aria-label="Cerrar modal">&times;</button>
          </div>
          <div id="budgetModalContent"></div>
        </div>
      </div>
    `;
  },
  
  getPhrasesModal() {
     const phrases = [
      { jp: 'こんにちは (Konnichiwa)', es: 'Hola' }, { jp: 'ありがとう (Arigatou)', es: 'Gracias' },
      { jp: 'すみません (Sumimasen)', es: 'Disculpe' }, { jp: 'トイレはどこですか？ (Toire wa doko desu ka?)', es: '¿Dónde está el baño?' },
      { jp: 'いくらですか？ (Ikura desu ka?)', es: '¿Cuánto cuesta?' }
    ];
    return `
      <div id="modal-phrases" class="modal">
        <div class="modal-content max-w-2xl">
          <div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold dark:text-white">🗣️ Frases Útiles</h2><button class="modal-close-btn" data-modal-close="phrases">&times;</button></div>
          <div class="space-y-3 max-h-96 overflow-y-auto">
            ${phrases.map(p => `<div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><p class="font-semibold dark:text-white">${AppCore.escapeHtml(p.jp)}</p><p class="text-sm text-gray-600 dark:text-gray-400">${AppCore.escapeHtml(p.es)}</p></div>`).join('')}
          </div>
        </div>
      </div>
    `;
  },

  getNotesModal() {
    return `
      <div id="modal-notes" class="modal">
        <div class="modal-content max-w-2xl">
          <div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold dark:text-white">📝 Mis Notas</h2><button class="modal-close-btn" data-modal-close="notes">&times;</button></div>
          <textarea id="notesTextarea" class="w-full h-64 p-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Tus notas aquí..."></textarea>
          <button onclick="AppModals.saveNotes()" class="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">💾 Guardar</button>
        </div>
      </div>
    `;
  },

  getChecklistModal() { return ''; }
};
