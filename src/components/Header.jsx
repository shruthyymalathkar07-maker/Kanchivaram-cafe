import React, { useState, useEffect, useRef } from 'react';
import { Search, Mail, Phone, X, Tag, Package, ShoppingBag, User, FileText, ArrowRight, Coffee, Building2, LogOut } from 'lucide-react';
import { CLIENT_PRODUCTS_MASTER, CLIENT_RAW_MATERIALS_MASTER } from '../data/masterData';

// Live Café Navigation Pages
const APP_PAGES = [
  { id: 'page-pos', category: 'Navigation & Modules', title: 'POS / Billing Terminal', detail: 'New orders, table billing & counter sales', tab: 'pos' },
  { id: 'page-orders', category: 'Navigation & Modules', title: 'Online Orders Channel', detail: 'Live Swiggy & Zomato order management', tab: 'online-orders' },
  { id: 'page-inventory', category: 'Navigation & Modules', title: 'Real-Time Inventory', detail: 'Stock status, raw materials & threshold alerts', tab: 'inventory' },
  { id: 'page-purchase', category: 'Navigation & Modules', title: 'Purchase & Stock In', detail: 'Vendor invoices & raw material receiving', tab: 'purchase' },
  { id: 'page-reports', category: 'Navigation & Modules', title: 'Sales & Financial Reports', detail: 'Daily revenue, tax audit & performance trends', tab: 'sales-reports' },
  { id: 'page-customers', category: 'Navigation & Modules', title: 'Customer CRM & Loyalty', detail: 'Customer directory & purchase history', tab: 'customers' },
  { id: 'page-expenses', category: 'Navigation & Modules', title: 'Daily Operational Expenses', detail: 'Track petty cash, utilities & operational costs', tab: 'expenses' },
  { id: 'page-staff', category: 'Navigation & Modules', title: 'Staff & Shift Management', detail: 'Staff roster, roles, shifts & duty status', tab: 'staff' },
  { id: 'page-assistant', category: 'Navigation & Modules', title: 'KVCM Assistant', detail: 'Smart AI operations & analytics assistant', tab: 'kvcm-assistant' },
  { id: 'page-settings', category: 'Navigation & Modules', title: 'Café Store Settings', detail: 'GST rates, printer, branch info & FSSAI', tab: 'settings' },
  { id: 'page-home', category: 'Navigation & Modules', title: 'Dashboard Overview', detail: 'Daily sales, revenue KPIs & executive overview', tab: 'home' }
];

// Live search index generated strictly from real café menu items, kitchen inventory, and live pages
const SEARCH_DATABASE = [
  ...APP_PAGES,
  ...CLIENT_PRODUCTS_MASTER.map(p => ({
    id: `prod-${p.id}`,
    category: `Menu • ${p.categoryName || p.categoryId || 'Dishes'}`,
    title: p.name,
    detail: `₹${p.price} • POS Menu Item • Dine-in & Delivery`,
    tab: 'pos'
  })),
  ...CLIENT_RAW_MATERIALS_MASTER.map(rm => ({
    id: `rm-${rm.id}`,
    category: `Kitchen Inventory • ${rm.category || 'Raw Materials'}`,
    title: rm.name,
    detail: `Kitchen Raw Material • Unit: ${rm.unit || 'units'}`,
    tab: 'inventory'
  }))
];

