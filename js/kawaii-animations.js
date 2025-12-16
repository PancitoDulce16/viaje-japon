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
function getFechaViaje() {
  // Intentar obtener fecha del viaje actual
  if (window.currentItinerary && window.currentItinerary.days && window.currentItinerary.days.length > 0) {
    const firstDay = window.currentItinerary.days[0];
    if (firstDay.date) {
      return new Date(firstDay.date);
    }
  }

  // Si no hay itinerario, usar fecha de ejemplo
  return new Date("2025-04-01");
}

function actualizarContador() {
  const daysElement = document.getElementById("days");
  const messageElement = document.getElementById("message");

  if (!daysElement || !messageElement) return;

  const fechaViaje = getFechaViaje();

  // Obtener solo la fecha (sin hora) para comparación precisa
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Asegurar que fechaViaje también esté en hora 0
  fechaViaje.setHours(0, 0, 0, 0);

  const diferencia = fechaViaje - hoy;
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

  // Actualizar número de días
  if (dias > 0) {
    daysElement.textContent = `${dias} días`;
  } else if (dias === 0) {
    daysElement.textContent = "¡HOY!";
  } else {
    daysElement.textContent = `¡Hace ${Math.abs(dias)} días!`;
  }

  // Actualizar mensaje según días restantes
  if (dias > 30) {
    messageElement.textContent = "¡Todavía hay tiempo para practicar con los palillos! 🍥";
  } else if (dias > 7) {
    messageElement.textContent = "¡Ya huele a salsa de soja desde aquí! 😋";
  } else if (dias > 0) {
    messageElement.textContent = "¡Modo maleta ON! ¡Esto se pone serio! 🧳✈️";
  } else if (dias === 0) {
    messageElement.innerHTML = "¡LLEGASTE A JAPÓN! ¡Que empiece la aventura! 🎌🎉";
    lanzarConfeti();
  } else {
    messageElement.textContent = "¡Estás aquí! Hora de comer, caminar y flipar todo el día 🗾❤️";
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
}
