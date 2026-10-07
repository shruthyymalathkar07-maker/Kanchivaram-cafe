import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  PackagePlus, 
  ShoppingBag, 
  BarChart2, 
  TrendingUp, 
  AlertTriangle, 
  Bot,
  Layers,
  UtensilsCrossed,
  Package,
  Tag,
  Receipt
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HexagonCards from './components/HexagonCards';
import KPICards from './components/KPICards';
import KPIDetailModals from './components/KPIDetailModals';
import StockAlertsSection from './components/StockAlertsSection';
import DailyStockMovement from './components/DailyStockMovement';
import POSBillingView from './components/POSBillingView';
import AIChatbotWorkspace from './components/AIChatbotWorkspace';
import RealTimeInventoryView from './components/RealTimeInventoryView';
import OnlineOrdersView from './components/OnlineOrdersView';
import MenuProductsView from './components/MenuProductsView';
import CustomersView from './components/CustomersView';
import SalesReportView from './components/SalesReportView';
import ExpensesView from './components/ExpensesView';
import StaffView from './components/StaffView';
import PurchaseStockInView from './components/PurchaseStockInView';
import SettingsView from './components/SettingsView';
import KVCMAssistantView from './components/KVCMAssistantView';
import MobileNav from './components/MobileNav';
import AuthView from './components/AuthView';

import { inventoryStore } from './services/inventoryStore';
import { authStore } from './services/authStore';
import { fetchDashboardStats, fetchProducts, socket } from './services/api';

const TAB_ORDER = {
  'home': 0,
  'pos': 1,
  'online-orders': 2,
  'menu-products': 3,
  'inventory': 4,
  'purchase': 5,
  'sales-reports': 6,
  'customers': 7,
  'expenses': 8,
  'staff': 9,
  'kvcm-assistant': 10,
  'chatbot': 10,
  'settings': 11
};

