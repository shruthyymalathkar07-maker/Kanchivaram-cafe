import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  Smartphone, 
  CheckCircle, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Coffee, 
  ShoppingBag,
  Sparkles,
  X,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { createSaleTransaction } from '../services/api';
import { PrintService } from '../services/printService';
import { inventoryStore } from '../services/inventoryStore';
import { PRODUCT_CATEGORIES, CLIENT_PRODUCTS_MASTER } from '../data/masterData';

export default function POSBillingView({ products = [], categories = [], onSaleCompleted, searchQuery = '', onSearchChange, selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, UPI, CARD
  
  // Checkout & Customer State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPrintPaperChecked, setIsPrintPaperChecked] = useState(true);
  const [isSendSmsChecked, setIsSendSmsChecked] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [saveCustomer, setSaveCustomer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // Quick Action States
  const [heldBills, setHeldBills] = useState([]);
  const [isHeldBillsOpen, setIsHeldBillsOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [orderNote, setOrderNote] = useState('');

  const fallbackCategories = categories.length > 0 ? categories : PRODUCT_CATEGORIES;
  const fallbackProducts = products.length > 0 ? products : CLIENT_PRODUCTS_MASTER;

  // Filter products by category & search query
  const filteredProducts = fallbackProducts.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setOrderNote('');
  };

  // Quick Action Handlers
  const handleHoldBill = () => {
    if (cart.length === 0) {
      alert("Cart is currently empty. Add items to hold a bill.");
      return;
    }
    const newHold = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      cart: [...cart],
      subtotal,
      grandTotal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHeldBills(prev => [...prev, newHold]);
    setCart([]);
    setDiscountAmount(0);
    setOrderNote('');
    alert(`Bill ${newHold.id} saved to Hold list.`);
  };

  const handleRestoreHeldBill = (heldItem) => {
    setCart(heldItem.cart);
    setHeldBills(prev => prev.filter(h => h.id !== heldItem.id));
    setIsHeldBillsOpen(false);
  };

  const handleApplyDiscountPrompt = () => {
    const input = prompt("Enter Discount Amount (in ₹):", discountAmount);
    if (input !== null) {
      const val = parseFloat(input) || 0;
      setDiscountAmount(val);
    }
  };

  const handleAddNotePrompt = () => {
    const input = prompt("Add Order Note / Special Instructions:", orderNote);
    if (input !== null) {
      setOrderNote(input);
    }
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxRate = 0.05; // 5% GST
  const tax = subtotal * taxRate;
  const grandTotal = Math.max(0, subtotal + tax - discountAmount);

  // Finalize Sale
  const handleCompleteSale = async () => {
    if (cart.length === 0 || isSubmitting) return;

    if (isSendSmsChecked && !phoneInput.trim()) {
      alert("Please enter customer's mobile number to send the SMS digital bill.");
      return;
    }

    setIsSubmitting(true);

    const salePayload = {
      items: cart,
      subtotal,
      tax,
      discount: discountAmount,
      grandTotal,
      paymentMethod,
      isPrintPaper: isPrintPaperChecked,
      isSendSms: isSendSmsChecked,
      customerName: customerName.trim() || null,
      customerPhone: phoneInput.trim() || null,
      orderNote,
      cashierName: 'Shruthy',
      channel: 'POS'
    };

    try {
      // 1. Send transaction to backend API if available
      const response = await createSaleTransaction(salePayload);
      const billNumber = response?.sale?.billNumber || `KC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Record Completed Bill in centralized inventoryStore (Updates Sales, Stock Out, and Customers if details provided)
      const completedSaleObj = inventoryStore.recordCompletedBill({
        ...salePayload,
        billNumber
      });

      setCompletedSale(completedSaleObj);

      // 3. Print Paper Receipt if checked
      if (isPrintPaperChecked) {
        PrintService.printPaperReceipt(completedSaleObj);
      }

      // 4. Send SMS Digital Receipt if checked and phone number provided
      if (isSendSmsChecked && phoneInput.trim()) {
        await PrintService.sendPaperlessReceipt(completedSaleObj, phoneInput.trim());
      }

      if (onSaleCompleted) onSaleCompleted(completedSaleObj);

    } catch (err) {
      console.error('[POS] Billing error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetOrder = () => {
    setCart([]);
    setDiscountAmount(0);
    setCustomerName('');
    setPhoneInput('');
    setOrderNote('');
    setSaveCustomer(false);
    setPaymentMethod('CASH');
    setIsCheckoutOpen(false);
    setIsMobileCartOpen(false);
    setCompletedSale(null);
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col space-y-2 h-full overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. POS PAGE HEADER BANNER IN WARM CREAM WITH INTEGRATED ILLUSTRATION      */}
      {/* ========================================================================= */}
      <div className="bg-[#ebdcc8] text-[#122c20] rounded-2xl p-2.5 sm:p-3.5 px-3 sm:px-4 border border-[#cabb9e] shadow-sm flex flex-row items-center justify-between gap-2 sm:gap-3 shrink-0 relative overflow-hidden">
        
        {/* Left Side: Coffee Cup Accent & Header Titles */}
        <div className="flex items-center gap-2 sm:gap-3 z-10 py-0.5 min-w-0 flex-1">
          <div className={`p-1.5 sm:p-2.5 ${isBrownBranch ? 'bg-[#3E2312] border-[#542A16]' : 'bg-[#0f3823] border-[#194c31]'} text-white rounded-xl shadow-md border shrink-0`}>
            <Coffee className={`w-4 h-4 sm:w-5 sm:h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm min-[380px]:text-base sm:text-lg font-serif font-black text-[#11291f] leading-tight whitespace-nowrap">
              POS / Billing
            </h2>
            <p className="text-[10.5px] min-[380px]:text-[11.5px] sm:text-xs text-[#456351] font-bold mt-0.5 leading-tight">
              <span className="inline-block whitespace-nowrap">Serve Goodness.</span>{' '}
              <span className="inline-block whitespace-nowrap">Bill Smarter.</span>
            </p>
          </div>
        </div>

        {/* Right Side: Header POS Billing Illustration */}
        <div className="flex items-center justify-end z-10 shrink-0 -my-2.5 sm:-my-3.5 -mr-3 sm:-mr-4.5 pr-0 overflow-hidden">
          <img
            src="/pos_billing_illustration.png"
            alt="POS / Billing Header Illustration"
            className="h-12 min-[360px]:h-14 min-[390px]:h-16 sm:h-24 md:h-28 max-h-28 w-auto object-contain object-right drop-shadow-xs"
          />
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. POS SEARCH BAR (Directly below POS Banner)                             */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-md sm:max-w-lg shrink-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f3823]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Search items, categories..."
          className="w-full pl-10 pr-24 py-1.5 bg-[#f0ebd9] border border-[#cabb9e] rounded-xl text-xs text-[#0f231a] placeholder-[#385344] focus:outline-none focus:ring-2 focus:ring-[#0f3823]/40 font-extrabold shadow-inner transition-all"
        />
        {searchQuery ? (
          <button 
            onClick={() => onSearchChange && onSearchChange('')}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-[#0f3823] hover:text-black rounded-full cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#e8e0cc] border border-[#ded4c5] rounded-md text-[10px] font-mono text-[#3d5747] font-extrabold select-none pointer-events-none">
          Ctrl + K
        </kbd>
      </div>

      {/* ========================================================================= */}
      {/* 3. CATEGORY FILTER BAR (Single-line horizontal pills)                      */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-2 shrink-0 py-0.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
          {fallbackCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? isBrownBranch ? 'bg-[#542A16] text-white ring-1 ring-[#C69A4B]/60 shadow-md font-extrabold' : 'bg-[#0f3823] text-white ring-1 ring-[#d4af37]/60 shadow-md font-extrabold'
                    : 'bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] border border-[#cabb9e]'
                }`}
              >
                <span>{cat.icon || '☕'}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN POS WORKSPACE: 3-PART LAYOUT (Product 65–70% | Cart 30–35%)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden">
        
        {/* LEFT / CENTER PRODUCT GRID & QUICK ACTIONS (LG: 8 Cols / ~65%) */}
        <div className="lg:col-span-8 flex flex-col overflow-hidden space-y-2">
          
          {/* Products Grid: 4 Columns x 3 Rows on Desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 content-start flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[460px]">
            {filteredProducts.map((product) => {
              const stockQty = product.stockQuantity || 20;
              const stockColor = stockQty > 20 ? 'bg-emerald-600' : stockQty >= 10 ? 'bg-amber-500' : 'bg-red-600';
              const stockPercent = Math.min(100, Math.max(10, (stockQty / 50) * 100));

              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group relative bg-[#fdfbf7] hover:bg-[#f5ebd9] p-2 rounded-xl border border-[#cabb9e] hover:border-[#d4af37] shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between transform hover:-translate-y-0.5 h-[148px]"
                >
                  {/* Food/Product Image */}
                  <div className="relative w-full h-20 rounded-lg overflow-hidden bg-[#ebdcc8]">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#0f3823]/85 backdrop-blur-xs text-white text-[8.5px] font-bold rounded">
                      {product.categoryName}
                    </span>
                    <button className="absolute top-1 right-1 p-1 bg-[#0f3823] group-hover:bg-[#d4af37] text-white group-hover:text-[#0d2b1d] rounded-md transition-all shadow-xs">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Title & Price */}
                  <div className="pt-1">
                    <h4 className="text-[11px] font-extrabold text-[#11291f] line-clamp-1 group-hover:text-[#0f3823] leading-tight">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-xs font-black text-[#0f3823] font-mono">₹{product.price.toFixed(2)}</span>
                      <span className="text-[9px] font-bold text-[#557361]">{product.servingQty} {product.uom}</span>
                    </div>

                    {/* Stock Progress Indicator */}
                    <div className="w-full bg-[#e5dac8] h-1 rounded-full overflow-hidden mt-1">
                      <div className={`h-full rounded-full ${stockColor}`} style={{ width: `${stockPercent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions Row & Bottom Decorative Quote */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 shrink-0 border-t border-[#cabb9e]/60">
            
            {/* Quick Actions Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#11291f] uppercase tracking-wider pr-1">Quick Actions</span>
              <button 
                onClick={handleHoldBill}
                className="px-3 py-1 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full border border-[#cabb9e] shadow-2xs transition-all cursor-pointer"
              >
                Hold Bill ({heldBills.length})
              </button>

              <button 
                onClick={() => setIsHeldBillsOpen(true)}
                className="px-3 py-1 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full border border-[#cabb9e] shadow-2xs transition-all cursor-pointer"
              >
                Recall Bill
              </button>

              <button 
                onClick={handleApplyDiscountPrompt}
                className="px-3 py-1 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full border border-[#cabb9e] shadow-2xs transition-all cursor-pointer"
              >
                Apply Discount
              </button>

              <button 
                onClick={handleAddNotePrompt}
                className="px-3 py-1 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full border border-[#cabb9e] shadow-2xs transition-all cursor-pointer"
              >
                Add Note {orderNote ? '✓' : ''}
              </button>
            </div>

            {/* Bottom Decorative Quote */}
            <div className="hidden sm:flex items-center gap-1.5 text-right">
              <p className="font-serif italic text-xs text-[#3d2b16] font-bold">
                “ Brewing Success Together ”
              </p>
              <div className="w-3.5 h-3.5 opacity-70">
                <svg viewBox="0 0 50 50" fill="none" className="w-full h-full">
                  <path d="M 6 42 C 6 18, 30 6, 42 6 C 42 30, 30 42, 6 42 Z" fill="#2e7d32" />
                </svg>
              </div>
            </div>

          </div>

          {/* MOBILE FLOATING CART BAR (Visible on < lg screens when cart has items) */}
          {cart.length > 0 && (
            <div className="lg:hidden sticky bottom-1 z-30 pt-1">
              <button
                type="button"
                onClick={() => setIsMobileCartOpen(true)}
                className={`w-full py-2.5 px-4 rounded-2xl flex items-center justify-between text-white font-black text-xs shadow-xl border cursor-pointer transition-all ${
                  isBrownBranch 
                    ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' 
                    : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white/15 rounded-lg">
                    <ShoppingBag className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
                  </div>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} Items in Cart</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-black text-[#d4af37]">₹{grandTotal.toFixed(2)}</span>
                  <span className="text-[11px] underline font-sans">View & Checkout →</span>
                </div>
              </button>
            </div>
          )}

        </div>

        {/* RIGHT / BILL AREA: PERMANENT FIXED CURRENT CART ON DESKTOP, SLIDE-UP DRAWER ON MOBILE */}
        <div className={`bg-[#fdfbf7] rounded-2xl p-3.5 border border-[#cabb9e] shadow-lg flex flex-col justify-between overflow-hidden transition-all ${
          isMobileCartOpen 
            ? 'fixed inset-0 z-50 p-4 pt-safe pb-safe overflow-y-auto bg-[#fdfbf7] rounded-none sm:rounded-2xl sm:inset-4' 
            : 'hidden lg:flex lg:col-span-4 h-full'
        }`}>
          
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#cabb9e]">
            <div className="flex items-center gap-2">
              {isMobileCartOpen && (
                <button
                  type="button"
                  onClick={() => setIsMobileCartOpen(false)}
                  className="lg:hidden p-1.5 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#11291f] rounded-lg border border-[#cabb9e] mr-1 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Menu</span>
                </button>
              )}
              <span className={`p-1.5 ${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white rounded-lg`}>
                <ShoppingBag className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
              </span>
              <div>
                <h3 className="text-xs font-black text-[#11291f] font-serif uppercase tracking-wider">Current Cart</h3>
                <p className="text-[10px] text-[#557361] font-bold">{cart.length} items selected</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-red-700 hover:text-red-900 font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
              {isMobileCartOpen && (
                <button
                  type="button"
                  onClick={() => setIsMobileCartOpen(false)}
                  className="lg:hidden p-1 text-[#557361] hover:text-black rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar my-2 space-y-1.5 max-h-[220px] pr-1">
            {cart.length === 0 ? (
              <div className="py-10 text-center text-[#557361] space-y-1">
                <Coffee className="w-8 h-8 mx-auto text-[#0f3823]/30" />
                <p className="font-extrabold text-[#11291f] text-xs">Cart is empty</p>
                <p className="text-[10px]">Click products on the left to add items</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#f4ebd9] p-2 rounded-xl border border-[#ded4c5] flex items-center justify-between gap-2 shadow-2xs"
                >
                  <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover bg-[#ebdcc8]" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[11px] font-extrabold text-[#11291f] truncate leading-tight">{item.name}</h5>
                    <p className="text-[10px] text-[#557361] font-mono">
                      ₹{item.price} × {item.quantity} = <strong className="text-[#0f3823]">₹{(item.price * item.quantity).toFixed(2)}</strong>
                    </p>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex items-center gap-1 bg-[#ebe0cb] p-0.5 rounded-lg border border-[#cabb9e]">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-[#d4af37]/20 text-red-700 rounded transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black text-[#11291f] font-mono min-w-[14px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:bg-[#d4af37]/20 text-[#0f3823] rounded transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-red-700 hover:text-red-900 transition-colors cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Bill Summary Box */}
          <div className="bg-[#f4ebd9] p-2.5 rounded-xl border border-[#ded4c5] space-y-1 text-xs text-[#456351]">
            <div className="flex justify-between font-bold">
              <span>Subtotal</span>
              <span className="text-[#11291f] font-mono">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>GST (5%)</span>
              <span className="text-[#11291f] font-mono">₹{tax.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-700 font-bold">
                <span>Discount</span>
                <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center bg-[#ebdcc8] p-2 rounded-lg border border-[#d4af37] text-sm font-black text-[#11291f] mt-1">
              <span>Grand Total</span>
              <span className="text-[#0f3823] font-mono text-base font-black">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Bill to Customer Section */}
          <div className="space-y-1.5 pt-2 border-t border-[#cabb9e]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#11291f] uppercase tracking-wider">Bill to Customer</span>
              
              {/* Independent Receipt Options: Print Bill / Send via SMS — mutually exclusive */}
              <div className="flex items-center gap-1 bg-[#ebe0cb] p-0.5 rounded-lg border border-[#cabb9e]">
                <button
                  type="button"
                  onClick={() => { setIsPrintPaperChecked(true); setIsSendSmsChecked(false); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isPrintPaperChecked
                      ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-2xs`
                      : 'text-[#557361]'
                  }`}
                >
                  <Printer className="w-3 h-3" />
                  Print Bill
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSendSmsChecked(true); setIsPrintPaperChecked(false); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isSendSmsChecked
                      ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-2xs`
                      : 'text-[#557361]'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  Send via SMS
                </button>
              </div>
            </div>

            {/* Customer Name Input (Above Mobile Number for record purpose) */}
            <div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name (e.g. Shruthy A)"
                className="w-full px-2.5 py-1 bg-white border border-[#cabb9e] rounded-lg text-xs text-[#11291f] placeholder-[#87a997] focus:outline-none focus:ring-1 focus:ring-[#0f3823] font-bold"
              />
            </div>

            {/* Customer Phone Input */}
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-1 bg-[#ebe0cb] border border-[#cabb9e] rounded-lg text-xs font-mono font-bold text-[#122c20]">
                +91
              </span>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Customer mobile number"
                className="w-full px-2.5 py-1 bg-white border border-[#cabb9e] rounded-lg text-xs text-[#11291f] placeholder-[#87a997] focus:outline-none focus:ring-1 focus:ring-[#0f3823] font-mono font-bold"
              />
            </div>

            {/* Save Number Checkbox */}
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#456351] cursor-pointer">
              <input
                type="checkbox"
                checked={saveCustomer}
                onChange={(e) => setSaveCustomer(e.target.checked)}
                className="rounded text-[#0f3823] focus:ring-[#0f3823]"
              />
              <span>Save number for future orders</span>
            </label>
          </div>

          {/* Payment Method Bar: ONE horizontal payment bar */}
          <div className="pt-2">
            <div className={`grid grid-cols-3 p-1 rounded-xl border border-[#d4af37]/60 shadow-md divide-x ${
              isBrownBranch ? 'bg-[#3E2312] divide-[#542A16]' : 'bg-[#0f3823] divide-[#194c31]'
            }`}>
              {[
                { id: 'CASH', label: 'CASH', icon: Banknote },
                { id: 'UPI', label: 'UPI', icon: QrCode },
                { id: 'CARD', label: 'CARD', icon: CreditCard }
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center justify-center gap-1 py-1.5 text-xs font-black transition-all cursor-pointer ${
                      isSelected ? 'bg-[#d4af37] text-[#0d2b1d] rounded-lg shadow-sm font-black' : 'text-white hover:text-[#C69A4B]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Pay Action Button */}
            <button
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleCompleteSale}
              className={`w-full mt-2 py-2.5 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border ${
                isBrownBranch 
                  ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' 
                  : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'
              }`}
            >
              <Printer className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
              <span>PAY & COMPLETE BILL (₹{grandTotal.toFixed(2)})</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* RECALL HELD BILLS MODAL                                                   */}
      {/* ========================================================================= */}
      {isHeldBillsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fdfbf7] border-2 border-[#d4af37] rounded-2xl p-5 max-w-md w-full text-[#11291f] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#cabb9e]">
              <h3 className="font-serif font-black text-sm text-[#0f3823] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#d4af37]" /> Recall Held Bills ({heldBills.length})
              </h3>
              <button onClick={() => setIsHeldBillsOpen(false)} className="p-1 text-[#557361] hover:text-[#11291f]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {heldBills.length === 0 ? (
                <p className="text-xs text-center text-[#557361] py-6 font-bold">No held bills found.</p>
              ) : (
                heldBills.map(item => (
                  <div key={item.id} className="p-3 bg-[#f4ebd9] rounded-xl border border-[#ded4c5] flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-xs text-[#0f3823]">{item.id}</span>
                      <p className="text-[10px] text-[#557361] font-bold">{item.cart.length} items • {item.time}</p>
                      <p className="text-xs font-black text-[#11291f] font-mono">₹{item.grandTotal.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleRestoreHeldBill(item)}
                      className="px-3 py-1.5 bg-[#0f3823] text-white text-xs font-extrabold rounded-lg hover:bg-[#15422e]"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BILL COMPLETED SUCCESS OVERLAY MODAL                                      */}
      {/* ========================================================================= */}
      {completedSale && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetOrder();
            }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn"
        >
          <div className="relative bg-[#fdfbf7] border-2 border-[#d4af37] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resetOrder();
              }}
              className="absolute top-3.5 right-3.5 p-1.5 text-[#557361] hover:text-[#11291f] hover:bg-[#ebdcc8] rounded-full transition-colors cursor-pointer"
              title="Close & Next Order"
            >
              <X className="w-4 h-4" />
            </button>

            <CheckCircle className="w-12 h-12 text-emerald-700 mx-auto animate-bounce" />
            <h3 className="text-lg font-serif font-black text-[#0f3823]">Bill Completed Successfully!</h3>
            <div className="p-3 bg-[#f4ebd9] rounded-xl text-left space-y-1 text-xs text-[#456351]">
              <p>Invoice #: <strong className="text-[#11291f] font-mono">{completedSale.billNumber}</strong></p>
              <p>Total Paid: <strong className="text-[#0f3823] font-mono">₹{completedSale.grandTotal?.toFixed(2)}</strong></p>
              <p>Payment Mode: <strong className="text-[#11291f]">{completedSale.paymentMethod}</strong></p>
              <p>Receipt Mode: <strong className="text-[#11291f]">{completedSale.receiptType}</strong></p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resetOrder();
              }}
              className={`w-full py-3.5 ${
                isBrownBranch ? 'bg-[#3E2312] hover:bg-[#542A16]' : 'bg-[#0f3823] hover:bg-[#15422e]'
              } text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all`}
            >
              <span>Go to Next Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
