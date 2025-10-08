import { ITINERARY_DATA } from './itinerary-data.js';
import { AppCore } from './core.js'; // Asumiendo que core exporta lo necesario

let checkedActivities = JSON.parse(localStorage.getItem('checkedActivities') || '{}');
let currentDay = 1;

function selectDay(dayNumber) {
    currentDay = dayNumber;
    const dayData = ITINERARY_DATA.find(d => d.day === dayNumber);
    renderDaySelector();
    renderDayOverview(dayData);
    renderActivities(dayData);
}

function toggleActivity(activityId) {
    checkedActivities[activityId] = !checkedActivities[activityId];
    localStorage.setItem('checkedActivities', JSON.stringify(checkedActivities));
    selectDay(currentDay);
}

function renderDaySelector() {
    const selector = document.getElementById('daySelector');
    if (!selector) return;
    selector.innerHTML = ITINERARY_DATA.map(day => `
        <button onclick="selectDayWrapper(${day.day})"
            class="day-btn px-4 py-2 rounded-lg whitespace-nowrap font-medium ${
                currentDay === day.day 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }">
            Día ${day.day}
        </button>
    `).join('');
}

function renderDayOverview(day) {
    const overview = document.getElementById('dayOverview');
    if(!overview) return;
    const completed = day.activities.filter(a => checkedActivities[a.id]).length;
    const progress = day.activities.length > 0 ? (completed / day.activities.length) * 100 : 0;
    
    overview.innerHTML = `
        <div class="flex items-center gap-2 mb-4"><span class="text-2xl">📅</span><h2 class="text-2xl font-bold text-gray-800 dark:text-white">Día ${day.day}</h2></div>
        <div class="mb-4">
            <div class="flex justify-between text-sm mb-1 dark:text-gray-300"><span>Progreso</span><span>${completed}/${day.activities.length}</span></div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-red-600 h-2 rounded-full transition-all" style="width: ${progress}%"></div></div>
        </div>
        <div class="space-y-3 text-sm">
            <p><strong>Fecha:</strong> ${day.date}</p>
            <p><strong>Título:</strong> ${day.title}</p>
            <p><strong>Hotel:</strong> ${day.hotel}</p>
        </div>
    `;
}

function renderActivities(day) {
    const timeline = document.getElementById('activitiesTimeline');
    if(!timeline) return;
    timeline.innerHTML = day.activities.map((act, i) => `
        <div class="activity-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-l-4 border-red-500 fade-in ${checkedActivities[act.id] ? 'checkbox-done' : ''}" style="animation-delay: ${i * 0.05}s">
            <div class="p-5"><div class="flex items-start gap-4">
                <input type="checkbox" onchange="toggleActivityWrapper('${act.id}')" ${checkedActivities[act.id] ? 'checked' : ''} class="mt-1 w-5 h-5 cursor-pointer accent-red-600">
                <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-2xl">${act.icon}</div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-bold">${act.title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${act.desc}</p>
                    ${act.train ? `<div class="train-info text-white p-2 rounded-md mt-2 text-xs">🚆 ${act.train.line} (${act.train.duration})</div>` : ''}
                </div>
            </div></div>
        </div>
    `).join('');
}

// Wrapper functions to be accessible globally
window.selectDayWrapper = selectDay;
window.toggleActivityWrapper = toggleActivity;

// Initial render for the itinerary
export const ItineraryHandler = {
    renderItinerary() {
        selectDay(1);
    }
};
