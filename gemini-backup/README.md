# Gemini Backup - Sistema Alternativo de Generación de Itinerarios

Esta carpeta contiene el sistema alternativo de generación de itinerarios creado por Gemini.

## ⚠️ IMPORTANTE

**Este sistema NO está en uso actualmente.** Se ha integrado lo mejor de este sistema al generador principal (`js/smart-itinerary-generator.js`).

## 📁 Archivos

- **`engine/`** - Módulos del motor de generación
  - `city-selector.js` - Selección de ciudades basada en duración y perfil
  - `activity-recommender.js` - Recomendación de actividades con scoring
  - `day-scheduler.js` - Programación horaria con algoritmo Nearest Neighbor

- **`models/`**
  - `traveler-profile.js` - Modelo de perfil de viajero

- **`main-generator.js`** - Orquestador principal

- **`test-generator.html`** - Página de prueba

## 🎯 ¿Qué se integró al sistema principal?

### ✅ Integrado
- **Algoritmo de Nearest Neighbor** - Ya existía en el sistema principal, ahora compatible con ambas estructuras
- **Base de datos mejorada** - `data/activities-database.js` con propiedades adicionales:
  - `opening_hours`
  - `quality_rating`
  - `accessibility`
  - `tags`
  - `crowd_level`
  - `coordinates`

### ❌ No integrado (redundante)
- City selector - El sistema principal ya tiene distribución de ciudades inteligente
- Activity recommender - El sistema principal ya tiene scoring de actividades más avanzado
- Traveler profile - El dashboard ya maneja perfiles de usuario

## 💡 ¿Por qué no se usa este sistema?

1. **Sistema duplicado**: Crea un generador completamente separado del principal
2. **No integrado con el dashboard**: No se comunica con la aplicación principal
3. **Estructura diferente**: Usa un modelo de perfil incompatible con el dashboard
4. **Funcionalidad ya existente**: El sistema principal ya tenía ordenación geográfica y optimización de rutas

## 🚀 Sistema Actual Mejorado

El generador principal (`js/smart-itinerary-generator.js`) ahora incluye:
- ✅ Anti-duplicados global (Claude)
- ✅ Día 1 jet-lag friendly (Claude)
- ✅ Base de datos enriquecida (Gemini)
- ✅ Ordenación geográfica con Nearest Neighbor (ya existía, ahora mejorado)
- ✅ Cálculo de distancias Haversine compatible con lng/lon
- ✅ Adaptador que preserva todas las propiedades nuevas de Gemini

---

**Fecha de backup:** 2025-12-04
**Razón:** Integración completada - archivos guardados como referencia
