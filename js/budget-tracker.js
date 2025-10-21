// js/budget-tracker.js - CON MODO COLABORATIVO

import { db, auth } from '/js/firebase-config.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const BudgetTracker = {
  expenses: [],
  unsubscribe: null,

  // Obtener el tripId actual
  getCurrentTripId() {
    if (window.TripsManager && window.TripsManager.currentTrip) {
      return window.TripsManager.currentTrip.id;
    }
    return localStorage.getItem('currentTripId');
  },

  // Inicializar listener en tiempo real
  initRealtimeSync() {
    // Si ya hay un listener, limpiarlo
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // Si no hay usuario, cargar de localStorage
    if (!auth.currentUser) {
      this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      this.updateModal();
      return;
    }

    const tripId = this.getCurrentTripId();
    const userId = auth.currentUser.uid;

    // Si NO hay trip, usar el sistema antiguo (por usuario)
    if (!tripId) {
      console.log('⚠️ Budget: No hay trip seleccionado, usando modo individual');
      const expensesRef = collection(db, `users/${userId}/expenses`);
      const q = query(expensesRef, orderBy('timestamp', 'desc'));

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.expenses = [];
        snapshot.forEach((doc) => {
          this.expenses.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.updateModal();
        
        console.log('✅ Gastos (individual) sincronizados:', this.expenses.length);
      }, (error) => {
        console.error('❌ Error en sync de gastos:', error);
        this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        this.updateModal();
      });

      return;
    }

    // 🔥 MODO COLABORATIVO: Usar el trip compartido
    console.log('🤝 Budget: Modo colaborativo activado para trip:', tripId);
    const expensesRef = collection(db, `trips/${tripId}/expenses`);
    const q = query(expensesRef, orderBy('timestamp', 'desc'));

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.expenses = [];
      snapshot.forEach((doc) => {
        this.expenses.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // También guardar en localStorage como backup
      localStorage.setItem('expenses', JSON.stringify(this.expenses));
      
      // Re-renderizar
      this.updateModal();
      
      console.log('✅ Gastos COMPARTIDOS sincronizados:', this.expenses.length, 'gastos');
    }, (error) => {
      console.error('❌ Error en sync de gastos compartidos:', error);
      // Fallback a localStorage si falla
      this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      this.updateModal();
    });
  },

  updateModal() {
    const container = document.getElementById('budgetModalContent');
    if (!container) return;

    const total = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const tripId = this.getCurrentTripId();

    // Calcular gastos por categoría
    const byCategory = this.expenses.reduce((acc, exp) => {
      const cat = exp.category || 'Otros';
      acc[cat] = (acc[cat] || 0) + exp.amount;
      return acc;
    }, {});

    const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

    let syncStatus;
    if (!auth.currentUser) {
      syncStatus = '<span class="text-yellow-600 dark:text-yellow-400">📱 Solo local</span>';
    } else if (tripId) {
      syncStatus = '<span class="text-green-600 dark:text-green-400">🤝 Modo Colaborativo</span>';
    } else {
      syncStatus = '<span class="text-blue-600 dark:text-blue-400">☁️ Sincronizado</span>';
    }

    container.innerHTML = `
      <!-- Total Card con mejor diseño -->
      <div class="mb-6 p-6 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white rounded-2xl shadow-xl">
        <div class="flex justify-between items-center mb-3">
          <p class="text-sm opacity-90">Total Gastado</p>
          <p class="text-xs opacity-90">${syncStatus}</p>
        </div>
        <p class="text-4xl font-black mb-2">¥${total.toLocaleString()}</p>
        <div class="flex justify-between items-center text-sm opacity-90">
          <span>~$${Math.round(total / 145)} USD</span>
          <span>${this.expenses.length} gastos</span>
        </div>
      </div>

      <!-- Gráfico de Categorías -->
      ${categories.length > 0 ? `
        <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h3 class="font-bold text-lg mb-4 dark:text-white">📊 Por Categoría</h3>
          <div class="space-y-3">
            ${categories.map(([cat, amount]) => {
              const percent = (amount / total * 100).toFixed(1);
              const icon = this.getCategoryIcon(cat);
              const color = this.getCategoryColor(cat);
              return `
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="dark:text-white">${icon} ${cat}</span>
                    <span class="font-semibold dark:text-white">¥${amount.toLocaleString()} (${percent}%)</span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div class="${color} h-2.5 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Formulario de Agregar -->
      <div class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
        <h3 class="font-bold mb-3 dark:text-white">➕ Agregar Gasto</h3>
        <div class="grid grid-cols-2 gap-2 mb-2">
          <input id="expenseDesc" type="text" class="col-span-2 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" placeholder="Descripción (ej. Sushi en Shibuya)">
          <select id="expenseCategory" class="p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="Comida">🍜 Comida</option>
            <option value="Transporte">🚇 Transporte</option>
            <option value="Alojamiento">🏨 Alojamiento</option>
            <option value="Entretenimiento">🎮 Entretenimiento</option>
            <option value="Compras">🛍️ Compras</option>
            <option value="Otros">📦 Otros</option>
          </select>
          <input id="expenseAmount" type="number" class="p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="¥ JPY">
        </div>
        <button id="addExpenseBtn" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-lg">
          ➕ Agregar Gasto
        </button>
      </div>

      <!-- Lista de Gastos -->
      <div class="space-y-2 max-h-96 overflow-y-auto">
        ${this.expenses.length === 0 ? `
          <div class="text-center py-12">
            <div class="text-6xl mb-3">💰</div>
            <p class="text-gray-500 dark:text-gray-400 font-semibold">No hay gastos registrados</p>
            <p class="text-sm text-gray-400 dark:text-gray-500">¡Agrega tu primer gasto arriba!</p>
          </div>
        ` : this.expenses.map((exp) => {
          const icon = this.getCategoryIcon(exp.category || 'Otros');
          const color = this.getCategoryColorClass(exp.category || 'Otros');
          return `
            <div class="group p-3 bg-white dark:bg-gray-700 rounded-lg border-l-4 ${color} hover:shadow-md transition-all">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg">${icon}</span>
                    <span class="dark:text-white font-semibold">${this.escapeHtml(exp.desc)}</span>
                  </div>
                  <div class="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                    ${exp.category ? `<span>📁 ${exp.category}</span>` : ''}
                    ${exp.addedBy ? `<span>👤 ${exp.addedBy.split('@')[0]}</span>` : ''}
                    ${exp.date ? `<span>📅 ${new Date(exp.date).toLocaleDateString('es')}</span>` : ''}
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-green-600 dark:text-green-400 font-bold text-lg">¥${exp.amount.toLocaleString()}</span>
                  <button data-expense-id="${exp.id || exp.timestamp}" class="delete-expense opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition-all transform hover:scale-110">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const addBtn = document.getElementById('addExpenseBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addExpense());
    }

    const descInput = document.getElementById('expenseDesc');
    const amountInput = document.getElementById('expenseAmount');
    
    if (descInput) {
      descInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addExpense();
      });
    }
    
    if (amountInput) {
      amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addExpense();
      });
    }

    container.querySelectorAll('.delete-expense').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const expenseId = e.currentTarget.dataset.expenseId;
        this.deleteExpense(expenseId);
      });
    });
  },

  async addExpense() {
    const descInput = document.getElementById('expenseDesc');
    const amountInput = document.getElementById('expenseAmount');
    const categorySelect = document.getElementById('expenseCategory');

    if (!descInput || !amountInput) return;

    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect ? categorySelect.value : 'Otros';

    if (!desc || !amount || amount <= 0) {
      window.Notifications.warning('⚠️ Por favor completa la descripción y monto');
      return;
    }

    const expense = {
      desc,
      amount,
      category,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      addedBy: auth.currentUser ? auth.currentUser.email : 'Usuario local'
    };

    try {
      if (!auth.currentUser) {
        // Sin usuario, guardar solo localmente
        this.expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.updateModal();
        console.log('📱 Gasto guardado localmente');
        descInput.value = '';
        amountInput.value = '';
        descInput.focus();
        return;
      }

      const tripId = this.getCurrentTripId();

      if (!tripId) {
        // Modo individual
        const userId = auth.currentUser.uid;
        await addDoc(collection(db, `users/${userId}/expenses`), expense);
        console.log('✅ Gasto guardado (individual) en Firebase');
      } else {
        // 🔥 Modo colaborativo
        await addDoc(collection(db, `trips/${tripId}/expenses`), expense);
        console.log('✅ Gasto guardado (COMPARTIDO) en Firebase por:', expense.addedBy);
      }

      descInput.value = '';
      amountInput.value = '';
      descInput.focus();
    } catch (error) {
      console.error('❌ Error guardando gasto:', error);
      window.Notifications.error('Error al guardar. Intenta de nuevo.');
    }
  },

  async deleteExpense(expenseId) {
import { ATTRACTIONS_DATA } from '../data/attractions-data.js';
import { Logger, debounce, AppError } from './helpers.js';
import { STORAGE_KEYS, ERROR_CODES, TIMEOUTS, Z_INDEX, COLOR_SCHEMES, ACTIVITY_ICONS } from './constants.js';

/**
 * Handler para la gestión de atracciones
 * @namespace AttractionsHandler
 */
export const AttractionsHandler = {
    savedAttractions: JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_ATTRACTIONS) || '[]'),
    currentFilter: 'all',
    searchTerm: '',
    
    renderAttractions() {
        const container = document.getElementById('content-attractions');
        if (!container) return;
        
        container.innerHTML = `
            <div class="max-w-7xl mx-auto p-4 md:p-6">
                <!-- Header -->
                <div class="mb-8">
                    <h2 class="text-4xl font-bold mb-3 text-gray-800 dark:text-white">🎯 Atracciones de Japón</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">
                        Guía completa de las mejores atracciones. Marca tus favoritas con ⭐
                    </p>
                    
                    <!-- Stats -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div class="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border-l-4 border-pink-500">
                            <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Guardadas</p>
                            <p class="text-2xl font-bold text-pink-600 dark:text-pink-400" id="savedCount">0</p>
                        </div>
                        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                            <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
                            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">${this.getTotalCount()}</p>
                        </div>
                        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                            <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Gratis</p>
                            <p class="text-2xl font-bold text-green-600 dark:text-green-400">${this.getFreeCount()}</p>
                        </div>
                        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                            <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Categorías</p>
                            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">${Object.keys(ATTRACTIONS_DATA).length}</p>
                        </div>
                    </div>

                    <!-- 🔍 Barra de Búsqueda -->
                    <div class="mb-4">
                        <div class="relative">
                            <input
                                type="text"
                                id="attractionSearch"
                                placeholder="🔍 Buscar por nombre, ciudad, categoría o descripción..."
                                class="w-full p-3 pl-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                                oninput="AttractionsHandler.searchAttractions(this.value)"
                            >
                            <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>

                    <!-- Filter Buttons -->
                    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
                        <button onclick="AttractionsHandler.filterCategory('all')" class="filter-btn active px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-sm whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            🎯 Todas
                        </button>
                        <button onclick="AttractionsHandler.filterCategory('saved')" class="filter-btn px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-sm whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            ⭐ Guardadas
                        </button>
                        <button onclick="AttractionsHandler.filterCategory('free')" class="filter-btn px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-sm whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            🆓 Gratis
                        </button>
                        <button onclick="AttractionsHandler.filterCategory('reservation')" class="filter-btn px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-sm whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            📅 Requiere Reserva
                        </button>
                    </div>

                    <!-- 🔥 Advanced Filters -->
                    <div class="grid md:grid-cols-3 gap-4 mb-6">
                        <!-- City Filter -->
                        <div>
                            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">📍 Ciudad</label>
                            <select
                                id="cityFilter"
                                onchange="AttractionsHandler.applyAdvancedFilters()"
                                class="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="all">Todas las ciudades</option>${this.getUniqueCities().map(city => `<option value=""></option>`).join('')}
                            </select>
                        </div>

                        <!-- Price Filter -->
                        <div>
                            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">💰 Precio</label>
                            <select
                                id="priceFilter"
                                onchange="AttractionsHandler.applyAdvancedFilters()"
                                class="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="all">Todos los precios</option>
                                <option value="free">Gratis</option>
                                <option value="0-1000">¥0 - ¥1,000</option>
                                <option value="1000-3000">¥1,000 - ¥3,000</option>
                                <option value="3000-plus">¥3,000+</option>
                            </select>
                        </div>

                        <!-- Rating Filter -->
                        <div>
                            <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">⭐ Rating mínimo</label>
                            <select
                                id="ratingFilter"
                                onchange="AttractionsHandler.applyAdvancedFilters()"
                                class="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm"
                            >
                                <option value="0">Todos los ratings</option>
                                <option value="4.5">4.5+ ⭐⭐⭐⭐⭐</option>
                                <option value="4.0">4.0+ ⭐⭐⭐⭐</option>
                                <option value="3.5">3.5+ ⭐⭐⭐</option>
                            </select>
                        </div>
                    </div>

                    <!-- Clear Filters Button -->
                    <div class="mb-6">
                        <button
                            onclick="AttractionsHandler.clearAllFilters()"
                            class="w-full md:w-auto px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold text-sm transition"
                        >
                            🔄 Limpiar Filtros
                        </button>
                    </div>
                </div>

                <!-- Categories -->
                <div class="space-y-8" id="categoriesContainer">
                    ${this.renderAllCategories()}
                </div>
            </div>
        `;

        this.updateSavedCount();
    },

    renderAllCategories() {
        return Object.entries(ATTRACTIONS_DATA).map(([key, category]) => 
            this.renderCategory(key, category)
        ).join('');
    },

    renderCategory(key, category) {
        const colorClasses = {
            pink: 'from-pink-500 to-rose-500',
            orange: 'from-orange-500 to-amber-500',
            purple: 'from-purple-500 to-fuchsia-500',
            blue: 'from-blue-500 to-cyan-500',
            green: 'from-green-500 to-emerald-500',
            emerald: 'from-emerald-500 to-teal-500',
            red: 'from-red-500 to-pink-500',
            indigo: 'from-indigo-500 to-purple-500'
        };

        return `
        <div class="category-section bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden" data-category="">
                <!-- Category Header -->
                <div class="bg-gradient-to-r ${colorClasses[category.color]} p-6 text-white">
                    <div class="flex items-center gap-3">
                        <span class="text-4xl">${category.icon}</span>
                        <div>
                            <h3 class="text-2xl font-bold">${category.category}</h3>
                            <p class="text-sm opacity-90">${category.items.length} atracciones</p>
                        </div>
                    </div>
                </div>

                <!-- Items Grid -->
                <div class="p-6">
                    <div class="grid md:grid-cols-2 gap-4">
                        ${category.items.map(item => this.renderAttractionCard(item, key)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderAttractionCard(item, categoryKey) {
        const isSaved = this.savedAttractions.includes(item.name);
        const priceDisplay = item.price === 0 ? 'GRATIS' : `¥${item.price.toLocaleString()}`;
        const needsReservation = item.reserveDays > 0;

        return `
            <div class="attraction-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all ${
                isSaved ? 'border-2 border-yellow-400' : 'border border-gray-200 dark:border-gray-700'
            }" data-attraction="${item.name}" data-price="${item.price}" data-reservation="" data-city="${item.city}" data-rating="${item.rating}">
                
                <!-- Imagen -->
                <div class="relative h-40 w-full group">
                    <img 
                        src="${window.ImageService.getActivityImage(item.id || item.name, categoryKey)}" 
                        alt="${item.name}"
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                    >
                    <div class="absolute top-2 right-2">
                        <button 
                            onclick="AttractionsHandler.toggleSave('${item.name}')" 
                            class="text-3xl text-white drop-shadow-lg hover:scale-110 transition"
                            title="${isSaved ? 'Quitar de guardados' : 'Guardar'}"
                        >
                            ${isSaved ? '⭐' : '☆'}
                        </button>
                    </div>
                </div>

                <!-- Contenido -->
                <div class="p-4">
                    <h4 class="font-bold text-lg dark:text-white mb-1">${item.name}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-3">
                        📍 ${item.city}
                    </p>

                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 h-10">
                        ${item.description}
                    </p>

                    <!-- Info Tags -->
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="text-xs px-2 py-1 rounded-full font-semibold ${
                            item.price === 0 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }">💰 
                        </span>
                        <span class="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-semibold">
                            ⏱️ ${item.duration}
                        </span>
                        <span class="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-semibold">
                            ⭐ ${item.rating}/5
                        </span>
                    </div>

                    ${needsReservation ? `
                        <div class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded mb-4">
                            <p class="text-xs font-semibold text-red-700 dark:text-red-400">
                                ⚠️ Reservar ${item.reserveDays} días antes
                            </p>
                        </div>
                    ` : ''}

                    ${item.tips ? `
                        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded mb-4">
                            <p class="text-xs text-gray-700 dark:text-gray-300">
                                💡 <strong>Tip:</strong> ${item.tips}
                            </p>
                        </div>
                    ` : ''}

                    <!-- Actions -->
                    <div class="flex gap-2">
                        <button 
                            onclick="AttractionsHandler.addToItinerary('${item.name.replace(/'/g, "\'")}')"
                            class="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition text-sm font-semibold"
                            title="Añadir al itinerario"
                        >
                            ➕ Itinerario
                        </button>
                        ${item.reservationUrl ? `
                            <a href="${item.reservationUrl}" target="_blank" class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition text-sm font-semibold">
                                📅 Reservar
                            </a>
                        ` : ''}
                        <a href="https://www.google.com/maps/search/${encodeURIComponent(item.name + ' ' + item.city)}" target="_blank" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition text-sm font-semibold">
                            🗺️
                        </a>
                    </div>
                </div>
            </div>
        `;
    },

    filterCategory(filter) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        const cards = document.querySelectorAll('.attraction-card');
        const sections = document.querySelectorAll('.category-section');

        if (filter === 'all') {
            cards.forEach(card => card.style.display = 'block');
            sections.forEach(section => section.style.display = 'block');
        } else if (filter === 'saved') {
            sections.forEach(section => {
                const visibleCards = Array.from(section.querySelectorAll('.attraction-card')).filter(card => {
                    const isSaved = this.savedAttractions.includes(card.dataset.attraction);
                    card.style.display = isSaved ? 'block' : 'none';
                    return isSaved;
                });
                section.style.display = visibleCards.length > 0 ? 'block' : 'none';
            });
        } else if (filter === 'free') {
            sections.forEach(section => {
                const visibleCards = Array.from(section.querySelectorAll('.attraction-card')).filter(card => {
                    const isFree = card.dataset.price === '0';
                    card.style.display = isFree ? 'block' : 'none';
                    return isFree;
                });
                section.style.display = visibleCards.length > 0 ? 'block' : 'none';
            });
        } else if (filter === 'reservation') {
            sections.forEach(section => {
                const visibleCards = Array.from(section.querySelectorAll('.attraction-card')).filter(card => {
                    const needsReservation = card.dataset.reservation === 'true';
                    card.style.display = needsReservation ? 'block' : 'none';
                    return needsReservation;
                });
                section.style.display = visibleCards.length > 0 ? 'block' : 'none';
            });
        }
    },

    updateSavedCount() {
        const countElem = document.getElementById('savedCount');
        if (countElem) {
            countElem.textContent = this.savedAttractions.length;
        }
    },

    getTotalCount() {
        return Object.values(ATTRACTIONS_DATA).reduce((total, category) => 
            total + category.items.length, 0
        );
    },

    getFreeCount() {
        return Object.values(ATTRACTIONS_DATA).reduce((total, category) => 
            total + category.items.filter(item => item.price === 0).length, 0
        );
    },

    // 🔥 NUEVO: Añadir atracción al itinerario
    async addToItinerary(attractionName) {
        // Buscar la atracción completa
        let attraction = null;
        for (const category of Object.values(ATTRACTIONS_DATA)) {
            attraction = category.items.find(item => item.name === attractionName);
            if (attraction) break;
        }

        if (!attraction) {
            alert('⚠️ No se encontró la atracción');
            return;
        }

        // Verificar que hay itinerario
        if (!window.ItineraryHandler) {
            alert('⚠️ El módulo de itinerario no está disponible');
            return;
        }

        // Mostrar modal para seleccionar día
        this.showDaySelectionModal(attraction);
    },

    // 🔥 Modal para seleccionar día
    async showDaySelectionModal(attraction) {
        try {
            // 🔥 Verificar que ItineraryHandler existe
            if (!window.ItineraryHandler) {
                console.error('ItineraryHandler no disponible');
                if (window.Notifications) {
                    window.Notifications.warning('⚠️ El módulo de itinerario no está disponible');
                } else {
                    alert('⚠️ El módulo de itinerario no está disponible');
                }
                return;
            }

            // Primero intentar usar el itinerario ya cargado (más rápido)
            let currentItinerary = window.ItineraryHandler.currentItinerary;

            // Solo cargar desde Firebase si no hay itinerario en memoria
            if (!currentItinerary || !currentItinerary.days || currentItinerary.days.length === 0) {
                const currentTripId = localStorage.getItem('currentTripId');

                if (currentTripId && typeof window.ItineraryHandler.loadItinerary === 'function') {
                    try {
                        console.log('⏳ Cargando itinerario desde Firebase...');
                        await window.ItineraryHandler.loadItinerary(currentTripId);
                        currentItinerary = window.ItineraryHandler.currentItinerary;
                    } catch (e) {
                        console.error('Error cargando itinerario:', e);
                    }
                }
            }

            // Verificar si hay días disponibles
            if (!currentItinerary || !currentItinerary.days || !Array.isArray(currentItinerary.days) || currentItinerary.days.length === 0) {
                console.warn('No hay días en el itinerario');
                if (window.Notifications) {
                    window.Notifications.warning('⚠️ Primero debes crear días en tu itinerario. Ve a la sección de Itinerario y añade días a tu viaje.');
                } else {
                    alert('⚠️ Primero debes crear días en tu itinerario. Ve a la sección de Itinerario y añade días a tu viaje.');
                }
                return;
            }
        } catch (error) {
            console.error('Error en showDaySelectionModal:', error);
            if (window.Notifications) {
                window.Notifications.error('❌ Error al cargar el itinerario');
            } else {
                alert('❌ Error al cargar el itinerario');
            }
            return;
        }

        // Si llegamos aquí, tenemos días disponibles
        const currentItinerary = window.ItineraryHandler.currentItinerary;

        const modalHtml = `
            <div id="daySelectionModal" class="modal active" style="z-index: 10000;">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                    <div class="mb-4">
                        <h2 class="text-2xl font-bold dark:text-white mb-2">➕ Añadir al Itinerario</h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            <strong>${attraction.name}</strong><br>
                            ${attraction.city} • ${attraction.price === 0 ? 'GRATIS' : '¥' + attraction.price.toLocaleString()}
                        </p>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                            Selecciona el día:
                        </label>
                        <div class="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                            ${currentItinerary.days.map(day => `
                                <button 
                                    onclick="AttractionsHandler.addAttractionToDay(${day.day}, '${attraction.name.replace(/'/g, "\'")}')"
                                    class="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition text-center"
                                >
                                    <div class="text-xs text-gray-500 dark:text-gray-400">Día</div>
                                    <div class="text-xl font-bold dark:text-white">${day.day}</div>
                                    <div class="text-xs text-gray-600 dark:text-gray-400">${day.title}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <button 
                        onclick="AttractionsHandler.closeDaySelectionModal()"
                        class="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        `;

        // Remover modal existente si hay
        const existing = document.getElementById('daySelectionModal');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
    },

    // 🔥 Añadir atracción a un día específico
    async addAttractionToDay(dayNumber, attractionName) {
        // Buscar la atracción completa
        let attraction = null;
        for (const category of Object.values(ATTRACTIONS_DATA)) {
            attraction = category.items.find(item => item.name === attractionName);
            if (attraction) break;
        }

        if (!attraction) return;

        // Crear objeto de actividad
        const activity = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            icon: this.getCategoryIcon(attraction),
            time: 'Por definir',
            title: attraction.name,
            desc: attraction.description,
            cost: attraction.price,
            station: attraction.city,
            rating: attraction.rating,
            duration: attraction.duration
        };

        // Usar el ItineraryHandler para agregar la actividad
        if (window.ItineraryHandler) {
            // Simular que llenamos el formulario
            const modal = document.getElementById('activityModal');
            if (modal) {
                // Llenar campos
                document.getElementById('activityDay').value = dayNumber;
                document.getElementById('activityIcon').value = activity.icon;
                document.getElementById('activityTime').value = activity.time;
                document.getElementById('activityTitle').value = activity.title;
                document.getElementById('activityDesc').value = activity.desc;
                document.getElementById('activityCost').value = activity.cost;
                document.getElementById('activityStation').value = activity.station;

                // Llamar directamente a saveActivity
                await window.ItineraryHandler.saveActivity();

                this.closeDaySelectionModal();
                
                if (window.Notifications) {
                    window.Notifications.success(`✅ "${attraction.name}" añadido al Día !`);
                }

                // Cambiar al tab de itinerario
                setTimeout(() => {
                    const itineraryTab = document.querySelector('[data-tab="itinerary"]');
                    if (itineraryTab) itineraryTab.click();
                }, 500);
            }
        }
    },

    // Cerrar modal de selección de día
    closeDaySelectionModal() {
        const modal = document.getElementById('daySelectionModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    // Obtener icono basado en categoría
    getCategoryIcon(attraction) {
        const name = attraction.name.toLowerCase();
        const desc = attraction.description.toLowerCase();

        // Comida
        if (name.includes('ramen') || desc.includes('ramen')) return '🍜';
        if (name.includes('sushi') || desc.includes('sushi')) return '🍣';
        if (name.includes('cafe') || desc.includes('café')) return '☕';
        if (name.includes('restaurant') || desc.includes('restaurant')) return '🍴';
        if (name.includes('izakaya') || desc.includes('izakaya')) return '🍻';

        // Lugares
        if (name.includes('temple') || name.includes('shrine') || desc.includes('temple')) return '⛩️';
        if (name.includes('castle') || desc.includes('castle')) return '🏯';
        if (name.includes('museum') || desc.includes('museum')) return '🏛️';
        if (name.includes('park') || name.includes('garden')) return '🌳';
        if (name.includes('tower') || name.includes('sky')) return '🌆';
        if (name.includes('market') || desc.includes('market')) return '🏪';

        // Entretenimiento
        if (name.includes('disney') || name.includes('universal')) return '🎢';
        if (name.includes('aquarium') || desc.includes('aquarium')) return '🐋';
        if (name.includes('arcade') || desc.includes('arcade')) return '🎮';

        // Default
        return '🎯';
    },

    /**
     * Búsqueda de atracciones con debounce
     * @param {string} query - Término de búsqueda
     */
    searchAttractions(query) {
        // Usar debounce manually para preservar contexto
        if (this._searchTimeout) {
            clearTimeout(this._searchTimeout);
        }

        this._searchTimeout = setTimeout(() => {
            try {
                const searchTerm = query.toLowerCase().trim();
                AttractionsHandler.searchTerm = searchTerm;

                const cards = document.querySelectorAll('.attraction-card');
                const sections = document.querySelectorAll('.category-section');

                if (!searchTerm) {
                    // Si no hay búsqueda, mostrar todas
                    cards.forEach(card => card.style.display = 'block');
                    sections.forEach(section => section.style.display = 'block');
                    Logger.info('Búsqueda limpiada, mostrando todas las atracciones');
                    return;
                }

                let totalResults = 0;

                // Crear un índice de búsqueda con todos los datos de las atracciones
                const searchableData = new Map();
                Object.entries(ATTRACTIONS_DATA).forEach(([categoryKey, category]) => {
                    category.items.forEach(item => {
                        searchableData.set(item.name, {
                            name: item.name.toLowerCase(),
                            city: item.city.toLowerCase(),
                            description: item.description.toLowerCase(),
                            tips: (item.tips || '').toLowerCase(),
                            category: category.category.toLowerCase()
                        });
                    });
                });

                // Filtrar por nombre, ciudad, descripción, tips o categoría
                sections.forEach(section => {
                    const categoryName = section.dataset.category;
                    const category = ATTRACTIONS_DATA[categoryName];

                    const visibleCards = Array.from(section.querySelectorAll('.attraction-card')).filter(card => {
                        const attractionName = card.dataset.attraction;
                        const searchData = searchableData.get(attractionName);

                        if (!searchData) {
                            card.style.display = 'none';
                            return false;
                        }

                        // Buscar en todos los campos
                        const matches = searchData.name.includes(searchTerm) ||
                                      searchData.city.includes(searchTerm) ||
                                      searchData.description.includes(searchTerm) ||
                                      searchData.tips.includes(searchTerm) ||
                                      searchData.category.includes(searchTerm);

                        card.style.display = matches ? 'block' : 'none';
                        return matches;
                    });

                    totalResults += visibleCards.length;
                    section.style.display = visibleCards.length > 0 ? 'block' : 'none';
                });

                Logger.info(`Búsqueda completada: "" -  resultados`);

                // Resetear filtro activo
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                const firstFilterBtn = document.querySelector('.filter-btn');
                if (firstFilterBtn) {
                    firstFilterBtn.classList.add('active');
                }
            } catch (error) {
                Logger.error('Error en búsqueda de atracciones', error);
            }
        }, 300);
    },

    /**
     * Guardar o quitar de favoritos una atracción
     * @param {string} attractionName - Nombre de la atracción
     */
    toggleSave(attractionName) {
        try {
            const index = this.savedAttractions.indexOf(attractionName);

            if (index > -1) {
                this.savedAttractions.splice(index, 1);
                Logger.info(`Atracción removida de favoritos: `);
            } else {
                this.savedAttractions.push(attractionName);
                Logger.success(`Atracción agregada a favoritos: `);
            }

            localStorage.setItem(STORAGE_KEYS.SAVED_ATTRACTIONS, JSON.stringify(this.savedAttractions));
            this.renderAttractions();
        } catch (error) {
            Logger.error('Error al guardar atracción', error);
            if (window.Notifications) {
                window.Notifications.error('Error al guardar la atracción');
            }
        }
    },

    /**
     * Obtener lista única de ciudades
     */
    getUniqueCities() {
        const cities = new Set();
        Object.values(ATTRACTIONS_DATA).forEach(category => {
            category.items.forEach(item => cities.add(item.city));
        });
        return Array.from(cities).sort();
    },

    /**
     * Aplicar filtros avanzados (ciudad, precio, rating)
     */
    applyAdvancedFilters() {
        try {
            const cityFilter = document.getElementById('cityFilter')?.value || 'all';
            const priceFilter = document.getElementById('priceFilter')?.value || 'all';
            const ratingFilter = parseFloat(document.getElementById('ratingFilter')?.value || '0');

            const cards = document.querySelectorAll('.attraction-card');
            const sections = document.querySelectorAll('.category-section');

            sections.forEach(section => {
                const visibleCards = Array.from(section.querySelectorAll('.attraction-card')).filter(card => {
                    const cardCity = card.dataset.city || '';
                    const cardPrice = parseFloat(card.dataset.price || '0');
                    const cardRating = parseFloat(card.dataset.rating || '0');

                    // City filter
                    const cityMatch = cityFilter === 'all' || cardCity === cityFilter;

                    // Price filter
                    let priceMatch = true;
                    if (priceFilter === 'free') {
                        priceMatch = cardPrice === 0;
                    } else if (priceFilter === '0-1000') {
                        priceMatch = cardPrice >= 0 && cardPrice <= 1000;
                    } else if (priceFilter === '1000-3000') {
                        priceMatch = cardPrice > 1000 && cardPrice <= 3000;
                    } else if (priceFilter === '3000-plus') {
                        priceMatch = cardPrice > 3000;
                    }

                    // Rating filter
                    const ratingMatch = cardRating >= ratingFilter;

                    const matches = cityMatch && priceMatch && ratingMatch;
                    card.style.display = matches ? 'block' : 'none';
                    return matches;
                });

                section.style.display = visibleCards.length > 0 ? 'block' : 'none';
            });

            // Resetear botones de filtro básicos
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            const firstFilterBtn = document.querySelector('.filter-btn');
            if (firstFilterBtn) {
                firstFilterBtn.classList.add('active');
            }

            Logger.info(`Filtros aplicados - Ciudad: , Precio: , Rating: `);
        } catch (error) {
            Logger.error('Error aplicando filtros avanzados', error);
        }
    },

    /**
     * Limpiar todos los filtros
     */
    clearAllFilters() {
        try {
            // Reset dropdowns
            const cityFilter = document.getElementById('cityFilter');
            const priceFilter = document.getElementById('priceFilter');
            const ratingFilter = document.getElementById('ratingFilter');
            const searchInput = document.getElementById('attractionSearch');

            if (cityFilter) cityFilter.value = 'all';
            if (priceFilter) priceFilter.value = 'all';
            if (ratingFilter) ratingFilter.value = '0';
            if (searchInput) searchInput.value = '';

            // Clear search term
            this.searchTerm = '';

            // Show all cards
            const cards = document.querySelectorAll('.attraction-card');
            const sections = document.querySelectorAll('.category-section');

            cards.forEach(card => card.style.display = 'block');
            sections.forEach(section => section.style.display = 'block');

            // Reset filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            const allBtn = document.querySelector('.filter-btn');
            if (allBtn) allBtn.classList.add('active');

            Logger.info('Todos los filtros limpiados');
        } catch (error) {
            Logger.error('Error limpiando filtros', error);
        }
    }
};

// Exponer globalmente
window.AttractionsHandler = AttractionsHandler;
    const confirmed = await window.Dialogs.confirm({
        title: '🗑️ ¿Eliminar Gasto?',
        message: '¿Estás seguro de que deseas eliminar este gasto?',
        okText: 'Sí, eliminar',
        isDestructive: true
    });
    if (!confirmed) return;

    try {
      if (!auth.currentUser) {
        // Sin usuario, eliminar localmente
        this.expenses = this.expenses.filter(exp => 
          (exp.id || exp.timestamp.toString()) !== expenseId
        );
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.updateModal();
        console.log('📱 Gasto eliminado localmente');
        return;
      }

      const tripId = this.getCurrentTripId();

      if (!tripId) {
        // Modo individual
        const userId = auth.currentUser.uid;
        await deleteDoc(doc(db, `users/${userId}/expenses`, expenseId));
        console.log('✅ Gasto eliminado (individual) de Firebase');
      } else {
        // 🔥 Modo colaborativo
        await deleteDoc(doc(db, `trips/${tripId}/expenses`, expenseId));
        console.log('✅ Gasto eliminado (COMPARTIDO) de Firebase');
      }
    } catch (error) {
      console.error('❌ Error eliminando gasto:', error);
      window.Notifications.error('Error al eliminar. Intenta de nuevo.');
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // 🔥 NUEVO: Obtener icono por categoría
  getCategoryIcon(category) {
    const icons = {
      'Comida': '🍜',
      'Transporte': '🚇',
      'Alojamiento': '🏨',
      'Entretenimiento': '🎮',
      'Compras': '🛍️',
      'Otros': '📦'
    };
    return icons[category] || '📦';
  },

  // 🔥 NUEVO: Obtener color de barra de progreso por categoría
  getCategoryColor(category) {
    const colors = {
      'Comida': 'bg-gradient-to-r from-orange-400 to-red-500',
      'Transporte': 'bg-gradient-to-r from-blue-400 to-cyan-500',
      'Alojamiento': 'bg-gradient-to-r from-purple-400 to-pink-500',
      'Entretenimiento': 'bg-gradient-to-r from-green-400 to-emerald-500',
      'Compras': 'bg-gradient-to-r from-yellow-400 to-amber-500',
      'Otros': 'bg-gradient-to-r from-gray-400 to-slate-500'
    };
    return colors[category] || colors['Otros'];
  },

  // 🔥 NUEVO: Obtener clase de borde por categoría
  getCategoryColorClass(category) {
    const colors = {
      'Comida': 'border-orange-500',
      'Transporte': 'border-blue-500',
      'Alojamiento': 'border-purple-500',
      'Entretenimiento': 'border-green-500',
      'Compras': 'border-yellow-500',
      'Otros': 'border-gray-500'
    };
    return colors[category] || colors['Otros'];
  },

  // Limpiar listener cuando se cierra
  cleanup() {
    if (this.unsubscribe) {
      console.log('[BudgetTracker] 🛑 Deteniendo listener de gastos.');
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.expenses = [];
    localStorage.removeItem('expenses');
    this.updateModal();
    console.log('[BudgetTracker] 🧹 Estado de gastos limpiado.');
  },

  // Re-inicializar cuando cambie el trip
  reinitialize() {
    this.initRealtimeSync();
  }
};
window.BudgetTracker = BudgetTracker;

// ====================================================================================
// MANEJO DE EVENTOS DE AUTENTICACIÓN
// ====================================================================================
window.addEventListener('auth:initialized', (event) => {
    console.log('[BudgetTracker] ✨ Evento auth:initialized recibido. Inicializando sync de gastos...');
    BudgetTracker.initRealtimeSync();
});

window.addEventListener('auth:loggedOut', () => {
    console.log('[BudgetTracker] 🚫 Evento auth:loggedOut recibido. Limpiando...');
    BudgetTracker.cleanup();
});
