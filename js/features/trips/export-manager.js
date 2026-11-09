import { PDFExporter } from './pdf-exporter.js';
// js/export-manager.js - Sistema de Exportación de Itinerarios
// Permite exportar itinerarios a múltiples formatos

/**
 * Export Manager - Exportación multi-formato
 */
const ExportManager = {

  /**
   * 📄 EXPORTAR A PDF
   * Genera un PDF descargable con el itinerario completo
   */
  async exportToPDF(trip) {
    return PDFExporter.exportToPDF(trip);
  },

  /**
   * 📅 EXPORTAR A GOOGLE CALENDAR
   * Genera un archivo .ics descargable
   */
  exportToGoogleCalendar(trip) {
    try {
      console.log('📅 Generando eventos de Google Calendar...', trip);

      const { info, itinerary } = trip;
      let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Japan Itinerary Planner//ES\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n';
      icsContent += `X-WR-CALNAME:${info.name}\n`;
      icsContent += `X-WR-CALDESC:Itinerario de viaje a Japón\n`;

      const startDate = window.TimeUtils.parseDate(info.dateStart);

      (itinerary?.days || []).forEach((day, dayIdx) => {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + dayIdx);

        (day.activities || []).forEach((activity, actIdx) => {
          const activityStart = new Date(dayDate);

          // Parsear hora de inicio
          if (activity.time) {
            const [hours, minutes] = activity.time.split(':').map(Number);
            activityStart.setHours(hours, minutes, 0);
          } else {
            activityStart.setHours(9 + (actIdx * 2), 0, 0); // Default: cada 2 horas desde las 9am
          }

          const activityEnd = new Date(activityStart);
          activityEnd.setMinutes(activityEnd.getMinutes() + (activity.duration || 60));

          const uid = `${dayIdx}-${actIdx}-${Date.now()}@japan-itin-dev.web.app`;
          const dtstart = this.formatICSDate(activityStart);
          const dtend = this.formatICSDate(activityEnd);

          icsContent += 'BEGIN:VEVENT\n';
          icsContent += `UID:${uid}\n`;
          icsContent += `DTSTAMP:${this.formatICSDate(new Date())}\n`;
          icsContent += `DTSTART:${dtstart}\n`;
          icsContent += `DTEND:${dtend}\n`;
          icsContent += `SUMMARY:${this.escapeICS(activity.name || 'Actividad')}\n`;
          icsContent += `LOCATION:${this.escapeICS(activity.area || activity.address || '')}\n`;
          icsContent += `DESCRIPTION:${this.escapeICS(activity.description || `Día ${dayIdx + 1} - ${day.city}`)}\n`;
          icsContent += 'STATUS:CONFIRMED\n';
          icsContent += 'END:VEVENT\n';
        });
      });

      icsContent += 'END:VCALENDAR';

      // Descargar archivo .ics
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${info.name.replace(/\s+/g, '_')}_Calendar.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.Notifications?.show('✅ Archivo de calendario descargado. Ábrelo para agregar a Google Calendar', 'success');

      // Nota: el contador 'exportFormats' se retiró — ver DEPRECATION_LOG.md.

      return true;

    } catch (error) {
      console.error('❌ Error generando calendario:', error);
      window.Notifications?.show('❌ Error generando calendario: ' + error.message, 'error');
      return false;
    }
  },

  /**
   * 🗺️ EXPORTAR A GOOGLE MAPS
   * Abre Google Maps con todos los lugares como waypoints
   */
  exportToGoogleMaps(trip) {
    try {
      console.log('🗺️ Abriendo en Google Maps...', trip);

      const { itinerary } = trip;
      const allActivities = [];

      // Recolectar todas las actividades con coordenadas
      (itinerary?.days || []).forEach(day => {
        (day.activities || []).forEach(activity => {
          if (activity.lat && activity.lng) {
            allActivities.push({
              name: activity.name,
              lat: activity.lat,
              lng: activity.lng
            });
          }
        });
      });

      if (allActivities.length === 0) {
        window.Notifications?.show('⚠️ No hay actividades con coordenadas GPS', 'warning');
        return false;
      }

      // Limitar a 10 waypoints (límite de Google Maps URL)
      const limited = allActivities.slice(0, 10);

      if (allActivities.length > 10) {
        window.Notifications?.show(`⚠️ Solo se mostrarán las primeras 10 ubicaciones (de ${allActivities.length})`, 'warning');
      }

      // Construir URL de Google Maps
      const origin = `${limited[0].lat},${limited[0].lng}`;
      const destination = limited.length > 1 ? `${limited[limited.length - 1].lat},${limited[limited.length - 1].lng}` : origin;

      const waypoints = limited.slice(1, -1).map(act => `${act.lat},${act.lng}`).join('|');

      let mapsURL = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

      if (waypoints) {
        mapsURL += `&waypoints=${waypoints}`;
      }

      mapsURL += '&travelmode=transit';

      window.open(mapsURL, '_blank');

      window.Notifications?.show('✅ Abriendo Google Maps con tu ruta', 'success');

      // Nota: el contador 'exportFormats' se retiró — ver DEPRECATION_LOG.md.

      return true;

    } catch (error) {
      console.error('❌ Error abriendo Google Maps:', error);
      window.Notifications?.show('❌ Error abriendo Google Maps: ' + error.message, 'error');
      return false;
    }
  },

  /**
   * 📋 EXPORTAR LISTA DE TAREAS
   * Genera un checklist descargable
   */
  exportToChecklist(trip) {
    try {
      console.log('📋 Generando checklist...', trip);

      const { info, itinerary } = trip;
      let markdown = `# ✅ Checklist - ${info.name}\n\n`;
      markdown += `**Fechas:** ${window.TimeUtils.formatDate(info.dateStart)} - ${window.TimeUtils.formatDate(info.dateEnd)}\n\n`;
      markdown += `---\n\n`;

      (itinerary?.days || []).forEach((day, idx) => {
        markdown += `## 📅 Día ${idx + 1} - ${day.city}\n\n`;

        (day.activities || []).forEach(activity => {
          markdown += `- [ ] ${activity.time || ''} **${activity.name}**\n`;
          markdown += `  - 📍 ${activity.area || activity.address || 'N/A'}\n`;
          if (activity.cost) markdown += `  - 💰 ¥${activity.cost.toLocaleString()}\n`;
          if (activity.description) markdown += `  - ℹ️ ${activity.description}\n`;
          markdown += `\n`;
        });

        markdown += `\n`;
      });

      markdown += `---\n\n`;
      markdown += `## 📦 Preparación del Viaje\n\n`;
      markdown += `- [ ] Pasaporte vigente (min. 6 meses)\n`;
      markdown += `- [ ] Reservas de hoteles confirmadas\n`;
      markdown += `- [ ] JR Pass comprado (si aplica)\n`;
      markdown += `- [ ] Seguro de viaje contratado\n`;
      markdown += `- [ ] Pocket WiFi o SIM card reservada\n`;
      markdown += `- [ ] Adaptador de corriente (tipo A/B)\n`;
      markdown += `- [ ] App de traducción descargada\n`;
      markdown += `- [ ] Itinerario impreso/descargado offline\n\n`;

      // Descargar como archivo .md
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${info.name.replace(/\s+/g, '_')}_Checklist.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.Notifications?.show('✅ Checklist descargado', 'success');

      // Nota: el contador 'exportFormats' se retiró — ver DEPRECATION_LOG.md.

      return true;

    } catch (error) {
      console.error('❌ Error generando checklist:', error);
      window.Notifications?.show('❌ Error generando checklist: ' + error.message, 'error');
      return false;
    }
  },

  /**
   * HELPERS
   */

  formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  },

  escapeICS(str) {
    return str.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  },

  async loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
};

// Exportar globalmente
window.ExportManager = ExportManager;

console.log('✅ Export Manager cargado');

export default ExportManager;
