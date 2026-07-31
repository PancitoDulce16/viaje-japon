let toolsPromise;
const tools = [
  () => import('../features/japan/japan-rules.js'), () => import('../features/japan/japan-rules-ui.js'),
  () => import('../features/japan/horarios-system.js'), () => import('../features/japan/horarios-ui.js'),
  () => import('../features/japan/zonas-system.js'), () => import('../features/japan/zonas-ui.js'),
  () => import('../features/japan/survival-guide.js'), () => import('../features/japan/survival-ui.js'),
  () => import('../features/japan/jr-pass-calculator.js'), () => import('../features/japan/jr-pass-ui.js'),
  () => import('../features/japan/ramen-passport.js'), () => import('../features/japan/ramen-passport-ui.js'),
  () => import('../features/japan/goshuin-book.js'), () => import('../features/japan/goshuin-book-ui.js'),
  () => import('../features/japan/cultural-knowledge.js'), () => import('../features/japan/cultural-knowledge-ui.js')
];
export function loadJapanTools() {
  toolsPromise ||= Promise.allSettled(tools.map(load => load())).then(() => true);
  return toolsPromise;
}
document.addEventListener('click', async (event) => {
  const trigger = event.target.closest('.tab-btn[data-tab="utils"],[onclick*="JapanRules"],[onclick*="Horarios"],[onclick*="Zonas"],[onclick*="Survival"],[onclick*="JRPass"],[onclick*="RamenPassport"],[onclick*="Goshuin"],[onclick*="CulturalKnowledge"]');
  if (!trigger || trigger.dataset.japanToolsReady) return;
  event.preventDefault(); event.stopImmediatePropagation(); await loadJapanTools(); trigger.dataset.japanToolsReady = 'true'; trigger.click();
}, true);
window.JapitinPerformance = { ...(window.JapitinPerformance || {}), loadJapanTools };
