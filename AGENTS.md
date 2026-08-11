# Repository agent instructions

## Japitin Visual Design Contract

Any agent modifying an interface must:

1. Read `docs/design/JAPITIN_DESIGN_SYSTEM.md`.
2. Consult the canonical images in `docs/design/references/`.
3. Reuse existing components and semantic tokens.
4. Design light and dark mode simultaneously with one component structure.
5. Never introduce arbitrary colors, shadows, radii, or a parallel visual style.
6. Verify desktop and mobile behavior.
7. Capture both themes and compare them with the references.
8. Correct meaningful visual differences before declaring the task complete.

If a functional requirement conflicts with the visual system, preserve accessibility and clarity first; then adapt the kawaii personality without sacrificing either.

### Jerarquía de referencias

La autoridad visual se resuelve siempre en este orden:

1. Las ocho capturas originales del producto entregadas por la usuaria: itinerario completo; selector simple/wizard; destinos; intereses; estilo; generación; chat claro/oscuro; inspiración móvil.
2. Las dos biblias globales “Japitin · Universo visual”, clara y “Noche en Japón”.
3. `docs/design/JAPITIN_DESIGN_SYSTEM.md` y el inventario de assets.
4. La implementación actual.

Una referencia generada por una herramienta nunca sustituye una captura original ni se etiqueta como canónica. Si el binario de una referencia conversacional no está disponible localmente, documentar esa limitación en vez de regenerarlo o copiar una referencia anterior.

### Identidad y compañeros

Japitin es completamente kawaii, ilustrado y emocional, pero mantiene estructura moderna, legible y funcional. No debe verse corporativo, bancario, SaaS, minimalista frío, vintage serio, cyberpunk, anime ni infantil desorganizado.

- El gatito guía es blanco, con mejillas rosadas y pañuelo rosa. Aparece en bienvenida, wizard, explicación, recomendación, carga, vacíos, celebración y ayuda.
- El perrito explorador es un corgi pequeño crema/café, con mochila y cámara. Aparece en mapas, itinerario, lugares, fotografía, rutas, descubrimiento, traslados y progreso.
- No cambiar arbitrariamente especie, paleta, proporción, accesorios o estilo acuarelado/chibi.
- Stickers, mascotas, estampas, iconos y washi deben tener transparencia real. Una imagen rectangular solo es válida cuando se presenta deliberadamente como mapa, postal, papel o polaroid.
- Budget Tracking es una prioridad funcional importante, pero no es el centro de la identidad visual de Japitin. La experiencia principal sigue siendo planificar, descubrir y vivir un viaje acompañado por el gatito guía y el perrito explorador.
- Dashboard, navegación, mascotas y componentes globales nunca adoptan una estética financiera por la importancia funcional del presupuesto.

El tema oscuro se llama visualmente “Noche en Japón”: azul noche, índigo, ciruela, crema cálido, sakura, faroles y detalles dorados. Mantiene la misma estructura y los mismos compañeros; no usa negro puro, neón, cyberpunk ni glassmorphism.

## Visual workflow

Toda creación o modificación significativa de una interfaz debe seguir este ciclo:

1. Consultar primero las capturas originales y después las biblias globales de Japitin.
2. Si hace falta explorar una pantalla que las referencias no resuelven, generar con Nano Banana una propuesta clara y otra oscura sin sustituir los originales.
3. Implementar con tokens y componentes compartidos.
4. Capturar con Playwright en desktop y móvil.
5. Comparar e iterar antes de finalizar.

Nano Banana se utiliza para definir y validar la dirección visual, no para sustituir la implementación real. Si no está disponible, el agente debe indicarlo y usar la herramienta visual disponible sin fingir su uso.
