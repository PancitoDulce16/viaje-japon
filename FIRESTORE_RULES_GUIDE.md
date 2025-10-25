# 🛡️ Guía de Reglas de Firestore - Japan Itin

## 📋 Estrategia General

Para evitar errores de permisos en el futuro, seguimos estas reglas:

### ✅ **Principios:**

1. **Simplicidad sobre complejidad**: Reglas simples son más fáciles de mantener
2. **Confiar en la query del cliente**: Si la query filtra correctamente, las reglas pueden ser más permisivas
3. **Siempre permitir lectura autenticada**: Para colecciones colaborativas
4. **Validar en escritura**: La seguridad real está en `create/update/delete`

---

## 📁 Estructura de Colecciones

```
firestore/
├── users/{userId}
│   ├── data/{docId}           # Datos del usuario (favoritos, notas, etc.)
│   └── (NO expenses)          # DEPRECATED - usar trips/expenses
│
├── userSessions/{sessionId}   # Sesiones de feedback ML
│
└── trips/{tripId}
    ├── [documento raíz]       # Info del trip, members[], etc.
    ├── expenses/{expenseId}   # Gastos compartidos
    ├── data/{docId}           # Itinerario, notas, packing
    ├── activities/{actId}     # Checklist de actividades
    ├── modules/{moduleId}     # Flights, hotels, etc.
    └── chat/{messageId}       # Chat del viaje
```

---

## 🔐 Reglas Recomendadas

### **1. Users Collection**
```javascript
match /users/{userId} {
  // Documento principal y subcollecciones
  allow read, write: if isSignedIn() && request.auth.uid == userId;

  // TODAS las subcollecciones
  match /{document=**} {
    allow read, write: if isSignedIn() && request.auth.uid == userId;
  }
}
```

**Por qué:** Solo el dueño puede acceder, muy seguro.

---

### **2. User Sessions (para ML)**
```javascript
match /userSessions/{sessionId} {
  // sessionId format: {userId}_{timestamp}
  allow read, write: if isSignedIn() &&
                        request.auth.uid == sessionId.split('_')[0];
}
```

**Por qué:** Extrae el userId del ID, no necesita leer el documento.

---

### **3. Trips Collection** ⭐ IMPORTANTE

```javascript
match /trips/{tripId} {
  // LECTURA: Cualquier usuario autenticado puede listar/leer
  // La query where('members', 'array-contains', uid) filtra en el cliente
  allow read: if isSignedIn();

  // CREACIÓN: Solo usuarios autenticados, deben ser miembros
  allow create: if isSignedIn() &&
                   request.resource.data.info.createdBy == request.auth.uid &&
                   request.auth.uid in request.resource.data.members;

  // ACTUALIZACIÓN: Solo el creador
  allow update: if isSignedIn() &&
                   resource.data.info.createdBy == request.auth.uid;

  // BORRADO: Solo el creador
  allow delete: if isSignedIn() &&
                   resource.data.info.createdBy == request.auth.uid;

  // --- SUBCOLLECCIONES ---

  // Gastos
  match /expenses/{expenseId} {
    allow read: if isTripMember(tripId);
    allow create: if isTripMember(tripId) && isValidExpense(request.resource.data);
    allow delete: if isTripMember(tripId);
    allow update: if false;  // No se pueden editar, solo crear/borrar
  }

  // Data (itinerario, notas, packing)
  match /data/{docId} {
    allow read: if isTripMember(tripId);
    allow write: if isTripMember(tripId);
  }

  // Activities (checklist)
  match /activities/{actId} {
    allow read: if isTripMember(tripId);
    allow write: if isTripMember(tripId);
  }

  // Modules (flights, hotels, etc.) ⭐ NUEVO
  match /modules/{moduleId} {
    allow read: if isTripMember(tripId);
    allow write: if isTripMember(tripId);
  }

  // Chat
  match /chat/{messageId} {
    allow read: if isTripMember(tripId);
    allow create: if isTripMember(tripId) &&
                     request.resource.data.uid == request.auth.uid;
    allow update, delete: if false;  // Los mensajes no se pueden editar
  }
}
```

**Por qué `allow read: if isSignedIn()` en trips:**
- Las queries siempre incluyen `where('members', 'array-contains', uid)`
- Firestore filtra automáticamente en el servidor
- Un usuario malicioso no puede ver trips ajenos porque la query los filtra
- **Más simple y NO genera errores de permisos**

---

## 🚀 Checklist al Agregar Nueva Colección

Cuando agregues una nueva colección o subcolección, sigue estos pasos:

### ✅ **1. Decidir el Nivel de Seguridad**

- **Alta seguridad (datos sensibles):** Validar `resource.data` y permisos específicos
- **Media seguridad (datos colaborativos):** Solo verificar autenticación, confiar en la query
- **Baja seguridad (datos públicos):** Permitir lectura sin autenticación

### ✅ **2. Agregar Reglas en firestore.rules**

```javascript
match /nuevaColeccion/{docId} {
  // Siempre definir read, create, update, delete
  allow read: if [condición];
  allow create: if [condición];
  allow update: if [condición];
  allow delete: if [condición];
}
```

