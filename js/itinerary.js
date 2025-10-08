// js/itinerary.js

import { ITINERARY_DATA } from './itinerary-data.js';

let checkedActivities = JSON.parse(localStorage.getItem('checkedActivities') || '{}');
let currentDay = 1;

function selectDay(dayNumber) {
    currentDay = dayNumber;
    render();
}

function toggleActivity(activityId) {
    checkedActivities[activityId] = !checkedActivities[activityId];
    localStorage.setItem('checkedActivities', JSON.stringify(checkedActivities));
    render();
}

function render() {
    const dayData = ITINERARY_DATA.find(d => d.day === currentDay);
    if (!dayData) return;
    renderDaySelector();
    renderDayOverview(dayData);
    renderActivities(dayData);
}

function renderDaySelector() {
    const container = document.getElementById('daySelector');
    if (!container) return;
    
    container.innerHTML = ITINERARY_DATA.map(day => `
        <button data-day="${day.day}" class="day-btn px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
            currentDay === day.day 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }">
            Día ${day.day}
        </button>
    `).join('');
}

function renderDayOverview(day) {
    const container = document.getElementById('dayOverview');
    if (!container) return;
    
    const completed = day.activities.filter(a => checkedActivities[a.id]).length;
    const progress = day.activities.length > 0 ? (completed / day.activities.length) * 100 : 0;
    
    container.innerHTML = `
        <div class="flex items-center gap-2 mb-4">
            <span class="text-2xl">📅</span>
            <h2 class="text-2xl font-bold dark:text-white">Día ${day.day}</h2>
        </div>
        <div class="mb-4">
            <div class="flex justify-between text-sm mb-1 dark:text-gray-300">
                <span>Progreso</span>
                <span>${completed}/${day.activities.length}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-red-600 h-2 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
            </div>
        </div>
        <div class="space-y-3 text-sm">
            <p class="font-semibold text-base dark:text-gray-300">${day.date}</p>
            <p class="font-bold text-lg text-red-600 dark:text-red-400">${day.title}</p>
            <p class="dark:text-gray-300">🏨 ${day.hotel}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">📍 ${day.location}</p>
        </div>
    `;
}

function renderActivities(day) {
    const container = document.getElementById('activitiesTimeline');
    if (!container) return;
    
    container.innerHTML = day.activities.map((act, i) => `
        <div class="activity-card bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 border-red-500 fade-in transition-all hover:shadow-lg ${
            checkedActivities[act.id] ? 'opacity-60' : ''
        }" style="animation-delay: ${i * 0.05}s">
            <div class="p-5 flex items-start gap-4">
                <input 
                    type="checkbox" 
                    data-id="${act.id}" 
                    ${checkedActivities[act.id] ? 'checked' : ''} 
                    class="activity-checkbox mt-1 w-5 h-5 cursor-pointer accent-red-600 flex-shrink-0"
                >
                <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-2xl flex-shrink-0">
                    ${act.icon}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">${act.time}</span>
                        ${act.cost > 0 ? `<span class="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">¥${act.cost.toLocaleString()}</span>` : ''}
                    </div>
                    <h3 class="text-lg font-bold dark:text-white mb-1">${act.title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${act.desc}</p>
                    ${act.station ? `<p class="text-xs text-gray-500 dark:text-gray-500 mt-2">🚉 ${act.station}</p>` : ''}
                    ${act.train ? `
                        <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-2 border-blue-500">
                            <p class="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">🚄 ${act.train.line}</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400">${act.train.from} → ${act.train.to}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-500">⏱️ ${act.train.duration}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

export const ItineraryHandler = {
    init() {
        const container = document.getElementById('content-itinerary');
        if (!container) return;
        
        container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[72px] z-30 shadow-sm">
                <div class="max-w-6xl mx-auto p-4">
                    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" id="daySelector"></div>
                </div>
            </div>
            <div class="max-w-6xl mx-auto p-4 md:p-6">
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="md:col-span-1">
                        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-36 fade-in" id="dayOverview"></div>
                    </div>
                    <div class="md:col-span-2">
                        <div class="space-y-4" id="activitiesTimeline"></div>
                    </div>
                </div>
            </div>
        `;

        render();

        const daySelector = document.getElementById('daySelector');
        if (daySelector) {
            daySelector.addEventListener('click', (e) => {
                const btn = e.target.closest('.day-btn');
                if (btn) selectDay(parseInt(btn.dataset.day));
            });
        }

        const timeline = document.getElementById('activitiesTimeline');
        if (timeline) {
            timeline.addEventListener('change', (e) => {
                const checkbox = e.target.closest('.activity-checkbox');
                if (checkbox) toggleActivity(checkbox.dataset.id);
            });
        }
    }
};
