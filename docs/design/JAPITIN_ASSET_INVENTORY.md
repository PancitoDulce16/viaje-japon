# Inventario visual de Japitin

Este inventario clasifica los recursos disponibles; no convierte automáticamente un asset generado en referencia canónica. Las capturas originales y las biblias globales conservan la jerarquía definida en `AGENTS.md`.

## Compañeros

| Asset | Uso posible | Transparencia | Estado |
|---|---|---:|---|
| `images/illustrations/generated/companions/cat-guide.png` | Bienvenida, ayuda, recomendaciones y estados vacíos | Sí, RGBA real | Asset de implementación aprobado: gatito blanco, mejillas rosadas, pañuelo rosa y mapa. Derivado de las referencias; no las sustituye |
| `images/illustrations/generated/companions/dog-explorer.png` | Itinerario, rutas, mapas, fotografía y progreso | Sí, RGBA real | Asset de implementación aprobado: corgi crema/café, mochila y cámara. Derivado de las referencias; no las sustituye |
| `images/illustrations/generated/components/note-sticker-cat-cutout.png` | Legacy | No utilizable como sticker | Retirado del producto: conserva una superficie rectangular rasterizada |
| `images/illustrations/generated/components/tk-cathead-final.png` | Legacy | No utilizable como sticker | Retirado del producto: conserva fondo verde/chroma |
| `images/illustrations/generated/components/note-sticker-dog-v2.png` | Legacy | No utilizable como sticker | Retirado del producto: conserva fondo verde/chroma |
| `images/illustrations/generated/components/tk-doghead-final.png` | Legacy | No utilizable como sticker | Retirado del producto: conserva fondo verde/chroma |
| `images/illustrations/generated/characters/cat-*.webp` | Exploración de expresiones | No | No usar como sticker; pañuelo/accesorios no normalizados |
| `images/illustrations/generated/characters/dog-*.webp` | Exploración de expresiones | No | Solo dentro de un marco editorial intencional |
| `images/wizard/celebration-ready.png` | Celebración existente | Sí | Legacy compatible parcialmente; collar y estilo no son el modelo oficial nuevo |

Los dos compañeros transparentes se generaron como recursos de implementación a partir de la autoridad visual secundaria. No son capturas originales ni nuevas referencias canónicas.

## Papelería y recursos

| Familia | Rutas | Estado |
|---|---|---|
| Washi y cinta | `generated/signature-elements/washi-*`, `generated/decorations/washi-*` | Reutilizable; preferir variantes transparentes |
| Sello/postmark | `generated/decorations/postmark.webp`, `generated/signature-elements/hanko-ring.png` | Reutilizable |
| Polaroid | `generated/decorations/polaroid-fuji.*` | Reutilizable como recuerdo/foto |
| Papeles | `generated/surfaces/*.png`, `generated/components/note-paper-*` | Usar como superficie editorial, no como fondo universal |
| Tickets | `generated/surfaces/trip-memories-ticket.png`, `generated/components/tk-*.webp` | Reutilizable con texto HTML superpuesto |
| Mapas | `generated/maps/*.webp`, `images/wizard/*map*` | Reutilizable según tema y contexto |
| Pétalos | `generated/seasonal/sakura-petals.*` | Decoración de baja densidad |
| Ciudades y recuerdos | `generated/cities/*`, `generated/emotional-moments/*` | Reutilizable en postales, galería e itinerario |

## Reglas de uso

- Fondo transparente para sticker, mascota, icono, sello o cinta independiente.
- Fondo rectangular permitido solo cuando el componente es explícitamente mapa, papel, postal, escena o polaroid.
- No usar archivos `*-raw*`, chroma verde ni variantes opacas como stickers.
- No presentar las variantes opacas `characters/*.webp` sobre Noche en Japón sin un marco editorial intencional.
- No escalar un recorte pequeño hasta perder nitidez.
- Las variantes generadas nunca sustituyen las capturas originales ni las biblias globales.

## Assets descartados como dirección

- `docs/design/references/japitin-visual-dna-light.png`: biblia vintage seria anterior.
- Mockups centrados en un dashboard financiero/corporativo.
- Boards donde Presupuesto define la identidad completa del producto.
- Assets con mascota genérica o distinta a los dos compañeros oficiales.
- Variantes con caja blanca, fondo raster o chroma usadas como sticker.
