/**
 * 🔍 GLOBAL SEARCH & FILTERS
 * ==========================
 * Advanced search and filtering system for itinerary
 */

class GlobalSearchFilters {
  constructor() {
    this.initialized = false;
    this.currentFilters = {
      search: '',
      categories: [],
      cities: [],
      days: [],
      priceRange: [0, Infinity]
    };
    this.searchResults = [];
  }

  /**
   * Initialize search system
   */
  async initialize() {
    if (this.initialized) return;

    console.log('🔍 Initializing Global Search & Filters...');

    this.initialized = true;
    console.log('✅ Global Search & Filters ready');
  }

  /**
   * Show search panel
   */
  show() {
    const panel = this.createSearchPanel();
    document.body.appendChild(panel);

    // Focus search input
    setTimeout(() => {
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.focus();
    }, 100);
  }

  /**
   * Create search panel
   */
  createSearchPanel() {
    const panel = document.createElement('div');
    panel.className = 'search-panel';
    panel.id = 'search-panel';

    panel.innerHTML = `
      <div class="search-overlay" onclick="document.getElementById('search-panel').remove()"></div>
      <div class="search-content">
        <!-- Search Header -->
        <div class="search-header">
          <div class="search-input-container">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              id="global-search-input"
              class="search-input"
              placeholder="Buscar en tu itinerario... (ej: templos, ramen, Kyoto)"
              autocomplete="off"
            >
            <button class="search-clear" id="search-clear-btn" style="display: none;">✕</button>
          </div>
          <button class="search-close" onclick="document.getElementById('search-panel').remove()">
            <span>Cerrar</span>
          </button>
        </div>

        <!-- Quick Filters -->
        <div class="quick-filters">
          <div class="quick-filters-label">Filtros rápidos:</div>
          <div class="quick-filters-buttons">
            <button class="quick-filter-btn" data-filter="category" data-value="templo">⛩️ Templos</button>
            <button class="quick-filter-btn" data-filter="category" data-value="comida">🍜 Comida</button>
            <button class="quick-filter-btn" data-filter="category" data-value="shopping">🛍️ Shopping</button>
            <button class="quick-filter-btn" data-filter="category" data-value="naturaleza">🌸 Naturaleza</button>
            <button class="quick-filter-btn" data-filter="category" data-value="museo">🏛️ Museos</button>
          </div>
        </div>

        <!-- Advanced Filters -->
        <div class="advanced-filters">
          <button class="advanced-filters-toggle" id="advanced-filters-toggle">
            <span>Filtros Avanzados</span>
            <span class="toggle-icon">▼</span>
          </button>
          <div class="advanced-filters-content hidden" id="advanced-filters-content">
            <!-- City Filter -->
            <div class="filter-group">
              <label class="filter-label">Ciudades:</label>
              <div class="filter-options" id="city-filter-options">
                <!-- Will be populated dynamically -->
              </div>
            </div>

            <!-- Day Filter -->
            <div class="filter-group">
              <label class="filter-label">Días:</label>
              <div class="filter-options" id="day-filter-options">
                <!-- Will be populated dynamically -->
              </div>
            </div>

            <!-- Category Filter -->
            <div class="filter-group">
              <label class="filter-label">Categorías:</label>
              <div class="filter-options" id="category-filter-options">
                <!-- Will be populated dynamically -->
              </div>
            </div>

            <!-- Reset Button -->
            <button class="reset-filters-btn" id="reset-filters-btn">
              🔄 Limpiar Filtros
            </button>
          </div>
        </div>

        <!-- Search Results -->
        <div class="search-results" id="search-results">
          <div class="search-empty-state">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-text">Busca actividades, lugares, o usa los filtros para encontrar lo que necesitas</div>
            <div class="empty-state-examples">
              <div class="example-label">Prueba buscar:</div>
              <div class="example-queries">
                <button class="example-query" data-query="templos">⛩️ templos</button>
                <button class="example-query" data-query="ramen">🍜 ramen</button>
                <button class="example-query" data-query="Kyoto">🏯 Kyoto</button>
                <button class="example-query" data-query="jardín">🌸 jardín</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Setup event listeners after adding to DOM
    setTimeout(() => this.setupEventListeners(), 50);

    return panel;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
        this.toggleClearButton(e.target.value);
      });
    }

    // Clear button
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.handleSearch('');
          this.toggleClearButton('');
        }
      });
    }

    // Quick filters
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        this.handleQuickFilter(btn.dataset.filter, btn.dataset.value, btn.classList.contains('active'));
      });
    });

    // Advanced filters toggle
    const advancedToggle = document.getElementById('advanced-filters-toggle');
    const advancedContent = document.getElementById('advanced-filters-content');
    if (advancedToggle && advancedContent) {
      advancedToggle.addEventListener('click', () => {
        advancedContent.classList.toggle('hidden');
        const icon = advancedToggle.querySelector('.toggle-icon');
        if (icon) {
          icon.textContent = advancedContent.classList.contains('hidden') ? '▼' : '▲';
        }
      });
    }

    // Reset filters
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // Example queries
    document.querySelectorAll('.example-query').forEach(btn => {
      btn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = btn.dataset.query;
          this.handleSearch(btn.dataset.query);
          this.toggleClearButton(btn.dataset.query);
        }
      });
    });

    // Populate filter options
    this.populateFilterOptions();
  }

  /**
   * Toggle clear button visibility
   */
  toggleClearButton(value) {
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
      clearBtn.style.display = value ? 'flex' : 'none';
    }
  }

  /**
   * Populate filter options from itinerary
   */
  populateFilterOptions() {
    const itinerary = this.getCurrentItinerary();
    if (!itinerary || !itinerary.days) return;

    // Get unique cities
    const cities = new Set();
    const categories = new Set();

    itinerary.days.forEach(day => {
      if (day.city) cities.add(day.city);
      if (day.activities) {
        day.activities.forEach(activity => {
          if (activity.category) categories.add(activity.category);
        });
      }
    });

    // Populate city filter
    const cityOptions = document.getElementById('city-filter-options');
    if (cityOptions && cities.size > 0) {
      cityOptions.innerHTML = Array.from(cities).map(city => `
        <label class="filter-checkbox">
          <input type="checkbox" data-filter="city" value="${city}">
          <span>${city}</span>
        </label>
      `).join('');

      // Add event listeners
      cityOptions.querySelectorAll('input').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          this.handleFilterChange();
        });
      });
    }

    // Populate day filter
    const dayOptions = document.getElementById('day-filter-options');
    if (dayOptions && itinerary.days.length > 0) {
      dayOptions.innerHTML = itinerary.days.map((day, index) => `
        <label class="filter-checkbox">
          <input type="checkbox" data-filter="day" value="${index}">
          <span>Día ${index + 1}</span>
        </label>
      `).join('');

      // Add event listeners
      dayOptions.querySelectorAll('input').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          this.handleFilterChange();
        });
      });
    }

    // Populate category filter
    const categoryOptions = document.getElementById('category-filter-options');
    if (categoryOptions && categories.size > 0) {
      categoryOptions.innerHTML = Array.from(categories).map(category => `
        <label class="filter-checkbox">
          <input type="checkbox" data-filter="category" value="${category}">
          <span>${category}</span>
        </label>
      `).join('');

      // Add event listeners
      categoryOptions.querySelectorAll('input').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          this.handleFilterChange();
        });
      });
    }
  }

  /**
   * Handle search input
   */
  handleSearch(query) {
    this.currentFilters.search = query.toLowerCase();
    this.performSearch();
  }

  /**
   * Handle quick filter
   */
  handleQuickFilter(filterType, value, active) {
    if (filterType === 'category') {
      if (active) {
        if (!this.currentFilters.categories.includes(value)) {
          this.currentFilters.categories.push(value);
        }
      } else {
        this.currentFilters.categories = this.currentFilters.categories.filter(c => c !== value);
      }
    }

    this.performSearch();
  }

  /**
   * Handle filter change
   */
  handleFilterChange() {
    // Collect all active filters
    this.currentFilters.cities = Array.from(
      document.querySelectorAll('input[data-filter="city"]:checked')
    ).map(input => input.value);

    this.currentFilters.days = Array.from(
      document.querySelectorAll('input[data-filter="day"]:checked')
    ).map(input => parseInt(input.value));

    const categoryCheckboxes = Array.from(
      document.querySelectorAll('input[data-filter="category"]:checked')
    ).map(input => input.value);

    // Merge with quick filters
    this.currentFilters.categories = [
      ...new Set([...categoryCheckboxes, ...this.currentFilters.categories])
    ];

    this.performSearch();
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    this.currentFilters = {
      search: '',
      categories: [],
      cities: [],
      days: []
    };

    // Clear search input
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.value = '';
      this.toggleClearButton('');
    }

    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    // Deactivate quick filters
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    this.performSearch();
  }

  /**
   * Perform search with current filters
   */
  performSearch() {
    const itinerary = this.getCurrentItinerary();
    if (!itinerary || !itinerary.days) {
      this.renderResults([]);
      return;
    }

    const results = [];

    itinerary.days.forEach((day, dayIndex) => {
      if (!day.activities) return;

      day.activities.forEach(activity => {
        // Check search query
        if (this.currentFilters.search) {
          const searchableText = [
            activity.name,
            activity.description,
            activity.category,
            day.city
          ].filter(Boolean).join(' ').toLowerCase();

          if (!searchableText.includes(this.currentFilters.search)) {
            return;
          }
        }

        // Check category filter
        if (this.currentFilters.categories.length > 0) {
          const activityCategory = (activity.category || '').toLowerCase();
          const matches = this.currentFilters.categories.some(cat =>
            activityCategory.includes(cat) || cat.includes(activityCategory)
          );
          if (!matches) return;
        }

        // Check city filter
        if (this.currentFilters.cities.length > 0) {
          if (!this.currentFilters.cities.includes(day.city)) {
            return;
          }
        }

        // Check day filter
        if (this.currentFilters.days.length > 0) {
          if (!this.currentFilters.days.includes(dayIndex)) {
            return;
          }
        }

        // Passed all filters
        results.push({
          activity,
          day: dayIndex + 1,
          city: day.city
        });
      });
    });

    this.searchResults = results;
    this.renderResults(results);
  }

  /**
   * Render search results
   */
  renderResults(results) {
    const container = document.getElementById('search-results');
    if (!container) return;

    if (results.length === 0) {
      // Show empty state or no results
      const hasActiveFilters = this.currentFilters.search ||
                               this.currentFilters.categories.length > 0 ||
                               this.currentFilters.cities.length > 0 ||
                               this.currentFilters.days.length > 0;

      if (hasActiveFilters) {
        container.innerHTML = `
          <div class="search-no-results">
            <div class="no-results-icon">😔</div>
            <div class="no-results-text">No se encontraron resultados</div>
            <button class="reset-filters-btn" onclick="window.GlobalSearchFilters.resetFilters()">
              🔄 Limpiar Filtros
            </button>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="search-empty-state">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-text">Busca actividades, lugares, o usa los filtros</div>
          </div>
        `;
      }
      return;
    }

    container.innerHTML = `
      <div class="results-header">
        <span class="results-count">📍 ${results.length} resultado${results.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="results-list">
        ${results.map(result => this.renderResultItem(result)).join('')}
      </div>
    `;
  }

  /**
   * Render single result item
   */
  renderResultItem(result) {
    const { activity, day, city } = result;

    return `
      <div class="result-item">
        <div class="result-icon">${this.getCategoryIcon(activity.category)}</div>
        <div class="result-content">
          <div class="result-title">${activity.name || 'Sin nombre'}</div>
          <div class="result-meta">
            <span class="result-day">Día ${day}</span>
            ${city ? `<span class="result-city">${city}</span>` : ''}
            ${activity.category ? `<span class="result-category">${activity.category}</span>` : ''}
          </div>
          ${activity.description ? `<div class="result-description">${activity.description}</div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Get icon for category
   */
  getCategoryIcon(category) {
    const categoryLower = (category || '').toLowerCase();

    if (categoryLower.includes('templo') || categoryLower.includes('shrine')) return '⛩️';
    if (categoryLower.includes('comida') || categoryLower.includes('food')) return '🍜';
    if (categoryLower.includes('shopping') || categoryLower.includes('compra')) return '🛍️';
    if (categoryLower.includes('naturaleza') || categoryLower.includes('nature')) return '🌸';
    if (categoryLower.includes('museo') || categoryLower.includes('museum')) return '🏛️';
    if (categoryLower.includes('parque') || categoryLower.includes('park')) return '🏞️';
    if (categoryLower.includes('castillo') || categoryLower.includes('castle')) return '🏯';

    return '📍';
  }

  /**
   * Get current itinerary
   */
  getCurrentItinerary() {
    if (window.currentItinerary && window.currentItinerary.days) {
      return window.currentItinerary;
    }
    if (window.TripsManager && window.TripsManager.currentTrip) {
      return window.TripsManager.currentTrip;
    }
    return null;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.GlobalSearchFilters = new GlobalSearchFilters();

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.GlobalSearchFilters.initialize();
    });
  } else {
    window.GlobalSearchFilters.initialize();
  }
}
