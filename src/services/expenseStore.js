// Centralized Single Source of Truth Operational Expense Store for Kanchivaram Café
import { 
  fetchExpenses, 
  createExpense, 
  updateExpense as apiUpdateExpense, 
  deleteExpense as apiDeleteExpense, 
  fetchDailyBalance, 
  saveDailyBalance as apiSaveDailyBalance, 
  socket 
} from './api';

const getTodayIso = () => new Date().toISOString().split('T')[0];
const getDisplayDate = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

class ExpenseStore {
  constructor() {
    this.branches = {
      'branch-1': { expenses: [], dailyBalances: {} },
      'branch-2': { expenses: [], dailyBalances: {} }
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
        if (!this.branches[branchId]) this.branches[branchId] = { expenses: [], dailyBalances: {} };
        const exists = this.branches[branchId].expenses.some(e => e.id === expense.id);
        if (!exists) {
          this.branches[branchId].expenses.unshift(expense);
          this.notify();
        }
        // Refresh daily balance for expense date
        const expDate = expense.date || expense.dateIso;
        if (expDate) {
          this.loadDailyBalance(expDate, branchId);
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
        const expDate = expense.date || expense.dateIso;
        if (expDate) {
          this.loadDailyBalance(expDate, branchId);
        }
      }
    });

    socket.on('expense_deleted', ({ id, branchId }) => {
      if (branchId && id && this.branches[branchId]) {
        this.branches[branchId].expenses = this.branches[branchId].expenses.filter(e => e.id !== id);
        this.notify();
        this.loadDailyBalance(getTodayIso(), branchId);
      }
    });

    socket.on('daily_balance_updated', ({ branchId, date, dailyBalance }) => {
      if (branchId && date && dailyBalance) {
        if (!this.branches[branchId]) this.branches[branchId] = { expenses: [], dailyBalances: {} };
        if (!this.branches[branchId].dailyBalances) this.branches[branchId].dailyBalances = {};
        this.branches[branchId].dailyBalances[date] = dailyBalance;
        this.notify();
      }
    });
  }

  async hydrateFromBackend(branchId = this.currentBranchId) {
    try {
      const data = await fetchExpenses(branchId);
      if (data && data.success && Array.isArray(data.expenses)) {
        if (!this.branches[branchId]) {
          this.branches[branchId] = { expenses: [], dailyBalances: {} };
        }
        this.branches[branchId].expenses = data.expenses;
        this.hydrated[branchId] = true;
        this.notify();
      }
      // Also hydrate today's daily balance
      this.loadDailyBalance(getTodayIso(), branchId);
    } catch (err) {
      console.warn(`[ExpenseStore] Hydration error for ${branchId}:`, err);
    }
  }

  setBranch(branchId) {
    if (branchId && this.currentBranchId !== branchId) {
      this.currentBranchId = branchId;
      if (!this.branches[branchId]) {
        this.branches[branchId] = { expenses: [], dailyBalances: {} };
      }
      this.hydrateFromBackend(branchId);
      this.notify();
    }
  }

  get expenses() {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { expenses: [], dailyBalances: {} };
    }
    return this.branches[this.currentBranchId].expenses;
  }

  set expenses(val) {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { expenses: [], dailyBalances: {} };
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
      dailyBalances: this.branches[this.currentBranchId]?.dailyBalances || {},
      summary: {
        totalExpenses,
        todayExpenses,
        monthExpenses,
        totalRecordsCount: sorted.length,
        todayIso
      }
    };
  }

  async loadDailyBalance(date = getTodayIso(), branchId = this.currentBranchId) {
    try {
      const data = await fetchDailyBalance(date, branchId);
      if (data && data.success) {
        if (!this.branches[branchId]) this.branches[branchId] = { expenses: [], dailyBalances: {} };
        if (!this.branches[branchId].dailyBalances) this.branches[branchId].dailyBalances = {};
        this.branches[branchId].dailyBalances[date] = data;
        this.notify();
        return data;
      }
    } catch (err) {
      console.warn(`[ExpenseStore] loadDailyBalance error:`, err);
    }
    return null;
  }

  getDailyBalance(date = getTodayIso(), branchId = this.currentBranchId) {
    return this.branches[branchId]?.dailyBalances?.[date] || null;
  }

  async saveDailyBalance(payload) {
    const branchId = this.currentBranchId;
    const { date, openingBalance, notes } = payload;
    const targetDate = date || getTodayIso();
    const numOpening = parseFloat(openingBalance) || 0;
    const cleanNotes = notes ? notes.trim() : '';

    try {
      const res = await apiSaveDailyBalance({
        date: targetDate,
        openingBalance: numOpening,
        notes: cleanNotes,
        recordedBy: 'Shruthy A'
      }, branchId);

      if (res && res.success) {
        const balanceData = res.data || {
          id: `bal-${branchId}-${targetDate}`,
          branchId,
          date: targetDate,
          isSet: true,
          openingBalance: numOpening,
          suggestedOpeningBalance: numOpening,
          notes: cleanNotes,
          recordedBy: 'Shruthy A'
        };
        if (!this.branches[branchId]) this.branches[branchId] = { expenses: [], dailyBalances: {} };
        if (!this.branches[branchId].dailyBalances) this.branches[branchId].dailyBalances = {};
        this.branches[branchId].dailyBalances[targetDate] = balanceData;
        this.notify();
        return balanceData;
      }
    } catch (err) {
      console.error('[ExpenseStore] saveDailyBalance error:', err);
    }
    return null;
  }

  async addExpense(payload) {
    const { description, category, amount, paymentMode, date, notes } = payload;
    const numAmount = parseFloat(amount) || 0;
    if (!description || numAmount <= 0) return null;

    const dateIso = date || getTodayIso();
    const branchId = this.currentBranchId;
    const cleanPaymentMode = (paymentMode || 'Cash').trim();

    try {
      const res = await createExpense({
        description: description.trim(),
        category: category || 'Other',
        amount: numAmount,
        paymentMode: cleanPaymentMode,
        date: dateIso,
        notes: notes ? notes.trim() : 'General operational expense',
        recordedBy: 'Shruthy A'
      }, branchId);

      if (res && res.success && res.expense) {
        if (!this.branches[branchId]) this.branches[branchId] = { expenses: [], dailyBalances: {} };
        const exists = this.branches[branchId].expenses.some(e => e.id === res.expense.id);
        if (!exists) {
          this.branches[branchId].expenses.unshift(res.expense);
        }
        this.notify();
        this.loadDailyBalance(dateIso, branchId);
        return res.expense;
      }
    } catch (err) {
      console.error('[ExpenseStore] addExpense error:', err);
    }
    return null;
  }

  async updateExpense(id, updatedPayload) {
    const branchId = this.currentBranchId;
    const { description, category, amount, paymentMode, date, notes } = updatedPayload;
    const numAmount = parseFloat(amount) || 0;

    try {
      const res = await apiUpdateExpense(id, {
        description: description ? description.trim() : undefined,
        category: category || undefined,
        amount: numAmount > 0 ? numAmount : undefined,
        paymentMode: paymentMode ? String(paymentMode).trim() : undefined,
        date: date || undefined,
        notes: notes !== undefined ? notes.trim() : undefined
      }, branchId);

      if (res && res.success && res.expense) {
        const idx = this.expenses.findIndex(e => e.id === id);
        if (idx !== -1) {
          this.expenses[idx] = res.expense;
          this.notify();
        }
        const expDate = res.expense.date || res.expense.dateIso;
        if (expDate) {
          this.loadDailyBalance(expDate, branchId);
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
        this.loadDailyBalance(getTodayIso(), branchId);
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
