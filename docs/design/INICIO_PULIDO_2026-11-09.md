# Segunda revisión del inicio

Se continúa la dirección del boceto realista de la conversación, conservando
los panoramas originales, sakuras y luciérnagas. La bienvenida reutiliza el
Hero Moment con variante compacta; el resto de sus usos mantiene su composición.
Los textos de nombres y destinos se escapan antes de insertarlos como HTML.

Se retiró el padding de 64 px que una regla global de `section` aplicaba al
inicio y a su panorama. Las pestañas pasan de etiquetas inclinadas multicolor
a navegación con subrayado activo. Los controles de cabecera y pestañas tienen
un mínimo de 44 px. Se acota la antigua regla de contraste oscuro para que no
reemplace los controles del inicio y la cabecera con superficies ajenas a los
tokens compartidos.

Sin equipaje o presupuesto, se invita a crear la lista o definir un monto;
no se presenta `0/0` como progreso. Si hay tareas pendientes fuera del resumen,
la portada indica que hay que abrir la lista. Sin próxima actividad, el acceso
lleva al itinerario para empezar, en lugar de ofrecer una ruta inexistente.
El acceso lateral Reservaciones abre el panel de reservas, en vez de la pestaña
de hoteles. Se comprobó su destino con una prueba de interacción.

Validación: capturas claras y oscuras en 1440, 1024, 768 y 390 px; prueba del
estado vacío, destino del botón y escape de nombres; pruebas del shell y la
pantalla de itinerario; suite funcional, imports y compilación. Las capturas
están en `artifacts/dashboard-home/` y no son referencias canónicas. Se consultó
el boceto realista en la conversación; los originales del registro de
`references/README.md` continúan sin binarios locales.
