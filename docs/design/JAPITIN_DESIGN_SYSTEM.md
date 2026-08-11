# Sistema visual oficial de Japitin

Fuente permanente para todas las interfaces de Japitin. La prioridad es: claridad, jerarquía, facilidad de uso, consistencia, personalidad kawaii y decoración con propósito.

## Esencia oficial

> Japitin es una aplicación de viajes completamente kawaii, ilustrada y emocional, protagonizada por un gatito guía y un perrito explorador. Combina una interfaz moderna y clara con acuarelas pastel, tickets, mapas ilustrados, sellos, postales, washi tape, polaroids, pétalos, destellos y pequeños momentos mágicos.

Japitin se siente adorable, mágico, alegre, acompañado, personalizado, coleccionable, claro, funcional y moderno.

No se siente corporativo, bancario, minimalista y frío, vintage serio, plantilla SaaS, dashboard administrativo, aplicación de anime ni interfaz infantil desorganizada.

## Jerarquía de referencias

Cuando dos fuentes entren en conflicto, prevalece este orden:

1. Las ocho capturas originales del producto entregadas por la usuaria: itinerario completo; selector simple/wizard; destinos; intereses; estilo de viaje; generación; chat claro/oscuro; inspiración móvil.
2. Las dos biblias globales “Japitin · Universo visual”, clara y “Noche en Japón”.
3. Este documento, `AGENTS.md`, el inventario de assets y `/design-system`.
4. La implementación actual.

Las referencias anteriores con dashboard corporativo, sistema vintage serio, presupuesto como centro o una identidad distinta están descartadas. No se usan para nuevas decisiones.

Los diez archivos originales continúan pendientes como binarios locales. Se reconocen como canónicos por su contenido conversacional, pero no se regeneran, recortan ni sustituyen. Véase `references/README.md`.

## Compañeros oficiales

### Gatito guía

Gatito blanco, mejillas rosadas, pañuelo rosa, expresión amable, proporciones chibi y acabado acuarelado. Puede llevar mapa, pasaporte, varita, maleta u otro accesorio contextual.

Funciones: bienvenida, wizard, explicaciones, recomendaciones, carga mágica, estados vacíos, celebraciones y ayuda.

### Perrito explorador

Corgi pequeño en tonos crema y café, mochila, cámara, expresión curiosa, proporciones chibi y acabado acuarelado.

Funciones: mapas, itinerario, lugares, fotografía, rutas, descubrimiento, advertencias de traslado y progreso del viaje.

No se sustituyen por mascotas genéricas ni se alteran arbitrariamente sus colores, proporciones, accesorios o estilo. Una pantalla utiliza normalmente un compañero principal; ambos aparecen juntos solo cuando la narrativa lo justifica.

## Lenguaje visual

- Fondo crema cálido, con textura visual extremadamente sutil.
- Rosa sakura para la acción primaria y momentos de celebración.
- Azul marino para títulos, navegación y estructura.
- Lavanda y azul pastel para información, intereses y categorías.
- Verde suave para confirmación y progreso.
- Naranja cálido para advertencias y traslado.
- Sombras suaves teñidas de índigo; nunca gris pesado.
- Bordes suaves, sin convertir todos los elementos en cápsulas o tarjetas redondeadas.
- Ilustraciones de acuarela, pétalos, destellos y pequeños sellos con función narrativa.

La composición alterna superficies, tickets troquelados, notas, mapas, tarjetas, papeles, postales, polaroids y paneles ilustrados. La forma expresa el tipo de contenido; no es decoración aleatoria.

Display: Bricolage Grotesque. Lectura: Inter. Datos: IBM Plex Mono. Caveat se reserva para notas breves y acentos manuscritos.

## Recursos japoneses

- Ticket: reserva, vuelo, pase, gasto o acción puntual.
- Sello hanko: logro, confirmación, lugar visitado o estado final.
- Postal/polaroid: recuerdo y fotografía; una imagen rectangular es intencional aquí.
- Washi tape y clip: unión visual o indicación de elemento guardado.
- Mapa ilustrado: orientación, descubrimiento y ruta.
- Pétalos/destellos: emoción o celebración, con baja densidad.

Stickers, mascotas, estampas, iconos y cintas independientes necesitan transparencia real. Nunca se incrusta una caja blanca o un chroma verde como parte del asset.

## Noche en Japón

El modo oscuro oficial se denomina visualmente “Noche en Japón”. Mantiene contenido, jerarquía, estructura, gatito, perrito, tickets, sellos, flores e ilustraciones.

Utiliza azul noche, índigo, ciruela, crema cálido, rosa sakura, luz de farol y detalles dorados. Mapas e ilustraciones se adaptan a escenas nocturnas cuando existe un asset específico.

