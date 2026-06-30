// js/essentials.js - Información Esencial para Viajeros a Japón

import { escapeHTML } from '../../utils/helpers.js';
import { Logger } from '../../utils/helpers.js';

/**
 * EssentialsHandler - Guía rápida de información esencial para Japón
 */
export const EssentialsHandler = {

    essentialsData: {
        money: {
            title: '💴 Dinero y Pagos',
            icon: '💴',
            items: [
                { label: 'Moneda', value: 'Yen japonés (¥ JPY)' },
                { label: 'Cambio aproximado', value: '1 USD ≈ ¥145 | 1 EUR ≈ ¥155' },
                { label: 'Efectivo necesario', value: 'Sí, muchos lugares solo aceptan efectivo' },
                { label: 'Dónde cambiar', value: 'Aeropuerto, 7-Eleven, bancos' },
                { label: 'Tarjetas aceptadas', value: 'Visa, Mastercard en tiendas grandes' },
                { label: 'ATMs 24/7', value: '7-Eleven, Family Mart, Lawson' },
                { label: 'Propina', value: 'NO dar propina (puede ser ofensivo)' }
            ]
        },
        transport: {
            title: '🚇 Transporte',
            icon: '🚇',
            items: [
                { label: 'Tarjeta IC', value: 'Suica o Pasmo (recargables, universales)' },
                { label: 'Dónde comprar', value: 'Estaciones de tren, aeropuerto' },
                { label: 'Depósito', value: '¥500 (reembolsable al devolver)' },
                { label: 'JR Pass', value: 'Solo para turistas, comprar antes de llegar' },
                { label: 'Taxis', value: 'Caros, última opción. Puertas automáticas' },
                { label: 'Apps útiles', value: 'Google Maps, Hyperdia, Japan Transit' },
                { label: 'Último tren', value: 'Usualmente 00:00-01:00' }
            ]
        },
        internet: {
            title: '📱 Internet y Comunicación',
            icon: '📱',
            items: [
                { label: 'WiFi gratuito', value: 'Limitado, solo en cafeterías y estaciones' },
                { label: 'Pocket WiFi', value: 'Recomendado, ¥500-1000/día' },
                { label: 'SIM turística', value: 'Alternativa, solo datos' },
                { label: 'Apps esenciales', value: 'Google Translate, Maps, Tabelog' },
                { label: 'Número emergencia', value: '110 (policía) | 119 (ambulancia)' },
                { label: 'WiFi gratis', value: 'Japan Connected-free WiFi app' }
            ]
        },
        etiquette: {
            title: '🎎 Etiqueta Japonesa',
            icon: '🎎',
            items: [
                { label: 'Zapatos', value: 'Quitarse en casas, templos, algunos restaurantes' },
                { label: 'Palillos', value: 'No clavarlos en arroz, no pasarlos directamente' },
                { label: 'Silencio', value: 'No hablar fuerte en trenes' },
                { label: 'Comer en público', value: 'Evitar caminar y comer simultáneamente' },
                { label: 'Basura', value: 'Llevar bolsa, pocos botes públicos' },
                { label: 'Tatuajes', value: 'Pueden prohibir entrada a onsen/baños' },
                { label: 'Reverencia', value: 'Inclinarse al saludar/agradecer' },
                { label: 'Fotos', value: 'Pedir permiso en templos y a personas' }
            ]
        },
        food: {
            title: '🍜 Comida',
            icon: '🍜',
            items: [
                { label: 'Comedores baratos', value: 'Yoshinoya, Sukiya, Matsuya (¥400-800)' },
                { label: 'Konbini food', value: '7-Eleven, Lawson, Family Mart (excelente)' },
                { label: 'Restaurantes', value: 'Menú con fotos usualmente en entrada' },
                { label: 'Ordenar', value: 'Máquinas expendedoras en muchos lugares' },
                { label: 'Agua', value: 'Gratis en todos los restaurantes' },
                { label: 'Alérgenos', value: 'Llevar tarjeta de alergias en japonés' },
                { label: 'Vegetariano', value: 'Difícil, muchos caldos tienen pescado' }
            ]
        },
        practical: {
            title: '🔌 Información Práctica',
            icon: '🔌',
            items: [
                { label: 'Voltaje', value: '100V, enchufes tipo A/B (US style)' },
                { label: 'Hora', value: 'JST (UTC+9), sin horario de verano' },
                { label: 'Baños públicos', value: 'Gratis, limpios, en todas las estaciones' },
                { label: 'Konbini', value: '24/7, tienen de todo, baños gratis' },
                { label: 'Idioma', value: 'Poco inglés, usar traductor' },
                { label: 'Mejor época', value: 'Primavera (sakura) u Otoño (koyo)' },
                { label: 'Clima', value: 'Verano: calor húmedo | Invierno: seco y frío' }
            ]
        }
    },

    quickTips: [
        '💡 Descarga mapas offline antes de llegar',
        '💡 Los trenes son puntuales al segundo',
        '💡 Las bebidas en máquinas expendedoras son seguras',
        '💡 "Sumimasen" (disculpe) es la palabra más útil',
        '💡 Los baños públicos tienen papel, pero lleva pañuelos',
        '💡 Las tiendas abren hasta tarde (20:00-22:00)',
        '💡 No hay botes de basura, guarda tu basura',
        '💡 Los templos abren temprano (6:00-7:00 AM)'
    ],

    init() {
        Logger.info('📋 EssentialsHandler: Inicializando...');
        this.render();
    },

    render() {
        const container = document.getElementById('content-essentials');
        if (!container) {
            Logger.warn('EssentialsHandler: Container #content-essentials no encontrado');
            return;
        }

        const html = `
            <div class="essentials-container p-6">
                <!-- Header -->
                <div class="mb-8 text-center">
                    <h2 class="text-3xl font-bold mb-3">🇯🇵 Guía Esencial para Japón</h2>
                    <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Información básica y práctica que todo viajero debe saber antes y durante su viaje a Japón
                    </p>
                </div>

                <!-- Quick Tips Banner -->
                <div class="mb-8 bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 p-6 rounded-lg border-2 border-pink-200 dark:border-pink-800">
                    <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
                        <span>💡</span> Tips Rápidos
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        ${this.quickTips.map(tip => `
                            <div class="flex items-start gap-2 text-sm">
                                <span class="text-pink-600 dark:text-pink-400">→</span>
                                <span>${escapeHTML(tip)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Essentials Categories Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    ${Object.values(this.essentialsData).map(category => this.renderCategory(category)).join('')}
                </div>

                <!-- Emergency Quick Access -->
                <div class="mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-300 dark:border-red-800">
                    <div class="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h3 class="font-bold text-lg mb-2 text-red-700 dark:text-red-400">
                                🚨 Emergencias
                            </h3>
                            <p class="text-sm text-gray-700 dark:text-gray-300">
                                Policía: <strong class="text-xl">110</strong> |
                                Ambulancia: <strong class="text-xl">119</strong> |
                                Japan Helpline (inglés): <strong class="text-xl">0570-000-911</strong>
                            </p>
                        </div>
                        <button onclick="document.getElementById('emergencyModal')?.classList.remove('hidden'); window.EmergencyAssistant?.init();"
                                class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                            Ver Info Completa
                        </button>
                    </div>
                </div>

                <!-- Useful Links -->
                <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="https://www.japan.travel/en/" target="_blank" rel="noopener"
                       class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors text-center">
                        <div class="text-2xl mb-2">🗾</div>
                        <div class="font-bold mb-1">Japan Travel</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">Guía oficial de turismo</div>
                    </a>
                    <a href="https://transit.yahoo.co.jp/en" target="_blank" rel="noopener"
                       class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-colors text-center">
                        <div class="text-2xl mb-2">🚆</div>
                        <div class="font-bold mb-1">Yahoo Transit</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">Rutas de transporte</div>
                    </a>
                    <a href="https://www.jnto.go.jp/emergency/eng/mi_guide.html" target="_blank" rel="noopener"
                       class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 transition-colors text-center">
                        <div class="text-2xl mb-2">🏥</div>
                        <div class="font-bold mb-1">Medical Guide</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">Guía médica en inglés</div>
                    </a>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    renderCategory(category) {
        return `
            <div class="category-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                <!-- Category Header -->
                <div class="category-header p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="font-bold text-lg flex items-center gap-2">
                        <span class="text-2xl">${category.icon}</span>
                        <span>${escapeHTML(category.title)}</span>
                    </h3>
                </div>

                <!-- Category Items -->
                <div class="category-items p-4">
                    <div class="space-y-3">
                        ${category.items.map(item => `
                            <div class="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <div class="flex-shrink-0 w-32 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                    ${escapeHTML(item.label)}:
                                </div>
                                <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">
                                    ${escapeHTML(item.value)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    cleanup() {
        Logger.info('🧹 EssentialsHandler: Cleaned up');
    }
};

// Exponer globalmente
if (typeof window !== 'undefined') {
    window.EssentialsHandler = EssentialsHandler;
}
