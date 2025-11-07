// js/load-suggestions.js - Carga dinámica del motor de sugerencias

console.log('🔄 [LoadSuggestions] Iniciando carga...');

async function loadSuggestions() {
    try {
        console.log('🔄 [LoadSuggestions] Importando smart-suggestions-engine...');
        await import('./smart-suggestions-engine.js');
        console.log('✅ [LoadSuggestions] smart-suggestions-engine cargado');

        console.log('🔄 [LoadSuggestions] Importando smart-suggestions-ui...');
        await import('./smart-suggestions-ui.js');
        console.log('✅ [LoadSuggestions] smart-suggestions-ui cargado');

        console.log('✅ [LoadSuggestions] SuggestionsEngine:', window.SuggestionsEngine);

        if (window.SuggestionsEngine) {
            console.log('✅ [LoadSuggestions] Motor de sugerencias cargado exitosamente');
        } else {
            console.error('❌ [LoadSuggestions] SuggestionsEngine no está en window');
        }
    } catch (error) {
        console.error('❌ [LoadSuggestions] Error cargando sugerencias:', error);
        console.error('Stack:', error.stack);
    }
}

// Cargar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSuggestions);
} else {
    // Ya está listo, cargar inmediatamente
    loadSuggestions();
}

console.log('✅ [LoadSuggestions] Script cargado, esperando DOM ready');
