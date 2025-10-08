// js/budget-tracker.js

export const BudgetTracker = {
  expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),

  updateModal() {
    const container = document.getElementById('budgetModalContent');
    if (!container) return;

    const total = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    container.innerHTML = `
      <div class="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Gastado</p>
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">¥${total.toLocaleString()}</p>
        </div>
      </div>
      
      <div class="space-y-4">
        <div class="flex gap-2">
          <input id="expenseDesc" type="text" class="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Descripción (ej. Sushi)" aria-label="Descripción del gasto">
          <input id="expenseAmount" type="number" class="w-32 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="¥ JPY" aria-label="Monto del gasto">
          <button id="addExpenseBtn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition" aria-label="Añadir gasto">➕</button>
        </div>
        
        <div class="space-y-2 max-h-96 overflow-y-auto">
          ${this.expenses.length === 0 ? `
            <p class="text-center text-gray-500 dark:text-gray-400 py-8">No hay gastos registrados</p>
          ` : this.expenses.map((exp, index) => `
            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="dark:text-white flex-1">${this.escapeHtml(exp.desc)}</span>
              <span class="text-green-600 dark:text-green-400 font-semibold mx-4">¥${exp.amount.toLocaleString()}</span>
              <button data-expense-index="${index}" class="delete-expense text-red-600 hover:text-red-700 transition" aria-label="Eliminar gasto">🗑️</button>
            </div>
          `).join('')}
        </div>
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
        const index = parseInt(e.currentTarget.dataset.expenseIndex);
        this.deleteExpense(index);
      });
    });
  },

  addExpense() {
    const descInput = document.getElementById('expenseDesc');
    const amountInput = document.getElementById('expenseAmount');
    
    if (!descInput || !amountInput) return;
    
    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    
    if (!desc || !amount || amount <= 0) {
      alert('⚠️ Por favor completa la descripción y monto');
      return;
    }
    
    this.expenses.push({ desc, amount });
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
    
    descInput.value = '';
    amountInput.value = '';
    descInput.focus();
    
    this.updateModal();
  },

  deleteExpense(index) {
    if (!confirm('¿Eliminar este gasto?')) return;
    
    this.expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
    this.updateModal();
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

window.BudgetTracker = BudgetTracker;
