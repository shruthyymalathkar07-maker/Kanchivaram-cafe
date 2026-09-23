import React from 'react';
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
  Bot
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, selectedBranch, onChangeBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pos', label: 'POS / Billing', icon: Receipt },
    { id: 'online-orders', label: 'Online Orders', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'purchase', label: 'Purchase / Stock in', icon: Truck },
    { id: 'sales-reports', label: 'Sales & Reports', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'staff', label: 'Staff', icon: UserCheck },
    { id: 'kvcm-assistant', label: 'KVCM Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* SVG ClipPath Definition for Organic Wavy Right Edge Silhouette */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="sidebarOrganicWaveClip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0.94,0 C 0.99,0 0.92,0.12 0.92,0.20 C 0.92,0.28 0.99,0.36 0.98,0.44 C 0.97,0.52 0.90,0.60 0.92,0.70 C 0.94,0.80 0.99,0.88 0.94,1.0 L 0,1.0 Z" />
          </clipPath>
        </defs>
      </svg>

      <aside 
        className={`hidden md:flex w-64 lg:w-72 bg-gradient-to-b ${
          isBrownBranch 
            ? 'from-[#3E2312] via-[#2D190D] to-[#1E0F07]' 
            : 'from-[#073d2a] via-[#053323] to-[#032418]'
        } text-[#e2ede7] h-screen sticky top-0 p-3 sm:p-3.5 pr-4 sm:pr-5 flex-col justify-between shrink-0 shadow-2xl z-20 relative select-none overflow-y-auto no-scrollbar transition-colors duration-500`}
        style={{ clipPath: 'url(#sidebarOrganicWaveClip)' }}
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

        <div className="space-y-1 flex-1 flex flex-col z-10 min-h-0 overflow-y-auto no-scrollbar">
        
        {/* Top Coffee Branding Section (Clickable Branch / Café Icon) */}
        <div 
          onClick={onChangeBranch}
          className="relative pt-0.5 pb-0.5 text-center flex flex-col items-center justify-center overflow-visible shrink-0 cursor-pointer group"
          title="Click to Switch Branch"
        >
          
          {/* Coffee Cup Container with Organic Frame & Leaf Accent */}
          <div className="relative mb-1 flex items-center justify-center">
            
            {/* Green Leaf Accent on Top Right of Frame */}
            <div className="absolute -top-2 -right-2 z-30 w-7 h-7 sm:w-8 sm:h-8 transform rotate-45 pointer-events-none filter drop-shadow-[2px_2px_3px_rgba(0,0,0,0.4)]">
              <svg viewBox="0 0 50 50" fill="none" className="w-full h-full">
                <defs>
                  <linearGradient id="leaf3DGradUR" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#81c784" />
                    <stop offset="40%" stopColor="#2e7d32" />
                    <stop offset="100%" stopColor="#1b5e20" />
                  </linearGradient>
                </defs>
                <path d="M 6 42 C 6 18, 30 6, 42 6 C 42 30, 30 42, 6 42 Z" fill="url(#leaf3DGradUR)" stroke="#063d2b" strokeWidth="1.5" />
                <path d="M 6 42 C 22 26, 32 16, 42 6" stroke="#a5d6a7" strokeWidth="2.0" strokeLinecap="round" />
              </svg>
            </div>

            {/* Organic Framed Latte Art Coffee Cup */}
            <div className={`w-22 h-22 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-xl relative ${
              isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#063d2b]'
            } z-10 ring-4 ring-[#d4af37]/40 flex items-center justify-center transition-transform group-hover:scale-105`}>
              <img 
                src="/sidebar_coffee_latte_art.jpg" 
                alt="Kanchivaram Café Fresh Brew Coffee" 
                className="w-full h-full object-cover rounded-full block"
                style={{ objectPosition: 'center center' }}
              />
            </div>

          </div>

          {/* Kanchivaram Café Title & Branch Tag */}
          <h1 className="font-serif font-black text-white text-sm sm:text-base leading-tight tracking-tight z-10 flex items-center gap-1">
            <span>Kanchivaram Café</span>
          </h1>

          <div className="mt-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-bold tracking-wider text-[#d4af37] border border-[#d4af37]/40 bg-black/20 backdrop-blur-xs flex items-center gap-1">
            <span>📍</span>
            <span>{selectedBranch?.badge || 'Main Branch'}</span>
          </div>

          {/* Good Food Happier People Tagline */}
          <p className={`text-[10px] sm:text-[11px] font-serif italic font-medium mt-1 z-10 tracking-wide ${
            isBrownBranch ? 'text-[#E8D8C2]' : 'text-[#9fcbb5]'
          }`}>
            Good Food Happier People
          </p>

        </div>

        {/* Navigation Menu Items (3D Water-Layer Capsule Pills) */}
        <nav className="space-y-1 py-1 flex flex-col shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full h-9 sm:h-10 flex items-center justify-between px-3.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer relative overflow-hidden group shrink-0 ${
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
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                    isActive 
                      ? 'text-white drop-shadow-xs' 
                      : isBrownBranch 
                        ? 'text-[#E8D8C2] group-hover:text-white' 
                        : 'text-[#8ecbb0] group-hover:text-white'
                  }`} />
                  <span className="truncate tracking-wide text-[11px] sm:text-xs">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`z-10 px-1.5 py-0.5 text-[9.5px] font-black rounded-full shadow-xs ${
                    isActive
                      ? 'bg-white text-[#048450]'
                      : 'bg-[#d4af37] text-[#063d2b]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Cafe Line-Art Illustration — pointer-events-none so it never blocks nav clicks */}
        <div className="pt-2 pb-1 text-center shrink-0 pointer-events-none select-none mt-auto">
          <div className="opacity-50 mb-0.5 flex justify-center">
            <svg viewBox="0 0 160 80" fill="none" stroke={isBrownBranch ? "#E8D8C2" : "#9fcbb5"} strokeWidth="1.5" className="w-20 h-8 sm:w-24 sm:h-9">
              <rect x="20" y="30" width="120" height="45" rx="3" />
              <path d="M10 30 L80 10 L150 30 Z" />
              <rect x="35" y="45" width="30" height="30" />
              <rect x="95" y="45" width="30" height="30" />
              <circle cx="80" cy="55" r="6" />
            </svg>
          </div>
          <p className={`font-serif italic text-[10px] font-semibold tracking-wider leading-tight ${
            isBrownBranch ? 'text-[#E8D8C2]' : 'text-[#9fcbb5]'
          }`}>
            Great Coffee<br />
            <span className="font-serif italic text-[11px] text-white">Brighter Days</span>
          </p>
        </div>

      </div>

    </aside>
  </>
  );
}




