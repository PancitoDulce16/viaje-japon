import { buildItineraryPages, createPrintFrame, mapsURL, dayMapActivity } from './itinerary-pdf-layout.js';
import { loadScript } from '../../performance/lazy-vendors.js';

export const PDFExporter = {
  busy: false,
  async exportToPDF(trip = window.TripsManager?.currentTrip, { save = true } = {}) {
    if (this.busy) return false;
    this.busy = true;
    let frame;
    try {
      const itinerary = trip?.days ? trip : trip?.itinerary?.days ? trip.itinerary : window.ItineraryHandler?.currentItinerary || window.currentItinerary;
      if (!itinerary?.days?.length) throw new Error('No hay itinerario para exportar. Abre un viaje con días y vuelve a intentarlo.');
      await Promise.all([loadScript('jspdf'), loadScript('html2canvas')]);
      window.Notifications?.info?.('Preparando tu itinerario PDF…');
      frame = await createPrintFrame();
      const codes = new Map();
      // Concurrent requests with a deadline; map links remain if QR is offline.
      await Promise.all(itinerary.days.map(async day => {
        const place = dayMapActivity(day);
        if (!place) return;
        const url = mapsURL(place, day.city);
        codes.set(url, await this.generateQRCode(url));
      }));
      const pages = await buildItineraryPages(frame.contentDocument, itinerary, trip || {}, { qrCode: url => codes.get(url) });
      const doc = new window.jspdf.jsPDF({ unit:'mm', format:'a4', orientation:'portrait', compress:true });
      doc.setProperties({ title:trip?.info?.name || 'Itinerario Japitin', subject:'Tu aventura a Japón', creator:'Japitin' });
      for (const [index, page] of pages.entries()) {
        if (index) doc.addPage();
        const canvas = await window.html2canvas(page, { scale:2, backgroundColor:null, useCORS:true, logging:false, windowWidth:794, windowHeight:1123, scrollX:0, scrollY:0 });
        doc.addImage(canvas.toDataURL('image/jpeg', .94), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        // Preserve clickable Maps links over the rasterized visual page.
        const bounds = page.getBoundingClientRect();
        page.querySelectorAll('a[href]').forEach(link => {
          const rect = link.getBoundingClientRect();
          doc.link((rect.left-bounds.left)*210/794, (rect.top-bounds.top)*297/1123, rect.width*210/794, rect.height*297/1123, { url:link.href });
        });
        canvas.width = canvas.height = 0;
      }
      const first = itinerary.days[0].date || 'viaje';
      const last = itinerary.days.at(-1).date || '';
      if (save) {
        doc.save(`Japitin_Itinerario_${String(first).replace(/[^\d-]/g,'') || 'viaje'}_${String(last).replace(/[^\d-]/g,'')}.pdf`);
        window.Notifications?.success?.('Tu itinerario PDF está listo.');
      }
      return save ? true : doc;
    } catch (error) {
      console.error('No se pudo exportar el itinerario PDF:', error);
      if (window.Notifications?.error) window.Notifications.error(`No se pudo crear el PDF: ${error.message}`);
      else window.alert(`No se pudo crear el PDF: ${error.message}`);
      return false;
    } finally { frame?.remove(); this.busy = false; }
  },
  getGoogleMapsURL(activity) { return mapsURL(activity); },
  async generateQRCode(data, size = 180) {
    try {
      const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`, { signal:AbortSignal.timeout(4000) });
      if (!response.ok) return null;
      const blob = await response.blob();
      return await new Promise((resolve,reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob);
      });
    } catch { return null; }
  }
};
window.PDFExporter = PDFExporter;
export default PDFExporter;
