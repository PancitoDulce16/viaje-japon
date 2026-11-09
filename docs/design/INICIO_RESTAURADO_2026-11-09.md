# Restauración del inicio

La portada personalizada ocultaba el Hero Moment original mediante
`.has-journey-home > .hero-moment` y lo sustituía por otra tarjeta del viaje.
Ahora la portada reutiliza `renderHeroMoment` con las fechas y el destino del
viaje actual: conserva los panoramas originales de día y noche, la cuenta
regresiva, los pétalos y las luciérnagas. La instancia anterior sigue oculta
para evitar duplicar la bienvenida.

La información secundaria se presenta con separadores y superficies abiertas.
Se redujo la escala de la próxima parada y se eliminó el fondo ilustrado
duplicado dentro del contenido. Se conservaron los accesos existentes.

Validación: capturas en claro y Noche en Japón a 1440, 1024, 768 y 390 px;
comprobación de la imagen visible y decodificada, animación de luciérnagas,
ausencia de desbordamiento horizontal, pruebas funcionales y compilación.
Las capturas de implementación están en `artifacts/dashboard-home/` (locales).
La captura del problema enviada por la usuaria se consultó en la conversación.
Los originales canónicos siguen sin estar disponibles como binarios locales,
según `references/README.md`; no se generaron reemplazos.
