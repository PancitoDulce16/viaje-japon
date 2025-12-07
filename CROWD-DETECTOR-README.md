# 👥 Crowd Detector System - Sistema de Detección de Multitudes

Sistema completo para detectar multitudes y sugerir mejores días/horas para visitar actividades en Japón.

## 📦 Archivos Implementados

### 1. **js/crowd-detector.js** (611 líneas)
Core del sistema con toda la lógica de detección.

**Características:**
- ✅ Fechas críticas 2025-2028: Golden Week, Obon, Sakura, Año Nuevo
- ✅ 32 festivos japoneses (2025-2026)
- ✅ Mejores días para 10+ actividades populares
- ✅ Mejores horas del día para 6+ actividades
- ✅ Detección de días cerrados (ej: Sanrio cierra miércoles)
- ✅ Análisis de nivel de multitudes (normal, high, extreme)
- ✅ Generación de reportes visuales con HTML

**Métodos principales:**
```javascript
crowdDetector.analyzeCrowdLevel(date, activityName)
// Returns: { crowdLevel, warnings[], tips[], isHoliday, holidayName }

crowdDetector.getBestTimeForActivity(activityName)
// Returns: { bestTimes[], avoidTimes[], criticalInfo, recommendation }

crowdDetector.suggestBestDay(activityName)
// Returns: { bestDays[], worstDays[], closedDays[], tip, recommendation }

crowdDetector.generateCrowdReport(date, activities[])
// Returns: HTML string with color-coded visual report
```

### 2. **js/crowd-detector-ui.js** (520 líneas)
Componentes UI para integrar el detector con el sistema visual.

**Características:**
- ✅ Estilos CSS inyectados automáticamente
- ✅ Warning banners con gradientes (verde/naranja/rojo)
- ✅ Badges pequeños para actividades individuales
- ✅ Modal con análisis completo
- ✅ Soporte dark mode
- ✅ Animaciones suaves

**Métodos principales:**
```javascript
crowdDetectorUI.generateWarningBanner(date, activities[])
// Genera banner grande con warnings y tips

crowdDetectorUI.generateActivityBadge(date, activityName)
// Genera badge pequeño para mostrar en lista de actividades

crowdDetectorUI.showCrowdAnalysisModal(date, activities[])
// Muestra modal con análisis completo

crowdDetectorUI.generateTripCrowdBadge(startDate, endDate)
// Genera badge para el header del trip
```

### 3. **js/crowd-detector-integration.js** (580 líneas)
Guía de integración con ejemplos de código para itinerary-v3.js.

**Contiene:**
- ✅ Código completo listo para copiar
- ✅ Instrucciones paso a paso
- ✅ Función de testing: `testCrowdDetector()`

## 🚀 Cómo Usar

### Testing Básico

Abre la consola en el dashboard y ejecuta:

```javascript
testCrowdDetector()
```

Esto probará:
1. Análisis de Golden Week 2025
2. Análisis de día normal
3. Generación de warning banner
4. Generación de activity badge
5. Análisis de rango de fechas

### Ejemplo Manual de Uso

```javascript
// Analizar un día específico
const analysis = crowdDetector.analyzeCrowdLevel('2025-05-03', 'Tokyo DisneySea');
console.log(analysis);
// {
//   date: "2025-05-03",
//   dayOfWeek: "Sábado",
//   crowdLevel: "extreme",
//   warnings: ["⚠️⚠️ GOLDEN WEEK - TODO 3X MÁS LLENO Y CARO", "⚠️ Sábado es el peor día para Tokyo DisneySea"],
//   tips: [],
//   isHoliday: true,
//   holidayName: "Constitution Day"
// }

// Obtener mejores horas para una actividad
const timeInfo = crowdDetector.getBestTimeForActivity('Fushimi Inari');
console.log(timeInfo.recommendation);
// "Llega ANTES de 9:30am o después de 4pm. Tours chinos arriban 9:30-11am."

// Sugerir mejor día para una actividad
const dayInfo = crowdDetector.suggestBestDay('Sanrio Puroland');
console.log(dayInfo);
// {
//   bestDays: ["Jueves", "Viernes"],
//   worstDays: ["Sábado", "Domingo"],
//   closedDays: ["Miércoles"],
//   tip: "⚠️ CIERRA LOS MIÉRCOLES",
//   recommendation: "Mejor: Jueves-Viernes (menos familias). ⚠️ NUNCA Miércoles (cerrado)"
// }

// Generar HTML warning banner
const banner = crowdDetectorUI.generateWarningBanner('2025-05-03', ['Tokyo DisneySea', 'Sensō-ji']);
document.getElementById('container').innerHTML = banner;

// Mostrar modal con análisis completo
crowdDetectorUI.showCrowdAnalysisModal('2025-05-03', ['Tokyo DisneySea', 'Sensō-ji', 'Shibuya Crossing']);
```