export default function Header({ onNavigateTab, onOpenNotifications, searchQuery: externalSearchQuery, onSearchChange, activeTab, currentUser, selectedBranch, onLogout, onChangeBranch }) {
  const [timeString, setTimeString] = useState('Fri, 6 Jun 2025 | 11:45 AM');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);

  const currentQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  // Live Date / Time update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
      const datePart = now.toLocaleDateString('en-GB', options);
      const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setTimeString(`${datePart} | ${timePart}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut Ctrl + K focus search & Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const results = currentQuery.trim() === '' 
    ? [] 
    : SEARCH_DATABASE.filter(item => 
        item.title.toLowerCase().includes(currentQuery.toLowerCase()) ||
        item.detail.toLowerCase().includes(currentQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(currentQuery.toLowerCase())
      );

  const handleSelectResult = (item) => {
    setIsOpen(false);
    if (onSearchChange) onSearchChange('');
    setInternalSearchQuery('');
    if (onNavigateTab && item.tab) {
      onNavigateTab(item.tab);
    }
  };

  return (
    <header className="flex items-center justify-between gap-1.5 sm:gap-4 py-2 px-2.5 sm:px-5 bg-[#f8f6f0] text-[#122c20] border-b border-[#ded4c5] min-h-[52px] z-30 relative pt-safe">
      
      {/* Header Left Title - Full "Kanchivaram Café" name always displayed with high contrast */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-[#122c20] shrink-0 min-w-0">
        <span className="text-[12.5px] sm:text-sm font-serif font-black text-[#11291f] tracking-tight whitespace-nowrap shrink-0">
          Kanchivaram Café
        </span>
        <span className="text-[#87a997] hidden md:inline">/</span>
        <span className="text-[#456351] font-extrabold truncate hidden md:inline">
          {activeTab === 'purchase' || activeTab === 'purchase-stock-in' ? 'Purchase' :
           activeTab === 'online-orders' ? 'Online Orders' :
           activeTab === 'pos' ? 'POS / Billing' :
           activeTab === 'inventory' ? 'Inventory' :
           activeTab === 'sales-reports' ? 'Sales & Reports' :
           activeTab === 'home' ? 'Dashboard Overview' :
           activeTab === 'kvcm-assistant' ? 'KVCM Assistant' :
           activeTab.replace('-', ' ')}
        </span>
      </div>

      {/* Right Section Controls matching reference image strictly with high-contrast borders & icons */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        
        {/* Active Branch Badge (Clickable to switch branch) */}
        {selectedBranch && (
          <button
            onClick={onChangeBranch}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black transition-all cursor-pointer shadow-xs border ${
              selectedBranch?.id === 'branch-2' 
                ? 'bg-[#ebdcc8] hover:bg-[#dfd3bc] border-[#bda688] text-[#3E2312]' 
                : 'bg-[#e4efe0] hover:bg-[#d5e7cf] border-[#a1c498] text-[#0a2e1c]'
            }`}
            title="Click to Switch Branch"
          >
            <Building2 className={`w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0 ${
              selectedBranch?.id === 'branch-2' ? 'text-[#3E2312]' : 'text-[#0a2e1c]'
            }`} />
            <span className="truncate max-w-[72px] min-[380px]:max-w-[88px] sm:max-w-[140px] font-black">
              {selectedBranch.badge || selectedBranch.name}
            </span>
          </button>
        )}

        {/* Mail Icon Button with Red Notification Dot */}
        <button 
          onClick={onOpenNotifications}
          className="relative p-1.5 sm:p-2 bg-[#ebe5d8] hover:bg-[#dfd7c6] rounded-full border border-[#c4b6a2] text-[#11291f] transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
          title="Messages / Notifications"
        >
          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#11291f] stroke-[2.2]" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-600 rounded-full ring-2 ring-[#f8f6f0]"></span>
        </button>

        {/* Phone Icon Button */}
        <button 
          onClick={() => alert('Kanchivaram Café Support Hotline: +91 98765 43210 (Backend helpline integration pending)')}
          className="p-1.5 sm:p-2 bg-[#ebe5d8] hover:bg-[#dfd7c6] rounded-full border border-[#c4b6a2] text-[#11291f] transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
          title="Support / Calls (+91 98765 43210)"
        >
          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#11291f] stroke-[2.2]" />
        </button>

        {/* User Profile Badge */}
        {(() => {
          const isOwnerProfile = !currentUser ||
            !currentUser.name ||
            currentUser.name.toLowerCase().includes('shruth') ||
            currentUser.name.toLowerCase().includes('malathkar') ||
            currentUser.name === 'Staff Member' ||
            currentUser.name === 'Google Staff Member' ||
            currentUser.role?.toUpperCase() === 'CASHIER' ||
            currentUser.id === 'user-1';

          const safeName = isOwnerProfile ? 'Kanchivaram Café Admin' : currentUser.name;
          const safeRole = isOwnerProfile ? 'Owner' : (currentUser.role ? currentUser.role.split(' ')[0] : 'Owner');
          const safeAvatar = isOwnerProfile ? 'KC' : (currentUser.avatar || 'KC');

          return (
            <div className="flex items-center gap-1.5 sm:gap-2.5 p-0.5 sm:px-3 sm:py-1 bg-[#ebe5d8] border border-[#c4b6a2] rounded-full cursor-pointer hover:bg-[#dfd7c6] transition-all shadow-xs shrink-0">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white font-black text-[10px] sm:text-xs flex items-center justify-center shadow-xs border ${
                selectedBranch?.id === 'branch-2' 
                  ? 'bg-[#3E2312] border-[#542A16] text-[#C69A4B]' 
                  : 'bg-[#0f3823] border-[#194c31] text-[#4ade80]'
              }`}>
                {safeAvatar}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="font-extrabold text-[11px] text-[#122c20] tracking-tight truncate max-w-[120px]">
                  {safeName}
                </p>
                <p className="text-[9px] font-bold text-[#557361] truncate">
                  {safeRole}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Log Out Button */}
        <button
          onClick={onLogout}
          className="p-1.5 sm:p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full border border-red-300 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
          title="Log Out of Kanchivaram Café"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 stroke-[2.2]" />
        </button>

        {/* Live Date / Time display */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-[#284737] font-mono font-bold pl-2 border-l border-[#ded4c5]">
          <span className="p-1 bg-[#ebe5d8] rounded-md text-[#122c20]">📅</span>
          <span>{timeString}</span>
        </div>

      </div>

    </header>
  );
}





