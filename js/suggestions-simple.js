// suggestions-simple.js - Versión simple sin imports

console.log('✅ SUGGESTIONS SIMPLE CARGADO');

window.SuggestionsEngineSimple = {
    test: function() {
        alert('✅ El motor de sugerencias funciona!');
        console.log('✅ Test ejecutado');
    },

    showSuggestionsForDay: function(dayNumber) {
        alert(`Mostrando sugerencias para día ${dayNumber}`);
        console.log(`💡 Sugerencias para día ${dayNumber}`);
    }
};

console.log('✅ window.SuggestionsEngineSimple creado:', window.SuggestionsEngineSimple);
