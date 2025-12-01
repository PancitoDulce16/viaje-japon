# 🔍 Debugging Guidelines - Japitin

Guía paso a paso para resolver problemas comunes de forma eficiente.

---

## 🎨 PROBLEMA: Estilos CSS no se aplican

### Caso Real: Wallpapers no se muestran
**Síntomas**: Un estilo CSS (background, color, etc.) no se aplica aunque esté en el código.

### ✅ PROCESO DE DEBUGGING (EN ORDEN):

#### 1️⃣ PRIMERO: Verificar que el CSS se está aplicando
```javascript
// En consola del navegador:
const styles = window.getComputedStyle(document.documentElement);
console.log('Background Image:', styles.backgroundImage);
console.log('Background Color:', styles.backgroundColor);
```

**¿Qué nos dice?**
- Si muestra `none` o un valor diferente → Hay CSS que lo sobrescribe
- Si muestra la URL correcta → El problema es la imagen, no el CSS

#### 2️⃣ SEGUNDO: Buscar CSS conflictivos con !important
```bash
# Buscar backgrounds en archivos CSS
grep -rn "background.*!important" css/ --include="*.css"

# Buscar selectores que afecten html o body
grep -rn "^html\|^body\|html.dark\|html:not" css/ --include="*.css" | grep "background"
```

**Archivos críticos a revisar:**
1. `css/main.css` - Suele tener estilos base globales
2. `css/dark-mode-fixes.css` - Modo oscuro con !important
3. `css/visual-redesign.css` - Overrides de diseño
4. `css/wallpapers.css` - Específico de wallpapers
5. `dashboard.html` - Estilos inline en el `<head>`

#### 3️⃣ TERCERO: Verificar orden de carga de CSS
Los archivos CSS se aplican en orden. El último tiene prioridad (a menos que use !important).

```bash
# Ver orden de carga en dashboard.html
grep -n "stylesheet\|<style>" dashboard.html
```

#### 4️⃣ CUARTO: Probar con CSS inline directo
```javascript
// En consola del navegador:
document.documentElement.style.cssText = 'background: red !important;';
```

**¿Funciona?**
- ✅ SÍ → El problema es especificidad CSS o orden de carga
- ❌ NO → Hay JavaScript manipulando estilos constantemente

#### 5️⃣ QUINTO: Buscar JavaScript que modifique estilos
```bash
# Buscar JS que manipule background
grep -rn "\.style\.background\|documentElement\.style" js/ --include="*.js"

# Buscar setInterval que pueda estar sobrescribiendo
grep -rn "setInterval.*style" js/ --include="*.js"
```

---

## 🖼️ PROBLEMA: Imágenes no se muestran

### ✅ PROCESO DE DEBUGGING:

#### 1️⃣ Verificar que la imagen existe
```bash
ls -la "images/ruta/de/la/imagen.png"
```

#### 2️⃣ Verificar que está en git y desplegada
```bash
git status images/
git log --oneline -- images/ruta/
```

#### 3️⃣ Probar URL directa en navegador
Abrir: `https://japan-itin-dev.web.app/images/ruta/imagen.png`

**¿Se ve la imagen?**
- ✅ SÍ → El problema es CSS/HTML, no la imagen
- ❌ NO → La imagen no está desplegada o la ruta es incorrecta

