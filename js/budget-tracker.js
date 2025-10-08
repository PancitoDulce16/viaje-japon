// js/budget-tracker.js
import { AppCore } from './core.js';

export const BudgetTracker = {
  expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),

  updateModal() {
    const container = document.getElementById('budgetModalContent');
    if (!container) return;
    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex gap-2">
          <input id="expenseDesc" type="text" class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Descripción (ej. Sushi)" aria-label="Descripción del gasto">
          <input id="expenseAmount" type="number" class="w-32 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Monto (JPY)" aria-label="Monto del gasto">
          <button onclick="BudgetTracker.addExpense()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" aria-label="Añadir gasto">➕</button>
        </div>
        <div class="space-y-2">
          ${this.expenses.map((exp, index) => `
            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="dark:text-white">${AppCore.escapeHtml(exp.desc)}</span>
              <span class="text-green-600 dark:text-green-400">¥${exp.amount}</span>
              <button onclick="BudgetTracker.deleteExpense(${index})" class="text-red-600 hover:text-red-700" aria-label="Eliminar gasto ${exp.desc}">🗑️</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.updateTotalSpent();
  },

  addExpense() {
    const descInput = document.getElementById('expenseDesc');
    const amountInput = document.getElementById('expenseAmount');
    if (!descInput || !amountInput || !descInput.value.trim() || !amountInput.value) return;
    this.expenses.push({ desc: descInput.value.trim(), amount: parseFloat(amountInput.value) });
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
    descInput.value = '';
    amountInput.value = '';
    this.updateModal();
  },

  deleteExpense(index) {
    if (!confirm('¿Eliminar este gasto?')) return;
    this.expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
    this.updateModal();
  },

  updateTotalSpent() {
    const total = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalSpent = document.getElementById('totalSpent');
    if (totalSpent) totalSpent.textContent = `¥${total}`;
  }
};
