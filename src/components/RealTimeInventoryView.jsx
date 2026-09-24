import React, { useState, useEffect } from 'react';
import { 
  Package, 
  PackagePlus, 
  PackageMinus, 
  RefreshCw, 
  Search, 
  Plus, 
  Minus, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Filter, 
  Clock, 
  FileText, 
  X, 
  CheckCircle,
  Coffee,
  ShoppingBag,
  RotateCcw,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { inventoryStore } from '../services/inventoryStore';
import { updateItemThreshold } from '../services/api';


export default function RealTimeInventoryView({ selectedBranch, onNavigate }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  const [inventoryState, setInventoryState] = useState(() => inventoryStore.getState());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, HEALTHY, LOW_STOCK, CRITICAL
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('ALL'); // ALL, STOCK_IN, STOCK_OUT

  // Data UI States: 'EMPTY', 'POPULATED', 'LOADING', 'ERROR', 'AUTO'
  const [simulatedState, setSimulatedState] = useState('AUTO');
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isManualError, setIsManualError] = useState(false);

  // Modals state
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  // Form states for Threshold Edit
  const [thresholdItem, setThresholdItem] = useState(null);
  const [thresholdInput, setThresholdInput] = useState('');
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);

  // Form states for Purchase / Stock In
  const [selectedItemId, setSelectedItemId] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [categoryInput, setCategoryInput] = useState('Raw Ingredients');
  const [qtyInput, setQtyInput] = useState('');
  const [unitInput, setUnitInput] = useState('kg');
  const [priceInput, setPriceInput] = useState('');
  const [supplierInput, setSupplierInput] = useState('');
  const [invoiceRefInput, setInvoiceRefInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  // Form states for Stock Out / Usage
  const [outItemId, setOutItemId] = useState('');
  const [outQtyInput, setOutQtyInput] = useState('');
  const [outReasonInput, setOutReasonInput] = useState('Kitchen Consumption');
  const [outNotesInput, setOutNotesInput] = useState('');

  // Sync active branch with inventoryStore & update local state
  // Sync active branch with inventoryStore & update local state
  useEffect(() => {
    if (selectedBranch?.id) {
      inventoryStore.setBranch(selectedBranch.id);
      inventoryStore.hydrateFromBackend(selectedBranch.id);
      setInventoryState(inventoryStore.getState());
    }
  }, [selectedBranch?.id]);

  // Subscribe to real-time inventory updates
  useEffect(() => {
    const unsubscribe = inventoryStore.subscribe((newState) => {
      setInventoryState(newState);
    });
    return unsubscribe;
  }, []);

  const { items: realItems, ledger: realLedger, summary: realSummary } = inventoryState;

  // Determine current active Data UI State
  let currentDataState = 'POPULATED';
  if (simulatedState === 'LOADING' || isManualLoading) {
    currentDataState = 'LOADING';
  } else if (simulatedState === 'ERROR' || isManualError) {
    currentDataState = 'ERROR';
  } else if (simulatedState === 'EMPTY') {
    currentDataState = 'EMPTY';
  } else if (simulatedState === 'POPULATED') {
    currentDataState = 'POPULATED';
  } else {
    // AUTO: check if database/store has 0 items
    currentDataState = realItems.length === 0 ? 'EMPTY' : 'POPULATED';
  }

  // Derive items & summary based on state
  const activeItems = currentDataState === 'EMPTY' ? [] : (currentDataState === 'POPULATED' ? realItems : []);
  const activeLedger = currentDataState === 'EMPTY' ? [] : (currentDataState === 'POPULATED' ? realLedger : []);

  const activeSummary = currentDataState === 'EMPTY' ? {
    totalItemsCount: 0,
    dailyStockIn: 0,
    dailyStockOut: 0,
    totalRemainingStock: 0,
    lowStockCount: 0,
    criticalCount: 0,
    displayDate: realSummary.displayDate
  } : realSummary;

  // Filtered inventory items (alphabetically sorted)
  const filteredItems = activeItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered movement ledger
  const filteredLedger = activeLedger.filter(entry => {
    const matchesType = ledgerTypeFilter === 'ALL' || entry.type === ledgerTypeFilter;
    const matchesSearch = entry.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.ref.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Retry handler
  const handleRetry = () => {
    setIsManualLoading(true);
    setIsManualError(false);
    const branchId = selectedBranch?.id || 'branch-1';
    inventoryStore.hydrateFromBackend(branchId).finally(() => {
      setIsManualLoading(false);
      setSimulatedState('AUTO');
    });
  };

  // Handle Save Purchase / Stock In
  const handleSaveStockIn = (e) => {
    e.preventDefault();
    if (!qtyInput || parseFloat(qtyInput) <= 0) {
      alert("Please enter a valid positive quantity.");
      return;
    }

    const selectedItemObj = realItems.find(i => i.id === selectedItemId);
    const branchId = selectedBranch?.id || 'branch-1';

    inventoryStore.recordStockIn({
      itemId: selectedItemId || null,
      itemName: selectedItemObj ? selectedItemObj.name : newItemName,
      category: categoryInput,
      qty: qtyInput,
      unit: selectedItemObj ? selectedItemObj.unit : unitInput,
      supplier: supplierInput || (selectedItemObj ? selectedItemObj.supplier : 'Local Vendor'),
      invoiceRef: invoiceRefInput || `PO #SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      cost: priceInput,
      notes: notesInput
    }, branchId);

    // Reset Form & Switch state to AUTO so user sees their new stock item live
    setSelectedItemId('');
    setNewItemName('');
    setQtyInput('');
    setPriceInput('');
    setSupplierInput('');
    setInvoiceRefInput('');
    setNotesInput('');
    setIsStockInModalOpen(false);
    if (simulatedState === 'EMPTY') {
      setSimulatedState('AUTO');
    }
  };

  // Handle Save Stock Out / Usage
  const handleSaveStockOut = (e) => {
    e.preventDefault();
    if (!outItemId) {
      alert("Please select an item to deduct.");
      return;
    }
    if (!outQtyInput || parseFloat(outQtyInput) <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    const selectedItemObj = realItems.find(i => i.id === outItemId);

    inventoryStore.recordStockOut({
      itemId: outItemId,
      itemName: selectedItemObj ? selectedItemObj.name : 'Unknown Item',
      qty: outQtyInput,
      unit: selectedItemObj ? selectedItemObj.unit : 'units',
      source: outReasonInput,
      ref: `Usage #${Math.floor(1000 + Math.random() * 9000)}`,
      notes: outNotesInput || 'Internal usage / wastage record'
    });

    setOutItemId('');
    setOutQtyInput('');
    setOutNotesInput('');
    setIsStockOutModalOpen(false);
  };

  // Open Threshold Edit Modal
  const handleOpenThresholdModal = (item) => {
    setThresholdItem(item);
    setThresholdInput(item.minThreshold !== undefined ? String(item.minThreshold) : '0');
    setIsThresholdModalOpen(true);
  };

  // Handle Save Threshold to PostgreSQL & InventoryStore
  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    if (!thresholdItem) return;

    const numVal = parseFloat(thresholdInput);
    if (isNaN(numVal) || numVal < 0) {
      alert("Please enter a valid non-negative number for the minimum threshold.");
      return;
    }

    setIsSavingThreshold(true);

    try {
      const branchId = selectedBranch?.id || 'branch-1';
      await inventoryStore.updateItemThreshold(thresholdItem.id, numVal, branchId);
    } catch (err) {
      console.warn('Could not persist threshold to backend:', err);
    } finally {
      setIsSavingThreshold(false);
      setIsThresholdModalOpen(false);
      setThresholdItem(null);
    }
  };

  return (
    <div className="space-y-3 font-sans relative pb-6 w-full">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER (DESKTOP: FROZEN, MOBILE: STRUCTURED CLEAN HIERARCHY) */}
      {/* ========================================================================= */}

      {/* DESKTOP HEADER (MD+): 100% STRICTLY FROZEN */}
      <div className="hidden md:flex bg-[#ebdcc8] text-[#122c20] rounded-2xl p-3 px-4 border border-[#cabb9e] shadow-sm flex-row items-center justify-between gap-3 shrink-0 relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
          <div className={`p-2 rounded-xl shadow-xs border ${
            isBrownBranch ? 'bg-[#542A16] text-white border-[#7A4325]' : 'bg-[#0f3823] text-white border-[#194c31]'
          }`}>
            <Package className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-serif font-black text-[#11291f] leading-none">
                Real-Time Inventory & Stock Tracking
              </h2>
              {/* Dynamic State Badge Indicator */}
              <span className={`px-2 py-0.5 text-[9.5px] font-black uppercase rounded-full border ${
                currentDataState === 'EMPTY' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                currentDataState === 'LOADING' ? 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse' :
                currentDataState === 'ERROR' ? 'bg-red-100 text-red-900 border-red-300' :
                isBrownBranch ? 'bg-[#542A16] text-[#C69A4B] border-[#7A4325]' : 'bg-[#0f3823] text-[#4ade80] border-[#194c31]'
              }`}>
                {currentDataState === 'EMPTY' ? 'State: Empty (0 Records)' :
                 currentDataState === 'LOADING' ? 'State: Fetching Data...' :
                 currentDataState === 'ERROR' ? 'State: Connection Error' :
                 'State: Live Real-Time Data'}
              </span>
            </div>
            <p className="text-xs text-[#456351] font-bold mt-1">
              Live calculated stock movements: <strong className={isBrownBranch ? 'text-[#542A16]' : 'text-[#0f3823]'}>Remaining Stock = Opening + Stock In - Stock Out</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 z-10 self-start md:self-center">
          <button
            onClick={() => onNavigate ? onNavigate('purchase') : setIsStockInModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer border ${
              isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'
            }`}
          >
            <PackagePlus className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
            <span>Purchase / Stock In</span>
          </button>

          <button
            onClick={() => setIsStockOutModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7f1d1d] hover:bg-[#681717] text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer border border-red-900"
          >
            <PackageMinus className="w-4 h-4 text-red-200" />
            <span>- Usage / Stock Out</span>
          </button>
        </div>
      </div>

      {/* MOBILE HEADER (< MD): CLEAN STRUCTURED HIERARCHY */}
      <div className="md:hidden bg-[#ebdcc8] text-[#122c20] rounded-2xl p-3.5 border border-[#cabb9e] shadow-sm space-y-2.5 relative overflow-hidden">
        
        {/* Row 1: Icon + Title */}
        <div className="flex items-start gap-2.5">
          <div className={`p-2 rounded-xl shadow-xs border shrink-0 ${
            isBrownBranch ? 'bg-[#542A16] text-white border-[#7A4325]' : 'bg-[#0f3823] text-white border-[#194c31]'
          }`}>
            <Package className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm min-[380px]:text-base font-serif font-black text-[#11291f] leading-tight">
              Real-Time Inventory & Stock Tracking
            </h2>
            <p className="text-[10.5px] min-[380px]:text-[11px] text-[#456351] font-bold mt-1 leading-snug">
              Live calculated stock movements:<br />
              <span className={`font-black ${isBrownBranch ? 'text-[#542A16]' : 'text-[#0f3823]'}`}>
                Remaining Stock = Opening + Stock In - Stock Out
              </span>
            </p>
          </div>
        </div>

        {/* Row 2: Status Badge */}
        <div className="flex items-center pt-0.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase rounded-full border shadow-2xs ${
            currentDataState === 'EMPTY' ? 'bg-amber-100 text-amber-900 border-amber-300' :
            currentDataState === 'LOADING' ? 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse' :
            currentDataState === 'ERROR' ? 'bg-red-100 text-red-900 border-red-300' :
            isBrownBranch ? 'bg-[#542A16] text-[#C69A4B] border-[#7A4325]' : 'bg-[#0f3823] text-[#4ade80] border-[#194c31]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
            <span>{currentDataState === 'EMPTY' ? 'State: Empty (0 Records)' :
                   currentDataState === 'LOADING' ? 'State: Fetching Data...' :
                   currentDataState === 'ERROR' ? 'State: Connection Error' :
                   'STATE: LIVE REAL-TIME DATA'}</span>
          </span>
        </div>

        {/* Row 3: Action Buttons (Two Clean, Tap-Friendly Buttons) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onNavigate ? onNavigate('purchase') : setIsStockInModalOpen(true)}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer border ${
              isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'
            }`}
          >
            <PackagePlus className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
            <span className="whitespace-nowrap">Purchase / Stock In</span>
          </button>

          <button
            onClick={() => setIsStockOutModalOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#7f1d1d] hover:bg-[#681717] text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer border border-red-900"
          >
            <PackageMinus className="w-3.5 h-3.5 text-red-200" />
            <span className="whitespace-nowrap">- Usage / Stock Out</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. INVENTORY DASHBOARD SUMMARY CARDS (DYNAMIC VALUES / SKELETONS)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 shrink-0">
        
        {/* Card 1: Total Items */}
        <div className="bg-[#ebdcc8] p-2.5 rounded-xl border border-[#cabb9e] shadow-xs space-y-0.5">
          <span className="text-[10px] font-black text-[#11291f] uppercase tracking-wider block">TOTAL ITEMS</span>
          {currentDataState === 'LOADING' ? (
            <div className="h-6 w-12 bg-[#ded4c5] rounded animate-pulse my-0.5" />
          ) : (
            <p className="text-lg font-mono font-black text-[#11291f] leading-none">{activeSummary.totalItemsCount}</p>
          )}
          <span className="text-[9px] font-bold text-[#456351] block">Active Catalog</span>
        </div>

        {/* Card 2: Stocks In Per Day */}
        <div className="bg-[#ebdcc8] p-2.5 rounded-xl border border-[#cabb9e] shadow-xs space-y-0.5">
          <span className="text-[10px] font-black text-[#0f3823] uppercase tracking-wider block">STOCKS IN TODAY</span>
          {currentDataState === 'LOADING' ? (
            <div className="h-6 w-16 bg-[#ded4c5] rounded animate-pulse my-0.5" />
          ) : (
            <p className="text-lg font-mono font-black text-[#0f3823] leading-none flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#0f3823]" />
              <span>+{activeSummary.dailyStockIn}</span>
            </p>
          )}
          <span className="text-[9px] font-bold text-[#456351] block">{activeSummary.displayDate || 'Today'}</span>
        </div>

        {/* Card 3: Stocks Out Per Day */}
        <div className="bg-[#ebdcc8] p-2.5 rounded-xl border border-[#cabb9e] shadow-xs space-y-0.5">
          <span className="text-[10px] font-black text-red-900 uppercase tracking-wider block">STOCKS OUT TODAY</span>
          {currentDataState === 'LOADING' ? (
            <div className="h-6 w-16 bg-[#ded4c5] rounded animate-pulse my-0.5" />
          ) : (
            <p className="text-lg font-mono font-black text-red-700 leading-none flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-700" />
              <span>-{activeSummary.dailyStockOut}</span>
            </p>
          )}
          <span className="text-[9px] font-bold text-[#456351] block">POS & Usage</span>
        </div>

        {/* Card 4: Total Remaining Stock */}
        <div className="bg-[#ebdcc8] p-2.5 rounded-xl border border-[#cabb9e] shadow-xs space-y-0.5">
          <span className="text-[10px] font-black text-[#0f3823] uppercase tracking-wider block">REMAINING STOCK</span>
          {currentDataState === 'LOADING' ? (
            <div className="h-6 w-14 bg-[#ded4c5] rounded animate-pulse my-0.5" />
          ) : (
            <p className="text-lg font-mono font-black text-[#0f3823] leading-none">{activeSummary.totalRemainingStock}</p>
          )}
          <span className="text-[9px] font-bold text-[#456351] block">Calculated Total</span>
        </div>

        {/* Card 5: Low Stock Items */}
        <div className="bg-[#fef3c7] p-2.5 rounded-xl border border-[#f59e0b]/40 shadow-xs space-y-0.5">
          <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">APPROACHING LIMIT</span>
          {currentDataState === 'LOADING' ? (
            <div className="h-6 w-10 bg-amber-200 rounded animate-pulse my-0.5" />
          ) : (
            <p className="text-lg font-mono font-black text-amber-700 leading-none">{activeSummary.lowStockCount}</p>
          )}
          <span className="text-[9px] font-bold text-amber-800 block">Needs Reorder</span>
        </div>

        {/* Card 6: Critical Stock Items */}
        <div className="bg-[#fee2e2] p-2.5 rounded-xl border border-red-300 shadow-xs space-y-0.5">
          <span className="text-[10px] font-black text-red-900 uppercase tracking-wider block">CRITICAL STOCK</span>
          {currentDataState === 'LOADING' ? (
            <div className="h-6 w-10 bg-red-200 rounded animate-pulse my-0.5" />
          ) : (
            <p className="text-lg font-mono font-black text-red-700 leading-none">{activeSummary.criticalCount}</p>
          )}
          <span className="text-[9px] font-bold text-red-800 block">Immediate Stock In</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN INVENTORY MASTER CATALOG TABLE SECTION                             */}
      {/* ========================================================================= */}
      <div className="bg-[#fdfbf7] rounded-2xl border border-[#cabb9e] shadow-xs p-3 space-y-3 shrink-0">
        
        {/* Table Controls Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h3 className="font-serif font-black text-sm text-[#11291f] whitespace-nowrap">
              Inventory Master Catalog
            </h3>
            <span className="px-2 py-0.5 bg-[#ebe0cb] text-[#456351] rounded-full text-[10px] font-bold">
              {currentDataState === 'LOADING' ? '...' : `${filteredItems.length} items`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items or categories..."
                className={`w-full pl-9 pr-3 py-1.5 bg-[#f0ebd9] border-2 border-[#cabb9e] rounded-xl text-xs text-[#0f231a] placeholder-[#385344] focus:outline-none ${isBrownBranch ? 'focus:border-[#7A4325] focus:ring-1 focus:ring-[#7A4325]' : 'focus:border-[#0f3823] focus:ring-1 focus:ring-[#0f3823]'} font-extrabold shadow-inner transition-all`}
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 bg-[#ebe0cb] p-0.5 rounded-xl border border-[#cabb9e] shrink-0">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'HEALTHY', label: 'Healthy' },
                { id: 'LOW_STOCK', label: 'Low' },
                { id: 'CRITICAL', label: 'Critical' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    statusFilter === f.id
                      ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-2xs`
                      : 'text-[#456351] hover:text-[#122c20]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* INVENTORY DATA: DESKTOP MASTER TABLE (md+) & MOBILE STRUCTURED CARDS (<md) */}
        <div>
          {/* DESKTOP TABLE: STRICTLY FROZEN & UNCHANGED (md:block) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-[#ded4c5]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`${isBrownBranch ? 'bg-[#3E2312] text-[#E8D8C2]' : 'bg-[#ebdcc8] text-[#11291f]'} font-black uppercase text-[10px] tracking-wider border-b border-[#cabb9e]`}>
                  <th className="py-2.5 px-3">ITEM / PRODUCT NAME</th>
                  <th className="py-2.5 px-3">CATEGORY</th>
                  <th className="py-2.5 px-3 text-right">OPENING</th>
                  <th className="py-2.5 px-3 text-right">STOCK IN (+)</th>
                  <th className="py-2.5 px-3 text-right">STOCK OUT (-)</th>
                  <th className="py-2.5 px-3 text-right">REMAINING</th>
                  <th className="py-2.5 px-3 text-center">UNIT</th>
                  <th className="py-2.5 px-3 text-right">MIN THRESHOLD</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                  <th className="py-2.5 px-3 text-center">QUICK ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded4c5] bg-white font-medium text-[#122c20]">
              
              {/* ========================================================================= */}
              {/* DATA STATE A: LOADING SKELETONS                                           */}
              {/* ========================================================================= */}
              {currentDataState === 'LOADING' && (
                [1, 2, 3, 4, 5].map(idx => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3 px-3"><div className="h-4 w-32 bg-[#ebe0cb] rounded" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-20 bg-[#ebdcc8] rounded" /></td>
                    <td className="py-3 px-3 text-right"><div className="h-4 w-10 bg-[#ebe0cb] rounded ml-auto" /></td>
                    <td className="py-3 px-3 text-right"><div className="h-4 w-12 bg-emerald-100 rounded ml-auto" /></td>
                    <td className="py-3 px-3 text-right"><div className="h-4 w-12 bg-red-100 rounded ml-auto" /></td>
                    <td className="py-3 px-3 text-right"><div className="h-4 w-14 bg-[#ebdcc8] rounded ml-auto" /></td>
                    <td className="py-3 px-3 text-center"><div className="h-4 w-8 bg-[#ebe0cb] rounded mx-auto" /></td>
                    <td className="py-3 px-3 text-right"><div className="h-4 w-10 bg-[#ebe0cb] rounded ml-auto" /></td>
                    <td className="py-3 px-3 text-center"><div className="h-4 w-16 bg-[#ebdcc8] rounded-full mx-auto" /></td>
                    <td className="py-3 px-3 text-center"><div className="h-6 w-20 bg-[#103825]/30 rounded-lg mx-auto" /></td>
                  </tr>
                ))
              )}

              {/* ========================================================================= */}
              {/* DATA STATE D: ERROR STATE                                                 */}
              {/* ========================================================================= */}
              {currentDataState === 'ERROR' && (
                <tr>
                  <td colSpan="10" className="py-12 px-4 text-center bg-[#fbf8f3]">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 bg-red-100 text-red-700 rounded-full border border-red-300">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      </div>
                      <h4 className="text-base font-black text-[#11291f]">Unable to load inventory</h4>
                      <p className="text-xs text-[#547363] font-medium leading-relaxed">
                        There was a problem communicating with the real-time stock database server. Please verify your connection or try again.
                      </p>
                      <button
                        onClick={handleRetry}
                        className={`flex items-center gap-1.5 px-4 py-2 ${isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]'} text-white text-xs font-black rounded-xl shadow-md border cursor-pointer`}
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
                        <span>Retry Loading</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* ========================================================================= */}
              {/* DATA STATE B: ELEGANT CAFÉ EMPTY STATE (0 RECORDS)                        */}
              {/* ========================================================================= */}
              {currentDataState === 'EMPTY' && (
                <tr>
                  <td colSpan="10" className="py-12 px-4 text-center bg-[#fdfbf7] relative overflow-hidden">
                    
                    {/* Main Empty State Container */}
                    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center space-y-3 py-2 relative z-10">
                      
                      {/* Pure 100% Transparent Realistic 3D Cardboard Stock Box & Coffee Leaf Illustration */}
                      <div className="relative w-64 sm:w-72 h-auto flex items-center justify-center mb-0 transition-transform transform hover:scale-105">
                        
                        {/* Soft Ambient Radial Sheen */}
                        <div className="absolute inset-0 bg-[#ebdcc8]/50 rounded-full blur-2xl scale-110 pointer-events-none" />
                        
                        {/* Realistic 3D Box & Leaves with 100% Transparent Background */}
                        <img 
                          src="/realistic_stock_box.png" 
                          alt="Empty Inventory Stock Box" 
                          className="w-full h-auto max-h-48 sm:max-h-56 object-contain relative z-10 drop-shadow-xl"
                        />
                      </div>

                      {/* Stylish Serif Script Typography */}
                      <div className="space-y-1 mt-0">
                        <h4 className="text-xl sm:text-2xl font-black font-serif italic text-[#11291f] tracking-wide">
                          No inventory records yet!
                        </h4>

                        <p className="text-xs sm:text-sm font-serif italic font-bold text-[#456351] max-w-md leading-relaxed tracking-wide">
                          Start by adding your first stock purchase to track your inventory.
                        </p>
                      </div>

                      {/* 3-COLUMN FEATURE HIGHLIGHT STRIP */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#ebdcc8] w-full max-w-xl text-left">
                        
                        {/* Feature 1 */}
                        <div className="flex items-start gap-2.5 bg-[#ebdcc8]/40 p-2.5 rounded-xl border border-[#cabb9e]/50">
                          <div className={`p-1.5 ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'} rounded-lg shrink-0 mt-0.5`}>
                            <Coffee className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h5 className="font-extrabold text-[11px] text-[#11291f] leading-tight">Add your stock purchases</h5>
                            <p className="text-[10px] text-[#547363] font-medium mt-0.5">through Purchase / Stock In</p>
                          </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex items-start gap-2.5 bg-[#ebdcc8]/40 p-2.5 rounded-xl border border-[#cabb9e]/50">
                          <div className={`p-1.5 ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'} rounded-lg shrink-0 mt-0.5`}>
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h5 className="font-extrabold text-[11px] text-[#11291f] leading-tight">Track your inventory</h5>
                            <p className="text-[10px] text-[#547363] font-medium mt-0.5">in real-time</p>
                          </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex items-start gap-2.5 bg-[#ebdcc8]/40 p-2.5 rounded-xl border border-[#cabb9e]/50">
                          <div className={`p-1.5 ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'} rounded-lg shrink-0 mt-0.5`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h5 className="font-extrabold text-[11px] text-[#11291f] leading-tight">Get low stock alerts</h5>
                            <p className="text-[10px] text-[#547363] font-medium mt-0.5">and never run out</p>
                          </div>
                        </div>

                      </div>

                    </div>

                  </td>
                </tr>
              )}

              {/* ========================================================================= */}
              {/* DATA STATE C: POPULATED STATE (REAL DATABASE ITEMS)                      */}
              {/* ========================================================================= */}
              {currentDataState === 'POPULATED' && (
                filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-xs font-bold text-[#557361] bg-[#fbf8f3]">
                      No inventory items match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isCritical = item.status === 'CRITICAL';
                    const isLow = item.status === 'LOW_STOCK';

                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-[#fbf8f3] transition-colors ${
                          isCritical ? 'bg-red-50/70' : isLow ? 'bg-amber-50/70' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-extrabold text-[#11291f]">
                          {item.name}
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 bg-[#ebe0cb] text-[#456351] text-[10px] font-extrabold rounded-md">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-[#557361] font-bold">
                          {item.openingStock}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          +{item.stockIn}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold text-red-700">
                          -{item.stockOut}
                        </td>

                        {/* Remaining Stock = Opening + Stock In - Stock Out */}
                        <td className="py-2.5 px-3 text-right font-mono font-black text-sm text-[#0f3823]">
                          {item.remainingStock}
                        </td>

                        <td className="py-2.5 px-3 text-center text-[#557361] font-bold">
                          {item.unit}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-[#557361] font-bold">
                          <button
                            type="button"
                            onClick={() => handleOpenThresholdModal(item)}
                            className="inline-flex items-center gap-1 hover:text-[#11291f] hover:bg-[#ebdcc8]/60 px-1.5 py-0.5 rounded transition-all cursor-pointer group"
                            title="Click to edit minimum stock threshold"
                          >
                            <span>{item.minThreshold}</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </td>

                        {/* Calculated Status Badge */}
                        <td className="py-2.5 px-3 text-center">
                          {isCritical ? (
                            <span className="px-2 py-0.5 bg-red-600 text-white text-[9.5px] font-black rounded-full shadow-2xs uppercase">
                              Critical
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 bg-[#d4af37] text-[#0d2b1d] text-[9.5px] font-black rounded-full shadow-2xs uppercase">
                              Low Limit
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'} text-[9.5px] font-black rounded-full shadow-2xs uppercase`}>
                              Healthy
                            </span>
                          )}
                        </td>

                        {/* Quick Actions Button */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedItemId(item.id);
                              setUnitInput(item.unit);
                              setCategoryInput(item.category);
                              setSupplierInput(item.supplier || '');
                              setIsStockInModalOpen(true);
                            }}
                            className={`px-2 py-1 ${isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F]' : 'bg-[#103825] hover:bg-[#0a2618]'} text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer`}
                            title="Record Purchase / Stock In"
                          >
                            + Stock In
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )
              )}

            </tbody>
          </table>
          </div>

          {/* MOBILE STRUCTURED INVENTORY CARDS: DEDICATED ARRANGEMENT (<md) */}
          <div className="md:hidden space-y-3">
            {currentDataState === 'ERROR' ? (
              <div className="bg-[#fbf8f3] rounded-xl border border-red-300 p-6 text-center shadow-xs">
                <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 bg-red-100 text-red-700 rounded-full border border-red-300">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-base font-black text-[#11291f]">Unable to load inventory</h4>
                  <p className="text-xs text-[#547363] font-medium leading-relaxed">
                    There was a problem communicating with the real-time stock database server. Please verify your connection or try again.
                  </p>
                  <button
                    onClick={handleRetry}
                    className={`flex items-center gap-1.5 px-4 py-2 ${isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]'} text-white text-xs font-black rounded-xl shadow-md border cursor-pointer`}
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
                    <span>Retry Loading</span>
                  </button>
                </div>
              </div>
            ) : currentDataState === 'EMPTY' ? (
              <div className="bg-[#fdfbf7] rounded-xl border border-[#cabb9e] p-6 text-center shadow-xs">
                <div className="relative w-full max-w-xs mx-auto mb-3">
                  <img 
                    src="/realistic_stock_box.png" 
                    alt="Empty Inventory Stock Box" 
                    className="w-full h-auto max-h-48 object-contain mx-auto drop-shadow-md"
                  />
                </div>
                <h3 className="text-lg font-serif font-black text-[#11291f]">No inventory records yet!</h3>
                <p className="text-xs text-[#547363] mt-1 font-medium">
                  Add your first stock purchase to track your inventory in real-time.
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#cabb9e] p-6 text-center text-xs font-bold text-[#557361]">
                No inventory items match your search criteria.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isCritical = item.status === 'CRITICAL';
                const isLow = item.status === 'LOW_STOCK';
                return (
                  <div
                    key={item.id}
                    className={`bg-white p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-2.5 ${
                      isCritical ? 'bg-red-50/40 border-red-200' : isLow ? 'bg-amber-50/40 border-amber-200' : ''
                    }`}
                  >
                    {/* Header: Name + Category + Status + Action */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#ebdcc8] pb-2">
                      <div>
                        <h4 className="text-xs font-black text-[#11291f] leading-tight">{item.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 bg-[#ebe0cb] text-[#456351] text-[9.5px] font-extrabold rounded">
                            {item.category}
                          </span>
                          {isCritical ? (
                            <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-full uppercase">
                              Critical
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 bg-[#d4af37] text-[#0d2b1d] text-[9px] font-black rounded-full uppercase">
                              Low Limit
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'} text-[9px] font-black rounded-full uppercase`}>
                              Healthy
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setUnitInput(item.unit);
                          setCategoryInput(item.category);
                          setSupplierInput(item.supplier || '');
                          setIsStockInModalOpen(true);
                        }}
                        className={`px-2.5 py-1.5 ${isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F]' : 'bg-[#103825] hover:bg-[#0a2618]'} text-white text-[10.5px] font-bold rounded-lg transition-all shadow-xs shrink-0`}
                      >
                        + Stock In
                      </button>
                    </div>

                    {/* Stock Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-[#ebdcc8]/30 p-2.5 rounded-xl border border-[#cabb9e]/50 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#547363] block">Opening</span>
                        <span className="font-mono font-bold text-[#11291f]">{item.openingStock} {item.unit}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] uppercase font-bold text-emerald-700 block">Stock In (+)</span>
                        <span className="font-mono font-extrabold text-emerald-700">+{item.stockIn}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-red-700 block">Stock Out (-)</span>
                        <span className="font-mono font-extrabold text-red-700">-{item.stockOut}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-[#cabb9e]/40">
                        <span className="text-[9px] uppercase font-black text-[#547363] block">Remaining Stock</span>
                        <span className={`font-mono font-black text-sm ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`}>
                          {item.remainingStock} {item.unit}
                        </span>
                      </div>
                      <div className="text-right pt-1 border-t border-[#cabb9e]/40">
                        <span className="text-[9px] uppercase font-bold text-[#547363] block">Min Threshold</span>
                        <button
                          type="button"
                          onClick={() => handleOpenThresholdModal(item)}
                          className="inline-flex items-center gap-1 font-mono font-medium text-[#547363] hover:text-[#11291f] cursor-pointer"
                        >
                          <span>{item.minThreshold} {item.unit}</span>
                          <Edit2 className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CHRONOLOGICAL STOCK MOVEMENT HISTORY LEDGER SECTION                    */}
      {/* ========================================================================= */}
      <div className="bg-[#fdfbf7] rounded-2xl border-2 border-[#cabb9e] shadow-sm p-3.5 space-y-3.5 shrink-0 mt-5">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-1 border-b border-[#ebdcc8]">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${isBrownBranch ? 'bg-[#542A16] border-[#7A4325]' : 'bg-[#0f3823] border-[#194c31]'} shadow-xs`}>
              <Clock className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
            </div>
            <div>
              <h3 className="font-serif font-black text-sm sm:text-base text-[#11291f] leading-tight">
                Stock Movement History & Audit Ledger
              </h3>
              <p className="text-[10px] sm:text-[11px] font-bold text-[#557361] mt-0.5">
                Automatic Stock In & POS Sales Ledger
              </p>
            </div>
          </div>

          {/* Movement Type Filter Pills */}
          <div className="flex items-center gap-1 bg-[#ebe0cb] p-0.5 rounded-xl border border-[#cabb9e] shrink-0 self-stretch sm:self-auto justify-center">
            {[
              { id: 'ALL', label: 'All Movements' },
              { id: 'STOCK_IN', label: 'Stock In (+)' },
              { id: 'STOCK_OUT', label: 'Stock Out (-)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setLedgerTypeFilter(f.id)}
                className={`px-3 py-1 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
                  ledgerTypeFilter === f.id
                    ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-2xs`
                    : 'text-[#456351] hover:text-[#122c20]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* DESKTOP STOCK MOVEMENT TABLE: STRICTLY FROZEN (md:block) */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-[#ded4c5]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#ebdcc8] text-[#11291f] font-black uppercase text-[10px] tracking-wider border-b border-[#cabb9e]">
                <th className="py-2.5 px-3">Date &amp; Time</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3 text-center">Movement Type</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-center">Unit</th>
                <th className="py-2.5 px-3">Source / Reason</th>
                <th className="py-2.5 px-3">Supplier / Ref #</th>
                <th className="py-2.5 px-3 text-right font-black">Stock After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded4c5] bg-white text-[#122c20] font-medium">
              {currentDataState === 'LOADING' ? (
                [1, 2, 3].map(idx => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-2 px-3"><div className="h-3 w-20 bg-[#ebe0cb] rounded" /></td>
                    <td className="py-2 px-3"><div className="h-3 w-28 bg-[#ebdcc8] rounded" /></td>
                    <td className="py-2 px-3 text-center"><div className="h-4 w-16 bg-emerald-100 rounded-md mx-auto" /></td>
                    <td className="py-2 px-3 text-right"><div className="h-3 w-10 bg-[#ebe0cb] rounded ml-auto" /></td>
                    <td className="py-2 px-3 text-center"><div className="h-3 w-8 bg-[#ebe0cb] rounded mx-auto" /></td>
                    <td className="py-2 px-3"><div className="h-3 w-24 bg-[#ebdcc8] rounded" /></td>
                    <td className="py-2 px-3"><div className="h-3 w-20 bg-[#ebe0cb] rounded" /></td>
                    <td className="py-2 px-3 text-right"><div className="h-3 w-12 bg-[#ebdcc8] rounded ml-auto" /></td>
                  </tr>
                ))
              ) : currentDataState === 'EMPTY' || filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-6 text-center text-xs font-bold text-[#557361] bg-[#fbf8f3]">
                    {currentDataState === 'EMPTY' ? 'No stock movement transactions recorded yet.' : 'No stock movements recorded for the selected filter.'}
                  </td>
                </tr>
              ) : (
                filteredLedger.map((entry) => {
                  const isStockIn = entry.type === 'STOCK_IN';

                  return (
                    <tr key={entry.id} className="hover:bg-[#fbf8f3] transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-[#557361] text-[11px]">
                        {entry.date} <span className="text-[#719985]">{entry.time}</span>
                      </td>

                      <td className="py-2 px-3 font-extrabold text-[#11291f]">
                        {entry.itemName}
                      </td>

                      <td className="py-2 px-3 text-center">
                        {isStockIn ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md border border-emerald-300">
                            + Stock In
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 font-extrabold text-[10px] rounded-md border border-red-300">
                            - Stock Out
                          </span>
                        )}
                      </td>

                      <td className={`py-2 px-3 text-right font-mono font-black text-sm ${
                        isStockIn ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {isStockIn ? '+' : '-'}{entry.qty}
                      </td>

                      <td className="py-2 px-3 text-center text-[#557361] font-bold">
                        {entry.unit}
                      </td>

                      <td className="py-2 px-3 text-[#11291f] font-semibold">
                        {entry.source}
                      </td>

                      <td className="py-2 px-3 font-mono text-[#557361] text-[11px]">
                        {entry.ref} {entry.supplier !== '-' && <span className="text-[#11291f] font-sans font-bold">({entry.supplier})</span>}
                      </td>

                      <td className="py-2 px-3 text-right font-mono font-black text-sm text-[#0f3823]">
                        {entry.remainingAfter}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE STRUCTURED STOCK MOVEMENT CARDS: DEDICATED ARRANGEMENT (<md) */}
        <div className="md:hidden space-y-3">
          {currentDataState === 'EMPTY' || filteredLedger.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#cabb9e] p-6 text-center shadow-xs">
              <h4 className="text-base font-serif font-black text-[#11291f]">No movement records</h4>
              <p className="text-xs text-[#547363] mt-1 font-medium">
                Stock in purchases and POS sales will record movements here automatically.
              </p>
            </div>
          ) : (
            filteredLedger.map((entry) => {
              const isStockIn = entry.type === 'STOCK_IN';

              return (
                <div
                  key={entry.id}
                  className="bg-white p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-2.5"
                >
                  {/* Top Header: Item Name & Movement Badge */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#ebdcc8] pb-2">
                    <div>
                      <h4 className="font-serif font-black text-sm text-[#11291f] leading-tight">
                        {entry.itemName}
                      </h4>
                      <p className="text-[10px] font-mono text-[#557361] mt-0.5">
                        {entry.date} • {entry.time}
                      </p>
                    </div>
                    <div>
                      {isStockIn ? (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md border border-emerald-300 inline-block">
                          + Stock In
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-red-100 text-red-800 font-extrabold text-[10px] rounded-md border border-red-300 inline-block">
                          - Stock Out
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Movement Details Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-[#ebdcc8]/30 p-2.5 rounded-xl border border-[#cabb9e]/50 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#547363] block">Quantity</span>
                      <span className={`font-mono font-black text-sm ${isStockIn ? 'text-emerald-700' : 'text-red-700'}`}>
                        {isStockIn ? '+' : '-'}{entry.qty} {entry.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#547363] block">Source / Reason</span>
                      <span className="font-bold text-[#11291f] text-[11px] block truncate" title={entry.source}>
                        {entry.source}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-[#547363] block">Stock After</span>
                      <span className={`font-mono font-black text-sm ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`}>
                        {entry.remainingAfter} {entry.unit}
                      </span>
                    </div>
                  </div>

                  {/* Ref & Supplier */}
                  <div className="flex items-center justify-between text-[10.5px] text-[#557361] pt-0.5">
                    <span>Ref: <strong className="font-mono text-[#11291f]">{entry.ref}</strong></span>
                    {entry.supplier && entry.supplier !== '-' && (
                      <span className="font-medium text-[#11291f]">Supplier: <strong>{entry.supplier}</strong></span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PURCHASE / STOCK IN FORM MODAL                                   */}
      {/* ========================================================================= */}
      {isStockInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#fbf8f3] w-full max-w-lg rounded-2xl border-2 border-[#cabb9e] shadow-2xl overflow-hidden animate-fadeIn">
            
            {/* Modal Header */}
            <div className={`${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white p-3.5 px-4 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <PackagePlus className={`w-5 h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
                <h3 className="font-serif font-black text-base">Record Purchase / Stock In</h3>
              </div>
              <button 
                onClick={() => setIsStockInModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-[#194c31]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveStockIn} className="p-4 space-y-3 text-xs">
              
              {/* Select Existing Item or Enter New */}
              <div>
                <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">
                  Select Item from Catalog or Create New
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    if (e.target.value) {
                      const item = realItems.find(i => i.id === e.target.value);
                      if (item) {
                        setUnitInput(item.unit);
                        setCategoryInput(item.category);
                        setSupplierInput(item.supplier || '');
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-white text-[#11291f] font-bold rounded-xl border border-[#cabb9e] focus:outline-none focus:ring-2 focus:ring-[#0f3823]"
                >
                  <option value="">-- Add New Stock Item --</option>
                  {realItems.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Current: {i.remainingStock} {i.unit})</option>
                  ))}
                </select>
              </div>

              {!selectedItemId && (
                <div className="grid grid-cols-2 gap-2 bg-[#ebdcc8] p-2.5 rounded-xl border border-[#cabb9e]">
                  <div>
                    <label className="block text-[10px] font-bold text-[#11291f] mb-0.5">New Item Name</label>
                    <input
                      type="text"
                      required={!selectedItemId}
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Arabica Roast Beans"
                      className="w-full px-2.5 py-1.5 bg-white text-[#11291f] font-bold rounded-lg border border-[#cabb9e]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#11291f] mb-0.5">Category</label>
                    <select
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white text-[#11291f] font-bold rounded-lg border border-[#cabb9e]"
                    >
                      <option value="Raw Ingredients">Raw Ingredients</option>
                      <option value="Kitchen Prep">Kitchen Prep</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Snacks & Tiffin">Snacks & Tiffin</option>
                      <option value="Desserts & Sweets">Desserts & Sweets</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Quantity & Unit Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">
                    Quantity Received (+)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    required
                    value={qtyInput}
                    onChange={(e) => setQtyInput(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full px-3 py-2 bg-white text-[#11291f] font-black font-mono rounded-xl border border-[#cabb9e] focus:outline-none focus:ring-2 focus:ring-[#0f3823]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">
                    Unit
                  </label>
                  <select
                    value={unitInput}
                    onChange={(e) => setUnitInput(e.target.value)}
                    className="w-full px-2 py-2 bg-white text-[#11291f] font-bold rounded-xl border border-[#cabb9e]"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="cups">cups</option>
                    <option value="plates">plates</option>
                    <option value="bottles">bottles</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>

              {/* Supplier & Ref PO # */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={supplierInput}
                    onChange={(e) => setSupplierInput(e.target.value)}
                    placeholder="e.g. Kumbakonam Spice Co."
                    className="w-full px-3 py-1.5 bg-white text-[#11291f] font-bold rounded-lg border border-[#cabb9e]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">Invoice / PO Ref #</label>
                  <input
                    type="text"
                    value={invoiceRefInput}
                    onChange={(e) => setInvoiceRefInput(e.target.value)}
                    placeholder="e.g. PO #SUP-8806"
                    className="w-full px-3 py-1.5 bg-white text-[#11291f] font-bold rounded-lg border border-[#cabb9e]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Fresh dark roast batch delivery"
                  className="w-full px-3 py-1.5 bg-white text-[#11291f] font-bold rounded-lg border border-[#cabb9e]"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5d8c8]">
                <button
                  type="button"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="px-4 py-2 bg-[#ebe0cb] text-[#11291f] font-bold rounded-xl border border-[#cabb9e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 ${isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]'} text-white font-black rounded-xl border shadow-md flex items-center gap-1.5 cursor-pointer`}
                >
                  <CheckCircle className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
                  <span>Save Stock In</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: USAGE / STOCK OUT FORM MODAL                                     */}
      {/* ========================================================================= */}
      {isStockOutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#fbf8f3] w-full max-w-md rounded-2xl border-2 border-[#cabb9e] shadow-2xl overflow-hidden animate-fadeIn">
            
            <div className="bg-[#7f1d1d] text-white p-3.5 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageMinus className="w-5 h-5 text-red-200" />
                <h3 className="font-serif font-black text-base">Record Usage / Stock Out</h3>
              </div>
              <button 
                onClick={() => setIsStockOutModalOpen(false)}
                className="p-1 text-red-200 hover:text-white rounded-lg hover:bg-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockOut} className="p-4 space-y-3 text-xs">
              
              <div>
                <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">
                  Select Item to Deduct
                </label>
                <select
                  required
                  value={outItemId}
                  onChange={(e) => setOutItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-[#11291f] font-bold rounded-xl border border-[#cabb9e]"
                >
                  <option value="">-- Select Item --</option>
                  {realItems.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Available: {i.remainingStock} {i.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">
                  Quantity Deducted (-)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  value={outQtyInput}
                  onChange={(e) => setOutQtyInput(e.target.value)}
                  placeholder="e.g. 3.5"
                  className="w-full px-3 py-2 bg-white text-[#11291f] font-black font-mono rounded-xl border border-[#cabb9e]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">Reason / Source</label>
                <select
                  value={outReasonInput}
                  onChange={(e) => setOutReasonInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-[#11291f] font-bold rounded-xl border border-[#cabb9e]"
                >
                  <option value="Kitchen Consumption">Kitchen Consumption</option>
                  <option value="Prep Wastage">Prep Wastage / Spoilage</option>
                  <option value="Internal Tasting">Internal Staff Tasting</option>
                  <option value="Expired Stock">Expired Stock Removal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">Notes / Audit Remarks</label>
                <input
                  type="text"
                  value={outNotesInput}
                  onChange={(e) => setOutNotesInput(e.target.value)}
                  placeholder="e.g. Tiffin roasting morning usage"
                  className="w-full px-3 py-1.5 bg-white text-[#11291f] font-bold rounded-lg border border-[#cabb9e]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5d8c8]">
                <button
                  type="button"
                  onClick={() => setIsStockOutModalOpen(false)}
                  className="px-4 py-2 bg-[#ebe0cb] text-[#11291f] font-bold rounded-xl border border-[#cabb9e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7f1d1d] hover:bg-[#681717] text-white font-black rounded-xl border border-red-900 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-red-200" />
                  <span>Deduct Stock</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: EDIT MINIMUM STOCK THRESHOLD                                   */}
      {/* ========================================================================= */}
      {isThresholdModalOpen && thresholdItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-[#fdfbf7] w-full max-w-md rounded-2xl border-2 border-[#cabb9e] shadow-2xl p-4 sm:p-5 space-y-4 animate-fadeIn">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#ebdcc8]">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isBrownBranch ? 'bg-[#542A16] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-black text-[#11291f]">Set Minimum Stock Threshold</h3>
                  <p className="text-xs font-bold text-[#547363]">Alert & Reorder Limit Configuration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsThresholdModalOpen(false);
                  setThresholdItem(null);
                }}
                className="p-1 rounded-lg text-[#547363] hover:text-[#11291f] hover:bg-[#ebdcc8] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveThreshold} className="space-y-3.5">
              <div className="bg-[#ebdcc8]/40 p-3 rounded-xl border border-[#cabb9e]/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#547363] uppercase">Item Name</span>
                  <span className="px-2 py-0.5 bg-[#ebe0cb] text-[#456351] text-[10px] font-extrabold rounded">
                    {thresholdItem.category}
                  </span>
                </div>
                <p className="text-sm font-black text-[#11291f]">{thresholdItem.name}</p>
                <div className="flex items-center justify-between pt-1 border-t border-[#cabb9e]/30 text-xs">
                  <span className="text-[#547363] font-bold">Current Stock:</span>
                  <span className="font-mono font-black text-[#0f3823]">{thresholdItem.remainingStock} {thresholdItem.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#11291f] mb-1">
                  Minimum Alert Threshold ({thresholdItem.unit})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    autoFocus
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(e.target.value)}
                    placeholder="e.g. 5"
                    className={`w-full px-3 py-2 bg-white text-[#11291f] font-mono font-black text-sm rounded-xl border-2 ${
                      isBrownBranch ? 'focus:border-[#7A4325]' : 'focus:border-[#0f3823]'
                    } border-[#cabb9e] focus:outline-none`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#547363]">
                    {thresholdItem.unit}
                  </span>
                </div>
                <p className="text-[10px] text-[#547363] mt-1 font-medium">
                  • Stock &le; threshold triggers <span className="font-bold text-amber-700">Low Limit</span> alert.<br />
                  • Stock &le; (threshold / 2) triggers <span className="font-bold text-red-700">Critical</span> alert.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ebdcc8]">
                <button
                  type="button"
                  onClick={() => {
                    setIsThresholdModalOpen(false);
                    setThresholdItem(null);
                  }}
                  className="px-4 py-2 bg-[#ebe0cb] hover:bg-[#decfa7] text-[#11291f] font-bold text-xs rounded-xl border border-[#cabb9e] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingThreshold}
                  className={`px-5 py-2 ${
                    isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2A170C]' : 'bg-[#0f3823] hover:bg-[#0a2618]'
                  } text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50`}
                >
                  <CheckCircle className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
                  <span>{isSavingThreshold ? 'Saving...' : 'Save Threshold'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

