# Respaldo y restauración: reparación de noviembre de 2026

## Comportamiento

- Exporta por pertenencia al viaje con lecturas del servidor. Un error de lectura cancela el respaldo; no sustituye datos faltantes por listas vacías.
- Incluye datos de las colecciones de cada viaje y los bytes de los archivos accesibles de `documents` e `images`. Los documentos privados de otras personas y la auditoría restringida al propietario quedan fuera de un respaldo hecho por un integrante.
- Conserva marcas temporales, coordenadas y bytes. No exporta sesiones Firebase, credenciales, borradores de chat, indicadores de autenticación ni respaldos anidados. Las preferencias usan una lista explícita de claves.
- Límite: 50 MiB, 100 viajes y 10.000 registros por archivo. El tamaño se comprueba también en Storage y en el servidor.
- La copia en nube usa `backups/{uid}/latest.json`. La copia de seguridad previa a importar usa `backups/{uid}/before-import.json`, disponible mediante **Restaurar copia previa**.
- Restaurar crea viajes nuevos con pertenencia exclusiva de quien restaura y códigos de invitación nuevos. No modifica documentos de los viajes originales. Las copias solo aparecen al terminar la operación.
- Los recordatorios se importan desactivados. Las divisiones de gastos y los pagos compartidos se conservan como historial; no se reactivan cobros, avisos ni invitaciones de otras personas.
- Ante error se eliminan únicamente las copias y archivos creados por esa operación. La misma copia es idempotente para evitar duplicados tras perder la respuesta. El seguimiento está en `users/{uid}/backupImports/{hash}`, sin escrituras permitidas a clientes.
- Las versiones 1.0.0 se admiten como copias antiguas; se avisa que pueden carecer de itinerarios y adjuntos. No se inventan los datos que faltaban en esos archivos.

## Servidor y publicación

El servidor migró a Node 22, Firebase Admin 14.5.1 y Firebase Functions 7.4.0. El paquete `functions` tiene cero avisos conocidos en `npm audit --omit=dev` al ejecutar la revisión. Se eliminaron las APIs antiguas de Admin, incluida `sendToDevice`.

Se recuperó la implementación desplegada de `onNewExpenseAdded` desde su archivo fuente de Cloud Functions para conservar la función que faltaba en el repositorio. Ahora admite tokens antiguos y dispositivos actuales, excluye al autor y a quienes desactivaron push y no envía avisos al restaurar.

Funciones publicadas explícitamente: `restoreUserBackup`, `onNewExpenseAdded` y `onTripDeleted`. Las funciones de recordatorios que solo estaban en el código local no se activaron. La función de restauración usa el bucket `japan-itin-dev.firebasestorage.app`, una instancia de ejecución por contenedor y un máximo de dos contenedores.

La cuenta `github-action-1071850135@japan-itin-dev.iam.gserviceaccount.com` se identificó por el ID y la descripción del repositorio y recibió únicamente el rol adicional `roles/firebaserules.admin`. No se añadieron roles generales de administración. CI ejecuta pruebas y reglas en emuladores antes de publicar Hosting y publica reglas de Firestore/Storage cuando cambian.

El bucket carecía de CORS. Se aplicó `storage-cors.json` para las descargas autenticadas del navegador. Esto no cambia los permisos de lectura de objetos. Para reproducir la configuración con una sesión administradora: `gsutil cors set docs/ops/storage-cors.json gs://japan-itin-dev.firebasestorage.app`.

## Validación

- Pruebas de formato: sesiones excluidas, entradas malformadas, versiones incompatibles, claves de prototipo rechazadas, cancelación, fallo de copia previa y cambios de cuenta.
- Emuladores de Firestore y Storage: pertenencia, aislamiento de copias, adjuntos, marcas temporales, idempotencia, rollback, reintentos y denegación de acceso ajeno. Se comprueba que el cliente no pueda falsificar trabajos de importación.
- Navegador: descarga de JSON real con itinerario y PDF; restauración y errores de copia previa, en claro/oscuro a 390 y 1440 px. Suite completa de 140 casos aprobada antes del ajuste final de recuperación de la copia previa; sus cuatro casos específicos se repiten tras ese ajuste.
- Funciones activas verificadas en Node 22 y endpoint público de restauración rechazando peticiones sin autenticación con HTTP 401. No se restauraron ni duplicaron viajes reales de la usuaria durante las pruebas.

Las capturas originales siguen ausentes localmente. Se inspeccionaron las nuevas capturas en ambos temas, conservando los componentes existentes.

## Referencias

- [Notas del Admin SDK](https://firebase.google.com/support/release-notes/admin/node)
- [Cambio de runtime de funciones](https://firebase.google.com/docs/functions/manage-functions#update-nodejs-runtime)
- [Descarga de archivos y CORS](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [Rol de Firebase Security Rules](https://cloud.google.com/iam/docs/roles-permissions/firebaserules)
