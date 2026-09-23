// Centralized Single Source of Truth Operational Expense Store for Kanchivaram Café

const getTodayIso = () => new Date().toISOString().split('T')[0];
const getDisplayDate = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const INITIAL_EXPENSES = [];

class ExpenseStore {
  constructor() {
    this.branches = {
      'branch-1': { expenses: [] },
      'branch-2': { expenses: [] }
    };
    this.currentBranchId = 'branch-1';
    this.listeners = new Set();
  }

  setBranch(branchId) {
    if (branchId && this.currentBranchId !== branchId) {
      this.currentBranchId = branchId;
      if (!this.branches[branchId]) {
        this.branches[branchId] = { expenses: [] };
      }
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
    const sorted = [...this.expenses].sort((a, b) => b.date.localeCompare(a.date));

    // Totals calculation
    const totalExpenses = sorted.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    
    const todayExpenses = sorted
      .filter(e => e.date === todayIso)
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const currentMonthPrefix = todayIso.slice(0, 7); // "2026-09"
    const monthExpenses = sorted
      .filter(e => e.date.startsWith(currentMonthPrefix))
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

  addExpense(payload) {
    const { description, category, amount, date, notes } = payload;
    const numAmount = parseFloat(amount) || 0;
    if (!description || numAmount <= 0) return;

    const dateObj = date ? new Date(date) : new Date();
    const dateIso = date || getTodayIso();
    const displayDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const newEntry = {
      id: `exp-${Date.now()}`,
      description: description.trim(),
      category: category || 'Other',
      amount: numAmount,
      date: dateIso,
      displayDate: displayDate,
      notes: notes ? notes.trim() : 'General operational expense',
      recordedBy: 'Shruthy A'
    };

    this.expenses.unshift(newEntry);
    this.notify();
    return newEntry;
  }

  updateExpense(id, updatedPayload) {
    const index = this.expenses.findIndex(e => e.id === id);
    if (index === -1) return;

    const existing = this.expenses[index];
    const { description, category, amount, date, notes } = updatedPayload;
    const numAmount = parseFloat(amount) || 0;

    const dateObj = date ? new Date(date) : new Date(existing.date);
    const dateIso = date || existing.date;
    const displayDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    this.expenses[index] = {
      ...existing,
      description: description ? description.trim() : existing.description,
      category: category || existing.category,
      amount: numAmount > 0 ? numAmount : existing.amount,
      date: dateIso,
      displayDate: displayDate,
      notes: notes !== undefined ? notes.trim() : existing.notes
    };

    this.notify();
    return this.expenses[index];
  }

  deleteExpense(id) {
    const initialLength = this.expenses.length;
    this.expenses = this.expenses.filter(e => e.id !== id);
    if (this.expenses.length !== initialLength) {
      this.notify();
      return true;
    }
    return false;
  }
}

export const expenseStore = new ExpenseStore();