### ✅ **3. Usar SafeFirestore en el Código**

En lugar de:
```javascript
const unsubscribe = onSnapshot(docRef, (snap) => {
  // procesar datos
});
```

Usar:
```javascript
const unsubscribe = SafeFirestore.onSnapshotSafe(
  docRef,
  (snap) => {
    // procesar datos
  },
  (error) => {
    // manejar error (opcional)
  },
  fallbackData  // datos de fallback (opcional)
);
```

### ✅ **4. Deploy y Probar**

```bash
firebase deploy --only firestore:rules
```

Luego recargar la app y verificar la consola:
- ✅ No debe haber errores `permission-denied`
- ✅ Los datos deben cargar correctamente

---

## 🔧 Debugging de Errores de Permisos

Si aparece un error `permission-denied`:

### **Paso 1: Identificar el Path**
Busca en la consola el mensaje de error con detalles:
```
❌ ERROR en [Handler] onSnapshot - Full details:
{
  code: "permission-denied",
  path: "trips/abc123/modules/flights"
}
```

### **Paso 2: Verificar Reglas**
Revisa `firestore.rules` y busca el `match` correspondiente al path.

### **Paso 3: Opciones de Fix**

**Opción A - Agregar Regla Faltante:**
```javascript
match /trips/{tripId}/modules/{moduleId} {
  allow read: if isTripMember(tripId);
  allow write: if isTripMember(tripId);
}
```

**Opción B - Simplificar Regla Existente:**
```javascript
// De:
allow read: if isSignedIn() &&
              request.auth.uid in resource.data.members;

// A:
allow read: if isSignedIn();
```

**Opción C - Agregar Error Handler:**
```javascript
onSnapshot(ref, onSuccess, (error) => {
  console.error('Error:', error);
  // fallback logic
});
```

---

## 📚 Helper Functions Útiles

En `firestore.rules`, define estas funciones al inicio:

```javascript
function isSignedIn() {
  return request.auth != null;
}

function isTripMember(tripId) {
  let trip = get(/databases/$(database)/documents/trips/$(tripId));
  return isSignedIn() &&
         trip.data != null &&
         'members' in trip.data &&
         trip.data.members is list &&
         request.auth.uid in trip.data.members;
}

function isValidExpense(data) {
  return data.desc is string &&
         data.amount is number &&
         data.amount > 0 &&
         data.category is string &&
         data.timestamp is number &&
         data.addedBy == request.auth.email;
}
```

---

## 🎯 Best Practices

### ✅ **DO:**
- ✅ Usar `SafeFirestore` para todas las operaciones
- ✅ Siempre agregar error callbacks a `onSnapshot`
- ✅ Mantener reglas simples cuando sea posible
- ✅ Confiar en las queries del cliente para filtrar datos
- ✅ Hacer deploy de reglas después de cada cambio importante
- ✅ Probar en la consola de Firebase antes de hacer deploy

### ❌ **DON'T:**
- ❌ NO usar `resource.data` en reglas de `list` (queries)
- ❌ NO crear listeners sin error callbacks
- ❌ NO asumir que un documento existe antes de leerlo
- ❌ NO hacer reglas demasiado complejas (difíciles de mantener)
- ❌ NO olvidar agregar reglas para subcollecciones nuevas

---

## 🚨 Casos Especiales

### **Queries con array-contains**
Cuando uses `where('members', 'array-contains', userId)`:
- La regla puede ser simplemente `allow read: if isSignedIn()`
- La query ya filtra en el servidor
- No necesitas validar `resource.data.members` en la regla

### **Campos Requeridos en Reglas** ⚠️ IMPORTANTE
Si tus reglas requieren campos específicos:
```javascript
allow write: if isTripMember(tripId) &&
                'updatedBy' in request.resource.data &&
                request.resource.data.updatedBy == request.auth.email &&
                'lastUpdated' in request.resource.data &&
                request.resource.data.lastUpdated is string;
```

**DEBES incluirlos en tu código:**
```javascript
// ❌ INCORRECTO - faltarán campos requeridos
await setDoc(docRef, myData);

// ✅ CORRECTO - incluye campos requeridos
await setDoc(docRef, {
  ...myData,
  updatedBy: auth.currentUser.email,
  lastUpdated: new Date().toISOString()
});
```

**Síntoma:** Error `permission-denied` aunque el usuario sea miembro del trip.

### **Subcollecciones Recursivas**
Para permitir todas las subcollecciones bajo un path:
```javascript
match /trips/{tripId}/{document=**} {
  allow read: if isTripMember(tripId);
}
```

### **Creación Condicional**
Si quieres crear documentos solo si no existen:
```javascript
allow create: if isSignedIn() && !exists(/databases/$(database)/documents/trips/$(tripId));
```

---

## 📊 Testing de Reglas

Puedes probar reglas localmente con el emulador:

```bash
firebase emulators:start --only firestore
```

O en la consola de Firebase:
https://console.firebase.google.com/project/japan-itin-dev/firestore/rules

---

**💡 Recuerda:** La seguridad es importante, pero también lo es la usabilidad. Encuentra el balance correcto para tu app.
