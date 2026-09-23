import React, { useState } from 'react';
import { 
  Home, 
  Receipt, 
  ShoppingBag, 
  Package, 
  Truck, 
  BarChart3, 
  Users, 
  DollarSign, 
  UserCheck, 
  Settings, 
  Bot, 
  Menu, 
  X, 
  Building2, 
  LogOut,
  ChevronRight,
  Coffee
} from 'lucide-react';

export default function MobileNav({ 
  activeTab, 
  setActiveTab, 
  selectedBranch, 
  onChangeBranch, 
  onLogout,
  currentUser 
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  // Primary tabs for the Bottom Bar
  const bottomTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pos', label: 'POS', icon: Receipt },
    { id: 'online-orders', label: 'Online', icon: ShoppingBag },
    { id: 'kvcm-assistant', label: 'KVCM', icon: Bot },
  ];

  // All menu items for the Drawer
  const allNavItems = [
    { id: 'home', label: 'Home Dashboard', icon: Home },
    { id: 'pos', label: 'POS / Billing', icon: Receipt },
    { id: 'online-orders', label: 'Online Orders', icon: ShoppingBag },
    { id: 'inventory', label: 'Real-Time Inventory', icon: Package },
    { id: 'purchase', label: 'Purchase / Stock In', icon: Truck },
    { id: 'sales-reports', label: 'Sales & Tax Reports', icon: BarChart3 },
    { id: 'customers', label: 'Customer Management', icon: Users },
    { id: 'expenses', label: 'Expense Tracker', icon: DollarSign },
    { id: 'staff', label: 'Staff & Attendance', icon: UserCheck },
    { id: 'kvcm-assistant', label: 'KVCM Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setIsDrawerOpen(false);
  };

  const isMoreActive = !bottomTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* SVG ClipPath Definition for Organic Wavy Silhouette (Menu Drawer Only) */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="mobileDrawerWaveClip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0.94,0 C 0.99,0 0.92,0.12 0.92,0.20 C 0.92,0.28 0.99,0.36 0.98,0.44 C 0.97,0.52 0.90,0.60 0.92,0.70 C 0.94,0.80 0.99,0.88 0.94,1.0 L 0,1.0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ========================================================================= */}
      {/* 1. MOBILE BOTTOM NAVIGATION BAR (CLEAN NORMAL RECTANGULAR FIXED BAR)       */}
      {/* ========================================================================= */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fbf8f3]/95 backdrop-blur-md border-t border-[#cabb9e] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe transition-all"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around px-2 py-1.5 relative z-10">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[58px] group ${
                  isActive
                    ? isBrownBranch
                      ? 'text-[#542A16] font-black'
                      : 'text-[#0f3823] font-black'
                    : 'text-[#625648] font-semibold hover:text-[#11291f]'
                }`}
              >
                <div className={`relative overflow-hidden px-3.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? isBrownBranch
                      ? 'bg-gradient-to-r from-[#542A16] via-[#6e371d] to-[#452212] text-white border border-[#C69A4B]/60 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_3px_8px_rgba(84,42,22,0.4)] ring-1 ring-[#C69A4B]/30'
                      : 'bg-gradient-to-r from-[#048450] via-[#05985d] to-[#047a4a] text-white border border-[#4ade80]/60 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_3px_8px_rgba(4,148,93,0.4)] ring-1 ring-[#4ade80]/30'
                    : 'bg-transparent text-current group-hover:bg-[#ebdcc8]/40'
                }`}>
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-full bg-gradient-to-b from-white/35 to-transparent" />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              </button>
            );
          })}

          {/* "More" / Drawer Toggle Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[58px] group ${
              isMoreActive || isDrawerOpen
                ? isBrownBranch
                  ? 'text-[#542A16] font-black'
                  : 'text-[#0f3823] font-black'
                : 'text-[#625648] font-semibold hover:text-[#11291f]'
            }`}
          >
            <div className={`relative overflow-hidden px-3.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
              isMoreActive || isDrawerOpen
                ? isBrownBranch
                  ? 'bg-gradient-to-r from-[#542A16] via-[#6e371d] to-[#452212] text-white border border-[#C69A4B]/60 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_3px_8px_rgba(84,42,22,0.4)] ring-1 ring-[#C69A4B]/30'
                  : 'bg-gradient-to-r from-[#048450] via-[#05985d] to-[#047a4a] text-white border border-[#4ade80]/60 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_3px_8px_rgba(4,148,93,0.4)] ring-1 ring-[#4ade80]/30'
                : 'bg-transparent text-current group-hover:bg-[#ebdcc8]/40'
            }`}>
              {(isMoreActive || isDrawerOpen) && (
                <div className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-full bg-gradient-to-b from-white/35 to-transparent" />
              )}
              <Menu className="w-4 h-4 relative z-10" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. MOBILE MENU DRAWER (SLIDE-OVER FROM LEFT)                               */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Slide-in Drawer Container with Organic Wavy Right Edge */}
          <div 
            className={`relative w-[84%] max-w-xs bg-gradient-to-b ${
              isBrownBranch 
                ? 'from-[#3E2312] via-[#2D190D] to-[#1E0F07]' 
                : 'from-[#073d2a] via-[#053323] to-[#032418]'
            } text-[#e2ede7] h-full flex flex-col justify-between shadow-2xl z-10 p-4 pr-5 pt-safe pb-safe overflow-y-auto custom-scrollbar animate-in slide-in-from-left duration-250`}
            style={{ clipPath: 'url(#mobileDrawerWaveClip)' }}
          >
            {/* Right Wavy Edge Outer Border Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path 
                d="M 94,0 C 99,0 92,12 92,20 C 92,28 99,36 98,44 C 97,52 90,60 92,70 C 94,80 99,88 94,100" 
                fill="none" 
                stroke={isBrownBranch ? "#542A16" : "#165039"} 
                strokeWidth="1.2" 
              />
            </svg>
            {/* Top Branding & Close Row */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 border-[#d4af37] ring-2 ring-[#d4af37]/30 flex items-center justify-center ${
                  isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#063d2b]'
                }`}>
                  <img 
                    src="/sidebar_coffee_latte_art.jpg" 
                    alt="Kanchivaram Café" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif font-black text-white text-sm leading-tight">Kanchivaram Café</h3>
                  <p className="text-[10px] text-[#d4af37] font-mono font-bold flex items-center gap-1">
                    <span>📍</span> {selectedBranch?.badge || 'Main Branch'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Branch Switcher Card */}
            <div className="my-3 p-2.5 bg-black/25 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block">Active Branch</span>
                <span className="text-xs font-bold text-white block">{selectedBranch?.name || 'Main Branch'}</span>
              </div>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  if (onChangeBranch) onChangeBranch();
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1 ${
                  isBrownBranch
                    ? 'bg-[#542A16] hover:bg-[#3D1E0F] text-[#C69A4B] border-[#7A4325]'
                    : 'bg-[#0f3823] hover:bg-[#0a2618] text-[#4ade80] border-[#194c31]'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>Switch</span>
              </button>
            </div>

            {/* Navigation Items List */}
            <div className="space-y-1.5 my-1 flex-1">
              <span className="text-[9.5px] uppercase font-mono tracking-widest text-slate-400 px-2 block mb-1">
                Navigation Menu
              </span>
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer relative overflow-hidden group shrink-0 ${
                      isActive
                        ? isBrownBranch
                          ? 'bg-gradient-to-r from-[#542A16] via-[#6e371d] to-[#452212] text-white border border-[#C69A4B]/60 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_14px_rgba(84,42,22,0.5)] ring-1 ring-[#C69A4B]/40 font-extrabold'
                          : 'bg-gradient-to-r from-[#048450] via-[#05985d] to-[#047a4a] text-white border border-[#4ade80]/60 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_4px_14px_rgba(4,148,93,0.5)] ring-1 ring-[#4ade80]/40 font-extrabold'
                        : isBrownBranch
                          ? 'bg-[#2b170c]/80 hover:bg-[#3d2011] text-[#e8d5c4] border border-[#4a2815] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_2px_4px_rgba(0,0,0,0.3)]'
                          : 'bg-[#103a29]/80 hover:bg-[#184d38] text-[#c5e4d4] border border-[#1b553e] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_2px_4px_rgba(0,0,0,0.3)]'
                    }`}
                  >
                    {/* 3D Water/Glass Top Gloss Highlight */}
                    <div className={`absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-full ${
                      isActive
                        ? 'bg-gradient-to-b from-white/30 to-transparent'
                        : 'bg-gradient-to-b from-white/15 to-transparent'
                    }`} />

                    <div className="flex items-center gap-2.5 z-10">
                      <Icon className={`w-4 h-4 ${
                        isActive
                          ? 'text-white'
                          : isBrownBranch
                            ? 'text-[#E8D8C2]'
                            : 'text-[#8ecbb0]'
                      }`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50 z-10" />
                  </button>
                );
              })}
            </div>

            {/* User & Logout Section */}
            <div className="pt-3 border-t border-white/10 space-y-2 shrink-0">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full text-white font-extrabold text-xs flex items-center justify-center ${
                    isBrownBranch ? 'bg-[#542A16]' : 'bg-[#048450]'
                  }`}>
                    {currentUser?.avatar || 'SA'}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Shruthy A'}</p>
                    <p className="text-[9.5px] text-slate-300 font-medium">{currentUser?.role || 'Owner'}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="p-1.5 text-red-300 hover:text-red-100 bg-red-900/40 hover:bg-red-900/60 rounded-lg border border-red-700/50 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Decorative Brand Signature */}
              <div className="text-center pt-1 opacity-70">
                <p className="font-serif italic text-[10px] text-[#e2ede7]">
                  Great Coffee • <span className="text-white font-semibold">Brighter Days</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
