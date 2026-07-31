import { createFeatureLoader } from '../core/feature-loader.js';

const loadSuggestions = createFeatureLoader([
  () => import('../ai/smart-suggestions-engine.js'),
  () => import('../ai/smart-suggestions-ui.js')
]);
const loadJournal = createFeatureLoader([() => import('../features/journal/travel-journal.js')]);
const loadTimeline = createFeatureLoader([() => import('../features/journal/instagram-timeline.js')]);
const loadSocial = createFeatureLoader([() => import('../features/social/social-features.js')]);

function announce(message, type = 'info') {
  window.WashiToast?.show({ message, type, duration: type === 'error' ? 5000 : 2200 });
}

async function runFromTrigger(trigger, loader, readyFlag, label) {
  if (trigger.dataset[readyFlag] === 'true') return false;
  trigger.setAttribute('aria-busy', 'true');
  trigger.classList.add('jp-feature-trigger--loading');
  announce(`Preparando ${label}…`);
  try {
    await loader();
    trigger.dataset[readyFlag] = 'true';
    return true;
  } catch (error) {
    console.error(`[Japitin] No se pudo cargar ${label}:`, error);
    announce(`No pudimos abrir ${label}. Toca de nuevo para reintentar.`, 'error');
    return false;
  } finally {
    trigger.removeAttribute('aria-busy');
    trigger.classList.remove('jp-feature-trigger--loading');
  }
}

document.addEventListener('click', async event => {
  const trigger = event.target.closest('[data-tab="journal"], [onclick*="TravelJournal"], [onclick*="InstagramTimeline"]');
  if (!trigger) return;
  const isTimeline = trigger.getAttribute('onclick')?.includes('InstagramTimeline');
  const loader = isTimeline ? loadTimeline : loadJournal;
  const readyFlag = isTimeline ? 'timelineReady' : 'journalReady';
  if (trigger.dataset[readyFlag] === 'true') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (await runFromTrigger(trigger, loader, readyFlag, isTimeline ? 'la línea de recuerdos' : 'tu diario')) trigger.click();
}, true);

window.JapitinPerformance = {
  ...(window.JapitinPerformance || {}), loadSuggestions, loadJournal, loadTimeline, loadSocial
};

export { loadSuggestions, loadJournal, loadTimeline, loadSocial };
