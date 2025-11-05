# 🛡️ Guía de Desarrollo - Prevención de Regresiones

Esta guía te ayudará a evitar que los cambios rompan funcionalidades existentes.

---

## 🚨 REGLAS DE ORO

### 1. **NUNCA cambiar funciones existentes de sync a async**

❌ **MAL:**
```javascript
// Antes
export function sanitizeHTML(html) {
    return cleanHTML(html);
}

// Después - ROMPERÁ código existente
export async function sanitizeHTML(html) {
    return await cleanHTML(html);
}
```

✅ **BIEN:**
```javascript
// Mantener función original sync
export function sanitizeHTML(html) {
    return cleanHTML(html);
}

// Crear nueva función async con nombre diferente
export async function sanitizeHTMLAdvanced(html) {
    return await advancedClean(html);
}
```

### 2. **SIEMPRE mantener contraste mínimo 4.5:1**

❌ **MAL:**
```css
.card {
    background: #f0f0f0;  /* Casi blanco */
    color: #e0e0e0;        /* Casi blanco - NO SE VE */
}
```

✅ **BIEN:**
```css
.card {
    background: #ffffff;   /* Blanco */
    color: #1f2937;        /* Gris oscuro - BUEN CONTRASTE */
}

.dark .card {
    background: #1f2937;   /* Gris oscuro */
    color: #f3f4f6;        /* Casi blanco - BUEN CONTRASTE */
}
```

### 3. **SIEMPRE limpiar event listeners**

❌ **MAL:**
```javascript
// Agrega listeners sin limpiar
function init() {
    button.addEventListener('click', handler);
}
```

✅ **BIEN:**
```javascript
import { eventManager } from './event-manager.js';

let clickListenerId = null;

function init() {
    cleanup(); // Limpiar primero
    clickListenerId = eventManager.add(button, 'click', handler, false, 'myModule');
}

function cleanup() {
    if (clickListenerId) {
        eventManager.removeById(clickListenerId);
    }
}
```

### 4. **SIEMPRE validar inputs del usuario**

❌ **MAL:**
```javascript
function saveActivity() {
    const title = input.value;
    const cost = parseFloat(costInput.value);

    // Guardar directamente - PELIGROSO
    saveToDatabase({ title, cost });
}
```

✅ **BIEN:**
```javascript
import { Validator } from './helpers.js';

function saveActivity() {
    const title = input.value;
    const cost = parseFloat(costInput.value);

    // Validar primero
    const validation = Validator.validateActivity({ title, cost });

    if (!validation.isValid) {
        Notifications.error(validation.errors.join('\n'));
        return;
    }

    saveToDatabase({ title, cost });
}
```

### 5. **SIEMPRE usar sanitización en contenido del usuario**

❌ **MAL:**
```javascript
// Insertar directamente - XSS VULNERABILITY
element.innerHTML = userInput;
```

✅ **BIEN:**
```javascript
import { escapeHTML } from './helpers.js';

// Escapar siempre
element.textContent = userInput; // Mejor opción

// O si necesitas HTML
element.innerHTML = escapeHTML(userInput);
```

---

## 🧪 Sistema de Pruebas Automáticas

### Ejecutar pruebas manualmente

Abre la consola del navegador y ejecuta:

```javascript
// Ejecutar todas las pruebas
await window.runTests();

// Verificar solo contraste
window.checkContrast();

// Ver resultados
console.log(window.testResults);
console.log(window.contrastIssues);
```

### Agregar nuevas pruebas

```javascript
// En test-runner.js
testRunner.addTest(
    'Nombre descriptivo de la prueba',
    async () => {
        // Tu lógica de prueba aquí
        const result = checkSomething();

        if (result.isOk) {
            return { passed: true, message: 'Todo bien' };
        } else {
            return { passed: false, message: 'Algo falló' };
        }
    },
    true // true = crítico, false = advertencia
);
```

---

## 📋 Checklist ANTES de Hacer Commit

- [ ] ✅ Ejecuté `window.runTests()` y todas pasaron
- [ ] 👁️ Ejecuté `window.checkContrast()` sin problemas
- [ ] 🎨 Probé en modo claro Y modo oscuro
- [ ] 🖱️ Drag and drop sigue funcionando (si aplica)
- [ ] 📝 Los nombres de actividades se ven (no "undefined")
- [ ] ➕ El botón de agregar funciona
- [ ] 📱 Probé en móvil (responsive)
- [ ] 🧹 Limpié console.logs de debugging

---

## 🎨 Paleta de Colores Segura

Usa siempre estos colores para asegurar buen contraste:

### Modo Claro
```css
/* Fondos */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;

/* Textos */
--text-primary: #111827;
--text-secondary: #1f2937;
--text-tertiary: #4b5563;

/* Borders */
--border-light: #e5e7eb;
--border-medium: #d1d5db;
```

