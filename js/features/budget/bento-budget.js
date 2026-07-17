// js/features/budget/bento-budget.js
//
// 🍱 BENTO BUDGET — Presupuesto visual interactivo
//
// Cada compartimento del bento es una categoría de gasto que se "llena"
// según lo gastado vs. su presupuesto (envelope budgeting, versión kawaii).
// Tocar un compartimento abre el detalle de esa categoría con sus gastos,
// su presupuesto editable y agregar-gasto rápido.
//
// Datos: reutiliza la colección trips/{id}/expenses que ya sincroniza
// BudgetTracker en tiempo real (mismo shape: desc, amount, category,
// timestamp, date, addedBy). Presupuestos por categoría se guardan en
// trips/{id} → info.categoryBudgets (localStorage si no hay viaje).

import { db, auth } from '../../core/firebase-config.js';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

// Config de compartimentos. `key` debe coincidir con las categorías ya
// usadas por BudgetTracker. `share` = % del presupuesto total por defecto.
// Geometría sobre viewBox 640x430 (caja 10..630 x 10..420).
const BENTO_COMPARTMENTS = [
  { key: 'Comida',          icon: '🍜', label: 'Comida',       share: 0.30, color: '#fb923c', x: 20,  y: 20,  w: 270, h: 180 },
  { key: 'Alojamiento',     icon: '🏨', label: 'Hotel',        share: 0.30, color: '#a78bfa', x: 300, y: 20,  w: 155, h: 180 },
  { key: 'Transporte',      icon: '🚄', label: 'Transporte',   share: 0.15, color: '#38bdf8', x: 465, y: 20,  w: 155, h: 180 },
  { key: 'Compras',         icon: '🛍️', label: 'Compras',      share: 0.12, color: '#34d399', x: 20,  y: 210, w: 190, h: 180 },
  { key: 'Entretenimiento', icon: '🎮', label: 'Diversión',    share: 0.08, color: '#f472b6', x: 220, y: 210, w: 190, h: 180 },
  { key: 'Otros',           icon: '🎁', label: 'Otros',        share: 0.05, color: '#94a3b8', x: 420, y: 210, w: 200, h: 180 }
];

const JPY_TO_USD = 145; // misma aproximación que usa BudgetTracker

