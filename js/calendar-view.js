/**
 * 📅 CALENDAR VIEW
 * ================
 *
 * Interactive calendar view with drag & drop for itinerary
 * Powered by FullCalendar
 */

class CalendarView {
  constructor() {
    this.calendar = null;
    this.initialized = false;
    this.currentItinerary = null;
  }

  async initialize() {
    if (this.initialized) return;

    console.log('📅 Calendar View initializing...');

    // Wait for FullCalendar to be available
    await this.waitForFullCalendar();

    this.initialized = true;
    console.log('✅ Calendar View ready');
  }

  /**
   * Wait for FullCalendar library
   */
  async waitForFullCalendar() {
    return new Promise((resolve) => {
      if (typeof FullCalendar !== 'undefined') {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (typeof FullCalendar !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn('⚠️ FullCalendar not loaded');
        resolve();
      }, 10000);
    });
  }

  /**
   * Create calendar with itinerary data
   */
  createCalendar(containerId, itinerary) {
    if (typeof FullCalendar === 'undefined') {
      console.warn('⚠️ FullCalendar not available');
      return null;
    }

    this.currentItinerary = itinerary;

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return null;
    }

    // Destroy existing calendar
    if (this.calendar) {
      this.calendar.destroy();
    }

    // Convert itinerary to calendar events
    const events = this.convertItineraryToEvents(itinerary);

    // Create calendar
    this.calendar = new FullCalendar.Calendar(container, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek'
      },
      editable: true,
      droppable: true,
      eventResizableFromStart: true,
      events: events,
      height: 'auto',
      locale: 'es',
      firstDay: 1, // Monday

      // Styling
      eventDisplay: 'block',
      eventBackgroundColor: '#3498db',
      eventBorderColor: '#2980b9',

      // Event handlers
      eventDrop: (info) => this.handleEventDrop(info),
      eventResize: (info) => this.handleEventResize(info),
      eventClick: (info) => this.handleEventClick(info),
      dateClick: (info) => this.handleDateClick(info),

