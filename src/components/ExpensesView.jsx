import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  DollarSign, 
  PlusCircle, 
  Search, 
  Calendar, 
  Trash2, 
  Edit3, 
  FileText, 
  TrendingDown, 
  CheckCircle, 
  X, 
  Filter, 
  AlertCircle,
  Tag,
  Receipt,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Wallet,
  Lock,
  ArrowRight
} from 'lucide-react';
import { expenseStore } from '../services/expenseStore';
import { inventoryStore } from '../services/inventoryStore';

const OPERATING_CATEGORIES = [
  'Utilities',
  'Packaging',
  'Salaries',
  'Maintenance',
  'Transport',
  'Rent',
  'Cleaning',
  'Other'
];

const ALL_FILTER_CATEGORIES = [
  'Raw Ingredients',
  ...OPERATING_CATEGORIES
];

export default function ExpensesView({ selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';
  const [expenseState, setExpenseState] = useState(() => expenseStore.getState());
  const [inventoryState, setInventoryState] = useState(() => inventoryStore.getState());
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, THIS_MONTH
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedCardPaymentMode, setSelectedCardPaymentMode] = useState('');
  const categoryScrollRef = React.useRef(null);

  // Daily Opening & Closing Balance States
  const [selectedBalanceDate, setSelectedBalanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [openingAmountInput, setOpeningAmountInput] = useState('');
  const [openingNotesInput, setOpeningNotesInput] = useState('');
  const [isSavingOpening, setIsSavingOpening] = useState(false);

  const scrollCategoryLeft = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: -140, behavior: 'smooth' });
    }
  };

  const scrollCategoryRight = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: 140, behavior: 'smooth' });
    }
  };

  // Form Inputs for "Add New Operating Expense" (Blank by default)
  const [descriptionInput, setDescriptionInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Utilities');
  const [paymentModeInput, setPaymentModeInput] = useState('Cash');
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [notesInput, setNotesInput] = useState('');
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  // Edit Modal State
  const [editingExpense, setEditingExpense] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('Utilities');
  const [editPaymentMode, setEditPaymentMode] = useState('Cash');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Dialog State
  const [deletingId, setDeletingId] = useState(null);

  // Sync selected branch with expenseStore & inventoryStore
  useEffect(() => {
    if (selectedBranch?.id) {
      expenseStore.setBranch(selectedBranch.id);
      inventoryStore.setBranch(selectedBranch.id);
      setExpenseState(expenseStore.getState());
      setInventoryState(inventoryStore.getState());
      expenseStore.loadDailyBalance(selectedBalanceDate, selectedBranch.id);
    }
  }, [selectedBranch?.id]);

  // Load daily balance when selected date changes
  useEffect(() => {
    if (selectedBranch?.id && selectedBalanceDate) {
      expenseStore.loadDailyBalance(selectedBalanceDate, selectedBranch.id);
    }
  }, [selectedBalanceDate, selectedBranch?.id]);

  // Subscribe to expenseStore and inventoryStore
  useEffect(() => {
    setExpenseState(expenseStore.getState());
    setInventoryState(inventoryStore.getState());

    const unsubscribeExpense = expenseStore.subscribe((newState) => {
      setExpenseState(newState);
    });

    const unsubscribeInventory = inventoryStore.subscribe((newState) => {
      setInventoryState(newState);
    });

    return () => {
      unsubscribeExpense();
      unsubscribeInventory();
    };
  }, []);

  // Map Stock-In Purchases from Purchase Module automatically as "Raw Ingredients"
  const stockInExpenses = (inventoryState.purchases || []).map(p => {
    const itemNames = (p.items || []).map(i => i.itemName).filter(Boolean).join(', ');
    const desc = itemNames || p.items?.[0]?.itemName || 'Raw Ingredients Purchase';
    return {
      id: `stock-${p.id}`,
      description: desc,
      category: 'Raw Ingredients',
      paymentMode: 'Bank',
      amount: p.totalAmount || 0,
      date: p.dateIso || new Date().toISOString().split('T')[0],
      displayDate: p.date || p.dateIso,
      notes: '',
      isStockIn: true
    };
  });

  // Combine manual operating expenses + auto-linked Stock In purchases
  const combinedExpenses = [...(expenseState.expenses || []), ...stockInExpenses].sort((a, b) => 
    (b.date || '').localeCompare(a.date || '')
  );

  const todayIso = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayIso.slice(0, 7);

  // Dynamic Totals Calculation
  const totalExpenses = combinedExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const todayExpenses = combinedExpenses.filter(e => e.date === todayIso).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const monthExpenses = combinedExpenses.filter(e => (e.date || '').startsWith(currentMonthPrefix)).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalRecordsCount = combinedExpenses.length;

  // Filtered Expense Records
  const filteredExpenses = combinedExpenses.filter(item => {
    const matchesSearch = !searchQuery || 
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.paymentMode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    let matchesDate = true;
    if (dateFilter === 'TODAY') {
      matchesDate = item.date === todayIso;
    } else if (dateFilter === 'THIS_MONTH') {
      matchesDate = (item.date || '').startsWith(currentMonthPrefix);
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  // Handle Save New Operating Expense
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (isSavingExpense) return;
    const numAmount = parseFloat(amountInput);
    if (!descriptionInput.trim()) {
      alert("Please enter an expense description.");
      return;
    }
    if (!numAmount || numAmount <= 0) {
      alert("Please enter a valid expense amount.");
      return;
    }

    const selectedCategoryToSave = categoryInput || 'Utilities';
    const selectedModeToSave = paymentModeInput || 'Cash';

    setIsSavingExpense(true);
    try {
      const res = await expenseStore.addExpense({
        description: descriptionInput.trim(),
        category: selectedCategoryToSave,
        paymentMode: selectedModeToSave,
        amount: numAmount,
        date: dateInput,
        notes: notesInput
      });

      if (!res) {
        throw new Error('Failed to create expense');
      }

      // Reset Form only after successful save
      setDescriptionInput('');
      setAmountInput('');
      setNotesInput('');
      setCategoryInput('Utilities');
      setPaymentModeInput('Cash');
      setDateInput(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error('[ExpensesView] Add expense error:', err);
      alert('Failed to save expense record. Please check the details and try again.');
    } finally {
      setIsSavingExpense(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    if (item.isStockIn) {
      alert("Raw Ingredient purchases are managed directly via the Purchase / Stock In module.");
      return;
    }
    setEditingExpense(item);
    setEditDesc(item.description);
    setEditCategory(item.category || 'Utilities');
    setEditPaymentMode(item.paymentMode || 'Cash');
    setEditAmount(item.amount.toString());
    setEditDate(item.date);
    setEditNotes(item.notes || '');
  };

  // Save Edit Record
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingExpense || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      const res = await expenseStore.updateExpense(editingExpense.id, {
        description: editDesc,
        category: editCategory,
        paymentMode: editPaymentMode,
        amount: editAmount,
        date: editDate,
        notes: editNotes
      });

      if (!res) {
        throw new Error('Failed to update expense');
      }

      // Close modal ONLY AFTER successful persistence
      setEditingExpense(null);
    } catch (err) {
      console.error('[ExpensesView] Save edit error:', err);
      alert('Failed to save changes to expense. Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm & Delete Expense Record
  const handleConfirmDelete = () => {
    if (deletingId) {
      if (deletingId.startsWith('stock-')) {
        alert("Raw Ingredient purchases can be deleted or edited from the Purchase / Stock In page.");
        setDeletingId(null);
        return;
      }
      expenseStore.deleteExpense(deletingId);
      setDeletingId(null);
    }
  };

  // Daily Balance reactive calculations for selectedBalanceDate
  const dailyBalanceRecord = expenseState.dailyBalances?.[selectedBalanceDate] || null;
  const isOpeningSet = Boolean(dailyBalanceRecord?.isSet);
  const openingBalanceVal = dailyBalanceRecord ? (parseFloat(dailyBalanceRecord.openingBalance) || 0) : 0;
  const suggestedOpeningVal = dailyBalanceRecord ? (parseFloat(dailyBalanceRecord.suggestedOpeningBalance) || 0) : 0;
  const activeOpeningBalance = isOpeningSet ? openingBalanceVal : suggestedOpeningVal;

  const dayExpensesList = combinedExpenses.filter(e => (e.date || e.dateIso) === selectedBalanceDate);
  const dayOperatingExpenses = dayExpensesList.filter(e => !e.isStockIn).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const dayPurchaseExpenses = dayExpensesList.filter(e => e.isStockIn).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const dayTotalExpenses = dayOperatingExpenses + dayPurchaseExpenses;

  // Auto-calculated Closing Balance (Opening - Total Outflows for that Day)
  const computedClosingBalance = activeOpeningBalance - dayTotalExpenses;

  const handleOpenOpeningModal = () => {
    setOpeningAmountInput(activeOpeningBalance > 0 ? activeOpeningBalance.toString() : '');
    setOpeningNotesInput(dailyBalanceRecord?.notes || '');
    setIsOpeningModalOpen(true);
  };

  const handleSaveOpeningBalance = async (e) => {
    e.preventDefault();
    if (isSavingOpening) return;
    const numVal = parseFloat(openingAmountInput);
    if (isNaN(numVal) || numVal < 0) {
      alert("Please enter a valid non-negative opening balance (e.g. 10500).");
      return;
    }
    setIsSavingOpening(true);
    try {
      const res = await expenseStore.saveDailyBalance({
        date: selectedBalanceDate,
        openingBalance: numVal,
        notes: openingNotesInput
      });
      if (!res) {
        throw new Error("Failed to save opening balance");
      }
      setIsOpeningModalOpen(false);
    } catch (err) {
      console.error('[ExpensesView] Save opening balance error:', err);
      alert('Failed to save opening balance. Please try again.');
    } finally {
      setIsSavingOpening(false);
    }
  };

  return (
    <div className="space-y-3 font-sans relative pb-6 w-full">
      
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER IN WARM CREAM MATCHING HOME & POS THEME STRICTLY            */}
      {/* ========================================================================= */}
      <div className="bg-[#ebdcc8] text-[#122c20] rounded-2xl p-3.5 px-4 border border-[#cabb9e] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 relative overflow-hidden">
        
        <div className="flex items-center gap-3 z-10 min-w-0">
          <div className={`p-2.5 ${isBrownBranch ? 'bg-[#3E2312] border-[#542A16]' : 'bg-[#0f3823] border-[#194c31]'} text-white rounded-xl shadow-xs border shrink-0`}>
            <Receipt className={`w-5 h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-serif font-black text-[#11291f] leading-tight flex items-center gap-2 truncate">
              Operational Expenses Tracker
            </h2>
            <p className="text-xs text-[#456351] font-bold mt-0.5 truncate">
              Operating expenses + auto-linked Raw Ingredients from Purchase / Stock In.
            </p>
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className={`flex items-center gap-1 ${isBrownBranch ? 'bg-[#3E2312] border-[#542A16]' : 'bg-[#0f3823] border-[#194c31]'} p-1 rounded-xl border shadow-2xs z-10 shrink-0 self-start sm:self-center`}>
          {[
            { id: 'ALL', label: 'All Time' },
            { id: 'TODAY', label: 'Today' },
            { id: 'THIS_MONTH', label: 'This Month' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-black capitalize transition-all cursor-pointer ${
                dateFilter === f.id
                  ? `bg-[#f8f6f0] ${isBrownBranch ? 'text-[#542A16]' : 'text-[#0f3823]'} shadow-md font-extrabold`
                  : `${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#87a997]'} hover:text-white`
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1b. DAILY OPENING & CLOSING BALANCE RECONCILIATION CARD                   */}
      {/* ========================================================================= */}
      <div className="bg-[#fdfbf7] rounded-2xl p-3.5 sm:p-4 border border-[#cabb9e] shadow-xs space-y-3 shrink-0">
        
        {/* Header & Date Selector Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#ded4c5]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'} rounded-xl shadow-2xs shrink-0`}>
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-sm text-[#11291f] truncate">
                  Daily Opening & Closing Balance
                </h3>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${isOpeningSet ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                  {isOpeningSet ? '✓ Set for this Day' : 'Suggested Mode'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#456351] truncate">
                Reconciliation: <span className="font-mono font-bold text-[#11291f]">Closing Balance = Opening Balance − Total Day Outflows</span>
              </p>
            </div>
          </div>

          {/* Date Picker Control */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-[#cabb9e] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#547363]" />
              <span className="text-[11px] font-extrabold text-[#11291f]">Business Date:</span>
              <input
                type="date"
                value={selectedBalanceDate}
                onChange={(e) => setSelectedBalanceDate(e.target.value)}
                className="text-xs font-mono font-bold text-[#11291f] bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            {selectedBalanceDate !== todayIso && (
              <button
                type="button"
                onClick={() => setSelectedBalanceDate(todayIso)}
                className={`px-2.5 py-1.5 ${isBrownBranch ? 'bg-[#3E2312] text-white' : 'bg-[#0f3823] text-white'} text-[11px] font-black rounded-xl shadow-2xs cursor-pointer hover:opacity-90`}
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* 3 Metric Balance Flow Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          
          {/* Block 1: Daily Opening Balance */}
          <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs flex flex-col justify-between space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#11291f] uppercase tracking-wider">
                1. Daily Opening Balance
              </span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${isOpeningSet ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                {isOpeningSet ? 'Confirmed' : 'Suggested'}
              </span>
            </div>

            <div>
              <p className="text-lg font-mono font-medium text-[#0f3823] leading-tight">
                ₹{activeOpeningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] font-bold text-[#456351] block mt-0.5">
                {isOpeningSet ? (dailyBalanceRecord?.notes ? `Remarks: ${dailyBalanceRecord.notes}` : 'Opening balance confirmed') : 'Suggested from previous closing balance'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenOpeningModal}
              className="w-full py-1.5 px-3 bg-white hover:bg-[#faf6ee] text-[#11291f] border border-[#cabb9e] font-bold text-[11px] rounded-lg shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Edit3 className="w-3 h-3 text-[#547363]" />
              {isOpeningSet ? 'Edit Opening Balance' : 'Set Opening Balance'}
            </button>
          </div>

          {/* Block 2: Day Outflows / Expenses Paid */}
          <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs flex flex-col justify-between space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-rose-950 uppercase tracking-wider">
                2. Total Expenses Paid (−)
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                {dayExpensesList.length} Outflows
              </span>
            </div>

            <div>
              <p className="text-lg font-mono font-medium text-rose-700 leading-tight">
                ₹{dayTotalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] font-bold text-[#456351] block mt-0.5">
                Operating: ₹{dayOperatingExpenses.toFixed(2)} • Raw Ingredients: ₹{dayPurchaseExpenses.toFixed(2)}
              </span>
            </div>

            {/* Interactive Payment Mode Dropdown Selector */}
            <div className="py-1.5 px-3 bg-white rounded-lg border border-[#cabb9e] text-xs font-bold text-[#11291f] flex items-center justify-between shadow-2xs relative">
              <span className="font-extrabold text-[#11291f] text-[11px] shrink-0">Payment Mode:</span>
              <div className="relative flex-1 max-w-[140px]">
                <select
                  value={selectedCardPaymentMode}
                  onChange={(e) => setSelectedCardPaymentMode(e.target.value)}
                  className="w-full bg-transparent text-[#456351] font-bold text-[11px] focus:outline-none cursor-pointer appearance-none text-right pr-4"
                >
                  <option value="">Cash / UPI / Bank</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank">Bank</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#547363] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Block 3: Auto-Calculated Daily Closing Balance */}
          <div className={`p-3 rounded-xl border shadow-xs flex flex-col justify-between space-y-2 relative ${computedClosingBalance >= 0 ? 'bg-[#ebdcc8] border-[#cabb9e]' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#11291f] uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-[#547363]" />
                3. Daily Closing Balance (=)
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#0f3823] text-white border border-[#194c31]">
                Auto-Calculated
              </span>
            </div>

            <div>
              <p className={`text-lg font-mono font-medium leading-tight ${computedClosingBalance >= 0 ? 'text-[#0f3823]' : 'text-red-700'}`}>
                ₹{computedClosingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] font-bold text-[#456351] block mt-0.5">
                ₹{activeOpeningBalance.toFixed(2)} − ₹{dayTotalExpenses.toFixed(2)}
              </span>
            </div>

            <div className="py-1.5 px-3 bg-white rounded-lg border border-[#cabb9e] text-[11px] font-bold text-[#11291f] flex items-center gap-1.5 shadow-2xs">
              <span className="font-extrabold text-[#11291f]">Formula:</span>
              <span className="font-bold text-[#456351]">Opening − Day Total Expenses</span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY METRIC CARDS (UNIFORM WARM CREAM THEME MATCHING ALL CARDS)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
        
        {/* Card 1: Total Expenses */}
        <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black text-[#11291f] uppercase tracking-wider block truncate">Total Expenses</span>
          <p className="text-lg font-mono font-black text-[#0f3823] leading-none truncate">
            ₹{totalExpenses.toFixed(2)}
          </p>
          <span className="text-[9.5px] font-bold text-[#456351] block truncate">
            {totalExpenses === 0 ? 'No expenses recorded yet' : 'Cumulative Outflows'}
          </span>
        </div>

        {/* Card 2: Today's Expenses */}
        <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black text-rose-900 uppercase tracking-wider block truncate">Today's Expenses</span>
          <p className="text-lg font-mono font-black text-rose-700 leading-none truncate">
            ₹{todayExpenses.toFixed(2)}
          </p>
          <span className="text-[9.5px] font-bold text-[#456351] block truncate">
            {todayExpenses === 0 ? 'No expenses recorded today' : todayIso}
          </span>
        </div>

        {/* Card 3: This Month's Expenses */}
        <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black text-[#11291f] uppercase tracking-wider block truncate">This Month's Expenses</span>
          <p className="text-lg font-mono font-black text-[#0f3823] leading-none truncate">
            ₹{monthExpenses.toFixed(2)}
          </p>
          <span className="text-[9.5px] font-bold text-[#456351] block truncate">
            {monthExpenses === 0 ? 'No expenses recorded this month' : 'Current Month Total'}
          </span>
        </div>

        {/* Card 4: Total Records Count */}
        <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black text-[#0f3823] uppercase tracking-wider block truncate">Expense Records</span>
          <p className="text-lg font-mono font-black text-[#0f3823] leading-none truncate">
            {totalRecordsCount}
          </p>
          <span className="text-[9.5px] font-bold text-[#456351] block truncate">
            {totalRecordsCount === 0 ? 'No expense records yet' : 'Saved Vouchers'}
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE GRID: FORM (LEFT 5 COLS) + LEDGER (RIGHT 7 COLS)        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 shrink-0">
        
        {/* Left Column: Add New Operating Expense Form (LG: 5 Cols) */}
        <div className="lg:col-span-5 bg-[#fdfbf7] rounded-2xl border border-[#cabb9e] shadow-xs p-4 space-y-3 flex flex-col justify-between">
          
          <div className="flex items-center justify-between pb-2 border-b border-[#ded4c5]">
            <div className="flex items-center gap-2">
              <PlusCircle className={`w-4 h-4 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
              <h3 className="font-serif font-black text-sm text-[#11291f]">
                Add Operating Expense
              </h3>
            </div>
            <span className="text-[10px] text-[#547363] font-bold bg-[#ebe0cb] px-2 py-0.5 rounded-full">
              Non-Stock Outflows
            </span>
          </div>

          {/* Café Expense Banner Illustration in Add Operating Expense Card */}
          <div className="w-full my-1 rounded-xl overflow-hidden border border-[#cabb9e] shadow-2xs bg-[#fdfbf7] shrink-0">
            <img
              src="/add_expense_banner_illustration.png"
              alt="Café Operating Expenses Illustration"
              className="w-full h-auto object-cover block rounded-xl"
            />
          </div>

          <form onSubmit={handleSaveExpense} className="space-y-2.5 text-xs">
            
            {/* Description */}
            <div>
              <label className="font-extrabold text-[#11291f] block mb-1">Expense Description *</label>
              <input
                type="text"
                required
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="e.g. Electricity Bill Sept 2026"
                className={`w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] placeholder-[#87a997] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
              />
            </div>

            {/* Category, Payment Mode & Amount Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="font-extrabold text-[#11291f] block mb-1">Category *</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className={`w-full px-2.5 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                >
                  {OPERATING_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-extrabold text-[#11291f] block mb-1">Payment Mode *</label>
                <select
                  value={paymentModeInput}
                  onChange={(e) => setPaymentModeInput(e.target.value)}
                  className={`w-full px-2.5 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-[#11291f] block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="e.g. 4600"
                  className={`w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] placeholder-[#87a997] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
              </div>
            </div>

            {/* Expense Date */}
            <div>
              <label className="font-extrabold text-[#11291f] block mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className={`w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
              />
            </div>

            {/* Notes / Remarks */}
            <div>
              <label className="font-extrabold text-[#11291f] block mb-1">Notes / Remarks</label>
              <input
                type="text"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="e.g. Voucher receipt reference"
                className={`w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] placeholder-[#87a997] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
              />
            </div>

            {/* Info Note on Raw Ingredients */}
            <div className="p-2 bg-[#ebdcc8]/50 rounded-xl border border-[#cabb9e] text-[10px] text-[#456351] font-bold flex items-center gap-1.5">
              <PackageCheck className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} shrink-0`} />
              <span>Note: Raw Ingredient purchases auto-link from <strong>Purchase / Stock In</strong> without manual double-entry.</span>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSavingExpense}
              className={`w-full py-2.5 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D] border-[#542A16]' : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'} text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer border flex items-center justify-center text-center mt-1 disabled:opacity-50`}
            >
              <span>{isSavingExpense ? 'Saving...' : 'Save Expense Record'}</span>
            </button>

          </form>

        </div>

        {/* Right Column: Expense Ledger & Records Table (LG: 7 Cols) */}
        <div className="lg:col-span-7 bg-[#fdfbf7] rounded-2xl border border-[#cabb9e] shadow-xs p-4 space-y-2 flex flex-col">
          
          {/* Header & Category Filters */}
          <div className="space-y-1.5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-[#ded4c5] pb-2">
              <div className="flex items-center gap-2">
                <FileText className={`w-4 h-4 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
                <h3 className="font-serif font-black text-sm text-[#11291f]">
                  Expense Ledger ({filteredExpenses.length})
                </h3>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expenses..."
                  className={`w-full pl-8 pr-3 py-1 bg-[#f0ebd9] border border-[#cabb9e] rounded-xl text-xs text-[#0f231a] placeholder-[#385344] focus:outline-none focus:ring-1 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} font-bold`}
                />
              </div>
            </div>

            {/* Category Filter Pills (Includes Raw Ingredients Stock In filter) */}
            <div className="relative flex items-center gap-1 w-full min-w-0">
              <button
                type="button"
                onClick={scrollCategoryLeft}
                className={`p-1 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} hover:bg-[#ebe0cb] rounded-lg border border-[#cabb9e] bg-[#fdfbf7] shrink-0 cursor-pointer shadow-2xs`}
                title="Scroll Left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div 
                ref={categoryScrollRef}
                onWheel={(e) => {
                  if (e.deltaY !== 0) {
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                }}
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full scroll-smooth"
              >
                <button
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    categoryFilter === 'ALL'
                      ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs`
                      : 'bg-[#ebe0cb] text-[#456351] hover:text-[#122c20] hover:bg-[#ded2bb]'
                  }`}
                >
                  All Categories
                </button>
                {ALL_FILTER_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs`
                        : 'bg-[#ebe0cb] text-[#456351] hover:text-[#122c20] hover:bg-[#ded2bb]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={scrollCategoryRight}
                className={`p-1 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} hover:bg-[#ebe0cb] rounded-lg border border-[#cabb9e] bg-[#fdfbf7] shrink-0 cursor-pointer shadow-2xs`}
                title="Scroll Right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Ledger Table - Fully fits visible container */}
          <div className="w-full rounded-xl border border-[#ded4c5] overflow-hidden bg-white shadow-2xs">
            <div className="overflow-y-auto max-h-[420px] w-full">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-[#ebdcc8] text-[#11291f] font-semibold uppercase text-[11px] tracking-wider border-b border-[#cabb9e] sticky top-0 z-10">
                    <th className="py-2.5 px-2 text-center font-semibold w-[18%]">DATE</th>
                    <th className="py-2.5 px-2 text-center font-semibold w-[34%]">DESCRIPTION</th>
                    <th className="py-2.5 px-2 text-center font-semibold w-[24%]">CATEGORY / MODE</th>
                    <th className="py-2.5 px-2 text-center font-semibold w-[14%]">AMOUNT (₹)</th>
                    <th className="py-2.5 px-2 text-center font-semibold w-[10%]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ded4c5] bg-white text-black font-medium">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 px-4 text-center bg-[#fdfbf7]">
                        <div className="flex flex-col items-center justify-center text-center space-y-2 max-w-lg mx-auto">
                          <img
                            src="/expense_empty_illustration.png"
                            alt="Managing Café Expenses Illustration"
                            className="w-full max-w-sm h-auto max-h-56 object-contain relative z-10 block mx-auto"
                          />
                          <h4 className="text-base sm:text-lg font-serif font-semibold text-black tracking-wide">
                            No expense records yet
                          </h4>
                          <p className="text-xs sm:text-sm font-normal text-[#547363] leading-relaxed">
                            Start recording your café's operating expenses to track spending and manage costs.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((item) => (
                      <tr key={item.id} className="hover:bg-[#fbf8f3] transition-colors">
                        
                        <td className="py-2.5 px-2 font-semibold text-black text-[12.5px] text-center whitespace-nowrap">
                          {item.displayDate}
                        </td>

                        <td className="py-2.5 px-2 font-semibold text-black text-[12.5px] text-center">
                          <div className="leading-snug break-words">{item.description}</div>
                          {item.notes && <span className="text-[11.5px] text-[#547363] font-normal block leading-tight mt-0.5">{item.notes}</span>}
                        </td>

                        <td className="py-2.5 px-2 text-center font-semibold text-black text-[12.5px]">
                          <div>{item.category}</div>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#ebdcc8] text-[#11291f] border border-[#cabb9e] inline-block mt-0.5">
                            {item.paymentMode || 'Cash'}
                          </span>
                        </td>

                        <td className="py-2.5 px-2 text-center font-semibold text-[12.5px] text-red-700 whitespace-nowrap">
                          ₹{(parseFloat(item.amount) || 0).toFixed(2)}
                        </td>

                        {/* Action Buttons: Edit & Delete */}
                        <td className="py-2.5 px-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className={`p-1 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} hover:bg-[#ebdcc8] rounded-md transition-colors cursor-pointer`}
                              title={item.isStockIn ? "Managed in Purchase / Stock In" : "Edit Expense"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingId(item.id)}
                              className="p-1 text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              title={item.isStockIn ? "Managed in Purchase / Stock In" : "Delete Expense"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: EDIT EXPENSE RECORD                                             */}
      {/* ========================================================================= */}
      {editingExpense && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-overlay animate-fadeIn">
          <form onSubmit={handleSaveEdit} className="bg-[#fdfbf7] border-2 border-[#d4af37] rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#cabb9e]">
              <h3 className={`font-serif font-black text-base ${isBrownBranch ? 'text-[#3E2312]' : 'text-[#0f3823]'} flex items-center gap-2`}>
                <Edit3 className="w-4 h-4 text-[#d4af37]" />
                Edit Expense Record
              </h3>
              <button 
                type="button"
                onClick={() => setEditingExpense(null)}
                className="p-1 text-[#557361] hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-[#11291f] block mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className={`w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="font-extrabold text-[#11291f] block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className={`w-full px-2.5 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                  >
                    {OPERATING_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-[#11291f] block mb-1">Payment Mode</label>
                  <select
                    value={editPaymentMode}
                    onChange={(e) => setEditPaymentMode(e.target.value)}
                    className={`w-full px-2.5 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-[#11291f] block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className={`w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-[#11291f] block mb-1">Expense Date</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className={`w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                />
              </div>

              <div>
                <label className="font-extrabold text-[#11291f] block mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className={`w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ded4c5]">
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="px-4 py-2 bg-[#ebe0cb] text-[#122c20] font-black text-xs rounded-xl hover:bg-[#dfd3bc] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEdit}
                className={`px-5 py-2 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D] border-[#542A16]' : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'} text-white font-black text-xs rounded-xl shadow-md border cursor-pointer disabled:opacity-50`}
              >
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: CONFIRM DELETE                                                  */}
      {/* ========================================================================= */}
      {deletingId && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-overlay animate-fadeIn">
          <div className="bg-[#fdfbf7] border-2 border-red-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-black text-base text-red-900">Delete Expense Record?</h3>
            </div>

            <p className="text-xs font-bold text-[#456351]">
              Are you sure you want to permanently delete this expense voucher? This action will update all operational financial totals immediately.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ded4c5]">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-[#ebe0cb] text-[#122c20] font-black text-xs rounded-xl hover:bg-[#dfd3bc] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-700 text-white font-black text-xs rounded-xl hover:bg-red-800 shadow-md border border-red-900 cursor-pointer"
              >
                Delete Record
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: SET / EDIT DAILY OPENING BALANCE                                */}
      {/* ========================================================================= */}
      {isOpeningModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-overlay animate-fadeIn">
          <div className="bg-[#fdfbf7] border-2 border-[#cabb9e] rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl relative">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#ded4c5]">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'} rounded-xl shadow-xs`}>
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-[#11291f]">
                    {isOpeningSet ? 'Edit Daily Opening Balance' : 'Set Daily Opening Balance'}
                  </h3>
                  <p className="text-xs font-bold text-[#456351]">
                    {selectedBranch?.name || 'Main Branch'} • Date: {selectedBalanceDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpeningModalOpen(false)}
                className="p-1 rounded-lg text-[#547363] hover:bg-[#ebdcc8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOpeningBalance} className="space-y-3.5 text-xs">
              
              <div>
                <label className="font-extrabold text-[#11291f] block mb-1">
                  Opening Balance Amount (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  autoFocus
                  value={openingAmountInput}
                  onChange={(e) => setOpeningAmountInput(e.target.value)}
                  placeholder="e.g. 10500"
                  className={`w-full px-3 py-2 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-sm text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
                <p className="text-[10px] font-bold text-[#547363] mt-1">
                  {suggestedOpeningVal > 0 && !isOpeningSet ? `Suggested from previous day's closing balance: ₹${suggestedOpeningVal.toFixed(2)}` : 'Enter the verified cash / drawer balance at opening.'}
                </p>
              </div>

              <div>
                <label className="font-extrabold text-[#11291f] block mb-1">
                  Notes / Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={openingNotesInput}
                  onChange={(e) => setOpeningNotesInput(e.target.value)}
                  placeholder="e.g. Cash drawer count verified with morning shift handover"
                  className={`w-full px-3 py-2 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
              </div>

              <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] text-[11px] font-bold text-[#11291f] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#456351]">Recorded By:</span>
                  <span className="font-black text-[#11291f]">Shruthy A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#456351]">Day Outflows Paid:</span>
                  <span className="font-mono font-black text-rose-700">₹{dayTotalExpenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#ded4c5]">
                  <span className="text-[#11291f]">Calculated Closing:</span>
                  <span className="font-mono font-black text-[#0f3823] text-sm">
                    ₹{((parseFloat(openingAmountInput) || 0) - dayTotalExpenses).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ded4c5]">
                <button
                  type="button"
                  onClick={() => setIsOpeningModalOpen(false)}
                  className="px-4 py-2 bg-[#ebe0cb] text-[#122c20] font-black text-xs rounded-xl hover:bg-[#dfd3bc] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingOpening}
                  className={`px-5 py-2 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D] border-[#542A16]' : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'} text-white font-black text-xs rounded-xl shadow-md border cursor-pointer disabled:opacity-50`}
                >
                  {isSavingOpening ? 'Saving...' : 'Confirm & Save Balance'}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
