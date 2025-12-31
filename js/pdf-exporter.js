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

      // 🔥 ORDEN DE BÚSQUEDA MEJORADO - Buscar itinerario desde múltiples fuentes
      let itinerary = null;

      // 1️⃣ PRIORIDAD 1: TripsManager.currentTrip (la fuente principal en la app)
      if (window.TripsManager?.currentTrip) {
        const trip = window.TripsManager.currentTrip;

        // El itinerario puede estar directamente en el trip o en trip.itinerary
        if (trip.days && Array.isArray(trip.days)) {
          itinerary = trip; // El trip ES el itinerario
          console.log('✅ Itinerario encontrado en TripsManager.currentTrip (directo)');
        } else if (trip.itinerary && trip.itinerary.days) {
          itinerary = trip.itinerary; // El itinerario está anidado
          console.log('✅ Itinerario encontrado en TripsManager.currentTrip.itinerary');
        }
      }

      // 2️⃣ FALLBACK 2: ItineraryHandler.currentItinerary (legacy)
      if (!itinerary && window.ItineraryHandler?.currentItinerary) {
        itinerary = window.ItineraryHandler.currentItinerary;
        console.log('✅ Itinerario encontrado en ItineraryHandler.currentItinerary');
      }

      // 3️⃣ FALLBACK 3: Variable global currentItinerary (si existe)
      if (!itinerary && window.currentItinerary) {
        itinerary = window.currentItinerary;
        console.log('✅ Itinerario encontrado en window.currentItinerary');
      }

      console.log('📄 DEBUG PDF Export:', {
        hasTripsManager: !!window.TripsManager,
        currentTrip: window.TripsManager?.currentTrip,
        hasItineraryHandler: !!window.ItineraryHandler,
        itineraryFound: !!itinerary,
        itinerary: itinerary
      });

      if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
        throw new Error('No hay itinerario para exportar.\n\nPor favor:\n1. Crea un itinerario desde "Crear Itinerario"\n2. O carga un viaje existente\n3. Asegúrate de que tenga al menos un día con actividades');
      }

      console.log('📄 Generando PDF del itinerario con', itinerary.days.length, 'días...');

      // Crear documento PDF
      const doc = new jsPDF();

      let yPos = 20;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;

      // === HEADER ===
      doc.setFontSize(22);
      doc.setTextColor(147, 51, 234); // Purple
      doc.text('VIAJE A JAPON - ITINERARIO', margin, yPos);

      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);

      // Información del viaje
      const firstDay = itinerary.days[0];
      const lastDay = itinerary.days[itinerary.days.length - 1];
      const tripInfo = `${firstDay.date} al ${lastDay.date} - ${itinerary.days.length} dias`;

      doc.text(tripInfo, margin, yPos);
      yPos += 5;

      // 🆕 Agregar QR code en la primera página (link a la app)
      try {
        const appURL = window.location.origin || 'https://japan-itin-dev.web.app';
        const mainQR = await this.generateQRCode(appURL, 150);

        if (mainQR) {
          const qrSize = 30; // Tamaño en mm
          const qrX = pageWidth - margin - qrSize;
          const qrY = 15;

          doc.addImage(mainQR, 'PNG', qrX, qrY, qrSize, qrSize);

          // Texto explicativo
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          doc.text('Escanea para', qrX + qrSize/2, qrY + qrSize + 3, { align: 'center' });
          doc.text('abrir en app', qrX + qrSize/2, qrY + qrSize + 6, { align: 'center' });
          doc.setTextColor(0, 0, 0);
        }
      } catch (error) {
        console.warn('⚠️ Error generando QR principal:', error);
      }

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

        // 🆕 Generar QR code para el día (con la primera actividad que tenga coordenadas)
        const dayStartYPos = yPos; // Guardar posición del inicio del día para el QR

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
            const rawTitle = activity.title || activity.activity || activity.name || 'Sin título';
            const title = this.removeEmojis(rawTitle);
            const rawLocation = activity.location || '';
            const location = this.removeEmojis(rawLocation);
            const categoryLabel = this.getCategoryLabel(activity.category);

            // Actividad
            doc.setFont(undefined, 'bold');
            doc.text(`[${time}]`, margin + 5, yPos);

            doc.setFont(undefined, 'normal');
            const activityText = `${title}`;
            doc.text(activityText, margin + 25, yPos);
            yPos += 5;

            // Categoría
            if (categoryLabel) {
              doc.setTextColor(100, 100, 100);
              doc.setFontSize(7);
              doc.text(`(${categoryLabel})`, margin + 25, yPos);
              yPos += 3;
              doc.setFontSize(9);
              doc.setTextColor(0, 0, 0);
            }

            // Ubicación
            if (location) {
              doc.setTextColor(120, 120, 120);
              doc.setFontSize(8);
              doc.text(`Ubicacion: ${location}`, margin + 25, yPos);
              doc.setFontSize(9);
              doc.setTextColor(0, 0, 0);
              yPos += 4;
            }

            // Notas
            if (activity.notes) {
              doc.setTextColor(100, 100, 100);
              doc.setFontSize(8);
              // Remover emojis de las notas para evitar caracteres extraños
              const cleanNotes = this.removeEmojis(activity.notes);
              const notes = cleanNotes.substring(0, 80) + (cleanNotes.length > 80 ? '...' : '');
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

        // 🆕 Agregar QR code para el día (si hay actividades con coordenadas)
        if (day.activities && day.activities.length > 0) {
          const activityWithCoords = day.activities.find(a => a.coordinates);
          if (activityWithCoords) {
            try {
              const mapsURL = this.getGoogleMapsURL(activityWithCoords);
              const qrImage = await this.generateQRCode(mapsURL, 120);

              if (qrImage) {
                // Posicionar QR en la esquina superior derecha del día
                const qrSize = 25; // Tamaño en mm
                const qrX = pageWidth - margin - qrSize - 5;
                const qrY = dayStartYPos - 5;

                doc.addImage(qrImage, 'PNG', qrX, qrY, qrSize, qrSize);

                // Texto explicativo debajo del QR
                doc.setFontSize(7);
                doc.setTextColor(100, 100, 100);
                const qrText = 'Escanea para';
                const qrText2 = 'ver en Maps';
                doc.text(qrText, qrX + qrSize/2, qrY + qrSize + 3, { align: 'center' });
                doc.text(qrText2, qrX + qrSize/2, qrY + qrSize + 6, { align: 'center' });
                doc.setTextColor(0, 0, 0);
              }
            } catch (error) {
              console.warn('⚠️ Error generando QR para día', day.day, error);
            }
          }
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

      // Mostrar notificación de error con más detalle
      if (window.Notifications) {
        if (error.message.includes('No hay itinerario')) {
          window.Notifications.error(
            `📄 No se puede exportar PDF\n\n${error.message}`,
            8000
          );
        } else if (error.message.includes('jsPDF')) {
          window.Notifications.error(
            '📄 Error: Librería de PDF no cargada.\n\nPor favor recarga la página.',
            5000
          );
        } else {
          window.Notifications.error(
            `📄 Error al generar PDF:\n${error.message}`,
            5000
          );
        }
      } else {
        // Fallback si no hay sistema de notificaciones
        alert(`Error al generar PDF:\n\n${error.message}`);
      }

      return false;
    }
  },

  /**
   * Obtener emoji según categoría (DEPRECADO - usar getCategoryLabel para PDF)
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
  },

  /**
   * Obtener label de texto según categoría (para PDF sin emojis)
   */
  getCategoryLabel(category) {
    const labels = {
      transport: 'Transporte',
      food: 'Comida',
      shopping: 'Compras',
      culture: 'Cultura',
      nature: 'Naturaleza',
      entertainment: 'Entretenimiento',
      sightseeing: 'Turismo',
      hotel: 'Hotel',
      nightlife: 'Vida Nocturna',
      other: 'Otro'
    };

    return labels[category] || '';
  },

  /**
   * Remover emojis y caracteres especiales del texto
   */
  removeEmojis(text) {
    if (!text) return '';

    // Regex para remover emojis y caracteres especiales
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Extended symbols
      .replace(/¡/g, '')                       // Exclamación invertida
      .replace(/•/g, '-')                      // Bullet point
      .trim();
  },

  /**
   * 🆕 Genera un código QR y lo retorna como imagen base64
   * @param {string} data - Data para codificar en el QR
   * @param {number} size - Tamaño del QR en píxeles (default: 150)
   * @returns {Promise<string>} URL de la imagen en base64
   */
  async generateQRCode(data, size = 150) {
    try {
      // Usar API pública de QR code (qrserver.com)
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;

      // Fetch la imagen
      const response = await fetch(url);
      const blob = await response.blob();

      // Convertir blob a base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error generando QR code:', error);
      return null;
    }
  },

  /**
   * 🆕 Genera Google Maps URL para una actividad
   * @param {object} activity - Actividad con coordenadas o nombre
   * @returns {string} URL de Google Maps
   */
  getGoogleMapsURL(activity) {
    if (activity.coordinates && activity.coordinates.lat && activity.coordinates.lng) {
      // Si hay coordenadas, usarlas directamente
      return `https://www.google.com/maps?q=${activity.coordinates.lat},${activity.coordinates.lng}`;
    } else if (activity.location) {
      // Si solo hay nombre de ubicación, buscar
      const query = encodeURIComponent(`${activity.location}, Japan`);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    } else if (activity.name || activity.title || activity.activity) {
      // Usar el nombre de la actividad
      const name = activity.name || activity.title || activity.activity;
      const query = encodeURIComponent(`${name}, Japan`);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    // Fallback: buscar "Japan"
    return 'https://www.google.com/maps/@35.6762,139.6503,12z';
  }
};

// Exportar globalmente
window.PDFExporter = PDFExporter;

console.log('✅ PDF Exporter module loaded');

export default PDFExporter;
