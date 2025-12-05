/* ========================================
   SURVIVAL GUIDE - Frases Esenciales
   Guía de supervivencia en Japón
   ======================================== */

const FRASES_ESENCIALES = {
  basicas: {
    nombre: "Frases Básicas",
    icono: "👋",
    frases: [
      { japones: "こんにちは", romaji: "Konnichiwa", espanol: "Hola (día)", audio: "konnichiwa" },
      { japones: "ありがとうございます", romaji: "Arigatou gozaimasu", espanol: "Muchas gracias", audio: "arigatou" },
      { japones: "すみません", romaji: "Sumimasen", espanol: "Disculpe / Perdón", audio: "sumimasen" },
      { japones: "はい / いいえ", romaji: "Hai / Iie", espanol: "Sí / No", audio: "hai-iie" },
      { japones: "おはようございます", romaji: "Ohayou gozaimasu", espanol: "Buenos días", audio: "ohayou" },
      { japones: "こんばんは", romaji: "Konbanwa", espanol: "Buenas noches (saludo)", audio: "konbanwa" },
      { japones: "おやすみなさい", romaji: "Oyasuminasai", espanol: "Buenas noches (despedida)", audio: "oyasumi" },
      { japones: "さようなら", romaji: "Sayounara", espanol: "Adiós", audio: "sayounara" }
    ]
  },

  restaurante: {
    nombre: "En el Restaurante",
    icono: "🍜",
    frases: [
      { japones: "いただきます", romaji: "Itadakimasu", espanol: "Antes de comer (dar gracias)", audio: "itadakimasu" },
      { japones: "ごちそうさまでした", romaji: "Gochisousama deshita", espanol: "Después de comer (gracias)", audio: "gochisousama" },
      { japones: "お水をください", romaji: "Omizu wo kudasai", espanol: "Agua por favor", audio: "omizu" },
      { japones: "お会計お願いします", romaji: "Okaikei onegaishimasu", espanol: "La cuenta por favor", audio: "okaikei" },
      { japones: "美味しい！", romaji: "Oishii!", espanol: "¡Está delicioso!", audio: "oishii" },
      { japones: "これをください", romaji: "Kore wo kudasai", espanol: "Esto por favor (señalando)", audio: "kore" },
      { japones: "ベジタリアンです", romaji: "Bejitarian desu", espanol: "Soy vegetariano/a", audio: "vegetarian" },
      { japones: "アレルギーがあります", romaji: "Arerugii ga arimasu", espanol: "Tengo alergias", audio: "allergy" }
    ]
  },

  compras: {
    nombre: "Compras",
    icono: "🛍️",
    frases: [
      { japones: "いくらですか？", romaji: "Ikura desu ka?", espanol: "¿Cuánto cuesta?", audio: "ikura" },
      { japones: "これをください", romaji: "Kore wo kudasai", espanol: "Esto por favor", audio: "kore-kudasai" },
      { japones: "見ているだけです", romaji: "Mite iru dake desu", espanol: "Solo estoy mirando", audio: "mite" },
      { japones: "高い", romaji: "Takai", espanol: "Es caro", audio: "takai" },
      { japones: "安い", romaji: "Yasui", espanol: "Es barato", audio: "yasui" },
      { japones: "袋をください", romaji: "Fukuro wo kudasai", espanol: "Una bolsa por favor", audio: "fukuro" },
      { japones: "カードで払えますか？", romaji: "Kaado de haraemasu ka?", espanol: "¿Puedo pagar con tarjeta?", audio: "card" }
    ]
  },

  transporte: {
    nombre: "Transporte",
    icono: "🚄",
    frases: [
      { japones: "＿＿はどこですか？", romaji: "___ wa doko desu ka?", espanol: "¿Dónde está ___?", audio: "doko" },
      { japones: "駅", romaji: "Eki", espanol: "Estación", audio: "eki" },
      { japones: "＿＿まで行きますか？", romaji: "___ made ikimasu ka?", espanol: "¿Va hacia ___?", audio: "made" },
      { japones: "いくらですか？", romaji: "Ikura desu ka?", espanol: "¿Cuánto es?", audio: "ikura-transport" },
      { japones: "切符売り場", romaji: "Kippu uriba", espanol: "Venta de boletos", audio: "kippu" },
      { japones: "左", romaji: "Hidari", espanol: "Izquierda", audio: "hidari" },
      { japones: "右", romaji: "Migi", espanol: "Derecha", audio: "migi" },
      { japones: "真っ直ぐ", romaji: "Massugu", espanol: "Derecho/recto", audio: "massugu" }
    ]
  },

  emergencias: {
    nombre: "Emergencias",
    icono: "🚨",
    frases: [
      { japones: "助けて！", romaji: "Tasukete!", espanol: "¡Ayuda!", audio: "tasukete" },
      { japones: "警察", romaji: "Keisatsu", espanol: "Policía", audio: "keisatsu" },
      { japones: "病院", romaji: "Byouin", espanol: "Hospital", audio: "byouin" },
      { japones: "医者を呼んでください", romaji: "Isha wo yonde kudasai", espanol: "Llame a un doctor", audio: "isha" },
      { japones: "英語が話せますか？", romaji: "Eigo ga hanasemasu ka?", espanol: "¿Habla inglés?", audio: "eigo" },
      { japones: "迷子です", romaji: "Maigo desu", espanol: "Estoy perdido/a", audio: "maigo" },
      { japones: "大使館", romaji: "Taishikan", espanol: "Embajada", audio: "taishikan" }
    ]
  },

  cortesia: {
    nombre: "Cortesía",
    icono: "🙇",
    frases: [
      { japones: "お願いします", romaji: "Onegaishimasu", espanol: "Por favor / Se lo pido", audio: "onegai" },
      { japones: "どうも", romaji: "Doumo", espanol: "Gracias (casual)", audio: "doumo" },
      { japones: "どういたしまして", romaji: "Douitashimashite", espanol: "De nada", audio: "douitashi" },
      { japones: "ごめんなさい", romaji: "Gomennasai", espanol: "Lo siento", audio: "gomen" },
      { japones: "失礼します", romaji: "Shitsurei shimasu", espanol: "Disculpe (al entrar/salir)", audio: "shitsurei" },
      { japones: "お疲れ様でした", romaji: "Otsukaresama deshita", espanol: "Buen trabajo (fin del día)", audio: "otsukare" }
    ]
  },

  hotel: {
    nombre: "Hotel",
    icono: "🏨",
    frases: [
      { japones: "チェックインお願いします", romaji: "Chekku-in onegaishimasu", espanol: "Check-in por favor", audio: "checkin" },
      { japones: "チェックアウトお願いします", romaji: "Chekku-auto onegaishimasu", espanol: "Check-out por favor", audio: "checkout" },
      { japones: "WiFiのパスワードは？", romaji: "WiFi no pasuwaado wa?", espanol: "¿Cuál es la contraseña del WiFi?", audio: "wifi" },
      { japones: "朝食は何時ですか？", romaji: "Choushoku wa nanji desu ka?", espanol: "¿A qué hora es el desayuno?", audio: "choushoku" },
      { japones: "部屋の鍵を失くしました", romaji: "Heya no kagi wo nakushimashita", espanol: "Perdí la llave de la habitación", audio: "kagi" }
    ]
  }
};