      // Custom event content
      eventContent: (arg) => this.renderEventContent(arg)
    });

    this.calendar.render();
    console.log('✅ Calendar created with', events.length, 'events');

    return this.calendar;
  }

  /**
   * Convert itinerary to FullCalendar events
   */
  convertItineraryToEvents(itinerary) {
    const events = [];

    if (!itinerary || !itinerary.days) return events;

    itinerary.days.forEach((day, dayIndex) => {
      if (!day.activities) return;

      const date = this.getDayDate(itinerary, dayIndex);
      if (!date) return;

      day.activities.forEach((activity, actIndex) => {
        const event = {
          id: `${dayIndex}-${actIndex}`,
          title: activity.name || 'Actividad',
          start: date,
          allDay: !activity.time,
          extendedProps: {
            dayIndex: dayIndex,
            activityIndex: actIndex,
            category: activity.category || 'other',
            location: activity.location,
            notes: activity.notes
          },
          backgroundColor: this.getCategoryColor(activity.category),
          borderColor: this.getCategoryColor(activity.category, true)
        };

        // If activity has time, set it
        if (activity.time) {
          const timeParts = activity.time.split(':');
          const eventDate = new Date(date);
          eventDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1] || 0));
          event.start = eventDate;
          event.end = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours default
        }

        events.push(event);
      });
    });

    return events;
  }

  /**
   * Get date for a specific day in itinerary
   */
  getDayDate(itinerary, dayIndex) {
    // If itinerary has startDate, calculate from there
    if (itinerary.startDate) {
      const start = new Date(itinerary.startDate);
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + dayIndex);
      return dayDate.toISOString().split('T')[0];
    }

    // Otherwise use relative dates
    const today = new Date();
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() + dayIndex);
    return dayDate.toISOString().split('T')[0];
  }

  /**
   * Get color for category
   */
  getCategoryColor(category, darker = false) {
    const colors = {
      temple: darker ? '#C53030' : '#FC8181',
      shrine: darker ? '#2C7A7B' : '#4FD1C5',
      restaurant: darker ? '#DD6B20' : '#F6AD55',
      shopping: darker ? '#38A169' : '#68D391',
      nature: darker ? '#2F855A' : '#48BB78',
      museum: darker ? '#6B46C1' : '#9F7AEA',
      attraction: darker ? '#2C5282' : '#4299E1',
      accommodation: darker ? '#C05621' : '#ED8936',
      transport: darker ? '#4A5568' : '#718096',
      other: darker ? '#718096' : '#A0AEC0'
    };

    return colors[category] || colors.other;
  }

  /**
   * Handle event drop (drag & drop)
   */
  handleEventDrop(info) {
    console.log('Event dropped:', info);

    const event = info.event;
    const dayIndex = event.extendedProps.dayIndex;
    const activityIndex = event.extendedProps.activityIndex;

    // Calculate new day index based on date change
    const originalDate = info.oldEvent.start;
    const newDate = event.start;
    const daysDiff = Math.round((newDate - originalDate) / (1000 * 60 * 60 * 24));
    const newDayIndex = dayIndex + daysDiff;

    console.log(`Moving activity from day ${dayIndex} to day ${newDayIndex}`);

    // Update itinerary
    if (this.currentItinerary && this.currentItinerary.days) {
      const activity = this.currentItinerary.days[dayIndex].activities[activityIndex];

      // Remove from old day
      this.currentItinerary.days[dayIndex].activities.splice(activityIndex, 1);

      // Add to new day
      if (!this.currentItinerary.days[newDayIndex]) {
        // Create new day if doesn't exist
        this.currentItinerary.days[newDayIndex] = { activities: [] };
      }
      if (!this.currentItinerary.days[newDayIndex].activities) {
        this.currentItinerary.days[newDayIndex].activities = [];
      }
      this.currentItinerary.days[newDayIndex].activities.push(activity);

      // Fire event
      this.fireItineraryChange('activity_moved', {
        from: dayIndex,
        to: newDayIndex,
        activity
      });
    }
  }

  /**
   * Handle event resize
   */
  handleEventResize(info) {
    console.log('Event resized:', info);
    const event = info.event;

    // Update activity duration if needed
    const duration = (event.end - event.start) / (1000 * 60 * 60); // hours
    console.log(`Activity duration: ${duration} hours`);

    // Could update activity time here
  }

  /**
   * Handle event click
   */
  handleEventClick(info) {
    console.log('Event clicked:', info);

    const event = info.event;
    const props = event.extendedProps;

    // Show activity details modal
    this.showActivityModal(event.title, props);
  }

  /**
   * Handle date click
   */
  handleDateClick(info) {
    console.log('Date clicked:', info);

    // Could add "Add activity" option here
  }

  /**
   * Render custom event content
   */
  renderEventContent(arg) {
    const category = arg.event.extendedProps.category;
    const icon = this.getCategoryIcon(category);

    return {
      html: `
        <div class="fc-event-content">
          <span class="fc-event-icon">${icon}</span>
          <span class="fc-event-title">${arg.event.title}</span>
        </div>
      `
    };
  }

  /**
   * Get icon for category
   */
  getCategoryIcon(category) {
    const icons = {
      temple: '⛩️',
      shrine: '🏮',
      restaurant: '🍜',
      shopping: '🛍️',
      nature: '🏞️',
      museum: '🏛️',
      attraction: '🎯',
      accommodation: '🏨',
      transport: '🚆',
      other: '📍'
    };

    return icons[category] || icons.other;
  }

  /**
   * Show activity details modal
   */
  showActivityModal(title, props) {
    // Create simple modal
    const modal = document.createElement('div');
    modal.className = 'activity-modal-overlay';
    modal.innerHTML = `
      <div class="activity-modal">
        <div class="modal-header">
          <h3>${this.getCategoryIcon(props.category)} ${title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${props.location ? `<p><strong>📍 Ubicación:</strong> ${props.location}</p>` : ''}
          ${props.notes ? `<p><strong>📝 Notas:</strong> ${props.notes}</p>` : ''}
          <p><strong>🏷️ Categoría:</strong> ${props.category}</p>
          <p><strong>📅 Día:</strong> ${props.dayIndex + 1}</p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal;

    closeBtn.onclick = () => modal.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) modal.remove();
    };
  }

  /**
   * Fire itinerary change event
   */
  fireItineraryChange(type, data) {
    // Fire custom event
    const event = new CustomEvent('itinerary:changed', {
      detail: { type, data }
    });
    window.dispatchEvent(event);

    // Also fire via event bus if available
    if (window.eventBus) {
      window.eventBus.emit('itinerary:updated', this.currentItinerary);
    }
  }

  /**
   * Refresh calendar with new itinerary
   */
  refresh(itinerary) {
    if (!this.calendar) return;

    this.currentItinerary = itinerary;
    const events = this.convertItineraryToEvents(itinerary);

    // Remove all existing events
    this.calendar.removeAllEvents();

    // Add new events
    this.calendar.addEventSource(events);
  }

  /**
   * Destroy calendar
   */
  destroy() {
    if (this.calendar) {
      this.calendar.destroy();
      this.calendar = null;
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.CalendarView = new CalendarView();
  console.log('📅 Calendar View loaded!');
}
