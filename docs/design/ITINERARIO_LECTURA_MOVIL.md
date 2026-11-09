# Itinerario · lectura y acciones en móvil

Se conserva la estructura compartida y el sistema de tokens de Japitin.
En móvil, las actividades usan el ancho disponible para texto y controles;
la miniatura acompaña al título sin comprimir toda la descripción en una
tercera columna. Los botones de acciones quedan en una fila. La edición
rápida reserva una fila completa para la hora, evitando cortar el control
nativo, y los campos tienen un mínimo de 44 px de alto.

El control de actividad completada tiene una etiqueta clicable de 44 px.
Subir y bajar actividad están disponibles en el menú de acciones, también
con teclado; los controles pequeños del lateral no aparecen en móvil.

Ruta detallada y recuerdos/ajustes usan `details` nativos: abiertos inicialmente
en escritorio y cerrados en móvil. Su contenido y controles siguen presentes
y se pueden desplegar. No se modifican actividades, rutas ni datos guardados.
Se retiró el espaciado heredado de secciones generales en los capítulos.

Precios desconocidos, nulos o marcados `unpriced` indican «Precio por confirmar»;
solo un cero conocido se etiqueta Gratis. La sección de recuerdos reconoce
las comidas existentes en el día aunque no exista `mealAudit`, y escapa sus
títulos antes de insertarlos en HTML.

Verificación: pruebas visuales en 1440, 1024, 768 y 390 px, ambos temas; edición
y menú móvil, apertura de ruta y recuerdos, texto amplio, ausencia de overflow,
precios conocidos/desconocidos y avisos de conflictos. Capturas de implementación
en `artifacts/itinerary-page/`. La captura móvil de cinco actividades pasa de
unos 6972 a 4533 px al cerrar inicialmente la información secundaria.

Se consultaron las capturas actuales y los bocetos de la conversación; los
originales canónicos siguen sin binarios locales según `references/README.md`.
Las capturas de esta revisión no sustituyen esas referencias.
