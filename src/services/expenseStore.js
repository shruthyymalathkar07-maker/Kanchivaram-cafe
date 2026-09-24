// Centralized Single Source of Truth Operational Expense Store for Kanchivaram Café
import { fetchExpenses, createExpense, updateExpense as apiUpdateExpense, deleteExpense as apiDeleteExpense, socket } from './api';

const getTodayIso = () => new Date().toISOString().split('T')[0];
const getDisplayDate = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

class ExpenseStore {
  constructor() {
    this.branches = {
      'branch-1': { expenses: [] },
      'branch-2': { expenses: [] }
    };
    this.currentBranchId = 'branch-1';
    this.listeners = new Set();
    this.hydrated = {};

    this.initSocketListeners();
  }

  initSocketListeners() {
    if (typeof window === 'undefined') return;

    socket.on('expense_created', ({ expense, branchId }) => {
      if (branchId && expense) {
        if (!this.branches[branchId]) this.branches[branchId] = { expenses: [] };
        const exists = this.branches[branchId].expenses.some(e => e.id === expense.id);
        if (!exists) {
          this.branches[branchId].expenses.unshift(expense);
          this.notify();
        }
      }
    });

    socket.on('expense_updated', ({ expense, branchId }) => {
      if (branchId && expense && this.branches[branchId]) {
        const idx = this.branches[branchId].expenses.findIndex(e => e.id === expense.id);
        if (idx !== -1) {
          this.branches[branchId].expenses[idx] = expense;
          this.notify();
        }
      }
    });

    socket.on('expense_deleted', ({ id, branchId }) => {
      if (branchId && id && this.branches[branchId]) {
        this.branches[branchId].expenses = this.branches[branchId].expenses.filter(e => e.id !== id);
        this.notify();
      }
    });
  }

  async hydrateFromBackend(branchId = this.currentBranchId) {
    try {
      const data = await fetchExpenses(branchId);
      if (data && data.success && Array.isArray(data.expenses)) {
        if (!this.branches[branchId]) {
          this.branches[branchId] = { expenses: [] };
        }
        this.branches[branchId].expenses = data.expenses;
        this.hydrated[branchId] = true;
        this.notify();
      }
    } catch (err) {
      console.warn(`[ExpenseStore] Hydration error for ${branchId}:`, err);
    }
  }

  setBranch(branchId) {
    if (branchId && this.currentBranchId !== branchId) {
      this.currentBranchId = branchId;
      if (!this.branches[branchId]) {
        this.branches[branchId] = { expenses: [] };
      }
      this.hydrateFromBackend(branchId);
      this.notify();
    }
  }

  get expenses() {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { expenses: [] };
    }
    return this.branches[this.currentBranchId].expenses;
  }

  set expenses(val) {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { expenses: [] };
    }
    this.branches[this.currentBranchId].expenses = val;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.getState()));
  }

  getState() {
    const todayIso = getTodayIso();
    
    // Sort expenses newest first
    const sorted = [...this.expenses].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    // Totals calculation
    const totalExpenses = sorted.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    
    const todayExpenses = sorted
      .filter(e => e.date === todayIso)
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const currentMonthPrefix = todayIso.slice(0, 7); // "YYYY-MM"
    const monthExpenses = sorted
      .filter(e => (e.date || '').startsWith(currentMonthPrefix))
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    return {
      expenses: sorted,
      summary: {
        totalExpenses,
        todayExpenses,
        monthExpenses,
        totalRecordsCount: sorted.length,
        todayIso
      }
    };
  }

  async addExpense(payload) {
    const { description, category, amount, date, notes } = payload;
    const numAmount = parseFloat(amount) || 0;
    if (!description || numAmount <= 0) return null;

    const dateIso = date || getTodayIso();
    const branchId = this.currentBranchId;

    try {
      const res = await createExpense({
        description: description.trim(),
        category: category || 'Other',
        amount: numAmount,
        date: dateIso,
        notes: notes ? notes.trim() : 'General operational expense',
        recordedBy: 'Shruthy A'
      }, branchId);

      if (res && res.success && res.expense) {
        if (!this.branches[branchId]) this.branches[branchId] = { expenses: [] };
        const exists = this.branches[branchId].expenses.some(e => e.id === res.expense.id);
        if (!exists) {
          this.branches[branchId].expenses.unshift(res.expense);
        }
        this.notify();
        return res.expense;
      }
    } catch (err) {
      console.error('[ExpenseStore] addExpense error:', err);
    }
    return null;
  }

  async updateExpense(id, updatedPayload) {
    const branchId = this.currentBranchId;
    const { description, category, amount, date, notes } = updatedPayload;
    const numAmount = parseFloat(amount) || 0;

    try {
      const res = await apiUpdateExpense(id, {
        description: description ? description.trim() : undefined,
        category: category || undefined,
        amount: numAmount > 0 ? numAmount : undefined,
        date: date || undefined,
        notes: notes !== undefined ? notes.trim() : undefined
      }, branchId);

      if (res && res.success && res.expense) {
        const idx = this.expenses.findIndex(e => e.id === id);
        if (idx !== -1) {
          this.expenses[idx] = res.expense;
          this.notify();
        }
        return res.expense;
      }
    } catch (err) {
      console.error('[ExpenseStore] updateExpense error:', err);
    }
    return null;
  }

  async deleteExpense(id) {
    const branchId = this.currentBranchId;
    try {
      const res = await apiDeleteExpense(id, branchId);
      if (res && res.success) {
        this.expenses = this.expenses.filter(e => e.id !== id);
        this.notify();
        return true;
      }
    } catch (err) {
      console.error('[ExpenseStore] deleteExpense error:', err);
    }
    return false;
  }
}

export const expenseStore = new ExpenseStore();

// Auto-hydrate on startup for default branch
if (typeof window !== 'undefined') {
  expenseStore.hydrateFromBackend('branch-1');
  expenseStore.hydrateFromBackend('branch-2');
}
