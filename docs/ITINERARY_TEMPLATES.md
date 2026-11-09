# Biblioteca de plantillas

La fuente de las plantillas es `data/itinerary-templates.js`. Tanto el formulario simple como el selector del generador consultan el mismo catálogo. Agregar una plantilla no exige crear otro selector ni otro mecanismo de guardado.

## Agregar otra plantilla

1. Crear un módulo en `data/templates/` con un ID estable y único. Usar `japan-february-2027.js` como ejemplo del esquema 2.
2. Importarlo e incorporarlo al array `ITINERARY_TEMPLATES`.
3. Incluir `name`, `description`, `duration`, `cities`, `days` y una `version`. `duration` debe coincidir con el número de días.
4. Para fechas de referencia, usar `defaultStartDate` y offsets enteros en hoteles: `checkInOffset`, `checkOutOffset`. La salida de un hotel no cuenta como otra noche. `hotelStayId` identifica cada estancia, incluso al volver a Tokyo.
5. Mantener `cost: null` y `costStatus: 'unpriced'` cuando no se conozca el importe. Ninguna reserva propuesta se considera confirmada.
6. Documentar decisiones pendientes, recomendaciones, fuentes y plazos reales en `pendingDecisions`, `planningNotes`, `sources` y `bookingChecklist`.
7. Ejecutar `npm run test:itinerary` y las pruebas de `tests/visual/template-library.spec.mjs`.

El documento del viaje se puede regenerar con `node scripts/export-template-plan.mjs`. El script también acepta otro ID del catálogo como argumento, evitando mantener una segunda copia de los días a mano.

## Aplicación y fechas

`instantiateTemplate()` crea copias independientes, asigna IDs de actividad, traslada las fechas con aritmética de calendario UTC y prepara la ruta, los hoteles y las notas. No cambia el catálogo ni un viaje existente. Detecta fechas inválidas y rechaza una duración incompatible con el rango elegido.

Las fechas límite de reservas no son offsets turísticos: un sorteo de noviembre de 2026 no se traslada a noviembre de otro año. Al cambiar el inicio, se muestra una advertencia para revisar cierres, festivos y reservas.

El mapa de hoteles conserva las claves de segmentos que espera `HotelBaseSystem` (por ejemplo, `Tokyo_1-4` y `Tokyo_14-20`). Las excursiones mantienen el hotel de su base. Los hoteles de la plantilla también se guardan como alojamientos del viaje.

## Guardado

La creación prepara y valida la plantilla antes de escribir. Guarda el viaje y el documento `trips/{tripId}/data/itinerary` usando las reglas existentes. Si falla el itinerario, intenta retirar solamente el viaje recién creado. Si esa compensación también falla, muestra el error y pide revisar Mis viajes; no anuncia una carga exitosa.

Las pruebas usan almacenes simulados y las vistas usan el mismo renderer que la app. No prueban permisos ni escritura real de una cuenta de Firebase. Eso debe verificarse en un entorno autenticado antes de publicar.

Los IDs históricos `otaku-paradise` y `japan-15-days-complete-2025` se resuelven a la plantilla clásica registrada. Los IDs desconocidos producen un error visible en vez de cargar silenciosamente otra ruta.
