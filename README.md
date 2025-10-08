# 🇯🇵 Viaje a Japón - Itinerario Interactivo

Planificador web interactivo para un viaje de 15 días a Japón (Feb 16 - Mar 2, 2025).

## ✨ Características

- 📅 **Itinerario detallado** día por día con actividades, horarios y costos
- 💰 **Budget tracker** para control de gastos en tiempo real
- 🗺️ **Mapa interactivo** con enlaces a Google Maps
- 📸 **Galería de fotos** para guardar recuerdos del viaje
- 🌓 **Modo oscuro** para ahorrar batería
- 📱 **PWA** - Funciona como app en el celular
- 🔌 **Modo offline** completo
- 🎨 **Diseño moderno** y responsivo

## 🚀 Instalación en GitHub Pages

### Paso 1: Crear Repositorio

1. Ve a [github.com](https://github.com) e inicia sesión
2. Click en "New repository"
3. Nombre: `viaje-japon`
4. Marcar como "Public"
5. Click "Create repository"

### Paso 2: Subir Archivos

**Opción A: Desde la web (más fácil)**
```
1. En tu repo, click "uploading an existing file"
2. Arrastra TODA la carpeta viaje-japon
3. Escribe "Initial commit" en la caja de texto
4. Click "Commit changes"
```

**Opción B: Con Git (recomendado)**
```bash
cd viaje-japon
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/viaje-japon.git
git push -u origin main
```


### Paso 3: Habilitar GitHub Pages

1. En tu repositorio, ve a **Settings**
2. Scroll hasta **Pages** (menú lateral izquierdo)
3. En **Source**, selecciona **main** branch
4. Click **Save**
5. ¡Listo! Tu sitio estará en: `https://TU-USUARIO.github.io/viaje-japon/`

⏱️ Espera 1-2 minutos para que se compile.

## 📁 Estructura del Proyecto

```
viaje-japon/
├── index.html              # Página principal
├── manifest.json           # Config PWA
├── service-worker.js       # Soporte offline
├── README.md               # Este archivo
│
├── css/
│   └── main.css            # Estilos personalizados
│
├── js/
│   ├── app.js              # App principal
│   ├── itinerary-data.js   # Datos del itinerario
│   ├── budget-tracker.js   # Gestor de presupuesto
│   ├── map.js              # Mapa interactivo
│   └── gallery.js          # Galería de fotos
│
├── images/
│   ├── tokyo/              # Fotos de Tokyo
│   ├── kyoto/              # Fotos de Kyoto
│   ├── osaka/              # Fotos de Osaka
│   └── icons/              # Iconos PWA
│       ├── icon-192.png
│       └── icon-512.png
│
└── data/                   # Datos JSON (futuro)
    ├── restaurants.json
    └── attractions.json
```

## 🎯 Cómo Usar

### En tu computadora
1. Abre `index.html` en tu navegador
2. ¡Listo! Funciona sin internet

### En tu celular (durante el viaje)
1. Abre `https://TU-USUARIO.github.io/viaje-japon/`
2. En el navegador, click en **"Agregar a pantalla de inicio"**
3. Ahora tienes una app que funciona **sin internet** ✈️

## 📱 Funcionalidades

### Itinerario
- ✅ Marcar actividades como completadas
- 🕐 Ver horarios y costos de cada actividad
- 🚆 Información detallada de trenes
- 📍 Ubicaciones de cada lugar

### Budget Tracker
- ➕ Agregar gastos en tiempo real
- 📊 Ver cuánto llevas gastado
- 💵 Calcular presupuesto restante
- 🗑️ Eliminar gastos

### Mapa
- 🗺️ Ver todos los lugares del viaje
- 🏨 Hoteles con direcciones
- 🎯 Atracciones principales
- 🔗 Links directos a Google Maps

### Galería
- 📸 Subir fotos del viaje
- 👀 Ver en pantalla completa
- 🗑️ Eliminar fotos
- 💾 Todo guardado localmente

## 🛠️ Personalización

### Cambiar datos del itinerario
Edita `js/itinerary-data.js` y modifica el array `ITINERARY_DATA`.

### Cambiar colores
Edita `css/main.css` y modifica las variables de color.

### Agregar más ciudades
1. Edita `js/itinerary-data.js`
2. Agrega un nuevo objeto con la estructura existente
3. Crea una carpeta en `images/` para esa ciudad

## 🌐 Tecnologías Usadas

- **HTML5** - Estructura
- **Tailwind CSS** - Estilos
- **JavaScript (Vanilla)** - Funcionalidad
- **LocalStorage** - Persistencia de datos
- **Service Worker** - Funcionalidad offline
- **PWA** - App instalable

## 📝 Notas Importantes

- ✅ **100% Gratis** - Sin costos de hosting
- ✅ **Sin Backend** - Todo funciona en el navegador
- ✅ **Privado** - Tus fotos y gastos solo se guardan en tu dispositivo
- ✅ **Offline** - Funciona sin internet después de la primera carga

## 🐛 ¿Problemas?

**La página no carga:**
- Espera 2-3 minutos después de hacer push
- Verifica que GitHub Pages esté habilitado en Settings

**Las fotos no se guardan:**
- Las fotos se guardan en localStorage (límite ~10MB)
- Para más fotos, usa la carpeta `images/` y súbelas a GitHub

**El modo offline no funciona:**
- Visita la página al menos una vez con internet
- El Service Worker se registrará automáticamente

## 🚀 Próximas Mejoras

- [ ] Agregar más frases en japonés
- [ ] Incluir información de medicamentos
- [ ] Tips de bebidas para jetlag
- [ ] Más restaurantes recomendados
- [ ] Sistema de checklist de equipaje

## 👥 Créditos

Creado con ❤️ para dos hermanos aventureros viajando a Japón.

**いってらっしゃい！** (¡Buen viaje!)

---

## 📞 Contacto de Emergencia

- 🚓 Policía Japón: **110**
- 🚑 Ambulancia: **119**
- 🇨🇷 Embajada Costa Rica: **+81-3-3486-1812**

---

**Última actualización:** Enero 2025