## 🏗️ Integración con Itinerario

### Paso 1: Agregar Warning Banner al Day Overview

En `itinerary-v3.js`, dentro de la función `renderDayOverview()`, agrega:

```javascript
<!-- 👥 Análisis de Multitudes (Colapsable) -->
${renderDayCrowdAnalysisCollapsible(day)}
```

### Paso 2: Agregar Badges a las Actividades

En la función que renderiza cada actividad, agrega:

```javascript
${renderActivityCrowdBadge(day, activity)}
```

### Paso 3: Agregar Badge al Header del Trip

En `renderTripSelector()`, agrega:

```javascript
${renderTripCrowdBadge()}
```

### Paso 4: Copiar las Funciones Helper

Al final de `itinerary-v3.js`, copia estas funciones desde `crowd-detector-integration.js`:

- `renderDayCrowdAnalysisCollapsible(day)`
- `renderActivityCrowdBadge(day, activity)`
- `renderTripCrowdBadge()`

Ver archivo completo en: `js/crowd-detector-integration.js` (líneas 150-280)

## 📊 Datos Incluidos

### Fechas Críticas (2025-2028)

**Golden Week:**
- 2025: 29 Abr - 6 Mayo (8 días)
- 2026: 29 Abr - 6 Mayo (8 días)
- 2027: 29 Abr - 6 Mayo (8 días)
- 2028: 29 Abr - 7 Mayo (9 días)

**Obon Festival:**
- 2025: 13-16 Agosto
- 2026: 13-16 Agosto
- 2027: 13-16 Agosto
- 2028: 13-16 Agosto

**Sakura Peak:**
- 2025: 22 Marzo - 10 Abril
- 2026: 20 Marzo - 8 Abril
- 2027: 22 Marzo - 10 Abril
- 2028: 20 Marzo - 8 Abril

**Año Nuevo:**
- 1-3 Enero cada año

**Long Weekends:**
- Múltiples fines de semana largos por festivos nacionales

### Festivos Japoneses 2025-2026 (32 total)

1. Año Nuevo (1 Ene)
2. Coming of Age Day (2do Lun Ene)
3. National Foundation Day (11 Feb)
4. Emperor's Birthday (23 Feb)
5. Vernal Equinox Day (~20 Mar)
6. Showa Day (29 Abr)
7. Constitution Day (3 Mayo)
8. Greenery Day (4 Mayo)
9. Children's Day (5 Mayo)
10. Marine Day (3er Lun Jul)
11. Mountain Day (11 Ago)
12. Respect for Aged Day (3er Lun Sep)
13. Autumnal Equinox Day (~23 Sep)
14. Sports Day (2do Lun Oct)
15. Culture Day (3 Nov)
16. Labor Thanksgiving Day (23 Nov)

### Actividades con Datos de Multitudes (10+)

**Theme Parks:**
- Tokyo DisneySea (mejor: Mar-Jue, peor: Sáb-Dom-Lun)
- Sanrio Puroland (mejor: Jue-Vie, peor: Sáb-Dom, **cierra: Mié**)
- Universal Studios Japan (mejor: Mié-Jue, peor: Vie-Sáb-Dom)

**Templos/Santuarios:**
- Fushimi Inari (mejor: 6-8:30am, 4-6pm)
- Sensō-ji (mejor: 7-9am, 5-7pm)
- Meiji Jingu (mejor: 7-9am, 4-6pm)
- Kiyomizu-dera (mejor: 6-8am, después 5pm)

**Atracciones Urbanas:**
- Shibuya Crossing (mejor: mañana temprano, peor: 5-8pm)
- Harajuku Takeshita Street (mejor: 9-11am, peor: 12-5pm)

**Naturaleza:**
- Arashiyama Bamboo Grove (mejor: 6-8am, evitar 10am-4pm)

## 🎨 Estilos Visuales

### Niveles de Multitud

**Normal (Verde):**
- Gradiente: #10b981 → #059669
- Icon: ✅
- Mensaje: "Nivel de Multitudes: Normal"

