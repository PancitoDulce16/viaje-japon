import { db, auth, storage } from '../../core/firebase-config.js';
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query,
  getDoc, runTransaction, serverTimestamp, setDoc, updateDoc
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { expenseAmount, expensesToCsv, filterExpenses, historicalConversionForEdit, summarizeBudget, toMinorUnits } from './budget-utils.js';
import { formatFileSize, optimizeImage } from '../../utils/image-optimizer.js';
import { convertMinorUnits, currencyScale, DEFAULT_BASE_CURRENCY, formatMoneyMinor, isSupportedCurrency, parseMoneyToMinor, rateToScaled, RATE_SCALE, SUPPORTED_CURRENCIES } from './money.js';
import { exchangeRateService } from './exchange-rate-service.js';
import { calculateSplit } from './expense-split-engine.js';

export { expenseAmount, expensesToCsv, filterExpenses, summarizeBudget, toMinorUnits } from './budget-utils.js';

export const DEFAULT_EXPENSE_CATEGORIES = ['Materiales', 'Transporte', 'Alimentación', 'Servicios', 'Alojamiento', 'Entretenimiento', 'Compras', 'Otros'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

const BudgetTracker = {
  expenses: [],
  budget: { amountMinor: 0, currency: DEFAULT_BASE_CURRENCY, minorUnit: 1 },
  baseCurrency: DEFAULT_BASE_CURRENCY,
  filters: { from: '', to: '', category: '', currency: '' },
  expenseUnsubscribe: null,
  budgetUnsubscribe: null,
  userUnsubscribe: null,
  editingId: null,
  expensePreset: null,
  draftTimer: null,

  draftKey() { return `japitin:draft:expense:${auth.currentUser?.uid || 'guest'}:${this.getCurrentTripId() || 'none'}`; },
  readDraft() { try { return JSON.parse(localStorage.getItem(this.draftKey()) || 'null'); } catch { return null; } },
  clearDraft() { localStorage.removeItem(this.draftKey()); },
  saveDraft(form) { const data=new FormData(form),draft={};['description','amount','currency','category','newCategory','paidBy','date','vendor','notes','manualRate','reservationId','activityId'].forEach(key=>{if(data.has(key))draft[key]=String(data.get(key)||'');});localStorage.setItem(this.draftKey(),JSON.stringify({savedAt:Date.now(),data:draft})); },

  getCurrentTripId() {
    return window.TripsManager?.currentTrip?.id || window.currentTripId || localStorage.getItem('currentTripId');
  },

  getTripMembers() {
    const trip=window.TripsManager?.currentTrip;
    return (trip?.members||[]).map((userId,index)=>({userId,email:trip?.memberEmails?.[index]||userId,name:(trip?.memberEmails?.[index]||userId).split('@')[0]}));
  },

  async createExpenseForReservation(reservation) {
    const tripId = this.getCurrentTripId();
    if (!tripId || !auth.currentUser || !reservation?.id || !reservation.costMinor) throw new Error('La reservación no tiene un costo válido.');
    const reservationRef = doc(db, `trips/${tripId}/reservations/${reservation.id}`);
    const expenseRef = doc(collection(db, `trips/${tripId}/expenses`));
    const rate = await exchangeRateService.getRate(reservation.currency, this.baseCurrency);
    const convertedAmountMinor = convertMinorUnits(reservation.costMinor, reservation.currency, this.baseCurrency, rate.rateScaled);
    await runTransaction(db, async (transaction) => {
      const current = await transaction.get(reservationRef);
      if (!current.exists()) throw new Error('La reservación ya no existe.');
      if (current.data().expenseId) throw new Error('Esta reservación ya tiene un gasto vinculado.');
      transaction.set(expenseRef, {
        description: reservation.title, amountMinor: reservation.costMinor, originalCurrency: reservation.currency,
        convertedAmountMinor, baseCurrency: this.baseCurrency,
        exchangeRate: rate.rate, exchangeRateScaled: rate.rateScaled,
        exchangeRateFetchedAt: new Date(rate.fetchedAt).toISOString(), exchangeRateSource: rate.source,
        category: reservation.type === 'Hospedaje' ? 'Alojamiento' : reservation.type === 'Transporte' || reservation.type === 'Vuelo' ? 'Transporte' : 'Otros',
        date: reservation.startAt.slice(0, 10), merchant: reservation.provider || '', notes: 'Creado desde reservaciones',
        reservationId: reservation.id, createdBy: auth.currentUser.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      transaction.update(reservationRef, { expenseId: expenseRef.id, updatedAt: serverTimestamp() });
    });
    return expenseRef.id;
  },

  notify(type, message) {
    if (window.Notifications?.[type]) window.Notifications[type](message);
    else if (type === 'error') console.error(message);
    else console.info(message);
  },

  getContainer() {
    return document.getElementById('budgetTrackerContent') || document.getElementById('content-budget');
  },

  initRealtimeSync() {
    this.cleanup(false);
    const tripId = this.getCurrentTripId();
    if (!auth.currentUser || !tripId) {
      this.expenses = [];
      this.renderInTab();
      return;
    }
    this.renderLoading();
    this.expenseUnsubscribe = onSnapshot(
      query(collection(db, `trips/${tripId}/expenses`), orderBy('date', 'desc')),
      (snapshot) => {
        this.expenses = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        this.renderInTab();
        window.dispatchEvent(new CustomEvent('expensesUpdated'));
      },
      (error) => this.renderError(`No se pudieron cargar los gastos: ${error.message}`)
    );
    this.budgetUnsubscribe = onSnapshot(doc(db, `trips/${tripId}/budget/general`), (snapshot) => {
      this.budget = snapshot.exists()
        ? { amountMinor: 0, currency: this.baseCurrency, minorUnit: 1, ...snapshot.data() }
        : { amountMinor: 0, currency: this.baseCurrency, minorUnit: 1 };
      this.renderInTab();
    }, (error) => this.renderError(`No se pudo cargar el presupuesto: ${error.message}`));
    this.userUnsubscribe = onSnapshot(doc(db, `users/${auth.currentUser.uid}`), (snapshot) => {
      this.baseCurrency = snapshot.data()?.preferences?.baseCurrency || DEFAULT_BASE_CURRENCY;
      if (!this.budget.amountMinor) this.budget.currency = this.baseCurrency;
      this.renderInTab();
    });
  },

  renderLoading() {
    const container = this.getContainer();
    if (container) container.innerHTML = '<div class="budget-state" role="status">Cargando presupuesto y gastos…</div>';
  },

  renderError(message) {
    const container = this.getContainer();
    if (container) container.innerHTML = `<div class="budget-state budget-state--error" role="alert">${escapeHtml(message)} <button type="button" data-action="retry">Reintentar</button></div>`;
    container?.querySelector('[data-action="retry"]')?.addEventListener('click', () => this.initRealtimeSync());
  },

  formatMoney(amountMinor) {
    return formatMoneyMinor(amountMinor, this.baseCurrency);
  },

  renderInTab() {
    const container = this.getContainer();
    if (!container) return;
    if (!auth.currentUser || !this.getCurrentTripId()) {
      container.innerHTML = '<div class="budget-state">Selecciona un viaje e inicia sesión para administrar su presupuesto.</div>';
      return;
    }
    const filtered = filterExpenses(this.expenses, this.filters);
    const reportableExpenses = this.expenses.filter(item => !item.baseCurrency || item.baseCurrency === this.baseCurrency);
    const reportableFiltered = filtered.filter(item => !item.baseCurrency || item.baseCurrency === this.baseCurrency);
    const budgetMatchesBase = !this.budget.currency || this.budget.currency === this.baseCurrency;
    const totals = summarizeBudget(reportableExpenses, budgetMatchesBase ? (this.budget.amountMinor || 0) : 0);
    const reportTotals = summarizeBudget(reportableFiltered, budgetMatchesBase ? (this.budget.amountMinor || 0) : 0);
    const excludedCount = this.expenses.length - reportableExpenses.length;
    const alertClass = totals.percentUsed >= 100 ? 'budget-alert--danger' : totals.percentUsed >= 80 ? 'budget-alert--warning' : '';
    const alertText = totals.percentUsed >= 100 ? 'Presupuesto excedido' : totals.percentUsed >= 80 ? 'Has alcanzado el 80% del presupuesto' : '';
    const categories = [...new Set([...DEFAULT_EXPENSE_CATEGORIES, ...this.expenses.map((item) => item.category).filter(Boolean)])];
    const currencies = SUPPORTED_CURRENCIES;
    const grouped = filtered.reduce((acc, item) => {
      if (item.baseCurrency && item.baseCurrency !== this.baseCurrency) return acc;
      acc[item.category || 'Otros'] = (acc[item.category || 'Otros'] || 0) + Number(item.convertedAmountMinor ?? expenseAmount(item));
      return acc;
    }, {});
    const byOriginalCurrency = filtered.reduce((acc, item) => {
      const currency = item.originalCurrency || item.currency || this.baseCurrency;
      const row = acc[currency] ||= { originalMinor: 0, baseMinor: 0 };
      row.originalMinor += expenseAmount(item);
      if (!item.baseCurrency || item.baseCurrency === this.baseCurrency) row.baseMinor += Number(item.convertedAmountMinor ?? expenseAmount(item));
      return acc;
    }, {});
    const maxCategory = Math.max(1, ...Object.values(grouped));

    const currencyRows = Object.entries(byOriginalCurrency);
    container.innerHTML = `<section class="budget-module jp-budget-page" aria-labelledby="budgetTitle">
      <aside class="budget-side" aria-label="Navegación del presupuesto"><div class="budget-side__brand"><span>♥</span> Japitin<small>🐱</small></div><nav><button class="active" data-budget-jump="budget-overview">⌂ <span>Resumen</span></button><button data-budget-jump="budget-expenses">👛 <span>Gastos</span></button><button data-action="balances">💳 <span>Balances</span></button><button data-action="balances">⚖ <span>Liquidaciones</span></button><button data-budget-jump="budget-categories">◇ <span>Categorías</span></button><button data-action="balances">☺ <span>Miembros</span></button></nav><img src="/images/illustrations/generated/budget/budget-mascot-vignette.png" alt="" aria-hidden="true"></aside>
      <main class="budget-main" id="budget-overview">
      <header class="budget-module__header"><div><p class="budget-kicker">旅のおこづかい · CUENTAS DEL VIAJE</p><h2 id="budgetTitle">Presupuesto y gastos <span aria-hidden="true">🌸</span></h2><p>Todo clarito para disfrutar Japón sin sorpresas.</p></div><div class="budget-module__head-actions"><label>Moneda base<select id="baseCurrencySelect">${SUPPORTED_CURRENCIES.map(c => `<option ${c === this.baseCurrency ? 'selected' : ''}>${c}</option>`).join('')}</select></label><button data-action="new-expense">＋ Registrar gasto</button><button class="budget-secondary" data-action="gallery">🖼 Abrir galería</button></div></header>
      ${alertText ? `<div class="budget-alert ${alertClass}" role="alert">${escapeHtml(alertText)} · ${totals.percentUsed.toFixed(1)}% utilizado</div>` : ''}
      ${excludedCount || !budgetMatchesBase ? `<div class="budget-alert budget-alert--warning" role="status">${excludedCount} gasto(s) conservan otra moneda base histórica y no se mezclan con ${this.baseCurrency}.</div>` : ''}
      <div class="budget-summary">
        ${this.summaryCard('🧳 Presupuesto', this.formatMoney(totals.budgetMinor), 'budget')}
        ${this.summaryCard('👛 Gastado', this.formatMoney(totals.spentMinor), 'spent')}
        ${this.summaryCard('🐱 Disponible', this.formatMoney(totals.availableMinor), totals.availableMinor < 0 ? 'danger' : 'available')}
        ${this.summaryCard('🥧 Utilizado', `${totals.percentUsed.toFixed(1)}%`, totals.percentUsed >= 80 ? 'danger' : 'percent')}
      </div>
      <div class="budget-journey"><div class="budget-journey__track" aria-label="${totals.percentUsed.toFixed(1)}% del presupuesto utilizado"><span style="width:${Math.min(100, totals.percentUsed)}%"></span><i style="left:${Math.min(98, totals.percentUsed)}%">🐱</i></div><small>Inicio del viaje</small><strong>${totals.percentUsed.toFixed(0)}% del camino</strong><small>¡A disfrutar!</small></div>
      <form id="budgetForm" class="budget-inline-form budget-plan"><label>Presupuesto total <input name="amount" inputmode="decimal" type="number" min="1" step="1" required value="${this.budget.amountMinor ? this.budget.amountMinor / (this.budget.minorUnit || 1) : ''}"></label><button type="submit">Guardar presupuesto</button></form>
      <div id="expenseFormHost">${this.editingId === 'new' || this.editingId ? this.renderExpenseForm(categories) : ''}</div>
      <div class="budget-insights">
        <section class="budget-panel budget-currencies"><h3>Desglose por moneda</h3><div class="budget-donut" style="--used:${Math.min(100, totals.percentUsed)}"><span>Total gastado<strong>${this.formatMoney(totals.spentMinor)}</strong></span></div><div class="budget-currency-list"><header><span>Moneda original</span><span>Gastado</span><span>En ${this.baseCurrency}</span></header>${currencyRows.map(([currency,row])=>`<p><span><i class="budget-dot"></i>${currency}</span><span>${formatMoneyMinor(row.originalMinor,currency)}</span><strong>${formatMoneyMinor(row.baseMinor,this.baseCurrency)}</strong></p>`).join('')||'<p class="budget-empty">Sin gastos todavía.</p>'}</div><small>ⓘ Los montos conservan su tipo de cambio histórico.</small></section>
        <section class="budget-panel budget-personal"><h3>Balances personales</h3>${window.ExpenseBalances?.reportHtml?.()||'<p class="budget-empty">Abre balances para cargar las liquidaciones.</p>'}<button data-action="balances">Ver balances y liquidaciones →</button></section>
        <section class="budget-panel budget-settlements"><h3>⚖ Liquidaciones</h3><p>Revisa pagos pendientes y confirmados.</p><img src="/images/illustrations/generated/budget/budget-mascot-vignette.png" alt="" aria-hidden="true"><button data-action="balances">Administrar</button></section>
      </div>
      <nav class="budget-tabs" aria-label="Vistas del presupuesto"><button class="active" data-view="report">📈 Reporte</button><button data-budget-jump="budget-expenses">☷ Gastos (${this.expenses.length})</button></nav>
      <div class="budget-report" id="budget-expenses">
        <form id="reportFilters" class="budget-filters"><label>Desde<input type="date" name="from" value="${this.filters.from}"></label><label>Hasta<input type="date" name="to" value="${this.filters.to}"></label><label>Categoría<select name="category"><option value="">Todas</option>${categories.map((cat) => `<option ${this.filters.category === cat ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('')}</select></label><label>Moneda<select name="currency"><option value="">Todas</option>${currencies.map(c => `<option ${this.filters.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label><button type="button" data-action="clear-filters">Limpiar</button><button type="button" data-action="csv">Exportar CSV</button><button type="button" data-action="print">Imprimir / PDF</button></form>
        <p class="budget-period-total"><strong>Total del período:</strong> ${this.formatMoney(reportTotals.spentMinor)} · ${filtered.length} gasto(s)</p>
        <div class="budget-report-grid"><section class="budget-panel" id="budget-categories"><h3>Gastos por categoría</h3><div class="budget-chart" role="img" aria-label="Gráfica de gastos por categoría">${Object.entries(grouped).sort((a,b) => b[1]-a[1]).map(([cat, amount]) => `<div class="budget-chart__row"><span>${escapeHtml(cat)}</span><div><i style="width:${amount / maxCategory * 100}%"></i></div><strong>${this.formatMoney(amount)}</strong></div>`).join('') || '<p class="budget-empty">No hay datos para estos filtros.</p>'}</div></section>
        <section class="budget-panel"><h3>Detalle de gastos</h3>${this.renderExpenseList(filtered)}</section></div>
      </div></main>
    </section>`;
    this.bindEvents();
  },

  summaryCard(label, value, kind) {
    return `<article class="budget-summary__card budget-summary__card--${kind}"><span>${label}</span><strong>${value}</strong></article>`;
  },

  renderExpenseForm(categories) {
    const item = this.editingId === 'new' ? {} : this.expenses.find((expense) => expense.id === this.editingId) || {};
    return `<form id="expenseForm" class="expense-form jp-ledger-form"><h3>${item.id ? 'Editar gasto' : 'Nuevo gasto'}</h3><div class="expense-form__grid">
      <label>Concepto*<input name="description" maxlength="160" required value="${escapeHtml(item.description || item.desc)}"></label>
      <label>Monto original*<input name="amount" type="number" inputmode="decimal" min="0.01" step="any" required value="${item.id ? expenseAmount(item) / currencyScale(item.originalCurrency || 'JPY') : ''}"></label>
      <label>Moneda*<select name="currency">${SUPPORTED_CURRENCIES.map(c => `<option ${c === (item.originalCurrency || this.baseCurrency) ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      <label>Categoría*<select name="category" required>${categories.map((cat) => `<option ${item.category === cat ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('')}</select></label>
      <label>Nueva categoría<input name="newCategory" maxlength="40" placeholder="Opcional"></label>
      <label>Fecha*<input name="date" type="date" required value="${item.date?.slice(0,10) || new Date().toISOString().slice(0,10)}"></label>
      <label>Comercio o proveedor<input name="vendor" maxlength="100" value="${escapeHtml(item.vendor)}"></label>
      <label class="expense-form__wide">Notas<textarea name="notes" maxlength="500">${escapeHtml(item.notes)}</textarea></label>
      <label>Tipo de cambio manual<input name="manualRate" type="number" min="0" step="any" placeholder="Solo si falla la API"></label>
      <div id="conversionPreview" class="currency-preview expense-form__wide" role="status">Escribe un monto para ver su equivalente en ${this.baseCurrency}.</div>
      ${this.renderSplitFields(item)}
      <label class="expense-form__wide">Comprobante (las fotos grandes se optimizan automáticamente)<input name="receipt" type="file" accept="image/*"></label>
      </div><div id="expenseUploadStatus" role="status"></div><div class="expense-form__buttons"><button type="button" data-action="cancel-expense">Cancelar</button><button type="submit">${item.id ? 'Actualizar' : 'Guardar'} gasto</button></div></form>`;
  },

  renderSplitFields(item={}) {
    const members=this.getTripMembers(),split=item.split||{},selected=new Set(split.participantIds||members.map(m=>m.userId));
    return `<fieldset class="expense-split expense-form__wide"><legend>División entre integrantes</legend><label class="expense-split__toggle"><input name="splitEnabled" type="checkbox" ${split.enabled?'checked':''}> Dividir este gasto</label><div class="expense-split__settings"><label>Quién pagó<select name="paidBy">${members.map(m=>`<option value="${m.userId}" ${m.userId===(split.paidBy||auth.currentUser.uid)?'selected':''}>${escapeHtml(m.name)}</option>`).join('')}</select></label><label>Método<select name="splitMethod"><option value="equal">Partes iguales</option><option value="custom" ${split.method==='custom'?'selected':''}>Montos personalizados</option><option value="percentage" ${split.method==='percentage'?'selected':''}>Porcentajes</option><option value="shares" ${split.method==='shares'?'selected':''}>Porciones</option></select></label><div class="expense-split__people">${members.map(member=>{const allocation=split.allocations?.find(a=>a.userId===member.userId);return `<label><input name="splitParticipant" type="checkbox" value="${member.userId}" ${selected.has(member.userId)?'checked':''}><span>${escapeHtml(member.name)}</span><input name="splitValue_${member.userId}" type="number" min="0" step="any" value="${allocation?.value??''}" aria-label="Valor para ${escapeHtml(member.name)}"></label>`;}).join('')}</div><label>Notas de la división<textarea name="splitNotes" maxlength="300">${escapeHtml(split.notes)}</textarea></label><div id="splitPreview" role="status">Selecciona participantes para revisar la división.</div></div></fieldset>`;
  },

  renderExpenseList(expenses) {
    if (!expenses.length) return '<p class="budget-empty">No hay gastos para mostrar.</p>';
    return `<div class="expense-list"><div class="expense-table__head" aria-hidden="true"><span>Comercio / Descripción</span><span>Categoría</span><span>Moneda original</span><span>En ${this.baseCurrency}</span><span>Acciones</span></div>${expenses.map((item) => { const originalCurrency = item.originalCurrency || item.currency || this.baseCurrency; const converted = item.convertedAmountMinor ?? expenseAmount(item); return `<article class="expense-row jp-ledger-receipt"><div><strong>${escapeHtml(item.description || item.desc)}</strong><small>${escapeHtml(item.vendor || item.date?.slice(0,10) || '')}</small></div><span>${escapeHtml(item.category || 'Otros')}</span><span>${formatMoneyMinor(expenseAmount(item), originalCurrency)}</span><strong>${formatMoneyMinor(converted, item.baseCurrency || this.baseCurrency)}</strong><div class="expense-row__actions"><button data-action="edit" data-id="${item.id}" aria-label="Editar ${escapeHtml(item.description || item.desc)}">✎</button><button data-action="delete" data-id="${item.id}" aria-label="Eliminar ${escapeHtml(item.description || item.desc)}">⋯</button></div></article>`; }).join('')}</div>`;
  },

  bindEvents() {
    document.getElementById('budgetForm')?.addEventListener('submit', (event) => this.saveBudget(event));
    const expenseForm = document.getElementById('expenseForm');
    expenseForm?.addEventListener('submit', (event) => this.saveExpense(event));
    expenseForm?.addEventListener('input', () => this.previewConversion(expenseForm));
    expenseForm?.addEventListener('input', () => this.previewSplit(expenseForm));
    document.getElementById('baseCurrencySelect')?.addEventListener('change', (event) => this.saveBaseCurrency(event.target.value));
    document.getElementById('reportFilters')?.addEventListener('change', (event) => {
      this.filters[event.target.name] = event.target.value;
      this.renderInTab();
    });
    this.getContainer()?.addEventListener('click', (event) => {
      const jump = event.target.closest('[data-budget-jump]');
      if (jump) document.getElementById(jump.dataset.budgetJump)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const actions = {
        'new-expense': () => { this.editingId = 'new'; this.renderInTab(); },
        'cancel-expense': () => { this.editingId = null; this.renderInTab(); },
        edit: () => { this.editingId = button.dataset.id; this.renderInTab(); },
        delete: () => this.deleteExpense(button.dataset.id),
        csv: () => this.exportCsv(),
        print: () => window.print(),
        'clear-filters': () => { this.filters = { from: '', to: '', category: '', currency: '' }; this.renderInTab(); },
        gallery: () => this.openGallery(),
        balances: () => window.ExpenseBalances?.open()
      };
      actions[button.dataset.action]?.();
    });
  },

  async saveBudget(event) {
    event.preventDefault();
    const amountMinor = parseMoneyToMinor(new FormData(event.currentTarget).get('amount'), this.baseCurrency);
    if (!amountMinor) return this.notify('warning', 'Ingresa un presupuesto mayor que cero.');
    try {
      await setDoc(doc(db, `trips/${this.getCurrentTripId()}/budget/general`), {
        amountMinor, currency: this.baseCurrency, minorUnit: currencyScale(this.baseCurrency),
        updatedBy: auth.currentUser.uid, updatedAt: serverTimestamp(), createdAt: this.budget.createdAt || serverTimestamp()
      }, { merge: true });
      this.notify('success', 'Presupuesto guardado.');
    } catch (error) { this.notify('error', `No se pudo guardar: ${error.message}`); }
  },

  splitInput(form,totalMinor,currency,baseTotalMinor=null) {
    const data=new FormData(form);if(data.get('splitEnabled')!=='on')return null;const method=String(data.get('splitMethod')),members=this.getTripMembers(),ids=data.getAll('splitParticipant').map(String);
    const participants=ids.map(userId=>{const member=members.find(m=>m.userId===userId),raw=String(data.get(`splitValue_${userId}`)||'');const row={userId,email:member?.email||'',value:raw};if(method==='custom')row.valueMinor=parseMoneyToMinor(raw,currency)||0;if(method==='percentage')row.basisPoints=Math.round(Number(raw)*100);if(method==='shares')row.shares=Math.round(Number(raw));return row;});
    const allocations=calculateSplit({totalMinor,currency,baseTotalMinor,method,participants});
    return {enabled:true,paidBy:String(data.get('paidBy')),method,participantIds:ids,allocations,notes:String(data.get('splitNotes')||''),status:'open'};
  },

  previewSplit(form) {
    const host=document.getElementById('splitPreview');if(!host)return;const data=new FormData(form);if(data.get('splitEnabled')!=='on'){host.textContent='Activa la división para repartir este gasto.';return;}const currency=String(data.get('currency')||this.baseCurrency),total=parseMoneyToMinor(data.get('amount'),currency);if(!total){host.textContent='Ingresa primero un monto válido.';return;}try{const split=this.splitInput(form,total,currency);host.innerHTML=split.allocations.map(row=>`<span>${escapeHtml(row.email.split('@')[0]||row.userId)}: <strong>${formatMoneyMinor(row.amountMinor,currency)}</strong>${row.roundingAdjustmentMinor?' · ajuste +1 unidad':''}</span>`).join('');}catch(error){host.textContent=error.message;}
  },

  async saveExpense(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const originalCurrency = String(data.get('currency') || 'JPY');
    const amountMinor = parseMoneyToMinor(data.get('amount'), originalCurrency);
    const description = String(data.get('description') || '').trim();
    const category = String(data.get('newCategory') || data.get('category') || '').trim();
    const date = String(data.get('date') || '');
    if (!amountMinor || !description || !category || !date) return this.notify('warning', 'Completa los campos obligatorios con valores válidos.');
    if (!isSupportedCurrency(originalCurrency) || !isSupportedCurrency(this.baseCurrency)) return this.notify('warning', 'Selecciona CRC, JPY o USD.');
    const existing = this.editingId !== 'new' ? this.expenses.find((item) => item.id === this.editingId) : null;
    let conversion;
    try {
      const historicalConversion = historicalConversionForEdit(existing, {
        amountMinor, originalCurrency, baseCurrency: this.baseCurrency, manualRate: String(data.get('manualRate') || '')
      });
      conversion = historicalConversion
        ? historicalConversion
        : await this.resolveConversion(amountMinor, originalCurrency, String(data.get('manualRate') || ''));
    }
    catch (error) { return this.notify('error', `${error.message}. Reintenta o escribe un tipo de cambio manual.`); }
    let split=null;
    try { split=this.splitInput(form,amountMinor,originalCurrency,conversion.convertedAmountMinor); }
    catch(error) { return this.notify('warning',error.message); }
    const payload = {
      description, desc: description, amountMinor, amount: amountMinor, originalCurrency,
      convertedAmountMinor: conversion.convertedAmountMinor, baseCurrency: this.baseCurrency,
      exchangeRate: conversion.rate, exchangeRateScaled: conversion.rateScaled,
      exchangeRateFetchedAt: new Date(conversion.fetchedAt).toISOString(), exchangeRateSource: conversion.source,
      conversionManual: !conversion.automatic, category, date,
      vendor: String(data.get('vendor') || '').trim(), notes: String(data.get('notes') || '').trim(),
      createdBy: existing?.createdBy || auth.currentUser.uid,
      createdByEmail: existing?.createdByEmail || auth.currentUser.email || '',
      addedBy: existing?.addedBy || auth.currentUser.email || '',
      split, updatedAt: serverTimestamp(), timestamp: Date.now()
    };
    try {
      let expenseId = this.editingId !== 'new' ? this.editingId : null;
      if (expenseId) await updateDoc(doc(db, `trips/${this.getCurrentTripId()}/expenses/${expenseId}`), payload);
      else {
        const created = await addDoc(collection(db, `trips/${this.getCurrentTripId()}/expenses`), { ...payload, createdAt: serverTimestamp() });
        expenseId = created.id;
      }
      const file = data.get('receipt');
      if (file?.size) await this.uploadReceipt(file, expenseId);
      this.editingId = null;
      this.notify('success', 'Gasto guardado.');
    } catch (error) { this.notify('error', `No se pudo guardar el gasto: ${error.message}`); }
  },

  async resolveConversion(amountMinor, originalCurrency, manualRate = '') {
    if (originalCurrency === this.baseCurrency) return { convertedAmountMinor: amountMinor, rate: 1, rateScaled: RATE_SCALE, fetchedAt: Date.now(), source: 'same-currency', automatic: true };
    let quote;
    if (manualRate) {
      const rateScaled = rateToScaled(manualRate);
      if (!rateScaled) throw new Error('El tipo de cambio manual debe ser mayor que cero');
      quote = { rate: Number(manualRate), rateScaled, fetchedAt: Date.now(), source: 'manual', automatic: false };
    } else quote = await exchangeRateService.getRate(originalCurrency, this.baseCurrency);
    return { ...quote, convertedAmountMinor: convertMinorUnits(amountMinor, originalCurrency, this.baseCurrency, quote.rateScaled) };
  },

  async previewConversion(form) {
    const preview = document.getElementById('conversionPreview');
    const data = new FormData(form);
    const currency = String(data.get('currency') || 'JPY');
    const amountMinor = parseMoneyToMinor(data.get('amount'), currency);
    if (!amountMinor) { preview.textContent = `Escribe un monto válido para ver su equivalente en ${this.baseCurrency}.`; return; }
    preview.textContent = 'Consultando tipo de cambio…';
    try {
      const result = await this.resolveConversion(amountMinor, currency, String(data.get('manualRate') || ''));
      preview.innerHTML = `<strong>${formatMoneyMinor(amountMinor, currency)}</strong> equivale a <strong>${formatMoneyMinor(result.convertedAmountMinor, this.baseCurrency)}</strong><small>Cambio ${result.rate} · ${result.automatic ? result.source : 'introducido manualmente'} · ${new Date(result.fetchedAt).toLocaleString('es-CR')}</small>`;
    } catch (error) { preview.innerHTML = `<span role="alert">${escapeHtml(error.message)}. Puedes reintentar o introducir el cambio manualmente.</span>`; }
  },

  async saveBaseCurrency(currency) {
    if (!isSupportedCurrency(currency)) return;
    await setDoc(doc(db, `users/${auth.currentUser.uid}`), { preferences: { baseCurrency: currency } }, { mergeFields: ['preferences.baseCurrency'] });
    this.notify('success', `Moneda local cambiada a ${currency}. Los gastos históricos conservan su conversión original.`);
  },

  async uploadReceipt(file, expenseId) {
    if (!file.type.startsWith('image/')) throw new Error('El comprobante debe ser una imagen.');
    const original = file;
    const optimized = await optimizeImage(file, { maxBytes: MAX_IMAGE_BYTES });
    file = optimized.file;
    const tripId = this.getCurrentTripId();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `trips/${tripId}/images/${auth.currentUser.uid}/${Date.now()}_${safeName}`;
    const task = uploadBytesResumable(ref(storage, storagePath), file, { contentType: file.type });
    const status = document.getElementById('expenseUploadStatus');
    await new Promise((resolve, reject) => task.on('state_changed', (snapshot) => {
      if (status) status.textContent = `Subiendo comprobante: ${Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)}%`;
    }, reject, resolve));
    const url = await getDownloadURL(task.snapshot.ref);
    const metadata = { storagePath, url, name: file.name, type: file.type, size: file.size, originalSize: original.size,
      optimized: optimized.optimized, expenseId, tripId, userId: auth.currentUser.uid, createdAt: serverTimestamp() };
    const imageDoc = await addDoc(collection(db, `trips/${tripId}/images`), metadata);
    await updateDoc(doc(db, `trips/${tripId}/expenses/${expenseId}`), { receiptImageId: imageDoc.id, receiptUrl: url,
      receiptOptimization: optimized.optimized ? `${formatFileSize(original.size)} → ${formatFileSize(file.size)}` : null });
  },

  async deleteExpense(expenseId) {
    if (!confirm('¿Eliminar este gasto? Esta acción no se puede deshacer.')) return;
    const item = this.expenses.find((expense) => expense.id === expenseId);
    try {
      if (item?.receiptImageId) {
        const image = window.BudgetGallery?.images?.find((entry) => entry.id === item.receiptImageId);
        if (image?.storagePath) await deleteObject(ref(storage, image.storagePath)).catch(() => {});
        await deleteDoc(doc(db, `trips/${this.getCurrentTripId()}/images/${item.receiptImageId}`));
      }
      await deleteDoc(doc(db, `trips/${this.getCurrentTripId()}/expenses/${expenseId}`));
      this.notify('success', 'Gasto eliminado.');
    } catch (error) { this.notify('error', `No se pudo eliminar: ${error.message}`); }
  },

  exportCsv() {
    const filtered = filterExpenses(this.expenses, this.filters);
    const cell=value=>`"${String(value??'').replaceAll('"','""')}"`;
    const settlements=window.ExpenseBalances?.settlements||[];
    const settlementRows=['Paga,Recibe,Monto original (minor),Moneda,Monto base (minor),Moneda base,Fecha,Estado,Método,Referencia,Notas',...settlements.map(item=>[item.payerId,item.receiverId,item.amountMinor,item.currency,item.baseAmountMinor,item.baseCurrency,item.date,item.status,item.method,item.reference,item.notes].map(cell).join(','))].join('\r\n');
    const blob = new Blob([`\ufeff${expensesToCsv(filtered, this.budget.currency)}\r\n\r\nLIQUIDACIONES\r\n${settlementRows}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = Object.assign(document.createElement('a'), { href: url, download: `reporte-gastos-${this.getCurrentTripId()}.csv` });
    anchor.click(); URL.revokeObjectURL(url);
  },

  openGallery() {
    if (window.BudgetGallery) window.BudgetGallery.open();
    else this.notify('warning', 'La galería todavía se está cargando.');
  },

  updateModal() { this.renderInTab(); },
  addExpenseFromTab() { this.editingId = 'new'; this.renderInTab(); },
  cleanup(render = true) {
    this.expenseUnsubscribe?.(); this.budgetUnsubscribe?.(); this.userUnsubscribe?.();
    this.expenseUnsubscribe = null; this.budgetUnsubscribe = null; this.userUnsubscribe = null;
    if (render) this.renderInTab();
  },
  reinitialize() { this.initRealtimeSync(); }
};

export { BudgetTracker };
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.BudgetTracker = BudgetTracker;
  window.addEventListener('auth:initialized', () => BudgetTracker.initRealtimeSync());
  window.addEventListener('tripChanged', () => BudgetTracker.reinitialize());
  window.addEventListener('auth:loggedOut', () => BudgetTracker.cleanup());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => BudgetTracker.initRealtimeSync());
  else BudgetTracker.initRealtimeSync();
}
