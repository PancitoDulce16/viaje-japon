// js/expense-splitter.js - Sistema de División de Gastos

import { db, auth } from './firebase-config.js';
import { collection, doc, getDoc, setDoc, onSnapshot, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { Logger, escapeHTML, CurrencyFormatter } from './helpers.js';
import { Notifications } from './notifications.js';

/**
 * ExpenseSplitter - Sistema inteligente para dividir gastos entre miembros del viaje
 */
export const ExpenseSplitter = {
    currentTrip: null,
    members: [],
    payments: [],
    unsubscribe: null,

    /**
     * Inicializar el expense splitter
     */
    async init(tripId) {
        Logger.info('💰 ExpenseSplitter: Inicializando...');

        if (!tripId) {
            Logger.warn('ExpenseSplitter: No trip ID provided');
            return;
        }

        this.currentTrip = tripId;
        await this.loadTripMembers();
        await this.setupRealtimeSync();
        this.render();
    },

    /**
     * Cargar miembros del viaje
     */
    async loadTripMembers() {
        try {
            const tripRef = doc(db, 'trips', this.currentTrip);
            const tripSnap = await getDoc(tripRef);

            if (tripSnap.exists()) {
                const tripData = tripSnap.data();
                this.members = tripData.members || [];

                // Cargar información de usuarios
                this.membersInfo = await this.loadMembersInfo();
            }
        } catch (error) {
            Logger.error('Error loading trip members:', error);
            Notifications.error('Error al cargar miembros del viaje');
        }
    },

    /**
     * Cargar información detallada de los miembros
     */
    async loadMembersInfo() {
        const membersInfo = {};

        for (const memberId of this.members) {
            try {
                const userRef = doc(db, 'users', memberId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    membersInfo[memberId] = {
                        id: memberId,
                        email: userData.email || 'Usuario',
                        displayName: userData.displayName || userData.email?.split('@')[0] || 'Usuario',
                        photoURL: userData.photoURL || null
                    };
                } else {
                    // Fallback si no existe documento de usuario
                    membersInfo[memberId] = {
                        id: memberId,
                        email: 'Usuario',
                        displayName: 'Usuario',
                        photoURL: null
                    };
                }
            } catch (error) {
                Logger.warn('Error loading member info:', error);
                membersInfo[memberId] = {
                    id: memberId,
                    email: 'Usuario',
                    displayName: 'Usuario',
                    photoURL: null
                };
            }
        }

        return membersInfo;
    },

    /**
     * Configurar sincronización en tiempo real
     */
    async setupRealtimeSync() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        const paymentsRef = doc(db, `trips/${this.currentTrip}/data`, 'expenseSplitter');

        this.unsubscribe = onSnapshot(paymentsRef, (docSnap) => {
            if (docSnap.exists()) {
                this.payments = docSnap.data().payments || [];
                this.render();
            }
        }, (error) => {
            Logger.error('Error in realtime sync:', error);
        });
    },

    /**
     * Renderizar la UI del expense splitter
     */
    render() {
        const container = document.getElementById('expenseSplitterContent');
        if (!container) {
            Logger.warn('ExpenseSplitter: Container not found');
            return;
        }

        const summary = this.calculateSummary();

        const html = `
            <div class="expense-splitter">
                <!-- Header -->
                <div class="mb-6">
                    <h3 class="text-xl font-bold mb-2">💰 División de Gastos</h3>
                    <p class="text-gray-600 dark:text-gray-400">
                        Divide gastos equitativamente entre los miembros del viaje
                    </p>
                </div>

                <!-- Método de división -->
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2">Método de División</label>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button id="splitEqual" class="split-method-btn active">
                            📊 Equitativo
                        </button>
                        <button id="splitByPercentage" class="split-method-btn">
                            📈 Por Porcentaje
                        </button>
                        <button id="splitCustom" class="split-method-btn">
                            ✏️ Personalizado
                        </button>
                    </div>
                </div>

                <!-- Registrar pago -->
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                    <h4 class="font-bold mb-3">Registrar Pago</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium mb-1">Quién pagó</label>
                            <select id="payerSelect" class="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                ${this.renderMemberOptions()}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Monto (¥)</label>
                            <input type="number" id="paymentAmount"
                                   class="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                   placeholder="0" min="0">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium mb-1">Descripción</label>
                            <input type="text" id="paymentDescription"
                                   class="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                   placeholder="Ej: Cena en restaurante, Hotel 3 noches, etc.">
                        </div>
                    </div>
                    <button id="addPaymentBtn" class="mt-3 btn-primary w-full">
                        ➕ Agregar Pago
                    </button>
                </div>

                <!-- Resumen de pagos -->
                <div class="mb-6">
                    <h4 class="font-bold mb-3">📊 Resumen de Pagos</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Pagado</div>
                            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                                ${CurrencyFormatter.toYen(summary.totalPaid)}
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Por Persona</div>
                            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                ${CurrencyFormatter.toYen(summary.perPerson)}
                            </div>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Miembros</div>
                            <div class="text-2xl font-bold">
                                ${this.members.length}
                            </div>
                        </div>
                    </div>

                    <!-- Quién pagó cuánto -->
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                        <h5 class="font-bold mb-3">💳 Pagos por Persona</h5>
                        ${this.renderPaymentsByMember(summary)}
                    </div>

                    <!-- Quién debe a quién -->
                    <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <h5 class="font-bold mb-3">🔄 Quién Debe a Quién</h5>
                        ${this.renderDebts(summary)}
                    </div>
                </div>

                <!-- Historial de pagos -->
                <div>
                    <h4 class="font-bold mb-3">📜 Historial de Pagos</h4>
                    <div class="space-y-2">
                        ${this.renderPaymentsHistory()}
                    </div>
                </div>

                <!-- Acciones -->
                <div class="mt-6 flex flex-wrap gap-3">
                    <button id="exportSplitBtn" class="btn-secondary">
                        📥 Exportar Resumen
                    </button>
                    <button id="shareSplitBtn" class="btn-secondary">
                        📤 Compartir con Grupo
                    </button>
                    <button id="clearPaymentsBtn" class="btn-danger">
                        🗑️ Limpiar Historial
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.attachEventListeners();
    },

    renderMemberOptions() {
        if (!this.membersInfo) return '<option>Cargando...</option>';

        return this.members.map(memberId => {
            const member = this.membersInfo[memberId];
            return `<option value="${escapeHTML(memberId)}">${escapeHTML(member.displayName)}</option>`;
        }).join('');
    },

    renderPaymentsByMember(summary) {
        if (!summary.paymentsByMember || Object.keys(summary.paymentsByMember).length === 0) {
            return '<p class="text-gray-500 text-sm">No hay pagos registrados aún</p>';
        }

        return Object.entries(summary.paymentsByMember)
            .sort((a, b) => b[1] - a[1]) // Ordenar por monto descendente
            .map(([memberId, amount]) => {
                const member = this.membersInfo[memberId];
                const difference = amount - summary.perPerson;
                const isOverpaid = difference > 0;

                return `
                    <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <div class="flex items-center gap-2">
                            ${member.photoURL ?
                                `<img src="${escapeHTML(member.photoURL)}" alt="${escapeHTML(member.displayName)}" class="w-8 h-8 rounded-full">` :
                                `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                    ${escapeHTML(member.displayName.charAt(0).toUpperCase())}
                                </div>`
                            }
                            <span class="font-medium">${escapeHTML(member.displayName)}</span>
                        </div>
                        <div class="text-right">
                            <div class="font-bold">${CurrencyFormatter.toYen(amount)}</div>
                            <div class="text-xs ${isOverpaid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                ${isOverpaid ? '+' : ''}${CurrencyFormatter.toYen(difference)}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
    },

    renderDebts(summary) {
        if (!summary.debts || summary.debts.length === 0) {
            return '<p class="text-gray-500 text-sm">✅ Todos están al día. No hay deudas pendientes.</p>';
        }

        return summary.debts.map(debt => {
            const fromMember = this.membersInfo[debt.from];
            const toMember = this.membersInfo[debt.to];

            return `
                <div class="flex items-center justify-between py-2 border-b border-yellow-200 dark:border-yellow-800 last:border-0">
                    <div class="flex items-center gap-2">
                        <span class="font-medium">${escapeHTML(fromMember.displayName)}</span>
                        <span class="text-gray-500">debe</span>
                        <span class="font-bold text-yellow-600 dark:text-yellow-400">${CurrencyFormatter.toYen(debt.amount)}</span>
                        <span class="text-gray-500">a</span>
                        <span class="font-medium">${escapeHTML(toMember.displayName)}</span>
                    </div>
                    <button class="text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 px-3 py-1 rounded-full transition-colors"
                            data-debt-from="${escapeHTML(debt.from)}"
                            data-debt-to="${escapeHTML(debt.to)}"
                            data-debt-amount="${debt.amount}">
                        ✓ Marcar como Pagado
                    </button>
                </div>
            `;
        }).join('');
    },

    renderPaymentsHistory() {
        if (!this.payments || this.payments.length === 0) {
            return '<p class="text-gray-500 text-sm text-center py-4">No hay pagos registrados aún</p>';
        }

        return this.payments
            .slice()
            .reverse() // Mostrar más recientes primero
            .map((payment, index) => {
                const member = this.membersInfo[payment.paidBy];
                const date = payment.timestamp?.toDate?.() || new Date(payment.timestamp);

                return `
                    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div class="flex items-center gap-3 flex-1">
                            ${member.photoURL ?
                                `<img src="${escapeHTML(member.photoURL)}" alt="${escapeHTML(member.displayName)}" class="w-10 h-10 rounded-full">` :
                                `<div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                    ${escapeHTML(member.displayName.charAt(0).toUpperCase())}
                                </div>`
                            }
                            <div class="flex-1">
                                <div class="font-medium">${escapeHTML(payment.description)}</div>
                                <div class="text-sm text-gray-500">
                                    ${escapeHTML(member.displayName)} • ${date.toLocaleDateString('es', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-bold text-lg">${CurrencyFormatter.toYen(payment.amount)}</div>
                            </div>
                        </div>
                        <button class="ml-3 text-red-500 hover:text-red-700 p-2"
                                data-payment-index="${this.payments.length - 1 - index}"
                                title="Eliminar pago">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            }).join('');
    },

    /**
     * Calcular resumen de gastos
     */
    calculateSummary() {
        const summary = {
            totalPaid: 0,
            perPerson: 0,
            paymentsByMember: {},
            debts: []
        };

        // Inicializar pagos por miembro
        this.members.forEach(memberId => {
            summary.paymentsByMember[memberId] = 0;
        });

        // Sumar pagos
        this.payments.forEach(payment => {
            summary.totalPaid += payment.amount;
            summary.paymentsByMember[payment.paidBy] = (summary.paymentsByMember[payment.paidBy] || 0) + payment.amount;
        });

        // Calcular por persona
        if (this.members.length > 0) {
            summary.perPerson = summary.totalPaid / this.members.length;
        }

        // Calcular deudas usando algoritmo de minimización
        summary.debts = this.calculateDebts(summary.paymentsByMember, summary.perPerson);

        return summary;
    },

    /**
     * Algoritmo para calcular deudas minimizando transacciones
     */
    calculateDebts(paymentsByMember, perPerson) {
        const balances = {};

        // Calcular balance de cada persona
        Object.entries(paymentsByMember).forEach(([memberId, paid]) => {
            balances[memberId] = paid - perPerson;
        });

        // Separar deudores y acreedores
        const debtors = []; // Quienes deben dinero (balance negativo)
        const creditors = []; // Quienes les deben (balance positivo)

        Object.entries(balances).forEach(([memberId, balance]) => {
            if (balance < -0.01) { // Pequeño margen para errores de redondeo
                debtors.push({ id: memberId, amount: Math.abs(balance) });
            } else if (balance > 0.01) {
                creditors.push({ id: memberId, amount: balance });
            }
        });

        // Generar transacciones
        const debts = [];
        let i = 0, j = 0;

        while (i < debtors.length && j < creditors.length) {
            const debt = Math.min(debtors[i].amount, creditors[j].amount);

            debts.push({
                from: debtors[i].id,
                to: creditors[j].id,
                amount: Math.round(debt) // Redondear al yen más cercano
            });

            debtors[i].amount -= debt;
            creditors[j].amount -= debt;

            if (debtors[i].amount < 0.01) i++;
            if (creditors[j].amount < 0.01) j++;
        }

        return debts;
    },

    /**
     * Agregar evento listeners
     */
    attachEventListeners() {
        // Botón agregar pago
        const addBtn = document.getElementById('addPaymentBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addPayment());
        }

        // Botones de eliminar pago
        document.querySelectorAll('[data-payment-index]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.paymentIndex);
                this.deletePayment(index);
            });
        });

        // Botones de marcar deuda como pagada
        document.querySelectorAll('[data-debt-from]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const from = e.currentTarget.dataset.debtFrom;
                const to = e.currentTarget.dataset.debtTo;
                const amount = parseFloat(e.currentTarget.dataset.debtAmount);
                this.markDebtAsPaid(from, to, amount);
            });
        });

        // Exportar
        const exportBtn = document.getElementById('exportSplitBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSummary());
        }

        // Compartir
        const shareBtn = document.getElementById('shareSplitBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareSummary());
        }

        // Limpiar
        const clearBtn = document.getElementById('clearPaymentsBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearPayments());
        }
    },

    /**
     * Agregar un pago
     */
    async addPayment() {
        const payerId = document.getElementById('payerSelect').value;
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        const description = document.getElementById('paymentDescription').value.trim();

        if (!payerId) {
            Notifications.error('Selecciona quién pagó');
            return;
        }

        if (!amount || amount <= 0) {
            Notifications.error('Ingresa un monto válido');
            return;
        }

        if (!description) {
            Notifications.error('Ingresa una descripción');
            return;
        }

        const payment = {
            paidBy: payerId,
            amount: amount,
            description: description,
            timestamp: serverTimestamp(),
            addedBy: auth.currentUser.uid
        };

        try {
            this.payments.push(payment);
            await this.savePayments();

            // Limpiar formulario
            document.getElementById('paymentAmount').value = '';
            document.getElementById('paymentDescription').value = '';

            Notifications.success('Pago agregado correctamente');
        } catch (error) {
            Logger.error('Error adding payment:', error);
            Notifications.error('Error al agregar pago');
        }
    },

    /**
     * Eliminar un pago
     */
    async deletePayment(index) {
        if (!confirm('¿Eliminar este pago?')) return;

        try {
            this.payments.splice(index, 1);
            await this.savePayments();
            Notifications.success('Pago eliminado');
        } catch (error) {
            Logger.error('Error deleting payment:', error);
            Notifications.error('Error al eliminar pago');
        }
    },

    /**
     * Marcar deuda como pagada
     */
    async markDebtAsPaid(from, to, amount) {
        if (!confirm(`¿Confirmar pago de ${CurrencyFormatter.toYen(amount)}?`)) return;

        const payment = {
            paidBy: from,
            amount: amount,
            description: `Pago de deuda a ${this.membersInfo[to].displayName}`,
            timestamp: serverTimestamp(),
            addedBy: auth.currentUser.uid
        };

        try {
            this.payments.push(payment);
            await this.savePayments();
            Notifications.success('Deuda marcada como pagada');
        } catch (error) {
            Logger.error('Error marking debt as paid:', error);
            Notifications.error('Error al registrar pago');
        }
    },

    /**
     * Guardar pagos en Firestore
     */
    async savePayments() {
        try {
            const paymentsRef = doc(db, `trips/${this.currentTrip}/data`, 'expenseSplitter');
            await setDoc(paymentsRef, {
                payments: this.payments,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            Logger.error('Error saving payments:', error);
            throw error;
        }
    },

    /**
     * Exportar resumen
     */
    exportSummary() {
        const summary = this.calculateSummary();

        let text = '💰 RESUMEN DE GASTOS\n\n';
        text += `Total Pagado: ${CurrencyFormatter.toYen(summary.totalPaid)}\n`;
        text += `Por Persona: ${CurrencyFormatter.toYen(summary.perPerson)}\n\n`;

        text += '💳 PAGOS POR PERSONA:\n';
        Object.entries(summary.paymentsByMember).forEach(([memberId, amount]) => {
            const member = this.membersInfo[memberId];
            text += `${member.displayName}: ${CurrencyFormatter.toYen(amount)}\n`;
        });

        text += '\n🔄 QUIÉN DEBE A QUIÉN:\n';
        if (summary.debts.length === 0) {
            text += '✅ Todos están al día\n';
        } else {
            summary.debts.forEach(debt => {
                const fromMember = this.membersInfo[debt.from];
                const toMember = this.membersInfo[debt.to];
                text += `${fromMember.displayName} debe ${CurrencyFormatter.toYen(debt.amount)} a ${toMember.displayName}\n`;
            });
        }

        // Copiar al portapapeles
        navigator.clipboard.writeText(text);
        Notifications.success('Resumen copiado al portapapeles');
    },

    /**
     * Compartir resumen
     */
    shareSummary() {
        this.exportSummary(); // Por ahora solo copia
        Notifications.info('Resumen copiado. Pégalo en el chat del grupo.');
    },

    /**
     * Limpiar historial
     */
    async clearPayments() {
        if (!confirm('¿Eliminar todo el historial de pagos? Esta acción no se puede deshacer.')) return;

        try {
            this.payments = [];
            await this.savePayments();
            Notifications.success('Historial limpiado');
        } catch (error) {
            Logger.error('Error clearing payments:', error);
            Notifications.error('Error al limpiar historial');
        }
    },

    /**
     * Cleanup
     */
    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        Logger.info('🧹 ExpenseSplitter: Cleaned up');
    }
};

// Exponer globalmente
if (typeof window !== 'undefined') {
    window.ExpenseSplitter = ExpenseSplitter;
}
