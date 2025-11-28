# 🎨 Japitin Design System
## Professional Geek Japanese Travel Planner

Sistema de diseño profesional que combina estética kawaii-tech japonesa con principios modernos de UX/UI.

---

## 📋 Tabla de Contenidos

1. [Filosofía de Diseño](#filosofía-de-diseño)
2. [Tokens de Diseño](#tokens-de-diseño)
3. [Componentes](#componentes)
4. [Patrones Japoneses](#patrones-japoneses)
5. [Modo Oscuro](#modo-oscuro)
6. [Accesibilidad](#accesibilidad)
7. [Uso e Implementación](#uso-e-implementación)

---

## 🎯 Filosofía de Diseño

### Principios Fundamentales

1. **Profesional sin perder personalidad**: Diseño limpio y moderno con toques kawaii sutiles
2. **Contraste WCAG AA**: Mínimo 4.5:1 en texto, 3:1 en elementos UI
3. **Geek pero funcional**: Iconografía tech sin sacrificar usabilidad
4. **Japonés auténtico**: Patrones geométricos tradicionales (asanoha, seigaiha) en lugar de clichés
5. **Microinteracciones fluidas**: 150-250ms, respetando `prefers-reduced-motion`

### Identidad Visual

- **Primary**: Rojo Torii (#E63946) - Representa puertas tradicionales japonesas
- **Secondary**: Verde Matcha (#2A9D8F) - Color natural y sereno
- **Accent**: Rosa Sakura (#F4A6B9) - Flor de cerezo, delicado
- **Tech**: Azul Tecnológico (#457B9D) - Modernidad y funcionalidad
- **Genki**: Amarillo Energético (#F9C74F) - Vitalidad y positividad

---

## 🎨 Tokens de Diseño

### Paleta de Colores

#### Light Mode
```css
--color-primary: #E63946;          /* Torii Red */
--color-secondary: #2A9D8F;        /* Matcha Green */
--color-accent: #F4A6B9;           /* Sakura Pink */
--color-tech: #457B9D;             /* Tech Blue */
--color-genki: #F9C74F;            /* Genki Yellow */

--color-bg: #FAFBFC;               /* Fondo principal */
--color-surface: #FFFFFF;          /* Superficies elevadas */
--color-text: #0F0F12;             /* Texto principal */
--color-text-muted: #6B7280;       /* Texto secundario */
```

#### Dark Mode
```css
--color-primary: #FF5964;          /* Más luminoso */
--color-secondary: #48BFB3;        /* Más luminoso */
--color-bg: #0F0F12;               /* Fondo oscuro profundo */
--color-surface: #15171C;          /* Superficies */
--color-text: #F9FAFB;             /* Texto claro */
```

### Tipografía

**Familia**: Poppins (primaria), Manrope (alternativa)

```css
--size-h1: 40px;    /* Display, peso 800 */
--size-h2: 32px;    /* Secciones, peso 700 */
--size-h3: 24px;    /* Subsecciones, peso 600 */
--size-h4: 20px;    /* Componentes, peso 600 */
--size-body: 16px;  /* Texto base, peso 400-500 */
--size-caption: 13px; /* Metadatos, peso 400 */

--lh-tight: 1.25;   /* Títulos */
--lh-normal: 1.4;   /* Cuerpo */
```

### Espaciado (8pt Grid)

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

### Bordes y Radios

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 9999px;
```

### Sombras (Elevation System)

```css
--shadow-level-1: 0 2px 6px rgba(0,0,0,0.06);   /* Cards en reposo */
--shadow-level-2: 0 6px 16px rgba(0,0,0,0.10);  /* Cards hover */
--shadow-level-3: 0 10px 24px rgba(0,0,0,0.12); /* Modales */
--shadow-level-4: 0 16px 40px rgba(0,0,0,0.14); /* Overlays */
```

### Transiciones

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🧩 Componentes

### Botones

#### Primary (Acción principal)
```html
<button class="btn btn-primary">
  <i class="fas fa-plus"></i>
  Agregar Viaje
</button>
```
- Fondo sólido rojo torii
- Hover: +6% luminosidad, eleva 1px
- Active: -6% luminosidad
- Sombra con color primario

#### Secondary (Acción secundaria)
```html
<button class="btn btn-secondary">
  <i class="fas fa-share"></i>
  Compartir
</button>
```
- Borde 2px primario, fondo transparente
- Hover: tint leve con alpha 10%

#### Tertiary/Ghost
```html
<button class="btn btn-tertiary">
  <i class="fas fa-edit"></i>
  Editar
</button>
```
- Sin borde, texto con icono
- Hover: fondo overlay

#### Icon Button
```html
<button class="btn-icon">
  <i class="far fa-bell"></i>
</button>
```
- 40x40px, circular
- Fondo overlay, hover con border color

#### SOS (Emergencia)
```html
<button class="btn btn-sos">
  <i class="fas fa-phone-alt"></i>
  SOS
</button>
```
- Rojo error, peso semibold
- Hover: escala 1.05

### Cards de Estadísticas

```html
<div class="stat-card">
  <div class="stat-card-header">
    <div class="stat-card-icon coral">
      <i class="fas fa-gift"></i>
    </div>
    <div>
      <div class="stat-card-value">15</div>
      <div class="stat-card-label">días</div>
    </div>
  </div>
  <div class="stat-card-subtitle">Comienza en 81 días</div>
</div>
```

**Variantes de iconos:**
- `.coral` - Primario (rojo torii)
- `.cyan` - Secundario (matcha)
- `.yellow` - Genki
- `.blue` - Tech

**Estados:**
- Hover: Eleva 2px, shadow-level-3, borde tinted
- Active: Mantiene elevación

### Navegación por Tabs

```html
<div class="tabs-container">
  <div class="tabs-nav">
    <button class="tab-item active">
      <i class="fas fa-list"></i>
      <span>Itinerario</span>
    </button>
    <button class="tab-item">
      <i class="fas fa-plane"></i>
      <span>Vuelos</span>
    </button>
  </div>
</div>
```

**Estados:**
- Activo: subrayado 3px primario, fondo alpha-10, icono coloreado
- Inactivo: texto muted, icono mono
- Hover: texto normal, fondo overlay

### Timeline de Itinerario

```html
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-marker"></div>
    <div class="timeline-card">
      <div class="timeline-day">Día 1 - 15 Febrero 2026</div>
      <div class="timeline-location">Tokyo</div>
      <div class="timeline-activities">
        <div class="activity-item">
          <div class="activity-icon culture">
            <i class="fas fa-torii-gate"></i>
          </div>
          <div class="activity-details">
            <div class="activity-time">09:00 - 12:00</div>
            <div class="activity-name">Templo Senso-ji</div>
            <span class="activity-tag culture">Cultura</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Categorías de actividades:**
- `.culture` - Rojo torii (templos, museos)
- `.food` - Verde matcha (restaurantes, mercados)
- `.transport` - Azul tech (trenes, taxis)
- `.shopping` - Amarillo genki (tiendas, centros comerciales)

### Header

```html
<header class="app-header">
  <div class="header-content">
    <div class="header-logo">
      <svg class="header-logo-icon">...</svg>
      <span class="header-logo-text">Japitin</span>
    </div>
    <div class="header-actions">
      <button class="btn-icon notification-badge">
        <i class="far fa-bell"></i>
      </button>
      <button class="theme-toggle" id="themeToggle">
        <i class="fas fa-moon"></i>
      </button>
      <button class="btn btn-sos">SOS</button>
      <button class="btn-icon">
        <i class="far fa-user"></i>
      </button>
    </div>
  </div>
</header>
```

**Características:**
- Sticky top, z-index 200
- Altura: 72px
- Sombra level-1
- Logo con hover scale 1.05

---

## 🎌 Patrones Japoneses

Archivo: `css/japanese-patterns.css`

### Asanoha (Hoja de Cáñamo)
```html
<div class="pattern-asanoha">
  <!-- Contenido -->
</div>
```
Patrón de líneas cruzadas geométricas. Opacidad 3-6%.

### Seigaiha (Olas)
```html
<div class="pattern-seigaiha">
  <!-- Contenido -->
</div>
```
Patrón de semicírculos concéntricos representando olas.

### Sakura (Flor de Cerezo)
```html
<div class="pattern-sakura">
  <!-- Contenido -->
</div>
```
Pétalos dispersos sutiles.

### Tech Traditional (Híbrido)
```html
<div class="pattern-tech-traditional">
  <!-- Contenido -->
</div>
```
Combina grid tech con diagonales tradicionales.

### Decoraciones

```html
<!-- Esquinas decorativas -->
<div class="corner-decoration">
  <!-- Contenido -->
</div>

<!-- Torii en esquina -->
<div class="torii-decoration">
  <!-- Contenido -->
</div>

<!-- Lucky Cat -->
<div class="lucky-cat-decoration">
  <!-- Contenido -->
</div>
```

---

## 🌓 Modo Oscuro

### Activación

```javascript
// Toggle manual
const html = document.documentElement;
html.setAttribute('data-theme', 'dark');

// O usar clase
document.body.classList.add('dark');
```

### Ajustes Específicos

1. **Colores primarios**: +15% luminosidad
2. **Fondos**: Reducir saturación, oscurecer
3. **Sombras**: +10-20% opacidad
4. **Bordes**: Más claros para contraste

### Contraste

- Texto sobre superficie: ≥7:1 (AAA)
- Botones primarios: ≥4.5:1 (AA)
- Iconos esenciales: ≥3:1

---

## ♿ Accesibilidad

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Atributos ARIA
- `aria-label` en botones solo icono
- `role` en componentes interactivos
- `aria-pressed` en toggles

### Navegación por Teclado
- Tab order lógico
- Skip links disponibles
- Focus trap en modales

---

## 🚀 Uso e Implementación

### Archivos Necesarios

1. **Sistema base**: `/css/geek-design-system.css`
2. **Patrones**: `/css/japanese-patterns.css`
3. **Font Awesome**: CDN o local
4. **Google Fonts**: Poppins, Manrope

### Implementación Básica

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>

  <!-- Design System -->
  <link rel="stylesheet" href="/css/geek-design-system.css">
  <link rel="stylesheet" href="/css/japanese-patterns.css">

  <title>Japitin</title>
</head>
<body class="app-layout" data-theme="light">
  <!-- Tu contenido -->
</body>
</html>
```

### Theme Toggle Script

```javascript
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const currentTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', currentTheme);

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
  const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});
```

---

## 📁 Estructura de Archivos

```
css/
├── geek-design-system.css    # Sistema base completo
├── japanese-patterns.css      # Patrones decorativos
└── ...otros archivos legacy

dashboard-geek.html            # Implementación de referencia
DESIGN-SYSTEM.md              # Esta documentación
```

---

## 🎯 Checklist de Implementación

- [x] Tokens CSS (colores, tipografía, espaciado)
- [x] Componentes base (botones, cards, tabs)
- [x] Header sticky con logo y acciones
- [x] Hero banner con patrón japonés
- [x] Timeline de itinerario profesional
- [x] Modo oscuro con contraste WCAG AA
- [x] Patrones decorativos japoneses
- [x] Microinteracciones (hover, active, focus)
- [x] Responsive design (mobile-first)
- [x] Accesibilidad (ARIA, keyboard, reduced motion)

---

## 📚 Recursos

- **Tipografía**: [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
- **Iconos**: [Font Awesome 6](https://fontawesome.com/)
- **Patrones**: Inspirados en diseño tradicional japonés
- **Contraste**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 🎨 Ejemplos Visuales

### Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| 🔴 Torii Red | `#E63946` | Primario, botones CTA |
| 🟢 Matcha Green | `#2A9D8F` | Secundario, éxito |
| 🌸 Sakura Pink | `#F4A6B9` | Acento, decoración |
| 🔵 Tech Blue | `#457B9D` | Información, tech |
| 🟡 Genki Yellow | `#F9C74F` | Energía, alertas |

### Elevación

```
Level 1: Cards en reposo
Level 2: Cards hover, tabs activos
Level 3: Dropdowns, modales
Level 4: Overlays, toasts
```

---

**Creado con 💖 por el equipo de Japitin**
_Versión 1.0 - Noviembre 2025_
