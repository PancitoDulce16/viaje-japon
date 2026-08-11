# Phase 1 · Shell and shared navigation

## Migrated

- Authenticated desktop shell with grouped destinations and semantic active state.
- Shared topbar with current-trip selector, global search, notifications, theme, SOS and account menu.
- Mobile bottom navigation with four destinations, central quick action and “Más”.
- Quick-create sheet for activity, expense, task, reservation, document and memory.
- Focus restoration, Escape close, 44 px targets, reduced motion and safe-area behavior.
- Shared page-header, card, button, field, tabs, badge, table/list, chart, progress and state primitives from `css/components.css`.

## Existing inconsistencies found

- Three competing navigation layers: desktop rail, eleven-tab bar and mobile drawer.
- Duplicate search/trip actions in the header.
- Generic purple FAB disconnected from mobile navigation.
- Feature CSS containing local light/dark color decisions and incompatible radii.
- Multiple modal/toast/card families with overlapping selectors.

The phase keeps the horizontal tab bar as contextual subnavigation to preserve all existing routes. It is not a second global navigation.

## Representative routes verified

`itinerary`, `budget`, `preparation`, `flights`, `hotels`, `transport`, `map`, `attractions`, `essentials`, `utils`, `analytics`, plus journal/profile entry points and the quick-create actions.

## Pending migration

- Replace feature-local buttons, fields, cards and dialogs module by module.
- Consolidate the remaining generic modal and toast implementations.
- Add authenticated fixture data for deterministic content-level screenshots.
- Migrate gallery/chat/diary editorial layouts and remaining settings/utilities.

## Visual evidence

- Direction: `screens/app-shell/light.png`, `screens/app-shell/dark.png`.
- Real captures: `artifacts/shell-phase1/{light,dark}/{1440,1024,768,390}.png`.
- Mobile quick action: `artifacts/shell-phase1/light/390-quick-create.png`.

The mockups were created with the available image-generation tool because Nano Banana is not available in this environment. They are visual direction only; the real shell is semantic HTML, CSS tokens and JavaScript behavior.
