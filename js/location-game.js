// js/location-game.js - Juego de adivinar ubicaciones en Japón

/**
 * Spot the Location Game
 * Juego comunitario: usuarios postean fotos y otros adivinan la ubicación
 */
export const LocationGame = {
  currentRound: null,
  userScore: 0,
  totalRounds: 0,
  leaderboard: [],

  DIFFICULTY_LEVELS: {
    easy: { name: 'Lugares Icónicos', points: 10, time: 30 },
    medium: { name: 'Restaurantes Conocidos', points: 25, time: 20 },
    hard: { name: 'Hidden Gems', points: 50, time: 15 }
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
      <div id="locationGameModal" class="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">

        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">

          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 text-white text-center">
            <div class="text-7xl mb-4 animate-bounce">📍</div>
            <h1 class="text-4xl font-bold mb-2">Spot the Location!</h1>
            <p class="text-xl opacity-90">¿Puedes adivinar dónde fue tomada la foto?</p>
          </div>

          <!-- Stats -->
          <div class="p-6 bg-gray-50 dark:bg-gray-900 grid grid-cols-3 gap-4 text-center border-b border-gray-200 dark:border-gray-700">
            <div>
              <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">${this.userScore}</div>
              <div class="text-xs text-gray-600 dark:text-gray-400">Tu Puntaje</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">${this.totalRounds}</div>
              <div class="text-xs text-gray-600 dark:text-gray-400">Rondas Jugadas</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-pink-600 dark:text-pink-400">#15</div>
              <div class="text-xs text-gray-600 dark:text-gray-400">Ranking Global</div>
            </div>
          </div>

          <!-- Difficulty Selection -->
          <div class="p-8 space-y-4">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Elige la dificultad:
            </h3>

            ${Object.entries(this.DIFFICULTY_LEVELS).map(([key, level]) => `
              <button onclick="window.LocationGame.startGame('${key}')"
                      class="group w-full p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-lg">
                <div class="flex items-center justify-between">
                  <div class="text-left">
                    <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                      ${level.name}
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      ${level.points} puntos • ${level.time}s por ronda
                    </p>
                  </div>
                  <div class="text-4xl group-hover:scale-110 transition">
                    ${key === 'easy' ? '😊' : key === 'medium' ? '🤔' : '😰'}
                  </div>
                </div>
              </button>
            `).join('')}

            <!-- Leaderboard Preview -->
            <div class="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
              <h4 class="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span class="text-xl">🏆</span>
                Top 3 Jugadores
              </h4>
              <div class="space-y-2 text-sm">
                ${this.renderLeaderboardPreview()}
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <button onclick="window.LocationGame.showLeaderboard()"
                    class="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition">
                    🏆 Leaderboard Completo
            </button>
            <button onclick="window.LocationGame.close()"
                    class="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-white font-bold rounded-lg">
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
    const points = this.DIFFICULTY_LEVELS[difficulty].points;

    const modalHTML = `
      <div id="gameRoundModal" class="fixed inset-0 z-[60] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">

        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">

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
              <span class="text-sm font-semibold opacity-90">
                +${points} puntos
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
    const timeUsed = Date.now() - this.currentRound.startTime;
    const timeBonus = Math.max(0, (this.currentRound.timeLimit - timeUsed) / 1000);

    const basePoints = this.DIFFICULTY_LEVELS[this.currentRound.difficulty].points;
    const earnedPoints = isCorrect ? Math.round(basePoints + (timeBonus * 2)) : 0;

    if (isCorrect) {
      this.userScore += earnedPoints;
    }

    this.totalRounds++;

    this.showResult(isCorrect, earnedPoints);
  },

  /**
   * Muestra resultado de la ronda
   */
  showResult(isCorrect, points) {
    const correctAnswer = this.currentRound.round.correct;

    const modalHTML = `
      <div id="resultModal" class="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">

          <!-- Result Icon -->
          <div class="text-8xl mb-4 animate-bounce">
            ${isCorrect ? '🎉' : '😢'}
          </div>

          <!-- Message -->
          <h2 class="text-3xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}">
            ${isCorrect ? '¡Correcto!' : '¡Incorrecto!'}
          </h2>

          ${isCorrect ? `
            <p class="text-xl text-gray-700 dark:text-gray-300 mb-4">
              +${points} puntos
            </p>
          ` : `
            <p class="text-lg text-gray-700 dark:text-gray-300 mb-4">
              La respuesta correcta era:<br>
              <strong>${correctAnswer}</strong>
            </p>
          `}

          <!-- Current Score -->
          <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl mb-6">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Puntaje Total</div>
            <div class="text-4xl font-bold text-purple-600 dark:text-purple-400">${this.userScore}</div>
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
   * Renderiza preview del leaderboard
   */
  renderLeaderboardPreview() {
    const top3 = [
      { username: 'japan_master', score: 1250, avatar: 'J' },
      { username: 'location_pro', score: 980, avatar: 'L' },
      { username: 'tokyo_explorer', score: 875, avatar: 'T' }
    ];

    return top3.map((player, i) => `
      <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-3">
          <span class="text-xl">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
          <span class="font-semibold text-gray-900 dark:text-white">@${player.username}</span>
        </div>
        <span class="font-bold text-purple-600 dark:text-purple-400">${player.score}</span>
      </div>
    `).join('');
  },

  /**
   * Muestra leaderboard completo
   */
  showLeaderboard() {
    window.Notifications?.show('🏆 Leaderboard completo próximamente', 'info');
  },

  /**
   * Cierra el juego
   */
  close() {
    document.getElementById('locationGameModal')?.remove();
    document.getElementById('gameRoundModal')?.remove();
    document.getElementById('resultModal')?.remove();
  }
};

// Exportar globalmente
window.LocationGame = LocationGame;

console.log('✅ Location Game loaded');

export default LocationGame;
