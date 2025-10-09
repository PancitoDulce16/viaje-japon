# 📝 Changelog

Todos los cambios notables en este proyecto serán documentados aquí.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/).

---

## [2.0.0] - 2025-10-08

### 🎉 VERSIÓN MAYOR - MODO COLABORATIVO COMPLETO

#### ✨ Agregado
- **Sistema de Viajes Compartidos:**
  - Crear múltiples viajes con información completa
  - Invitar miembros usando User ID
  - Unirse a viajes existentes con Trip ID
  - Cambiar entre diferentes viajes fácilmente
  - Header dinámico con info del viaje actual

- **Sincronización en Tiempo Real:**
  - Budget Tracker completamente sincronizado
  - Checklist de itinerario sincronizado
  - Packing List sincronizado
  - Notas del viaje sincronizadas
  - Indicador de quién hizo cada cambio

- **Indicadores Visuales:**
  - 🤝 Modo Colaborativo (verde)
  - 👤 Modo Individual (azul)
  - ☁️ Sincronizado (azul)
  - 📱 Solo Local (amarillo)

- **Re-inicialización Automática:**
  - Todos los módulos se actualizan al cambiar de trip
  - Sin necesidad de recargar la página
  - Transición suave entre viajes

- **Documentación Completa:**
  - IMPLEMENTATION_STATUS.md actualizado
  - GUIA_RAPIDA.md con instrucciones de uso
  - README.md profesional y completo
  - CHANGELOG.md con historial de versiones

#### 🔄 Cambiado
- `trips-manager.js`: Agregadas funciones de invitar, unirse, copiar ID
- `budget-tracker.js`: Ahora sincroniza con trips en lugar de usuarios
- `itinerary.js`: Ahora sincroniza con trips en lugar de usuarios
- `preparation.js`: Packing list ahora sincroniza con trips
- `core.js`: Notas ahora sincronizan con trips

#### 🐛 Corregido
- Problema de sincronización al cambiar entre trips
- Pérdida de datos al cambiar de viaje
- Indicadores de sync que no se actualizaban

#### 🔒 Seguridad
- Reglas de Firestore para proteger trips
- Solo miembros pueden acceder a datos del trip
- Validación de User IDs en invitaciones

---

## [1.2.0] - 2025-10-07

### ✨ Agregado
- Sistema de autenticación completo con Firebase
- Login con email y contraseña
- Login con Google
- Registro de nuevos usuarios
- Reset de contraseña
- Budget tracker con sincronización en la nube
- Indicadores de usuario en el header

### 🔄 Cambiado
- Budget ahora se guarda en Firestore
- Checklist se guarda en Firestore para usuarios autenticados

---

## [1.1.0] - 2025-10-06

### ✨ Agregado
- Tab de Preparación con packing list
- 6 categorías de equipaje
- Progreso por categoría
- Guía del JR Pass
- Apps esenciales para el viaje
- Info de emergencia

### 🔄 Cambiado
- Mejorado el diseño responsive
- Optimizado el rendimiento del itinerario

---

## [1.0.0] - 2025-10-05

### 🎉 LANZAMIENTO INICIAL

#### ✨ Agregado
- **Itinerario de 15 días en Japón:**
  - Día por día detallado
  - Actividades con horarios
  - Información de transporte
  - Costos estimados

- **Checklist Interactivo:**
  - Marcar actividades completadas
  - Progreso visual por día
  - Almacenamiento local

- **Budget Tracker Básico:**
  - Agregar gastos manualmente
  - Total en ¥ JPY
  - Conversión a USD

- **Mapa Interactivo:**
  - Ubicaciones de todas las actividades
  - Marcadores por ciudad

- **Atracciones:**
  - Base de datos de 50+ lugares
  - Filtros por ciudad y categoría
  - Información detallada

- **Recursos:**
  - Frases en japonés
  - Información de transporte
  - Info de emergencia

- **PWA:**
  - Instalable en móvil
  - Funciona offline
  - Service Worker configurado

- **Dark Mode:**
  - Tema oscuro/claro
  - Persistencia de preferencia

---

## [0.1.0] - 2025-10-01

### 🚀 Pre-lanzamiento

#### ✨ Agregado
- Estructura básica del proyecto
- HTML y CSS iniciales
- JavaScript modular
- Sistema de tabs
- Modal básico

---

## Tipos de Cambios

- `Agregado` → Nuevas funcionalidades
- `Cambiado` → Cambios en funcionalidades existentes
- `Deprecado` → Funcionalidades que se eliminarán pronto
- `Eliminado` → Funcionalidades eliminadas
- `Corregido` → Corrección de bugs
- `Seguridad` → Cambios de seguridad

---

## Próximas Versiones (Planeadas)

### [2.1.0] - Q4 2025
- Sistema de invitación mejorado (por email)
- Notificaciones push
- Sistema de permisos (admin/editor/viewer)

### [2.2.0] - Q1 2026
- Chat integrado entre miembros
- Hospedajes y reservas
- Timeline visual del viaje

### [3.0.0] - Q2 2026
- App móvil nativa (iOS/Android)
- Galería de fotos compartida
- Integración con Google Maps avanzada
- Análisis de gastos por categoría

---

<div align="center">

**Versión Actual:** 2.0.0  
**Última Actualización:** 8 de Octubre, 2025  
**Estado:** 🟢 Producción

</div>
