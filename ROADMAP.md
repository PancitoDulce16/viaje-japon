# 🗺️ ROADMAP - Viaje Japón App

## ✅ COMPLETADO

### Funcionalidades Core
- [x] Sistema de autenticación (Firebase Auth)
- [x] Itinerario interactivo con drag & drop
- [x] Sistema de viajes colaborativos
- [x] Packing list colaborativa
- [x] Notas compartidas
- [x] Chat grupal
- [x] Mapa interactivo con marcadores
- [x] Atracciones principales
- [x] Emergency Assistant
- [x] Expense Splitter
- [x] Pre-Trip Checklist
- [x] Currency Converter (JPY)
- [x] Weather Integration
- [x] Recommendation Engine básico
- [x] Template-based itinerary generation
- [x] Firebase Resilience System
- [x] Integration Tests automáticos
- [x] Dark mode con colores vibrantes

### Fixes Recientes
- [x] Login redirect loop
- [x] Actividades mostrando "undefined"
- [x] Botones de modal no funcionaban
- [x] Drag and drop
- [x] Contraste en modo oscuro
- [x] Data cleanup automático

---

## 🚀 EN PROGRESO (Próximas 3 features)

### 1. 🗺️ Optimización de Ruta Inteligente
**Prioridad:** ALTA | **Estimado:** ~25k tokens | **Status:** 🔜 Próximo

**Descripción:**
Sistema de optimización de rutas diarias usando algoritmo TSP (Traveling Salesman Problem) simplificado.

**Características:**
- Algoritmo de nearest-neighbor para ordenar actividades
- Cálculo de distancias usando Haversine formula
- Detección de clusters geográficos
- Visualización de ruta optimizada vs original
- Cálculo de ahorro de tiempo/dinero
- Consideración de horarios de apertura
- Modo manual override (puedes desactivar la optimización)

**Impacto:**
- Reduce tiempo de traslados en 40-70%
- Ahorra dinero en transporte
- Más tiempo para disfrutar actividades

---

### 2. ⚖️ Balance Inteligente de Días
**Prioridad:** ALTA | **Estimado:** ~20k tokens | **Status:** 🔜 Siguiente

**Descripción:**
Sistema automático que detecta y balancea días sobrecargados vs vacíos.

**Características:**
- Scoring de "peso" por día (actividades, km, costo, energía)
- Detección de días desbalanceados
- Sugerencias de redistribución de actividades
- Balance de categorías (evita 5 templos el mismo día)
- Cálculo de energía requerida por actividad
- Distribución uniforme de costos
- Respeta días de descanso planificados

**Algoritmo de Peso:**
```javascript
dayWeight = {
  activities: count * 10,
  distance: totalKm * 5,
  cost: totalYen / 100,
  energy: sum(activityEnergy),
  category_diversity: -varietyBonus
}
```

**Impacto:**
- Evita agotamiento
- Mejor experiencia de viaje
- Uso eficiente del tiempo

---

### 3. 🔮 Predicción de Experiencia del Día
**Prioridad:** MEDIA-ALTA | **Estimado:** ~15k tokens | **Status:** 🔜 Después

**Descripción:**
Dashboard predictivo que muestra cómo será cada día antes de vivirlo.

**Características:**
- **Nivel de Energía:** Escala 1-5 (Relajado → Extenuante)
- **Impacto en Cartera:** $ → $$$$
- **Nivel de Multitud:** Basado en popularidad + día de semana
- **Tipo de Día:** % Cultural / Gastronómico / Aventura / Shopping
- **Mejor Horario:** Mañana / Tarde / Noche
- **Alertas:** Cierres tempranos, días festivos, clima
- **Comparación entre días:** Ver todos los días a la vez

**Visualización:**
```
┌─────────────────────────────────────────┐
│  📊 Predicción Día 5 - Kyoto Este       │
├─────────────────────────────────────────┤
│  🔋 Energía: ⚡⚡⚡⚡ Intenso            │
│  💰 Costo: ¥¥¥ Moderado-Alto (¥8,500)   │
│  👥 Multitud: 🟠 Moderado (Martes)      │
│  🎨 Tipo: 60% Cultural, 40% Food        │
│  ⏰ Mejor: Empezar 8 AM                 │
│  ⚠️ 2 lugares cierran a las 17:00       │
│  🚶 12 km caminando                      │
│  🚇 6 traslados en tren                 │
└─────────────────────────────────────────┘
```