**High (Naranja):**
- Gradiente: #f59e0b → #d97706
- Icon: ⚠️
- Mensaje: "Nivel de Multitudes: Alto"

**Extreme (Rojo):**
- Gradiente: #ef4444 → #dc2626
- Icon: 🚨
- Mensaje: "Nivel de Multitudes: EXTREMO"
- Animación: pulse infinito

### Tipos de Badges

**Best Day (Verde):**
- "✅ Mejor día - Menos gente"

**Worst Day (Rojo):**
- "⚠️ Peor día - Más concurrido"

**Closed (Amarillo):**
- "❌ Cierra los [días]"

## 🧪 Testing

### Test Automático

```javascript
testCrowdDetector()
```

### Tests Manuales Recomendados

1. **Golden Week 2025:**
   ```javascript
   crowdDetector.analyzeCrowdLevel('2025-05-03')
   // Debe mostrar: crowdLevel = "extreme"
   ```

2. **Sanrio en Miércoles:**
   ```javascript
   crowdDetectorUI.generateActivityBadge('2025-06-11', 'Sanrio Puroland')
   // Debe mostrar: "❌ Cierra los Miércoles"
   ```

3. **Fushimi Inari mejor hora:**
   ```javascript
   crowdDetector.getBestTimeForActivity('Fushimi Inari')
   // Debe mostrar: "antes 9:30am o después 4pm"
   ```

4. **Range de fechas:**
   ```javascript
   const range = crowdDetector.analyzeDateRange('2025-05-01', '2025-05-07')
   console.log(range.filter(d => d.crowdLevel === 'extreme').length)
   // Debe mostrar: 5-7 días extremos (Golden Week completo)
   ```

## 📱 Responsive Design

Todos los componentes UI son totalmente responsive:
- ✅ Mobile: banners ajustables, texto legible
- ✅ Tablet: layout optimizado
- ✅ Desktop: diseño completo
- ✅ Dark mode: soporte completo

## 🚧 Próximos Pasos (Opcionales)

1. **Agregar más actividades:**
   - Editar `initBestDays()` y `initBestTimes()` en `crowd-detector.js`

2. **Actualizar fechas 2029+:**
   - Agregar nuevos años en `initCrowdDates()`

3. **Agregar clima:**
   - Integrar con API de clima para detectar temporada de lluvias

4. **Machine Learning:**
   - Usar datos históricos de Google Trends para mejorar predicciones

5. **User feedback:**
   - Permitir a usuarios reportar niveles reales de multitudes

## 💡 Tips de Desarrollo

1. **Debuggear:**
   ```javascript
   // Habilitar logs detallados
   window.crowdDetector.DEBUG = true;
   ```

2. **Modificar warnings:**
   - Editar mensajes en `analyzeCrowdLevel()` líneas 230-290

3. **Cambiar colores:**
   - Editar gradientes en `injectStyles()` de crowd-detector-ui.js

4. **Agregar nuevas actividades:**
   ```javascript
   // En initBestDays()
   "Tu Nueva Actividad": {
       best: ["Lunes", "Martes"],
       worst: ["Sábado", "Domingo"],
       tip: "Tu consejo aquí"
   }
   ```

## ✅ Estado Actual

- [x] Sistema core implementado (crowd-detector.js)
- [x] UI components implementados (crowd-detector-ui.js)
- [x] Guía de integración creada (crowd-detector-integration.js)
- [x] Scripts agregados a dashboard.html
- [x] Desplegado a Firebase
- [x] Testing básico implementado
- [ ] Integrado en itinerary-v3.js (pendiente - requiere modificar archivo existente)

## 🎯 Impacto

**Wow Factor:** ⭐⭐⭐⭐⭐ (5/5)
- Feature único que otros planificadores NO tienen
- Datos específicos de Japón (festivos, Golden Week, Sakura)
- Consejos prácticos y accionables
- Visual impactante con gradientes y animaciones

**Complejidad:** ⚙️⚙️ (2/5)
- Relativamente fácil de mantener
- No requiere APIs externas
- Datos estáticos fáciles de actualizar
- Lógica clara y bien documentada

## 📚 Referencias

- [Festivos Japoneses Oficiales](https://www.officeholidays.com/countries/japan)
- [Golden Week Wikipedia](https://en.wikipedia.org/wiki/Golden_Week_(Japan))
- [Mejores horarios para templos](https://www.japan-guide.com/)

---

**Implementado por:** Claude Code
**Fecha:** Diciembre 2025
**Versión:** 1.0.0
