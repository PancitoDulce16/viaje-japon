// js/itinerary.js
import { ITINERARY_DATA } from './itinerary-data.js';
import { AppCore } from './core.js';

export const ItineraryHandler = {
  renderItinerary() {
    const container = document.getElementById('content-itinerary');
    if (!container) return;

    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <div id="dayOverview" class="sticky top-24"></div>
        </div>
        <div class="lg:col-span-2">
          <div id="daySelectorContainer" class="mb-4">
             <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Selecciona un día:</p>
             <div id="daySelector" class="flex flex-wrap gap-2"></div>
          </div>
          <div id="activitiesTimeline" class="space-y-4"></div>
        </div>
      </div>
    `;
    
    this.renderDaySelector();
    this.selectDay(AppCore.state.currentDay);
  },

  renderDaySelector() {
    const selector = document.getElementById('daySelector');
    if (!selector) return;
    selector.innerHTML = ITINERARY_DATA.map(day => `
      <button class="day-btn px-3 py-2 rounded-lg font-medium text-sm" data-day="${day.day}">Día ${day.day}</button>
    `).join('');

    selector.addEventListener('click', (e) => {
      const dayButton = e.target.closest('.day-btn');
      if(dayButton) {
        this.selectDay(parseInt(dayButton.dataset.day, 10));
      }
    });
  },

  selectDay(dayNumber) {
    AppCore.state.currentDay = dayNumber;
    const day = ITINERARY_DATA.find(d => d.day === dayNumber);
    if (!day) return;
    this.updateDaySelectorUI();
    this.renderDayOverview(day);
    this.renderActivities(day);
  },

  updateDaySelectorUI() {
    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.classList.remove('bg-red-600', 'text-white', 'shadow-md');
      btn.classList.add('bg-gray-100', 'dark:bg-gray-700');
      if (parseInt(btn.dataset.day, 10) === AppCore.state.currentDay) {
        btn.classList.add('bg-red-600', 'text-white', 'shadow-md');
      }
    });
  },

  renderDayOverview(day) {
    const overview = document.getElementById('dayOverview');
    if (!overview) return;
    const completed = day.activities.filter(a => AppCore.state.checkedActivities[a.id]).length;
    const progress = (day.activities.length > 0) ? (completed / day.activities.length) * 100 : 0;
    
    overview.innerHTML = `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div class="flex items-center gap-2 mb-4">
                <span class="text-2xl">📅</span>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Día ${day.day}</h2>
            </div>
            <div class="mb-4">
                <div class="flex justify-between text-sm mb-1 dark:text-gray-300">
                    <span>Progreso</span>
                    <span>${completed}/${day.activities.length}</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
            </div>
            <div class="space-y-3 text-sm">
                <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Fecha</p>
                    <p class="font-semibold text-base dark:text-white">${day.date}</p>
                </div>
                <div class="p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border-l-4 border-red-500">
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Título</p>
                    <p class="font-bold text-base text-red-600 dark:text-red-400">${AppCore.escapeHtml(day.title)}</p>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Hotel</p>
                    <p class="font-semibold text-sm dark:text-white">${day.hotel}</p>
                </div>
            </div>
        </div>
    `;
  },

  renderActivities(day) {
    const timeline = document.getElementById('activitiesTimeline');
    if (!timeline) return;
    timeline.innerHTML = day.activities.map((activity, index) => {
      const isChecked = !!AppCore.state.checkedActivities[activity.id];
      return `
        <div class="activity-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-l-4 border-red-500 fade-in ${isChecked ? 'checkbox-done' : ''}" style="animation-delay: ${index * 0.05}s">
            <div class="p-5">
                <div class="flex items-start gap-4">
                    <input type="checkbox" data-id="${activity.id}" class="activity-checkbox mt-1 w-5 h-5 cursor-pointer accent-red-600" ${isChecked ? 'checked' : ''}>
                    <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg flex-shrink-0 text-2xl">${activity.icon}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start gap-2">
                            <h3 class="activity-title text-lg font-bold text-gray-800 dark:text-white mb-1">${AppCore.escapeHtml(activity.title)}</h3>
                            ${activity.cost > 0 
                                ? `<div class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap">¥${activity.cost}</div>`
                                : `<div class="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap">GRATIS</div>`
                            }
                        </div>
                        <p class="text-gray-600 dark:text-gray-300 text-sm mb-3">${AppCore.escapeHtml(activity.desc)}</p>
                        ${activity.train ? `
                            <div class="train-info text-white p-3 rounded-lg text-sm shadow-md mt-2">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-xl">🚆</span><span class="font-bold">Info de Tren</span>
                                </div>
                                <p class="text-xs opacity-90">${AppCore.escapeHtml(activity.train.from)} → ${AppCore.escapeHtml(activity.train.to)}</p>
                                <p class="text-xs opacity-90">Línea: ${AppCore.escapeHtml(activity.train.line)} (${activity.train.duration})</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
      `;
    }).join('');

    timeline.querySelectorAll('.activity-checkbox').forEach(box => {
      box.addEventListener('change', (e) => this.toggleActivity(e.target.dataset.id));
    });
  },

  toggleActivity(activityId) {
    AppCore.state.checkedActivities[activityId] = !AppCore.state.checkedActivities[activityId];
    localStorage.setItem('checkedActivities', JSON.stringify(AppCore.state.checkedActivities));
    this.selectDay(AppCore.state.currentDay);
  }
};