**Impacto:**
- Mejor planificación
- Sin sorpresas desagradables
- Preparación mental adecuada

---

## 📋 BACKLOG (Ordenado por Prioridad)

### 🔥 Prioridad ALTA (Próximas 5-10 features)

#### A1. ⏱️ Calculador de Tiempos de Traslado
**Estimado:** ~25k tokens

**Descripción:**
Calcula automáticamente tiempo entre cada actividad del día.

**Características:**
- Integración con Google Maps Distance Matrix API (gratis 2,500 req/día)
- Fallback a cálculo por Haversine si no hay API
- Detección automática de modo de transporte (🚇 tren / 🚶 caminar)
- Muestra líneas de tren específicas para Japón
- Suma total de tiempo de traslados por día
- Alertas de traslados largos (>45 min)
- Consideración de tiempo de espera en estaciones

**Visualización:**
```
📍 Shibuya Crossing (10:00 - 11:00)
    ↓ 🚇 12 min (Yamanote Line) + 🚶 3 min
📍 Meiji Shrine (11:30 - 13:00)
    ↓ 🚇 8 min (Chiyoda Line)
📍 Akihabara (13:30 - 16:00)

Total traslados: 35 min
```

---

#### A2. 📊 Resumen Diario Inteligente
**Estimado:** ~20k tokens

**Descripción:**
Dashboard visual mostrando resumen de cada día.

**Características:**
- Número de actividades
- Costo total estimado
- Tiempo ocupado vs tiempo libre
- Distancia total a caminar
- Zona geográfica principal
- Nivel de intensidad
- Gráfica de timeline del día
- Comparación entre días (ver todos a la vez)

**Visualización:**
```
┌─────────────────────────────────────┐
│  📅 Día 3 - Kyoto                   │
├─────────────────────────────────────┤
│  🎯 6 actividades                   │
│  💴 ¥8,500 estimado                 │
│  ⏰ 8h ocupado, 4h libre            │
│  🚶 ~12 km caminando                │
│  🗺️ Zona: Este de Kyoto             │
│  ⚡ Intensidad: ⚡⚡⚡ Balanceado    │
│                                     │
│  Timeline:                          │
│  08:00 ████ Fushimi Inari          │
│  11:00 ██ Traslado                 │
│  12:00 ████ Almuerzo               │
│  14:00 ██████ Kiyomizu-dera        │
│  ...                                │
└─────────────────────────────────────┘
```

---

#### A3. 🎯 Context-Aware Suggestions
**Estimado:** ~25k tokens

**Descripción:**
Sugerencias que consideran el contexto completo del itinerario.

**Características:**
- Sugerencias basadas en hora del día
- Considera actividades previas (si 3 templos → sugiere café)
- Alertas de clima (lluvia → indoor activities)
- Proximidad geográfica (estás en Asakusa → sugiere cercanos)
- Horarios de cierre
- Días festivos/eventos especiales
- Último día → cerca del aeropuerto

**Ejemplos:**
```
☀️ "Estás en Asakusa a las 18:00"
   → Sugerencia: 🍜 Restaurante tradicional cercano

🏯 "Has visitado 3 templos consecutivos"
   → Sugerencia: ☕ Café para descansar

🌧️ "Pronóstico: Lluvia todo el día"
   → Sugerencia: 🏛️ Museo / 🛍️ Centro comercial

✈️ "Último día, vuelo a las 18:00"
   → Sugerencia: Actividades zona Narita
```

---

#### A4. 🚄 Train Route Planner (Específico Japón)
**Estimado:** ~40k tokens

**Descripción:**
Planificador de rutas de tren con JR Pass calculator.

**Características:**
- Base de datos de rutas JR principales
- Calculador de conveniencia de JR Pass
- Costo individual vs JR Pass 7/14/21 días
- Tiempos estimados de trayecto
- Transbordos necesarios
- Recomendación de horarios (evitar rush hour)
- Links a Hyperdia para detalles

**Visualización:**
```
🚄 Ruta: Tokyo → Kyoto
────────────────────────────────────
🎫 JR Pass: GRATIS (Recomendado)
💴 Sin Pass: ¥13,320
⏱️ Duración: 2h 15min
🔄 0 transbordos

🚅 Shinkansen Nozomi
   Tokyo Station → Kyoto Station
   Salidas cada 15 min (06:00-21:00)

💡 Consejo: Evitar 07:30-09:00 (rush hour)

📊 Tu JR Pass 7 días:
   Usado: ¥38,500 / Costo: ¥29,650
   ✅ AHORRO: ¥8,850
```

