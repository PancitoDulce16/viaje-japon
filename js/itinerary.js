// js/itinerary.js

import { ITINERARY_DATA } from './itinerary-data.js';
import { AppCore } from './core.js';

export const ItineraryHandler = {
  renderItinerary() {
    this.renderDaySelector();
    this.selectDay(1);
  },

  renderDaySelector() {
    const selector = document.getElementById('daySelector');
    if (!selector) return;
    selector.innerHTML = ITINERARY_DATA.map(day => `
      <button 
        onclick="ItineraryHandler.selectDay(${day.day})"
        class="day-btn px-3 md:px-4 py-2 rounded-lg whitespace-nowrap font-medium text-sm transition ${
          AppCore.state.currentDay === day.day 
            ? 'bg-red-600 text-white shadow-md scale-105' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }"
        aria-label="Seleccionar Día ${day.day}"
      >
        Día ${day.day}
      </button>
    `).join('');
  },

  selectDay(dayNumber) {
    AppCore.state.currentDay = dayNumber;
    const day = ITINERARY_DATA.find(d => d.day === dayNumber);
    if (!day) return;
    this.renderDaySelector();
    this.renderDayOverview(day);
    this.renderActivities(day);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderDayOverview(day) {
    const overview = document.getElementById('dayOverview');
    if (!overview) return;
    const completedActivities = day.activities.filter(a => AppCore.state.checkedActivities[a.id]).length;
    const progress = (completedActivities / day.activities.length) * 100;
    overview.innerHTML = `
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl">📅</span>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Día ${day.day}</h2>
      </div>
      <div class="mb-4">
        <div class="flex justify-between text-sm mb-1 dark:text-gray-300">
          <span>Progreso</span>
          <span>${completedActivities}/${day.activities.length}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
      <div class="space-y-3 text-sm">
        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Fecha</p>
          <p class="font-semibold text-base dark:text-white">${day.date}</p>
        </div>
        <div class="p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border-l-4 border-red-500">
          <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Título</p>
          <p class="font-bold text-base text-red-600 dark:text-red-400">${day.title}</p>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Ubicación</p>
          <p class="font-semibold flex items-center gap-2 dark:text-white">
            <span class="text-lg">📍</span> 
            <span>${day.location}</span>
          </p>
        </div>
        <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-l-4 border-green-500">
          <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-2">Presupuesto</p>
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">$${day.budget}</p>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Hotel</p>
          <p class="font-semibold text-sm dark:text-white">${day.hotel}</p>
        </div>
      </div>
    `;
  },

  renderActivities(day) {
    const timeline = document.getElementById('activitiesTimeline');
    if (!timeline) return;
    timeline.innerHTML = day.activities.map((activity, index) => {
      const isChecked = AppCore.state.checkedActivities[activity.id];
      return `
        <div class="activity-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-l-4 border-red-500 fade-in ${isChecked ? 'checkbox-done' : ''}" 
             style="animation-delay: ${index * 0.05}s">
          <div class="p-5">
            <div class="flex items-start gap-4">
              <input 
                type="checkbox" 
                id="activity-${activity.id}"
                ${isChecked ? 'checked' : ''} 
                onchange="ItineraryHandler.toggleActivity('${activity.id}')"
                class="mt-1 w-5 h-5 cursor-pointer accent-red-600"
                aria-checked="${isChecked}"
                aria-label="Marcar actividad ${activity.title}"
              >
              <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg flex-shrink-0 text-2xl">
                ${activity.icon}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex flex-col gap-3">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-base">🕐</span>
                        <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">${activity.time}</span>
                      </div>
                      <h3 class="activity-title text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 leading-tight">
                        ${AppCore.escapeHtml(activity.title)}
                      </h3>
                      <p class="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">${AppCore.escapeHtml(activity.desc)}</p>
                    </div>
                    <div class="flex-shrink-0">
                      ${activity.cost > 0 
                        ? `<div class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap">$${activity.cost}</div>`
                        : `<div class="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap">GRATIS</div>`
                      }
                    </div>
                  </div>
                  ${activity.train ? `
                    <div class="train-info text-white p-4 rounded-lg text-sm shadow-md">
                      <div class="flex items-center gap-2 mb-3">
                        <span class="text-xl">🚆</span>
                        <span class="font-bold text-base">Info de Tren</span>
                      </div>
                      <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span class="opacity-75">Desde:</span>
                          <p class="font-semibold mt-1">${AppCore.escapeHtml(activity.train.from)}</p>
                        </div>
                        <div>
                          <span class="opacity-75">Hasta:</span>
                          <p class="font-semibold mt-1">${AppCore.escapeHtml(activity.train.to)}</p>
                        </div>
                        <div class="col-span-2">
                          <span class="opacity-75">Línea:</span>
                          <p class="font-semibold mt-1">${AppCore.escapeHtml(activity.train.line)}</p>
                        </div>
                        <div class="col-span-2">
                          <span class="opacity-75">Duración:</span>
                          <p class="font-semibold mt-1">${activity.train.duration}</p>
                        </div>
                      </div>
                    </div>
                  ` : ''}
                  ${activity.station ? `
                    <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span class="text-base">📍</span>
                      <span>${AppCore.escapeHtml(activity.station)}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleActivity(activityId) {
    AppCore.state.checkedActivities[activityId] = !AppCore.state.checkedActivities[activityId];
    localStorage.setItem('checkedActivities', JSON.stringify(AppCore.state.checkedActivities));
    const day = ITINERARY_DATA.find(d => d.day === AppCore.state.currentDay);
    if (day) {
      this.renderActivities(day);
      this.renderDayOverview(day);
    }
  }
};

