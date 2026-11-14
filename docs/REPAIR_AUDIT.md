# Japitín: revisión de estabilidad

## Orden acordado

1. Reparar y comprobar el funcionamiento.
2. Mejorar los flujos existentes después de estabilizarlos.
3. Trabajar el diseño después.

Un módulo con pruebas locales aprobadas no equivale a un flujo completo comprobado con cuentas, permisos, conexión y servicios reales. No se declara la aplicación libre de todos los fallos posibles.

## Revisión general del 14 de noviembre de 2026

| Comprobación | Resultado | Alcance |
| --- | --- | --- |
| Sintaxis de JavaScript | 347 archivos aprobados | Archivos versionados de aplicación, funciones, datos y workers |
| Suite de navegador existente | 115 casos aprobados | Componentes, itinerario, plantillas, exportación PDF, presupuesto, navegación y formularios |
| Dependencias de producción | 0 vulnerabilidades reportadas por `npm audit --omit=dev` | Avisos conocidos del registro al ejecutar la consulta; no sustituye una auditoría del código |
| Artefacto compilado | Aprobado | Recursos, workers, iconos y exclusión de configuración local |
| Arranque del artefacto | Aprobado | Inicio de sesión y dashboard compilados, sin sesión real |

## Fallos reparados en esta revisión

### Incidencias móviles reportadas después del primer control

- **Causa del listado rechazado**: el emulador reprodujo `permission-denied` en `allow list` con la consulta `members array-contains uid`. Las comprobaciones separadas de existencia y tipo no podían demostrarse para la consulta. La regla de listado conserva autenticación y pertenencia; la lectura individual mantiene sus comprobaciones de tipo. La regresión ahora comprueba cinco viajes propios/compartidos, otro usuario y documentos incompletos, y rechaza consultas sin filtro o con el usuario ajeno.
- **Publicación de reglas**: el workflow anterior publicaba únicamente Hosting. Se añadió un trabajo separado para verificar las reglas en emulador y publicarlas con la identidad de servicio ya configurada. La credencial temporal se escribe fuera del árbol público. Falta confirmar el resultado remoto y que esa identidad tenga permiso de publicación de reglas.
- **Lista ya cargada**: un error posterior ya no oculta las tarjetas; distingue permisos de conexión y permite reintentar. Los cambios de usuario descartan los datos de la cuenta anterior.
- **SOS**: se retiró la cancelación global de `touchmove`, que ignoraba los cuerpos desplazables anidados, y el cierre global por deslizar hacia abajo. El cuerpo tiene scroll independiente y el cierre permanece accesible.
- **Animaciones**: se eliminó la regla universal móvil que reemplazaba duraciones decorativas por 0,2 segundos. Se mantienen las preferencias de movimiento reducido.
- **Stickers**: acceso visible junto al compositor, envío protegido contra repetición y cuentas sin correo. A 320 y 390 px, el campo de escritura dispone de su propia fila.
- **Barra inferior**: cinco columnas de igual anchura, sin solapamiento, con controles de al menos 44 px; se probó desde 320 px.
- **Barras de presupuesto**: el relleno extra provenía de una regla de transporte aplicada a cualquier degradado verde. Se limitó a transporte y se contienen los rellenos dentro de las pistas.
- **Explorar**: los filtros se desplazan horizontalmente y los selectores/contadores conservan dos columnas en móvil.
- **Accesibilidad**: panel limitado al viewport con scroll incluso a 360 px de alto, cierre con Escape, interruptores que reflejan su estado y recuperación de preferencias corruptas o almacenamiento no disponible.

Validación de esta tanda: 136 casos de navegador aprobados, incluidos los recorridos anteriores en 320, 390, 768 y 1440 px y ambos temas. SOS incluye desplazamiento táctil real mediante CDP. Suite de lógica, imports, compilación, artefacto y arranque aprobados. Reglas ejecutadas dos veces en emulador con resultados aprobados después de reproducir el fallo original. Esto no certifica aún la publicación remota ni una sesión real del dispositivo de la usuaria. Las capturas originales continúan ausentes localmente, según el registro de referencias; se inspeccionaron las capturas nuevas sin presentarlas como canónicas.

**Resultado remoto de `6fbbaa1`**: Hosting se publicó correctamente y se comprobó por HTTP que sirve `mobile-stability.css` y el gestor de viajes actualizado. La verificación de reglas en GitHub también pasó. La publicación de reglas fue rechazada por `firebaserules.googleapis.com` con HTTP 403 (`The caller does not have permission`). Por tanto, la causa de la consulta está reparada y comprobada localmente, pero su regla todavía no está publicada. Hace falta una sesión administradora autorizada o conceder a la cuenta de publicación el permiso correspondiente. Ejecución: https://github.com/PancitoDulce16/viaje-japon/actions/runs/43652988179 . No se considera cerrado el fallo de sincronización de viajes mientras falte este paso.

`test:rules` ahora termina con error si no existe un emulador disponible, evitando confundir una prueba omitida con una prueba aprobada.

Último control: `npm test`, imports, compilación, artefacto y arranque aprobados; 128 pruebas de navegador aprobadas. Después se ajustó el encuadre móvil de Mis viajes y se repitieron sus pruebas específicas. Se usan datos simulados; falta comprobar la cuenta y el dispositivo reales de la usuaria.