// Números útiles
const NUMEROS = [
  { numero: "1", japones: "一", romaji: "Ichi" },
  { numero: "2", japones: "二", romaji: "Ni" },
  { numero: "3", japones: "三", romaji: "San" },
  { numero: "4", japones: "四", romaji: "Shi/Yon" },
  { numero: "5", japones: "五", romaji: "Go" },
  { numero: "6", japones: "六", romaji: "Roku" },
  { numero: "7", japones: "七", romaji: "Shichi/Nana" },
  { numero: "8", japones: "八", romaji: "Hachi" },
  { numero: "9", japones: "九", romaji: "Kyuu/Ku" },
  { numero: "10", japones: "十", romaji: "Juu" },
  { numero: "100", japones: "百", romaji: "Hyaku" },
  { numero: "1000", japones: "千", romaji: "Sen" },
  { numero: "10000", japones: "万", romaji: "Man" }
];

// Teléfonos de emergencia
const TELEFONOS_EMERGENCIA = [
  { servicio: "Policía", numero: "110", icono: "🚓", descripcion: "Emergencias policiales, robos, accidentes" },
  { servicio: "Bomberos/Ambulancia", numero: "119", icono: "🚒", descripcion: "Incendios, emergencias médicas" },
  { servicio: "Japan Helpline", numero: "0570-000-911", icono: "📞", descripcion: "Asistencia en inglés 24/7" },
  { servicio: "Tourist Information Center", numero: "03-3201-3331", icono: "ℹ️", descripcion: "Información turística en inglés" }
];

// Embajadas importantes
const EMBAJADAS = {
  mexico: { nombre: "Embajada de México", telefono: "03-3581-1131", direccion: "2-15-1 Nagatacho, Chiyoda-ku, Tokyo" },
  espana: { nombre: "Embajada de España", telefono: "03-3583-8531", direccion: "1-3-29 Roppongi, Minato-ku, Tokyo" },
  argentina: { nombre: "Embajada de Argentina", telefono: "03-5420-7101", direccion: "2-14-14 Moto-Azabu, Minato-ku, Tokyo" },
  chile: { nombre: "Embajada de Chile", telefono: "03-3452-7561", direccion: "Nihon Seimei Akabanebashi Bldg. 8F, 3-1-14 Shiba, Minato-ku, Tokyo" },
  colombia: { nombre: "Embajada de Colombia", telefono: "03-3440-6451", direccion: "3-10-53 Kamiosaki, Shinagawa-ku, Tokyo" }
};

// Consejos de seguridad
const CONSEJOS_SEGURIDAD = [
  "Lleva siempre tu pasaporte o una copia certificada",
  "Guarda el número de tu embajada en tu teléfono",
  "Japón es MUY seguro, pero mantén tus pertenencias contigo",
  "Los taxis son caros pero muy seguros",
  "Si te pierdes, busca un koban (policía local) - hay en todas partes",
  "Descarga Google Translate OFFLINE antes de viajar",
  "Lleva siempre la dirección de tu hotel en japonés escrita",
  "Las estaciones de tren tienen personal que habla inglés básico",
  "Compra un pocket WiFi o SIM card al llegar - crucial para mapas"
];

// Export
if (typeof window !== 'undefined') {
  window.SurvivalGuide = {
    frases: FRASES_ESENCIALES,
    numeros: NUMEROS,
    emergencias: TELEFONOS_EMERGENCIA,
    embajadas: EMBAJADAS,
    consejos: CONSEJOS_SEGURIDAD
  };
}
