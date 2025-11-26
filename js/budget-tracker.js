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
      console.log('⚠️ Budget: No hay usuario autenticado, usando localStorage');
      this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      this.updateModal();
      this.renderInTab();
      return;
    }

    const tripId = this.getCurrentTripId();
    const userId = auth.currentUser.uid;

    console.log('🔍 DEBUG Budget initRealtimeSync:', {
      userId: userId,
      tripId: tripId,
      hasTrip: !!tripId
    });

    // Si NO hay trip, solo usar localStorage (sin Firestore sync)
    if (!tripId) {
      console.log('⚠️ Budget: No hay trip seleccionado, solo localStorage (sin sync)');
      // No crear listener de Firestore, solo usar localStorage
      this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      this.updateModal();
      this.renderInTab();
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

      // Re-renderizar ambas vistas
      this.updateModal();
      this.renderInTab();

      console.log('✅ Gastos COMPARTIDOS sincronizados:', this.expenses.length, 'gastos');
    }, (error) => {
      console.error('❌ Error en sync de gastos compartidos:', error);
      // Fallback a localStorage si falla
      this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      this.updateModal();
      this.renderInTab();
    });
  },

  renderInTab() {
    const container = document.getElementById('budgetTrackerContent');
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

    container.innerHTML = `
      <!-- Total Card compacto -->
      <div class="mb-4 p-4 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white rounded-xl shadow-lg">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm opacity-90 mb-1">Total Gastado</p>
            <p class="text-3xl font-bold">¥${total.toLocaleString()}</p>
            <p class="text-xs opacity-90">~$${Math.round(total / 145)} USD • ${this.expenses.length} gastos</p>
          </div>
          <div class="text-right">
            <p class="text-xs opacity-75 mb-1">${tripId ? '🤝 Colaborativo' : '📱 Local'}</p>
          </div>
        </div>
      </div>

      <!-- Formulario compacto -->
      <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 class="font-bold mb-2 text-gray-800 dark:text-white text-sm">➕ Agregar Gasto</h4>
        <div class="grid grid-cols-2 gap-2 mb-2">
          <input id="expenseDescTab" type="text" class="col-span-2 p-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Descripción">
          <select id="expenseCategoryTab" class="p-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            <option value="Comida">🍜 Comida</option>
            <option value="Transporte">🚇 Transporte</option>
            <option value="Alojamiento">🏨 Alojamiento</option>
            <option value="Entretenimiento">🎮 Entretenimiento</option>
            <option value="Compras">🛍️ Compras</option>
            <option value="Otros">📦 Otros</option>
          </select>
          <input id="expenseAmountTab" type="number" class="p-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="¥ JPY">
        </div>
        <button id="addExpenseBtnTab" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 rounded-lg transition text-sm">
          ➕ Agregar
        </button>
      </div>

      <!-- Categorías si hay gastos -->
      ${categories.length > 0 ? `
        <div class="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h4 class="font-bold text-sm mb-3 dark:text-white">📊 Por Categoría</h4>
          <div class="space-y-2">
            ${categories.map(([cat, amount]) => {
              const percent = (amount / total * 100).toFixed(1);
              const icon = this.getCategoryIcon(cat);
              const color = this.getCategoryColor(cat);
              return `
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="dark:text-white">${icon} ${cat}</span>
                    <span class="font-semibold dark:text-white">¥${amount.toLocaleString()} (${percent}%)</span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="${color} h-2 rounded-full" style="width: ${percent}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Lista de gastos compacta -->
      <div class="space-y-2 max-h-96 overflow-y-auto">
        ${this.expenses.length === 0 ? `
          <div class="text-center py-8">
            <div class="text-4xl mb-2">💰</div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">No hay gastos registrados</p>
          </div>
        ` : this.expenses.map((exp) => {
          const icon = this.getCategoryIcon(exp.category || 'Otros');
          const color = this.getCategoryColorClass(exp.category || 'Otros');
          return `
            <div class="group p-2 bg-white dark:bg-gray-700 rounded-lg border-l-4 ${color} hover:shadow-md transition">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span>${icon}</span>
                    <span class="dark:text-white font-semibold text-sm">${this.escapeHtml(exp.desc)}</span>
                  </div>
                  <div class="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                    ${exp.category ? `<span>${exp.category}</span>` : ''}
                    ${exp.date ? `<span>${new Date(exp.date).toLocaleDateString('es')}</span>` : ''}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600 dark:text-green-400 font-bold text-sm">¥${exp.amount.toLocaleString()}</span>
                  <button data-expense-id="${exp.id || exp.timestamp}" class="delete-expense-tab opacity-0 group-hover:opacity-100 text-red-600 text-sm">🗑️</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Event listeners
    const addBtn = document.getElementById('addExpenseBtnTab');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addExpenseFromTab());
    }

    const descInput = document.getElementById('expenseDescTab');
    const amountInput = document.getElementById('expenseAmountTab');

    if (descInput) {
      descInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addExpenseFromTab();
      });
    }

    if (amountInput) {
      amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addExpenseFromTab();
      });
    }

    container.querySelectorAll('.delete-expense-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const expenseId = e.currentTarget.dataset.expenseId;
        this.deleteExpense(expenseId);
      });
    });
  },

  async addExpenseFromTab() {
    const descInput = document.getElementById('expenseDescTab');
    const amountInput = document.getElementById('expenseAmountTab');
    const categorySelect = document.getElementById('expenseCategoryTab');

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
        this.expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.renderInTab();
        descInput.value = '';
        amountInput.value = '';
        descInput.focus();
        return;
      }

      const tripId = this.getCurrentTripId();

      if (!tripId) {
        this.expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.renderInTab();
      } else {
        await addDoc(collection(db, `trips/${tripId}/expenses`), expense);
      }

      descInput.value = '';
      amountInput.value = '';
      descInput.focus();
    } catch (error) {
      console.error('❌ Error guardando gasto:', error);
      window.Notifications.error('Error al guardar. Intenta de nuevo.');
    }
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

          <!-- Gráfico Circular (Chart.js) -->
          <div class="mb-6 flex justify-center">
            <div class="w-64 h-64">
              <canvas id="budgetPieChart"></canvas>
            </div>
          </div>

          <!-- Barras de Progreso -->
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

    // Renderizar gráfico de Chart.js
    this.renderPieChart(byCategory);
  },

  renderPieChart(byCategory) {
    const canvas = document.getElementById('budgetPieChart');
    if (!canvas || Object.keys(byCategory).length === 0) return;

    // Destruir gráfico anterior si existe
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');

    // Detectar modo oscuro
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#f1f5f9' : '#1f2937';
    const gridColor = isDark ? '#475569' : '#e5e7eb';

    // Preparar datos
    const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const labels = categories.map(([cat]) => `${this.getCategoryIcon(cat)} ${cat}`);
    const data = categories.map(([, amount]) => amount);
    const colors = categories.map(([cat]) => this.getCategoryChartColor(cat));

    // Crear gráfico
    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: isDark ? '#1e293b' : '#ffffff',
          borderWidth: 3,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              padding: 15,
              font: {
                size: 12,
                weight: '600'
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percent = ((value / total) * 100).toFixed(1);
                return ` ${label}: ¥${value.toLocaleString()} (${percent}%)`;
              }
            }
          }
        },
        cutout: '65%', // Dona con agujero en el centro
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  },

  getCategoryChartColor(category) {
    const colors = {
      'Comida': '#f59e0b',           // Amber
      'Transporte': '#3b82f6',       // Blue
      'Alojamiento': '#8b5cf6',      // Purple
      'Entretenimiento': '#ec4899',  // Pink
      'Compras': '#10b981',          // Green
      'Otros': '#6b7280'             // Gray
    };
    return colors[category] || colors['Otros'];
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
        // Sin trip, guardar solo localmente (no en Firestore)
        console.log('⚠️ No hay trip, guardando solo en localStorage');
        this.expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.updateModal();
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
          (exp.id || exp.timestamp.toString()) !== expenseId.toString()
        );
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.updateModal();
        console.log('📱 Gasto eliminado localmente');
        return;
      }

      const tripId = this.getCurrentTripId();

      if (!tripId) {
        // Sin trip, eliminar solo localmente
        console.log('⚠️ No hay trip, eliminando solo de localStorage');
        this.expenses = this.expenses.filter(exp =>
          (exp.id || exp.timestamp.toString()) !== expenseId.toString()
        );
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.updateModal();
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
    this.renderInTab();
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
