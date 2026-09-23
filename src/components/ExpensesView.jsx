import React, { useState, useEffect } from 'react';
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
  ChevronRight
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
  'Raw Ingredients (Stock In)',
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
  const categoryScrollRef = React.useRef(null);

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
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [notesInput, setNotesInput] = useState('');

  // Edit Modal State
  const [editingExpense, setEditingExpense] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('Utilities');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Delete Dialog State
  const [deletingId, setDeletingId] = useState(null);

  // Sync selected branch with expenseStore & inventoryStore
  useEffect(() => {
    if (selectedBranch?.id) {
      expenseStore.setBranch(selectedBranch.id);
      inventoryStore.setBranch(selectedBranch.id);
      setExpenseState(expenseStore.getState());
      setInventoryState(inventoryStore.getState());
    }
  }, [selectedBranch?.id]);

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

  // Map Stock-In Purchases from Purchase Module automatically as "Raw Ingredients (Stock In)"
  const stockInExpenses = (inventoryState.purchases || []).map(p => ({
    id: `stock-${p.id}`,
    description: `${p.items?.[0]?.itemName || 'Raw Ingredients Purchase'} (${p.invoiceRef || p.supplier})`,
    category: 'Raw Ingredients (Stock In)',
    amount: p.totalAmount || 0,
    date: p.dateIso || new Date().toISOString().split('T')[0],
    displayDate: p.date || p.dateIso,
    notes: `Auto-linked from Purchase / Stock In (${p.supplier || 'Supplier'})`,
    isStockIn: true
  }));

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
  const handleSaveExpense = (e) => {
    e.preventDefault();
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

    expenseStore.addExpense({
      description: descriptionInput.trim(),
      category: selectedCategoryToSave,
      amount: numAmount,
      date: dateInput,
      notes: notesInput
    });

    // Reset Form
    setDescriptionInput('');
    setAmountInput('');
    setNotesInput('');
    setCategoryInput('Utilities');
    setDateInput(new Date().toISOString().split('T')[0]);
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
    setEditAmount(item.amount.toString());
    setEditDate(item.date);
    setEditNotes(item.notes || '');
  };

  // Save Edit Record
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingExpense) return;

    expenseStore.updateExpense(editingExpense.id, {
      description: editDesc,
      category: editCategory,
      amount: editAmount,
      date: editDate,
      notes: editNotes
    });

    setEditingExpense(null);
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

            {/* Category & Amount Row */}
            <div className="grid grid-cols-2 gap-2">
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
              className={`w-full py-2 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D] border-[#542A16]' : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'} text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer border flex items-center justify-center gap-2 mt-1`}
            >
              <PlusCircle className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
              <span>Save Expense Record</span>
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

          {/* Ledger Table */}
          <div className="overflow-x-auto overflow-y-auto no-scrollbar rounded-xl border border-[#ded4c5] max-h-[420px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#ebdcc8] text-[#11291f] font-black uppercase text-[10px] tracking-wider border-b border-[#cabb9e] whitespace-nowrap sticky top-0 z-10">
                  <th className="py-2.5 px-3">DATE</th>
                  <th className="py-2.5 px-3">DESCRIPTION</th>
                  <th className="py-2.5 px-3">CATEGORY</th>
                  <th className="py-2.5 px-3 text-right">AMOUNT (₹)</th>
                  <th className="py-2.5 px-3 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded4c5] bg-white text-[#122c20] font-medium whitespace-nowrap">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 px-4 text-center bg-[#fdfbf7]">
                      <div className="flex flex-col items-center justify-center text-center space-y-2 max-w-lg mx-auto">
                        <img
                          src="/expense_empty_illustration.png"
                          alt="Managing Café Expenses Illustration"
                          className="w-full max-w-sm h-auto max-h-56 object-contain relative z-10 block mx-auto"
                        />
                        <h4 className="text-base sm:text-lg font-serif font-black text-[#11291f] tracking-wide">
                          No expense records yet
                        </h4>
                        <p className="text-xs sm:text-sm font-bold text-[#547363] leading-relaxed">
                          Start recording your café's operating expenses to track spending and manage costs.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fbf8f3] transition-colors">
                      
                      <td className="py-2.5 px-3 font-mono font-bold text-[#557361] text-[11px]">
                        {item.displayDate}
                      </td>

                      <td className="py-2.5 px-3 font-extrabold text-[#11291f]">
                        <div>{item.description}</div>
                        {item.notes && <span className="text-[9.5px] text-[#719985] font-bold block">{item.notes}</span>}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                          item.isStockIn ? `bg-[#d4af37]/30 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}` : 'bg-[#ebe0cb] text-[#456351]'
                        }`}>
                          {item.category}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-black text-sm text-rose-700">
                        ₹{(parseFloat(item.amount) || 0).toFixed(2)}
                      </td>

                      {/* Action Buttons: Edit & Delete */}
                      <td className="py-2.5 px-3 text-center">
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

      {/* ========================================================================= */}
      {/* 4. MODAL: EDIT EXPENSE RECORD                                             */}
      {/* ========================================================================= */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
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

              <div className="grid grid-cols-2 gap-2">
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
                className={`px-5 py-2 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D] border-[#542A16]' : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'} text-white font-black text-xs rounded-xl shadow-md border cursor-pointer`}
              >
                Save Changes
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: CONFIRM DELETE                                                  */}
      {/* ========================================================================= */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
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
        </div>
      )}

    </div>
  );
}
