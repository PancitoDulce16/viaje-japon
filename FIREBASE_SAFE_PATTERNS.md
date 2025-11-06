# 🔥 Patrones Seguros para Firebase

Esta guía documenta los patrones que DEBES usar para evitar que Firebase rompa la aplicación.

---

## 🚨 Problemas Recurrentes y Sus Soluciones

### 1. Login Redirect Loop ❌

**Problema:** Usuario autenticado vuelve a ver la pantalla de login.

**Causa:** Múltiples listeners de `onAuthStateChanged` o lógica de redirect incorrecta.

**Solución:**
```javascript
// ❌ MAL: Múltiples listeners
onAuthStateChanged(auth, (user) => { /* ... */ });
onAuthStateChanged(auth, (user) => { /* ... */ }); // DUPLICADO!

// ✅ BIEN: Un solo listener, guardar referencia
let authUnsubscribe = null;

async function init() {
    // Limpiar listener anterior
    if (authUnsubscribe) {
        authUnsubscribe();
    }

    // Crear nuevo listener
    authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            showAppDashboard();
        } else {
            showLandingPage();
        }
    });
}
```

---

### 2. Activity Titles Showing "undefined" ❌

**Problema:** Los títulos de actividades muestran "undefined".

**Causa:** Datos de Firestore no tienen la propiedad esperada (`title` vs `name`).

**Solución:**
```javascript
// ❌ MAL: Asumir que siempre existe `title`
const activityTitle = activity.title;

// ✅ BIEN: Usar fallbacks
const activityTitle = activity.title || activity.name || 'Sin título';

// ✅ MEJOR: Normalizar datos al cargarlos
function normalizeActivity(activity) {
    return {
        ...activity,
        title: activity.title || activity.name || 'Sin título',
        cost: activity.cost !== undefined ? activity.cost : 0,
        icon: activity.icon || '📍'
    };
}
```

---

### 3. Buttons Not Working ❌

**Problema:** Botones de agregar/editar/eliminar no responden.

**Causa:** Event listeners no están attached o se perdieron al re-renderizar.

**Solución:**
```javascript
// ❌ MAL: Listeners directos que se pierden al re-renderizar
button.addEventListener('click', handleClick);

// ✅ BIEN: Event delegation en container padre
container.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[id^="addActivityBtn_"]');
    const editBtn = e.target.closest('.activity-edit-btn');

    if (addBtn) {
        handleAdd();
    } else if (editBtn) {
        handleEdit(editBtn.dataset.activityId);
    }
});

// ✅ IMPORTANTE: Verificar que listener NO se agregue múltiples veces
let isListenerAttached = false;

function init() {
    if (!isListenerAttached) {
        container.addEventListener('click', handleClicks);
        isListenerAttached = true;
    }
}
```

---

### 4. Drag and Drop Stops Working ❌

**Problema:** Drag and drop deja de funcionar después de cambios.

**Causa:** Sortable instance no se destruye antes de re-renderizar.

**Solución:**
```javascript
let sortableInstance = null;

function renderActivities() {
    // ✅ IMPORTANTE: Destruir instance anterior
    if (sortableInstance) {
        try {
            sortableInstance.destroy();
        } catch (_) {}
        sortableInstance = null;
    }

    // Renderizar HTML
    container.innerHTML = '...';

    // ✅ Crear nueva instance DESPUÉS de renderizar
    sortableInstance = Sortable.create(container, {
        handle: '.drag-handle',
        onEnd: handleDragEnd
    });
}
```

---

### 5. Data Not Syncing from Firestore ❌

**Problema:** Los cambios en Firestore no se reflejan en la app.

**Causa:** No usar `onSnapshot` o no manejar errores de red.

**Solución:**
```javascript
// ❌ MAL: Solo cargar datos una vez
const snap = await getDoc(docRef);
const data = snap.data();

// ✅ BIEN: Usar onSnapshot para sincronización en tiempo real
let unsubscribe = null;

function setupRealtimeSync() {
    // Limpiar listener anterior
    if (unsubscribe) {
        unsubscribe();
    }

    // ✅ Usar FirebaseResilience para manejo de errores
    unsubscribe = onSnapshot(
        docRef,
        (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                updateUI(data);

                // ✅ Guardar en cache local
                window.FirebaseResilience.saveToLocalStorage('itinerary', data);
            }
        },
        (error) => {
            console.error('Error en sync:', error);

            // ✅ Usar datos locales como fallback
            const cachedData = window.FirebaseResilience.getFromLocalStorage('itinerary');
            if (cachedData) {
                updateUI(cachedData);
            }
        }
    );
}
```

