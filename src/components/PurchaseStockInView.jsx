import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  PlusCircle, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  Package, 
  DollarSign, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  X,
  FileText,
  Clock,
  Building2,
  PackagePlus,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { inventoryStore } from '../services/inventoryStore';

const SUPPLIERS = [
  'Kumbakonam Spice Co.',
  'Aavin Dairy',
  'Nilgiri Plantations',
  'GRB Dairy',
  'Milky Mist',
  'Grand Sweets',
  'Local Farmers Market',
  'In-house Prep / Kitchen'
];

const CATEGORIES = [
  'All Categories',
  'Raw Ingredients',
  'Kitchen Prep',
  'Beverages',
  'Snacks & Tiffin',
  'Cold Beverages',
  'Desserts & Sweets'
];

const STANDARD_INVENTORY_ITEMS = [
  { id: 'std-1', name: 'Filter Coffee Powder', category: 'Raw Ingredients', unit: 'kg', cost: 450 },
  { id: 'std-2', name: 'Milk (Dairy)', category: 'Raw Ingredients', unit: 'L', cost: 60 },
  { id: 'std-3', name: 'Coffee Beans (Arabica)', category: 'Raw Ingredients', unit: 'kg', cost: 850 },
  { id: 'std-4', name: 'Pure Desi Ghee', category: 'Raw Ingredients', unit: 'kg', cost: 650 },
  { id: 'std-5', name: 'Fresh Malai Paneer', category: 'Raw Ingredients', unit: 'kg', cost: 380 },
  { id: 'std-6', name: 'Fermented Batter', category: 'Kitchen Prep', unit: 'kg', cost: 70 },
  { id: 'std-7', name: 'Organic Refined Sugar', category: 'Raw Ingredients', unit: 'kg', cost: 50 },
  { id: 'std-8', name: 'Special Tea Leaves', category: 'Raw Ingredients', unit: 'kg', cost: 320 },
  { id: 'std-9', name: 'Fresh Rose Milk Syrup', category: 'Cold Beverages', unit: 'bottles', cost: 180 },
  { id: 'std-10', name: 'Mysore Pak Prep Mix', category: 'Desserts & Sweets', unit: 'pieces', cost: 30 }
];

