// js/festivals.js - Festivales y Matsuri locales por fecha y ciudad

export const Festivals = {
    // Database de festivales japoneses (top festivals por mes)
    festivalsData: [
        // Enero
        { name: 'Hatsumode', month: 1, days: [1, 2, 3], cities: ['Tokyo', 'Kyoto', 'Osaka', 'Todo Japón'], description: 'Primera visita del año al templo', icon: '⛩️', type: 'religioso' },
        { name: 'Seijin no Hi', month: 1, day: 8, cities: ['Todo Japón'], description: 'Día de la Mayoría de Edad', icon: '🎌', type: 'nacional' },
        // Febrero
        { name: 'Setsubun', month: 2, day: 3, cities: ['Todo Japón'], description: 'Festival de primavera con lanzamiento de frijoles', icon: '🌸', type: 'tradicional' },
        { name: 'Sapporo Snow Festival', month: 2, days: [1, 11], cities: ['Sapporo'], description: 'Festival de esculturas de nieve gigantes', icon: '❄️', type: 'festival' },
        // Marzo
        { name: 'Hinamatsuri', month: 3, day: 3, cities: ['Todo Japón'], description: 'Festival de las Niñas con muñecas tradicionales', icon: '🎎', type: 'tradicional' },
        { name: 'Hanami (inicio)', month: 3, days: [20, 31], cities: ['Tokyo', 'Kyoto', 'Osaka'], description: 'Florecimiento de los cerezos', icon: '🌸', type: 'naturaleza' },
        // Abril
        { name: 'Hanami (peak)', month: 4, days: [1, 10], cities: ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima'], description: 'Pico del florecimiento de cerezos', icon: '🌸', type: 'naturaleza' },
        { name: 'Takayama Spring Festival', month: 4, days: [14, 15], cities: ['Takayama'], description: 'Uno de los 3 festivales más hermosos de Japón', icon: '🎊', type: 'festival' },
        // Mayo
        { name: 'Golden Week', month: 5, days: [1, 7], cities: ['Todo Japón'], description: 'Semana de feriados nacionales', icon: '🎌', type: 'nacional' },
        { name: 'Kodomo no Hi', month: 5, day: 5, cities: ['Todo Japón'], description: 'Día de los Niños con banderas koinobori', icon: '🎏', type: 'tradicional' },
        { name: 'Kanda Matsuri', month: 5, days: [11, 17], cities: ['Tokyo'], description: 'Uno de los 3 grandes festivales de Tokyo', icon: '🎊', type: 'matsuri' },
        // Junio
        { name: 'Sanno Matsuri', month: 6, days: [10, 16], cities: ['Tokyo'], description: 'Festival del Santuario Hie', icon: '⛩️', type: 'matsuri' },
        // Julio
        { name: 'Tanabata', month: 7, day: 7, cities: ['Todo Japón'], description: 'Festival de las Estrellas', icon: '⭐', type: 'tradicional' },
        { name: 'Gion Matsuri', month: 7, days: [1, 31], cities: ['Kyoto'], description: 'El festival más famoso de Japón', icon: '🎊', type: 'matsuri' },
        { name: 'Tenjin Matsuri', month: 7, days: [24, 25], cities: ['Osaka'], description: 'Uno de los 3 grandes festivales de Japón', icon: '🎊', type: 'matsuri' },
        // Agosto
        { name: 'Obon', month: 8, days: [13, 16], cities: ['Todo Japón'], description: 'Festival de los ancestros con danzas Bon Odori', icon: '🕯️', type: 'religioso' },
        { name: 'Awa Odori', month: 8, days: [12, 15], cities: ['Tokushima'], description: 'Festival de danza más grande de Japón', icon: '💃', type: 'festival' },
        { name: 'Fuji Rock Festival', month: 8, days: [1, 3], cities: ['Niigata'], description: 'Festival de música más grande de Japón', icon: '🎸', type: 'moderno' },
        // Septiembre
        { name: 'Tsukimi', month: 9, day: 15, cities: ['Todo Japón'], description: 'Festival de observación de la luna', icon: '🌕', type: 'tradicional' },
        // Octubre
        { name: 'Takayama Autumn Festival', month: 10, days: [9, 10], cities: ['Takayama'], description: 'Festival de otoño con carrozas', icon: '🍂', type: 'festival' },
        { name: 'Jidai Matsuri', month: 10, day: 22, cities: ['Kyoto'], description: 'Festival de las Épocas', icon: '🏯', type: 'matsuri' },
        // Noviembre
        { name: 'Shichi-Go-San', month: 11, day: 15, cities: ['Todo Japón'], description: 'Festival para niños de 3, 5 y 7 años', icon: '👘', type: 'tradicional' },
        { name: 'Tori-no-Ichi', month: 11, days: [1, 30], cities: ['Tokyo'], description: 'Feria del gallo en santuarios', icon: '🐓', type: 'religioso' },
        // Diciembre
        { name: 'Año Nuevo (preparación)', month: 12, days: [25, 31], cities: ['Todo Japón'], description: 'Preparativos para Año Nuevo', icon: '🎍', type: 'tradicional' },
        { name: 'Luminarias de Invierno', month: 12, days: [1, 31], cities: ['Tokyo', 'Osaka', 'Kobe'], description: 'Iluminaciones navideñas', icon: '✨', type: 'moderno' }
    ],

    render() {
        return `
            <div class="space-y-4">
                <!-- Header -->
                <div class="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-lg border-2 border-red-300 dark:border-red-600">
                    <h4 class="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                        <span>🎊</span>
                        <span>Festivales Locales</span>
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        Matsuri y eventos por fecha según tu viaje a Japón
                    </p>
                </div>

                <!-- Month Selector -->
                <div class="flex gap-2 overflow-x-auto pb-2">
                    ${this.renderMonthButtons()}
                </div>

                <!-- Festivals List -->
                <div id="festivalsList" class="space-y-3">
                    <div class="text-center text-gray-400 py-8">
                        Selecciona un mes para ver festivales
                    </div>
                </div>

                <!-- Legend -->
                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h5 class="font-bold text-sm text-gray-800 dark:text-white mb-2">Tipos de Festivales:</h5>
                    <div class="flex flex-wrap gap-2">
                        <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full text-xs font-semibold">🎊 Matsuri</span>
                        <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold">⛩️ Religioso</span>
                        <span class="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">🌸 Tradicional</span>
                        <span class="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-semibold">🎌 Nacional</span>
                        <span class="px-3 py-1 bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 rounded-full text-xs font-semibold">🎸 Moderno</span>
                    </div>
                </div>
            </div>
        `;
    },

    renderMonthButtons() {
        const months = [
            { num: 1, name: 'Enero', short: 'Ene' },
            { num: 2, name: 'Febrero', short: 'Feb' },
            { num: 3, name: 'Marzo', short: 'Mar' },
            { num: 4, name: 'Abril', short: 'Abr' },
            { num: 5, name: 'Mayo', short: 'May' },
            { num: 6, name: 'Junio', short: 'Jun' },
            { num: 7, name: 'Julio', short: 'Jul' },
            { num: 8, name: 'Agosto', short: 'Ago' },
            { num: 9, name: 'Septiembre', short: 'Sep' },
            { num: 10, name: 'Octubre', short: 'Oct' },
            { num: 11, name: 'Noviembre', short: 'Nov' },
            { num: 12, name: 'Diciembre', short: 'Dic' }
        ];

        return months.map(month => `
            <button
                onclick="Festivals.loadMonth(${month.num})"
                class="festival-month-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white transition smooth-scale btn-press"
                data-month="${month.num}"
            >
                <span class="hidden md:inline">${month.name}</span>
                <span class="md:hidden">${month.short}</span>
            </button>
        `).join('');
    },

    loadMonth(month) {
        // Update button styles
        document.querySelectorAll('.festival-month-btn').forEach(btn => {
            if (parseInt(btn.dataset.month) === month) {
                btn.className = 'festival-month-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-red-500 text-white';
            } else {
                btn.className = 'festival-month-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white transition';
            }
        });

        const festivals = this.festivalsData.filter(f => f.month === month);
        this.renderFestivals(festivals, month);
    },

    renderFestivals(festivals, month) {
        const container = document.getElementById('festivalsList');
        if (!container) return;

        if (festivals.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">🎊</p>
                    <p class="text-gray-600 dark:text-gray-400">No hay festivales principales en este mes</p>
                </div>
            `;
            return;
        }

        const typeColors = {
            matsuri: 'from-purple-500 to-pink-500 border-purple-300 dark:border-purple-700',
            religioso: 'from-blue-500 to-indigo-500 border-blue-300 dark:border-blue-700',
            tradicional: 'from-green-500 to-emerald-500 border-green-300 dark:border-green-700',
            nacional: 'from-yellow-500 to-orange-500 border-yellow-300 dark:border-yellow-700',
            festival: 'from-pink-500 to-rose-500 border-pink-300 dark:border-pink-700',
            moderno: 'from-indigo-500 to-purple-500 border-indigo-300 dark:border-indigo-700',
            naturaleza: 'from-green-400 to-teal-400 border-green-300 dark:border-green-700'
        };

        container.innerHTML = festivals.map(festival => {
            const gradient = typeColors[festival.type] || typeColors.festival;
            const dateText = festival.days
                ? `${festival.days[0]}-${festival.days[1]}`
                : `${festival.day}`;

            return `
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-2 ${gradient.split(' ')[1]} card-lift">
                    <div class="flex">
                        <!-- Icon Section -->
                        <div class="w-20 bg-gradient-to-br ${gradient.split(' ')[0]} flex items-center justify-center text-4xl">
                            ${festival.icon}
                        </div>

                        <!-- Content Section -->
                        <div class="flex-1 p-4">
                            <div class="flex justify-between items-start mb-2">
                                <h5 class="font-bold text-lg text-gray-800 dark:text-white">${festival.name}</h5>
                                <span class="text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap ml-2">
                                    ${dateText} ${this.getMonthName(month)}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                ${festival.description}
                            </p>
                            <div class="flex flex-wrap gap-2">
                                ${festival.cities.map(city => `
                                    <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-semibold">
                                        📍 ${city}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    getMonthName(month) {
        const names = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return names[month];
    },

    // Helper para encontrar festivales en un rango de fechas
    getFestivalsForDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return this.festivalsData.filter(festival => {
            const festivalDate = new Date(start.getFullYear(), festival.month - 1, festival.day || 1);

            if (festival.days) {
                const festivalStart = new Date(start.getFullYear(), festival.month - 1, festival.days[0]);
                const festivalEnd = new Date(start.getFullYear(), festival.month - 1, festival.days[1]);
                return (festivalStart <= end && festivalEnd >= start);
            }

            return (festivalDate >= start && festivalDate <= end);
        });
    }
};

// Exportar para uso global
window.Festivals = Festivals;
