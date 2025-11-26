// js/pdf-exporter.js - Exportar itinerario a PDF

export const PDFExporter = {

  /**
   * Exportar itinerario actual a PDF
   */
  async exportToPDF() {
    try {
      // Verificar que jsPDF esté cargado
      if (typeof window.jspdf === 'undefined') {
        throw new Error('jsPDF library not loaded');
      }

      const { jsPDF } = window.jspdf;

      // Obtener itinerario actual
      const itinerary = window.ItineraryHandler?.currentItinerary;

      if (!itinerary || !itinerary.days) {
        throw new Error('No hay itinerario para exportar');
      }

      console.log('📄 Generando PDF del itinerario...');

      // Crear documento PDF
      const doc = new jsPDF();

      let yPos = 20;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;

      // === HEADER ===
      doc.setFontSize(22);
      doc.setTextColor(147, 51, 234); // Purple
      doc.text('🇯🇵 Viaje a Japón - Itinerario', margin, yPos);

      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);

      // Información del viaje
      const firstDay = itinerary.days[0];
      const lastDay = itinerary.days[itinerary.days.length - 1];
      const tripInfo = `${firstDay.date} al ${lastDay.date} • ${itinerary.days.length} días`;

      doc.text(tripInfo, margin, yPos);
      yPos += 5;

      // Línea divisoria
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // === RESUMEN ===
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Resumen del Viaje', margin, yPos);
      yPos += 7;

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);

      // Contar ciudades
      const cities = [...new Set(itinerary.days.map(d => d.city))];
      const citiesText = `Ciudades: ${cities.join(', ')}`;
      doc.text(citiesText, margin + 5, yPos);
      yPos += 5;

      const activitiesCount = itinerary.days.reduce((sum, d) => sum + (d.activities?.length || 0), 0);
      doc.text(`Total de actividades: ${activitiesCount}`, margin + 5, yPos);
      yPos += 10;

      // === ITINERARIO DÍA POR DÍA ===
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Itinerario Detallado', margin, yPos);
      yPos += 10;

      // Iterar por cada día
      for (const day of itinerary.days) {
        // Verificar si necesitamos nueva página
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // Header del día
        doc.setFillColor(147, 51, 234);
        doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 10, 'F');

        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text(`Día ${day.day} - ${day.date} - ${day.city}`, margin + 3, yPos + 2);
        yPos += 8;

        // Actividades del día
        if (day.activities && day.activities.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);

          for (const activity of day.activities) {
            // Verificar espacio
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }

            const time = activity.time || '--:--';
            const title = activity.title || activity.activity || activity.name || 'Sin título';
            const location = activity.location || '';
            const emoji = this.getCategoryEmoji(activity.category);

            // Actividad
            doc.setFont(undefined, 'bold');
            doc.text(`${emoji} ${time}`, margin + 5, yPos);

            doc.setFont(undefined, 'normal');
            const activityText = `${title}`;
            doc.text(activityText, margin + 25, yPos);
            yPos += 5;

            // Ubicación
            if (location) {
              doc.setTextColor(120, 120, 120);
              doc.setFontSize(8);
              doc.text(`📍 ${location}`, margin + 25, yPos);
              doc.setFontSize(9);
              doc.setTextColor(0, 0, 0);
              yPos += 4;
            }

            // Notas
            if (activity.notes) {
              doc.setTextColor(100, 100, 100);
              doc.setFontSize(8);
              const notes = activity.notes.substring(0, 80) + (activity.notes.length > 80 ? '...' : '');
              const splitNotes = doc.splitTextToSize(notes, pageWidth - margin * 2 - 30);
              doc.text(splitNotes, margin + 25, yPos);
              yPos += splitNotes.length * 4;
              doc.setFontSize(9);
              doc.setTextColor(0, 0, 0);
            }

            yPos += 2;
          }
        } else {
          doc.setTextColor(150, 150, 150);
          doc.text('  Sin actividades programadas', margin + 5, yPos);
          yPos += 5;
        }

        yPos += 5;

        // Línea divisoria entre días
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
      }

      // === FOOTER EN ÚLTIMA PÁGINA ===
      const totalPages = doc.internal.pages.length - 1;

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);

        const footerText = `Página ${i} de ${totalPages}`;
        const footerWidth = doc.getTextWidth(footerText);
        doc.text(footerText, pageWidth - margin - footerWidth, doc.internal.pageSize.height - 10);

        doc.text('Generado con Japan Itin App', margin, doc.internal.pageSize.height - 10);
      }

      // Guardar PDF
      const fileName = `Itinerario_Japon_${firstDay.date}_${lastDay.date}.pdf`;
      doc.save(fileName);

      console.log('✅ PDF generado:', fileName);

      // Mostrar notificación
      if (window.Notifications) {
        window.Notifications.success(`PDF descargado: ${fileName}`, 5000);
      }

      return true;

    } catch (error) {
      console.error('❌ Error generando PDF:', error);

      if (window.Notifications) {
        window.Notifications.error(`Error al generar PDF: ${error.message}`);
      }

      return false;
    }
  },

  /**
   * Obtener emoji según categoría
   */
  getCategoryEmoji(category) {
    const emojis = {
      transport: '🚄',
      food: '🍜',
      shopping: '🛍️',
      culture: '⛩️',
      nature: '🌳',
      entertainment: '🎮',
      sightseeing: '👀',
      hotel: '🏨',
      nightlife: '🌃',
      other: '📌'
    };

    return emojis[category] || '📌';
  }
};

// Exportar globalmente
window.PDFExporter = PDFExporter;

console.log('✅ PDF Exporter module loaded');

export default PDFExporter;
