# Revisión de Japitin · 9 de noviembre de 2026

Se revisaron el arranque, la compilación, los imports, los controles de itinerario, la creación de viajes, las plantillas y las pantallas principales. Esta revisión corrige problemas concretos; no certifica que todos los servicios externos ni todos los recorridos de la app estén probados con una cuenta real.

## Cambios funcionales

- Reparto de días independiente por ciudad. Se conserva al volver al paso y al cambiar entre automático y manual. El total se valida sin quitar días de otras ciudades.
- Excursiones sin cambios de días implícitos. Se puede desmarcar una excursión que se haya movido al principio de la ruta. La primera parada requiere una base.
- Reordenación de segmentos usando índices de ciudades, sin contar los divisores. El arrastre atiende también cancelaciones del puntero.
- Un catálogo de plantillas compartido por el formulario simple y el generador. Se eliminó la carga de una ruta fija que ignoraba el ID elegido.
- La creación guarda las actividades, los alojamientos y las fechas correspondientes. Si falla el itinerario, compensa el viaje recién creado o muestra un error explícito si también falla esa compensación.
- Fechas de calendario válidas, soporte para viajes de un solo día y validación de la duración de las plantillas. Identificadores e invitaciones usan aleatoriedad criptográfica.
- Hoteles compatibles con estancias repetidas en una ciudad y visibles también cuando no se ha cargado el gestor de hoteles. Las propuestas se etiquetan por confirmar.
- Precios desconocidos identificados como pendientes. Una excursión de catorce horas ya no se describe como un día cómodo.
- Configuración local opcional sin bloquear un checkout limpio ni la compilación.
- Reintentos de carga de mapas, gráficos y exportaciones tras fallos de red.
- Dependencias explícitas entre los constructores del motor ML, evitando un error de inicialización que aparecía en el paquete compilado y podía afectar incluso al login.
- Service worker limitado al origen de la app y a sus propios cachés. Los proxies privados no se cachean; el respaldo sin conexión devuelve una respuesta válida.
- Registro de notificaciones separado del service worker de la app, conservado al recargar.
- Paquete de producción con imágenes, datos, manifest, iconos, CSS y workers que antes quedaban fuera del grafo de Vite. Comprobación del paquete incluida en `predeploy`.
- Actualización de dependencias dentro de las versiones compatibles y override documentado de la dependencia transitiva gRPC. `npm audit` devuelve cero vulnerabilidades conocidas.

## Cambios visuales

- Los tokens semánticos recuperan autoridad sobre los temas antiguos. Botones primarios con texto de contraste adecuado en claro y oscuro.
- Japón aparece como silueta geográfica real detrás de los puntos. Las etiquetas separadas se conectan a su posición y hay selección alternativa por nombre.
- Mapa, barra de días y controles usan la paleta compartida, con objetivos táctiles de 44 px y foco conservado después de editar.
- Navegación de días sin fondo negro y navegación global con superficies sólidas. Controles del itinerario más grandes y lectura móvil mejorada.
- Biblioteca de plantillas con vista previa, fechas, recorrido, preparativos y errores recuperables. Misma estructura para claro y Noche en Japón.
- Modales con Escape, foco inicial, Tab entre controles visibles y restitución del foco. Los controles dentro de paneles cerrados no entran en la secuencia.
- Se reutiliza el gatito guía transparente del inventario. No se crearon imágenes que sustituyan las referencias originales.

Las capturas originales y las dos biblias globales siguen sin estar disponibles localmente, tal como documenta `docs/design/references/README.md`. La tabla vintage descartada no se tomó como autoridad. Nano Banana no estuvo disponible; la comprobación visual usa Playwright, el contrato local y los assets existentes. Las capturas de implementación no son referencias canónicas nuevas.

## Tu plantilla

**Febrero en Japón · cafés y tesoros**, del 15 de febrero al 6 de marzo de 2027. Veinte días, diecinueve noches y las cuatro estancias indicadas, sin modificar reservas.

Ruta y fuentes: [JAPON_FEBRERO_2027.md](trips/JAPON_FEBRERO_2027.md).

Código fuente: `data/templates/japan-february-2027.js`. El selector permite crear un viaje nuevo editable y consultar pendientes. La estructura para agregar más plantillas está en [ITINERARY_TEMPLATES.md](ITINERARY_TEMPLATES.md).

Para regenerar el documento desde la plantilla, ejecutar `node scripts/export-template-plan.mjs`. Las fechas límite de reservas se conservan al mover la ruta y se advierte que hay que volver a comprobar cierres y festivos.

## Verificación

| Comprobación | Resultado |
| --- | --- |
| Sintaxis de 334 módulos de `js/` y `data/` | Sin errores |
| Imports | Válidos |
| Suite de lógica, seguridad, presupuesto, reservas e itinerario | Pasa |
| Predeploy: compilación, imports, pruebas y recursos del paquete | Pasa |
| Paquete compilado en navegador: login y dashboard, ocho recursos estáticos | Sin errores de inicialización |
| Playwright | 85 casos pasan |
| Tamaños de captura | 1440, 1024, 768 y 390 px, en ambos temas |
| Contraste de botones de creación de plantilla | Al menos 4,5:1 en ambos temas |
| Auditoría de dependencias | Cero vulnerabilidades conocidas |

Las pruebas visuales montan vistas con datos de ejemplo y mantienen el SDK de Firebase sin sesión. Las pruebas de guardado simulan el almacén para cubrir éxitos y fallos. No equivalen a probar autenticación, colaboración ni escritura real en Firestore; tampoco se ejecutó el emulador de reglas.

Capturas disponibles en `artifacts/template-library/`, `artifacts/wizard-fixes/`, `artifacts/itinerary-page/`, `artifacts/dashboard-home/` y `artifacts/shell-phase1/`. No se publicaron cambios ni se creó un viaje en una cuenta real.

## Lo que todavía conviene mejorar o confirmar

- Medir y reducir el peso inicial de los motores de IA y del CSS heredado. Vite todavía avisa de varios chunks grandes; la compilación funciona.
- Probar con una cuenta de desarrollo la creación, edición, recarga, colaboración y notificaciones; confirmar las claves de los servicios externos utilizados.
- Completar aeropuertos y vuelos, elegir el recinto de teamLab e identificar «Cherm Side» y «Hana». Mantener los nombres dudosos visibles hasta aclararlos.
- Solicitar el sorteo de Nintendo antes del 30 de noviembre de 2026, 23:59 de Japón, y ajustar el día al resultado. Los demás locales y atracciones también requieren comprobación antes de reservar.
- Decidir el alcance de publicación de las plantillas personales: el catálogo actual es un asset estático. Para una biblioteca privada por usuario hace falta persistencia con permisos, antes de publicar fechas y hoteles personales.