export const BentoBudget = {

  selectedCategory: null,

  // ==========================================================================
  // DATOS
  // ==========================================================================

  getTrip() {
    return window.TripsManager?.currentTrip || null;
  },

  getExpenses() {
    return window.BudgetTracker?.expenses || [];
  },

  /** Presupuesto total del viaje (¥). Editable; con default razonable. */
  getTotalBudget() {
    const trip = this.getTrip();
    const stored = trip?.info?.budget ?? Number(localStorage.getItem('bento_total_budget'));
    if (stored && stored > 0) return Number(stored);

    // Default: ¥15.000/día/persona (mismo criterio que las estadísticas)
    const days = this.getTripDays();
    const members = trip?.members?.length || 1;
    return days * 15000 * members;
  },

  /** Presupuestos por categoría; si no hay guardados, reparto por defecto */
  getCategoryBudgets() {
    const trip = this.getTrip();
    const saved = trip?.info?.categoryBudgets
      || JSON.parse(localStorage.getItem('bento_category_budgets') || 'null');

    const total = this.getTotalBudget();
    const budgets = {};
    for (const c of BENTO_COMPARTMENTS) {
      const savedVal = saved?.[c.key];
      budgets[c.key] = (savedVal && savedVal > 0) ? Number(savedVal) : Math.round(total * c.share);
    }
    return budgets;
  },

  getSpentByCategory() {
    const spent = {};
    for (const c of BENTO_COMPARTMENTS) spent[c.key] = 0;
    for (const exp of this.getExpenses()) {
      const cat = BENTO_COMPARTMENTS.some(c => c.key === exp.category) ? exp.category : 'Otros';
      spent[cat] += Number(exp.amount) || 0;
    }
    return spent;
  },

  getTripDays() {
    const info = this.getTrip()?.info;
    if (!info?.dateStart) return 7;
    return (window.TimeUtils?.daysBetween(info.dateStart, info.dateEnd) || 6) + 1;
  },

  /** Día actual del viaje (1-based), 0 si no empezó, >total si terminó */
  getCurrentTripDay() {
    const info = this.getTrip()?.info;
    if (!info?.dateStart) return 0;
    const diff = window.TimeUtils?.daysBetween(info.dateStart, new Date()) ?? -1;
    return diff + 1;
  },

  computeStats() {
    const budgets = this.getCategoryBudgets();
    const spentByCat = this.getSpentByCategory();
    const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);
    const totalSpent = Object.values(spentByCat).reduce((a, b) => a + b, 0);
    const days = this.getTripDays();
    const currentDay = this.getCurrentTripDay();
    const started = currentDay >= 1;
    const ended = currentDay > days;

    // Ritmo: cuánto llevo gastado vs. lo esperable a esta altura del viaje
    let pace = null;
    if (started && !ended && totalBudget > 0) {
      const expectedByNow = (totalBudget / days) * currentDay;
      pace = totalSpent / expectedByNow; // <1 = bajo el plan, >1 = pasado
    }

    const daysLeft = ended ? 0 : (started ? days - currentDay + 1 : days);
    const remaining = totalBudget - totalSpent;
    const dailyAllowance = daysLeft > 0 ? Math.floor(remaining / daysLeft) : 0;

    // Proyección lineal si el viaje ya empezó
    let projection = null;
    if (started && !ended && currentDay > 0) {
      projection = Math.round((totalSpent / currentDay) * days);
    }

    return { budgets, spentByCat, totalBudget, totalSpent, remaining, days, currentDay, started, ended, pace, dailyAllowance, projection };
  },

  fmt(n) {
    return '¥' + Math.round(n).toLocaleString();
  },

  // ==========================================================================
  // RENDER PRINCIPAL
  // ==========================================================================

  render() {
    const container = document.getElementById('content-budget');
    if (!container) return;

    if (!this.getTrip()) {
      container.innerHTML = `
        <div class="max-w-xl mx-auto my-12 px-4 text-center">
          <div class="text-7xl mb-4">🍱</div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">Bento Budget</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Crea o selecciona un viaje para empezar a llenar tu bento de gastos.</p>
          <button onclick="TripsManager.showCreateTripModal()" class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition">✨ Crear viaje</button>
        </div>
      `;
      return;
    }

    const s = this.computeStats();

    container.innerHTML = `
      <div class="max-w-5xl mx-auto px-3 sm:px-4 py-4">

        <!-- Header + resumen -->
        <div class="text-center mb-4">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-white">🍱 Bento Budget</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Cada compartimento se llena con lo que gastas — que no se te desborde el bento</p>
        </div>

        ${this.renderSummaryCards(s)}

        <!-- Bento interactivo -->
        <div class="bento-stage my-4">
          ${this.renderBentoBox(s)}
        </div>

        <div class="flex justify-center mb-6">
          <button onclick="window.BentoBudget.openAddModal()" class="bento-add-btn">
            ➕ Anotar gasto
          </button>
        </div>

        <!-- Detalle de categoría seleccionada -->
        <div id="bentoDetail">${this.renderDetail(s)}</div>

        <!-- Historial por día -->
        ${this.renderHistory()}
      </div>
    `;
  },

  renderSummaryCards(s) {
    const pct = s.totalBudget > 0 ? Math.min(100, (s.totalSpent / s.totalBudget) * 100) : 0;

    let paceChip = '';
    if (s.pace !== null) {
      if (s.pace <= 0.85) paceChip = `<span class="bento-chip bento-chip-good">🌸 Vas súper bien</span>`;
      else if (s.pace <= 1.1) paceChip = `<span class="bento-chip bento-chip-ok">👍 En ritmo</span>`;
      else paceChip = `<span class="bento-chip bento-chip-over">🔥 Gastando rápido</span>`;
    } else if (!s.started) {
      paceChip = `<span class="bento-chip bento-chip-ok">🧳 El viaje aún no empieza</span>`;
    }

    return `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div class="bento-stat bento-ticket">
          <span class="bento-ticket__stamp" aria-hidden="true">予算</span>
          <div class="bento-stat-label">Presupuesto total</div>
          <div class="bento-stat-value bento-editable" onclick="window.BentoBudget.editTotalBudget()" title="Toca para editar">${this.fmt(s.totalBudget)} ✏️</div>
          <div class="bento-stat-sub">~$${Math.round(s.totalBudget / JPY_TO_USD)} USD</div>
        </div>
        <div class="bento-stat bento-ticket">
          <span class="bento-ticket__stamp" aria-hidden="true">支出</span>
          <div class="bento-stat-label">Gastado</div>
          <div class="bento-stat-value">${this.fmt(s.totalSpent)}</div>
          <div class="bento-progress"><div class="bento-progress-fill ${pct >= 100 ? 'over' : ''}" style="width:${pct}%"></div></div>
        </div>
        <div class="bento-stat bento-ticket">
          <span class="bento-ticket__stamp" aria-hidden="true">残り</span>
          <div class="bento-stat-label">${s.remaining >= 0 ? 'Te queda' : 'Excedido'}</div>
          <div class="bento-stat-value ${s.remaining < 0 ? 'text-red-500' : ''}">${this.fmt(Math.abs(s.remaining))}</div>
          <div class="bento-stat-sub">${s.started && !s.ended ? `día ${s.currentDay} de ${s.days}` : `${s.days} días de viaje`}</div>
        </div>
        <div class="bento-stat bento-ticket">
          <span class="bento-ticket__stamp" aria-hidden="true">一日</span>
          <div class="bento-stat-label">Por día disponible</div>
          <div class="bento-stat-value">${this.fmt(Math.max(0, s.dailyAllowance))}</div>
          <div class="bento-stat-sub">${paceChip}</div>
        </div>
      </div>
      ${s.projection !== null ? `
        <div class="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          📈 A este ritmo terminarás el viaje gastando <strong class="${s.projection > s.totalBudget ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}">${this.fmt(s.projection)}</strong>
          ${s.projection > s.totalBudget ? `(${this.fmt(s.projection - s.totalBudget)} sobre el plan)` : '(dentro del plan 🎉)'}
        </div>
      ` : ''}
    `;
  },

  // ==========================================================================
  // CAJA BENTO (HTML) — compartimentos ilustrados en caja de madera.
  // Reemplaza al viejo SVG; misma interacción (selectCategory, selected,
  // over, nivel de llenado que sube desde la base según gasto/presupuesto).
  // ==========================================================================

  renderBentoBox(s) {
    // Ilustraciones acuarela por compartimento (Nano Banana)
    const BENTO_ART = {
      'Comida': 'comida', 'Alojamiento': 'hotel', 'Transporte': 'transporte',
      'Compras': 'compras', 'Entretenimiento': 'diversion', 'Otros': 'otros'
    };

    const compartments = BENTO_COMPARTMENTS.map(c => {
      const budget = s.budgets[c.key] || 1;
      const spent = s.spentByCat[c.key] || 0;
      const ratio = spent / budget;
      const isOver = ratio > 1;
      const fillPct = Math.round(Math.min(1, ratio) * 100);
      const selected = this.selectedCategory === c.key;
      const pctText = budget > 0 ? Math.round(ratio * 100) + '%' : '';
      const art = BENTO_ART[c.key] || 'otros';

      return `
        <button type="button"
           class="bento-cell ${selected ? 'is-selected' : ''} ${isOver ? 'is-over' : ''}"
           onclick="window.BentoBudget.selectCategory('${c.key}')"
           aria-label="${c.label}: gastado ${this.fmt(spent)} de ${this.fmt(budget)}${isOver ? ' — excedido' : ''}"
           aria-pressed="${selected}">
          <img class="bento-cell__art" src="/images/illustrations/generated/bento/${art}.webp" alt="">
          <span class="bento-cell__fill" style="height:${fillPct}%" aria-hidden="true"></span>
          <span class="bento-cell__head" aria-hidden="true">
            <span class="bento-cell__name">${c.label}</span>
            <span class="bento-cell__amount">${this.fmt(spent)} / ${this.fmt(budget)}</span>
          </span>
          <span class="bento-cell__pct ${isOver ? 'over' : ''}" style="${isOver ? '' : `--cell-color:${c.color}`}" aria-hidden="true">${isOver ? '⚠️ ' : ''}${pctText}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="bento-wood" role="group" aria-label="Bento de presupuesto por categorías">
        <div class="bento-grid">${compartments}</div>
      </div>
      <div class="bento-chopsticks" aria-hidden="true">
        <span></span><span></span><i></i>
      </div>
    `;
  },

  // ==========================================================================
  // DETALLE DE CATEGORÍA
  // ==========================================================================

  selectCategory(key) {
    this.selectedCategory = this.selectedCategory === key ? null : key;
    this.render();
    if (this.selectedCategory) {
      setTimeout(() => document.getElementById('bentoDetail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
    }
  },

  renderDetail(s) {
    const c = BENTO_COMPARTMENTS.find(x => x.key === this.selectedCategory);
    if (!c) {
      return `
        <div class="text-center text-sm text-gray-400 dark:text-gray-500 mb-6">
          👆 Toca un compartimento del bento para ver el detalle de esa categoría
        </div>
      `;
    }

    const spent = s.spentByCat[c.key] || 0;
    const budget = s.budgets[c.key] || 0;
    const expenses = this.getExpenses()
      .filter(e => (BENTO_COMPARTMENTS.some(x => x.key === e.category) ? e.category : 'Otros') === c.key)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return `
      <div class="bento-detail" style="--cat-color:${c.color}">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">${c.icon} ${c.label}</h3>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-500 dark:text-gray-400">Presupuesto:</span>
            <input type="number" min="0" step="500" value="${budget}"
                   onchange="window.BentoBudget.setCategoryBudget('${c.key}', this.value)"
                   class="w-28 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-right font-semibold">
            <button onclick="window.BentoBudget.openAddModal('${c.key}')" class="px-3 py-1.5 rounded-lg text-white text-sm font-bold" style="background:${c.color}">➕ Gasto</button>
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Gastado <strong>${this.fmt(spent)}</strong> de ${this.fmt(budget)}
          ${spent > budget ? `<span class="text-red-500 font-bold"> — te pasaste por ${this.fmt(spent - budget)} 😅</span>` : ` — te queda ${this.fmt(budget - spent)}`}
        </p>
        ${expenses.length === 0 ? `
          <p class="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Sin gastos en esta categoría todavía ✨</p>
        ` : `
          <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            ${expenses.map(e => `
              <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div class="min-w-0">
                  <div class="text-sm font-medium text-gray-800 dark:text-white truncate">${e.desc || 'Gasto'}</div>
                  <div class="text-xs text-gray-400">${e.date ? window.TimeUtils.formatDate(e.date.split('T')[0], { day: 'numeric', month: 'short' }) : ''} ${e.addedBy ? '· ' + String(e.addedBy).split('@')[0] : ''}</div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="font-bold text-gray-800 dark:text-white text-sm">${this.fmt(e.amount)}</span>
                  ${e.id ? `<button onclick="window.BentoBudget.removeExpense('${e.id}')" class="text-gray-300 hover:text-red-500 transition rounded-full" title="Eliminar">🗑️</button>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  // ==========================================================================
  // HISTORIAL POR DÍA
  // ==========================================================================

  renderHistory() {
    const expenses = this.getExpenses();
    if (expenses.length === 0) return '';

    // Agrupar por fecha (YYYY-MM-DD)
    const byDay = {};
    for (const e of expenses) {
      const day = (e.date || new Date(e.timestamp || Date.now()).toISOString()).split('T')[0];
      (byDay[day] = byDay[day] || []).push(e);
    }
    const days = Object.keys(byDay).sort().reverse().slice(0, 14);

    return `
      <div class="mt-6">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-3">📅 Últimos días</h3>
        <div class="space-y-3">
          ${days.map(day => {
            const dayExpenses = byDay[day];
            const dayTotal = dayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            return `
              <div class="bento-day-row">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-bold text-gray-700 dark:text-gray-200 capitalize">${window.TimeUtils.formatDate(day, { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                  <span class="text-sm font-extrabold text-gray-800 dark:text-white">${this.fmt(dayTotal)}</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  ${dayExpenses.map(e => {
                    const c = BENTO_COMPARTMENTS.find(x => x.key === e.category) || BENTO_COMPARTMENTS[5];
                    return `<span class="bento-mini-chip" style="--cat-color:${c.color}" title="${(e.desc || '').replace(/"/g, '&quot;')}">${c.icon} ${this.fmt(e.amount)}</span>`;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // AGREGAR / ELIMINAR GASTOS
  // ==========================================================================

  openAddModal(presetCategory = null) {
    document.getElementById('bentoAddModal')?.remove();

    const cat = presetCategory || this.selectedCategory || 'Comida';
    const modal = document.createElement('div');
    modal.id = 'bentoAddModal';
    modal.className = 'fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md p-5 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">🍱 Anotar gasto</h3>
          <button onclick="document.getElementById('bentoAddModal').remove()" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full">✕</button>
        </div>

        <input id="bentoAmount" type="number" inputmode="numeric" min="0" placeholder="0"
               class="w-full text-center text-4xl font-extrabold py-3 mb-1 bg-transparent border-b-2 border-gray-200 dark:border-gray-600 focus:border-pink-400 outline-none dark:text-white"
               oninput="document.getElementById('bentoUsdHint').textContent = this.value ? '~$' + Math.round(this.value / ${JPY_TO_USD}) + ' USD' : ''">
        <div class="text-center text-xs text-gray-400 mb-3"><span>¥ yenes · </span><span id="bentoUsdHint"></span></div>

        <!-- Montos rápidos: suman al valor actual (¥1000 + ¥500 = ¥1500) -->
        <div class="flex justify-center gap-2 mb-4 flex-wrap">
          ${[500, 1000, 3000, 10000].map(v => `
            <button type="button"
                    onclick="const i = document.getElementById('bentoAmount'); i.value = (parseInt(i.value) || 0) + ${v}; i.dispatchEvent(new Event('input'));"
                    class="px-3 py-1.5 rounded-full text-sm font-bold bg-pink-50 dark:bg-gray-700 text-pink-600 dark:text-amber-300 border border-pink-200 dark:border-gray-600 hover:scale-105 transition">
              +¥${v.toLocaleString()}
            </button>
          `).join('')}
          <button type="button"
                  onclick="const i = document.getElementById('bentoAmount'); i.value = ''; i.dispatchEvent(new Event('input')); i.focus();"
                  class="px-3 py-1.5 rounded-full text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-400 border border-gray-200 dark:border-gray-600 hover:scale-105 transition" title="Borrar monto">
            ↺
          </button>
        </div>

        <div class="grid grid-cols-3 gap-2 mb-4">
          ${BENTO_COMPARTMENTS.map(c => `
            <button type="button" data-cat="${c.key}"
                    onclick="document.querySelectorAll('#bentoAddModal [data-cat]').forEach(b => b.classList.remove('bento-cat-active')); this.classList.add('bento-cat-active');"
                    class="bento-cat-chip ${c.key === cat ? 'bento-cat-active' : ''}" style="--cat-color:${c.color}">
              <span class="text-xl">${c.icon}</span>
              <span class="text-xs font-semibold">${c.label}</span>
            </button>
          `).join('')}
        </div>

        <input id="bentoDesc" type="text" placeholder="¿Qué fue? (opcional — ej: Ichiran ramen 🍜)"
               class="w-full px-3 py-2.5 mb-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm">

        <button onclick="window.BentoBudget.saveExpense()"
                class="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold rounded-2xl shadow-lg transition text-lg">
          Guardar ✨
        </button>
      </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
    setTimeout(() => document.getElementById('bentoAmount')?.focus(), 60);
  },

  async saveExpense() {
    const amount = parseFloat(document.getElementById('bentoAmount')?.value);
    const desc = document.getElementById('bentoDesc')?.value.trim() || '';
    const category = document.querySelector('#bentoAddModal .bento-cat-active')?.dataset.cat || 'Otros';

    if (!amount || amount <= 0) {
      window.Notifications?.warning('⚠️ Ingresa el monto del gasto');
      return;
    }

    const expense = {
      desc: desc || category,
      amount,
      category,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      addedBy: auth.currentUser ? auth.currentUser.email : 'Usuario local'
    };

    try {
      const tripId = this.getTrip()?.id;
      if (auth.currentUser && tripId) {
        await addDoc(collection(db, `trips/${tripId}/expenses`), expense);
        // El onSnapshot de BudgetTracker actualizará todo (incluido este tab)
      } else {
        // Modo local: mismo storage que BudgetTracker
        window.BudgetTracker.expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(window.BudgetTracker.expenses));
        this.render();
      }
      document.getElementById('bentoAddModal')?.remove();
      window.Notifications?.success(`🍱 ${this.fmt(amount)} en ${category}`);
    } catch (error) {
      console.error('❌ Error guardando gasto:', error);
      window.Notifications?.error('Error al guardar el gasto');
    }
  },

  async removeExpense(expenseId) {
    if (window.BudgetTracker?.deleteExpense) {
      await window.BudgetTracker.deleteExpense(expenseId);
      this.render();
    }
  },

  // ==========================================================================
  // PRESUPUESTOS
  // ==========================================================================

  async editTotalBudget() {
    const current = this.getTotalBudget();
    const input = await (window.Dialogs?.prompt
      ? window.Dialogs.prompt({ title: '💰 Presupuesto total del viaje', message: 'Monto total en yenes (¥):', defaultValue: String(current) })
      : Promise.resolve(prompt('Presupuesto total del viaje (¥):', current)));
    const value = parseInt(input);
    if (!value || value <= 0) return;

    await this.persistBudgetField('info.budget', value, 'bento_total_budget');
    // Recalcular repartos por defecto de categorías que no fueron personalizadas
    this.render();
  },

  async setCategoryBudget(key, value) {
    const budgets = this.getCategoryBudgets();
    budgets[key] = Math.max(0, parseInt(value) || 0);
    await this.persistBudgetField('info.categoryBudgets', budgets, 'bento_category_budgets');
    this.render();
  },

  async persistBudgetField(field, value, localKey) {
    const trip = this.getTrip();
    try {
      if (auth.currentUser && trip?.id) {
        await updateDoc(doc(db, 'trips', trip.id), { [field]: value });
        // Reflejar en el objeto local para que el render inmediato lo vea
        const parts = field.split('.');
        if (parts.length === 2) trip[parts[0]][parts[1]] = value;
      } else {
        localStorage.setItem(localKey, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    } catch (error) {
      console.error('❌ Error guardando presupuesto:', error);
      localStorage.setItem(localKey, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  },

  // ==========================================================================
  // INIT
  // ==========================================================================

  init() {
    this.render();

    // Re-render cuando cambien los datos (BudgetTracker emite tras cada sync)
    window.addEventListener('expensesUpdated', () => this.render());
    window.addEventListener('tripSelected', () => this.render());

    // Render fresco al entrar al tab
    document.addEventListener('click', (e) => {
      if (e.target.closest('.tab-btn[data-tab="budget"], .mobile-nav-item[data-tab="budget"]')) {
        setTimeout(() => this.render(), 50);
      }
    });
  }
};

window.BentoBudget = BentoBudget;
BentoBudget.init();
