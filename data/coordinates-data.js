// data/coordinates-data.js - Coordenadas GPS, transporte y horarios
// Este archivo complementa attractions-data.js con información práctica

export const ATTRACTION_COORDINATES = {
  // === TOKYO - PRINCIPALES ===
  "Shibuya Crossing": {
    coordinates: { lat: 35.6595, lng: 139.7004 },
    nearestStation: "Shibuya Station",
    transportLines: ["JR Yamanote Line", "Tokyo Metro Ginza Line", "Tokyo Metro Hanzomon Line"],
    hours: "24/7 (mejor en hora pico 18:00-20:00)"
  },

  "Tokyo Skytree": {
    coordinates: { lat: 35.7101, lng: 139.8107 },
    nearestStation: "Tokyo Skytree Station",
    transportLines: ["Tobu Skytree Line"],
    hours: "10:00-21:00 (último ingreso 20:00)"
  },

  "Meiji Shrine": {
    coordinates: { lat: 35.6764, lng: 139.6993 },
    nearestStation: "Harajuku Station (JR) / Meijijingumae Station (Metro)",
    transportLines: ["JR Yamanote Line", "Tokyo Metro Chiyoda Line"],
    hours: "Amanecer - Atardecer (varía por temporada)"
  },

  "Sensoji Temple": {
    coordinates: { lat: 35.7148, lng: 139.7967 },
    nearestStation: "Asakusa Station",
    transportLines: ["Tokyo Metro Ginza Line", "Toei Asakusa Line"],
    hours: "6:00-17:00 (templo), Nakamise 9:00-19:00"
  },

  "Takeshita Street": {
    coordinates: { lat: 35.6702, lng: 139.7063 },
    nearestStation: "Harajuku Station",
    transportLines: ["JR Yamanote Line"],
    hours: "11:00-20:00 (mayoría de tiendas)"
  },

  "Teamlab Borderless": {
    coordinates: { lat: 35.6248, lng: 139.7879 },
    nearestStation: "Aomi Station",
    transportLines: ["Yurikamome Line"],
    hours: "10:00-21:00 (cerrado martes)"
  },

  "Tsukiji Outer Market": {
    coordinates: { lat: 35.6654, lng: 139.7707 },
    nearestStation: "Tsukijishijo Station",
    transportLines: ["Toei Oedo Line"],
    hours: "5:00-14:00 (mejor 8:00-11:00)"
  },

  "Pokemon Center Shibuya": {
    coordinates: { lat: 35.6617, lng: 139.7006 },
    nearestStation: "Shibuya Station",
    transportLines: ["JR Yamanote Line"],
    hours: "10:00-21:00"
  },

  "Nintendo Store Tokyo": {
    coordinates: { lat: 35.6616, lng: 139.7007 },
    nearestStation: "Shibuya Station",
    transportLines: ["JR Yamanote Line"],
    hours: "11:00-21:00"
  },

  "Akihabara Electric Town": {
    coordinates: { lat: 35.6984, lng: 139.7731 },
    nearestStation: "Akihabara Station",
    transportLines: ["JR Yamanote Line", "Tokyo Metro Hibiya Line"],
    hours: "10:00-20:00 (varía por tienda)"
  },

  // === KYOTO - PRINCIPALES ===
  "Fushimi Inari Shrine": {
    coordinates: { lat: 34.9671, lng: 135.7727 },
    nearestStation: "Inari Station (JR) / Fushimi-Inari Station (Keihan)",
    transportLines: ["JR Nara Line", "Keihan Main Line"],
    hours: "24/7 (mejor amanecer o atardecer)"
  },

  "Kinkaku-ji (Golden Pavilion)": {
    coordinates: { lat: 35.0394, lng: 135.7292 },
    nearestStation: "Kinkakuji-michi Bus Stop",
    transportLines: ["Kyoto Bus 101, 102, 204, 205"],
    hours: "9:00-17:00"
  },

  "Arashiyama Bamboo Grove": {
    coordinates: { lat: 35.0170, lng: 135.6719 },
    nearestStation: "Arashiyama Station",
    transportLines: ["JR Sagano Line", "Keifuku Arashiyama Line"],
    hours: "24/7 (mejor temprano 7:00-8:00)"
  },

  "Kiyomizu-dera Temple": {
    coordinates: { lat: 34.9949, lng: 135.7851 },
    nearestStation: "Gojo Station (Keihan) + 20 min walk / Bus Kiyomizu-michi",
    transportLines: ["Keihan Main Line", "Kyoto Bus 100, 206"],
    hours: "6:00-18:00"
  },

  "Nishiki Market": {
    coordinates: { lat: 35.0050, lng: 135.7661 },
    nearestStation: "Karasuma Station / Shijo Station",
    transportLines: ["Kyoto Metro Karasuma Line", "Hankyu Kyoto Line"],
    hours: "10:00-18:00 (cerrado miércoles algunas tiendas)"
  },

  "Gion District": {
    coordinates: { lat: 35.0037, lng: 135.7752 },
    nearestStation: "Gion-Shijo Station",
    transportLines: ["Keihan Main Line"],
    hours: "24/7 (mejor al atardecer 17:00-19:00)"
  },

  // === OSAKA - PRINCIPALES ===
  "Dotonbori": {
    coordinates: { lat: 34.6686, lng: 135.5004 },
    nearestStation: "Namba Station",
    transportLines: ["Osaka Metro Midosuji Line", "Nankai Line"],
    hours: "24/7 (restaurantes 11:00-23:00)"
  },

  "Osaka Castle": {
    coordinates: { lat: 34.6873, lng: 135.5262 },
    nearestStation: "Osakajokoen Station",
    transportLines: ["JR Osaka Loop Line"],
    hours: "9:00-17:00 (parque 24/7)"
  },

  "Kuromon Market": {
    coordinates: { lat: 34.6662, lng: 135.5058 },
    nearestStation: "Nippombashi Station",
    transportLines: ["Osaka Metro Sennichimae Line"],
    hours: "9:00-18:00 (mayoría cierran 17:00)"
  },

  "Shinsekai": {
    coordinates: { lat: 34.6523, lng: 135.5063 },
    nearestStation: "Dobutsuen-mae Station",
    transportLines: ["Osaka Metro Midosuji Line"],
    hours: "24/7 (tiendas/restaurantes 10:00-23:00)"
  },

  "Universal Studios Japan": {
    coordinates: { lat: 34.6654, lng: 135.4326 },
    nearestStation: "Universal City Station",
    transportLines: ["JR Yumesaki Line"],
    hours: "Varía (9:00-20:00 típico, revisar calendario)"
  },

  // === NARA ===
  "Nara Park": {
    coordinates: { lat: 34.6851, lng: 135.8433 },
    nearestStation: "Kintetsu Nara Station",
    transportLines: ["Kintetsu Nara Line"],
    hours: "24/7 (templos 8:00-17:00)"
  },

  "Todai-ji Temple": {
    coordinates: { lat: 34.6889, lng: 135.8399 },
    nearestStation: "Kintetsu Nara Station (15 min walk)",
    transportLines: ["Kintetsu Nara Line"],
    hours: "7:30-17:30 (nov-mar hasta 17:00)"
  },

  // === HAKONE ===
  "Hakone Open-Air Museum": {
    coordinates: { lat: 35.2441, lng: 139.0469 },
    nearestStation: "Chokoku-no-Mori Station",
    transportLines: ["Hakone Tozan Railway"],
    hours: "9:00-17:00"
  },

  "Lake Ashi": {
    coordinates: { lat: 35.2036, lng: 139.0258 },
    nearestStation: "Hakone-machi Port / Moto-Hakone Port",
    transportLines: ["Hakone Tozan Bus"],
    hours: "Barcos 9:30-17:00"
  },

  // === HIROSHIMA ===
  "Hiroshima Peace Memorial Park": {
    coordinates: { lat: 34.3955, lng: 132.4536 },
    nearestStation: "Genbaku Dome-mae (tram)",
    transportLines: ["Hiroshima Tram Line 2, 6"],
    hours: "Parque 24/7, Museo 8:30-18:00 (mar-nov hasta 19:00)"
  },

  "Miyajima Island": {
    coordinates: { lat: 34.2958, lng: 132.3197 },
    nearestStation: "Miyajimaguchi Station + Ferry",
    transportLines: ["JR Sanyo Line + Ferry (10 min)"],
    hours: "Ferry 6:25-22:42, Itsukushima Shrine 6:30-18:00"
  },

  // === FUKUOKA ===
  "Canal City Hakata": {
    coordinates: { lat: 33.5904, lng: 130.4096 },
    nearestStation: "Gion Station (10 min walk)",
    transportLines: ["Fukuoka Subway Kuko Line"],
    hours: "10:00-21:00 (restaurantes hasta 23:00)"
  },

  "Dazaifu Tenmangu Shrine": {
    coordinates: { lat: 33.5213, lng: 130.5233 },
    nearestStation: "Dazaifu Station",
    transportLines: ["Nishitetsu Dazaifu Line"],
    hours: "6:00-19:00 (invierno hasta 18:30)"
  }
};

// Helper para obtener info de una atracción por nombre
export function getAttractionInfo(attractionName) {
  return ATTRACTION_COORDINATES[attractionName] || null;
}

// Helper para agregar info a una atracción
export function enrichAttraction(attraction) {
  const info = ATTRACTION_COORDINATES[attraction.name];
  if (info) {
    return {
      ...attraction,
      ...info
    };
  }
  return attraction;
}

console.log('📍 Coordinates data loaded:', Object.keys(ATTRACTION_COORDINATES).length, 'locations');
