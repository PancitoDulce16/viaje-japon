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
    try {
      console.log('📄 Generando PDF...', trip);

      // Crear contenido HTML para el PDF
      const htmlContent = this.generatePDFHTML(trip);

      // Usar html2pdf.js para generar el PDF
      const opt = {
        margin: 10,
        filename: `Itinerario_${trip.info.name}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Verificar si html2pdf está disponible
      if (typeof html2pdf === 'undefined') {
        // Cargar html2pdf dinámicamente
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
      }

      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      element.style.padding = '20px';

      await html2pdf().set(opt).from(element).save();

      window.Notifications?.show('✅ PDF generado exitosamente', 'success');

      // 🏆 Tracking de gamificación
      if (window.GamificationSystem) {
        await window.GamificationSystem.trackAction('exportFormats', 1);
      }

      return true;

    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      window.Notifications?.show('❌ Error generando PDF: ' + error.message, 'error');
      return false;
    }
  },

  /**
   * Genera HTML formateado para el PDF
   */
  generatePDFHTML(trip) {
    const { info, itinerary } = trip;

    let html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
          <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">🗾 ${info.name}</h1>
          <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">
            ${window.TimeUtils.formatDate(info.dateStart, { year: 'numeric', month: 'long', day: 'numeric' })} -
            ${window.TimeUtils.formatDate(info.dateEnd, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">
            ${trip.cities?.join(' → ') || 'Multi-ciudad'} • ${itinerary?.days?.length || 0} días
          </p>
        </div>

        <!-- Itinerario por días -->
        ${(itinerary?.days || []).map((day, idx) => `
          <div style="page-break-inside: avoid; margin-bottom: 25px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 15px; border-radius: 8px; margin-bottom: 15px;">
              <h2 style="margin: 0; font-size: 18px;">
                📅 Día ${idx + 1} - ${day.city || 'Japón'}
              </h2>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">
                ${day.description || ''}
              </p>
            </div>

            <!-- Actividades del día -->
            ${(day.activities || []).map((act, actIdx) => `
              <div style="margin-left: 15px; margin-bottom: 15px; border-left: 3px solid #e5e7eb; padding-left: 15px;">
                <div style="display: flex; align-items: start; gap: 10px;">
                  <span style="background: #3b82f6; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">
                    ${actIdx + 1}
                  </span>
                  <div style="flex: 1;">
                    <h3 style="margin: 0 0 5px 0; color: #1f2937; font-size: 15px;">
                      ${act.time || ''} - ${act.name || 'Actividad'}
                    </h3>
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      📍 ${act.area || act.address || 'Ubicación no especificada'}
                    </p>
                    ${act.description ? `
                      <p style="margin: 8px 0 0 0; color: #4b5563; font-size: 12px; line-height: 1.5;">
                        ${act.description}
                      </p>
                    ` : ''}
                    ${act.cost ? `
                      <p style="margin: 5px 0 0 0; color: #059669; font-size: 12px; font-weight: bold;">
                        💰 ¥${act.cost.toLocaleString()}
                      </p>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}

            <!-- Presupuesto del día -->
            ${day.budget ? `
              <div style="background: #f3f4f6; padding: 10px 15px; border-radius: 6px; margin-top: 10px;">
                <p style="margin: 0; font-size: 12px; color: #4b5563;">
                  <strong>Presupuesto del día:</strong> ¥${day.budget.total?.toLocaleString() || 0}
                  (Actividades: ¥${day.budget.activities || 0}, Comidas: ¥${day.budget.meals || 0}, Transporte: ¥${day.budget.transport || 0})
                </p>
              </div>
            ` : ''}
          </div>
        `).join('')}

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 11px;">
          <p style="margin: 0;">🤖 Generado con Japan Itinerary Planner</p>
          <p style="margin: 5px 0 0 0;">${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    `;

    return html;
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

      // 🏆 Tracking de gamificación
      if (window.GamificationSystem) {
        window.GamificationSystem.trackAction('exportFormats', 1);
      }

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

      // 🏆 Tracking de gamificación
      if (window.GamificationSystem) {
        window.GamificationSystem.trackAction('exportFormats', 1);
      }

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

      // 🏆 Tracking de gamificación
      if (window.GamificationSystem) {
        window.GamificationSystem.trackAction('exportFormats', 1);
      }

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
