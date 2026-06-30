// SCRIPT DE RECUPERACIÓN SIMPLE
// Copia y pega TODO esto en la consola del navegador

console.log('🚑 Iniciando recuperación simple...');

// Función principal
(async function simpleRecover() {
    // Paso 1: Esperar a Firebase
    console.log('⏳ Esperando Firebase...');
    let attempts = 0;
    while (!window.auth?.currentUser && attempts < 30) {
        await new Promise(r => setTimeout(r, 300));
        attempts++;
    }

    if (!window.auth?.currentUser) {
        console.error('❌ Firebase no está listo. Estás en /dashboard.html?');
        console.log('Ejecuta: window.auth?.currentUser');
        return;
    }

    console.log('✅ Usuario:', window.auth.currentUser.email);

    // Paso 2: Importar Firestore
    const { collection, getDocs, query, where, getDoc, doc } = await import(
        'firebase/firestore'
    );

    // Paso 3: Buscar trips
    console.log('🔍 Buscando trips...');
    const userId = window.auth.currentUser.uid;
    const tripsRef = collection(window.db, 'trips');
    const q = query(tripsRef, where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.error('❌ NO SE ENCONTRARON TRIPS');
        // Buscar todos los trips
        const allSnap = await getDocs(collection(window.db, 'trips'));
        console.log(`Total trips en BD: ${allSnap.size}`);
        allSnap.forEach(d => {
            const data = d.data();
            console.log(`- ${data.info?.name} (${data.info?.creatorEmail})`);
        });
        return;
    }

    console.log(`✅ Encontrados ${snapshot.size} trips`);

    // Paso 4: Analizar cada trip
    const trips = [];
    for (const tripDoc of snapshot.docs) {
        const tripData = tripDoc.data();
        const tripId = tripDoc.id;

        console.log(`\n📌 ${tripData.info?.name} (${tripId})`);

        // Verificar itinerario
        const itinRef = doc(window.db, `trips/${tripId}/data`, 'itinerary');
        const itinSnap = await getDoc(itinRef);

        if (itinSnap.exists()) {
            const itinData = itinSnap.data();
            const days = itinData.days?.length || 0;
            const activities = itinData.days?.reduce((sum, day) =>
                sum + (day.activities?.length || 0), 0) || 0;

            console.log(`   ✅ ${days} días, ${activities} actividades`);

            trips.push({
                id: tripId,
                name: tripData.info?.name,
                activities: activities,
                data: tripData,
                itinerary: itinData
            });
        } else {
            console.log(`   ⚠️ Sin itinerario`);
        }
    }

    if (trips.length === 0) {
        console.error('❌ No hay trips válidos para recuperar');
        return;
    }

    // Paso 5: Recuperar el primer trip
    const trip = trips[0];
    console.log(`\n🔧 RECUPERANDO: "${trip.name}"`);

    // Guardar en storage
    localStorage.setItem('currentTripId', trip.id);
    sessionStorage.setItem('backup_currentTripId', trip.id);
    console.log('✅ IDs guardados');

    // Backup completo
    const backup = {
        tripId: trip.id,
        tripData: trip.data,
        itineraryData: trip.itinerary,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('backup_trip_' + trip.id, JSON.stringify(backup));
    console.log('✅ Backup creado');

    // Recargar TripsManager
    if (window.TripsManager) {
        console.log('🔄 Actualizando TripsManager...');
        await window.TripsManager.selectTrip(trip.id);
    }

    console.log('\n🎉 ¡LISTO! Recargando en 2 segundos...');
    setTimeout(() => location.reload(), 2000);

})().catch(err => {
    console.error('❌ ERROR:', err.message);
    console.error('Stack:', err.stack);
});