| Área | Fallo | Reparación y prueba |
| --- | --- | --- |
| Mis viajes | Dependencia del global TimeUtils, tarjetas incompletas que interrumpían toda la lista y errores de conexión presentados como colección vacía | Dependencia explícita, datos opcionales seguros, carga/error/reintento diferenciados y descarte de callbacks antiguos; menú real a 390 y 1440 px en ambos temas |
| Mis viajes móvil | Reglas generales recortaban el encabezado y desbordaban acciones | Panel limitado al viewport, estadísticas en tres columnas y acciones que pueden ocupar otra fila |
| Equipaje | Una acción de categoría también modificaba artículos ocultos por responsable o estado | Se aplica a la selección visible; regresión con artículos de dos personas |
| Equipaje | Envíos repetidos y errores sin gestionar al guardar, marcar o eliminar | Bloqueo durante guardado, restauración de casilla y conservación del formulario ante rechazo |
| Equipaje | Una respuesta tardía podía instalar un listener del viaje anterior | Lecturas y suscripciones vinculadas al viaje, usuario y versión de carga |
| Equipaje | Cantidades fraccionarias y lotes demasiado grandes | Validación de enteros entre 1 y 99; lotes de hasta 500 escrituras |
| Equipaje | Un formulario abierto podía utilizar el viaje cambiado después | El formulario conserva el viaje de origen; se rechazan escrituras de formularios desactualizados |
| Exportación PNG | La importación npm de html2canvas no se resolvía en publicación de código fuente | Se reutiliza el cargador de proveedor existente; prueba de módulo nativo sin transformación de Vite |
| Actualizaciones | El cambio de versión borraba localStorage y podía perder borradores o preferencias | Se conserva el almacenamiento y no se fuerza la recarga de formularios activos |
| Workers y notificaciones | La limpieza desregistraba workers activos y borraba cachés ajenas | Se elimina únicamente `/sw.js` y su caché obsoleta `japitin-v1`; se conserva el worker de Firebase Messaging |
| Chat | La confirmación tardía de un envío borraba mensajes nuevos o el borrador de otro viaje | Se conserva el contenido posterior, se vincula la limpieza al viaje y usuario originales y se bloquean envíos duplicados |

## Reparaciones previas cubiertas por regresiones

- Selección de viaje y cargas tardías del inicio.
- Guardados de tareas y reservas, reintentos, doble envío y formularios desactualizados.
- Conservación de vínculos con gastos y contadores de documentos al editar reservas.
- Cierre y cancelación de documentos, cargas tardías, limpieza de vistas previas y eliminación recuperable.
- Inicialización de fechas sin depender del orden de scripts globales.
- Enlace entre próxima actividad, día del mapa y direcciones.

## Cobertura que sigue pendiente

### Hallazgos abiertos de alta prioridad

- **Dependencias de funciones del servidor**: auditoría separada de `functions/package-lock.json` reporta 16 dependencias afectadas (1 crítica, 4 altas, 10 moderadas, 1 baja). No están incluidas en el resultado limpio del paquete raíz. Requieren actualización y pruebas del servidor; no se aplicó una migración mayor automática dentro de la reparación del menú móvil.

- **Copias de seguridad/importación (`export-import-system.js`)**: conserva referencias a `window.firebase.auth()` de la API antigua; la exportación de viajes usa una consulta y un campo de propietario que no corresponden al modelo colaborativo actual. Además, algunas rutas informan éxito aunque fallen secciones. Requiere reparar y probar exportación/restauración antes de confiar en una copia como respaldo completo.
- **Publicación real frente a compilación**: no cambiar `firebase.json` a `dist` sin comprobar configuración opcional, rutas y carga diferida. La publicación de código fuente está documentada como intencional en `js/core/config.js`. La exportación PNG incompatible ya se reparó de forma compatible con ese modo.

Estos hallazgos permanecen abiertos; las comprobaciones generales aprobadas no los convierten en reparados.

| Área | Trabajo necesario antes de declararla comprobada |
| --- | --- |
| Autenticación y permisos | Sesiones reales de propietario, integrante e invitado; caducidad y revocación de acceso |
| Firebase | Reglas de pertenencia y gastos comprobadas en emulador; pendiente publicar la regla corregida y verificar Auth, Firestore y Storage con sesiones reales |
| Datos colaborativos | Dos sesiones simultáneas, cambios de viaje, desconexión, reconexión y conflictos |
| Publicación | Firebase está configurado para servir código fuente de forma intencional; las pruebas de `dist` no cubren por sí solas esa publicación. Ampliar la comprobación del modo publicado antes de modificar esa configuración |
| Herramientas secundarias | Revisar diario, fotos, chat, compras, favoritos, emergencias, herramientas culturales y notificaciones de extremo a extremo |
| Importación y exportación | Archivos malformados, tamaños grandes, restauración y conservación de datos privados |
| Móvil y accesibilidad | Recorridos completos con teclado, lector de pantalla, zoom y dispositivo táctil; los cuatro anchos locales cubren solo parte de estas condiciones |
| Offline | Arranque sin red, cambios pendientes, reconexión y recuperación sin pérdida de datos |

Las comprobaciones locales usan datos de prueba y simulaciones cuando el flujo requiere identidad o escritura. El despliegue y los servicios reales no quedan certificados por estas pruebas.
