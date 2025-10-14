# 🚀 Guía Rápida: Nuevo Sistema de Itinerario Flexible

## ¿Qué cambió?

### ❌ Antes (Sistema Antiguo)
```
Día 1: [Dropdown: Selecciona una ciudad] → Tokyo
Día 2: [Dropdown: Selecciona una ciudad] → Kyoto
Día 3: [Dropdown: Selecciona una ciudad] → Osaka
```
**Problema**: Solo una ciudad por día completo. ❌ No permite visitas cortas.

---

### ✅ Ahora (Sistema Nuevo)
```
┌─────────────────────────────────────────────────┐
│ 📅 Día 1 - Mié, 16 Feb                          │
│ Ciudades del día: 2 ciudades                    │
│ [+ Agregar Ciudad]                              │
├─────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐   │
│ │ Ciudad: [Tokyo ▼]                        │   │
│ │ Hora inicio: [09:00] Hora fin: [13:00]  │   │
│ └──────────────────────────────────────────┘   │
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ Ciudad: [Yokohama ▼]                     │   │
│ │ Hora inicio: [15:00] Hora fin: [20:00]  │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```
**¡Genial!**: Múltiples ciudades, horarios flexibles, visitas cortas. ✅

---

## 📖 Cómo Usar el Nuevo Sistema

### Paso 1: Crear Nuevo Itinerario
1. Ve a la pestaña **"Itinerario"**
2. Click en **"Crear Itinerario"**
3. Completa el **Step 1**: Nombre y fechas

### Paso 2: Agregar Ciudades a Cada Día
Para cada día de tu viaje:

#### Opción A: Una ciudad todo el día (Simple)
1. Click en **"+ Agregar Ciudad"**
2. Selecciona la ciudad del dropdown
3. **Deja los horarios vacíos** → se asume todo el día
4. ✅ Listo!

```
Ejemplo:
┌─────────────────────────────┐
│ Ciudad: Tokyo               │
│ Hora inicio: [vacío]        │
│ Hora fin: [vacío]           │
└─────────────────────────────┘
Resultado: "Todo el día en Tokyo"
```

#### Opción B: Múltiples ciudades (Avanzado)
1. Click en **"+ Agregar Ciudad"** varias veces
2. Para cada ciudad:
   - Selecciona la ciudad
   - Indica hora inicio y hora fin
3. ✅ Crea itinerarios complejos!

```
Ejemplo:
┌─────────────────────────────┐
│ Ciudad: Tokyo               │
│ Hora inicio: 09:00          │
│ Hora fin: 13:00             │
└─────────────────────────────┘
┌─────────────────────────────┐
│ Ciudad: Kamakura            │
│ Hora inicio: 15:00          │
│ Hora fin: 19:00             │
└─────────────────────────────┘
Resultado: "Visitando Tokyo y Kamakura"
         Tokyo (09:00-13:00) → Kamakura (15:00-19:00)
```

### Paso 3: Continuar con el Wizard
- **Step 3**: Vuelos (opcional)
- **Step 4**: Categorías de interés
- **Step 5**: Plantilla o desde cero
- Click en **"✨ Crear Itinerario"**

---

## 💡 Casos de Uso Comunes

### Caso 1: Tour Relajado 🌸
**Objetivo**: Explorar cada ciudad a fondo
```
Día 1: Tokyo (todo el día)
Día 2: Kyoto (todo el día)
Día 3: Osaka (todo el día)
```
**Cómo hacerlo**: Agrega una ciudad por día sin horarios.

---

### Caso 2: Viaje Intenso 🚄
**Objetivo**: Ver lo máximo posible
```
Día 1: Tokyo (9am-2pm) → Yokohama (4pm-9pm)
Día 2: Kamakura (10am-3pm) → Enoshima (4pm-8pm)
Día 3: Nikko (todo el día)
```
**Cómo hacerlo**: Agrega 2-3 ciudades por día con horarios específicos.

---

### Caso 3: Base + Excursiones 🗺️
**Objetivo**: Quedarse en una ciudad y hacer viajes de día
```
Día 1: Tokyo (todo el día) - llegada
Día 2: Nikko (9am-6pm) - excursión
Día 3: Tokyo (todo el día)
Día 4: Hakone (10am-5pm) - excursión
Día 5: Tokyo (todo el día) - salida
```
**Cómo hacerlo**: Alterna días completos con excursiones cortas.

---