export default function App() {
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) return tabParam;
    if (window.location.hash) return window.location.hash.replace('#', '');
    return 'home';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [navDirection, setNavDirection] = useState('forward');
  const [isBranchEntering, setIsBranchEntering] = useState(false);
  const [salesTimeframe, setSalesTimeframe] = useState('today');
  const [posSearchQuery, setPosSearchQuery] = useState('');

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;
    if (nextTab === 'home') {
      setNavDirection('home-scale');
    } else {
      const currentOrder = TAB_ORDER[activeTab] ?? 0;
      const nextOrder = TAB_ORDER[nextTab] ?? 0;
      if (nextOrder >= currentOrder) {
        setNavDirection('forward');
      } else {
        setNavDirection('backward');
      }
    }
    setIsBranchEntering(false);
    setActiveTab(nextTab);
  };

  const getModuleAnimationClass = () => {
    if (isBranchEntering) {
      return '';
    }
    if (activeTab === 'home' && navDirection === 'home-scale') {
      return 'animate-home-fade-scale';
    }
    if (navDirection === 'backward') {
      return 'animate-module-slide-backward';
    }
    return 'animate-module-slide-forward';
  };
  
  // KPI Detail Modal State (TOTAL_SALES, NET_SALES, DISCOUNTS, CASH_COLLECTION, ONLINE_SALES)
  const [activeModal, setActiveModal] = useState(null);

  // Authentication State & Seamless Branch Transition
  const [authState, setAuthState] = useState(() => authStore.getState());
  const [isBranchTransitioning, setIsBranchTransitioning] = useState(false);
  const [activeBranch, setActiveBranch] = useState(() => authState.selectedBranch || null);

  // Live Data State (Clean Production Starting State)
  const [stats, setStats] = useState(() => ({
    kpis: {
      totalSales: { amount: 0, inStore: 0, online: 0 },
      netSales: { amount: 0 },
      discounts: { amount: 0 },
      cashCollection: { amount: 0 },
      onlineSales: { amount: 0 }
    }
  }));
  const [productsData, setProductsData] = useState({ categories: [], products: [] });
  const [inventoryState, setInventoryState] = useState(() => inventoryStore.getState());

  // Subscribe to authStore changes
  useEffect(() => {
    const unsubscribeAuth = authStore.subscribe(newState => {
      setAuthState(newState);
      if (newState.selectedBranch) {
        setActiveBranch(newState.selectedBranch);
      }
    });
    return unsubscribeAuth;
  }, []);

  // Sync selected branch with inventoryStore
  useEffect(() => {
    const branchToSync = authState.selectedBranch || activeBranch;
    if (branchToSync?.id) {
      inventoryStore.setBranch(branchToSync.id);
    }
  }, [authState.selectedBranch?.id, activeBranch?.id]);

  // Subscribe to real-time inventory store updates
  useEffect(() => {
    const unsubscribe = inventoryStore.subscribe((newState) => {
      setInventoryState(newState);
    });
    return unsubscribe;
  }, []);

  // Load initial backend state & subscribe to real-time Socket.IO events
  useEffect(() => {
    const loadInitialData = async () => {
      const branchId = authState.selectedBranch?.id || activeBranch?.id || 'branch-1';
      const liveStats = await fetchDashboardStats(salesTimeframe, branchId);
      const liveProducts = await fetchProducts();
      await inventoryStore.hydrateFromBackend(branchId);
      if (liveStats) setStats(liveStats);
      if (liveProducts) setProductsData(liveProducts);
    };

    if (authState.isAuthenticated) {
      loadInitialData();
    }

    // Listen to real-time sales & inventory updates over Socket.IO
    socket.on('sale_created', (newSale) => {
      console.log('[Socket.IO] New sale received live:', newSale);
      loadInitialData();
    });

    socket.on('stock_updated', (updatedProducts) => {
      console.log('[Socket.IO] Stock updated live:', updatedProducts);
      loadInitialData();
    });

    socket.on('inventory_updated', () => {
      loadInitialData();
    });

    return () => {
      socket.off('sale_created');
      socket.off('stock_updated');
      socket.off('inventory_updated');
    };
  }, [salesTimeframe, authState.isAuthenticated, authState.selectedBranch?.id, activeBranch?.id]);

  // UN-AUTHENTICATED ROUTE PROTECTION (Login, Forgot Password, OTP Verification)
  if (!authState.isAuthenticated) {
    return (
      <AuthView
        key="auth-view-login"
        initialStep="LOGIN"
        onAuthSuccess={(newState) => {
          setAuthState(newState);
          if (newState.selectedBranch) {
            setActiveBranch(newState.selectedBranch);
          }
        }}
      />
    );
  }

  const selectedBranch = authState.selectedBranch || activeBranch || { id: 'branch-1', name: 'Main Branch', badge: 'Main Branch' };
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  const currentTotalSales = stats?.kpis?.totalSales?.amount ?? 0;
  const currentPosSales = stats?.kpis?.totalSales?.inStore ?? 0;
  const currentOnlineSales = stats?.kpis?.totalSales?.online ?? 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8f6f0] text-slate-900 font-sans antialiased selection:bg-[#4ade80] selection:text-[#0f231a] relative">
      
      {/* 1. SEAMLESS BRANCH SELECTION OVERLAY (Cross-fades smoothly over the ready Home Dashboard) */}
      {(!authState.selectedBranch || isBranchTransitioning) && (
        <div 
          className={`fixed inset-0 z-50 transition-opacity duration-380 ease-out bg-[#F8F0E3] ${
            isBranchTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <AuthView
            key="auth-view-branch-select"
            initialStep="BRANCH_SELECT"
            onBranchSelectStart={(branchObj) => {
              setActiveBranch(branchObj);
              setActiveTab('home');
              setIsBranchTransitioning(true);
            }}
            onAuthSuccess={(newState) => {
              setAuthState(newState);
              setIsBranchTransitioning(false);
            }}
          />
        </div>
      )}

      {/* 2. Main Full-Width Application Shell (Pre-rendered & Ready Underneath) */}
      <div className="flex w-full h-screen overflow-hidden bg-[#f8f6f0]">
        
        {/* A. LEFT SIDEBAR */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          selectedBranch={selectedBranch}
          onChangeBranch={() => {
            authStore.clearSelectedBranch();
          }}
        />

        {/* Main Content Shell */}
        <div className={`flex-1 flex flex-col min-w-0 bg-[#f8f6f0] relative h-[100dvh] md:h-screen ${activeTab === 'kvcm-assistant' || activeTab === 'chatbot' ? 'overflow-hidden' : 'overflow-y-auto'}`}>

          {/* B. TOP HEADER */}
          <Header 
            activeTab={activeTab}
            searchQuery={posSearchQuery}
            onSearchChange={setPosSearchQuery}
            onNavigateTab={handleTabChange} 
            onOpenNotifications={() => alert("Notification: Stock levels updated! 3 items are at low threshold.")} 
            currentUser={authState.currentUser}
            selectedBranch={selectedBranch}
            onLogout={() => authStore.logout()}
            onChangeBranch={() => {
              authStore.clearSelectedBranch();
            }}
          />

          {/* Dynamic Main Body Content */}
          <main className={`flex-1 p-2 sm:p-3 lg:p-4 max-w-[1600px] w-full mx-auto flex flex-col ${activeTab === 'kvcm-assistant' || activeTab === 'chatbot' ? 'pb-20 md:pb-4 overflow-hidden min-h-0' : 'space-y-2.5 pb-20 md:pb-4'}`}>
            <div key={activeTab} className={`w-full flex-1 flex flex-col min-h-0 ${getModuleAnimationClass()}`}>
            
            {/* VIEW 1: HOME DASHBOARD */}
            {activeTab === 'home' && (
              <div className="space-y-3 flex-1 flex flex-col pt-0.5">
                
                {/* Greeting Banner */}
                <div className="space-y-2.5 shrink-0">
                  <div className="relative overflow-hidden bg-[#ebdcc8] text-[#122c20] rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#cabb9e] flex flex-col md:flex-row md:items-center justify-between gap-2 min-h-[56px]">
                    <div className="space-y-0.5 z-10">
                      <h2 className="text-lg sm:text-xl font-extrabold font-sans text-[#11291f] flex items-center gap-2">
                        Good Morning, Shruthy! <span className="text-base">☕</span>
                      </h2>
                      <p className="text-xs text-[#456351] font-bold">
                        Fresh brews. Smooth operations. You've got this!
                      </p>
                    </div>

                    {/* RIGHT SIDE: Quote */}
                    <div className="z-10 text-right">
                      <p className="font-serif italic text-xs sm:text-sm text-[#3d2b16] font-bold tracking-wide">
                        “ Brewing Success Together ”
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Buttons Row: Tax next to Receive Stock */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 py-0.5">
                    <button
                      onClick={() => handleTabChange('pos')}
                      className={`flex items-center gap-2 px-4 py-1.5 text-white font-black text-xs rounded-full shadow-md transition-all cursor-pointer border shrink-0 ${
                        isBrownBranch 
                          ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' 
                          : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'
                      }`}
                    >
                      <PlusCircle className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
                      <span>New Bill</span>
                    </button>

                    <button
                      onClick={() => handleTabChange('inventory')}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full shadow-xs border border-[#cabb9e] transition-all cursor-pointer shrink-0"
                    >
                      <PackagePlus className="w-3.5 h-3.5 text-[#122c20]" />
                      <span>Receive Stock</span>
                    </button>

                    <button
                      onClick={() => setActiveModal('TAX_AUDIT')}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full shadow-xs border border-[#cabb9e] transition-all cursor-pointer shrink-0"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#122c20]" />
                      <span>Tax</span>
                    </button>

                    <button
                      onClick={() => handleTabChange('online-orders')}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full shadow-xs border border-[#cabb9e] transition-all cursor-pointer shrink-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#122c20]" />
                      <span>Online Orders</span>
                    </button>

                    <button
                      onClick={() => setActiveModal('TOTAL_SALES')}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full shadow-xs border border-[#cabb9e] transition-all cursor-pointer shrink-0"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-[#122c20]" />
                      <span>Sales Audit</span>
                    </button>
                  </div>
                </div>

                {/* Main Dashboard Layout: Left Dark Green Analytics Card + Right 4 Gold Metric Badges */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1">
                  
                  {/* Left Panel: Total Sales Dashboard Card */}
                  <div className="lg:col-span-7 flex flex-col">
                    <div 
                      onClick={() => setActiveModal('TOTAL_SALES')}
                      className={`text-slate-100 rounded-2xl p-4 border-2 shadow-2xl relative overflow-hidden flex flex-col justify-between flex-1 min-h-[290px] cursor-pointer transition-colors duration-500 ${
                        isBrownBranch
                          ? 'bg-[#3E2312] border-[#542A16]'
                          : 'bg-[#0f3823] border-[#194c31]'
                      }`}
                    >
                      
                      {/* Card Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded-full ${isBrownBranch ? 'bg-[#542A16] text-[#C69A4B]' : 'bg-[#194c31] text-[#4ade80]'}`}>
                              <TrendingUp className="w-3.5 h-3.5" />
                            </span>
                            <p className={`text-[11px] font-bold ${isBrownBranch ? 'text-[#E8D8C2]' : 'text-[#a3c7b5]'}`}>
                              Total Sales ({salesTimeframe === 'today' ? 'TODAY' : salesTimeframe === 'week' ? 'THIS WEEK' : 'THIS MONTH'})
                            </p>
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${
                              isBrownBranch 
                                ? 'bg-[#542A16] text-[#C69A4B] border-[#7A4325]' 
                                : 'bg-[#184a30] text-[#4ade80] border-[#2d664b]'
                            }`}>
                              +12.4%
                            </span>
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans pt-0.5">
                            ₹{currentTotalSales.toLocaleString('en-IN')}
                          </h3>

                          <div className={`flex items-center gap-3 text-[11px] pt-0.5 font-semibold ${isBrownBranch ? 'text-[#E8D8C2]' : 'text-[#a3c7b5]'}`}>
                            <span>POS <strong className="text-white">₹{currentPosSales.toLocaleString('en-IN')}</strong></span>
                            <span>•</span>
                            <span>Online <strong className="text-white">₹{currentOnlineSales.toLocaleString('en-IN')}</strong></span>
                          </div>
                        </div>

                        {/* Timeframe Selector Pills */}
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className={`flex items-center p-1 rounded-full border self-start sm:self-center ${
                            isBrownBranch ? 'bg-[#2D190D] border-[#542A16]' : 'bg-[#092416] border-[#194c31]'
                          }`}
                        >
                          {['today', 'week', 'month'].map((t) => (
                            <button
                              key={t}
                              onClick={() => setSalesTimeframe(t)}
                              className={`px-3 py-0.5 rounded-full text-[11px] font-black capitalize transition-all cursor-pointer ${
                                salesTimeframe === t
                                  ? isBrownBranch ? 'bg-[#FAF6EE] text-[#3E2312] shadow-md' : 'bg-[#f8f6f0] text-[#0f3823] shadow-md'
                                  : isBrownBranch ? 'text-[#C69A4B]/80 hover:text-white' : 'text-[#87a997] hover:text-white'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Full Width Dynamic Bar Chart with Integrated SVG Axis Labels */}
                      {(() => {
                        let trendData = [];
                        if (salesTimeframe === 'today') {
                          const defaultBuckets = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];
                          const rawList = Array.isArray(stats?.charts?.salesTrend) ? stats.charts.salesTrend : [];
                          trendData = defaultBuckets.map(b => {
                            const bNorm = b.toUpperCase().replace(/\s+/g, '');
                            const found = rawList.find(d => {
                              const tNorm = (d.time || '').toUpperCase().replace(/\s+/g, '').replace(/^0/, '').replace(':00', '');
                              return tNorm === bNorm || tNorm.replace(/^0/, '') === bNorm;
                            });
                            return { time: b, sales: found?.sales || 0, orders: found?.orders || 0 };
                          });
                        } else if (salesTimeframe === 'week') {
                          const defaultBuckets = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                          const rawList = Array.isArray(stats?.charts?.salesTrend) ? stats.charts.salesTrend : [];
                          trendData = defaultBuckets.map(b => {
                            const found = rawList.find(d => (d.time || '').toUpperCase().startsWith(b.toUpperCase().slice(0, 3)));
                            return { time: b, sales: found?.sales || 0, orders: found?.orders || 0 };
                          });
                        } else {
                          // month
                          const defaultBuckets = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                          const rawList = Array.isArray(stats?.charts?.salesTrend) ? stats.charts.salesTrend : [];
                          trendData = defaultBuckets.map(b => {
                            const bNorm = b.toUpperCase().replace(/\s+/g, '');
                            const found = rawList.find(d => (d.time || '').toUpperCase().replace(/\s+/g, '') === bNorm);
                            return { time: b, sales: found?.sales || 0, orders: found?.orders || 0 };
                          });
                        }

                        const rawMax = Math.max(...trendData.map(d => d.sales || 0), 0);
                        const getNiceMax = (val) => {
                          if (val <= 0) return 100;
                          if (val <= 50) return 50;
                          if (val <= 100) return 100;
                          if (val <= 250) return 250;
                          if (val <= 500) return 500;
                          if (val <= 1000) return 1000;
                          if (val <= 2500) return 2500;
                          if (val <= 5000) return 5000;
                          if (val <= 10000) return 10000;
                          return Math.ceil(val / 5000) * 5000;
                        };
                        const niceMax = getNiceMax(rawMax);

                        const formatYTick = (v) => {
                          if (v >= 1000) {
                            const k = v / 1000;
                            return `₹${k % 1 === 0 ? k : k.toFixed(1)}k`;
                          }
                          return `₹${Math.round(v)}`;
                        };

                        const pointCount = trendData.length;
                        const slotWidth = 500 / Math.max(1, pointCount);
                        const barWidth = pointCount === 4 ? 64 : (pointCount === 7 ? 40 : 34);
                        const baselineY = 125;
                        const maxHeight = 112;

                        const fullDayMap = {
                          'Mon': 'Monday',
                          'Tue': 'Tuesday',
                          'Wed': 'Wednesday',
                          'Thu': 'Thursday',
                          'Fri': 'Friday',
                          'Sat': 'Saturday',
                          'Sun': 'Sunday'
                        };

                        return (
                          <div className="w-full h-[160px] relative flex flex-col justify-between pt-1 pb-1 z-10">
                            <div className="flex-1 relative flex min-h-0">
                              {/* Left Y-Axis Values */}
                              <div className={`flex flex-col justify-between text-[9px] sm:text-[9.5px] font-mono pr-2 py-0.5 select-none w-9 text-right shrink-0 font-bold ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#a3c7b5]'}`}>
                                <span>{formatYTick(niceMax)}</span>
                                <span>{formatYTick(niceMax * 0.67)}</span>
                                <span>{formatYTick(niceMax * 0.33)}</span>
                                <span>₹0</span>
                              </div>

                              {/* SVG Histogram Chart (Stretches Full Width & Height) */}
                              <div className="flex-1 h-full min-h-0">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 135" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id="histBarGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={isBrownBranch ? "#E5B869" : "#4ade80"} stopOpacity="0.95" />
                                      <stop offset="100%" stopColor={isBrownBranch ? "#8D4D20" : "#166534"} stopOpacity="0.75" />
                                    </linearGradient>
                                  </defs>

                                  {/* Horizontal Gridlines */}
                                  <line x1="0" y1="12" x2="500" y2="12" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                                  <line x1="0" y1="49" x2="500" y2="49" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                                  <line x1="0" y1="87" x2="500" y2="87" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                                  <line x1="0" y1={baselineY} x2="500" y2={baselineY} stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeWidth="1.2" />

                                  {/* Histogram Bars */}
                                  {trendData.map((d, i) => {
                                    const rawBarHeight = Math.max(0, ((d.sales || 0) / niceMax) * maxHeight);
                                    const hasSales = (d.sales || 0) > 0;
                                    const actualHeight = hasSales ? Math.max(4, rawBarHeight) : 2.5;
                                    const barX = i * slotWidth + (slotWidth - barWidth) / 2;
                                    const topY = baselineY - actualHeight;

                                    return (
                                      <g key={i}>
                                        <rect
                                          x={barX}
                                          y={topY}
                                          width={barWidth}
                                          height={actualHeight}
                                          rx="3.5"
                                          ry="3.5"
                                          fill={hasSales ? "url(#histBarGrad)" : (isBrownBranch ? "#542A16" : "#194c31")}
                                          stroke={hasSales ? (isBrownBranch ? "#C69A4B" : "#4ade80") : "transparent"}
                                          strokeWidth="1.2"
                                          opacity={hasSales ? 1 : 0.35}
                                        >
                                          <title>{`${d.time}: ₹${(d.sales || 0).toLocaleString('en-IN')}`}</title>
                                        </rect>

                                        {hasSales && (
                                          <rect
                                            x={barX}
                                            y={topY}
                                            width={barWidth}
                                            height={3}
                                            rx="1.5"
                                            fill={isBrownBranch ? "#FAF6EE" : "#bbf7d0"}
                                            opacity={0.85}
                                          />
                                        )}
                                      </g>
                                    );
                                  })}
                                </svg>
                              </div>
                            </div>

                            {/* X-Axis Time Ticks Centered Under Each Bar with Complete Visibility */}
                            <div 
                              className={`w-full pt-2 pb-0.5 select-none font-bold shrink-0 border-t ${
                                isBrownBranch ? 'border-[#542A16]/60' : 'border-[#194c31]/60'
                              }`}
                              style={{
                                paddingLeft: '36px',
                                display: 'grid',
                                gridTemplateColumns: `repeat(${trendData.length}, minmax(0, 1fr))`
                              }}
                            >
                              {trendData.map((d, idx) => (
                                <span 
                                  key={idx} 
                                  className={`text-[10px] sm:text-[11px] font-mono text-center font-extrabold tracking-tight truncate px-0.5 ${
                                    isBrownBranch ? 'text-[#FAF6EE]' : 'text-[#f0fdf4]'
                                  }`}
                                >
                                  {salesTimeframe === 'week' ? (
                                    <>
                                      <span className="hidden xl:inline">{fullDayMap[d.time] || d.time}</span>
                                      <span className="xl:hidden">{d.time}</span>
                                    </>
                                  ) : (
                                    d.time
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                    </div>
                  </div>

                  {/* Right Panel: 4 Gold Metric Badges */}
                  <div className="lg:col-span-5 flex flex-col justify-center relative">
                    <HexagonCards stats={stats} onOpenModal={(modalType) => setActiveModal(modalType)} selectedBranch={selectedBranch} />
                  </div>

                </div>

                {/* Bottom Stock Alerts Section matching reference image strictly */}
                <div className="space-y-2 pt-1 shrink-0">
                  
                  {/* Stock Alerts Section Title */}
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#11291f]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>STOCK ALERTS (INVENTORY QUANTITIES)</span>
                    </div>

                    <button 
                      onClick={() => handleTabChange('inventory')}
                      className="text-[11px] text-[#0f3823] hover:underline font-black flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* Low Stock Alerts Ticker Banner (Dynamic from Inventory System) */}
                  <div className="bg-[#ebe0cb] p-2 rounded-xl border border-[#cabb9e] shadow-xs flex flex-wrap items-center gap-3 text-xs font-bold text-[#122c20]">
                    <div className="flex items-center gap-1 text-amber-900 font-black shrink-0">
                      <span className="text-xs">📢</span>
                      <span>Low Stock Alerts ({inventoryState.lowStockItems.length})</span>
                    </div>

                    {inventoryState.lowStockItems.length === 0 ? (
                      <span className="text-xs font-bold text-emerald-800">✨ All inventory stock levels are healthy!</span>
                    ) : (
                      inventoryState.lowStockItems.slice(0, 4).map(item => {
                        const isCritical = item.status === 'CRITICAL';
                        return (
                          <div 
                            key={item.id} 
                            className={`flex items-center gap-1 font-extrabold ${isCritical ? 'text-red-700' : 'text-amber-900'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-600' : 'bg-amber-600'}`}></span>
                            <span>{isCritical ? 'Critical' : 'Limit'}: <strong>{item.name} ({item.remainingStock} {item.unit})</strong></span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* 3 Bottom Summary Cards (Dynamic Real-Time Values) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Card 1: Stocks in per day */}
                    <div className="bg-[#ebdcc8] p-2.5 rounded-xl border border-[#cabb9e] flex items-center gap-2.5 shadow-xs">
                      <div className={`p-2 text-white rounded-lg shadow-xs ${isBrownBranch ? 'bg-[#542A16]' : 'bg-[#0f3823]'}`}>
                        <PackagePlus className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-[11px] text-[#11291f]">Stocks in per day</h5>
                        <p className="text-[10px] text-[#456351] font-bold mt-0.5">
                          total <strong className="text-[#11291f]">+{inventoryState.summary.dailyStockIn.toLocaleString('en-IN')} units</strong>, incoming {inventoryState.summary.displayDate}
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Stocks Out per day */}
                    <div className="bg-[#ebdcc8] p-2.5 rounded-xl border border-[#cabb9e] flex items-center gap-2.5 shadow-xs">
                      <div className="p-2 bg-[#7f1d1d] text-white rounded-lg shadow-xs">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-[11px] text-[#11291f]">Stocks Out per day</h5>
                        <p className="text-[10px] text-[#456351] font-bold mt-0.5">
                          total <strong className="text-[#11291f]">-{inventoryState.summary.dailyStockOut.toLocaleString('en-IN')} units</strong> on {inventoryState.summary.displayDate}
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Remaining Stocks */}
                    <div className="bg-[#ebdcc8] p-2.5 rounded-xl border border-[#cabb9e] flex items-center gap-2.5 shadow-xs">
                      <div className={`p-2 text-white rounded-lg shadow-xs ${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#064e3b]'}`}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-[11px] text-[#11291f]">Remaining Stocks</h5>
                        <p className="text-[11px] text-[#456351] font-bold mt-0.5">
                          total <strong className={`font-mono font-black ${isBrownBranch ? 'text-[#3E2312]' : 'text-[#0f3823]'}`}>{inventoryState.summary.totalRemainingStock.toLocaleString('en-IN')} units</strong>
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}



            {/* VIEW 2: POS / BILLING */}
            {activeTab === 'pos' && (
              <POSBillingView
                searchQuery={posSearchQuery}
                onSearchChange={setPosSearchQuery}
                products={productsData.products}
                categories={productsData.categories}
                selectedBranch={selectedBranch}
                onSaleCompleted={() => {
                  fetchDashboardStats(salesTimeframe).then(setStats);
                }}
              />
            )}

            {/* VIEW 3: DEDICATED AI CHATBOT WORKSPACE */}
            {activeTab === 'chatbot' && (
              <AIChatbotWorkspace onClose={() => handleTabChange('home')} selectedBranch={selectedBranch} />
            )}

            {/* VIEW 4: ONLINE ORDERS */}
            {activeTab === 'online-orders' && <OnlineOrdersView selectedBranch={selectedBranch} />}

            {/* VIEW 5: MENU & PRODUCTS */}
            {activeTab === 'menu-products' && <MenuProductsView selectedBranch={selectedBranch} />}

            {/* VIEW 6: INVENTORY */}
            {activeTab === 'inventory' && <RealTimeInventoryView selectedBranch={selectedBranch} onNavigate={handleTabChange} />}

            {/* VIEW 7: CUSTOMERS */}
            {activeTab === 'customers' && <CustomersView selectedBranch={selectedBranch} />}

            {/* VIEW 8: SALES, TAX & GST AUDIT REPORTS */}
            {activeTab === 'sales-reports' && <SalesReportView selectedBranch={selectedBranch} />}

            {/* VIEW 9: OPERATIONAL EXPENSES TRACKER */}
            {activeTab === 'expenses' && <ExpensesView selectedBranch={selectedBranch} />}

            {/* VIEW 10: STAFF MANAGEMENT */}
            {activeTab === 'staff' && <StaffView selectedBranch={selectedBranch} />}

            {/* VIEW 11: PURCHASE / STOCK IN */}
            {activeTab === 'purchase' && <PurchaseStockInView selectedBranch={selectedBranch} />}

            {/* VIEW 12: CAFÉ SETTINGS */}
            {activeTab === 'settings' && <SettingsView selectedBranch={selectedBranch} />}

            {/* VIEW 13: KVCM ASSISTANT */}
            {activeTab === 'kvcm-assistant' && <KVCMAssistantView selectedBranch={selectedBranch} />}

            </div>
          </main>
        </div>

      </div>

      {/* C. MOBILE BOTTOM NAVIGATION & DRAWER */}
      <MobileNav 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        selectedBranch={selectedBranch}
        onChangeBranch={() => {
          authStore.clearSelectedBranch();
        }}
        onLogout={() => authStore.logout()}
        currentUser={authState.currentUser}
      />
      <KPIDetailModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        stats={stats}
        selectedBranch={selectedBranch}
      />

    </div>
  );
}