#### 4️⃣ Limpiar caché del navegador
`Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)

#### 5️⃣ Verificar ruta relativa vs absoluta
- `/images/...` = Absoluta desde root
- `images/...` = Relativa al archivo actual
- `../images/...` = Un nivel arriba

---

## 📱 PROBLEMA: Diseño se ve mal / elementos mal posicionados

### ✅ PROCESO DE DEBUGGING:

#### 1️⃣ Inspeccionar el elemento (F12)
Ver qué clases CSS tiene y qué estilos se están aplicando

#### 2️⃣ Verificar si hay margins/padding negativos
```bash
grep -rn "\-mx-\|\-my-\|\-mt-\|\-mb-\|\-ml-\|\-mr-" archivo.html
```

**Caso Real**: `-mx-6` estaba haciendo el contenedor más ancho que el padre

#### 3️⃣ Verificar contenedores parent
¿El elemento padre tiene restricciones de tamaño?
- `overflow: hidden`
- `max-width`
- `position: relative/absolute`

#### 4️⃣ Revisar Tailwind classes conflictivas
```
object-cover vs object-contain
w-full vs w-auto
h-full vs h-auto
```

---

## 🌓 PROBLEMA: Modo oscuro no funciona correctamente

### ✅ PROCESO DE DEBUGGING:

#### 1️⃣ Verificar clase en HTML
```javascript
// En consola:
console.log('Dark mode:', document.documentElement.classList.contains('dark'));
console.log('Data theme:', document.documentElement.getAttribute('data-theme'));
```

#### 2️⃣ Buscar selectores de modo oscuro
```bash
grep -rn "\.dark\|html.dark\|\[data-theme" css/ --include="*.css"
```

#### 3️⃣ Verificar variables CSS
```javascript
// En consola:
const styles = getComputedStyle(document.documentElement);
console.log('--dark-bg-primary:', styles.getPropertyValue('--dark-bg-primary'));
```

#### 4️⃣ Revisar archivos críticos (EN ORDEN):
1. `css/main.css` - Estilos base
2. `css/dark-mode-fixes.css` - Fixes específicos
3. `css/dark-mode-ultra-contrast.css` - Overrides
4. `dashboard.html` - Inline styles

---

## 🚀 PROBLEMA: Cambios no aparecen en producción

### ✅ PROCESO DE DEBUGGING:

#### 1️⃣ Verificar que los cambios están en git
```bash
git status
git diff
git log -1
```

#### 2️⃣ Verificar que se hizo push
```bash
git log origin/main..HEAD
# Si muestra commits → Falta hacer push
```

#### 3️⃣ Verificar que se hizo deploy
```bash
firebase deploy --only hosting
```

#### 4️⃣ Limpiar caché
- Browser: `Ctrl + Shift + R`
- Firebase: Los cambios tardan ~30 segundos en propagarse

#### 5️⃣ Verificar en modo incógnito
Si funciona en incógnito pero no en normal → Es cache del browser

---

## 🛠️ HERRAMIENTAS DE DEBUGGING

### Dev Panel (Ctrl + Shift + D)
**Úsalo para:**
1. **Inspeccionar Estilos HTML** - Ver qué CSS se aplica realmente
2. **Live CSS Editor** - Probar fixes antes de commitear
3. **Quick Fixes** - Aplicar soluciones comunes
4. **Mostrar CSS** - Ver qué archivos están cargados

### Consola del Navegador (F12)
```javascript
// Ver estilos computados
window.getComputedStyle(document.documentElement)

// Ver todas las clases de un elemento
document.documentElement.className

// Probar cambios de estilo
document.body.style.background = 'red'

// Ver qué CSS está cargado
Array.from(document.styleSheets).map(s => s.href)
```

### Comandos de búsqueda útiles
```bash
# Buscar en archivos CSS
grep -rn "patron" css/ --include="*.css"

# Buscar en archivos JS
grep -rn "patron" js/ --include="*.js"

# Buscar en HTML
grep -n "patron" dashboard.html

