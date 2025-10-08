// js/budget-tracker.js - CON FIRESTORE SYNC

import { db, auth } from './firebase-config.js';
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

  // Inicializar listener en tiempo real
  initRealtimeSync() {
    // Si ya hay un listener, limpiarlo
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // Si no hay usuario, cargar de localStorage
    if (!auth.currentUser) {
      this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      return;
    }

    // Configurar listener de Firestore en tiempo real
    const userId = auth.currentUser.uid;
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
      
      // También guardar en localStorage como backup
      localStorage.setItem('expenses', JSON.stringify(this.expenses));
      
      // Re-renderizar
      this.updateModal();
      
      console.log('✅ Gastos sincronizados desde Firebase:', this.expenses.length);
    }, (error) => {
      console.error('❌ Error en sync de gastos:', error);
      // Fallback a localStorage si falla
      this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      this.updateModal();
    });
  },

  updateModal() {
    const container = document.getElementById('budgetModalContent');
    if (!container) return;

    const total = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const syncStatus = auth.currentUser 
      ? '<span class="text-green-600 dark:text-green-400">☁️ Sincronizado</span>'
      : '<span class="text-yellow-600 dark:text-yellow-400">📱 Solo local</span>';
    
    container.innerHTML = `
      <div class="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
        <div class="flex justify-between items-center mb-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">Total Gastado</p>
          <p class="text-xs">${syncStatus}</p>
        </div>
        <p class="text-3xl font-bold text-green-600 dark:text-green-400">¥${total.toLocaleString()}</p>
        <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">~$${Math.round(total / 145)} USD</p>
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
          ` : this.expenses.map((exp) => `
            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="dark:text-white flex-1">${this.escapeHtml(exp.desc)}</span>
              <span class="text-green-600 dark:text-green-400 font-semibold mx-4">¥${exp.amount.toLocaleString()}</span>
              <button data-expense-id="${exp.id || exp.timestamp}" class="delete-expense text-red-600 hover:text-red-700 transition" aria-label="Eliminar gasto">🗑️</button>
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
        const expenseId = e.currentTarget.dataset.expenseId;
        this.deleteExpense(expenseId);
      });
    });
  },

  async addExpense() {
    const descInput = document.getElementById('expenseDesc');
    const amountInput = document.getElementById('expenseAmount');
    
    if (!descInput || !amountInput) return;
    
    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    
    if (!desc || !amount || amount <= 0) {
      alert('⚠️ Por favor completa la descripción y monto');
      return;
    }

    const expense = {
      desc,
      amount,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };

    try {
      if (auth.currentUser) {
        // Guardar en Firestore
        const userId = auth.currentUser.uid;
        await addDoc(collection(db, `users/${userId}/expenses`), expense);
        console.log('✅ Gasto guardado en Firebase');
      } else {
        // Guardar solo en localStorage
        this.expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.updateModal();
        console.log('📱 Gasto guardado localmente');
      }

      descInput.value = '';
      amountInput.value = '';
      descInput.focus();
    } catch (error) {
      console.error('❌ Error guardando gasto:', error);
      alert('Error al guardar. Intenta de nuevo.');
    }
  },

  async deleteExpense(expenseId) {
    if (!confirm('¿Eliminar este gasto?')) return;

    try {
      if (auth.currentUser) {
        // Eliminar de Firestore
        const userId = auth.currentUser.uid;
        await deleteDoc(doc(db, `users/${userId}/expenses`, expenseId));
        console.log('✅ Gasto eliminado de Firebase');
      } else {
        // Eliminar de localStorage
        this.expenses = this.expenses.filter(exp => 
          (exp.id || exp.timestamp.toString()) !== expenseId
        );
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        this.updateModal();
        console.log('📱 Gasto eliminado localmente');
      }
    } catch (error) {
      console.error('❌ Error eliminando gasto:', error);
      alert('Error al eliminar. Intenta de nuevo.');
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Limpiar listener cuando se cierra
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
};

// Inicializar cuando cambia el estado de autenticación
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
  BudgetTracker.initRealtimeSync();
});

window.BudgetTracker = BudgetTracker;
