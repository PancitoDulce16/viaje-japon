// Tracks actual itinerary writes; reconnecting alone never confirms a save.
export function createSaveStatus(notify, isOnline = () => navigator.onLine) {
  let pending = 0;
  let failed = false;
  let confirmed = false;
  const refresh = () => notify(pending ? (isOnline() ? 'saving' : 'pending') : failed ? 'error' : confirmed ? 'saved' : 'idle');
  return {
    refresh,
    async track(operation) {
      if (!pending) failed = false;
      pending++;
      refresh();
      try {
        const result = await operation();
        confirmed = true;
        return result;
      } catch (error) {
        failed = true;
        throw error;
      } finally {
        pending--;
        refresh();
      }
    }
  };
}
export const itinerarySaveStatus = createSaveStatus(state => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('itinerary-save-state', { detail: { state } }));
});
if (typeof window !== 'undefined') {
  window.addEventListener('online', itinerarySaveStatus.refresh);
  window.addEventListener('offline', itinerarySaveStatus.refresh);
}
