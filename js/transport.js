// js/transport.js - Guía Completa de Transporte

export const TransportHandler = {
    yourRoutes: [
        { from: 'Narita Airport', to: 'Tokyo (Shinjuku)', price: 3070, line: 'Narita Express', day: 1, duration: '90 min' },
        { from: 'Tokyo', to: 'Kyoto', price: 13320, line: 'Tokaido Shinkansen (Hikari)', day: 4, duration: '2h 20min' },
        { from: 'Kyoto', to: 'Osaka', price: 570, line: 'JR Kyoto Line', day: 6, duration: '30 min' },
        { from: 'Osaka', to: 'Tokyo', price: 13870, line: 'Tokaido Shinkansen (Hikari)', day: 8, duration: '2h 40min' },
        { from: 'Tokyo', to: 'Narita Airport', price: 3070, line: 'Narita Express', day: 15, duration: '90 min' }
    ],

    jrPassPrices: {
        7: 38000,
        14: 62000,
        21: 85000
    },

    renderTransport() {
        const container = document.getElementById('content-transport');
        if (!container) return;

        const totalIndividual = this.yourRoutes.reduce((sum, route) => sum + route.price, 0);
        const jrPass14 = this.jrPassPrices[14];
        const savings = jrPass14 - totalIndividual;

        container.innerHTML = `
            <div class="max-w-6xl mx-auto p-4 md:p-6">
                <h2 class="text-4xl font-bold mb-6 text-gray-800 dark:text-white">🚆 Guía de Transporte</h2>

                <!-- Hero Section: Tu Recomendación -->
                ${this.renderRecommendation(totalIndividual, jrPass14, savings)}

                <!-- Tu Itinerario Específico -->
                ${this.renderYourRoutes(totalIndividual)}

                <div class="grid lg:grid-cols-2 gap-6 mt-6">
                    <!-- Calculadora JR Pass -->
                    ${this.renderJRPassCalculator()}

                    <!-- IC Cards (Suica/Pasmo) -->
                    ${this.renderICCards()}
                </div>

                <!-- Apps de Transporte -->
                ${this.renderTransportApps()}

                <div class="grid lg:grid-cols-2 gap-6 mt-6">
                    <!-- Reserved vs Unreserved -->
                    ${this.renderSeatsGuide()}

                    <!-- Dónde Comprar Tickets -->
                    ${this.renderTicketPurchase()}
                </div>

                <!-- Tips & Tricks -->
                ${this.renderTips()}
            </div>
        `;

        this.attachEventListeners();
    },

    renderRecommendation(totalIndividual, jrPass14, savings) {
        return `
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 mb-6 shadow-lg">
                <div class="flex items-start gap-4">
                    <div class="text-6xl">💡</div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold mb-2">Tu Mejor Opción: Tickets Individuales</h3>
                        <p class="text-sm opacity-90 mb-4">Para tu viaje de 15 días con 5 rutas principales, los tickets individuales son más económicos que el JR Pass.</p>
                        
                        <div class="grid md:grid-cols-3 gap-4">
                            <div class="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                                <p class="text-xs opacity-80 mb-1">Tickets Individuales</p>
                                <p class="text-3xl font-bold">¥${totalIndividual.toLocaleString()}</p>
                                <p class="text-xs opacity-80">~$${Math.round(totalIndividual / 145)} USD</p>
                            </div>
                            <div class="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                                <p class="text-xs opacity-80 mb-1">JR Pass 14 días</p>
                                <p class="text-3xl font-bold">¥${jrPass14.toLocaleString()}</p>
                                <p class="text-xs opacity-80">~$${Math.round(jrPass14 / 145)} USD</p>
                            </div>
                            <div class="bg-yellow-400/30 rounded-lg p-4 backdrop-blur-sm border-2 border-yellow-300">
                                <p class="text-xs font-bold mb-1">💰 TU AHORRO</p>
                                <p class="text-3xl font-bold">¥${savings.toLocaleString()}</p>
                                <p class="text-xs font-bold">~$${Math.round(savings / 145)} USD</p>
                            </div>
                        </div>

                        <div class="mt-4 p-3 bg-white/10 rounded-lg">
                            <p class="text-xs font-semibold mb-2">✅ Ventajas para ti:</p>
                            <ul class="text-xs space-y-1 opacity-90">
                                <li>• No necesitas activar el JR Pass en el aeropuerto</li>
                                <li>• Flexibilidad total en horarios (no limitado a 7/14 días consecutivos)</li>
                                <li>• Ahorras ~$45 USD vs JR Pass 14 días</li>
                                <li>• Más fácil: compras tickets según necesites</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderYourRoutes(total) {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🎫 Tus 5 Rutas Principales
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Estas son las rutas de tren de larga distancia que necesitas para tu itinerario de 15 días.
                </p>

                <div class="space-y-3">
                    ${this.yourRoutes.map((route, index) => `
                        <div class="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-l-4 border-blue-500">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-bold text-blue-600 dark:text-blue-400">DÍA ${route.day} • ${route.line}</span>
                                <span class="text-lg font-bold text-green-600 dark:text-green-400">¥${route.price.toLocaleString()}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2 items-center">
                                <div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Desde</p>
                                    <p class="font-semibold dark:text-white">${route.from}</p>
                                </div>
                                <div class="text-center">
                                    <p class="text-2xl text-gray-400">→</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">${route.duration}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Hacia</p>
                                    <p class="font-semibold dark:text-white">${route.to}</p>
                                </div>
                            </div>
                            <div class="mt-2">
                                <a href="https://world.hyper dia.com/en/?dep=${encodeURIComponent(route.from)}&arr=${encodeURIComponent(route.to)}" target="_blank" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                    🔍 Ver horarios en Hyperdia →
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-bold text-gray-800 dark:text-white">Total en Tickets</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400">5 rutas principales</p>
                        </div>
                        <div class="text-right">
                            <p class="text-3xl font-bold text-green-600 dark:text-green-400">¥${total.toLocaleString()}</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400">~$${Math.round(total / 145)} USD</p>
                        </div>
                    </div>
                </div>

                <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p class="text-xs text-gray-700 dark:text-gray-300">
                        💡 <strong>Nota:</strong> Estos precios NO incluyen transporte local en metro/bus dentro de cada ciudad. 
                        Para eso, necesitarás una <strong>Suica o Pasmo card</strong> (ver abajo).
                    </p>
                </div>
            </div>
        `;
    },

    renderJRPassCalculator() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    🧮 Calculadora JR Pass
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    ¿Quieres verificar si el JR Pass vale la pena para otros itinerarios?
                </p>

                <div class="space-y-4">
                    <div>
                        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                            Días del JR Pass:
                        </label>
                        <select id="jrPassDays" class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="7">7 días - ¥38,000 (~$262)</option>
                            <option value="14" selected>14 días - ¥62,000 (~$427)</option>
                            <option value="21">21 días - ¥85,000 (~$586)</option>
                        </select>
                    </div>

                    <div>
                        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                            Costo estimado de tus tickets:
                        </label>
                        <input 
                            type="number" 
                            id="customTicketCost" 
                            value="33900" 
                            class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="33900"
                        >
                    </div>

                    <button id="calculateJRPass" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                        🧮 Calcular
                    </button>

                    <div id="calculatorResult" class="hidden p-4 rounded-lg">
                        <!-- Results will be inserted here -->
                    </div>
                </div>

                <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p class="text-xs text-gray-700 dark:text-gray-300">
                        💡 <strong>Tip:</strong> El JR Pass generalmente vale la pena si haces viajes Tokyo↔Kyoto/Osaka múltiples veces 
                        o si visitas más ciudades lejanas (Hiroshima, Nagano, etc.)
                    </p>
                </div>
            </div>
        `;
    },

    renderICCards() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    💳 Suica & Pasmo Cards
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Para transporte local (metro, autobuses, konbinis)
                </p>

                <div class="space-y-4">
                    <!-- Apple Wallet (DESTACADO) -->
                    <div class="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
                        <div class="flex items-start gap-3">
                            <span class="text-3xl">📱</span>
                            <div class="flex-1">
                                <p class="font-bold text-lg mb-2">¡NUEVO! Suica en Apple Wallet</p>
                                <p class="text-sm opacity-90 mb-3">
                                    La forma más fácil: Agrega Suica directamente a tu iPhone/Apple Watch. 
                                    No necesitas comprar tarjeta física.
                                </p>
                                <div class="space-y-2 text-sm">
                                    <div class="flex items-start gap-2">
                                        <span>1️⃣</span>
                                        <span>Abre <strong>Wallet app</strong> en iPhone</span>
                                    </div>
                                    <div class="flex items-start gap-2">
                                        <span>2️⃣</span>
                                        <span>Toca "+" para agregar tarjeta</span>
                                    </div>
                                    <div class="flex items-start gap-2">
                                        <span>3️⃣</span>
                                        <span>Selecciona "Suica"</span>
                                    </div>
                                    <div class="flex items-start gap-2">
                                        <span>4️⃣</span>
                                        <span>Recarga con tarjeta de crédito (mínimo ¥1,000)</span>
                                    </div>
                                    <div class="flex items-start gap-2">
                                        <span>5️⃣</span>
                                        <span>¡Listo! Usa tu iPhone/Watch en torniquetes</span>
                                    </div>
                                </div>
                                <div class="mt-3 p-2 bg-white/20 rounded">
                                    <p class="text-xs">
                                        ✅ <strong>Ventaja:</strong> Puedes recargar desde tu hotel sin buscar máquinas
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tarjeta Física -->
                    <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p class="font-bold text-gray-800 dark:text-white mb-2">Tarjeta Física (alternativa)</p>
                        <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                            <li>💰 Costo: ¥500 de depósito + ¥1,500 saldo inicial</li>
                            <li>📍 Dónde comprar: Máquinas en estaciones (Narita, Tokyo, Shinjuku)</li>
                            <li>🔄 Recarga: En konbinis (7-Eleven, FamilyMart) o máquinas</li>
                            <li>💳 Funciona en: Todos los metros, buses, konbinis, vending machines</li>
                            <li>♻️ Reembolso: Puedes recuperar el depósito al final (menos ¥220 fee)</li>
                        </ul>
                    </div>

                    <!-- Suica vs Pasmo -->
                    <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p class="text-xs text-gray-700 dark:text-gray-300">
                            💡 <strong>Suica vs Pasmo:</strong> Son iguales. Funcionan en TODO Japón (Tokyo, Kyoto, Osaka). 
                            Elige cualquiera. Apple Wallet solo tiene Suica.
                        </p>
                    </div>

                    <!-- Presupuesto recomendado -->
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                        <p class="font-bold text-gray-800 dark:text-white mb-2">Presupuesto recomendado:</p>
                        <div class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <p>• <strong>Metro diario:</strong> ¥500-800/día</p>
                            <p>• <strong>15 días:</strong> ~¥10,000 en transporte local</p>
                            <p>• <strong>Recarga inicial:</strong> ¥3,000-5,000</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderTransportApps() {
        const apps = [
            { 
                name: 'Hyperdia', 
                icon: '🚆', 
                desc: 'LA MEJOR para buscar horarios de trenes. Funciona offline.',
                link: 'https://www.hyperdia.com/en/',
                rating: '⭐⭐⭐⭐⭐'
            },
            { 
                name: 'Google Maps', 
                icon: '🗺️', 
                desc: 'Navegación en tiempo real. Incluye metros y buses.',
                link: 'https://maps.google.com',
                rating: '⭐⭐⭐⭐⭐'
            },
            { 
                name: 'Japan Transit Planner', 
                icon: '🚇', 
                desc: 'App oficial. Muy precisa pero interface menos amigable.',
                link: 'https://www.jorudan.co.jp/english/',
                rating: '⭐⭐⭐⭐'
            },
            { 
                name: 'Smart EX', 
                icon: '🎫', 
                desc: 'Compra tickets de Shinkansen online (requiere tarjeta internacional).',
                link: 'https://smart-ex.jp/en/',
                rating: '⭐⭐⭐⭐'
            },
            { 
                name: 'JR East App', 
                icon: '🚄', 
                desc: 'Info de trenes JR East. Útil para Narita Express y Tokyo.',
                link: 'https://www.jreast.co.jp/e/app/',
                rating: '⭐⭐⭐⭐'
            }
        ];

        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
                <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">📱 Apps Esenciales de Transporte</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Descarga ANTES del viaje. Algunas funcionan offline.
                </p>

                <div class="grid md:grid-cols-2 gap-4">
                    ${apps.map(app => `
                        <a href="${app.link}" target="_blank" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-lg transition border-l-4 border-blue-500">
                            <div class="flex items-start gap-3">
                                <span class="text-3xl">${app.icon}</span>
                                <div class="flex-1">
                                    <div class="flex items-center justify-between mb-1">
                                        <p class="font-bold dark:text-white">${app.name}</p>
                                        <span class="text-xs">${app.rating}</span>
                                    </div>
                                    <p class="text-sm text-gray-600 dark:text-gray-300">${app.desc}</p>
                                </div>
                                <span class="text-gray-400">→</span>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderSeatsGuide() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">🪑 Reserved vs Unreserved Seats</h3>
                
                <div class="space-y-4">
                    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <p class="font-bold text-blue-700 dark:text-blue-400 mb-2">Reserved Seats (指定席)</p>
                        <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <li>✅ Asiento garantizado</li>
                            <li>💰 Costo extra: ~¥500-1,000</li>
                            <li>🎯 Mejor para: Rutas largas (Tokyo-Kyoto), fines de semana</li>
                            <li>🎫 Compra en: Taquillas o máquinas con "Reserved"</li>
                        </ul>
                    </div>

                    <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                        <p class="font-bold text-green-700 dark:text-green-400 mb-2">Unreserved Seats (自由席)</p>
                        <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <li>✅ Sin reserva, llegas y subes</li>
                            <li>💰 Precio estándar (más barato)</li>
                            <li>⚠️ Puede que tengas que ir de pie si está lleno</li>
                            <li>🎯 Mejor para: Entre semana, rutas cortas</li>
                        </ul>
                    </div>

                    <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p class="text-xs font-bold text-gray-800 dark:text-white mb-2">💡 Mi recomendación para ti:</p>
                        <ul class="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                            <li>✅ <strong>Reserved:</strong> Tokyo↔Kyoto, Tokyo↔Osaka (rutas largas)</li>
                            <li>✅ <strong>Unreserved:</strong> Kyoto→Osaka (30 min, no vale la pena reserved)</li>
                            <li>✅ <strong>Narita Express:</strong> Unreserved es suficiente</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },

    renderTicketPurchase() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">🎫 Dónde Comprar Tickets</h3>
                
                <div class="space-y-3">
                    <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p class="font-bold text-purple-700 dark:text-purple-400 mb-2">Opción 1: Taquillas (Midori no Madoguchi) ⭐</p>
                        <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">LA MÁS FÁCIL para extranjeros</p>
                        <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <li>✅ Personal habla inglés básico</li>
                            <li>✅ Puedes pedir reserved o unreserved</li>
                            <li>✅ Aceptan tarjetas internacionales</li>
                            <li>📍 Ubica la ventana con kanji "みどりの窓口" (verde)</li>
                        </ul>
                    </div>

                    <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p class="font-bold text-blue-700 dark:text-blue-400 mb-2">Opción 2: Máquinas Automáticas</p>
                        <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <li>✅ Tienen opción en inglés</li>
                            <li>✅ Más rápido (si sabes usarlas)</li>
                            <li>⚠️ Solo efectivo o IC card</li>
                            <li>📍 Busca las grandes con pantalla touch</li>
                        </ul>
                    </div>

                    <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p class="font-bold text-green-700 dark:text-green-400 mb-2">Opción 3: Smart EX (App/Web)</p>
                        <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <li>✅ Compra desde tu hotel</li>
                            <li>✅ Recoge ticket en máquina con código QR</li>
                            <li>⚠️ Requiere tarjeta de crédito internacional</li>
                            <li>💳 Link: smart-ex.jp/en</li>
                        </ul>
                    </div>
                </div>

                <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p class="text-xs font-bold text-gray-800 dark:text-white mb-2">📋 Info para mostrar en taquilla:</p>
                    <div class="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                        <p>🗓️ "February 19, Tokyo to Kyoto, two adults, unreserved"</p>
                        <p>🎫 Escribe en papel: <strong>2名 東京→京都 2/19 自由席</strong></p>
                    </div>
                </div>
            </div>
        `;
    },

    renderTips() {
        const tips = [
            { 
                icon: '⏰', 
                title: 'Llega 10-15 min antes', 
                desc: 'Los trenes son SÚPER puntuales. Si dice 10:03, sale 10:03 exacto.' 
            },
            { 
                icon: '🎒', 
                title: 'Equipaje en overhead', 
                desc: 'Maletas grandes van en espacios al final del vagón. Overhead solo para mochilas/bolsos.' 
            },
            { 
                icon: '🔇', 
                title: 'Modo silencioso', 
                desc: 'NO hables por teléfono en trenes. Pon tu cel en silencio. Es parte de la etiqueta.' 
            },
            { 
                icon: '🍱', 
                title: 'Ekiben (lunch boxes)', 
                desc: 'Compra bento boxes en estaciones. Comer en Shinkansen es permitido y tradicional.' 
            },
            { 
                icon: '📱', 
                title: 'WiFi gratis', 
                desc: 'Shinkansen tiene WiFi gratis. Usuario: Shinkansen-Free-Wi-Fi' 
            },
            { 
                icon: '🚪', 
                title: 'Puertas NO se abren solas', 
                desc: 'En trenes locales, presiona el botón verde para abrir la puerta.' 
            }
        ];

        return `
            <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg p-6 mt-6">
                <h3 class="text-2xl font-bold mb-4">💡 Tips & Tricks de Transporte</h3>
                
                <div class="grid md:grid-cols-2 gap-4">
                    ${tips.map(tip => `
                        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div class="flex items-start gap-3">
                                <span class="text-3xl">${tip.icon}</span>
                                <div>
                                    <p class="font-bold mb-1">${tip.title}</p>
                                    <p class="text-sm opacity-90">${tip.desc}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="mt-4 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                    <p class="text-sm font-bold mb-2">🆘 ¿Perdiste tu tren?</p>
                    <p class="text-xs opacity-90">
                        Tranquilo. Ve a la taquilla y muestra tu ticket. Te pueden cambiar al siguiente tren SIN COSTO EXTRA 
                        (si es unreserved). Si es reserved, puede que tengas que pagar diferencia.
                    </p>
                </div>
            </div>
        `;
    },

    attachEventListeners() {
        const calculateBtn = document.getElementById('calculateJRPass');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateJRPass());
        }
    },

    calculateJRPass() {
        const days = parseInt(document.getElementById('jrPassDays').value);
        const ticketCost = parseInt(document.getElementById('customTicketCost').value) || 0;
        const jrPassCost = this.jrPassPrices[days];
        const difference = jrPassCost - ticketCost;
        const resultDiv = document.getElementById('calculatorResult');

        if (difference > 0) {
            // Tickets individuales son mejores
            resultDiv.innerHTML = `
                <div class="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 p-4">
                    <p class="font-bold text-green-700 dark:text-green-400 mb-2">✅ Tickets Individuales = Mejor opción</p>
                    <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Ahorras <strong>¥${Math.abs(difference).toLocaleString()}</strong> (~$${Math.round(Math.abs(difference) / 145)})
                    </p>
                    <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p>• JR Pass ${days} días: ¥${jrPassCost.toLocaleString()}</p>
                        <p>• Tus tickets: ¥${ticketCost.toLocaleString()}</p>
                        <p>• Diferencia: <strong class="text-green-600">-¥${Math.abs(difference).toLocaleString()}</strong></p>
                    </div>
                </div>
            `;
        } else {
            // JR Pass es mejor
            resultDiv.innerHTML = `
                <div class="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4">
                    <p class="font-bold text-blue-700 dark:text-blue-400 mb-2">✅ JR Pass = Mejor opción</p>
                    <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Ahorras <strong>¥${Math.abs(difference).toLocaleString()}</strong> (~$${Math.round(Math.abs(difference) / 145)})
                    </p>
                    <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p>• Tus tickets: ¥${ticketCost.toLocaleString()}</p>
                        <p>• JR Pass ${days} días: ¥${jrPassCost.toLocaleString()}</p>
                        <p>• Diferencia: <strong class="text-blue-600">-¥${Math.abs(difference).toLocaleString()}</strong></p>
                    </div>
                </div>
            `;
        }

        resultDiv.classList.remove('hidden');
    }
};

window.TransportHandler = TransportHandler;
