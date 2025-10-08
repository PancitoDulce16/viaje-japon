# viaje-japon
Itinerario interactivo para nuestro viaje a Japón 🇯🇵


# 📘 Documentación Técnica: App "Viaje a Japón"

Este archivo describe todas las funcionalidades implementadas en el proyecto web "Viaje a Japón", una aplicación interactiva y profesional para planificar y disfrutar un viaje a Japón. El proyecto está diseñado para ser 100% gratuito, sin necesidad de backend, y compatible con GitHub Pages y modo offline.

---

## 🗺️ Mapa Interactivo

- **Tecnología:** Leaflet.js
- **Función:** Visualiza ciudades del itinerario (Tokyo, Kyoto, Osaka, Nara, Kamakura) con marcadores geolocalizados.
- **Interacción:** Zoom, clic en marcadores, popups con información y enlaces a Google Maps.
- **Extensible:** Se pueden agregar rutas, capas y filtros por tipo de lugar.

---

## 🧭 Sistema de Navegación por Pestañas

- **Estructura modular:** Cada sección está contenida en un `<div>` con clase `tab-content`.
- **Control dinámico:** JavaScript gestiona la visibilidad de cada pestaña.
- **Escalabilidad:** Se pueden agregar nuevas pestañas fácilmente.

---

## 📅 Calendario Interactivo

- **Tecnología:** FullCalendar.js
- **Función:** Muestra actividades por día y permite agregar eventos personalizados.
- **Uso:** Ideal para itinerarios diarios y planificación.

---

## 🧳 Checklist de Equipaje

- **Tecnología:** HTML + JavaScript + localStorage
- **Función:** Agregar, marcar y eliminar ítems de equipaje.
- **Persistencia:** Los datos se guardan localmente en el navegador.

---

## 📸 Galería Offline

- **Tecnología:** Swiper.js + HTML5 File API
- **Función:** Subir imágenes locales y visualizarlas en carrusel.
- **Privacidad:** Las imágenes no se suben a servidores, se mantienen en el dispositivo.

---

## 🧠 Traductor Básico

- **API:** LibreTranslate (gratuita y open source)
- **Función:** Traducción entre español, inglés y japonés.
- **Interacción:** Selección de idioma origen/destino, resultado en tiempo real.

---

## 💰 Formulario de Gastos + Gráfico de Presupuesto

- **Tecnología:** Chart.js + JavaScript + localStorage
- **Función:** Agregar gastos, visualizar presupuesto restante.
- **Visualización:** Gráfico tipo doughnut actualizado dinámicamente.

---

## 📶 Conectividad: Pocket WiFi

- **Contenido:** Opciones de alquiler con enlaces de reserva.
- **Proveedores:** Japan Wireless, Ninja WiFi, JRailPass, Japan Experience.
- **Detalles:** Cobertura, batería, número de dispositivos, precios.

---

## 🎒 Takkyubin (Envío de Maletas)

- **Contenido:** Explicación del servicio, tarifas promedio por ruta, recomendaciones.
- **Rutas cubiertas:** Narita ↔ Tokyo, Tokyo → Kyoto, Kyoto → Osaka, Osaka → Tokyo, Tokyo → Narita.
- **Consejos:** Tiempo de envío, cómo solicitarlo, qué evitar.

---

## 🩺 Medicamentos sin Receta

- **Categorías:** Dolor de cabeza, fiebre, alergia, diarrea, estreñimiento.
- **Productos:** Eve, Pabron, Allegra FX, Seirogan, Colac, etc.
- **Dónde comprarlos:** Farmacias (Matsumoto Kiyoshi, Welcia, Sundrug) y konbinis (7-Eleven, Lawson, FamilyMart).

---

## 🥤 Bebidas para Jetlag y Cansancio

- **Jetlag:** Yakult 1000, Nerunoda, Night Recover, Amazake.
- **Cansancio:** Lipovitan D, Yunker, Tiovita, Chocola BB Plus.
- **Disponibilidad:** Farmacias y konbinis.

---

## 🍱 Comida Japonesa por Región

- **Regiones:** Tokyo, Kyoto, Osaka, Hokkaido, Okinawa, Hiroshima, Fukuoka.
- **Platos típicos:** Sushi, Kaiseki, Takoyaki, Ramen, Okonomiyaki, etc.
- **Rango de precios por persona:** Económico (¥400–¥1,000), Medio (¥1,000–¥3,000), Alto (¥5,000+).
- **Lugares recomendados:** Restaurantes específicos por ciudad.

---

## 🎁 Souvenirs Japoneses

- **Categorías:** Tradicionales, kawaii, anime/manga, snacks.
- **Lugares de compra:** Don Quijote, Daiso, Pokémon Center, Animate, Book-Off, konbinis, aeropuertos.

---

## 🌐 Multilenguaje

- **Función:** Cambio dinámico entre español e inglés.
- **Persistencia:** Preferencia guardada en localStorage.
- **Interfaz:** Botón flotante para cambiar idioma en cualquier momento.

---

## 🌓 Modo Claro/Oscuro

- **Tecnología:** Tailwind CSS + JavaScript
- **Función:** Cambio de tema visual con botón.
- **Persistencia:** Preferencia guardada en localStorage.

---

## 📦 Modo Offline

- **Tecnología:** Service Worker API (opcional)
- **Función:** Permite que la app funcione sin conexión a internet.
- **Uso:** Ideal para viajeros sin roaming en Japón.

---

## 📁 Estructura del Proyecto

- `index.html` o `updated_travel_app.txt`: Archivo principal con todo el contenido.
- Recursos externos: Leaflet.js, Chart.js, Swiper.js, FullCalendar.js, LibreTranslate API.
- Sin backend: Todo funciona en el navegador del usuario.
- Compatible con GitHub Pages.

---

## 📌 Recomendaciones para Desarrollo

- Usar Live Server (VS Code) para pruebas locales.
- Organizar el proyecto en carpetas: `/assets`, `/css`, `/js`, `/images`.
- Documentar cada sección en el código con comentarios.
- Crear un `manifest.json` para convertir en PWA.
- Agregar `README.md` para GitHub con esta documentación.

---

## 🧪 Pruebas y Validación

- Compatible con dispositivos móviles y escritorio.
- Probado en navegadores modernos (Chrome, Firefox, Safari).
- Funciones clave probadas con datos reales y simulados.

---

## 📣 Créditos y Licencias

- APIs y librerías utilizadas son gratuitas y de código abierto.
- Este proyecto es personal y no comercial.
- Diseñado por Noelia para viajeros latinoamericanos que visitan Japón.

---

¿Listo para el siguiente paso? ¡Tu app está casi lista para el mundo! 🌏
