// js/modals.js

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export const AppModals = {};

export const ModalRenderer = {
    renderModals() {
        const container = document.getElementById('modalsContainer');
        if (!container) return;
        
        container.innerHTML = `
            ${this.getEmergencyModal()}
            ${this.getBudgetModal()}
            ${this.getPhrasesModal()}
            ${this.getNotesModal()}
        `;

        this.setupNotesModal();
    },

    setupNotesModal() {
        setTimeout(() => {
            const saveBtn = document.getElementById('saveNotesBtn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    if (window.AppCore) {
                        window.AppCore.saveNotes();
                    }
                });
            }
        }, 100);
    },

    getEmergencyModal() {
        return `
            <div id="modal-emergency" class="modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-red-600 dark:text-red-400">🚨 Emergencias</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="emergency" aria-label="Cerrar">&times;</button>
                        </div>
                        <div class="space-y-4">
                            <div class="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border-l-4 border-red-500">
                                <h3 class="font-bold text-lg mb-3 dark:text-white">Japón</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center">
                                        <span class="dark:text-gray-300">🚓 Policía:</span>
                                        <a href="tel:110" class="text-2xl font-bold text-red-600 dark:text-red-400 hover:underline">110</a>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="dark:text-gray-300">🚑 Ambulancia/Bomberos:</span>
                                        <a href="tel:119" class="text-2xl font-bold text-red-600 dark:text-red-400 hover:underline">119</a>
                                    </div>
                                </div>
                            </div>
                            <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <h3 class="font-bold mb-2 dark:text-white">🇨🇷 Embajada Costa Rica</h3>
                                <p class="text-sm dark:text-gray-300">📞 <a href="tel:+81-3-3486-1812" class="font-semibold hover:underline">+81-3-3486-1812</a></p>
                                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Shibuya-ku, Tokyo</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getBudgetModal() {
        return `
            <div id="modal-budget" class="modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">💰 Budget Tracker</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="budget" aria-label="Cerrar">&times;</button>
                        </div>
                        <div id="budgetModalContent"></div>
                    </div>
                </div>
            </div>
        `;
    },

    getPhrasesModal() {
        const phrases = [
            { jp: 'こんにちは (Konnichiwa)', es: 'Hola (día)' },
            { jp: 'おはようございます (Ohayou gozaimasu)', es: 'Buenos días' },
            { jp: 'こんばんは (Konbanwa)', es: 'Buenas noches' },
            { jp: 'ありがとう (Arigatou)', es: 'Gracias' },
            { jp: 'ありがとうございます (Arigatou gozaimasu)', es: 'Muchas gracias (formal)' },
            { jp: 'すみません (Sumimasen)', es: 'Disculpe / Perdón' },
            { jp: 'ごめんなさい (Gomen nasai)', es: 'Lo siento' },
            { jp: 'はい (Hai)', es: 'Sí' },
            { jp: 'いいえ (Iie)', es: 'No' },
            { jp: 'トイレはどこですか？ (Toire wa doko desu ka?)', es: '¿Dónde está el baño?' },
            { jp: 'いくらですか？ (Ikura desu ka?)', es: '¿Cuánto cuesta?' },
            { jp: '英語を話せますか？ (Eigo wo hanasemasu ka?)', es: '¿Habla inglés?' },
            { jp: 'おいしい (Oishii)', es: 'Delicioso' },
            { jp: 'お水をください (Omizu wo kudasai)', es: 'Agua por favor' },
            { jp: 'お会計お願いします (Okaikei onegaishimasu)', es: 'La cuenta por favor' },
            { jp: 'わかりました (Wakarimashita)', es: 'Entendido' },
            { jp: 'わかりません (Wakarimasen)', es: 'No entiendo' },
            { jp: '助けてください (Tasukete kudasai)', es: '¡Ayuda por favor!' },
            { jp: 'いただきます (Itadakimasu)', es: 'Buen provecho (antes de comer)' },
            { jp: 'ごちそうさまでした (Gochisousama deshita)', es: 'Gracias por la comida (después)' }
        ];
        
        return `
            <div id="modal-phrases" class="modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">🗣️ Frases Útiles</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="phrases" aria-label="Cerrar">&times;</button>
                        </div>
                        <div class="space-y-3 max-h-96 overflow-y-auto">
                            ${phrases.map(p => `
                                <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer">
                                    <p class="font-semibold dark:text-white">${escapeHtml(p.jp)}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">${escapeHtml(p.es)}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getNotesModal() {
        return `
            <div id="modal-notes" class="modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold dark:text-white">📝 Mis Notas</h2>
                            <button class="modal-close text-3xl hover:text-red-600 transition" data-modal-close="notes" aria-label="Cerrar">&times;</button>
                        </div>
                        <textarea 
                            id="notesTextarea" 
                            class="w-full h-64 p-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500" 
                            placeholder="Escribe tus notas del viaje aquí..."
                        ></textarea>
                        <button 
                            id="saveNotesBtn" 
                            class="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
                        >
                            💾 Guardar Notas
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};
