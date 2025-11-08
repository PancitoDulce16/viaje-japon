// Script de validación para Smart Suggestions Engine
console.log('🔍 Validando Smart Suggestions Engine...');

// Verificar que el engine esté cargado
if (window.SuggestionsEngine) {
  console.log('✅ SuggestionsEngine está cargado');
  console.log('  - Funciones disponibles:', Object.keys(window.SuggestionsEngine));
} else {
  console.error('❌ SuggestionsEngine NO está cargado');
}

// Verificar que currentItinerary esté disponible
if (window.currentItinerary) {
  console.log('✅ currentItinerary está disponible');
  console.log('  - Días:', window.currentItinerary?.days?.length || 0);
} else {
  console.warn('⚠️ currentItinerary NO está disponible (puede ser normal si no hay itinerario cargado)');
}

// Verificar funciones de guardado
if (window.saveCurrentItineraryToFirebase) {
  console.log('✅ saveCurrentItineraryToFirebase está disponible');
} else {
  console.error('❌ saveCurrentItineraryToFirebase NO está disponible');
}

if (window.renderItinerary) {
  console.log('✅ renderItinerary está disponible');
} else {
  console.error('❌ renderItinerary NO está disponible');
}

// Verificar que el botón existe
const dayButtons = document.querySelectorAll('[id^="suggestionsBtn_"]');
if (dayButtons.length > 0) {
  console.log(`✅ Encontrados ${dayButtons.length} botones de sugerencias`);
} else {
  console.warn('⚠️ No se encontraron botones de sugerencias (puede ser normal si no hay días renderizados)');
}

console.log('🔍 Validación completa');
