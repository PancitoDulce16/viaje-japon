/**
 * 📊 ANALYTICS INTEGRATION
 * ========================
 *
 * Integrates Analytics Dashboard with the app
 * Listens for itinerary changes and updates charts automatically
 */

(async function() {
  'use strict';

  console.log('📊 Analytics Integration loading...');

  // Wait for DOM and required dependencies
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }

  // Wait for AnalyticsDashboard to be available
  if (!window.AnalyticsDashboard) {
    console.warn('⚠️ AnalyticsDashboard not loaded yet, waiting...');
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (window.AnalyticsDashboard) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  // Initialize Analytics Dashboard
  if (window.AnalyticsDashboard && !window.AnalyticsDashboard.initialized) {
    await window.AnalyticsDashboard.initialize();
  }

  /**
   * Get current itinerary from global scope
   */
  function getCurrentItinerary() {
    // Try multiple sources
    if (window.currentItinerary && window.currentItinerary.days) {
      return window.currentItinerary;
    }

    if (window.TripsManager && window.TripsManager.currentTrip) {
      return window.TripsManager.currentTrip;
    }

    if (window.ItineraryManager && window.ItineraryManager.currentItinerary) {
      return window.ItineraryManager.currentItinerary;
    }

    return null;
  }

  /**
   * Update all charts with current itinerary
   */
  function updateCharts() {
    const itinerary = getCurrentItinerary();

    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
      console.log('📊 No itinerary data available for charts');
      return;
    }

    console.log('📊 Updating charts with itinerary:', itinerary);

    if (window.AnalyticsDashboard && window.AnalyticsDashboard.initialized) {
      window.AnalyticsDashboard.refreshCharts(itinerary);
      console.log('✅ Charts updated successfully');
    }
  }

  /**
   * Show analytics section
   */
  function showAnalytics() {
    const analyticsSection = document.getElementById('analytics-section');
    if (analyticsSection) {
      analyticsSection.classList.remove('hidden');
      updateCharts();
    }
  }

  /**
   * Hide analytics section
   */
  function hideAnalytics() {
    const analyticsSection = document.getElementById('analytics-section');
    if (analyticsSection) {
      analyticsSection.classList.add('hidden');
    }
  }

  /**
   * Create Analytics button in navbar or add to menu
   */
  function createAnalyticsButton() {
    // Check if button already exists
    if (document.getElementById('analytics-nav-btn')) {
      return;
    }

    // Try to find a good place to add the button
    const navbar = document.querySelector('nav') || document.querySelector('.nav-bar') || document.querySelector('.top-nav');

    if (!navbar) {
      console.warn('⚠️ Navbar not found, cannot add analytics button');
      return;
    }

    const button = document.createElement('button');
    button.id = 'analytics-nav-btn';
    button.className = 'nav-btn analytics-btn';
    button.innerHTML = '<i class="fas fa-chart-pie"></i> <span>Analytics</span>';
    button.title = 'Ver análisis del viaje';

    button.addEventListener('click', () => {
      // Hide other sections
      document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.add('hidden');
      });

      // Show analytics
      showAnalytics();

      // Update active state
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
    });

    navbar.appendChild(button);
    console.log('✅ Analytics button added to navbar');
  }

  /**
   * Listen for itinerary changes via custom events
   */
  if (window.eventBus) {
    // Listen for itinerary loaded event
    window.eventBus.on('itinerary:loaded', (itinerary) => {
      console.log('📊 Itinerary loaded event received');
      updateCharts();
    });

    // Listen for itinerary updated event
    window.eventBus.on('itinerary:updated', (itinerary) => {
      console.log('📊 Itinerary updated event received');
      updateCharts();
    });

    // Listen for activity added
    window.eventBus.on('activity:added', () => {
      console.log('📊 Activity added event received');
      setTimeout(updateCharts, 500); // Small delay to let the data update
    });

    // Listen for activity removed
    window.eventBus.on('activity:removed', () => {
      console.log('📊 Activity removed event received');
      setTimeout(updateCharts, 500);
    });
  }

  // Also listen for window-level events as fallback
  window.addEventListener('itineraryLoaded', (event) => {
    console.log('📊 Window itineraryLoaded event received');
    updateCharts();
  });

  window.addEventListener('itineraryUpdated', (event) => {
    console.log('📊 Window itineraryUpdated event received');
    updateCharts();
  });

  // Create analytics button
  setTimeout(createAnalyticsButton, 1000); // Wait for navbar to be ready

  // Initial chart update if itinerary already exists
  setTimeout(() => {
    const itinerary = getCurrentItinerary();
    if (itinerary && itinerary.days && itinerary.days.length > 0) {
      console.log('📊 Initial itinerary found, updating charts');
      updateCharts();
    }
  }, 2000);

  // Export functions globally for manual control
  window.AnalyticsIntegration = {
    updateCharts,
    showAnalytics,
    hideAnalytics,
    getCurrentItinerary
  };

  console.log('✅ Analytics Integration ready!');
})();