---

#### A5. 📸 Photo Gallery por Actividad
**Estimado:** ~30k tokens

**Descripción:**
Álbum de fotos organizado por lugar visitado.

**Características:**
- Subir fotos por actividad
- Galería visual con thumbnails
- Geolocalización automática
- Timestamp automático
- Compartir álbum
- Exportar como álbum digital
- Integración con Firebase Storage

---

#### A6. ⏰ Countdown Timer al Viaje
**Estimado:** ~15k tokens

**Descripción:**
Cuenta regresiva motivadora hasta el viaje.

**Características:**
- Días, horas, minutos, segundos
- Animaciones
- Milestone alerts (30 días, 1 semana, etc.)
- Widget en dashboard
- Frases motivadoras
- Checklist de preparación por tiempo restante

**Visualización:**
```
┌─────────────────────────────────────┐
│     🎌 VIAJE A JAPÓN 2026           │
│                                     │
│       ✈️ FALTAN ✈️                  │
│                                     │
│    142 días 05:23:17                │
│                                     │
│  📅 Feb 16, 2026 - Mar 2, 2026      │
│  ⏰ 15 días de aventura              │
│                                     │
│  💡 "¡Ya casi! Empieza a estudiar   │
│      frases en japonés"             │
└─────────────────────────────────────┘
```

---

#### A7. 💰 Daily Budget Tracker
**Estimado:** ~25k tokens

**Descripción:**
Seguimiento de gastos diarios vs presupuesto.

**Características:**
- Presupuesto por día
- Registro de gastos reales
- Categorización (comida, transporte, souvenirs)
- Alertas de sobre-gasto
- Gráficas de tendencia
- Proyección de gasto final
- Sugerencias de ajuste

**Visualización:**
```
┌─────────────────────────────────────┐
│  💰 Día 3 - Presupuesto             │
├─────────────────────────────────────┤
│  Presupuesto: ¥8,000                │
│  Gastado: ¥6,500 (81%) ✅           │
│  Restante: ¥1,500                   │
│                                     │
│  Desglose:                          │
│  🍜 Comida: ¥3,200 (40%)            │
│  🎫 Entradas: ¥2,500 (31%)          │
│  🚇 Transporte: ¥800 (10%)          │
│                                     │
│  📊 Promedio diario: ¥7,200         │
│  📈 Proyección total: ¥108,000      │
│  ⚠️ Presupuesto total: ¥120,000     │
│  ✅ Vas bien! 💪                     │
└─────────────────────────────────────┘
```

---

### 🟡 Prioridad MEDIA (Features útiles)

#### M1. 📅 Exportar a Google Calendar
**Estimado:** ~20k tokens

Sincronización automática con Google Calendar.

---

#### M2. 📄 Exportar a PDF Bonito
**Estimado:** ~35k tokens

Generar PDF imprimible con mapas, fotos, info completa.

---

#### M3. 🔗 Share Trip (Link público)
**Estimado:** ~20k tokens

URL pública de solo lectura para compartir itinerario.

---

#### M4. 📱 Modo "En Viaje"
**Estimado:** ~25k tokens

UI simplificada para usar durante el viaje con info esencial.

---

#### M5. ✅ Check-in de Actividades
**Estimado:** ~20k tokens

Marcar "Ya estoy aquí" con foto/nota/rating.

---

#### M6. 📖 Diario de Viaje Automático
**Estimado:** ~25k tokens

Generar diario automático con actividades completadas.

---

#### M7. ⭐ Rating Post-Visita
**Estimado:** ~15k tokens

Calificar cada lugar después de visitarlo.

---

#### M8. 🎲 Language Phrases Quiz
**Estimado:** ~30k tokens

Mini juego para practicar frases en japonés.

---

#### M9. 🔔 Alarmas/Recordatorios
**Estimado:** ~20k tokens

Notificaciones antes de cada actividad.

---

#### M10. 🗺️ Vista de Mapa por Día
**Estimado:** ~25k tokens

Ver en el mapa solo las actividades de un día específico.

---

#### M11. 📊 Vista de Timeline Visual
**Estimado:** ~30k tokens