No utiliza negro puro, neón, estética cyberpunk, glassmorphism, superficies grises genéricas ni texto gris ilegible. Claro y oscuro son el mismo producto y comparten una sola estructura de componentes; solo cambian tokens y assets temáticos equivalentes.

## Tokens y componentes

`css/tokens.css` es la única fuente de colores, superficies, texto, bordes, sombras, radios, espacio, movimiento y capas. Los componentes consumen la API semántica: `--background`, `--surface`, `--surface-soft`, `--surface-ticket`, `--surface-note`, `--surface-map`, `--surface-chat`, `--text-primary`, `--text-secondary`, `--border`, `--primary`, `--positive`, `--warning`, `--danger` e `--information`.

`css/components.css` contiene encabezados, botones, campos, tabs, badges, tabla/lista, progreso, estados, compañeros y las superficies editoriales compartidas. No se decide un color de tema dentro de un componente.

Breakpoints de validación: 1440, 1024, 768 y 390 px. Objetivo táctil mínimo: 44 px. El foco es visible; la tabla se transforma en lista bajo 768 px y ninguna acción desaparece.

## Microcopy

Breve, positiva y útil: “¡Vamos a vivir Japón al máximo!”, “Tu aventura empieza aquí”, “¡Magia Japitin en acción!”, “Todo listo para esta parada” o “Un detalle pendiente”.

En un error se explica qué pasó y cómo continuar. En finanzas se prioriza precisión: montos originales, tipo de cambio, persona responsable y saldo se muestran sin metáforas ambiguas.

## Presupuesto y gastos

> “Budget Tracking es una prioridad funcional importante, pero no es el centro de la identidad visual de Japitin. La experiencia principal sigue siendo planificar, descubrir y vivir un viaje acompañado por el gatito guía y el perrito explorador.”

Presupuesto es un módulo esencial, pero no domina la identidad global ni condiciona el dashboard, la navegación, las mascotas o los componentes compartidos. Su próxima consolidación funcional debe cubrir como mínimo:

- retiros de cajero como movimiento de efectivo, con comisión y tipo de cambio;
- propósito y categoría de cada movimiento;
- quién pagó, para quién fue y división entre integrantes;
- saldos “me deben” y “debo”, con liquidaciones parciales o completas;
- conversión entre moneda original, moneda base y monedas favoritas;
- efectivo disponible por moneda para evitar contar un retiro y su gasto dos veces;
- gastos, reembolsos, transferencias, adelantos e ingresos diferenciados;
- historial de tipos de cambio, filtros, exportación y trazabilidad.

La interfaz debe ser progresiva: registrar un gasto sencillo sigue siendo rápido y los detalles avanzados aparecen cuando corresponden.

## Accesibilidad y rendimiento

- Contraste WCAG AA, zoom y orden de lectura coherente.
- Estados no dependen solo del color.
- Modal conserva foco, cierra con Escape y devuelve el foco al origen.
- Animación respeta `prefers-reduced-motion`.
- Assets decorativos no bloquean contenido y respetan `prefers-reduced-data` cuando sea relevante.
- Alt descriptivo para contenido; alt vacío para decoración.

## Checklist de entrega

- ¿Se reconoce inmediatamente como Japitin?
- ¿El compañero usado coincide con el contexto?
- ¿La acción primaria es evidente y única?
- ¿La forma —ticket, nota, mapa, papel o tarjeta— tiene propósito?
- ¿Claro y Noche en Japón son el mismo producto?
- ¿Los stickers tienen transparencia real?
- ¿Funciona y fue capturado a 1440, 1024, 768 y 390 px?
- ¿Se comparó con las referencias siguiendo la jerarquía oficial?

## Auditoría y migración

| Área | Estado | Próximo paso |
|---|---|---|
| Tokens y laboratorio | Alineados | Mantener como contrato visual ejecutable |
| Shell y navegación | Alineados parcialmente | Incorporar compañeros y recursos editoriales sin duplicar navegación |
| Presupuesto / Budget Tracking | Funcionalmente parcial | Consolidar efectivo, cajero, propósito, conversión, deudas y liquidaciones |
| Dashboard e itinerario | Parcialmente alineados | Migrar componentes internos según capturas originales |
| Mapa y descubrimiento | Parcialmente alineados | Normalizar filtros, mapa ilustrado y perrito explorador |
| Wizard | Referencia principal | Preservar composición y gatito guía al tocarlo |
| Galería, diario y chat | Parciales | Unificar polaroids, papeles, estados y Noche en Japón |
| Utilidades y ajustes | No alineados | Migrar después de los flujos principales |

No rediseñar páginas completas en paralelo. Cada migración conserva funciones y datos reales.
