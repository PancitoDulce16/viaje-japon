const urls = { html2canvas: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js', chart: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js', jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', html2pdf: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', leaflet: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js' };
const pending = new Map();
export function loadScript(name) {
  if (!urls[name]) return Promise.reject(new Error(`Recurso desconocido: ${name}`));
  if ((name === 'html2canvas' && window.html2canvas) || (name === 'chart' && window.Chart) || (name === 'jspdf' && window.jspdf) || (name === 'html2pdf' && window.html2pdf) || (name === 'leaflet' && window.L)) return Promise.resolve();
  if (pending.has(name)) return pending.get(name);
  const promise = new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = urls[name]; script.async = true; script.onload = resolve; script.onerror = () => reject(new Error(`No se pudo cargar ${name}`)); document.head.appendChild(script); });
  pending.set(name, promise);
  promise.catch(() => { pending.delete(name); document.querySelector(`script[src="${urls[name]}"]`)?.remove(); });
  return promise;
}
let analyticsReady;
let mapReady;
let exportReady;
function ensureStylesheet(href) { if (document.querySelector(`link[href="${href}"]`)) return; const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; document.head.appendChild(link); }
async function loadMap() {
  if (window.MapHandler?.mapInitialized) return window.MapHandler;
  ensureStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'); await loadScript('leaflet');
  mapReady ||= import('../map/map.js').then(async ({ MapHandler }) => { window.MapHandler = MapHandler; await MapHandler.renderMap(); return MapHandler; }).catch(error => { mapReady = null; throw error; });
  return mapReady;
}
async function loadCharts() {
  await loadScript('chart');
  analyticsReady ||= Promise.all([import('../analytics/analytics-dashboard.js'), import('../analytics/analytics-integration.js'), import('../features/budget/budget-visual-charts.js'), import('../features/budget/expense-charts.js')]).catch(error => { analyticsReady = null; throw error; });
  return analyticsReady;
}
async function loadExports({ pdf = false } = {}) {
  if (pdf) await loadScript('jspdf');
  exportReady ||= Promise.all([import('../features/trips/pdf-exporter.js'), import('../features/trips/export-manager.js')]).catch(error => { exportReady = null; throw error; });
  return exportReady;
}
document.addEventListener('click', async (event) => {
  const tab = event.target.closest('.tab-btn[data-tab="budget"],.tab-btn[data-tab="analytics"]');
  if (tab && !window.Chart && !tab.dataset.vendorReady) {
    event.preventDefault(); event.stopImmediatePropagation();
    try { await loadCharts(); tab.dataset.vendorReady = 'true'; tab.click(); }
    catch (error) { console.error('No se pudieron cargar los gráficos', error); window.WashiToast?.show({ message: 'No pudimos cargar los gráficos. Volvé a intentarlo.', type: 'error' }); }
    return;
  }
  const exportTrigger = event.target.closest('[data-trip-action="pdf"],[onclick*="exportToPDF"],[onclick*="exportReservationsPDF"],[onclick*="exportCurrentTrip"],[onclick*="exportJapitin"]');
  if (exportTrigger && !exportTrigger.dataset.vendorReady) { event.preventDefault(); event.stopImmediatePropagation(); exportTrigger.setAttribute('aria-busy','true'); try { await loadExports({ pdf: exportTrigger.matches('[data-trip-action="pdf"],[onclick*="PDF"],[onclick*="pdf"]') }); exportTrigger.dataset.vendorReady = 'true'; exportTrigger.click(); } catch(error) { console.error('No se pudo preparar la exportación',error); window.WashiToast?.show({message:'No pudimos preparar la exportación. Inténtalo de nuevo.',type:'error'}); } finally { exportTrigger.removeAttribute('aria-busy'); } }
}, true);
window.JapitinPerformance = { ...(window.JapitinPerformance || {}), loadCharts, loadExports, loadScript, loadMap };
