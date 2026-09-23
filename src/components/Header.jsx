import React, { useState, useEffect, useRef } from 'react';
import { Search, Mail, Phone, X, Tag, Package, ShoppingBag, User, FileText, ArrowRight, Coffee, Building2, LogOut } from 'lucide-react';

// Comprehensive mock database index for real POS search filtering
const SEARCH_DATABASE = [
  { id: 'p1', category: 'Menu & Products', title: 'South Indian Filter Coffee', detail: '₹50 • Beverages', tab: 'menu' },
  { id: 'p2', category: 'Menu & Products', title: 'Special Cold Coffee with Ice Cream', detail: '₹120 • Beverages', tab: 'menu' },
  { id: 'p3', category: 'Menu & Products', title: 'Kanchivaram Special Masala Dosa', detail: '₹90 • Tiffin', tab: 'menu' },
  { id: 'p4', category: 'Menu & Products', title: 'Paneer Butter Masala', detail: '₹180 • Main Course', tab: 'menu' },
  { id: 'p5', category: 'Menu & Products', title: 'Espresso Latte', detail: '₹110 • Coffee', tab: 'menu' },
  { id: 'p6', category: 'Menu & Products', title: 'Fresh Chocolate Muffin & Pastry', detail: '₹75 • Bakery', tab: 'menu' },

  { id: 'o1', category: 'Orders & Bills', title: 'Order #1024 (Table 4)', detail: '₹450 • Paid via Cash • 10 mins ago', tab: 'pos' },
  { id: 'o2', category: 'Orders & Bills', title: 'Order #1025 (Takeaway)', detail: '₹1,200 • Paid via UPI', tab: 'pos' },
  { id: 'o3', category: 'Orders & Bills', title: 'Bill #B-8891 (Shruthy A)', detail: '₹340 • Completed', tab: 'pos' },
  { id: 'o4', category: 'Orders & Bills', title: 'Bill #B-8892 (Swiggy Delivery)', detail: '₹850 • Dispatched', tab: 'online-orders' },

  { id: 'i1', category: 'Inventory & Stock', title: 'Milk Packet 500ml', detail: 'Critical: 5 packets left', tab: 'inventory' },
  { id: 'i2', category: 'Inventory & Stock', title: 'Arabica Coffee Beans', detail: 'Approaching Limit: 15 bags left', tab: 'inventory' },
  { id: 'i3', category: 'Inventory & Stock', title: 'Fresh Cucumbers & Vegetables', detail: 'Critical: 15 bags left', tab: 'inventory' },
  { id: 'i4', category: 'Inventory & Stock', title: 'Cardamom & Spices Stock', detail: 'In Stock: 45 units', tab: 'inventory' },

  { id: 'c1', category: 'Customers', title: 'Shruthy A (VIP)', detail: '+91 98765 43210 • 42 Orders', tab: 'customers' },
  { id: 'c2', category: 'Customers', title: 'Rajesh Kumar', detail: '+91 91234 56789 • 12 Orders', tab: 'customers' },
  { id: 'c3', category: 'Customers', title: 'Ananya Sharma', detail: '+91 99887 76655 • 8 Orders', tab: 'customers' },

  { id: 's1', category: 'Online Channels', title: 'Swiggy Delivery Orders', detail: 'Today Sales: ₹8,450 (18 Orders)', tab: 'online-orders' },
  { id: 's2', category: 'Online Channels', title: 'Zomato Online Sales', detail: 'Today Sales: ₹8,450 (16 Orders)', tab: 'online-orders' },
  { id: 's3', category: 'Online Channels', title: 'Dunzo Local Express', detail: 'Today Sales: ₹6,450 (11 Orders)', tab: 'online-orders' },
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
        <div className="flex items-center gap-1.5 sm:gap-2.5 p-0.5 sm:px-3 sm:py-1 bg-[#ebe5d8] border border-[#c4b6a2] rounded-full cursor-pointer hover:bg-[#dfd7c6] transition-all shadow-xs shrink-0">
          <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white font-black text-[10px] sm:text-xs flex items-center justify-center shadow-xs border ${
            selectedBranch?.id === 'branch-2' 
              ? 'bg-[#3E2312] border-[#542A16] text-[#C69A4B]' 
              : 'bg-[#0f3823] border-[#194c31] text-[#4ade80]'
          }`}>
            {currentUser?.avatar || 'SA'}
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <p className="font-extrabold text-[11px] text-[#122c20] tracking-tight truncate max-w-[100px]">
              {currentUser?.name || 'Shruthy A'}
            </p>
            <p className="text-[9px] font-bold text-[#557361] truncate">
              {currentUser?.role ? currentUser.role.split(' ')[0] : 'Owner'}
            </p>
          </div>
        </div>

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





