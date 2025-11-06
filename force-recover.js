// force-recover.js - Script de recuperación de emergencia
// Ejecuta esto en la consola del navegador si perdiste el itinerario

(async function forceRecover() {
    console.log('🚑 SCRIPT DE RECUPERACIÓN DE EMERGENCIA');
    console.log('========================================');

    // Esperar a que Firebase esté listo
    console.log('⏳ Esperando a que Firebase esté listo...');

    // Función para esperar por auth
    async function waitForAuth() {
        let attempts = 0;
        while (attempts < 50) { // Máximo 10 segundos (50 * 200ms)
            if (window.auth && window.auth.currentUser) {
                return window.auth.currentUser;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }
        return null;
    }

    const user = await waitForAuth();

    if (!user) {
        console.error('❌ No se pudo detectar usuario autenticado después de 10 segundos.');
        console.log('Por favor verifica:');
        console.log('1. ¿Estás en /dashboard.html?');
        console.log('2. ¿Aparece tu email en la esquina superior derecha?');
        console.log('3. Prueba ejecutar en consola: window.auth?.currentUser');
        return;
    }

    const userId = user.uid;
    console.log('✅ Usuario autenticado:', user.email);

    // Importar Firestore
    const { collection, getDocs, query, where, getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    try {
        // Buscar trips del usuario
        console.log('🔍 Buscando trips en Firebase...');
        const tripsRef = collection(window.db, 'trips');
        const q = query(tripsRef, where('members', 'array-contains', userId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.error('❌ NO SE ENCONTRARON TRIPS en Firebase para este usuario');
            console.log('Posibles causas:');
            console.log('1. Los trips fueron eliminados');
            console.log('2. El userId cambió');
            console.log('3. Hay un problema con Firebase');

            // Buscar TODOS los trips (debug)
            console.log('\n🔍 Buscando TODOS los trips en la base de datos...');
            const allSnapshot = await getDocs(collection(window.db, 'trips'));
            if (allSnapshot.empty) {
                console.log('❌ No hay NINGÚN trip en la base de datos');
            } else {
                console.log(`✅ Se encontraron ${allSnapshot.size} trips en total:`);
                allSnapshot.forEach(doc => {
                    const data = doc.data();
                    console.log(`\n  Trip ID: ${doc.id}`);
                    console.log(`  Nombre: ${data.info?.name}`);
                    console.log(`  Creador: ${data.info?.creatorEmail}`);
                    console.log(`  Miembros:`, data.memberEmails);
                });
            }
            return;
        }

        console.log(`✅ Se encontraron ${snapshot.size} trip(s):`);

        const trips = [];
        for (const tripDoc of snapshot.docs) {
            const tripData = tripDoc.data();
            const tripId = tripDoc.id;

            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📌 Trip ID: ${tripId}`);
            console.log(`   Nombre: ${tripData.info?.name}`);
            console.log(`   Fechas: ${tripData.info?.dateStart} - ${tripData.info?.dateEnd}`);
            console.log(`   Miembros: ${tripData.memberEmails?.join(', ')}`);

            // Verificar itinerario
            try {
                const itineraryRef = doc(window.db, `trips/${tripId}/data`, 'itinerary');
                const itinerarySnap = await getDoc(itineraryRef);

                if (itinerarySnap.exists()) {
                    const itineraryData = itinerarySnap.data();
                    const daysCount = itineraryData.days?.length || 0;
                    const totalActivities = itineraryData.days?.reduce((sum, day) =>
                        sum + (day.activities?.length || 0), 0) || 0;

                    console.log(`   ✅ Itinerario: ${daysCount} días, ${totalActivities} actividades`);

                    trips.push({
                        id: tripId,
                        name: tripData.info?.name,
                        days: daysCount,
                        activities: totalActivities,
                        data: tripData,
                        itinerary: itineraryData
                    });
                } else {
                    console.log(`   ⚠️ No tiene itinerario`);
                    trips.push({
                        id: tripId,
                        name: tripData.info?.name,
                        days: 0,
                        activities: 0,
                        data: tripData,
                        itinerary: null
                    });
                }
            } catch (err) {
                console.error(`   ❌ Error leyendo itinerario:`, err.message);
            }
        }

        // Mostrar opciones de recuperación
        if (trips.length === 0) {
            console.log('\n❌ No hay trips con datos válidos');
            return;
        }

        console.log('\n✅ TRIPS DISPONIBLES PARA RECUPERAR:');
        trips.forEach((trip, index) => {
            console.log(`\n${index + 1}. ${trip.name}`);
            console.log(`   ID: ${trip.id}`);
            console.log(`   Actividades: ${trip.activities}`);
        });

        // Recuperar automáticamente el primer trip
        const tripToRecover = trips[0];
        console.log(`\n🔧 RECUPERANDO AUTOMÁTICAMENTE: "${tripToRecover.name}"`);

        // Guardar en localStorage
        localStorage.setItem('currentTripId', tripToRecover.id);
        sessionStorage.setItem('backup_currentTripId', tripToRecover.id);
        console.log('✅ currentTripId guardado en localStorage');
        console.log('✅ Backup guardado en sessionStorage');

        // Guardar backup completo
        const backup = {
            tripId: tripToRecover.id,
            tripData: tripToRecover.data,
            itineraryData: tripToRecover.itinerary,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('backup_trip_' + tripToRecover.id, JSON.stringify(backup));
        console.log('✅ Backup completo guardado');

        // Forzar recarga del TripsManager
        if (window.TripsManager) {
            console.log('\n🔄 Reiniciando TripsManager...');
            await window.TripsManager.selectTrip(tripToRecover.id);
            console.log('✅ TripsManager actualizado');
        }

        console.log('\n🎉 ¡RECUPERACIÓN COMPLETADA!');
        console.log('Recargando página en 2 segundos...');

        setTimeout(() => {
            location.reload();
        }, 2000);

    } catch (error) {
        console.error('❌ ERROR EN RECUPERACIÓN:', error);
        console.error('Stack:', error.stack);
    }
})();