# Ver archivos modificados recientemente
git log --oneline --name-only -5
```

---

## 📋 CHECKLIST ANTES DE HACER CAMBIOS

✅ Leer el archivo antes de modificarlo (`Read` tool)
✅ Entender qué otros CSS/JS pueden interactuar
✅ Buscar selectores conflictivos primero
✅ Probar en Dev Panel antes de commitear
✅ Verificar en ambos modos (claro/oscuro)
✅ Limpiar caché al probar

---

## 🎯 CASOS RESUELTOS

### ✅ CASO 1: Wallpapers no se muestran
**Problema**: Los wallpapers (Claro.png y Osucuro.png) no se mostraban aunque el CSS estaba correcto.

**Proceso erróneo (lo que hicimos mal)**:
1. ❌ Agregamos CSS en wallpapers.css
2. ❌ Agregamos cache busters (?v=2)
3. ❌ Cambiamos de body a html
4. ❌ Agregamos inline styles en dashboard.html
5. ❌ Todo esto sin buscar primero qué CSS estaba bloqueando

**Proceso correcto (lo que debimos hacer)**:
1. ✅ Usar Dev Panel → Inspeccionar Estilos HTML
2. ✅ Ver que el background-image SÍ estaba aplicado
3. ✅ Buscar CSS con `grep -rn "html.dark.*background" css/`
4. ✅ Encontrar los culpables:
   - `css/main.css` línea 29: `body { background-color: #f3f4f6 }`
   - `css/main.css` línea 34: `.dark body { background-color: #111827 }`
   - `css/main.css` línea 1306: `html.dark body { background-color: var(--balanced-dark-bg) !important }`
   - `css/dark-mode-fixes.css` línea 24: `html.dark body { background-color: var(--dark-bg-primary) !important }`
   - `css/visual-redesign.css` línea 116: `body { background-color: var(--color-bg-light) }`
5. ✅ Remover esos backgrounds (hacerlos transparent)
6. ✅ Deploy

**Tiempo perdido**: ~2 horas
**Tiempo que debió tomar**: ~15 minutos

**Lección**: SIEMPRE buscar CSS conflictivos ANTES de agregar más CSS.

---

### ✅ CASO 2: City cards con espacios grises
**Problema**: Las imágenes de ciudades se veían cortadas con espacios grises a los lados.

**Proceso erróneo**:
1. ❌ Cambiar object-fit varias veces
2. ❌ Cambiar height varias veces
3. ❌ Probar diferentes combinaciones sin entender el problema

**Proceso correcto**:
1. ✅ Inspeccionar elemento (F12)
2. ✅ Ver que había `overflow: hidden` en el contenedor
3. ✅ Buscar margins negativos: `-mx-6 -mt-6`
4. ✅ Remover esos margins
5. ✅ Usar `w-full h-auto` para tamaño natural

**Lección**: Inspeccionar PRIMERO, cambiar DESPUÉS.

---

### ✅ CASO 3: Wallpapers con bloque negro gigante
**Problema**: El wallpaper se mostraba abajo pero había un bloque negro gigante que cubría la mayor parte de la página.

**Síntomas**:
- Wallpaper visible solo en footer
- Contenido principal con fondo negro sólido
- En modo claro no se veía el wallpaper en absoluto

**Proceso seguido (CORRECTO)**:
1. ✅ Usar Dev Panel → Inspeccionar Estilos HTML
2. ✅ Confirmar que background-image está aplicado en html
3. ✅ Buscar sistemáticamente con grep:
   ```bash
   grep -rn "\.tab-content\|#appDashboard" css/ --include="*.css" | grep "background"
   ```
4. ✅ Encontrar los culpables:
   - `css/main.css` línea 49: `#appDashboard { background-color: #f9fafb }`
   - `css/main.css` línea 54: `.dark #appDashboard { background-color: var(--bg-dark-main) }`
   - `css/contrast-fixes.css` línea 115: `.tab-content { background-color: #ffffff }`
   - `css/contrast-fixes.css` línea 122: `.dark .tab-content { background-color: #111827 }`
5. ✅ Cambiar todos a `transparent`
6. ✅ Deploy y verificar

**Tiempo total**: ~30 minutos (después de tener la metodología clara)

**Archivos modificados**:
- `css/main.css` - #appDashboard transparent
- `css/contrast-fixes.css` - .tab-content transparent

**Lección CRÍTICA**: Los contenedores principales (body, #appDashboard, .tab-content, main) TODOS necesitan ser transparentes para que el wallpaper del HTML se vea. Un solo contenedor con background sólido bloquea todo.

**Jerarquía de contenedores encontrada**:
```
html (aquí va el wallpaper)
└── body (transparent)
    └── #appDashboard (transparent)
        └── main
            └── .tab-content (transparent) ← Este era el bloqueador principal
                └── Cards individuales (pueden tener background)
```

---

## 💡 REGLAS DE ORO

### 1. DEBUG ANTES DE AGREGAR
❌ Mal: "No funciona, voy a agregar más CSS con !important"
✅ Bien: "No funciona, voy a buscar QUÉ lo está bloqueando"

### 2. BUSCA SISTEMÁTICAMENTE
❌ Mal: Adivinar qué archivo puede ser
✅ Bien: `grep -rn` para buscar en todos los archivos

### 3. USA HERRAMIENTAS
❌ Mal: Hacer deploy de cada cambio para probar
✅ Bien: Dev Panel → Live CSS Editor → Probar → Commitear

### 4. ENTIENDE EL ORDEN
CSS se aplica en orden de:
1. Especificidad del selector
2. Orden de carga (último gana)
3. !important (máxima prioridad)
4. Inline styles (más prioridad que archivos)

### 5. LEE ANTES DE ESCRIBIR
❌ Mal: Crear archivo nuevo sin revisar existentes
✅ Bien: Buscar archivos relacionados primero

---

## 🔄 WORKFLOW EFICIENTE

```
1. Problema identificado
   ↓
2. Reproducir en Dev Panel / Consola
   ↓
3. Buscar archivos relacionados (grep)
   ↓
4. Identificar causa raíz
   ↓
5. Probar fix en Dev Panel
   ↓
6. Aplicar fix en archivos
   ↓
7. Commit + Deploy
   ↓
8. Verificar en producción
```

---

**Última actualización**: 2025-12-01
**Casos documentados**: 2
**Tiempo ahorrado potencial**: ~2 horas por caso similar

---

Made with 💙 after learning the hard way