---

## 🛡️ Usar FirebaseResilience para Todas las Operaciones

**SIEMPRE** envuelve operaciones de Firestore con `FirebaseResilience.safeFirestoreOperation`:

```javascript
import { FirebaseResilience } from './firebase-resilience.js';

// ❌ MAL: Operación directa que puede romper la app
async function loadItinerary() {
    const snap = await getDoc(docRef); // ¡Puede fallar!
    return snap.data();
}

// ✅ BIEN: Operación segura con fallback
async function loadItinerary() {
    return await FirebaseResilience.safeFirestoreOperation(
        async () => {
            const snap = await getDoc(docRef);
            return snap.data();
        },
        null, // fallback value
        'itinerary' // cache key
    );
}
```

---

## 📋 Checklist ANTES de Hacer Cambios en Firebase

- [ ] ✅ Usar `FirebaseResilience.safeFirestoreOperation` para operaciones
- [ ] ✅ Implementar fallback a datos locales
- [ ] ✅ Limpiar listeners anteriores antes de crear nuevos
- [ ] ✅ Destruir instancias de Sortable antes de re-renderizar
- [ ] ✅ Usar event delegation en lugar de listeners directos
- [ ] ✅ Normalizar datos con fallbacks (`title || name || 'Sin título'`)
- [ ] ✅ Verificar que `onAuthStateChanged` solo se llame UNA vez
- [ ] ✅ Ejecutar Integration Tests antes de commit

---

## 🧪 Ejecutar Integration Tests

Antes de hacer commit, ejecuta:

```javascript
// En consola del navegador
await window.integrationTests.runAll();
```

Si hay fallos críticos (🚨), NO hacer commit hasta arreglarlos.

---

## 🔒 Reglas de Oro

1. **NUNCA** asumir que Firebase está disponible
2. **SIEMPRE** tener un fallback a datos locales
3. **NUNCA** crear múltiples listeners del mismo tipo
4. **SIEMPRE** limpiar listeners/instances antes de crear nuevos
5. **NUNCA** romper la app por un error de Firebase
6. **SIEMPRE** usar `try-catch` en operaciones Firebase
7. **NUNCA** hacer commit sin ejecutar Integration Tests

---

## 📱 Preparación para App Móvil

Para convertir esto en una app de teléfono:

### 1. PWA (Progressive Web App)
```javascript
// service-worker.js - Ya tienes esto configurado
// Asegurar que funcione offline completamente
```

### 2. Capacitor (Recomendado)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
```

### 3. React Native (Alternativa)
Si prefieres reescribir con React Native, el backend de Firebase permanece igual.

---

## 🎯 Próximos Pasos para Machine Learning

Para agregar ML sin costo:

### 1. TensorFlow.js (Gratis, Browser-based)
```javascript
import * as tf from '@tensorflow/tfjs';

// Entrenar modelo para recomendar actividades
async function trainRecommendationModel(userPreferences, activities) {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [10] }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    await model.fit(trainingData, labels, { epochs: 50 });
    return model;
}
```

### 2. Uso de ML para:
- Recomendar actividades basadas en preferencias
- Optimizar itinerario (minimizar tiempo de transporte)
- Predecir costos basados en patrones
- Sugerir mejores momentos para visitar lugares
- Detectar conflictos en el itinerario

### 3. Entrenar con datos existentes
```javascript
// Usar datos de viajes anteriores para entrenar
const trainingData = {
    userActions: [], // qué actividades guardaron
    ratings: [], // qué actividades votaron
    timeSpent: [], // cuánto tiempo pasaron en cada lugar
    costs: [] // cuánto gastaron
};
```

---

**Última actualización:** 2025-01-XX
**Versión:** 2.0.0
