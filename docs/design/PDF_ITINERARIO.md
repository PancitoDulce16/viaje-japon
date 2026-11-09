# PDF del itinerario · Japitin

Los accesos del itinerario y del menú de viajes comparten `PDFExporter`.
El diseño usa páginas A4 claras, incluso cuando la aplicación está en Noche
en Japón: agenda con horas, categorías discretas, títulos marinos, acentos
sakura, panorama y perrito explorador. Reutiliza los tokens y fuentes locales.

Cada día comienza en una página. Las actividades que caben se mantienen juntas;
las notas muy largas continúan con encabezado de día y actividad. No se recortan
a 80 caracteres. El QR es opcional, va después de la agenda y abre un lugar de
referencia identificado por nombre, no una supuesta ruta completa. Si no cabe,
se conserva el enlace y se omite el QR para evitar páginas huérfanas.

Las páginas se maquetan en un documento aislado, se miden y se capturan con
html2canvas a doble resolución. Esto conserva la representación del español
y japonés del navegador y evita las limitaciones de las fuentes estándar de
jsPDF. Los enlaces se añaden como anotaciones PDF utilizables.

Limitación: el contenido visual del PDF está rasterizado: no ofrece texto
seleccionable, búsqueda textual ni etiquetado accesible de PDF. El archivo de
20 días ronda unos pocos MB. La generación depende de la carga de jsPDF y
html2canvas; el QR utiliza el servicio existente qrserver con límite de 4 s.
Si el QR falla, sigue disponible el enlace. Las ubicaciones guardadas se
conservan: esta revisión no corrige automáticamente datos de geocodificación.

Validación ejecutable: `npx playwright test tests/visual/itinerary-pdf.spec.mjs`.
Comprueba texto japonés y notas extensas, límites de página, continuación,
igualdad del papel en ambos temas y tamaños de pantalla, y exportación real
de la plantilla personal. Genera capturas y un PDF en `artifacts/itinerary-pdf/`.
El PDF se inspecciona también renderizándolo desde el archivo, y se comprueba
la existencia de anotaciones de enlaces. No requiere sesión ni escrituras
en Firestore.

El boceto de PDF de la conversación orienta esta iteración, sin sustituir las
referencias canónicas; los binarios originales siguen ausentes localmente
según `references/README.md`.
