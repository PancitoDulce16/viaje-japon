# 🇯🇵 Japan Trip Planner - Sistema Completo de Itinerarios

> Planificador colaborativo de viajes con itinerarios dinámicos, integración de APIs y sincronización en tiempo real

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Status](https://img.shields.io/badge/status-production_ready-green)
![Firebase](https://img.shields.io/badge/firebase-integrated-orange)
![APIs](https://img.shields.io/badge/APIs-4_integrated-purple)

---

## 🚀 NUEVO - Sistema de Itinerarios Dinámicos

### ✨ Features Principales

- 🧙‍♂️ **Wizard de 4 Pasos** - Creación guiada de itinerarios
- ✈️ **25+ Aerolíneas** - Selección de aerolíneas reales
- 🔗 **Conexiones Ilimitadas** - Agregar escalas y vuelos intermedios
- 🎯 **10 Categorías** - Personaliza según tus intereses
- 📋 **8 Plantillas** - Estilos de viaje predefinidos
- 🗺️ **50+ Actividades** - Base de datos de lugares en Japón
- 🔍 **Búsqueda Inteligente** - Encuentra actividades por ciudad/categoría
- ✏️ **Actividades Personalizadas** - Crea tus propias actividades
- 🌐 **4 APIs Integradas** - Vuelos, hoteles, mapas y lugares reales
- 🔄 **Sincronización RT** - Firebase Realtime Database
- 🤝 **Modo Colaborativo** - Edita con amigos/familia en tiempo real
- 🌙 **Dark Mode** - Soporte completo
- 📱 **Responsive** - Funciona en móvil, tablet y desktop

---

## 📚 DOCUMENTACIÓN

### 🚨 EMPEZAR AQUÍ
**Si no ves las conexiones de vuelos o las nuevas features**, lee esto primero:

1. **[DONDE_ESTA_TODO.md](DONDE_ESTA_TODO.md)** ⭐⭐⭐
   - Explica dónde está cada feature
   - Soluciona el problema de "no veo las conexiones"
   - Flujo completo paso a paso

2. **[SOLUCION_RAPIDA.md](SOLUCION_RAPIDA.md)** ⭐⭐
   - Cómo usar el sistema AHORA
   - Troubleshooting y debugging
   - Comandos útiles

3. **[README_DOCUMENTACION.md](README_DOCUMENTACION.md)** 📚
   - Índice completo de toda la documentación
   - Lee en orden según tu necesidad

### 📖 Documentación Completa

- **[SISTEMA_ITINERARIOS_README.md](SISTEMA_ITINERARIOS_README.md)** - Documentación técnica completa
- **[GUIA_RAPIDA_USO.md](GUIA_RAPIDA_USO.md)** - Guía para usuarios finales
- **[GUIA_APIS.md](GUIA_APIS.md)** - Cómo usar las APIs integradas
- **[VISUALIZACION_SISTEMA.md](VISUALIZACION_SISTEMA.md)** - Diagramas y casos de uso
- **[RESUMEN_FINAL.md](RESUMEN_FINAL.md)** - Checklist y estadísticas

---

## 🎯 Quick Start

### 1. Instalación
```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/viaje-japon.git

# Abre index.html en tu navegador
# O usa un servidor local:
python -m http.server 8000
# O con Node:
npx serve
```

### 2. Configuración de Firebase
```javascript
// js/firebase-config.js
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  // ...
};
```

### 3. Uso Básico
```
1. Abre la app → Inicia sesión
2. Crea un viaje básico (nombre + fechas)
3. Ve al tab "📅 Itinerario"
4. Click en "✨ Crear Itinerario"
5. Sigue el wizard de 4 pasos
6. ¡Listo! Empieza a agregar actividades
```

---

## 🏗️ Estructura del Proyecto

```
viaje-japon/
├── data/
│   ├── airlines-data.js          # 25+ aerolíneas
│   ├── activities-database.js    # 50+ actividades
│   ├── categories-data.js        # 10 categorías + 8 plantillas
│   ├── attractions-data.js       # Atracciones adicionales
│   └── restaurants.json          # Restaurantes
│
├── js/
│   ├── app.js                    # Aplicación principal
│   ├── auth.js                   # Autenticación
│   ├── firebase-config.js        # Configuración Firebase
│   ├── trips-manager.js          # Gestión de viajes
│   ├── itinerary.js              # Vista de itinerario
│   ├── itinerary-builder.js      # Wizard de creación
│   ├── itinerary-builder-part2.js # Agregar/Editar actividades
│   ├── apis-integration.js       # Integración de APIs
│   ├── budget-tracker.js         # Control de gastos
│   ├── preparation.js            # Checklist de preparación
│   ├── map.js                    # Mapa interactivo
│   ├── attractions.js            # Atracciones
│   ├── transport.js              # Transporte
│   ├── notifications.js          # Sistema de notificaciones
│   ├── tabs.js                   # Navegación de tabs
│   └── utils.js                  # Utilidades
│
├── css/
│   ├── main.css                  # Estilos personalizados
│   └── tailwind.min.css          # Tailwind CSS
│
├── images/
│   └── icons/                    # Iconos PWA
│
├── index.html                    # Página principal
├── manifest.json                 # PWA manifest
├── service-worker.js             # Service worker
│
└── docs/                         # Documentación completa
    ├── DONDE_ESTA_TODO.md
    ├── SOLUCION_RAPIDA.md
    ├── GUIA_APIS.md
    └── ...
```

---

## 🔌 APIs Integradas

### 1. Aviation Stack
```javascript
// Búsqueda de vuelos reales
await APIsIntegration.searchFlights('AM58');
```

### 2. Lite API
```javascript
// Búsqueda de hoteles
await APIsIntegration.searchHotels('TYO', '2026-02-16', '2026-02-20', 2);
```

### 3. Geoapify
```javascript
// Búsqueda de lugares y rutas
await APIsIntegration.searchPlaces('temple', { lat: 35.6762, lng: 139.6503 });
```

### 4. Foursquare
```javascript
// Búsqueda de restaurantes
await APIsIntegration.findNearbyRestaurants({ lat: 35.6762, lng: 139.6503 });
```

Ver [GUIA_APIS.md](GUIA_APIS.md) para más detalles.

---

## 📊 Estadísticas

```
📝 Líneas de código:        ~3,000
📁 Archivos JavaScript:     15
🗃️ Archivos de datos:       4
✈️ Aerolíneas:              25+
🌍 Aeropuertos:             40+
🏙️ Ciudades:                8
🎯 Actividades:             50+
🎨 Categorías:              10
📋 Plantillas:              8
🔌 APIs integradas:         4
📚 Documentos:              8
```

---

## ✅ Features Implementados

### Sistema de Viajes
- ✅ Crear viajes colaborativos
- ✅ Compartir con código de 6 dígitos
- ✅ Múltiples viajes por usuario
- ✅ Cambiar entre viajes
- ✅ Sincronización en tiempo real

### Sistema de Itinerarios
- ✅ Wizard guiado de 4 pasos
- ✅ Selección de aerolíneas
- ✅ Vuelos con conexiones ilimitadas
- ✅ Categorías de intereses
- ✅ Plantillas predefinidas
- ✅ Generación automática de días
- ✅ Agregar actividades (búsqueda o personalizada)
- ✅ Editar actividades
- ✅ Checklist por actividad

### Integraciones
- ✅ Firebase Authentication
- ✅ Firebase Firestore
- ✅ Aviation Stack API
- ✅ Lite API (Hoteles)
- ✅ Geoapify (Mapas)
- ✅ Foursquare (Lugares)

### Otros
- ✅ Budget tracker compartido
- ✅ Mapa interactivo
- ✅ Checklist de preparación
- ✅ Información de transporte
- ✅ Dark mode
- ✅ PWA (Progressive Web App)
- ✅ Modo offline

---

## 🔄 Pendiente (Opcional)

- 🔲 Drag & Drop visual (requiere SortableJS)
- 🔲 Optimización de rutas con Google Maps API
- 🔲 Exportar a PDF
- 🔲 Compartir en redes sociales
- 🔲 Notificaciones push
- 🔲 Integración con calendarios

---

## 🤝 Modo Colaborativo

1. Crea un viaje
2. Obtén el código de 6 dígitos
3. Comparte con amigos/familia
4. Todos pueden editar en tiempo real
5. Cambios se sincronizan automáticamente

---

## 🐛 Debugging

### Verificar que todo está cargado
```javascript
// Abre consola (F12)
console.log('Trips:', TripsManager);
console.log('Builder:', ItineraryBuilder);
console.log('APIs:', APIsIntegration);
```

### Forzar abrir wizard
```javascript
ItineraryBuilder.showCreateItineraryWizard();
```

### Ver viaje actual
```javascript
console.log(TripsManager.currentTrip);
```

Ver [SOLUCION_RAPIDA.md](SOLUCION_RAPIDA.md) para más comandos.

---

## 📱 Soporte

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablet (iPad, Android)
- ✅ Móvil (iOS, Android)

---

## 📄 Licencia

MIT License - Puedes usar, modificar y distribuir libremente.

---

## 👥 Contribuir

¿Quieres contribuir? ¡Genial!

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 🙏 Agradecimientos

- **Firebase** - Backend y sincronización
- **Tailwind CSS** - Framework CSS
- **Aviation Stack** - API de vuelos
- **Lite API** - API de hoteles
- **Geoapify** - API de mapas
- **Foursquare** - API de lugares

---

## 📞 Contacto

¿Preguntas? ¿Problemas? ¿Sugerencias?

1. Lee la [documentación](README_DOCUMENTACION.md)
2. Revisa [DONDE_ESTA_TODO.md](DONDE_ESTA_TODO.md)
3. Consulta [SOLUCION_RAPIDA.md](SOLUCION_RAPIDA.md)

---

## 🎉 ¡A Viajar!

```
 ██╗ █████╗ ██████╗  █████╗ ███╗   ██╗    ████████╗██████╗ ██╗██████╗ 
 ██║██╔══██╗██╔══██╗██╔══██╗████╗  ██║    ╚══██╔══╝██╔══██╗██║██╔══██╗
 ██║███████║██████╔╝███████║██╔██╗ ██║       ██║   ██████╔╝██║██████╔╝
██╔╝██╔══██║██╔═══╝ ██╔══██║██║╚██╗██║       ██║   ██╔══██╗██║██╔═══╝ 
███████║  ██║██║     ██║  ██║██║ ╚████║       ██║   ██║  ██║██║██║     
╚══════╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝       ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝     
```

**¡Planifica tu viaje perfecto a Japón! 🇯🇵✨**

---

**Made with ❤️ for travelers**