Ver todo el viaje en línea temporal interactiva.

---

#### M12. 🗓️ Vista de Calendario
**Estimado:** ~25k tokens

Mostrar actividades en formato calendario mensual.

---

#### M13. 🎨 Colores por Categoría
**Estimado:** ~15k tokens

Código de colores visual (templos=rojo, comida=naranja, etc).

---

#### M14. 🔄 Modo Compacto/Expandido
**Estimado:** ~15k tokens

Toggle para ver más o menos detalles de actividades.

---

#### M15. 🌐 Offline Mode Mejorado
**Estimado:** ~40k tokens

PWA completo que funciona sin internet.

---

### 🔵 Prioridad BAJA (Nice to have)

#### L1. 🍽️ Restaurant Finder
**Estimado:** ~35k tokens

Buscador de restaurantes con Google Places.

---

#### L2. 🏨 Horarios de Apertura Automáticos
**Estimado:** ~30k tokens

Integración con horarios reales de Google.

---

#### L3. 📊 Nivel de Multitud Predicción
**Estimado:** ~25k tokens

Usar Google Popular Times para predecir multitudes.

---

#### L4. 🎯 Actividades Alternativas por Clima
**Estimado:** ~25k tokens

Sugerencias automáticas si llueve.

---

#### L5. 🗂️ Free Time Blocks
**Estimado:** ~20k tokens

Bloques de "tiempo libre" para improvisar.

---

#### L6. 📝 Backup Activities
**Estimado:** ~20k tokens

Lista de "Plan B" si algo sale mal.

---

#### L7. 👥 Asignación de Responsables
**Estimado:** ~20k tokens

Quién investiga/reserva cada actividad.

---

#### L8. 💬 Comentarios por Actividad
**Estimado:** ~25k tokens

Mini chat en cada actividad.

---

#### L9. 📚 Versiones del Itinerario
**Estimado:** ~30k tokens

Guardar diferentes versiones/borradores.

---

#### L10. ⚠️ Detector de Conflictos de Horario
**Estimado:** ~20k tokens

Detectar si dos actividades se solapan.

---

#### L11. 👔 Dress Code/Requisitos
**Estimado:** ~15k tokens

Recordatorios de requisitos (ej: cubrir hombros en templos).

---

#### L12. 📍 Reservaciones Requeridas
**Estimado:** ~15k tokens

Marcar qué necesita reserva previa.

---

#### L13. 📈 Estadísticas del Viaje Completas
**Estimado:** ~30k tokens

Analytics: templos visitados, km recorridos, presupuesto usado.

---

#### L14. 🗺️ Heatmap de Actividades
**Estimado:** ~25k tokens

Ver en mapa de calor dónde pasas más tiempo.

---

#### L15. 📊 Gráficas de Costos
**Estimado:** ~20k tokens

Visualización de presupuesto por categoría/día.

---

#### L16. 🔄 Comparador Pre/Post Viaje
**Estimado:** ~25k tokens

"Planeaste 50 actividades, hiciste 42".

---

#### L17. 📱 QR Code del Día
**Estimado:** ~15k tokens

Generar QR con info del día.

---

#### L18. 📈 Learning from Edits
**Estimado:** ~20k tokens

Sistema que aprende de cada cambio que haces.

---

#### L19. 🤖 Auto-Fill Missing Days
**Estimado:** ~25k tokens

Rellena días vacíos inteligentemente.

---

#### L20. 🎯 Sugerencias de Actividades Cercanas
**Estimado:** ~20k tokens

"Cerca de X también está Y".

---

## 📊 RESUMEN

**Total Features Implementadas:** 25
**Total Features Planificadas:** 60+
**Cobertura Actual:** ~42%

**Próximas 3 Features:** ~60k tokens
**Prioridad Alta (13 features):** ~385k tokens
**Prioridad Media (15 features):** ~360k tokens
**Prioridad Baja (20 features):** ~445k tokens

**Total Estimado para Completar TODO:** ~1,250k tokens 🚀

---

## 🎯 NOTAS

- **Todas las features usan algoritmos puros** - NO requieren APIs pagadas de AI/LLM
- **100% gratis y offline** - Solo JavaScript, sin costos
- **Priorización basada en utilidad para viaje a Japón**
- **Features marcadas con 🔥 son las más impactantes**

---

**Última actualización:** 2025-11-05
