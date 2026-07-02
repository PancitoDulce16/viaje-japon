/* ========================================
   KAWAII ANIMATIONS JS
   Maneki-neko y Countdown
   ======================================== */

// ===================================
// MANEKI-NEKO - Mensajes de ánimo
// ===================================
const mensajes = [
  "¡Hoy es perfecto para soñar con ramen caliente! 🍜",
  "Pronóstico: 99% de probabilidad de comer takoyaki rico 🐙",
  "¡Vas a sacarte la foto perfecta con el Monte Fuji! 🗻📸",
  "Algún vending machine te va a sorprender hoy 🤖",
  "¡Prepárate: viene un día lleno de onigiri y sonrisas! 🍙",
  "Los trenes bala te esperan puntualitos como siempre 🚄",
  "Hoy encontrarás el Kit-Kat de sabor más raro del mundo 🍫",
  "¡Nivel de emoción subiendo como el Shinkansen! ⚡",
  "Vas a descubrir una tiendita 100 yenes mágica 🛍️",
  "¡Tu maleta ya está contando los días contigo! ✈️"
];

function mostrarMensaje() {
  const bubble = document.getElementById('fortuneBubble');
  if (!bubble) return;

  const mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)];
  bubble.textContent = mensajeAleatorio;
  bubble.classList.add('show');

  setTimeout(() => bubble.classList.remove('show'), 6000);
}

// Inicializar cuando carga la página
window.addEventListener('load', () => {
  // NO mostrar mensaje automáticamente, solo al hacer click
  const manekiImg = document.querySelector('.maneki-neko img');
  if (manekiImg) {
    manekiImg.addEventListener('click', mostrarMensaje);
  }

  // También permitir click en el contenedor
  const manekiContainer = document.querySelector('.maneki-neko');
  if (manekiContainer) {
    manekiContainer.addEventListener('click', mostrarMensaje);
  }
});

// ===================================
// COUNTDOWN - Contador de días
// ===================================

// Parsea 'YYYY-MM-DD' como fecha LOCAL (new Date('YYYY-MM-DD') sería UTC
// y resta un día en zonas horarias negativas)
function parseFechaLocal(str) {
  if (!str) return null;
  if (str instanceof Date) return isNaN(str) ? null : new Date(str);
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

function getFechasViaje() {
  // Fuente principal: el viaje activo en TripsManager
  const info = window.TripsManager?.currentTrip?.info;
  if (info?.dateStart) {
    return { start: parseFechaLocal(info.dateStart), end: parseFechaLocal(info.dateEnd || info.dateStart) };
  }

  // Fallback: itinerario cargado
  const days = window.currentItinerary?.days;
  if (days?.length && days[0].date) {
    return {
      start: parseFechaLocal(days[0].date),
      end: parseFechaLocal(days[days.length - 1].date || days[0].date)
    };
  }

  return null; // Sin viaje: no inventar fechas
}

function actualizarContador() {
  const prefixElement = document.getElementById("countdownPrefix");
  const daysElement = document.getElementById("days");
  const suffixElement = document.getElementById("countdownSuffix");
  const messageElement = document.getElementById("message");

  if (!daysElement || !messageElement) return;

  const setTexts = (prefix, days, suffix, message) => {
    if (prefixElement) prefixElement.textContent = prefix;
    daysElement.textContent = days;
    if (suffixElement) suffixElement.textContent = suffix;
    messageElement.textContent = message;
  };

  const fechas = getFechasViaje();

  // Sin viaje activo: invitar a crear uno en vez de mostrar datos falsos
  if (!fechas || !fechas.start) {
    setTexts('Tu aventura', '🗾', 'te espera', 'Crea tu primer viaje para empezar la cuenta regresiva ✈️');
    return;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(fechas.start);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(fechas.end || fechas.start);
  fin.setHours(0, 0, 0, 0);

  const MS_DIA = 1000 * 60 * 60 * 24;
  const dias = Math.round((inicio - hoy) / MS_DIA);

  if (dias > 0) {
    // Antes del viaje: cuenta regresiva
    let msg;
    if (dias > 30) msg = "¡Todavía hay tiempo para practicar con los palillos! 🍥";
    else if (dias > 7) msg = "¡Ya huele a salsa de soja desde aquí! 😋";
    else msg = "¡Modo maleta ON! ¡Esto se pone serio! 🧳✈️";
    setTexts('¡Faltan', dias === 1 ? '1 día' : `${dias} días`, 'para Japón! 🇯🇵', msg);
  } else if (dias === 0) {
    setTexts('¡Es', 'HOY', '! 🎌', '¡LLEGASTE A JAPÓN! ¡Que empiece la aventura! 🎉');
    lanzarConfeti();
  } else if (hoy <= fin) {
    // Durante el viaje
    const diaActual = Math.round((hoy - inicio) / MS_DIA) + 1;
    const totalDias = Math.round((fin - inicio) / MS_DIA) + 1;
    setTexts('¡Estás en Japón!', `Día ${diaActual} de ${totalDias}`, '🇯🇵', '¡Hora de comer, caminar y flipar todo el día! 🗾❤️');
  } else {
    // Después del viaje
    const diasDesde = Math.abs(Math.round((fin - hoy) / MS_DIA));
    setTexts('Tu viaje terminó', diasDesde === 1 ? 'hace 1 día' : `hace ${diasDesde} días`, '🌸', '¡Hasta la próxima aventura! Revive tus recuerdos en el diario 📔');
  }
}

// Función de confeti (simple)
function lanzarConfeti() {
  // Implementación simple de confeti usando emojis
  const emojis = ['🎉', '🎊', '🌸', '🗾', '🍜', '🏯'];
  const container = document.body;

  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-20px';
    confetti.style.fontSize = '2rem';
    confetti.style.zIndex = '9999';
    confetti.style.pointerEvents = 'none';
    confetti.style.animation = `fall ${2 + Math.random() * 2}s linear`;

    container.appendChild(confetti);

    setTimeout(() => confetti.remove(), 4000);
  }
}

// Agregar animación de caída
const style = document.createElement('style');
style.textContent = `
  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Inicializar contador
if (document.getElementById("days")) {
  actualizarContador();
  setInterval(actualizarContador, 3600000); // Actualizar cada hora

  // Re-renderizar cuando se selecciona/carga un viaje
  window.addEventListener('tripSelected', actualizarContador);
  window.addEventListener('itineraryLoaded', actualizarContador);
}
