const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { onDocumentDeleted, onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const fetch = require("node-fetch");
const Anthropic = require("@anthropic-ai/sdk");

admin.initializeApp();

/**
 * Cloud Function para eliminar en cascada todos los datos de un viaje.
 * Se activa cuando un documento en `trips/{tripId}` es eliminado.
 */
exports.onTripDeleted = onDocumentDeleted('trips/{tripId}', async (event) => {
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
exports.onNewExpenseAdded = onDocumentCreated('trips/{tripId}/expenses/{expenseId}', async (event) => {
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

/**
 * Claude AI Assistant - Ayuda en tiempo real con el itinerario
 * POST endpoint que recibe contexto del itinerario y retorna sugerencias de Claude
 */
exports.claudeAssistant = onRequest({
    cors: true,
    secrets: ["CLAUDE_API_KEY"]
}, async (req, res) => {
    // Solo aceptar POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Verificar autenticación del usuario
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;

        console.log(`🤖 Claude Assistant request from user: ${userId}`);

        // Inicializar Claude API
        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) {
            console.error('❌ CLAUDE_API_KEY not configured');
            return res.status(500).json({ error: 'Claude API not configured' });
        }

        const anthropic = new Anthropic({
            apiKey: apiKey
        });

        // Construir el sistema prompt con contexto
        const systemPrompt = `Eres un asistente de viaje especializado en Japón. Ayudas a los viajeros con su itinerario en tiempo real.

CONTEXTO DEL ITINERARIO:
${context ? JSON.stringify(context, null, 2) : 'Sin contexto proporcionado'}

INSTRUCCIONES:
- Da respuestas concisas y útiles (máximo 3-4 párrafos)
- Si sugiere lugares, incluye información práctica: horarios, costos, cómo llegar
- Si optimizas rutas, explica por qué es mejor
- Usa emojis relevantes para hacer las respuestas más visuales
- Si el usuario menciona un lugar específico, intenta dar consejos locales
- Responde en español`;

        // Llamar a Claude API
        const completion = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{
                role: "user",
                content: message
            }]
        });

        const response = completion.content[0].text;

        console.log(`✅ Claude response generated (${response.length} chars)`);

        return res.status(200).json({
            success: true,
            response: response,
            usage: {
                inputTokens: completion.usage.input_tokens,
                outputTokens: completion.usage.output_tokens
            }
        });

    } catch (error) {
        console.error('❌ Error in Claude Assistant:', error);

        if (error.status === 401) {
            return res.status(401).json({ error: 'Invalid Claude API key' });
        }

        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});