console.log('🔍 TEST: Verificando si los módulos se cargan...');

// Verificar RouteOptimizer
console.log('RouteOptimizer:', window.RouteOptimizer);
console.log('RouteOptimizer.calculateDistance:', window.RouteOptimizer?.calculateDistance);

// Verificar SuggestionsEngine
console.log('SuggestionsEngine:', window.SuggestionsEngine);

// Verificar currentItinerary
console.log('currentItinerary:', window.currentItinerary);

// Verificar si itinerary.js cargó
console.log('ItineraryHandler:', window.ItineraryHandler);

// Verificar funciones expuestas
console.log('saveCurrentItineraryToFirebase:', window.saveCurrentItineraryToFirebase);
console.log('renderItinerary:', window.renderItinerary);
