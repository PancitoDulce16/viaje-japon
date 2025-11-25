# Resumen de Sesión - Template "Otaku Paradise" Fix

**Fecha:** 2025-11-25
**Problema:** Template "Otaku Paradise" no aparecía en el wizard completo, solo en crear viaje simple
**Error:** `permission-denied` al cargar template desde Firestore

---

## Problema Identificado

El template "Otaku Paradise" estaba configurado correctamente en `js/modals.js` pero al intentar cargarlo desde el wizard completo, Firebase arrojaba error `permission-denied`.

### Causa Root

- El código en `js/trips-manager.js` (línea 232) intentaba guardar el template en:
  ```javascript
  const itineraryRef = doc(db, 'trips', tripId, 'itinerary', 'current');
  ```

- Pero las reglas de Firestore (`firestore.rules`) NO tenían permisos para la subcolección `itinerary`

- Solo había reglas para:
  - `trips/{tripId}/expenses/{expenseId}`
  - `trips/{tripId}/data/{docId}` ✅
  - `trips/{tripId}/activities/{docId}`
  - `trips/{tripId}/modules/{moduleId}`

---

## Solución Implementada

### FIX #1: Permisos de Firestore (PARCIAL - no resolvió el problema)

**Actualización de firestore.rules (líneas 118-122)**

Agregada nueva regla para la subcolección `itinerary`:

```javascript
// --- Sub-colección de Itinerario ---
match /itinerary/{docId} {
  allow read: if isTripMember(tripId);
  allow write: if isTripMember(tripId);
}
```

- Reglas desplegadas exitosamente a `japan-itin-dev`
- Comando: `firebase deploy --only firestore:rules`
- Commit: `b3527df`

**PERO:** El template seguía sin aparecer después de crear el viaje.

---

### FIX #2: Ruta Incorrecta de Escritura (SOLUCIÓN REAL) ✅

**Problema descubierto:**
- El código ESCRIBÍA en: `trips/{tripId}/itinerary/current`
- Pero LEÍA desde: `trips/{tripId}/data/itinerary`
- **Resultado:** El template se guardaba en un lugar donde nunca se buscaba

**Solución en `js/trips-manager.js` (línea 232):**

```javascript
// ANTES (incorrecto):
const itineraryRef = doc(db, 'trips', tripId, 'itinerary', 'current');

// DESPUÉS (correcto):
const itineraryRef = doc(db, 'trips', tripId, 'data', 'itinerary');
```

- Commit: `4e85d53` - "FIX CRÍTICO: Template se guardaba en ruta incorrecta"
- Push: ✅ Completado a `main`

**NOTA:** No se pudo hacer deploy a Firebase Hosting por cuota excedida. El código está en GitHub pero necesita deploy manual.

---

## Archivos Modificados

1. **firestore.rules** - Agregada regla para `itinerary` subcolección (commit `b3527df`)
2. **.claude/settings.local.json** - Permisos actualizados
3. **js/trips-manager.js** - Corregida ruta de escritura del template (commit `4e85d53`)

---

## Estado Actual

✅ Las reglas de Firestore están actualizadas y desplegadas
✅ Cambios committeados y pusheados a GitHub (2 commits)
⚠️ **PENDIENTE:** Deploy a Firebase Hosting (bloqueado por cuota)
✅ El código correcto está en GitHub, solo falta deploy

---

## Próximos Pasos OBLIGATORIOS

### 1. **Limpiar Firebase Hosting Storage (URGENTE)**

El deploy está bloqueado por exceso de cuota. Ve a:
- Firebase Console → https://console.firebase.google.com/project/japan-itin-dev
- Hosting → Manage releases
- Elimina versiones antiguas (deja solo las últimas 3-5)
- O upgrade a plan Blaze si prefieres

### 2. **Deploy Manual**

Una vez limpiado el storage:
```bash
firebase deploy --only hosting
```

### 3. **Probar el Template**

Después del deploy:
- URL: https://japan-itin-dev.web.app/
- Login con: hinosuli@gmail.com
- Crear nuevo viaje → Seleccionar template "🎮 Otaku Paradise"
- **DEBERÍA:** Cargar los 16 días de itinerario automáticamente
- **NO DEBERÍA:** Mostrar solo "¡Crea tu Itinerario!"

---

## Contexto Adicional

### Template "Otaku Paradise"
- 16 días de itinerario optimizado para gaming/otaku
- Incluye lugares como Akihabara, TeamLab, Nintendo Store, etc.
- Guardado en `data/attractions.json` como `suggestedItinerary`

### Archivos Relacionados
- `js/trips-manager.js` - Lógica de carga de templates (línea 190-241)
- `js/modals.js` - UI del selector de templates (línea 533)
- `js/smart-generator-wizard.js` - Wizard completo
- `firestore.rules` - Reglas de seguridad de Firestore

---

## Notas de la Sesión Anterior

Antes de esta sesión estabas trabajando en:
- `js/route-optimizer-v2.js` - Optimización de rutas
- Función `findNearestActivity` con validación robusta
- Función `insertFlexibleActivities` para insertar actividades sin horario

Estos cambios están en working tree pero no committeados aún.

---

**Fin del resumen**

Para continuar, puedes decirle a Claude: "Continúa desde donde quedamos con el template Otaku Paradise"