### Caso 4: Ruta Circular 🔄
**Objetivo**: Visitar múltiples ciudades sin volver
```
Día 1: Tokyo (todo el día)
Día 2: Hakone (10am-4pm) → Kyoto (llegada noche)
Día 3: Kyoto (todo el día)
Día 4: Nara (9am-2pm) → Osaka (3pm-9pm)
Día 5: Osaka (todo el día)
```
**Cómo hacerlo**: Usa horarios para indicar traslados entre ciudades.

---

## ⚡ Tips y Trucos

### Tip 1: Horarios Opcionales
- **Sin horarios** = Todo el día en esa ciudad
- **Con horarios** = Visita específica con tiempo definido

### Tip 2: Orden Importa
- Las ciudades se muestran en el orden que las agregaste
- Representa tu ruta cronológica del día

### Tip 3: Validación Automática
- El sistema te avisará si olvidas agregar una ciudad a algún día
- No podrás avanzar hasta completar todos los días

### Tip 4: Eliminar Fácilmente
- Cada bloque de ciudad tiene un botón 🗑️ para eliminarlo
- Click y listo, sin confirmación

### Tip 5: Vista Previa
- El contador muestra "X ciudades" para cada día
- Te ayuda a ver de un vistazo la complejidad de cada día

---

## 🎨 Interfaz Visual

### Contador de Ciudades
```
Sin ciudades           → Gris
1 ciudad              → "1 ciudad"
2 o más ciudades      → "X ciudades"
```

### Indicadores en el Overview
```
🗺️ Ciudad: Tokyo
   ✅ Todo el día

🗺️ Ciudades del día:
   📍 Tokyo (09:00 - 13:00)
   📍 Kamakura (15:00 - 19:00)
```

---

## ❓ Preguntas Frecuentes

### ¿Puedo agregar más de 3 ciudades por día?
✅ Sí, no hay límite. Pero considera el tiempo de traslado.

### ¿Qué pasa si dejo los horarios vacíos?
✅ El sistema asume que pasarás todo el día en esa ciudad.

### ¿Puedo visitar la misma ciudad múltiples veces?
✅ Sí, puedes repetir ciudades en diferentes días.

### ¿Cómo elimino una ciudad?
✅ Click en el botón 🗑️ al lado derecho del bloque.

### ¿Los horarios son obligatorios?
❌ No, son completamente opcionales. Úsalos solo si quieres ser específico.

### ¿Funciona en móvil?
✅ Sí, la interfaz es completamente responsive.

---

## 🎯 Ejemplos Reales

### Ejemplo 1: Primer Viaje a Japón (10 días)
```
Día 1:  Tokyo (todo el día) - Jet lag y exploración
Día 2:  Tokyo (todo el día) - Shibuya, Harajuku
Día 3:  Tokyo (todo el día) - Asakusa, Akihabara
Día 4:  Nikko (9am-5pm) - Excursión de día
Día 5:  Tokyo → Kyoto (traslado)
Día 6:  Kyoto (todo el día) - Templos
Día 7:  Kyoto (todo el día) - Arashiyama
Día 8:  Nara (9am-3pm) + Osaka (5pm-9pm)
Día 9:  Osaka (todo el día) - Dotonbori
Día 10: Osaka (mañana) → Aeropuerto
```

### Ejemplo 2: Viaje Express (5 días)
```
Día 1:  Tokyo (9am-2pm) + Yokohama (4pm-9pm)
Día 2:  Kamakura (9am-1pm) + Enoshima (2pm-6pm)
Día 3:  Hakone (todo el día)
Día 4:  Kyoto (9am-8pm)
Día 5:  Osaka (9am-12pm) → Aeropuerto
```

---

## 🚀 Mejoras vs Sistema Antiguo

| Característica | Antiguo | Nuevo |
|---------------|---------|-------|
| Ciudades/día | 1 | ∞ |
| Horarios | ❌ | ✅ |
| Visitas cortas | ❌ | ✅ |
| Flexibilidad | Baja | Alta |
| Facilidad de uso | Media | Alta |
| Visual feedback | Básico | Rico |

---

## ✨ Conclusión

El nuevo sistema te da **control total** sobre tu itinerario. Puedes hacer desde viajes simples de una ciudad por día, hasta itinerarios complejos con múltiples paradas, horarios específicos, y visitas cortas.

**¡Disfruta planeando tu viaje perfecto a Japón! 🇯🇵**
