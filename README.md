# 🇯🇵 Planificador de Viaje a Japón - Modo Colaborativo

Una aplicación web progresiva (PWA) para planificar tu viaje a Japón con **modo colaborativo en tiempo real** para compartir con familiares o amigos.

![Status](https://img.shields.io/badge/Status-Producción-brightgreen)
![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange)
![Colaborativo](https://img.shields.io/badge/Modo-Colaborativo-blue)

---

## ✨ Características Principales

### 🤝 Modo Colaborativo (NUEVO)
- **Tiempo Real:** Todos los cambios se sincronizan instantáneamente
- **Multi-usuario:** Comparte tu viaje con familiares o amigos
- **Sincronización completa:** Budget, checklist, packing list, notas
- **Indicadores visuales:** Sabe quién hizo cada cambio

### 📅 Planificación Completa
- **Itinerario detallado:** 15 días pre-planeados en Japón
- **Actividades por día:** Templos, museos, restaurantes, transporte
- **Checklist interactivo:** Marca actividades completadas
- **Progreso visual:** Ve tu avance día a día

### 💰 Control de Presupuesto
- **Tracker de gastos:** Registra todos tus gastos en ¥ JPY
- **Conversión automática:** Ver equivalente en USD
- **Colaborativo:** Ambos pueden agregar gastos
- **Total en tiempo real:** Suma automática compartida

### 📦 Packing List Inteligente
- **6 categorías:** Documentos, Ropa, Electrónica, Salud, Dinero, Otros
- **Items pre-cargados:** Basados en experiencias reales
- **Progreso por categoría:** Sabe exactamente qué falta
- **Sincronizado:** Ambos ven la misma lista

### 📝 Notas Compartidas
- **Editor colaborativo:** Ambos pueden editar notas
- **Sync en tiempo real:** Los cambios aparecen instantáneamente
- **Historial:** Sabe quién editó por última vez

### 🗺️ Recursos Adicionales
- **Mapa interactivo:** Ubicaciones de todas las actividades
- **Guía de frases:** Japonés básico con romanización
- **Info de emergencia:** Números importantes y embajadas
- **Guía del JR Pass:** Todo lo que necesitas saber

---

## 🚀 Demo Rápida

### Para un solo usuario:
1. Abre la app
2. (Opcional) Inicia sesión para sincronizar
3. Crea tu viaje
4. Empieza a planificar

### Para modo colaborativo:
1. **Usuario A:** Crea el viaje
2. **Usuario A:** Click en "+ Invitar" y comparte el User ID o Trip ID
3. **Usuario B:** Acepta la invitación
4. **Ambos:** ¡Planifiquen juntos en tiempo real! 🎉

---

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Estilos:** Tailwind CSS
- **Base de datos:** Firebase Firestore
- **Autenticación:** Firebase Auth (Email + Google)
- **Hosting:** Compatible con cualquier hosting estático
- **PWA:** Funciona offline, instalable en móvil

---

## 📂 Estructura del Proyecto

```
viaje-japon/
├── css/
│   ├── main.css              # Estilos principales
│   └── tailwind.min.css      # Tailwind CSS
├── js/
│   ├── app.js                # Punto de entrada
│   ├── auth.js               # Sistema de autenticación
│   ├── trips-manager.js      # Gestión de viajes
│   ├── budget-tracker.js     # Control de presupuesto
│   ├── itinerary.js          # Checklist de itinerario
│   ├── preparation.js        # Packing list
│   ├── core.js               # Notas y funcionalidad core
│   ├── firebase-config.js    # Configuración de Firebase
│   └── ...
├── data/
│   ├── attractions.json      # Base de datos de atracciones
│   ├── restaurants.json      # Restaurantes recomendados
│   └── phrases.json          # Frases en japonés
├── index.html                # Página principal
├── manifest.json             # PWA manifest
├── service-worker.js         # Service worker para offline
├── IMPLEMENTATION_STATUS.md  # Estado de implementación
├── GUIA_RAPIDA.md           # Guía de uso rápido
└── README.md                # Este archivo
```

---

## 🔧 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/viaje-japon.git
cd viaje-japon
```

### 2. Configurar Firebase

#### a) Crear proyecto en Firebase:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click "Agregar proyecto"
3. Nombra tu proyecto: "Viaje Japón"
4. Habilita Google Analytics (opcional)

#### b) Habilitar servicios:
1. **Authentication:**
   - Ve a Authentication > Sign-in method
   - Habilita "Email/Password"
   - Habilita "Google" (opcional)

2. **Firestore Database:**
   - Ve a Firestore Database
   - Click "Crear base de datos"
   - Empieza en modo de prueba
   - Ubicación: us-central1 (o la más cercana)

#### c) Configurar en el código:
1. Abre `js/firebase-config.js`
2. Reemplaza las credenciales con las de tu proyecto:

```javascript
const firebaseConfig = {
  apiKey: "<YOUR_API_KEY>",
  authDomain: "TU-PROJECT.firebaseapp.com",
  projectId: "TU-PROJECT-ID",
  storageBucket: "TU-PROJECT.appspot.com",
  messagingSenderId: "TU-MESSAGING-ID",
  appId: "TU-APP-ID"
};
```

### 3. Configurar Reglas de Seguridad

En Firestore Database > Reglas, pega esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Trips: Solo miembros pueden leer/escribir
    match /trips/{tripId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.members;
    }

    // Subcollections de trips
    match /trips/{tripId}/{document=**} {
      allow read, write: if request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/trips/$(tripId)).data.members;
    }

    // Users: Solo el usuario puede leer/escribir sus datos
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }
  }
}
```

### 4. Ejecutar Localmente

Opción A - Live Server (VS Code):
```bash
# Instala la extensión "Live Server" en VS Code
# Click derecho en index.html > "Open with Live Server"
```

Opción B - Python:
```bash
python -m http.server 8000
# Abre http://localhost:8000
```

Opción C - Node.js:
```bash
npx serve
```

---

## 🎯 Cómo Usar el Modo Colaborativo

### Método 1: Invitar con User ID

**Usuario A (Creador):**
1. Crea tu viaje
2. Click en "**+ Invitar**" en el header
3. Solicita el User ID a tu hermano/amigo

**Usuario B (Invitado):**
1. Abre la consola del navegador (F12)
2. Escribe: `auth.currentUser.uid`
3. Copia el User ID y envíalo por WhatsApp

**Usuario A:**
1. Ingresa el User ID en el prompt
2. ✅ ¡Listo! Ahora ambos ven el mismo viaje

### Método 2: Unirse con Trip ID

**Usuario A (Creador):**
1. Crea tu viaje
2. Copia el Trip ID (visible en consola)
3. Comparte el Trip ID por mensaje

**Usuario B (Invitado):**
1. Click en "**🔗 Unirse a un Viaje**"
2. Ingresa el Trip ID
3. ✅ ¡Listo! Ya eres miembro del viaje

### Sincronización en Tiempo Real
Una vez que ambos son miembros:
- ✅ Marcar actividades → Se ve instantáneamente
- 💰 Agregar gastos → Aparecen al momento
- 📦 Editar packing list → Cambios en tiempo real
- 📝 Escribir notas → Sincronización automática

---

## 📊 Arquitectura de Datos

### Firestore Database Structure:
```
trips/
  {tripId}/
    info: {name, destination, dates, ...}
    members: [userId1, userId2, ...]
    flights: {outbound, return}
    expenses/ (subcollection)
    data/ (subcollection)
      checklist: {checked: {...}, updatedBy: email}
      packing: {items: {...}, updatedBy: email}
      notes: {content: "...", updatedBy: email}
```

### Modelo Híbrido:
- **Sin login:** localStorage (solo tu dispositivo)
- **Con login sin trip:** Firestore por usuario
- **Con login + trip:** Firestore por trip (colaborativo)

---

## 🎨 Indicadores Visuales

En cada módulo verás:

- 🤝 **Modo Colaborativo** (verde) → Viaje compartido, cambios en tiempo real
- 👤 **Modo Individual** (azul) → Solo tú en el trip
- ☁️ **Sincronizado** (azul) → Guardado en tu cuenta
- 📱 **Solo Local** (amarillo) → Sin internet, solo en este dispositivo

---

## 🧪 Testing

### Test Básico (Local):
```bash
# 1. Inicia la app
# 2. Crea una cuenta y un viaje
# 3. Agrega gastos, marca actividades
# 4. Todo debe guardarse y persistir al recargar
```

### Test Colaborativo:
```bash
# 1. Abre en dos navegadores (Chrome + Firefox)
# 2. Inicia sesión con dos cuentas diferentes
# 3. Cuenta A crea viaje e invita a Cuenta B
# 4. Ambos deben ver los mismos datos en tiempo real
```

---

## 🚀 Deployment

### GitHub Pages:
```bash
# En Settings > Pages
# Source: Deploy from a branch
# Branch: main / root
# URL: https://tu-usuario.github.io/viaje-japon
```

### Netlify:
```bash
# Conecta tu repo de GitHub
# Build command: (vacío)
# Publish directory: /
# Deploy!
```

### Vercel:
```bash
# Importa proyecto desde GitHub
# Framework Preset: Other
# Deploy!
```

---

## 📱 PWA (Progressive Web App)

La app es instalable en móvil:

**iOS:**
1. Safari > Compartir > Añadir a pantalla de inicio

**Android:**
1. Chrome > Menú > Instalar app

**Características PWA:**
- ✅ Funciona offline
- ✅ Instalable como app nativa
- ✅ Notificaciones (próximamente)
- ✅ Sincronización en segundo plano

---

## 🔒 Seguridad

### Buenas Prácticas Implementadas:
- ✅ Autenticación obligatoria para colaboración
- ✅ Reglas de seguridad en Firestore
- ✅ Solo miembros pueden acceder a trips
- ✅ Validación de inputs en formularios
- ✅ Escape de HTML para prevenir XSS

### Recomendaciones:
- Usa contraseñas seguras (8+ caracteres)
- No compartas credenciales de Firebase
- Habilita 2FA en tu cuenta de Firebase
- Revisa periódicamente los miembros de tus trips

---

## 🐛 Troubleshooting

### "No veo los cambios del otro usuario"
- Verifica que ambos estén en el mismo trip
- Refresca la página (F5)
- Revisa la consola para errores

### "Error al invitar"
- Verifica que el User ID sea correcto
- Asegúrate de que ambos tengan sesión iniciada
- Verifica conexión a internet

### "Los datos no se sincronizan"
- Revisa tu conexión a internet
- Verifica la configuración de Firebase
- Los datos se guardan en localStorage como backup

---

## 📝 Roadmap

### Fase 1 - MVP ✅ (COMPLETADO)
- ✅ Sistema de autenticación
- ✅ Gestión de viajes
- ✅ Modo colaborativo
- ✅ Sync en tiempo real de todos los módulos

### Fase 2 - Mejoras de UX (En progreso)
- 🔄 Sistema de invitación por email
- 🔄 Notificaciones push
- 🔄 Sistema de permisos (admin/editor/viewer)
- 🔄 Chat integrado

### Fase 3 - Features Avanzadas
- 📋 Hospedajes y reservas
- 🗺️ Timeline visual del viaje
- 📊 Análisis de gastos por categoría
- 📸 Galería de fotos compartida
- 📱 App móvil nativa

---

## 🤝 Contribuir

¿Quieres mejorar la app? ¡Contribuciones bienvenidas!

1. Fork el proyecto
2. Crea tu rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agrega nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para más detalles.

---

## 👏 Créditos

### Datos y Referencias:
- Japan National Tourism Organization (JNTO)
- Google Maps Platform
- JR Pass Official Guide

### Tecnologías:
- Firebase (Google)
- Tailwind CSS
- Font Awesome Icons

---

## 📞 Contacto y Soporte

- 📧 Email: tu@email.com
- 💬 Issues: [GitHub Issues](https://github.com/tu-usuario/viaje-japon/issues)
- 📚 Docs: [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)
- 🚀 Guía Rápida: [GUIA_RAPIDA.md](GUIA_RAPIDA.md)

---

## ⭐ Agradecimientos

Gracias por usar este planificador. ¡Que tengas un viaje increíble a Japón! 🇯🇵✈️

**¡Buen viaje! いってらっしゃい (Itterasshai)** 🌸

---

<div align="center">
  Made with ❤️ for travelers to Japan
</div>
