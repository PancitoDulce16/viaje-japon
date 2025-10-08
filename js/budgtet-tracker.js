/* ===================================
   BUDGET TRACKER - CONTROL DE GASTOS
   =================================== */

   const BudgetTracker = {
    expenses: [],
    TOTAL_BUDGET: 3000,

    init() {
        this.loadExpenses();
        this.updateDisplay();
    },

    loadExpenses() {
        try {
            this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        } catch (error) {
            console.error('Error loading expenses:', error);
            this.expenses = [];
        }
    },

    addExpense(event) {
        event.preventDefault();
        
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const desc = document.getElementById('expenseDesc').value.trim();
        
        if (!amount || !desc) return;
        
        this.expenses.push({
            amount,
            desc,
            date: new Date().toLocaleDateString('es-ES')
        });
        
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.updateDisplay();
        this.updateModal();
        
        event.target.reset();
    },

    deleteExpense(index) {
        if (!confirm('¿Eliminar este gasto?')) return;
        
        this.expenses.splice(index, 1);
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.updateDisplay();
        this.updateModal();
    },

    updateDisplay() {
        const total = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const elem = document.getElementById('totalSpent');
        if (elem) elem.textContent = '$' + total.toFixed(0);
    },

    updateModal() {
        const total = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = this.TOTAL_BUDGET - total;
        
        const container = document.getElementById('budgetModalContent');
        if (!container) return;
        
        container.innerHTML = `
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Presupuesto</p>
                    <p class="text-2xl font-bold text-green-600 dark:text-green-400">$${this.TOTAL_BUDGET}</p>
                </div>
                <div class="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Gastado</p>
                    <p class="text-2xl font-bold text-red-600 dark:text-red-400">$${total.toFixed(0)}</p>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Restante</p>
                    <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">$${remaining.toFixed(0)}</p>
                </div>
            </div>
            
            <div class="border-t dark:border-gray-600 pt-4 mb-4">
                <h3 class="font-bold mb-3 dark:text-white">Agregar Gasto</h3>
                <form onsubmit="BudgetTracker.addExpense(event)" class="flex gap-2">
                    <input type="number" id="expenseAmount" placeholder="$0" required step="0.01" class="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <input type="text" id="expenseDesc" placeholder="Descripción" required class="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <button type="submit" class="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">+</button>
                </form>
            </div>

            <div class="space-y-2 max-h-60 overflow-y-auto">
                ${this.expenses.length === 0 
                    ? '<p class="text-gray-500 text-center py-4">No hay gastos registrados</p>'
                    : this.expenses.map((exp, i) => `
                        <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <p class="font-semibold dark:text-white">${exp.desc}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${exp.date}</p>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="font-bold text-red-600 dark:text-red-400">$${exp.amount}</span>
                                <button onclick="BudgetTracker.deleteExpense(${i})" class="text-red-600 hover:text-red-700">🗑️</button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    }
};

// Initialize
BudgetTracker.init();