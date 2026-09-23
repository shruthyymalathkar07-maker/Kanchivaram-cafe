import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Award, 
  ShoppingBag, 
  X, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Calendar,
  Receipt,
  Clock,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { inventoryStore } from '../services/inventoryStore';

export default function CustomersView({ selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  const [customers, setCustomers] = useState(() => inventoryStore.getState().customers || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, VIP, FREQUENT, REGULAR
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Subscribe to real-time store changes from POS sales / inventory store
  useEffect(() => {
    setCustomers(inventoryStore.getState().customers || []);
    const unsubscribe = inventoryStore.subscribe(state => {
      setCustomers(state.customers || []);
      // Refresh selected customer history if modal is open
      if (selectedCustomerForHistory) {
        const updatedSelected = (state.customers || []).find(c => c.id === selectedCustomerForHistory.id);
        if (updatedSelected) {
          setSelectedCustomerForHistory(updatedSelected);
        }
      }
    });
    return () => unsubscribe();
  }, [selectedCustomerForHistory]);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.phone || '').includes(searchQuery);
    const matchesFilter = 
      selectedFilter === 'ALL' || 
      (selectedFilter === 'VIP' && c.tier?.includes('VIP')) ||
      (selectedFilter === 'FREQUENT' && c.tier === 'Frequent') ||
      (selectedFilter === 'REGULAR' && c.tier === 'Regular');

    return matchesSearch && matchesFilter;
  });

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const formattedPhone = newPhone.trim().startsWith('+91') ? newPhone.trim() : `+91 ${newPhone.trim()}`;
    const newCust = {
      id: `c-${Date.now()}`,
      name: newName.trim(),
      phone: formattedPhone,
      email: newEmail.trim() || 'Not specified',
      visits: 0,
      totalSpent: 0,
      lastVisit: 'No purchases yet',
      tier: 'Regular',
      favoriteItem: 'None',
      purchaseHistory: []
    };

    inventoryStore.customers.unshift(newCust);
    inventoryStore.notify();

    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setIsAddModalOpen(false);
  };

  const handleDeleteCustomer = (id, e) => {
    if (e) e.stopPropagation();
    inventoryStore.customers = inventoryStore.customers.filter(c => c.id !== id);
    inventoryStore.notify();
    if (selectedCustomerForHistory?.id === id) {
      setSelectedCustomerForHistory(null);
    }
  };

  return (
    <div className="space-y-3 font-sans relative pb-6 w-full">
      
      {/* 1. CUSTOMER PAGE HEADER */}
      {/* DESKTOP HEADER (MD+): 100% STRICTLY FROZEN */}
      <div className="hidden md:flex bg-[#ebdcc8] p-3.5 sm:p-4 rounded-2xl border border-[#cabb9e] shadow-xs flex-row items-center justify-between gap-3 shrink-0 relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
          <div className={`p-2.5 rounded-xl shadow-md border shrink-0 ${
            isBrownBranch ? 'bg-[#542A16] text-white border-[#7A4325]' : 'bg-[#0f3823] text-white border-[#194c31]'
          }`}>
            <Users className={`w-6 h-6 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-[#11291f]">
              Customer Directory & Records
            </h2>
            <p className="text-xs text-[#456351] font-bold mt-0.5">
              Manage customer profiles, contact info, and purchase history.
            </p>
          </div>
        </div>

        {customers.length > 0 && (
          <div className="flex items-center gap-2 z-10 text-right shrink-0 -my-3.5 sm:-my-4 pr-1">
            <img
              src="/customer_empty_illustration.png"
              alt="Customer Directory Decorative Illustration"
              className="h-28 sm:h-32 md:h-36 max-h-36 w-auto object-contain object-top drop-shadow-md transition-transform hover:scale-102"
            />
          </div>
        )}
      </div>

      {/* MOBILE HEADER (< MD): CLEAN STRUCTURED ARRANGEMENT */}
      <div className="md:hidden bg-[#ebdcc8] p-3 sm:p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs flex items-center justify-between gap-2.5 shrink-0 relative overflow-hidden">
        <div className="flex items-start gap-2.5 z-10 min-w-0 flex-1">
          <div className={`p-2 rounded-xl shadow-md border shrink-0 mt-0.5 ${
            isBrownBranch ? 'bg-[#542A16] text-white border-[#7A4325]' : 'bg-[#0f3823] text-white border-[#194c31]'
          }`}>
            <Users className={`w-4.5 h-4.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm min-[380px]:text-[15px] font-black font-serif text-[#11291f] leading-tight">
              Customer Directory & Records
            </h2>
            <p className="text-[10px] min-[380px]:text-[11px] text-[#456351] font-bold mt-0.5 leading-snug">
              Manage customer profiles, contact info, & bills.
            </p>
          </div>
        </div>

        {customers.length > 0 && (
          <div className="flex items-start justify-center z-10 shrink-0 -my-3 sm:-my-3.5 self-stretch">
            <img
              src="/customer_empty_illustration.png"
              alt="Customer Directory Decorative Illustration"
              className="h-20 min-[380px]:h-24 sm:h-28 w-auto max-w-[125px] min-[380px]:max-w-[155px] object-contain object-top drop-shadow-xs"
            />
          </div>
        )}
      </div>

      {/* 2. SEARCH + ADD CUSTOMER BUTTON + CUSTOMER FILTERS CONTROL BAR */}
      <div className="bg-[#fdfbf7] p-2.5 rounded-2xl border border-[#cabb9e] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
        
        {/* Left: Large Search Bar */}
        <div className="relative w-full md:w-[360px] max-w-full">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isBrownBranch ? 'text-[#542A16]' : 'text-[#0f3823]'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or phone..."
            className="w-full pl-10 pr-4 py-1.5 bg-[#f0ebd9] border border-[#cabb9e] rounded-xl text-xs text-[#0f231a] placeholder-[#385344] focus:outline-none focus:ring-2 focus:ring-[#0f3823]/40 font-extrabold shadow-inner transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0f3823] hover:text-black rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center: Add New Customer Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 text-white text-xs font-black rounded-xl border transition-all cursor-pointer shadow-md shrink-0 w-full md:w-auto ${
            isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]'
          }`}
        >
          <Plus className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          <span>Add New Customer</span>
        </button>

        {/* Right: Classification Filters */}
        <div className="flex items-center bg-[#ebdcc8]/40 p-1 rounded-xl border border-[#cabb9e]/60 shrink-0 w-full md:w-auto justify-center md:justify-end">
          {['ALL', 'VIP', 'FREQUENT', 'REGULAR'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedFilter === filter
                  ? isBrownBranch ? 'bg-[#542A16] text-white shadow-xs' : 'bg-[#0f3823] text-white shadow-xs'
                  : 'text-[#456351] hover:bg-[#ebdcc8]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

      </div>

      {/* 3. CUSTOMER DATA: DESKTOP TABLE (md+) & MOBILE STRUCTURED CARDS (<md) */}
      <div className="w-full">
        {/* DESKTOP TABLE: STRICTLY FROZEN & UNCHANGED (md:block) */}
        <div className="hidden md:block bg-[#fdfbf7] rounded-2xl border border-[#cabb9e] shadow-sm overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white text-[11px] font-extrabold uppercase tracking-wider grid grid-cols-12 gap-2 items-center`}>
                <th className="py-3 px-4 col-span-2 whitespace-nowrap">CUSTOMER NAME</th>
                <th className="py-3 px-4 col-span-2 whitespace-nowrap">PHONE NUMBER</th>
                <th className="py-3 px-4 col-span-2 whitespace-nowrap">TOTAL ORDERS</th>
                <th className="py-3 px-4 col-span-2 whitespace-nowrap">TOTAL SPENT (₹)</th>
                <th className="py-3 px-4 col-span-2 whitespace-nowrap">FAVOURITE ITEM</th>
                <th className="py-3 px-4 col-span-1 whitespace-nowrap">LAST PURCHASE</th>
                <th className="py-3 px-4 col-span-1 text-center whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className={`text-xs ${filteredCustomers.length > 0 ? 'divide-y divide-[#f0e8dc]' : ''}`}>
              {filteredCustomers.length === 0 ? (
                <tr className="w-full my-auto">
                  <td colSpan="7" className="pt-0 pb-8 px-4 text-center bg-[#fdfbf7] w-full block">
                    {/* Center 3D Customer Miniature Illustration */}
                    <div className="relative w-full max-w-4xl sm:max-w-5xl h-auto flex items-center justify-center -mt-1 mb-4 transition-transform hover:scale-102 mx-auto px-4">
                      <img
                        src="/customer_empty_illustration.png"
                        alt="Customer Directory Empty State Illustration"
                        className="w-full h-auto max-h-72 sm:max-h-84 md:max-h-[360px] object-contain relative z-10 drop-shadow-md"
                      />
                    </div>
                    {/* Empty State Text */}
                    <div className="text-center space-y-1.5 relative z-10 max-w-lg mx-auto">
                      <h3 className="text-xl sm:text-2xl font-serif font-black text-[#11291f] tracking-wide">
                        No customer records yet!
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-[#547363] leading-relaxed">
                        Customer details will appear here automatically after completed bills are linked to a customer.
                      </p>
                      <div className="pt-2 text-[#547363] text-xs flex items-center justify-center gap-2">
                        <span className="w-8 h-[1px] bg-[#cabb9e]"></span>
                        <span>🌱</span>
                        <span className="w-8 h-[1px] bg-[#cabb9e]"></span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr 
                    key={cust.id} 
                    onClick={() => setSelectedCustomerForHistory(cust)}
                    className="hover:bg-[#fbf8f3] transition-colors grid grid-cols-12 gap-2 items-center cursor-pointer group"
                  >
                    <td className="py-3 px-4 col-span-2 font-extrabold text-[#11291f] flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B] border-[#542A16]' : 'bg-[#0f3823] text-[#4ade80] border-[#194c31]'} font-black text-xs flex items-center justify-center border shrink-0`}>
                        {cust.name ? cust.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'C'}
                      </div>
                      <span className={`${isBrownBranch ? 'group-hover:text-[#7A4325]' : 'group-hover:text-[#0f3823]'} transition-colors truncate`}>{cust.name}</span>
                    </td>
                    <td className="py-3 px-4 col-span-2 font-mono font-bold text-[#11291f]">{cust.phone}</td>
                    <td className={`py-3 px-4 col-span-2 font-bold ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`}>{cust.visits || 0} Orders</td>
                    <td className="py-3 px-4 col-span-2 font-mono font-black text-[#11291f]">
                      ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 col-span-2 font-semibold text-[#547363] truncate">{cust.favoriteItem || 'Filter Coffee'}</td>
                    <td className="py-3 px-4 col-span-1 font-medium text-[#547363] text-[11px] truncate">{cust.lastVisit || 'N/A'}</td>
                    <td className="py-3 px-4 col-span-1 text-center flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerForHistory(cust);
                        }}
                        className={`p-1 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} hover:bg-[#ebdcc8] rounded-lg transition-colors`}
                        title="View Purchase History"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCustomer(cust.id, e)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Customer Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE STRUCTURED CUSTOMER CARDS: DEDICATED ARRANGEMENT (<md) */}
        <div className="md:hidden space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="bg-[#fdfbf7] rounded-2xl border border-[#cabb9e] p-6 text-center shadow-xs">
              <div className="relative w-full max-w-xs mx-auto mb-3">
                <img
                  src="/customer_empty_illustration.png"
                  alt="Customer Directory Empty State Illustration"
                  className="w-full h-auto max-h-48 object-contain mx-auto drop-shadow-sm"
                />
              </div>
              <h3 className="text-lg font-serif font-black text-[#11291f]">No customer records yet!</h3>
              <p className="text-xs text-[#547363] mt-1 font-medium leading-relaxed">
                Customer details will appear here automatically after adding records or completing bills.
              </p>
            </div>
          ) : (
            filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomerForHistory(cust)}
                className="bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-2.5 cursor-pointer active:bg-[#f5eedf] transition-colors"
              >
                {/* Header: Avatar + Full Name + Actions */}
                <div className="flex items-start justify-between gap-2.5 border-b border-[#ebdcc8] pb-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-full ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B] border-[#542A16]' : 'bg-[#0f3823] text-[#4ade80] border-[#194c31]'} font-black text-xs flex items-center justify-center border shrink-0 mt-0.5`}>
                      {cust.name ? cust.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'C'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-[#11291f] leading-snug break-words">
                        {cust.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-[#385344] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#547363]" />
                          {cust.phone}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-black rounded-sm border uppercase ${
                          cust.tier === 'VIP'
                            ? 'bg-[#d4af37]/20 text-[#8c6b12] border-[#d4af37]'
                            : 'bg-[#ebdcc8] text-[#547363] border-[#cabb9e]'
                        }`}>
                          {cust.tier || 'Regular'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomerForHistory(cust);
                      }}
                      className={`p-1.5 ${isBrownBranch ? 'bg-[#542A16] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'} rounded-lg shadow-xs hover:opacity-90 transition-opacity`}
                      title="View Purchase History"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCustomer(cust.id, e)}
                      className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 bg-[#ebdcc8]/30 p-2.5 rounded-xl border border-[#cabb9e]/50 text-xs">
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-[#547363] block">Total Orders</span>
                    <span className={`font-mono font-extrabold ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`}>
                      {cust.visits || 0} {(cust.visits === 1) ? 'Bill' : 'Bills'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] uppercase font-bold text-[#547363] block">Total Spent</span>
                    <span className="font-mono font-black text-[#11291f]">
                      ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-[#547363] block">Favourite Item</span>
                    <span className="font-bold text-[#11291f] break-words text-[11px] block">
                      {cust.favoriteItem || 'Filter Coffee'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] uppercase font-bold text-[#547363] block">Last Purchase</span>
                    <span className="font-medium text-[#547363] text-[10.5px] block">
                      {cust.lastVisit || 'No purchases yet'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CUSTOMER PURCHASE HISTORY MODAL                                       */}
      {/* ========================================================================= */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fdfbf7] border-2 border-[#d4af37] rounded-2xl max-w-2xl w-full text-[#11291f] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className={`${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white p-4 flex items-center justify-between border-b border-[#d4af37]/40`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-[#d4af37] ${isBrownBranch ? 'text-[#3E2312]' : 'text-[#0f3823]'} font-black text-sm flex items-center justify-center border border-white/20 shadow-sm`}>
                  {selectedCustomerForHistory.name ? selectedCustomerForHistory.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'C'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-black text-base text-white">{selectedCustomerForHistory.name}</h3>
                    <span className="px-2 py-0.5 bg-[#d4af37] text-[#0f3823] font-black text-[10px] rounded-full uppercase">
                      {selectedCustomerForHistory.tier || 'Regular'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#4ade80] flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {selectedCustomerForHistory.phone}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCustomerForHistory(null)} 
                className={`p-1.5 ${isBrownBranch ? 'bg-[#7A4325] hover:bg-[#542A16]' : 'bg-[#194c31] hover:bg-[#226341]'} text-white rounded-xl transition-colors cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="bg-[#ebdcc8] p-3 border-b border-[#cabb9e] grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#fdfbf7] p-2 rounded-xl border border-[#cabb9e]">
                <p className="text-[10px] font-bold text-[#547363] uppercase">Total Spent</p>
                <p className="font-mono font-black text-sm text-[#0f3823]">₹{(selectedCustomerForHistory.totalSpent || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-[#fdfbf7] p-2 rounded-xl border border-[#cabb9e]">
                <p className="text-[10px] font-bold text-[#547363] uppercase">Total Orders</p>
                <p className="font-bold text-sm text-[#11291f]">{selectedCustomerForHistory.visits || 0} Bills</p>
              </div>
              <div className="bg-[#fdfbf7] p-2 rounded-xl border border-[#cabb9e]">
                <p className="text-[10px] font-bold text-[#547363] uppercase">Favorite Item</p>
                <p className="font-bold text-xs text-[#0f3823] truncate">{selectedCustomerForHistory.favoriteItem || 'Filter Coffee'}</p>
              </div>
            </div>

            {/* Purchase History List */}
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3 bg-[#f8f6f0]">
              <h4 className="text-xs font-black uppercase text-[#11291f] tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#0f3823]" /> Order Transaction History
              </h4>

              {(!selectedCustomerForHistory.purchaseHistory || selectedCustomerForHistory.purchaseHistory.length === 0) ? (
                <div className="bg-[#fdfbf7] border border-[#cabb9e] p-6 rounded-xl text-center text-[#547363] space-y-1">
                  <Clock className="w-8 h-8 mx-auto text-[#cabb9e]" />
                  <p className="font-bold text-xs">No transaction history recorded yet.</p>
                  <p className="text-[10px]">Completed POS bills linked to this phone number will appear here automatically.</p>
                </div>
              ) : (
                selectedCustomerForHistory.purchaseHistory.map((sale) => (
                  <div key={sale.id} className="bg-[#fdfbf7] rounded-xl border border-[#cabb9e] p-3 shadow-xs space-y-2">
                    {/* Bill Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc8]">
                      <div>
                        <span className="font-mono font-black text-xs text-[#0f3823]">{sale.billNumber}</span>
                        <p className="text-[10px] font-medium text-[#547363]">{sale.date} at {sale.time}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'} text-[10px] font-mono font-bold rounded-md`}>
                          {sale.paymentMethod || 'CASH'}
                        </span>
                        <span className="font-mono font-black text-sm text-[#11291f]">
                          ₹{(sale.grandTotal || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Bill Line Items */}
                    <div className="space-y-1 text-xs">
                      {(sale.items || []).map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] font-bold text-[#456351]">
                          <span>{it.qty} × {it.name}</span>
                          <span className="font-mono text-[#11291f]">₹{(it.total || (it.qty * it.price) || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bill Summary Breakdown */}
                    <div className="pt-2 border-t border-[#f0e8dc] flex justify-between items-center text-[10px] text-[#547363]">
                      <span>Subtotal: ₹{(sale.subtotal || 0).toFixed(2)} | GST: ₹{(sale.tax || 0).toFixed(2)}</span>
                      <span className="font-bold text-[#0f3823]">Total: ₹{(sale.grandTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#ebdcc8] p-3 border-t border-[#cabb9e] flex justify-end">
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className={`px-4 py-1.5 ${isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F]' : 'bg-[#0f3823] hover:bg-[#0a2618]'} text-white font-black text-xs rounded-xl transition-colors cursor-pointer`}
              >
                Close History
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. ADD CUSTOMER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <form onSubmit={handleAddCustomer} className="bg-[#fdfbf7] border-2 border-[#d4af37] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#cabb9e]">
              <h3 className="font-serif font-black text-base text-[#0f3823]">Add Customer Record</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1 text-[#557361] hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold text-[#11291f] block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Shruthy A"
                  className="w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl text-xs text-[#11291f] font-bold focus:ring-2 focus:ring-[#0f3823]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#11291f] block mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl text-xs text-[#11291f] font-mono font-bold focus:ring-2 focus:ring-[#0f3823]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#11291f] block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  className="w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl text-xs text-[#11291f] font-bold focus:ring-2 focus:ring-[#0f3823]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ded4c5]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-1.5 bg-[#ebe0cb] text-[#122c20] font-black text-xs rounded-xl hover:bg-[#dfd3bc] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-1.5 ${isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F]' : 'bg-[#0f3823] hover:bg-[#0a2618]'} text-white font-black text-xs rounded-xl cursor-pointer`}
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
