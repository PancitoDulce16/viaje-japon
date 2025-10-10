// js/apis-integration.js - Integración de APIs Externas

const API_KEYS = {
  aviationStack: '4374cea236b04a5bf7e6d0c7d2cbf676',
  liteAPI: '1757d988-56b3-4b5a-9618-c7b5053ac3aa',
  geoapify: '4ed258337c3d4edb94841d6001273ad7',
  foursquare: 'MDWP4CPLGUO1AUSDLDCWC3JHWYTWGWEJ5UXIPT3Q5DLI0EKO'
};

export const APIsIntegration = {
  
  // === AVIATION STACK API (Información de Vuelos) === //
  
  async searchFlights(flightNumber) {
    try {
      const response = await fetch(
        `http://api.aviationstack.com/v1/flights?access_key=${API_KEYS.aviationStack}&flight_iata=${flightNumber}`
      );
      
      if (!response.ok) {
        throw new Error('Error buscando vuelo');
      }
      
      const data = await response.json();
      console.log('✈️ Información de vuelo:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en Aviation Stack:', error);
      return null;
    }
  },
  
  async getFlightStatus(flightNumber, date) {
    try {
      const response = await fetch(
        `http://api.aviationstack.com/v1/flights?access_key=${API_KEYS.aviationStack}&flight_iata=${flightNumber}&flight_date=${date}`
      );
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo estado del vuelo:', error);
      return null;
    }
  },
  
  // === LITE API (Hoteles) === //
  
  async searchHotels(cityCode, checkIn, checkOut, guests = 2) {
    try {
      const url = new URL('https://api.liteapi.travel/v3.0/data/hotels');
      url.searchParams.append('cityCode', cityCode);
      url.searchParams.append('checkIn', checkIn);
      url.searchParams.append('checkOut', checkOut);
      url.searchParams.append('guests', guests);
      
      const response = await fetch(url, {
        headers: {
          'X-API-Key': API_KEYS.liteAPI
        }
      });
      
      if (!response.ok) {
        throw new Error('Error buscando hoteles');
      }
      
      const data = await response.json();
      console.log('🏨 Hoteles encontrados:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en Lite API:', error);
      return null;
    }
  },
  
  async getHotelDetails(hotelId) {
    try {
      const response = await fetch(
        `https://api.liteapi.travel/v3.0/data/hotel?hotelId=${hotelId}`,
        {
          headers: {
            'X-API-Key': API_KEYS.liteAPI
          }
        }
      );
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo detalles del hotel:', error);
      return null;
    }
  },
  
  async getHotelReviews(hotelId) {
    try {
      const response = await fetch(
        `https://api.liteapi.travel/v3.0/data/reviews?hotelId=${hotelId}`,
        {
          headers: {
            'X-API-Key': API_KEYS.liteAPI
          }
        }
      );
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo reviews del hotel:', error);
      return null;
    }
  },
  
  // === GEOAPIFY (Mapas y Lugares) === //
  
  async searchPlaces(query, location, radius = 5000) {
    try {
      const url = new URL('https://api.geoapify.com/v2/places');
      url.searchParams.append('text', query);
      url.searchParams.append('filter', `circle:${location.lng},${location.lat},${radius}`);
      url.searchParams.append('apiKey', API_KEYS.geoapify);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error buscando lugares');
      }
      
      const data = await response.json();
      console.log('📍 Lugares encontrados:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en Geoapify:', error);
      return null;
    }
  },
  
  async getPlaceDetails(placeId) {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${API_KEYS.geoapify}`
      );
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo detalles del lugar:', error);
      return null;
    }
  },
  
  async getRoute(start, end, mode = 'drive') {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${start.lat},${start.lng}|${end.lat},${end.lng}&mode=${mode}&apiKey=${API_KEYS.geoapify}`
      );
      
      const data = await response.json();
      console.log('🗺️ Ruta calculada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error calculando ruta:', error);
      return null;
    }
  },
  
  // === FOURSQUARE (Lugares y Restaurantes) === //
  
  async searchVenues(query, location, radius = 5000) {
    try {
      const url = new URL('https://api.foursquare.com/v3/places/search');
      url.searchParams.append('query', query);
      url.searchParams.append('ll', `${location.lat},${location.lng}`);
      url.searchParams.append('radius', radius);
      url.searchParams.append('limit', 20);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': API_KEYS.foursquare,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error buscando venues');
      }
      
      const data = await response.json();
      console.log('🍽️ Venues encontrados:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en Foursquare:', error);
      return null;
    }
  },
  
  async getVenueDetails(venueId) {
    try {
      const response = await fetch(
        `https://api.foursquare.com/v3/places/${venueId}`,
        {
          headers: {
            'Authorization': API_KEYS.foursquare,
            'Accept': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo detalles del venue:', error);
      return null;
    }
  },
  
  async getVenuePhotos(venueId) {
    try {
      const response = await fetch(
        `https://api.foursquare.com/v3/places/${venueId}/photos`,
        {
          headers: {
            'Authorization': API_KEYS.foursquare,
            'Accept': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo fotos del venue:', error);
      return null;
    }
  },
  
  // === FUNCIONES HELPER === //
  
  async enrichActivity(activity, location) {
    // Enriquecer una actividad con información de Foursquare
    try {
      const venues = await this.searchVenues(activity.name, location);
      
      if (venues && venues.results && venues.results.length > 0) {
        const venue = venues.results[0];
        
        return {
          ...activity,
          foursquareId: venue.fsq_id,
          address: venue.location?.formatted_address,
          categories: venue.categories,
          rating: venue.rating,
          photos: venue.photos,
          price: venue.price,
          hours: venue.hours
        };
      }
      
      return activity;
    } catch (error) {
      console.error('Error enriqueciendo actividad:', error);
      return activity;
    }
  },
  
  async findNearbyRestaurants(location, radius = 1000) {
    try {
      const url = new URL('https://api.foursquare.com/v3/places/search');
      url.searchParams.append('categories', '13000'); // Restaurantes
      url.searchParams.append('ll', `${location.lat},${location.lng}`);
      url.searchParams.append('radius', radius);
      url.searchParams.append('limit', 10);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': API_KEYS.foursquare,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error buscando restaurantes:', error);
      return null;
    }
  },
  
  async findNearbyAttractions(location, radius = 2000) {
    try {
      const url = new URL('https://api.foursquare.com/v3/places/search');
      url.searchParams.append('categories', '16000,10000'); // Arts & Entertainment, Landmarks
      url.searchParams.append('ll', `${location.lat},${location.lng}`);
      url.searchParams.append('radius', radius);
      url.searchParams.append('limit', 10);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': API_KEYS.foursquare,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error buscando atracciones:', error);
      return null;
    }
  }
};

// Exportar para uso global
window.APIsIntegration = APIsIntegration;
