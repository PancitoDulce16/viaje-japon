// js/maps-helper.js - Helper para integración con Google Maps

/**
 * 🗺️ Maps Helper
 * Utilidades para integración con Google Maps
 */
export const MapsHelper = {

  /**
   * Generar URL de Google Maps para una ubicación
   */
  getGoogleMapsUrl(coordinates, placeName = '') {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      // Si no hay coordenadas, buscar por nombre
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`;
    }

    // URL con coordenadas exactas
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
  },

  /**
   * Generar URL de direcciones (de A a B)
   */
  getDirectionsUrl(origin, destination) {
    let originParam = '';
    let destParam = '';

    // Origin
    if (origin.coordinates) {
      originParam = `${origin.coordinates.lat},${origin.coordinates.lng}`;
    } else {
      originParam = encodeURIComponent(origin.name || 'Current Location');
    }

    // Destination
    if (destination.coordinates) {
      destParam = `${destination.coordinates.lat},${destination.coordinates.lng}`;
    } else {
      destParam = encodeURIComponent(destination.name);
    }

    return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=transit`;
  },

  /**
   * Calcular distancia aproximada entre dos puntos (Haversine)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // en km
  },

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  },

  /**
   * Formatear distancia para mostrar
   */
  formatDistance(km) {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  },

  /**
   * Estimar tiempo de viaje (muy aproximado)
   */
  estimateTravelTime(km) {
    // Asumiendo transporte público en Japón
    // ~30 km/h promedio incluyendo esperas
    const hours = km / 30;
    const minutes = Math.round(hours * 60);

    if (minutes < 60) {
      return `~${minutes} min`;
    }

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `~${hrs}h ${mins}min`;
  },

  /**
   * Crear HTML para botón de Google Maps
   */
  createMapsButton(attraction) {
    const url = this.getGoogleMapsUrl(attraction.coordinates, attraction.name);

    return `
      <a
        href="${url}"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        title="Abrir en Google Maps"
      >
        <span>🗺️</span>
        <span>Ver en Maps</span>
      </a>
    `;
  },

  /**
   * Crear HTML para botón de direcciones
   */
  createDirectionsButton(from, to) {
    const url = this.getDirectionsUrl(from, to);

    return `
      <a
        href="${url}"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        title="Cómo llegar"
      >
        <span>🧭</span>
        <span>Cómo llegar</span>
      </a>
    `;
  },

  /**
   * Crear HTML para información de transporte
   */
  createTransportInfo(attraction) {
    if (!attraction.nearestStation && !attraction.transportLines) {
      return '';
    }

    let html = '<div class="transport-info mt-2 text-sm">';

    if (attraction.nearestStation) {
      html += `
        <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span>🚉</span>
          <span class="font-medium">${attraction.nearestStation}</span>
        </div>
      `;
    }

    if (attraction.transportLines && attraction.transportLines.length > 0) {
      html += `
        <div class="flex items-start gap-2 mt-1 text-gray-600 dark:text-gray-400 text-xs">
          <span>🚇</span>
          <span>${attraction.transportLines.join(' • ')}</span>
        </div>
      `;
    }

    html += '</div>';
    return html;
  },

  /**
   * Crear HTML para horarios
   */
  createHoursInfo(attraction) {
    if (!attraction.hours) {
      return '';
    }

    return `
      <div class="hours-info mt-2 text-sm">
        <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span>🕐</span>
          <span>${attraction.hours}</span>
        </div>
      </div>
    `;
  },

  /**
   * Obtener ubicación actual del usuario
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            name: 'Tu ubicación actual'
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  },

  /**
   * Calcular distancia desde ubicación actual
   */
  async getDistanceFromCurrent(attraction) {
    try {
      if (!attraction.coordinates) {
        return null;
      }

      const current = await this.getCurrentLocation();
      const distance = this.calculateDistance(
        current.coordinates.lat,
        current.coordinates.lng,
        attraction.coordinates.lat,
        attraction.coordinates.lng
      );

      return {
        distance,
        formatted: this.formatDistance(distance),
        travelTime: this.estimateTravelTime(distance)
      };
    } catch (error) {
      console.log('No se pudo obtener ubicación actual:', error);
      return null;
    }
  }
};

// Exponer globalmente
window.MapsHelper = MapsHelper;

console.log('🗺️ Maps Helper module loaded');

export default MapsHelper;
