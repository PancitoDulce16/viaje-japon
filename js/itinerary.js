// js/itinerary.js
import { ITINERARY_DATA } from './itinerary-data.js';
import { AppCore } from './core.js';

export const ItineraryHandler = {
  renderItinerary() {
    const container = document.getElementById('content-itinerary');
    if (!container) return;

    container.innerHTML = `
      <div id="daySelectorContainer" class="overflow-x-auto scrollbar-hide pb-2 mb-4">
        <div id="daySelector" class="flex space-x-2"></div>
      </div>
      <div id="dayOverview" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4"></div>
      <div id="activitiesTimeline" class="space-y-4"></div>
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
      if(e.target.matches('.day-btn')) {
        this.selectDay(parseInt(e.target.dataset.day, 10));
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
      btn.classList.remove('bg-red-600', 'text-white', 'shadow-md', 'scale-105');
      btn.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
      if (parseInt(btn.dataset.day, 10) === AppCore.state.currentDay) {
        btn.classList.add('bg-red-600', 'text-white', 'shadow-md', 'scale-105');
      }
    });
  },

  renderDayOverview(day) {
    const overview = document.getElementById('dayOverview');
    if (!overview) return;
    const completed = day.activities.filter(a => AppCore.state.checkedActivities[a.id]).length;
    const progress = (completed / day.activities.length) * 100;
    overview.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Día ${day.day}: ${AppCore.escapeHtml(day.title)}</h2>
      <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
    `;
  },

  renderActivities(day) {
    const timeline = document.getElementById('activitiesTimeline');
    if (!timeline) return;
    timeline.innerHTML = day.activities.map(activity => {
      const isChecked = !!AppCore.state.checkedActivities[activity.id];
      return `
        <div class="activity-card ${isChecked ? 'checkbox-done' : ''}">
          <div class="p-4 flex items-start gap-4">
            <input type="checkbox" data-id="${activity.id}" class="activity-checkbox mt-1 w-5 h-5" ${isChecked ? 'checked' : ''}>
            <div class="flex-1">
              <h3 class="font-bold text-lg">${AppCore.escapeHtml(activity.title)}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">${AppCore.escapeHtml(activity.desc)}</p>
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