export default function PurchaseStockInView({ selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  const [storeState, setStoreState] = useState(() => inventoryStore.getState());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [deletingPurchaseId, setDeletingPurchaseId] = useState(null);

  // Form State for Purchase Invoice
  const [formData, setFormData] = useState({
    invoiceRef: '',
    supplier: SUPPLIERS[0],
    customSupplier: '',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    notes: '',
    items: [
      { itemId: '', itemName: '', category: 'Raw Ingredients', qty: '', unit: 'kg', pricePerUnit: '' }
    ]
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (selectedBranch?.id) {
      inventoryStore.setBranch(selectedBranch.id);
      setStoreState(inventoryStore.getState());
    }
  }, [selectedBranch?.id]);

  useEffect(() => {
    const unsubscribe = inventoryStore.subscribe((newState) => {
      setStoreState(newState);
    });
    return unsubscribe;
  }, []);

  const openAddModal = () => {
    const autoRef = `PO #SUP-${Math.floor(8800 + Math.random() * 200)}`;
    const firstItem = storeState.items.length > 0 ? storeState.items[0] : STANDARD_INVENTORY_ITEMS[0];
    setFormData({
      invoiceRef: autoRef,
      supplier: SUPPLIERS[0],
      customSupplier: '',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: '',
      items: [
        {
          itemId: firstItem?.id || '',
          itemName: firstItem?.name || '',
          category: firstItem?.category || 'Raw Ingredients',
          qty: 10,
          unit: firstItem?.unit || 'kg',
          pricePerUnit: firstItem?.costPerUnit || firstItem?.cost || 100
        }
      ]
    });
    setEditingPurchase(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      invoiceRef: purchase.invoiceRef,
      supplier: SUPPLIERS.includes(purchase.supplier) ? purchase.supplier : 'Other',
      customSupplier: SUPPLIERS.includes(purchase.supplier) ? '' : purchase.supplier,
      date: purchase.date,
      notes: purchase.notes || '',
      items: purchase.items.map(i => ({
        itemId: i.itemId || '',
        itemName: i.itemName,
        category: i.category || 'Raw Ingredients',
        qty: i.qty,
        unit: i.unit,
        pricePerUnit: i.pricePerUnit
      }))
    });
    setIsAddModalOpen(true);
  };

  const handleItemSelect = (index, selectedIdentifier) => {
    const selectedItem = storeState.items.find(i => i.id === selectedIdentifier || i.name === selectedIdentifier)
      || STANDARD_INVENTORY_ITEMS.find(i => i.id === selectedIdentifier || i.name === selectedIdentifier);

    setFormData(prev => {
      const updatedItems = [...prev.items];
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          category: selectedItem.category,
          unit: selectedItem.unit,
          pricePerUnit: selectedItem.costPerUnit || selectedItem.cost || updatedItems[index].pricePerUnit || ''
        };
      } else {
        updatedItems[index] = {
          ...updatedItems[index],
          itemId: '',
          itemName: selectedIdentifier
        };
      }
      return { ...prev, items: updatedItems };
    });
  };

  const handleLineItemChange = (index, field, value) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const addLineItem = () => {
    const combinedCatalog = [...storeState.items, ...STANDARD_INVENTORY_ITEMS.filter(std => !storeState.items.some(i => i.name.toLowerCase() === std.name.toLowerCase()))];
    const currentItemNames = new Set(formData.items.map(i => i.itemName).filter(Boolean));
    const nextCatalogItem = combinedCatalog.find(i => !currentItemNames.has(i.name)) || combinedCatalog[0];

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: nextCatalogItem ? nextCatalogItem.id : '',
          itemName: nextCatalogItem ? nextCatalogItem.name : '',
          category: nextCatalogItem ? nextCatalogItem.category : 'Raw Ingredients',
          qty: '',
          unit: nextCatalogItem ? nextCatalogItem.unit : 'kg',
          pricePerUnit: nextCatalogItem ? (nextCatalogItem.costPerUnit || nextCatalogItem.cost || '') : ''
        }
      ]
    }));
  };

  const removeLineItem = (index) => {
    if (formData.items.length <= 1) {
      showToast("A purchase record must have at least one line item.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateGrandTotal = () => {
    return formData.items.reduce((sum, item) => {
      const q = parseFloat(item.qty) || 0;
      const p = parseFloat(item.pricePerUnit) || 0;
      return sum + (q * p);
    }, 0);
  };

  const handleSavePurchase = (e) => {
    e.preventDefault();
    
    // Validate line items
    const validItems = formData.items.filter(i => i.itemName && parseFloat(i.qty) > 0);
    if (validItems.length === 0) {
      alert("Please enter a valid item name and quantity greater than 0.");
      return;
    }

    const finalSupplier = formData.supplier === 'Other' ? (formData.customSupplier || 'Custom Supplier') : formData.supplier;

    const payload = {
      invoiceRef: formData.invoiceRef || `PO #${Date.now().toString().slice(-4)}`,
      supplier: finalSupplier,
      date: formData.date,
      notes: formData.notes,
      items: validItems
    };

    if (editingPurchase) {
      inventoryStore.updatePurchase(editingPurchase.id, payload);
      showToast(`Purchase ${editingPurchase.invoiceRef} updated & inventory re-synchronized!`);
    } else {
      inventoryStore.recordPurchase(payload);
      showToast(`Stock purchase ${payload.invoiceRef} recorded & stock updated!`);
    }

    setIsAddModalOpen(false);
  };

  const confirmDeletePurchase = () => {
    if (!deletingPurchaseId) return;
    const success = inventoryStore.deletePurchase(deletingPurchaseId);
    if (success) {
      showToast("Purchase record deleted & stock automatically reversed!");
    }
    setDeletingPurchaseId(null);
  };

  // Filter Purchases
  const filteredPurchases = storeState.purchases.filter(purchase => {
    const matchesSearch = 
      purchase.invoiceRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.items.some(i => i.itemName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All Categories' || purchase.category === selectedCategory || purchase.items.some(i => i.category === selectedCategory);

    let matchesTime = true;
    if (selectedTimeframe === 'Today') {
      const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      matchesTime = purchase.date === today;
    } else if (selectedTimeframe === 'This Week') {
      matchesTime = true; // demo simplicity
    } else if (selectedTimeframe === 'This Month') {
      matchesTime = true;
    }

    return matchesSearch && matchesCategory && matchesTime;
  });

  // Calculate dynamic stats
  const totalPurchaseValue = storeState.summary.totalPurchasesValue;
  const todayStockInUnits = storeState.summary.todayStockInUnits;
  const totalInvoicesCount = storeState.purchases.length;
  const totalReceivedItemsCount = storeState.purchases.reduce((acc, p) => acc + p.items.length, 0);

  // Export CSV function
  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Invoice Ref,Date,Supplier,Category,Item Name,Qty,Unit,Price Per Unit (Rs),Line Total (Rs),Notes\n";

    storeState.purchases.forEach(p => {
      p.items.forEach(item => {
        const row = [
          `"${p.invoiceRef}"`,
          `"${p.date}"`,
          `"${p.supplier}"`,
          `"${item.category || p.category}"`,
          `"${item.itemName}"`,
          item.qty,
          `"${item.unit}"`,
          item.pricePerUnit,
          item.total,
          `"${p.notes || ''}"`
        ].join(",");
        csvContent += row + "\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Kanchivaram_Cafe_Purchases_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3 font-sans relative pb-6 w-full">
      
      {/* Toast Notification Ticker */}
      {toastMessage && (
        <div className={`absolute top-3 right-6 z-50 ${isBrownBranch ? 'bg-[#3E2312] border-[#C69A4B]' : 'bg-[#0f3823] border-[#4ade80]'} text-white px-4 py-2.5 rounded-xl border shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce`}>
          <CheckCircle2 className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER SECTION */}
      {/* DESKTOP HEADER (MD+): 100% STRICTLY FROZEN */}
      <div className="hidden md:flex bg-[#ebdcc8] p-3.5 sm:p-4 rounded-2xl border border-[#cabb9e] shadow-xs flex-row items-center justify-between gap-3 shrink-0 relative overflow-hidden">
        {/* Left: Title & Description */}
        <div className="flex items-center gap-3 z-10">
          <div className={`p-2.5 rounded-xl shadow-md border shrink-0 ${
            isBrownBranch ? 'bg-[#542A16] border-[#7A4325]' : 'bg-[#0f3823] border-[#194c31]'
          }`}>
            <Truck className={`w-6 h-6 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black font-serif text-[#11291f]">
                Purchase & Stock In Management
              </h2>
              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${
                isBrownBranch ? 'bg-[#542A16] text-[#C69A4B] border-[#7A4325]' : 'bg-[#0f3823] text-[#4ade80] border-[#194c31]'
              }`}>
                Live Inventory Sync
              </span>
            </div>
            <p className="text-xs text-[#456351] font-bold mt-0.5">
              Record supplier purchases, track incoming inventory, & manage multi-item stock invoices.
            </p>
          </div>
        </div>

        {/* Right: Action Buttons + Purchase Illustration placed on far right */}
        <div className="flex items-center gap-3 sm:gap-4 z-10">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#11291f] text-xs font-bold rounded-xl border border-[#cabb9e] transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={openAddModal}
              className={`flex items-center gap-1.5 px-4 py-2 text-white text-xs font-black rounded-xl border transition-all cursor-pointer shadow-md ${
                isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]'
              }`}
            >
              <PlusCircle className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
              <span>Add Stock Purchase</span>
            </button>
          </div>

          {storeState.purchases.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <img
                src="/purchase_empty_illustration.png"
                alt="Purchase Stock Illustration"
                className="h-16 sm:h-20 max-h-20 w-auto object-contain drop-shadow-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* MOBILE HEADER (< MD): STRUCTURED CLEAN ARRANGEMENT WITH BALANCED CONTROLS & ILLUSTRATION */}
      <div className="md:hidden bg-[#ebdcc8] p-3 sm:p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-2.5 shrink-0 relative overflow-hidden">
        {/* Top row: Icon + Title & Sync Badge + Description + Illustration */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className={`p-2 rounded-xl shadow-md border shrink-0 mt-0.5 ${
              isBrownBranch ? 'bg-[#542A16] border-[#7A4325]' : 'bg-[#0f3823] border-[#194c31]'
            }`}>
              <Truck className={`w-4.5 h-4.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm min-[380px]:text-[15px] font-black font-serif text-[#11291f] leading-tight">
                  Purchase & Stock In Management
                </h2>
                <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-full border shrink-0 ${
                  isBrownBranch ? 'bg-[#542A16] text-[#C69A4B] border-[#7A4325]' : 'bg-[#0f3823] text-[#4ade80] border-[#194c31]'
                }`}>
                  Live Sync
                </span>
              </div>
              <p className="text-[10px] min-[380px]:text-[11px] text-[#456351] font-bold mt-0.5 leading-snug">
                Record supplier purchases & incoming stock invoices.
              </p>
            </div>
          </div>

          {/* Illustration placed neatly inside the header card */}
          {storeState.purchases.length > 0 && (
            <div className="flex items-center justify-center z-10 shrink-0">
              <img
                src="/purchase_empty_illustration.png"
                alt="Purchase Stock In Illustration"
                className="h-20 min-[380px]:h-24 sm:h-28 w-auto max-w-[125px] min-[380px]:max-w-[155px] object-contain drop-shadow-xs"
              />
            </div>
          )}
        </div>

        {/* Bottom row: Side-by-side action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#ebdcc8]/80">
          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#11291f] text-xs font-bold rounded-xl border border-[#cabb9e] transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-white text-xs font-black rounded-xl border transition-all cursor-pointer shadow-md ${
              isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]'
            }`}
          >
            <PlusCircle className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
            <span>Add Stock Purchase</span>
          </button>
        </div>
      </div>

      {/* TOP 4 METRIC SUMMARY CARDS WITH PASTEL BACKGROUNDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3 shrink-0">
        
        {/* Card 1: Total Purchase Value (Soft Pastel Green) */}
        <div className="bg-[#e2edd8] p-3 rounded-2xl border border-[#c5dbb4] shadow-xs flex items-center gap-3">
          <div className={`p-2.5 ${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white rounded-xl shadow-xs shrink-0`}>
            <DollarSign className={`w-5 h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#425a4c] uppercase tracking-wider">TOTAL PURCHASE VALUE</p>
            <h3 className="text-xl font-black text-[#11291f] font-mono mt-0.5 leading-none">
              ₹{totalPurchaseValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-[#425a4c] font-medium mt-1 leading-none">
              {totalInvoicesCount === 0 ? "No purchases yet" : "Cumulative stock investment"}
            </p>
          </div>
        </div>

        {/* Card 2: Today's Stock In (Soft Pastel Peach/Warm Beige) */}
        <div className="bg-[#fceee0] p-3 rounded-2xl border border-[#f5dac3] shadow-xs flex items-center gap-3">
          <div className={`p-2.5 ${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white rounded-xl shadow-xs shrink-0`}>
            <PackagePlus className={`w-5 h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#634e3d] uppercase tracking-wider">TODAY'S STOCK IN</p>
            <h3 className="text-xl font-black text-[#11291f] font-mono mt-0.5 leading-none">
              {todayStockInUnits} <span className="text-xs font-sans font-bold text-[#634e3d]">units</span>
            </h3>
            <p className="text-[11px] text-[#634e3d] font-medium mt-1 leading-none">
              {todayStockInUnits === 0 ? "Nothing received today" : `Received on ${storeState.summary.displayDate}`}
            </p>
          </div>
        </div>

        {/* Card 3: Purchase Invoices (Soft Pastel Sky Blue) */}
        <div className="bg-[#e0f0fe] p-3 rounded-2xl border border-[#c4e3fe] shadow-xs flex items-center gap-3">
          <div className={`p-2.5 ${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white rounded-xl shadow-xs shrink-0`}>
            <FileText className={`w-5 h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#395368] uppercase tracking-wider">PURCHASE INVOICES</p>
            <h3 className="text-xl font-black text-[#11291f] font-mono mt-0.5 leading-none">
              {totalInvoicesCount} <span className="text-xs font-sans font-bold text-[#395368]">invoices</span>
            </h3>
            <p className="text-[11px] text-[#395368] font-medium mt-1 leading-none">
              {totalInvoicesCount === 0 ? "No invoices recorded" : "Across all suppliers"}
            </p>
          </div>
        </div>

        {/* Card 4: Total Received Items (Soft Pastel Soft Pink) */}
        <div className="bg-[#fde2e4] p-3 rounded-2xl border border-[#f9c6cb] shadow-xs flex items-center gap-3">
          <div className={`p-2.5 ${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white rounded-xl shadow-xs shrink-0`}>
            <Package className={`w-5 h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#684146] uppercase tracking-wider">TOTAL RECEIVED ITEMS</p>
            <h3 className="text-xl font-black text-[#11291f] font-mono mt-0.5 leading-none">
              {totalReceivedItemsCount} <span className="text-xs font-sans font-bold text-[#684146]">items</span>
            </h3>
            <p className="text-[11px] text-[#684146] font-medium mt-1 leading-none">
              {totalReceivedItemsCount === 0 ? "No items received" : "Real-time stock calculated"}
            </p>
          </div>
        </div>

      </div>

      {/* MAIN CONTENT AREA: SEARCH, FILTERS & LEDGER TABLE */}
      <div className="flex-1 bg-[#fdfbf7] rounded-2xl border border-[#cabb9e] shadow-sm flex flex-col min-h-0 overflow-hidden">
        
        {/* CONTROL BAR: SEARCH & FILTERS */}
        <div className="p-3 border-b border-[#cabb9e] bg-[#fdfbf7] flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          
          {/* Real-Time Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice #, supplier, item..."
              className={`w-full pl-10 pr-4 py-1.5 bg-[#f0ebd9] border border-[#cabb9e] rounded-xl text-xs text-[#0f231a] placeholder-[#385344] focus:outline-none focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]/40' : 'focus:ring-[#0f3823]/40'} font-extrabold shadow-inner transition-all`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} hover:text-black rounded-full cursor-pointer`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Timeframe & Category Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            
            {/* Date Timeframe Pills */}
            <div className="flex items-center bg-[#ebdcc8]/40 p-1 rounded-xl border border-[#cabb9e]/60">
              {['All', 'Today', 'This Week', 'This Month'].map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTimeframe(time)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    selectedTimeframe === time 
                      ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs` 
                      : 'text-[#456351] hover:bg-[#ebdcc8]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-3 py-1.5 bg-[#fdfbf7] text-[#11291f] text-xs font-bold rounded-xl border border-[#cabb9e] focus:outline-none focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} cursor-pointer`}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

          </div>

        </div>

        {/* LEDGER CONTENT: DESKTOP TABLE (md+) & MOBILE STRUCTURED CARDS (<md) */}
        <div className="p-3 w-full">
          {/* DESKTOP TABLE: STRICTLY FROZEN & UNCHANGED (md:block) */}
          <div className="hidden md:block bg-[#fdfbf7] rounded-xl border border-[#cabb9e] overflow-hidden shadow-xs w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white text-[11px] font-extrabold uppercase tracking-wider grid grid-cols-12 gap-2 items-center`}>
                  <th className="py-3 px-4 col-span-2 whitespace-nowrap">DATE & INVOICE REF</th>
                  <th className="py-3 px-4 col-span-2 whitespace-nowrap">SUPPLIER</th>
                  <th className="py-3 px-4 col-span-3 whitespace-nowrap">PURCHASED ITEMS & QUANTITIES</th>
                  <th className="py-3 px-4 col-span-2 text-right whitespace-nowrap">TOTAL INVOICE VALUE</th>
                  <th className="py-3 px-4 col-span-2 text-center whitespace-nowrap">STOCK SYNC STATUS</th>
                  <th className="py-3 px-4 col-span-1 text-center whitespace-nowrap">ACTIONS</th>
                </tr>
              </thead>
              <tbody className={`text-xs ${filteredPurchases.length > 0 ? 'divide-y divide-[#f0e8dc]' : ''}`}>
                {filteredPurchases.length === 0 ? (
                  <tr className="w-full">
                    <td colSpan="6" className="py-8 px-4 text-center bg-[#fdfbf7] w-full block">
                      {/* Center Stock Box & Clipboard Illustration Asset (100% Transparent PNG) */}
                      <div className="relative w-full max-w-sm sm:max-w-md h-auto flex items-center justify-center mb-3 transition-transform hover:scale-102 mx-auto">
                        <img
                          src="/purchase_empty_illustration.png"
                          alt="Purchase Stock In Empty Illustration"
                          className="w-full h-auto max-h-56 sm:max-h-64 object-contain relative z-10 drop-shadow-md"
                        />
                      </div>
                      {/* Empty State Text */}
                      <div className="text-center space-y-1.5 relative z-10 max-w-md mx-auto">
                        <h3 className="text-xl sm:text-2xl font-serif font-black text-[#11291f] tracking-wide">
                          No purchase records yet!
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-[#547363] leading-relaxed">
                          Start by adding your first stock purchase to track incoming inventory and keep your stock updated automatically.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-[#fbf8f3] transition-colors grid grid-cols-12 gap-2 items-center">
                      {/* Date & Invoice */}
                      <td className="py-3 px-4 col-span-2 align-top">
                        <div className="font-extrabold text-[#11291f] font-mono">{purchase.invoiceRef}</div>
                        <div className="text-[11px] text-[#547363] font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className={`w-3 h-3 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
                          <span>{purchase.date}</span>
                        </div>
                        {purchase.notes && (
                          <div className="text-[10px] text-[#786c58] italic mt-1 bg-[#f8f6f0] p-1 rounded border border-[#e5d8c8]">
                            "{purchase.notes}"
                          </div>
                        )}
                      </td>
                      {/* Supplier */}
                      <td className="py-3 px-4 col-span-2 align-top">
                        <div className="font-bold text-[#11291f] flex items-center gap-1.5">
                          <Building2 className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} shrink-0`} />
                          <span>{purchase.supplier}</span>
                        </div>
                        <div className="text-[10px] text-[#547363] font-semibold mt-0.5">
                          Category: <span className="font-bold text-[#11291f]">{purchase.category || 'Raw Ingredients'}</span>
                        </div>
                      </td>
                      {/* Purchased Items List */}
                      <td className="py-3 px-4 col-span-3 align-top">
                        <div className="space-y-1.5">
                          {purchase.items.map((item, idx) => (
                            <div 
                              key={idx} 
                              className="bg-[#fbf8f3] p-1.5 rounded-lg border border-[#e5d8c8] flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Package className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} shrink-0`} />
                                <span className="font-extrabold text-[#11291f] truncate">{item.itemName}</span>
                                <span className="px-1.5 py-0.5 bg-[#ebdcc8] text-[#11291f] text-[9px] font-bold rounded">
                                  {item.category}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`font-extrabold ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} font-mono text-xs`}>
                                  +{item.qty} {item.unit}
                                </span>
                                <span className="text-[10px] text-[#547363] ml-2 font-mono">
                                  @ ₹{item.pricePerUnit}/{item.unit} = ₹{item.total.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      {/* Total Invoice Amount */}
                      <td className="py-3 px-4 col-span-2 align-top text-right">
                        <div className="font-black font-mono text-sm text-[#11291f]">
                          ₹{(purchase.totalAmount || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-[#456351] font-bold mt-0.5">
                          {purchase.items.length} item{purchase.items.length > 1 ? 's' : ''} total
                        </div>
                      </td>
                      {/* Stock Sync Status */}
                      <td className="py-3 px-4 col-span-2 align-top text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Synced</span>
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-4 col-span-1 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(purchase)}
                            title="Edit Purchase & Adjust Stock"
                            className="p-1.5 text-[#11291f] hover:bg-[#ebdcc8] rounded-lg transition-colors border border-transparent hover:border-[#cabb9e]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingPurchaseId(purchase.id)}
                            title="Delete Record & Reverse Stock"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
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

          {/* MOBILE STRUCTURED PURCHASE CARDS: DEDICATED ARRANGEMENT (<md) */}
          <div className="md:hidden space-y-3">
            {filteredPurchases.length === 0 ? (
              <div className="bg-[#fdfbf7] rounded-xl border border-[#cabb9e] p-6 text-center shadow-xs">
                <div className="relative w-full max-w-xs mx-auto mb-3">
                  <img
                    src="/purchase_empty_illustration.png"
                    alt="Purchase Stock In Empty Illustration"
                    className="w-full h-auto max-h-48 object-contain mx-auto drop-shadow-sm"
                  />
                </div>
                <h3 className="text-lg font-serif font-black text-[#11291f]">No purchase records yet!</h3>
                <p className="text-xs text-[#547363] mt-1 font-medium">
                  Add your first stock purchase to track incoming inventory.
                </p>
              </div>
            ) : (
              filteredPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-2.5"
                >
                  {/* Top: Invoice + Date + Supplier + Actions */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#ebdcc8] pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-[#11291f]">{purchase.invoiceRef}</span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-extrabold rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Synced
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-[#11291f] flex items-center gap-1 mt-1">
                        <Building2 className={`w-3 h-3 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
                        <span>{purchase.supplier}</span>
                      </div>
                      <div className="text-[10px] text-[#547363] font-medium flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#87a997]" />
                        <span>{purchase.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(purchase)}
                        className={`p-1.5 ${isBrownBranch ? 'bg-[#542A16] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'} rounded-lg shadow-xs`}
                        title="Edit Purchase"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingPurchaseId(purchase.id)}
                        className="p-1.5 text-red-600 bg-red-50 rounded-lg"
                        title="Delete Purchase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Purchased Items List */}
                  <div className="space-y-1.5">
                    <span className="text-[9.5px] uppercase font-bold text-[#547363] block">Purchased Items ({purchase.items.length})</span>
                    {purchase.items.map((item, idx) => (
                      <div key={idx} className="bg-[#ebdcc8]/30 p-2 rounded-xl border border-[#cabb9e]/50 flex items-center justify-between text-xs">
                        <div className="min-w-0">
                          <p className="font-extrabold text-[#11291f] truncate leading-tight">{item.itemName}</p>
                          <p className="text-[10px] text-[#547363] font-mono mt-0.5">@ ₹{item.pricePerUnit}/{item.unit}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-mono font-black ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`}>+{item.qty} {item.unit}</span>
                          <span className="text-[10.5px] font-mono font-bold text-[#11291f] block">₹{item.total.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Total */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#ebdcc8] text-xs">
                    <span className="font-bold text-[#547363]">Total Invoice Value</span>
                    <span className="font-mono font-black text-sm text-[#11291f]">₹{(purchase.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ADD / EDIT MULTI-ITEM PURCHASE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#fbf8f3] w-full max-w-3xl rounded-2xl border-2 border-[#cabb9e] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className={`${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white p-4 flex items-center justify-between shrink-0`}>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#d4af37]" />
                <h3 className="font-serif font-black text-base sm:text-lg">
                  {editingPurchase ? `Edit Stock Purchase (${editingPurchase.invoiceRef})` : 'Add New Stock Purchase / Invoice'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-[#194c31]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSavePurchase} className="p-4 space-y-4 overflow-y-auto flex-1">
              
              {/* Row 1: Invoice Ref, Date, Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e]">
                
                {/* Invoice Ref */}
                <div>
                  <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">
                    Invoice / PO Ref #
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceRef}
                    onChange={(e) => setFormData({ ...formData, invoiceRef: e.target.value })}
                    placeholder="e.g. PO-8806"
                    className="w-full px-3 py-1.5 bg-white text-[#11291f] text-xs font-bold font-mono rounded-lg border border-[#cabb9e] focus:outline-none focus:ring-2 focus:ring-[#0f3823]"
                  />
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. 09 Sep 2026"
                    className="w-full px-3 py-1.5 bg-white text-[#11291f] text-xs font-bold rounded-lg border border-[#cabb9e] focus:outline-none focus:ring-2 focus:ring-[#0f3823]"
                  />
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">
                    Supplier Name
                  </label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white text-[#11291f] text-xs font-bold rounded-lg border border-[#cabb9e] focus:outline-none focus:ring-2 focus:ring-[#0f3823] cursor-pointer"
                  >
                    {SUPPLIERS.map(sup => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                    <option value="Other">+ Custom Supplier...</option>
                  </select>
                </div>

              </div>

              {formData.supplier === 'Other' && (
                <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e]">
                  <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">
                    Specify Custom Supplier Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customSupplier}
                    onChange={(e) => setFormData({ ...formData, customSupplier: e.target.value })}
                    placeholder="Enter supplier company name"
                    className="w-full px-3 py-1.5 bg-white text-[#11291f] text-xs font-bold rounded-lg border border-[#cabb9e]"
                  />
                </div>
              )}

              {/* LINE ITEMS SECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-[#11291f] tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#0f3823]" />
                    <span>Purchased Items (Multi-Item Invoice Support)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className={`flex items-center gap-1 px-3 py-1 ${isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F]' : 'bg-[#0f3823] hover:bg-[#0a2618]'} text-white text-[11px] font-bold rounded-lg cursor-pointer shadow-xs`}
                  >
                    <Plus className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
                    <span>+ Add Another Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                  {formData.items.map((line, idx) => {
                    const lineTotal = (parseFloat(line.qty) || 0) * (parseFloat(line.pricePerUnit) || 0);
                    return (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-[#cabb9e] shadow-xs space-y-2">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          
                          {/* Item Selector / Custom Name */}
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] font-bold text-[#547363] mb-0.5">Item Name</label>
                            <select
                              value={line.itemName || line.itemId}
                              onChange={(e) => handleItemSelect(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#fbf8f3] text-[#11291f] text-xs font-bold rounded-lg border border-[#cabb9e]"
                            >
                              {storeState.items.length > 0 && (
                                <optgroup label="Active Inventory Items">
                                  {storeState.items.map(i => (
                                    <option key={i.id} value={i.name}>{i.name} ({i.unit})</option>
                                  ))}
                                </optgroup>
                              )}
                              <optgroup label="Standard Café Catalog">
                                {STANDARD_INVENTORY_ITEMS.map(i => (
                                  <option key={i.id} value={i.name}>{i.name} ({i.unit})</option>
                                ))}
                              </optgroup>
                            </select>
                          </div>

                          {/* Category */}
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-[#547363] mb-0.5">Category</label>
                            <select
                              value={line.category}
                              onChange={(e) => handleLineItemChange(idx, 'category', e.target.value)}
                              className="w-full px-2 py-1.5 bg-[#fbf8f3] text-[#11291f] text-xs font-bold rounded-lg border border-[#cabb9e]"
                            >
                              {CATEGORIES.filter(c => c !== 'All Categories').map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity */}
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-[#547363] mb-0.5">Qty</label>
                            <input
                              type="number"
                              step="any"
                              min="0.1"
                              required
                              value={line.qty}
                              onChange={(e) => handleLineItemChange(idx, 'qty', e.target.value)}
                              placeholder="e.g. 20"
                              className="w-full px-2 py-1.5 bg-[#fbf8f3] text-[#11291f] text-xs font-bold font-mono rounded-lg border border-[#cabb9e]"
                            />
                          </div>

                          {/* Unit */}
                          <div className="sm:col-span-1">
                            <label className="block text-[10px] font-bold text-[#547363] mb-0.5">Unit</label>
                            <select
                              value={line.unit}
                              onChange={(e) => handleLineItemChange(idx, 'unit', e.target.value)}
                              className="w-full px-1.5 py-1.5 bg-[#fbf8f3] text-[#11291f] text-[11px] font-bold rounded-lg border border-[#cabb9e]"
                            >
                              <option value="kg">kg</option>
                              <option value="L">L</option>
                              <option value="cups">cups</option>
                              <option value="plates">plates</option>
                              <option value="bottles">bottles</option>
                              <option value="pieces">pieces</option>
                              <option value="packs">packs</option>
                            </select>
                          </div>

                          {/* Unit Price (Rs) */}
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-[#547363] mb-0.5">Price/Unit (₹)</label>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              required
                              value={line.pricePerUnit}
                              onChange={(e) => handleLineItemChange(idx, 'pricePerUnit', e.target.value)}
                              placeholder="Cost"
                              className="w-full px-2 py-1.5 bg-[#fbf8f3] text-[#11291f] text-xs font-bold font-mono rounded-lg border border-[#cabb9e]"
                            />
                          </div>

                          {/* Delete Row */}
                          <div className="sm:col-span-1 flex justify-center pt-3 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => removeLineItem(idx)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>

                        {/* Calculated Line Subtotal */}
                        <div className="text-right text-[11px] text-[#456351] font-bold border-t border-[#f0e8dc] pt-1">
                          Line Subtotal: <span className="font-mono text-[#11291f] font-black">₹{lineTotal.toLocaleString('en-IN')}</span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <label className="block text-[11px] font-extrabold text-[#11291f] mb-1">
                  Purchase / Stock In Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Batch #4B delivery, verified quality"
                  className="w-full px-3 py-1.5 bg-white text-[#11291f] text-xs font-bold rounded-lg border border-[#cabb9e]"
                />
              </div>

              {/* Total Calculation Banner */}
              <div className={`${isBrownBranch ? 'bg-[#3E2312] border-[#7A4325]' : 'bg-[#0f3823] border-[#194c31]'} text-white p-3.5 rounded-xl border flex items-center justify-between`}>
                <div>
                  <span className="text-xs text-[#a3c7b5] font-bold">Total Invoice Purchase Amount</span>
                  <p className={`text-[10px] ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'} font-bold`}>Auto-calculated sum of all line items</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-[#d4af37]">
                    ₹{calculateGrandTotal().toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5d8c8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#11291f] text-xs font-bold rounded-xl border border-[#cabb9e]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`px-5 py-2 ${isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]'} text-white text-xs font-black rounded-xl border shadow-md flex items-center gap-1.5`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
                  <span>{editingPurchase ? 'Update & Re-sync Stock' : 'Save & Update Real-Time Inventory'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL WITH SAFE STOCK REVERSAL */}
      {deletingPurchaseId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fbf8f3] max-w-md w-full p-5 rounded-2xl border-2 border-[#cabb9e] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="p-2.5 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-[#11291f]">Confirm Purchase Deletion</h3>
                <p className="text-xs text-[#547363] font-bold">Safe Reversal Protocol Enabled</p>
              </div>
            </div>

            <p className="text-xs text-[#11291f] bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed font-medium">
              Deleting this purchase record will <strong>automatically subtract and reverse</strong> the incoming stock quantities from the main Inventory system and Home Dashboard metrics.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingPurchaseId(null)}
                className="px-4 py-2 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#11291f] text-xs font-bold rounded-xl border border-[#cabb9e]"
              >
                Cancel Keep Record
              </button>
              <button
                onClick={confirmDeletePurchase}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-black rounded-xl border border-red-800 shadow-md flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Delete & Reverse Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
