# Japitin — Claude Code Project Rules

## Project overview
Japan trip planner PWA. Stack: Vanilla JS (ES modules), Tailwind CSS (CDN), Firebase v11 (npm), Vite 7 build tool. Hosted on Firebase Hosting.

## Auto-approve
Run all Bash/PowerShell commands automatically — no approval needed for this project.

---

## File structure
```
/js/
  core/        firebase-config.js, auth.js, notifications.js, config.js, logger.js, ...
  ui/          dashboard.js, login.js, tabs.js, modals.js, theme-manager.js, ...
  features/
    itinerary/ itinerary-v3.js, itinerary-builder.js, day-balancer-v3.js, ...
    budget/    budget-tracker.js, budget-intelligence.js, ...
    trips/     trips-manager.js, packing-list.js, favorites-manager.js, ...
    japan/     ramen-passport.js, jr-pass-calculator.js, cultural-knowledge.js, ...
    social/    social-features.js, group-chat.js, chat.js, ...
    journal/   photo-gallery.js, travel-journal.js, instagram-timeline.js, ...
    planning/  emergency-assistant.js, live-mode.js, calendar-view.js, ...
    gamification/ gamification-system.js, challenge-system.js, ...
  map/         map.js, route-optimizer-v2.js, geo-optimizer.js, ...
  api/         flights.js, hotels.js, attractions.js, transport.js, ...
  ai/          smart-suggestions-engine.js, recommendation-engine.js, ...
  utils/       time-utils.js, helpers.js, cache-buster.js, ...
  analytics/   feedback-tracker.js, analytics-dashboard.js, ...
  tools/       health-dashboard.js, quick-fixes.js, health-calculator.js, ...
  dev/         dev-panel.js, ml-test-panel.js, test-runner.js, ...
/css/
  app.css      Single entry point — @imports all 44 CSS files in cascade order
/data/         Static JSON/JS data: activities-database.js, japan-cities.js, ...
/images/       Icons, wallpapers, maneki-neko, etc.
```

---

## Import rules — CRITICAL

### 1. Firebase imports (npm-style, resolved by import map in browser)
```js
// CORRECT — npm package name, resolved by importmap in HTML
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// WRONG — CDN URL (old style, removed)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/...'
```

### 2. Internal imports — always relative, never absolute /js/ paths
```js
// CORRECT — relative paths
import { AuthHandler } from '../core/auth.js';
import { Notifications } from '../../core/notifications.js';

// WRONG — absolute /js/ root paths (break at different folder depths)
import { AuthHandler } from '/js/auth.js';
import { Notifications } from '/js/notifications.js';
```

### 3. Dynamic imports follow the same rules
```js
// CORRECT
const { db } = await import('../core/firebase-config.js');

// WRONG
const { db } = await import('/js/firebase-config.js');
```

### 4. When moving files, ALWAYS update all importers first
Before moving `js/old/file.js` to `js/new/file.js`:
1. Find all files that import it: `grep -rn "old/file" js/`
2. Update all import paths
3. Then move the file
4. Run `npm run build` to verify — build MUST pass before deploy

### 5. data/ files are at project root, not under js/
```js
// CORRECT — from js/ai/something.js to data/
import data from '../../data/activities-database.js';

// WRONG
import data from '../data/activities-database.js';
```

---

## HTML module scripts

All `<script src="/js/...">` tags in HTML must have `type="module"`:
```html
<!-- CORRECT -->
<script type="module" src="/js/ui/dashboard.js"></script>

<!-- WRONG — Vite can't bundle it, also changes defer behavior -->
<script src="/js/ui/dashboard.js"></script>
```

`DOMContentLoaded` is NOT needed inside module scripts — modules are deferred and always run after DOM is ready:
```js
// CORRECT
new MyClass();

// WRONG — DOMContentLoaded already fired by the time module runs
document.addEventListener('DOMContentLoaded', () => new MyClass());
```

---

## Import map (in login.html and dashboard.html)
The `<script type="importmap">` at the top of each HTML file maps Firebase npm package names to CDN URLs. This must appear BEFORE any module scripts and must stay in sync with the installed Firebase version.

Current version: **Firebase 11.1.0**

```html
<script type="importmap">
{
  "imports": {
    "firebase/app": "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js",
    "firebase/auth": "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js",
    "firebase/firestore": "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js",
    "firebase/storage": "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js"
  }
}
</script>
```

---

## Pre-deploy checklist
Before ANY deploy, run:
```bash
npm run build
```
Build must complete with `✓ built in Xs` (warnings OK, errors NOT OK).

Then deploy:
```bash
npx firebase deploy --only hosting
```

For security rule changes:
```bash
npx firebase deploy --only hosting,firestore:rules
```

---

## Dev files — never deploy
These files are in `firebase.json` ignore list. Keep them there:
- `check-trips.html`, `diagnose-data.html`, `recover-data.html`
- `dev-tools.html`, `test-button.html`, `test-suggestions.html`
- `limpiar-estilos.html`, `simple-recover.js`, `force-recover.js`

Dev scripts (`js/dev/*.js`) load only in dashboard.html — check they're NOT loading in production. If spotted, remove the script tag.

---

## CSS rules
- One entry point: `css/app.css` (with `@import` for all 44 files)
- All HTML pages reference only `/css/app.css`
- Never write `dark:property: value` inside `.css` files — those are Tailwind HTML utility classes, not CSS properties

---

## Theming / brand
- Primary color: `#7c3aed` (jp-purple)
- Dark: `#0f0a1e` (jp-dark)
- Font: Inter (Google Fonts)
- All pages must use `theme-color: #7c3aed` in meta tags
- App name is **Japitin**, not "Japan Trip Planner"

---

## Node.js
- Required: Node 22+ (installed: 22.23.1)
- Vite 7 requires Node 20.19+
