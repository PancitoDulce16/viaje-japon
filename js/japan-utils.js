// js/japan-utils.js - Utilidades culturales y prácticas para Japón

export const JapanUtils = {

    // 1. CALCULADORA DE PROPINAS
    renderTipCalculator() {
        return `
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-l-4 border-green-500">
                <h4 class="text-xl font-bold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                    💴 Calculadora de Propinas
                </h4>
                <div class="bg-white dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <div class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                        <span class="text-3xl">ℹ️</span>
                        <div>
                            <p class="font-bold text-gray-800 dark:text-white">¡En Japón NO se dan propinas!</p>
                            <p class="text-sm text-gray-600 dark:text-gray-300">Dar propina puede considerarse ofensivo. El servicio ya está incluido.</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <div>
                        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">💵 Monto de la cuenta (JPY)</label>
                        <input
                            type="number"
                            id="billAmountInput"
                            class="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="5000"
                            onkeypress="if(event.key === 'Enter') window.JapanUtils.calculateTip()"
                        >
                    </div>
                    <div class="grid grid-cols-1 gap-3">
                        <button id="calculateTipBtn" class="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg font-bold shadow-md transition">
                            ✅ Calcular Total (Sin Propina)
                        </button>
                    </div>
                    <div id="tipResultDisplay" class="p-4 bg-gray-50 dark:bg-gray-600 rounded-lg text-center hidden">
                        <p class="text-sm text-gray-600 dark:text-gray-300 mb-1">Total a pagar:</p>
                        <p class="text-3xl font-bold text-green-600 dark:text-green-400" id="totalAmountDisplay">¥0</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">🎌 En Japón, solo pagas lo que dice la cuenta</p>
                    </div>
                </div>
            </div>
        `;
    },

    initTipCalculator() {
        const btn = document.getElementById('calculateTipBtn');
        if (btn) {
            btn.onclick = () => this.calculateTip();
        }
    },

    calculateTip() {
        const input = document.getElementById('billAmountInput');
        const billAmount = parseFloat(input?.value) || 0;

        if (billAmount <= 0) {
            alert('Por favor ingresa un monto válido');
            return;
        }

        const total = billAmount; // Siempre 0% de propina en Japón

        const resultDiv = document.getElementById('tipResultDisplay');
        const totalDiv = document.getElementById('totalAmountDisplay');

        if (resultDiv && totalDiv) {
            totalDiv.textContent = `¥${total.toLocaleString('ja-JP')}`;
            resultDiv.classList.remove('hidden');
        }
    },

    // 2. CONTADOR DE DÍAS RESTANTES
    renderCountdown() {
        const tripStart = '2026-02-16'; // Fecha de inicio del viaje
        const tripEnd = '2026-03-02';   // Fecha de fin del viaje

        return `
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-l-4 border-purple-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    ⏳ Contador de Días
                </h4>
                <div id="countdownDisplay" class="space-y-4">
                    <!-- Se llenará dinámicamente -->
                </div>
            </div>
        `;
    },

    updateCountdown() {
        const tripStart = new Date('2026-02-16T00:00:00');
        const tripEnd = new Date('2026-03-02T23:59:59');
        const now = new Date();

        const daysUntilTrip = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));
        const daysOfTrip = Math.ceil((tripEnd - tripStart) / (1000 * 60 * 60 * 24));

        const display = document.getElementById('countdownDisplay');
        if (!display) return;

        if (now < tripStart) {
            // Antes del viaje
            display.innerHTML = `
                <div class="text-center p-6 bg-white dark:bg-gray-700 rounded-lg">
                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">Faltan para tu aventura en Japón:</p>
                    <p class="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-2">${daysUntilTrip}</p>
                    <p class="text-xl font-semibold text-gray-800 dark:text-white">días</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">🎌 ${daysOfTrip} días de aventura te esperan</p>
                </div>
            `;
        } else if (now >= tripStart && now <= tripEnd) {
            // Durante el viaje
            const daysRemaining = Math.ceil((tripEnd - now) / (1000 * 60 * 60 * 24));
            display.innerHTML = `
                <div class="text-center p-6 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/40 dark:to-blue-900/40 rounded-lg">
                    <p class="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">🎉 ¡Estás en Japón!</p>
                    <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">Te quedan:</p>
                    <p class="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">${daysRemaining}</p>
                    <p class="text-xl font-semibold text-gray-800 dark:text-white">días de aventura</p>
                </div>
            `;
        } else {
            // Después del viaje
            display.innerHTML = `
                <div class="text-center p-6 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-lg">
                    <p class="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-3">✈️ Viaje completado</p>
                    <p class="text-lg text-gray-700 dark:text-gray-300">¡Esperamos que hayas tenido una experiencia increíble!</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">またね！(Mata ne - ¡Hasta pronto!)</p>
                </div>
            `;
        }
    },

    // 3. YA EXISTE ZONA HORARIA EN EL CÓDIGO, SKIP

    // 4. GUÍA DE ETIQUETA
    renderEtiquetteGuide() {
        return `
            <div class="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border-l-4 border-red-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🙇 Guía de Etiqueta Japonesa
                </h4>
                <div class="space-y-3">
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-blue-400">
                        <p class="font-bold text-gray-800 dark:text-white mb-1">👞 Zapatos</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Quítate los zapatos al entrar a casas, templos y algunos restaurantes</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-green-400">
                        <p class="font-bold text-gray-800 dark:text-white mb-1">🍜 Comida</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Hacer ruido al comer fideos es CORRECTO. No claves palillos en el arroz (es de funerales)</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-purple-400">
                        <p class="font-bold text-gray-800 dark:text-white mb-1">🙇 Saludo</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Inclina la cabeza al saludar. Evita contacto físico (abrazos/besos)</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p class="font-bold text-gray-800 dark:text-white mb-1">🚇 Transporte</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Silencio en el tren. Cede asientos prioritarios. No comas ni bebas</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-red-400">
                        <p class="font-bold text-gray-800 dark:text-white mb-1">📱 Teléfono</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">No hables por teléfono en trenes o lugares públicos cerrados</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-orange-400">
                        <p class="font-bold text-gray-800 dark:text-white mb-1">💴 Dinero</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Coloca el dinero en la bandeja, no en la mano del cajero</p>
                    </div>
                </div>
            </div>
        `;
    },

    // 5. GENERADOR DE NOMBRES EN JAPONÉS
    renderNameGenerator() {
        return `
            <div class="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border-l-4 border-indigo-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🏯 Generador de Nombres en Japonés
                </h4>
                <div class="space-y-3">
                    <div>
                        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Tu nombre:</label>
                        <input
                            type="text"
                            id="nameInput"
                            class="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Ej: Maria"
                        >
                    </div>
                    <button onclick="JapanUtils.generateJapaneseName()" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-lg font-bold shadow-md transition">
                        ✨ Convertir a Katakana
                    </button>
                    <div id="nameResult" class="hidden p-6 bg-white dark:bg-gray-700 rounded-lg text-center border-2 border-indigo-300 dark:border-indigo-600">
                        <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">Tu nombre en japonés:</p>
                        <p class="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-3" id="japaneseName">ー</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Katakana (para nombres extranjeros)</p>
                    </div>
                </div>
            </div>
        `;
    },

    generateJapaneseName() {
        const name = document.getElementById('nameInput').value.toLowerCase().trim();
        if (!name) {
            alert('Por favor ingresa un nombre');
            return;
        }

        // Mapa completo de conversión a Katakana
        const conversions = {
            // Vocales
            'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ',

            // K
            'ka': 'カ', 'ki': 'キ', 'ku': 'ク', 'ke': 'ケ', 'ko': 'コ',

            // S
            'sa': 'サ', 'shi': 'シ', 'si': 'シ', 'su': 'ス', 'se': 'セ', 'so': 'ソ',

            // T
            'ta': 'タ', 'chi': 'チ', 'ti': 'チ', 'tsu': 'ツ', 'tu': 'ツ', 'te': 'テ', 'to': 'ト',

            // N
            'na': 'ナ', 'ni': 'ニ', 'nu': 'ヌ', 'ne': 'ネ', 'no': 'ノ', 'n': 'ン',

            // H
            'ha': 'ハ', 'hi': 'ヒ', 'fu': 'フ', 'hu': 'フ', 'he': 'ヘ', 'ho': 'ホ',

            // M
            'ma': 'マ', 'mi': 'ミ', 'mu': 'ム', 'me': 'メ', 'mo': 'モ',

            // Y
            'ya': 'ヤ', 'yu': 'ユ', 'yo': 'ヨ',

            // R/L (en japonés suenan igual)
            'ra': 'ラ', 'ri': 'リ', 'ru': 'ル', 're': 'レ', 'ro': 'ロ',
            'la': 'ラ', 'li': 'リ', 'lu': 'ル', 'le': 'レ', 'lo': 'ロ',

            // W
            'wa': 'ワ', 'wi': 'ウィ', 'we': 'ウェ', 'wo': 'ヲ',

            // G
            'ga': 'ガ', 'gi': 'ギ', 'gu': 'グ', 'ge': 'ゲ', 'go': 'ゴ',

            // Z
            'za': 'ザ', 'ji': 'ジ', 'zi': 'ジ', 'zu': 'ズ', 'ze': 'ゼ', 'zo': 'ゾ',

            // D
            'da': 'ダ', 'di': 'ヂ', 'du': 'ヅ', 'de': 'デ', 'do': 'ド',

            // B
            'ba': 'バ', 'bi': 'ビ', 'bu': 'ブ', 'be': 'ベ', 'bo': 'ボ',

            // P
            'pa': 'パ', 'pi': 'ピ', 'pu': 'プ', 'pe': 'ペ', 'po': 'ポ',

            // V (aproximación con B)
            'va': 'ヴァ', 'vi': 'ヴィ', 'vu': 'ヴ', 've': 'ヴェ', 'vo': 'ヴォ',

            // Combinaciones especiales
            'kya': 'キャ', 'kyu': 'キュ', 'kyo': 'キョ',
            'sha': 'シャ', 'shu': 'シュ', 'sho': 'ショ',
            'cha': 'チャ', 'chu': 'チュ', 'cho': 'チョ',
            'nya': 'ニャ', 'nyu': 'ニュ', 'nyo': 'ニョ',
            'hya': 'ヒャ', 'hyu': 'ヒュ', 'hyo': 'ヒョ',
            'mya': 'ミャ', 'myu': 'ミュ', 'myo': 'ミョ',
            'rya': 'リャ', 'ryu': 'リュ', 'ryo': 'リョ',
            'gya': 'ギャ', 'gyu': 'ギュ', 'gyo': 'ギョ',
            'ja': 'ジャ', 'ju': 'ジュ', 'jo': 'ジョ',
            'bya': 'ビャ', 'byu': 'ビュ', 'byo': 'ビョ',
            'pya': 'ピャ', 'pyu': 'ピュ', 'pyo': 'ピョ',

            // Consonantes dobles
            'kk': 'ッ', 'ss': 'ッ', 'tt': 'ッ', 'pp': 'ッ',

            // Letras individuales que necesitan vocal
            'b': 'ブ', 'c': 'ク', 'd': 'ド', 'f': 'フ', 'g': 'グ',
            'h': 'フ', 'j': 'ジ', 'k': 'ク', 'l': 'ル', 'm': 'ム',
            'p': 'プ', 'q': 'ク', 'r': 'ル', 's': 'ス', 't': 'ト',
            'v': 'ヴ', 'w': 'ウ', 'x': 'クス', 'y': 'イ', 'z': 'ズ'
        };

        let result = '';
        let i = 0;

        while (i < name.length) {
            let found = false;

            // Intentar con 3 caracteres
            if (i + 3 <= name.length) {
                const substr3 = name.substring(i, i + 3);
                if (conversions[substr3]) {
                    result += conversions[substr3];
                    i += 3;
                    found = true;
                }
            }

            // Intentar con 2 caracteres
            if (!found && i + 2 <= name.length) {
                const substr2 = name.substring(i, i + 2);
                if (conversions[substr2]) {
                    result += conversions[substr2];
                    i += 2;
                    found = true;
                }
            }

            // Intentar con 1 caracter
            if (!found) {
                const char = name[i];
                if (conversions[char]) {
                    result += conversions[char];
                } else if (char === ' ' || char === '-') {
                    result += '・'; // Separador japonés
                } else {
                    result += char.toUpperCase(); // Dejar como está si no se puede convertir
                }
                i++;
            }
        }

        document.getElementById('japaneseName').textContent = result || 'ー';
        document.getElementById('nameResult').classList.remove('hidden');
    },

    // 6. CONVERSOR DE TALLAS
    renderSizeConverter() {
        return `
            <div class="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6 border-l-4 border-pink-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    👔 Conversor de Tallas
                </h4>

                <div class="space-y-4">
                    <!-- Ropa (Mujer) -->
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                        <p class="font-bold text-gray-800 dark:text-white mb-3">👗 Ropa Mujer</p>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div class="p-2 bg-pink-50 dark:bg-pink-900/30 rounded"><strong>USA</strong></div>
                            <div class="p-2 bg-pink-50 dark:bg-pink-900/30 rounded"><strong>Japón</strong></div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">XS (2-4)</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">7-9</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">S (6-8)</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">9-11</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">M (10-12)</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">11-13</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">L (14-16)</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">15-17</div>
                        </div>
                    </div>

                    <!-- Zapatos (Mujer) -->
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                        <p class="font-bold text-gray-800 dark:text-white mb-3">👠 Zapatos Mujer</p>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div class="p-2 bg-purple-50 dark:bg-purple-900/30 rounded"><strong>USA</strong></div>
                            <div class="p-2 bg-purple-50 dark:bg-purple-900/30 rounded"><strong>Japón (cm)</strong></div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">5</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">22.0</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">6</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">23.0</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">7</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">24.0</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">8</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">25.0</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">9</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">26.0</div>
                        </div>
                    </div>

                    <!-- Zapatos (Hombre) -->
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                        <p class="font-bold text-gray-800 dark:text-white mb-3">👞 Zapatos Hombre</p>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded"><strong>USA</strong></div>
                            <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded"><strong>Japón (cm)</strong></div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">7</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">25.0</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">8</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">26.0</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">9</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">27.0</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">10</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">28.0</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">11</div>
                            <div class="p-2 bg-gray-50 dark:bg-gray-600">29.0</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 7. QUIZ CULTURAL
    renderCulturalQuiz() {
        return `
            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-l-4 border-yellow-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🎌 Quiz Cultural Japonés
                </h4>
                <div id="quizContainer">
                    <div class="text-center mb-4">
                        <p class="text-sm text-gray-600 dark:text-gray-300">Pregunta <span id="quizCurrentQuestion">1</span> de <span id="quizTotalQuestions">5</span></p>
                    </div>
                    <div id="quizQuestion" class="bg-white dark:bg-gray-700 p-6 rounded-lg mb-4">
                        <!-- Se llenará dinámicamente -->
                    </div>
                    <div id="quizResult" class="hidden p-4 rounded-lg text-center">
                        <!-- Resultado -->
                    </div>
                </div>
            </div>
        `;
    },

    quizQuestions: [
        {
            question: "¿Qué significa 'Itadakimasu' (いただきます)?",
            options: [
                "Gracias por la comida",
                "Buen provecho",
                "Recibo este alimento humildemente",
                "Disfruten la comida"
            ],
            correct: 2,
            explanation: "'Itadakimasu' expresa gratitud hacia todo lo que hizo posible la comida (naturaleza, cocineros, etc.)"
        },
        {
            question: "¿Cuál es el monte más alto de Japón?",
            options: [
                "Monte Fuji",
                "Monte Kita",
                "Monte Aso",
                "Monte Tateyama"
            ],
            correct: 0,
            explanation: "El Monte Fuji (富士山) tiene 3,776 metros y es un símbolo icónico de Japón."
        },
        {
            question: "¿Qué regalo es considerado de mala suerte en Japón?",
            options: [
                "Flores rojas",
                "Relojes",
                "Libros",
                "Comida"
            ],
            correct: 1,
            explanation: "Los relojes simbolizan que el tiempo se acaba, lo que se asocia con la muerte."
        },
        {
            question: "¿Cuándo se celebra el 'Hanami' (花見)?",
            options: [
                "En verano para ver fuegos artificiales",
                "En primavera para ver cerezos",
                "En otoño para ver hojas rojas",
                "En invierno para ver nieve"
            ],
            correct: 1,
            explanation: "Hanami es la tradición de observar la belleza de las flores de cerezo en primavera (marzo-abril)."
        },
        {
            question: "¿Qué número se considera de mala suerte en Japón?",
            options: [
                "3",
                "4",
                "7",
                "13"
            ],
            correct: 1,
            explanation: "El número 4 (四, shi) suena igual que la palabra 'muerte' (死, shi) en japonés."
        }
    ],

    currentQuizIndex: 0,
    quizScore: 0,

    startQuiz() {
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        document.getElementById('quizTotalQuestions').textContent = this.quizQuestions.length;
        this.showQuizQuestion();
    },

    showQuizQuestion() {
        if (this.currentQuizIndex >= this.quizQuestions.length) {
            this.showQuizResults();
            return;
        }

        const q = this.quizQuestions[this.currentQuizIndex];
        document.getElementById('quizCurrentQuestion').textContent = this.currentQuizIndex + 1;
        document.getElementById('quizResult').classList.add('hidden');

        document.getElementById('quizQuestion').innerHTML = `
            <p class="text-lg font-bold text-gray-800 dark:text-white mb-4">${q.question}</p>
            <div class="space-y-2">
                ${q.options.map((option, idx) => `
                    <button onclick="JapanUtils.checkQuizAnswer(${idx})" class="w-full text-left p-3 bg-gray-100 dark:bg-gray-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition font-medium text-gray-800 dark:text-white">
                        ${String.fromCharCode(65 + idx)}. ${option}
                    </button>
                `).join('')}
            </div>
        `;
    },

    checkQuizAnswer(selectedIdx) {
        const q = this.quizQuestions[this.currentQuizIndex];
        const isCorrect = selectedIdx === q.correct;

        if (isCorrect) this.quizScore++;

        const resultDiv = document.getElementById('quizResult');
        resultDiv.className = `p-4 rounded-lg text-center ${isCorrect ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`;
        resultDiv.innerHTML = `
            <p class="text-2xl mb-2">${isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto'}</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">${q.explanation}</p>
            <button onclick="JapanUtils.nextQuizQuestion()" class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold transition">
                ${this.currentQuizIndex < this.quizQuestions.length - 1 ? 'Siguiente Pregunta →' : 'Ver Resultados'}
            </button>
        `;
        resultDiv.classList.remove('hidden');
    },

    nextQuizQuestion() {
        this.currentQuizIndex++;
        this.showQuizQuestion();
    },

    showQuizResults() {
        const percentage = (this.quizScore / this.quizQuestions.length) * 100;
        let message = '';
        let emoji = '';

        if (percentage === 100) {
            emoji = '🏆';
            message = '¡Perfecto! Eres un experto en cultura japonesa';
        } else if (percentage >= 60) {
            emoji = '👏';
            message = '¡Muy bien! Conoces bastante sobre Japón';
        } else {
            emoji = '📚';
            message = 'Sigue aprendiendo, ¡vas por buen camino!';
        }

        document.getElementById('quizQuestion').innerHTML = `
            <div class="text-center">
                <p class="text-6xl mb-4">${emoji}</p>
                <p class="text-3xl font-bold text-gray-800 dark:text-white mb-2">${this.quizScore}/${this.quizQuestions.length}</p>
                <p class="text-lg text-gray-600 dark:text-gray-300 mb-4">${message}</p>
                <button onclick="JapanUtils.startQuiz()" class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold transition">
                    🔄 Reintentar Quiz
                </button>
            </div>
        `;
    },

    // 8. PALABRAS DEL DÍA
    renderDailyPhrases() {
        return `
            <div class="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-teal-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🗣️ Frases Japonesas Útiles
                </h4>
                <div id="dailyPhraseDisplay" class="space-y-3">
                    <!-- Se llenará dinámicamente -->
                </div>
                <button onclick="JapanUtils.showRandomPhrase()" class="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-lg font-bold shadow-md transition">
                    🎲 Frase Aleatoria
                </button>
            </div>
        `;
    },

    phrases: [
        { japanese: "おはよう (Ohayou)", spanish: "Buenos días", romaji: "Ohayou" },
        { japanese: "こんにちは (Konnichiwa)", spanish: "Hola / Buenas tardes", romaji: "Konnichiwa" },
        { japanese: "こんばんは (Konbanwa)", spanish: "Buenas noches", romaji: "Konbanwa" },
        { japanese: "ありがとう (Arigatou)", spanish: "Gracias", romaji: "Arigatou" },
        { japanese: "すみません (Sumimasen)", spanish: "Disculpe / Perdón", romaji: "Sumimasen" },
        { japanese: "いただきます (Itadakimasu)", spanish: "Buen provecho (antes de comer)", romaji: "Itadakimasu" },
        { japanese: "ごちそうさま (Gochisousama)", spanish: "Gracias por la comida (después)", romaji: "Gochisousama" },
        { japanese: "さようなら (Sayounara)", spanish: "Adiós", romaji: "Sayounara" },
        { japanese: "いくらですか (Ikura desu ka)", spanish: "¿Cuánto cuesta?", romaji: "Ikura desu ka?" },
        { japanese: "トイレはどこですか (Toire wa doko desu ka)", spanish: "¿Dónde está el baño?", romaji: "Toire wa doko desu ka?" },
        { japanese: "助けて (Tasukete)", spanish: "¡Ayuda!", romaji: "Tasukete!" },
        { japanese: "わかりません (Wakarimasen)", spanish: "No entiendo", romaji: "Wakarimasen" }
    ],

    showDailyPhrases() {
        const display = document.getElementById('dailyPhraseDisplay');
        if (!display) return;

        // Mostrar 4 frases aleatorias
        const shuffled = [...this.phrases].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);

        display.innerHTML = selected.map(phrase => `
            <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-teal-400">
                <p class="text-2xl font-bold text-gray-800 dark:text-white mb-1">${phrase.japanese}</p>
                <p class="text-sm text-gray-600 dark:text-gray-300 italic mb-1">${phrase.romaji}</p>
                <p class="text-base text-gray-700 dark:text-gray-200">${phrase.spanish}</p>
            </div>
        `).join('');
    },

    showRandomPhrase() {
        const phrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
        const display = document.getElementById('dailyPhraseDisplay');

        display.innerHTML = `
            <div class="bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/60 dark:to-cyan-900/60 p-6 rounded-lg text-center border-2 border-teal-400">
                <p class="text-4xl font-bold text-gray-800 dark:text-white mb-2">${phrase.japanese}</p>
                <p class="text-lg text-gray-600 dark:text-gray-300 italic mb-3">${phrase.romaji}</p>
                <p class="text-xl text-gray-700 dark:text-gray-100 font-semibold">${phrase.spanish}</p>
            </div>
        `;
    },

    // 9. TARJETAS DE ALERGIAS
    renderAllergyCards() {
        return `
            <div class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border-l-4 border-red-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    ⚠️ Tarjetas de Alergias en Japonés
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Muestra estas tarjetas en restaurantes para comunicar alergias o restricciones</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-2 border-red-300 dark:border-red-600">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">🥜 Alergia a maní</p>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white">ピーナッツアレルギー</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Pīnattsu arerugī</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">🦐 Alergia a mariscos</p>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white">甲殻類アレルギー</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Kōkakurui arerugī</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-600">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">🥛 Intolerancia a lactosa</p>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white">乳糖不耐症</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Nyūtō futaishō</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-2 border-green-300 dark:border-green-600">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">🌾 Vegetariano</p>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white">ベジタリアン</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Bejitarian</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">🌱 Vegano</p>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white">ビーガン</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Bīgan</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">🌾 Sin gluten</p>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white">グルテンフリー</p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Guruten furī</p>
                    </div>
                </div>

                <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p class="text-sm text-gray-700 dark:text-gray-300">
                        💡 <strong>Tip:</strong> Toma screenshot de estas tarjetas para mostrarlas fácilmente en restaurantes
                    </p>
                </div>
            </div>
        `;
    },

    // 10. GUÍA DE ONSEN
    renderOnsenGuide() {
        return `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-l-4 border-blue-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    ♨️ Guía de Onsen (Baños Termales)
                </h4>

                <div class="space-y-3">
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                        <p class="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                            <span class="text-2xl">1️⃣</span> Antes de entrar
                        </p>
                        <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-8">
                            <li>• Quítate TODA la ropa en el vestuario</li>
                            <li>• Guarda tus cosas en un casillero</li>
                            <li>• Lleva solo una toalla pequeña</li>
                        </ul>
                    </div>

                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                        <p class="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                            <span class="text-2xl">2️⃣</span> Lávate ANTES de entrar
                        </p>
                        <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-8">
                            <li>• Usa las duchas o banquitos</li>
                            <li>• Lávate completamente con jabón</li>
                            <li>• Enjuágate bien antes de entrar al onsen</li>
                        </ul>
                    </div>

                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                        <p class="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                            <span class="text-2xl">3️⃣</span> Dentro del onsen
                        </p>
                        <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-8">
                            <li>• NO metas la toalla en el agua</li>
                            <li>• Ponla sobre tu cabeza o a un lado</li>
                            <li>• Mantén silencio y relájate</li>
                            <li>• No salpiques ni nades</li>
                        </ul>
                    </div>

                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
                        <p class="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                            <span class="text-2xl">⚠️</span> Reglas importantes
                        </p>
                        <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-8">
                            <li>• Prohibido si tienes tatuajes visibles (algunos lugares)</li>
                            <li>• Separan por género (hombres/mujeres)</li>
                            <li>• No tomes fotos dentro</li>
                            <li>• Sécate antes de volver al vestuario</li>
                        </ul>
                    </div>

                    <div class="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 p-4 rounded-lg">
                        <p class="text-sm text-gray-700 dark:text-gray-200 font-semibold">
                            💆 Beneficios: Relajación, mejora circulación, piel suave, experiencia cultural única
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    // 11. RESTAURANTE ALEATORIO
    renderRandomRestaurant() {
        return `
            <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-l-4 border-orange-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🍜 ¿Dónde Comemos?
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">No puedes decidir? Deja que el azar elija por ti</p>

                <button onclick="JapanUtils.pickRandomRestaurant()" class="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-lg font-bold shadow-lg transition transform hover:scale-105 mb-4">
                    🎲 Elegir Restaurante Aleatorio
                </button>

                <div id="randomRestaurantResult" class="hidden">
                    <div class="bg-white dark:bg-gray-700 p-6 rounded-lg border-2 border-orange-400 text-center">
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Hoy comes en:</p>
                        <p class="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2" id="restaurantName"></p>
                        <p class="text-lg text-gray-700 dark:text-gray-300 mb-1" id="restaurantType"></p>
                        <p class="text-sm text-gray-600 dark:text-gray-400" id="restaurantPrice"></p>
                    </div>
                </div>
            </div>
        `;
    },

    restaurants: [
        { name: 'Ichiran Ramen', type: '🍜 Ramen', price: '¥1000-1500' },
        { name: 'Sukiyabashi Jiro', type: '🍣 Sushi Premium', price: '¥30000+' },
        { name: 'Yoshinoya', type: '🍚 Gyudon (Bowl de Carne)', price: '¥400-800' },
        { name: 'CoCo Ichibanya', type: '🍛 Curry Japonés', price: '¥800-1200' },
        { name: 'Katsuya', type: '🥩 Tonkatsu', price: '¥1000-1500' },
        { name: 'Conveyor Belt Sushi', type: '🍣 Sushi Rotatorio', price: '¥2000-3000' },
        { name: 'Tempura Tsunahachi', type: '🍤 Tempura', price: '¥2000-3000' },
        { name: 'Yakiniku-ya', type: '🥓 Barbacoa Coreana', price: '¥3000-5000' },
        { name: 'Izakaya Local', type: '🍻 Pub Japonés', price: '¥2000-4000' },
        { name: 'Udon Restaurant', type: '🍜 Udon', price: '¥600-1000' },
        { name: 'Okonomiyaki', type: '🥞 Panqueque Japonés', price: '¥1000-1500' },
        { name: 'Takoyaki Stand', type: '🐙 Bolitas de Pulpo', price: '¥500-800' }
    ],

    pickRandomRestaurant() {
        const random = this.restaurants[Math.floor(Math.random() * this.restaurants.length)];
        document.getElementById('restaurantName').textContent = random.name;
        document.getElementById('restaurantType').textContent = random.type;
        document.getElementById('restaurantPrice').textContent = random.price;
        document.getElementById('randomRestaurantResult').classList.remove('hidden');
    },

    // 12. RASTREADOR DE COMIDAS
    renderFoodTracker() {
        return `
            <div class="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6 border-l-4 border-pink-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🍱 Rastreador de Comidas Japonesas
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Marca las comidas típicas que ya probaste</p>

                <div id="foodTrackerGrid" class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <!-- Se llenará dinámicamente -->
                </div>

                <div class="mt-4 p-4 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 rounded-lg text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Has probado:</p>
                    <p class="text-3xl font-bold text-pink-600 dark:text-pink-400"><span id="foodCount">0</span> / <span id="foodTotal">0</span></p>
                </div>
            </div>
        `;
    },

    foods: [
        { id: 'ramen', name: 'Ramen', emoji: '🍜' },
        { id: 'sushi', name: 'Sushi', emoji: '🍣' },
        { id: 'tempura', name: 'Tempura', emoji: '🍤' },
        { id: 'tonkatsu', name: 'Tonkatsu', emoji: '🥩' },
        { id: 'okonomiyaki', name: 'Okonomiyaki', emoji: '🥞' },
        { id: 'takoyaki', name: 'Takoyaki', emoji: '🐙' },
        { id: 'udon', name: 'Udon', emoji: '🍜' },
        { id: 'soba', name: 'Soba', emoji: '🍜' },
        { id: 'yakitori', name: 'Yakitori', emoji: '🍗' },
        { id: 'onigiri', name: 'Onigiri', emoji: '🍙' },
        { id: 'mochi', name: 'Mochi', emoji: '🍡' },
        { id: 'matcha', name: 'Matcha', emoji: '🍵' },
        { id: 'sake', name: 'Sake', emoji: '🍶' },
        { id: 'curry', name: 'Curry Japonés', emoji: '🍛' },
        { id: 'gyoza', name: 'Gyoza', emoji: '🥟' },
        { id: 'taiyaki', name: 'Taiyaki', emoji: '🐟' }
    ],

    loadFoodTracker() {
        const trackedFoods = JSON.parse(localStorage.getItem('trackedFoods') || '[]');
        const grid = document.getElementById('foodTrackerGrid');

        if (grid) {
            grid.innerHTML = this.foods.map(food => {
                const checked = trackedFoods.includes(food.id);
                return `
                    <button onclick="JapanUtils.toggleFood('${food.id}')"
                            class="food-item p-4 rounded-lg border-2 transition transform hover:scale-105 ${
                                checked
                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border-green-400 dark:border-green-600'
                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                            }"
                            data-food-id="${food.id}">
                        <div class="text-4xl mb-2">${food.emoji}</div>
                        <div class="text-sm font-semibold text-gray-800 dark:text-white">${food.name}</div>
                        ${checked ? '<div class="text-green-600 dark:text-green-400 text-xs mt-1">✓ Probado</div>' : ''}
                    </button>
                `;
            }).join('');

            this.updateFoodCount();
        }
    },

    toggleFood(foodId) {
        let trackedFoods = JSON.parse(localStorage.getItem('trackedFoods') || '[]');

        if (trackedFoods.includes(foodId)) {
            trackedFoods = trackedFoods.filter(id => id !== foodId);
        } else {
            trackedFoods.push(foodId);
        }

        localStorage.setItem('trackedFoods', JSON.stringify(trackedFoods));
        this.loadFoodTracker();
    },

    updateFoodCount() {
        const trackedFoods = JSON.parse(localStorage.getItem('trackedFoods') || '[]');
        const countEl = document.getElementById('foodCount');
        const totalEl = document.getElementById('foodTotal');

        if (countEl) countEl.textContent = trackedFoods.length;
        if (totalEl) totalEl.textContent = this.foods.length;
    },

    // 13. BINGO DE VIAJE
    renderTravelBingo() {
        return `
            <div class="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-l-4 border-purple-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🎯 Bingo de Viaje - Experiencias en Japón
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Completa estas experiencias típicas durante tu viaje</p>

                <div id="bingoGrid" class="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                    <!-- Se llenará dinámicamente -->
                </div>

                <div class="flex gap-2">
                    <button onclick="JapanUtils.resetBingo()" class="flex-1 bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg font-bold transition">
                        🔄 Reiniciar
                    </button>
                    <div class="flex-1 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 p-3 rounded-lg text-center">
                        <p class="text-sm text-gray-600 dark:text-gray-300">Completadas:</p>
                        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400"><span id="bingoCount">0</span> / 16</p>
                    </div>
                </div>
            </div>
        `;
    },

    bingoItems: [
        { id: 'shrine', emoji: '⛩️', text: 'Visitar un santuario' },
        { id: 'fuji', emoji: '🗻', text: 'Ver el Monte Fuji' },
        { id: 'konbini', emoji: '🏪', text: 'Comprar en konbini' },
        { id: 'bow', emoji: '🙇', text: 'Hacer una reverencia' },
        { id: 'chopsticks', emoji: '🥢', text: 'Usar palillos' },
        { id: 'train', emoji: '🚄', text: 'Viajar en Shinkansen' },
        { id: 'sakura', emoji: '🌸', text: 'Ver sakura' },
        { id: 'cosplay', emoji: '👘', text: 'Ver cosplayers' },
        { id: 'arcade', emoji: '🎮', text: 'Ir a un arcade' },
        { id: 'karaoke', emoji: '🎤', text: 'Hacer karaoke' },
        { id: 'vending', emoji: '🥤', text: 'Usar máquina expendedora' },
        { id: 'deer', emoji: '🦌', text: 'Alimentar ciervos en Nara' },
        { id: 'capsule', emoji: '🏨', text: 'Dormir en hotel cápsula' },
        { id: 'photo', emoji: '📸', text: 'Selfie con Hachiko' },
        { id: 'neon', emoji: '💡', text: 'Foto en Shibuya de noche' },
        { id: 'sumo', emoji: '🥋', text: 'Ver algo de sumo' }
    ],

    loadBingo() {
        const completedItems = JSON.parse(localStorage.getItem('bingoCompleted') || '[]');
        const grid = document.getElementById('bingoGrid');

        if (grid) {
            grid.innerHTML = this.bingoItems.map(item => {
                const completed = completedItems.includes(item.id);
                return `
                    <button onclick="JapanUtils.toggleBingo('${item.id}')"
                            class="bingo-cell aspect-square p-3 rounded-lg border-2 transition transform hover:scale-105 flex flex-col items-center justify-center text-center ${
                                completed
                                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-600 dark:to-emerald-700 border-green-500 dark:border-green-400'
                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                            }"
                            data-bingo-id="${item.id}">
                        <div class="text-3xl mb-1">${item.emoji}</div>
                        <div class="text-xs font-semibold text-gray-800 dark:text-white leading-tight">${item.text}</div>
                        ${completed ? '<div class="text-white text-xl mt-1">✓</div>' : ''}
                    </button>
                `;
            }).join('');

            this.updateBingoCount();
        }
    },

    toggleBingo(itemId) {
        let completedItems = JSON.parse(localStorage.getItem('bingoCompleted') || '[]');

        if (completedItems.includes(itemId)) {
            completedItems = completedItems.filter(id => id !== itemId);
        } else {
            completedItems.push(itemId);
        }

        localStorage.setItem('bingoCompleted', JSON.stringify(completedItems));
        this.loadBingo();
    },

    resetBingo() {
        if (confirm('¿Seguro que quieres reiniciar el bingo?')) {
            localStorage.removeItem('bingoCompleted');
            this.loadBingo();
        }
    },

    updateBingoCount() {
        const completedItems = JSON.parse(localStorage.getItem('bingoCompleted') || '[]');
        const countEl = document.getElementById('bingoCount');

        if (countEl) countEl.textContent = completedItems.length;
    },

    // 14. DICCIONARIO VISUAL DE COMIDA
    renderFoodDictionary() {
        return `
            <div class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-6 border-l-4 border-amber-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    📖 Diccionario Visual de Comida Japonesa
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Guía visual con nombres en japonés y español</p>

                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    ${this.foodDictionary.map(food => `
                        <div class="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition">
                            <div class="text-5xl text-center mb-2">${food.emoji}</div>
                            <div class="text-center">
                                <p class="font-bold text-gray-800 dark:text-white text-sm mb-1">${food.nameEs}</p>
                                <p class="text-lg text-gray-700 dark:text-gray-300 mb-1">${food.nameJa}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 italic">${food.romaji}</p>
                                <p class="text-xs text-gray-600 dark:text-gray-300 mt-2">${food.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    foodDictionary: [
        { emoji: '🍜', nameEs: 'Ramen', nameJa: 'ラーメン', romaji: 'Rāmen', description: 'Sopa de fideos con caldo' },
        { emoji: '🍣', nameEs: 'Sushi', nameJa: '寿司', romaji: 'Sushi', description: 'Arroz con pescado crudo' },
        { emoji: '🍱', nameEs: 'Bento', nameJa: '弁当', romaji: 'Bentō', description: 'Caja de comida variada' },
        { emoji: '🍤', nameEs: 'Tempura', nameJa: '天ぷら', romaji: 'Tempura', description: 'Mariscos/vegetales fritos' },
        { emoji: '🥟', nameEs: 'Gyoza', nameJa: '餃子', romaji: 'Gyōza', description: 'Empanadillas japonesas' },
        { emoji: '🍙', nameEs: 'Onigiri', nameJa: 'おにぎり', romaji: 'Onigiri', description: 'Bola de arroz rellena' },
        { emoji: '🍛', nameEs: 'Curry', nameJa: 'カレー', romaji: 'Karē', description: 'Curry japonés con arroz' },
        { emoji: '🥩', nameEs: 'Tonkatsu', nameJa: 'とんかつ', romaji: 'Tonkatsu', description: 'Chuleta de cerdo frita' },
        { emoji: '🐙', nameEs: 'Takoyaki', nameJa: 'たこ焼き', romaji: 'Takoyaki', description: 'Bolitas de pulpo' },
        { emoji: '🥞', nameEs: 'Okonomiyaki', nameJa: 'お好み焼き', romaji: 'Okonomiyaki', description: 'Panqueque japonés' },
        { emoji: '🍗', nameEs: 'Yakitori', nameJa: '焼き鳥', romaji: 'Yakitori', description: 'Brochetas de pollo' },
        { emoji: '🍵', nameEs: 'Matcha', nameJa: '抹茶', romaji: 'Matcha', description: 'Té verde en polvo' },
        { emoji: '🍡', nameEs: 'Mochi', nameJa: '餅', romaji: 'Mochi', description: 'Pastel de arroz dulce' },
        { emoji: '🍶', nameEs: 'Sake', nameJa: '日本酒', romaji: 'Nihonshu', description: 'Vino de arroz' },
        { emoji: '🍚', nameEs: 'Donburi', nameJa: '丼', romaji: 'Donburi', description: 'Bowl de arroz con topping' },
        { emoji: '🥘', nameEs: 'Nabemono', nameJa: '鍋物', romaji: 'Nabemono', description: 'Guiso en olla caliente' }
    ],

    // 15. CONTADOR DE EXPERIENCIAS
    renderExperienceCounter() {
        return `
            <div class="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border-l-4 border-green-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    📊 Contador de Experiencias
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Resumen de tu viaje hasta ahora</p>

                <div id="experienceStats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <!-- Se llenará dinámicamente -->
                </div>

                <button onclick="JapanUtils.refreshExperienceCounter()" class="mt-4 w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg font-bold transition">
                    🔄 Actualizar Estadísticas
                </button>
            </div>
        `;
    },

    refreshExperienceCounter() {
        const trackedFoods = JSON.parse(localStorage.getItem('trackedFoods') || '[]');
        const bingoCompleted = JSON.parse(localStorage.getItem('bingoCompleted') || '[]');
        const visitedPlaces = JSON.parse(localStorage.getItem('visitedPlaces') || '[]');
        const collectedStamps = JSON.parse(localStorage.getItem('stamps') || '[]');

        const stats = [
            { icon: '🍱', label: 'Comidas Probadas', value: trackedFoods.length, total: this.foods.length, color: 'pink' },
            { icon: '🎯', label: 'Experiencias Bingo', value: bingoCompleted.length, total: 16, color: 'purple' },
            { icon: '📍', label: 'Lugares Visitados', value: visitedPlaces.length, total: '∞', color: 'blue' },
            { icon: '🎫', label: 'Sellos Colectados', value: collectedStamps.length, total: '∞', color: 'orange' }
        ];

        const statsDiv = document.getElementById('experienceStats');
        if (statsDiv) {
            statsDiv.innerHTML = stats.map(stat => `
                <div class="bg-white dark:bg-gray-700 rounded-lg p-4 text-center shadow-md">
                    <div class="text-4xl mb-2">${stat.icon}</div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${stat.label}</p>
                    <p class="text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400">
                        ${stat.value}
                    </p>
                    ${stat.total !== '∞' ? `<p class="text-xs text-gray-500 dark:text-gray-400">de ${stat.total}</p>` : ''}
                </div>
            `).join('');
        }
    },

    // 16. MÁQUINA DE SELLOS VIRTUAL
    renderStampCollection() {
        return `
            <div class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border-l-4 border-red-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🎫 Máquina de Sellos Virtual
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Colecciona sellos de lugares que visitas (como en Japón)</p>

                <div class="mb-4 flex gap-2">
                    <input
                        type="text"
                        id="stampPlaceName"
                        placeholder="Nombre del lugar"
                        class="flex-1 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                    <button onclick="JapanUtils.addStamp()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition">
                        ➕ Agregar
                    </button>
                </div>

                <div id="stampCollection" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <!-- Se llenará dinámicamente -->
                </div>

                <div class="mt-4 p-3 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 rounded-lg text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-300">Total de sellos:</p>
                    <p class="text-3xl font-bold text-red-600 dark:text-red-400"><span id="stampCount">0</span></p>
                </div>
            </div>
        `;
    },

    stampEmojis: ['⛩️', '🗻', '🏯', '🌸', '🎋', '🎎', '🏮', '🎌', '🗼', '⛰️', '🌊', '🦌', '🐟', '🎴', '🥋', '🎭'],

    loadStamps() {
        const stamps = JSON.parse(localStorage.getItem('stamps') || '[]');
        const grid = document.getElementById('stampCollection');
        const countEl = document.getElementById('stampCount');

        if (grid) {
            if (stamps.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center p-8 text-gray-500 dark:text-gray-400">
                        <p class="text-4xl mb-2">🎫</p>
                        <p>Aún no tienes sellos. ¡Visita lugares y colecciónalos!</p>
                    </div>
                `;
            } else {
                grid.innerHTML = stamps.map((stamp, idx) => `
                    <div class="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md relative group">
                        <button onclick="JapanUtils.removeStamp(${idx})"
                                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition">
                            ×
                        </button>
                        <div class="text-5xl text-center mb-2">${stamp.emoji}</div>
                        <p class="text-sm font-bold text-gray-800 dark:text-white text-center truncate">${stamp.place}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">${stamp.date}</p>
                    </div>
                `).join('');
            }
        }

        if (countEl) countEl.textContent = stamps.length;
    },

    addStamp() {
        const input = document.getElementById('stampPlaceName');
        const placeName = input?.value.trim();

        if (!placeName) {
            alert('Por favor ingresa el nombre del lugar');
            return;
        }

        const stamps = JSON.parse(localStorage.getItem('stamps') || '[]');
        const randomEmoji = this.stampEmojis[Math.floor(Math.random() * this.stampEmojis.length)];

        stamps.push({
            place: placeName,
            emoji: randomEmoji,
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        });

        localStorage.setItem('stamps', JSON.stringify(stamps));

        if (input) input.value = '';
        this.loadStamps();
    },

    removeStamp(index) {
        if (confirm('¿Eliminar este sello?')) {
            const stamps = JSON.parse(localStorage.getItem('stamps') || '[]');
            stamps.splice(index, 1);
            localStorage.setItem('stamps', JSON.stringify(stamps));
            this.loadStamps();
        }
    },

    // 17. TAGS EN FAVORITOS (placeholder - requiere integración con sistema existente)
    renderFavoriteTags() {
        return `
            <div class="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6 border-l-4 border-yellow-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🏷️ Organiza tus Favoritos con Tags
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Categoriza lugares guardados para encontrarlos fácilmente</p>

                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    ${this.favoriteTags.map(tag => `
                        <button onclick="JapanUtils.filterFavoritesByTag('${tag.id}')"
                                class="bg-white dark:bg-gray-700 p-4 rounded-lg hover:shadow-lg transition text-center">
                            <div class="text-3xl mb-2">${tag.emoji}</div>
                            <p class="text-sm font-bold text-gray-800 dark:text-white">${tag.name}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400" id="tagCount-${tag.id}">0 lugares</p>
                        </button>
                    `).join('')}
                </div>

                <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p class="text-sm text-gray-700 dark:text-gray-300">
                        💡 <strong>Tip:</strong> Usa el modal de Favoritos para asignar tags a tus lugares guardados
                    </p>
                </div>
            </div>
        `;
    },

    favoriteTags: [
        { id: 'food', emoji: '🍜', name: 'Restaurantes' },
        { id: 'temple', emoji: '⛩️', name: 'Templos' },
        { id: 'shopping', emoji: '🛍️', name: 'Tiendas' },
        { id: 'nature', emoji: '🌸', name: 'Naturaleza' },
        { id: 'museum', emoji: '🏛️', name: 'Museos' },
        { id: 'nightlife', emoji: '🌃', name: 'Vida Nocturna' }
    ],

    filterFavoritesByTag(tagId) {
        // Placeholder - se integrará con sistema de favoritos existente
        alert(`Filtro por tag: ${tagId}\n\nEsta función se integrará con tu sistema de favoritos existente.`);
    },

    // 18. RACHA DE ACTIVIDADES
    renderActivityStreak() {
        return `
            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-l-4 border-indigo-500">
                <h4 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🔥 Racha de Actividades
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Mantén tu racha diaria activa</p>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    ${this.streakActivities.map(activity => `
                        <div class="bg-white dark:bg-gray-700 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <span class="text-2xl">${activity.emoji}</span>
                                    <span class="font-bold text-gray-800 dark:text-white text-sm">${activity.name}</span>
                                </div>
                            </div>
                            <div class="text-center py-3">
                                <p class="text-4xl font-bold text-indigo-600 dark:text-indigo-400" id="streak-${activity.id}">0</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">días seguidos</p>
                            </div>
                            <button onclick="JapanUtils.logActivity('${activity.id}')"
                                    class="w-full bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-lg font-bold text-sm transition">
                                ✓ Hecho Hoy
                            </button>
                        </div>
                    `).join('')}
                </div>

                <div class="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-lg">
                    <p class="text-sm text-gray-700 dark:text-gray-300 text-center">
                        🎯 <strong>¡Mantén tus rachas activas!</strong> Marca cada día que completes estas actividades
                    </p>
                </div>
            </div>
        `;
    },

    streakActivities: [
        { id: 'food', emoji: '🍜', name: 'Probar comida local' },
        { id: 'photo', emoji: '📸', name: 'Tomar fotos' },
        { id: 'learn', emoji: '📝', name: 'Aprender japonés' }
    ],

    loadStreaks() {
        const streaks = JSON.parse(localStorage.getItem('streaks') || '{}');

        this.streakActivities.forEach(activity => {
            const streakData = streaks[activity.id] || { count: 0, lastDate: null };
            const streakEl = document.getElementById(`streak-${activity.id}`);

            // Verificar si la racha está rota (más de 1 día sin actividad)
            if (streakData.lastDate) {
                const lastDate = new Date(streakData.lastDate);
                const today = new Date();
                const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

                if (diffDays > 1) {
                    streakData.count = 0; // Racha rota
                }
            }

            if (streakEl) {
                streakEl.textContent = streakData.count;
            }
        });
    },

    logActivity(activityId) {
        const streaks = JSON.parse(localStorage.getItem('streaks') || '{}');
        const today = new Date().toDateString();

        const streakData = streaks[activityId] || { count: 0, lastDate: null };

        // Verificar si ya se logueó hoy
        if (streakData.lastDate === today) {
            alert('¡Ya marcaste esta actividad hoy! 🎉');
            return;
        }

        // Verificar si es día consecutivo
        const lastDate = streakData.lastDate ? new Date(streakData.lastDate) : null;
        const todayDate = new Date();

        if (lastDate) {
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Día consecutivo
                streakData.count += 1;
            } else if (diffDays > 1) {
                // Racha rota, reiniciar
                streakData.count = 1;
            }
        } else {
            // Primera vez
            streakData.count = 1;
        }

        streakData.lastDate = today;
        streaks[activityId] = streakData;

        localStorage.setItem('streaks', JSON.stringify(streaks));

        // Mostrar celebración
        alert(`🎉 ¡${streakData.count} día${streakData.count > 1 ? 's' : ''} seguido${streakData.count > 1 ? 's' : ''}! ¡Sigue así!`);

        this.loadStreaks();
    },

    // Inicializar todo
    init() {
        // Se llamará cuando se cargue el tab de utils
        this.updateCountdown();
        this.showDailyPhrases();
        this.startQuiz();

        // Actualizar countdown cada minuto
        setInterval(() => this.updateCountdown(), 60000);
    }
};

// Exportar para uso global
window.JapanUtils = JapanUtils;