### Modo Oscuro
```css
/* Fondos */
--bg-primary-dark: #111827;
--bg-secondary-dark: #1f2937;
--bg-tertiary-dark: #374151;

/* Textos */
--text-primary-dark: #f9fafb;
--text-secondary-dark: #f3f4f6;
--text-tertiary-dark: #e5e7eb;

/* Borders */
--border-light-dark: #4b5563;
--border-medium-dark: #6b7280;
```

---

## 🔧 Herramientas de Desarrollo

### 1. TestRunner
```javascript
// Verificar estado del sistema
window.testRunner.printSummary();

// Ver estadísticas de listeners
window.eventManager.logStats();
```

### 2. ContrastValidator
```javascript
// Escanear página actual
const issues = window.contrastValidator.scanDocument();

// Resaltar problemas visualmente
window.contrastValidator.highlightIssues();

// Validar modo oscuro
window.contrastValidator.validateDarkMode();
```

### 3. EventManager
```javascript
// Ver listeners activos
window.eventManager.getStats();

// Limpiar listeners de un módulo
window.eventManager.removeByModule('itinerary');

// Limpiar todo (útil antes de reload)
window.eventManager.removeAll();
```

---

## 🐛 Debugging de Problemas Comunes

### Problema: "Activity names muestran undefined"

**Causa:** Función de sanitización/render devuelve Promise en lugar de string

**Solución:**
```javascript
// Verificar que no uses await donde no debe
❌ const html = await escapeHTML(title);
✅ const html = escapeHTML(title);
```

### Problema: "Drag and drop no funciona"

**Causa:** SortableJS no está cargado o el contenedor no existe

**Solución:**
```javascript
// Verificar que Sortable existe
if (typeof Sortable === 'undefined') {
    console.error('Sortable.js no está cargado');
    return;
}

// Verificar que el contenedor existe
const container = document.getElementById('activitiesTimeline');
if (!container) {
    console.error('Container no existe');
    return;
}
```

### Problema: "Texto invisible en modo oscuro"

**Causa:** Olvidaste agregar reglas dark mode

**Solución:**
```css
/* SIEMPRE agregar ambos modos */
.mi-elemento {
    background: #ffffff;
    color: #111827;
}

.dark .mi-elemento {
    background: #1f2937;
    color: #f3f4f6;
}
```

---

## 📁 Estructura de Archivos Críticos

```
js/
├── helpers.js              # Funciones utilitarias (NO hacer async)
├── event-manager.js        # Gestión de listeners
├── test-runner.js          # Sistema de pruebas
├── contrast-validator.js   # Validación de contraste
├── firebase-config.js      # NO modificar sin probar
├── itinerary.js            # Core - cualquier cambio probar drag&drop
└── app.js                  # Entry point - agregar imports aquí

css/
├── main.css               # Estilos base
├── contrast-fixes.css     # Correcciones de contraste
└── dark-mode-*.css        # NO editar, usar contrast-fixes.css
```

---

## 🚀 Flujo de Trabajo Recomendado

1. **Antes de empezar:**
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```

2. **Durante desarrollo:**
   - Escribe código
   - Ejecuta `window.runTests()` frecuentemente
   - Prueba en ambos modos (claro/oscuro)

3. **Antes de commit:**
   ```bash
   # Ejecutar pruebas
   # En consola del navegador:
   await window.runTests()
   window.checkContrast()

   # Si todo pasa:
   git add .
   git commit -m "Descripción del cambio"
   ```

4. **Antes de push:**
   - Probar todo manualmente una última vez
   - Verificar que no rompiste nada existente
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```

---

## ⚡ Tips de Performance

1. **Debounce inputs pesados:**
```javascript
import { debounce } from './helpers.js';

const debouncedSave = debounce(() => {
    saveToFirestore();
}, 500);

input.addEventListener('input', debouncedSave);
```

2. **Batch Firestore operations:**
```javascript
// ❌ Múltiples writes separados
for (const item of items) {
    await setDoc(doc(db, 'collection', item.id), item);
}

// ✅ Batch write
const batch = writeBatch(db);
items.forEach(item => {
    batch.set(doc(db, 'collection', item.id), item);
});
await batch.commit();
```

3. **Lazy load módulos:**
```javascript
// ✅ Cargar solo cuando se necesita
async function openEmergencyModal() {
    const { EmergencyAssistant } = await import('./emergency-assistant.js');
    EmergencyAssistant.init();
}
```

---

## 📞 Contacto y Ayuda

Si encuentras un bug o algo se rompe:

1. **Revisa la consola** - Busca errores en rojo
2. **Ejecuta pruebas** - `window.runTests()`
3. **Revisa esta guía** - Probablemente ya está documentado
4. **Revisa el git log** - `git log --oneline -10` para ver cambios recientes

---

## 🎯 Objetivos de Calidad

- ✅ **0 errores críticos** en producción
- ✅ **100% contraste WCAG AA** (mínimo 4.5:1)
- ✅ **0 memory leaks** de event listeners
- ✅ **0 vulnerabilidades XSS**
- ✅ **100% funciones core trabajando**

---

**Última actualización:** $(date +'%Y-%m-%d')

**Versión:** 2.2.0
