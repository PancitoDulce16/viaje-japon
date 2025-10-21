const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

/**
 * Cloud Function para eliminar en cascada todos los datos de un viaje.
 * Se activa cuando un documento en `trips/{tripId}` es eliminado.
 */
exports.onTripDeleted = functions.firestore.onDocumentDeleted('trips/{tripId}', async (event) => {
    const tripId = event.params.tripId;
    const path = `trips/${tripId}`;
    
    console.log(`🗑️ Iniciando eliminación en cascada para el viaje: ${tripId}`);

    try {
        // Usar la herramienta CLI de Firebase para borrado recursivo es más seguro
        // Esta función delega la tarea a la herramienta interna de Firebase
        // La ruta para recursiveDelete debe ser una colección, pero el trigger es sobre un documento.
        // Para eliminar subcolecciones, debemos hacerlo manualmente o usar la extensión de Firebase.
        // Por simplicidad y seguridad, vamos a borrar las subcolecciones conocidas.
        const db = admin.firestore();
        await db.recursiveDelete(db.collection('trips').doc(tripId));
        console.log(`✅ Eliminación en cascada completada para: ${path}`);
        return null;
    } catch (error) {
        console.error(`❌ Error en la eliminación en cascada para ${path}:`, error);
        // Puedes agregar lógica para reintentar o notificar
        return null;
    }
});

/**
 * Cloud Function para enviar notificaciones cuando se agrega un nuevo gasto.
 */
exports.onNewExpenseAdded = functions.firestore.onDocumentCreated('trips/{tripId}/expenses/{expenseId}', async (event) => {
    const { tripId } = event.params;
    const expense = event.data.data();

    console.log(`💸 Nuevo gasto de ${expense.amount} en viaje ${tripId} por ${expense.addedBy}`);

    // 1. Obtener los miembros del viaje
    const tripRef = admin.firestore().doc(`trips/${tripId}`);
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists) {
        console.error('El viaje no existe.');
        return null;
    }
    const tripMembers = tripSnap.data().members || [];

    // 2. Obtener los tokens de los miembros (excluyendo a quien agregó el gasto)
    const tokens = [];
    for (const memberId of tripMembers) {
        const userSnap = await admin.firestore().doc(`users/${memberId}`).get();
        if (userSnap.exists() && userSnap.data().fcmTokens) {
            tokens.push(...userSnap.data().fcmTokens);
        }
    }

    if (tokens.length === 0) {
        console.log('No hay tokens para enviar notificaciones.');
        return null;
    }

    // 3. Crear y enviar la notificación
    const payload = {
        notification: {
            title: `Nuevo gasto en "${tripSnap.data().info.name}"`,
            body: `${expense.addedBy} agregó un gasto de ¥${expense.amount.toLocaleString()} en ${expense.desc}.`,
            icon: '/images/icons/icon-192.png',
            badge: '/images/icons/badge.png' // Opcional: un icono para la barra de notificaciones
        }
    };

    console.log(`📤 Enviando notificación a ${tokens.length} token(s).`);
    return admin.messaging().sendToDevice(tokens, payload);
});