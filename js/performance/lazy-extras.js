let extrasPromise;
const extras = [
  () => import('../features/social/social-network.js'),
  () => import('../features/journal/photo-gallery.js'),
  () => import('../features/journal/trip-story-generator.js'),
  () => import('../features/journal/trip-cards-generator.js'),
  () => import('../features/japan/japan-persona-quiz.js'),
  () => import('../features/social/travel-twins-matcher.js'),
  () => import('../map/hidden-gems-map.js'),
  () => import('../features/gamification/location-game.js'),
  () => import('../features/social/whatsapp-updater.js'),
  () => import('../ui/landing-page-generator.js')
];
export function loadExtras() {
  extrasPromise ||= Promise.allSettled(extras.map(load => load())).then(() => true);
  return extrasPromise;
}
document.addEventListener('click', async (event) => {
  const trigger = event.target.closest('#main-fab-button,[onclick*="SocialNetwork"],[onclick*="TravelTwins"],[onclick*="TripStory"],[onclick*="TripCards"],[onclick*="PhotoGallery"],[onclick*="HiddenGems"],[onclick*="Whatsapp"]');
  if (!trigger || trigger.dataset.extrasReady) return;
  event.preventDefault(); event.stopImmediatePropagation(); await loadExtras(); trigger.dataset.extrasReady = 'true'; trigger.click();
}, true);
window.JapitinPerformance = { ...(window.JapitinPerformance || {}), loadExtras };
