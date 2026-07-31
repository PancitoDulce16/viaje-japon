const urls = { chart: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js', jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', html2pdf: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', leaflet: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js' };
const pending = new Map();
function loadScript(name) {
  if ((name === 'chart' && window.Chart) || (name === 'jspdf' && window.jspdf) || (name === 'html2pdf' && window.html2pdf) || (name === 'leaflet' && window.L)) return Promise.resolve();
  if (pending.has(name)) return pending.get(name);
  const promise = new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = urls[name]; script.async = true; script.onload = resolve; script.onerror = () => reject(new Error(`No se pudo cargar ${name}`)); document.head.appendChild(script); });
  pending.set(name, promise); return promise;
}
let analyticsReady;
let mapReady;
function ensureStylesheet(href) { if (document.querySelector(`link[href="${href}"]`)) return; const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; document.head.appendChild(link); }
async function loadMap() {
  if (window.MapHandler?.mapInitialized) return window.MapHandler;
  ensureStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'); await loadScript('leaflet');
  mapReady ||= import('../map/map.js').then(({ MapHandler }) => { window.MapHandler = MapHandler; MapHandler.renderMap(); return MapHandler; });
  return mapReady;
}
async function loadCharts() {
  await loadScript('chart');
  analyticsReady ||= Promise.all([import('../analytics/analytics-dashboard.js'), import('../analytics/analytics-integration.js'), import('../features/budget/budget-visual-charts.js')]);
  return analyticsReady;
}
document.addEventListener('click', async (event) => {
  const tab = event.target.closest('.tab-btn[data-tab="budget"],.tab-btn[data-tab="analytics"]');
  if (tab && !window.Chart && !tab.dataset.vendorReady) { event.preventDefault(); event.stopImmediatePropagation(); await loadCharts(); tab.dataset.vendorReady = 'true'; tab.click(); return; }
  const pdf = event.target.closest('[onclick*="exportToPDF"],[onclick*="exportReservationsPDF"]');
  if (pdf && !window.jspdf && !pdf.dataset.vendorReady) { event.preventDefault(); event.stopImmediatePropagation(); await Promise.all([loadScript('jspdf'), loadScript('html2pdf')]); pdf.dataset.vendorReady = 'true'; pdf.click(); }
}, true);
window.JapitinPerformance = { ...(window.JapitinPerformance || {}), loadCharts, loadScript, loadMap };
