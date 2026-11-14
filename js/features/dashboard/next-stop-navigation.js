import { activityMapFocus } from '../../map/activity-location.js';

export function openNextStopMap(button) {
  let activity;
  try { activity = JSON.parse(button.dataset.mapActivity); }
  catch { return; }
  const focus = activityMapFocus(activity, window.TripsManager?.currentTrip?.id || null);
  if (!focus) return;
  try {
    // Clear a previous day's selection when the new activity has no day yet.
    sessionStorage.removeItem('japitin_map_day');
    sessionStorage.setItem('japitin-map-focus', JSON.stringify(focus));
    if (focus.day !== null) sessionStorage.setItem('japitin_map_day', String(focus.day));
  } catch (error) {
    console.warn('No se pudo conservar la próxima parada para el mapa', error);
  }
  window.DashboardApp?.switchTab('map');
}

if (typeof window !== 'undefined') window.JapitinDashboardNavigation = { openNextStopMap };
