// js/location-game.js - Juego de adivinar ubicaciones en Japón

/**
 * Spot the Location Game
 * Juego de descubrimiento: adivina dónde fue tomada la foto.
 *
 * Deprecation note (see DEPRECATION_LOG.md): this file used to track a
 * competitive score with a time-bonus formula and render a hardcoded fake
 * leaderboard (invented usernames/scores). Per SOUL.md — "Japitin celebrates
 * exploration, not competition" and "fake or invented data must never exist
 * anywhere in the product" — both were removed. The guessing mechanic itself
 * is unchanged; only the scoring/ranking layer is gone.
 */
export const LocationGame = {
  currentRound: null,
  roundsPlayed: 0,
  roundsCorrect: 0,

  DIFFICULTY_LEVELS: {
    easy: { name: 'Lugares Icónicos', time: 30 },
    medium: { name: 'Restaurantes Conocidos', time: 20 },
    hard: { name: 'Hidden Gems', time: 15 }
  },

  /**
   * Abre el juego
   */
  open() {
    this.showMainMenu();
  },

  /**
   * Muestra el menú principal
   */
  showMainMenu() {
    const modalHTML = `
      <div id="locationGameModal" class="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 gradient-animated flex items-center justify-center p-4 animate-fadeInUp">

        <div class="glass-card rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden glow-purple hover-lift">

          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 gradient-animated p-8 text-white text-center relative overflow-hidden">
            <div class="shimmer absolute inset-0"></div>
            <div class="relative z-10">
              <div class="text-7xl mb-4 float sparkle">📍</div>
              <h1 class="text-4xl font-bold mb-2 gradient-text-animated">Spot the Location!</h1>
              <p class="text-xl opacity-90">¿Puedes adivinar dónde fue tomada la foto?</p>
            </div>
          </div>

          <!-- Stats: personal only, never a ranking against other people -->
          <div class="p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 grid grid-cols-2 gap-4 text-center border-b border-gray-200 dark:border-gray-700">
            <div class="hover-lift animate-fadeInUp-delay-1">
              <div class="stat-number text-4xl mb-1 pulse-glow">${this.roundsCorrect}</div>
              <div class="text-xs text-gray-600 dark:text-gray-400 font-semibold">Lugares Reconocidos</div>
            </div>
            <div class="hover-lift animate-fadeInUp-delay-2">
              <div class="stat-number text-4xl mb-1">${this.roundsPlayed}</div>
              <div class="text-xs text-gray-600 dark:text-gray-400 font-semibold">Rondas Jugadas</div>
            </div>
          </div>

          <!-- Difficulty Selection -->
          <div class="p-8 space-y-4">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Elige la dificultad:
            </h3>

            ${Object.entries(this.DIFFICULTY_LEVELS).map(([key, level]) => `
              <button onclick="window.LocationGame.startGame('${key}')"
                      class="group w-full p-6 rounded-xl border-2 border-transparent glass-card hover-lift btn-aesthetic hover-glow transition relative overflow-hidden">
                <div class="flex items-center justify-between relative z-10">
                  <div class="text-left">
                    <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition">
                      ${level.name}
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                      ⏱️ ${level.time}s por ronda
                    </p>
                  </div>
                  <div class="text-5xl animate-wave">
                    ${key === 'easy' ? '😊' : key === 'medium' ? '🤔' : '😰'}
                  </div>
                </div>
              </button>
            `).join('')}
          </div>

          <!-- Footer -->
          <div class="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button onclick="window.LocationGame.close()"
                    class="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-white font-bold rounded-lg">
              Salir
            </button>
          </div>

        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  /**
   * Inicia una ronda del juego
   */
  startGame(difficulty) {
    this.currentRound = {
      difficulty,
      round: this.generateRound(difficulty),
      startTime: Date.now(),
      timeLimit: this.DIFFICULTY_LEVELS[difficulty].time * 1000
    };

    this.showGameRound();
  },

  /**
   * Genera una ronda de juego
   */
  generateRound(difficulty) {
    const locations = {
      easy: [
        { name: 'Shibuya Crossing', city: 'Tokyo', image: '🚶‍♀️🚦', hint: 'El cruce más famoso del mundo' },
        { name: 'Fushimi Inari', city: 'Kyoto', image: '⛩️🦊', hint: '10,000 torii gates' },
        { name: 'Monte Fuji', city: 'Hakone', image: '🗻☁️', hint: 'La montaña más icónica de Japón' },
        { name: 'Dotonbori', city: 'Osaka', image: '🏮🦀', hint: 'Luces de neón y comida callejera' }
      ],
      medium: [
        { name: 'Ichiran Ramen Shibuya', city: 'Tokyo', image: '🍜🏢', hint: 'Ramen en cubículos individuales' },
        { name: 'Mercado Nishiki', city: 'Kyoto', image: '🐟🍱', hint: 'La cocina de Kyoto' },
        { name: 'Takoyaki Museum', city: 'Osaka', image: '🐙🏛️', hint: 'Museo dedicado a takoyaki' }
      ],
      hard: [
        { name: 'Golden Gai', city: 'Tokyo', image: '🏮🍶', hint: 'Callejones con mini-bares' },
        { name: 'Pontocho Alley', city: 'Kyoto', image: '🏮🌙', hint: 'Callejón estrecho junto al río' },
        { name: 'Hozenji Yokocho', city: 'Osaka', image: '⛩️🔥', hint: 'Callejón escondido con templo' }
      ]
    };

    const list = locations[difficulty];
    const correct = list[Math.floor(Math.random() * list.length)];

    // Generar opciones incorrectas
    const allLocations = [...locations.easy, ...locations.medium, ...locations.hard];
    const incorrectOptions = allLocations
      .filter(l => l.name !== correct.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const options = [correct, ...incorrectOptions]
      .sort(() => 0.5 - Math.random());

    return {
      correct: correct.name,
      image: correct.image,
      hint: correct.hint,
      options: options.map(o => o.name)
    };
  },

  /**
   * Muestra la ronda de juego
   */
  showGameRound() {
    const round = this.currentRound.round;
    const difficulty = this.currentRound.difficulty;

    const modalHTML = `
      <div id="gameRoundModal" class="fixed inset-0 z-[60] bg-gradient-to-br from-blue-600 to-purple-600 gradient-animated flex items-center justify-center p-4 animate-fadeInUp">

        <div class="glass-card rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden glow-blue hover-lift">

          <!-- Timer Bar -->
          <div class="h-3 bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div id="timerBar" class="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all"
                 style="width: 100%; transition: width ${this.currentRound.timeLimit}ms linear;"></div>
          </div>

          <!-- Round Info -->
          <div class="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold opacity-90">
                {difficulty.toUpperCase()}
              </span>
            </div>
            <h2 class="text-2xl font-bold mb-2">¿Dónde es esto?</h2>
            <p id="timeRemaining" class="text-lg opacity-90">⏱️ ${this.DIFFICULTY_LEVELS[difficulty].time}s</p>
          </div>

          <!-- Photo Placeholder -->
          <div class="p-8 bg-gray-100 dark:bg-gray-700 flex items-center justify-center" style="min-height: 300px;">
            <div class="text-center">
              <div class="text-9xl mb-4">${round.image}</div>
              <p class="text-sm text-gray-600 dark:text-gray-400 italic">
                💡 Pista: ${round.hint}
              </p>
            </div>
          </div>

          <!-- Options -->
          <div class="p-6 grid grid-cols-2 gap-3">
            ${round.options.map((option, i) => `
              <button onclick="window.LocationGame.submitAnswer('${option}')"
                      class="p-4 text-left rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition bg-white dark:bg-gray-700">
                <div class="font-bold text-gray-900 dark:text-white">${option}</div>
              </button>
            `).join('')}
          </div>

        </div>

      </div>
    `;

    // Cerrar menú anterior
    document.getElementById('locationGameModal')?.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Iniciar timer
    setTimeout(() => {
      document.getElementById('timerBar').style.width = '0%';
    }, 100);

    // Countdown
    this.startCountdown();

    // Auto-fail después del tiempo
    setTimeout(() => {
      if (document.getElementById('gameRoundModal')) {
        this.submitAnswer(null); // Time's up
      }
    }, this.currentRound.timeLimit);
  },

  /**
   * Countdown timer
   */
  startCountdown() {
    const timeLimit = this.DIFFICULTY_LEVELS[this.currentRound.difficulty].time;
    let remaining = timeLimit;

    const interval = setInterval(() => {
      remaining--;

      const display = document.getElementById('timeRemaining');
      if (display) {
        display.textContent = `⏱️ ${remaining}s`;

        if (remaining <= 5) {
          display.classList.add('text-red-500', 'animate-pulse');
        }
      }

      if (remaining <= 0 || !document.getElementById('gameRoundModal')) {
        clearInterval(interval);
      }
    }, 1000);
  },

  /**
   * Envía respuesta
   */
  submitAnswer(answer) {
    const isCorrect = answer === this.currentRound.round.correct;

    this.roundsPlayed++;
    if (isCorrect) {
      this.roundsCorrect++;
    }

    this.showResult(isCorrect);
  },

  /**
   * Muestra resultado de la ronda
   */
  showResult(isCorrect) {
    const correctAnswer = this.currentRound.round.correct;

    const modalHTML = `
      <div id="resultModal" class="fixed inset-0 z-[70] bg-black/80 backdrop-blur-strong flex items-center justify-center p-4 animate-fadeInUp">
        <div class="glass-card rounded-3xl shadow-2xl w-full max-w-md p-8 text-center ${isCorrect ? 'glow-green' : 'glow-pink'} hover-lift">

          <!-- Result Icon -->
          <div class="text-9xl mb-4 animate-bounce sparkle">
            ${isCorrect ? '🎉' : '😢'}
          </div>

          <!-- Message -->
          <h2 class="text-4xl font-bold mb-2 gradient-text-animated">
            ${isCorrect ? '¡Correcto!' : '¡Casi!'}
          </h2>

          ${isCorrect ? `
            <p class="text-xl text-gray-700 dark:text-gray-300 mb-4">
              Un lugar más que reconoces de Japón.
            </p>
          ` : `
            <p class="text-lg text-gray-700 dark:text-gray-300 mb-4">
              La respuesta correcta era:<br>
              <strong>${correctAnswer}</strong>
            </p>
          `}

          <!-- Personal progress, not a score to compare against anyone -->
          <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl mb-6">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Lugares reconocidos</div>
            <div class="text-4xl font-bold text-purple-600 dark:text-purple-400">${this.roundsCorrect} / ${this.roundsPlayed}</div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button onclick="window.LocationGame.playAgain()"
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg">
              🔄 Jugar Otra
            </button>
            <button onclick="window.LocationGame.closeResult()"
                    class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg">
              Salir
            </button>
          </div>

        </div>
      </div>
    `;

    // Cerrar round modal
    document.getElementById('gameRoundModal')?.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  /**
   * Jugar otra ronda
   */
  playAgain() {
    document.getElementById('resultModal')?.remove();
    this.showMainMenu();
  },

  /**
   * Cierra resultado y vuelve al menú
   */
  closeResult() {
    document.getElementById('resultModal')?.remove();
    this.showMainMenu();
  },

  /**
   * Cierra el juego
   */
  close() {
    // Usar ModalManager si está disponible
    if (window.ModalManager) {
      window.ModalManager.closeModal('locationGameModal');
      window.ModalManager.closeModal('gameRoundModal');
      window.ModalManager.closeModal('resultModal');
    } else {
      // Fallback a método tradicional
      document.getElementById('locationGameModal')?.remove();
      document.getElementById('gameRoundModal')?.remove();
      document.getElementById('resultModal')?.remove();
    }
  }
};

// Exportar globalmente
window.LocationGame = LocationGame;

console.log('✅ Location Game loaded');

export default LocationGame;
