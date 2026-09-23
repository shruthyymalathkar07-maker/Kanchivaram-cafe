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

export default function App() {
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) return tabParam;
    if (window.location.hash) return window.location.hash.replace('#', '');
    return 'home';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [salesTimeframe, setSalesTimeframe] = useState('today');
  const [posSearchQuery, setPosSearchQuery] = useState('');
  
  // KPI Detail Modal State (TOTAL_SALES, NET_SALES, DISCOUNTS, CASH_COLLECTION, ONLINE_SALES)
  const [activeModal, setActiveModal] = useState(null);

  // Authentication State
  const [authState, setAuthState] = useState(() => authStore.getState());

  // Live Data State
  const [stats, setStats] = useState(null);
  const [productsData, setProductsData] = useState({ categories: [], products: [] });
  const [inventoryState, setInventoryState] = useState(() => inventoryStore.getState());

  // Subscribe to authStore changes
  useEffect(() => {
    const unsubscribeAuth = authStore.subscribe(newState => {
      setAuthState(newState);
    });
    return unsubscribeAuth;
  }, []);

  // Sync selected branch with inventoryStore
  useEffect(() => {
    if (authState.selectedBranch?.id) {
      inventoryStore.setBranch(authState.selectedBranch.id);
    }
  }, [authState.selectedBranch?.id]);

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
      const branchId = authState.selectedBranch?.id || 'branch-1';
      const liveStats = await fetchDashboardStats(salesTimeframe, branchId);
      const liveProducts = await fetchProducts();
      if (liveStats) setStats(liveStats);
      if (liveProducts) setProductsData(liveProducts);
    };

    if (authState.isAuthenticated && authState.selectedBranch) {
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

    return () => {
      socket.off('sale_created');
      socket.off('stock_updated');
    };
  }, [salesTimeframe, authState.isAuthenticated, authState.selectedBranch?.id]);

  // UNAUTHENTICATED ROUTE PROTECTION: Show Login & Auth Flow
  if (!authState.isAuthenticated) {
    return (
      <AuthView
        key="auth-login"
        initialStep="LOGIN"
        onAuthSuccess={(newState) => {
          setAuthState(newState);
          setActiveTab('home');
        }}
      />
    );
  }

  // BRANCH SELECTION STEP PROTECTION
  if (!authState.selectedBranch) {
    return (
      <AuthView
        key="branch-select"
        initialStep="BRANCH_SELECT"
        onAuthSuccess={(newState) => {
          setAuthState(newState);
          setActiveTab('home');
        }}
      />
    );
  }

  const selectedBranch = authState.selectedBranch;
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  const currentTotalSales = stats?.kpis?.totalSales?.amount ?? 0;
  const currentPosSales = stats?.kpis?.totalSales?.inStore ?? 0;
  const currentOnlineSales = stats?.kpis?.totalSales?.online ?? 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8f6f0] text-slate-900 font-sans antialiased selection:bg-[#4ade80] selection:text-[#0f231a]">
      
      {/* Main Full-Width Application Shell */}
      <div className="flex w-full h-screen overflow-hidden bg-[#f8f6f0]">
        
        {/* A. LEFT SIDEBAR */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          selectedBranch={authState.selectedBranch}
          onChangeBranch={() => authStore.clearSelectedBranch()}
        />

        {/* Main Content Shell */}
        <div className={`flex-1 flex flex-col min-w-0 bg-[#f8f6f0] relative h-[100dvh] md:h-screen ${activeTab === 'kvcm-assistant' || activeTab === 'chatbot' ? 'overflow-hidden' : 'overflow-y-auto'}`}>

          {/* B. TOP HEADER */}
          <Header 
            activeTab={activeTab}
            searchQuery={posSearchQuery}
            onSearchChange={setPosSearchQuery}
            onNavigateTab={(tab) => setActiveTab(tab)} 
            onOpenNotifications={() => alert("Notification: Stock levels updated! 3 items are at low threshold.")} 
            currentUser={authState.currentUser}
            selectedBranch={authState.selectedBranch}
            onLogout={() => authStore.logout()}
            onChangeBranch={() => authStore.clearSelectedBranch()}
          />

          {/* Dynamic Main Body Content */}
          <main className={`flex-1 p-2 sm:p-3 lg:p-4 max-w-[1600px] w-full mx-auto flex flex-col ${activeTab === 'kvcm-assistant' || activeTab === 'chatbot' ? 'pb-20 md:pb-4 overflow-hidden min-h-0' : 'space-y-2.5 pb-20 md:pb-4'}`}>
            
            {/* VIEW 1: HOME DASHBOARD */}
            {activeTab === 'home' && (
              <div className="space-y-2.5 flex-1 flex flex-col">
                
                {/* Greeting Banner */}
                <div className="space-y-2 shrink-0">
                  <div className="relative overflow-hidden bg-[#ebdcc8] text-[#122c20] rounded-2xl p-3.5 shadow-sm border border-[#cabb9e] flex flex-col md:flex-row md:items-center justify-between gap-2 min-h-[56px]">
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

                  {/* Quick Action Buttons Row */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => setActiveTab('pos')}
                      className={`flex items-center gap-2 px-4 py-1.5 text-white font-black text-xs rounded-full shadow-md transition-all cursor-pointer border ${
                        isBrownBranch 
                          ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' 
                          : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'
                      }`}
                    >
                      <PlusCircle className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
                      <span>+ New Bill</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('inventory')}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full shadow-xs border border-[#cabb9e] transition-all cursor-pointer"
                    >
                      <PackagePlus className="w-3.5 h-3.5 text-[#122c20]" />
                      <span>Receive Stock</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('online-orders')}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full shadow-xs border border-[#cabb9e] transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#122c20]" />
                      <span>Online Orders</span>
                    </button>

                    <button
                      onClick={() => setActiveModal('TOTAL_SALES')}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full shadow-xs border border-[#cabb9e] transition-all cursor-pointer"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-[#122c20]" />
                      <span>Sales Audit</span>
                    </button>

                    <button
                      onClick={() => setActiveModal('TAX_AUDIT')}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#122c20] font-black text-xs rounded-full shadow-xs border border-[#cabb9e] transition-all cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#122c20]" />
                      <span>Tax</span>
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
                              Total Sales (TODAY)
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

                      {/* Full Width Spline Area Chart */}
                      <div className="w-full h-[190px] relative flex flex-col justify-between pt-4 z-10">
                        <div className="flex-1 relative flex">
                          <div className={`flex flex-col justify-between text-[9px] font-mono pr-2 py-0.5 select-none ${isBrownBranch ? 'text-[#C69A4B]/70' : 'text-[#628774]'}`}>
                            <span>₹3k</span>
                            <span>₹2k</span>
                            <span>₹1k</span>
                            <span>0</span>
                          </div>

                          <div className="flex-1 h-full">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                              <defs>
                                <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={isBrownBranch ? "#C69A4B" : "#4ade80"} stopOpacity="0.45" />
                                  <stop offset="100%" stopColor={isBrownBranch ? "#C69A4B" : "#4ade80"} stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              <line x1="0" y1="20" x2="500" y2="20" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                              <line x1="0" y1="70" x2="500" y2="70" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                              <line x1="0" y1="120" x2="500" y2="120" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                              <line x1="0" y1="170" x2="500" y2="170" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                              <path
                                d="M 0 160 C 70 140, 130 115, 200 120 C 270 125, 340 70, 420 80 C 460 85, 480 30, 500 20 L 500 200 L 0 200 Z"
                                fill="url(#chartAreaGrad)"
                              />
                              <path
                                d="M 0 160 C 70 140, 130 115, 200 120 C 270 125, 340 70, 420 80 C 460 85, 480 30, 500 20"
                                fill="none"
                                stroke={isBrownBranch ? "#C69A4B" : "#4ade80"}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                              />
                              <circle cx="200" cy="120" r="4" fill={isBrownBranch ? "#C69A4B" : "#4ade80"} stroke={isBrownBranch ? "#3E2312" : "#0f3823"} strokeWidth="2" />
                              <circle cx="420" cy="80" r="4" fill={isBrownBranch ? "#C69A4B" : "#4ade80"} stroke={isBrownBranch ? "#3E2312" : "#0f3823"} strokeWidth="2" />
                              <circle cx="500" cy="20" r="5" fill={isBrownBranch ? "#C69A4B" : "#4ade80"} stroke={isBrownBranch ? "#3E2312" : "#0f3823"} strokeWidth="2.5" />
                            </svg>
                          </div>
                        </div>

                        {/* Time Ticks */}
                        <div className="flex justify-between text-[9px] font-mono text-[#87a997] pl-6 pt-1 select-none font-bold">
                          <span>6 AM</span>
                          <span>9 AM</span>
                          <span>12 PM</span>
                          <span>3 PM</span>
                          <span>6 PM</span>
                          <span>9 PM</span>
                        </div>
                      </div>

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
                      onClick={() => setActiveTab('inventory')}
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
              <AIChatbotWorkspace onClose={() => setActiveTab('home')} selectedBranch={selectedBranch} />
            )}

            {/* VIEW 4: ONLINE ORDERS */}
            {activeTab === 'online-orders' && <OnlineOrdersView selectedBranch={selectedBranch} />}

            {/* VIEW 5: MENU & PRODUCTS */}
            {activeTab === 'menu-products' && <MenuProductsView selectedBranch={selectedBranch} />}

            {/* VIEW 6: INVENTORY */}
            {activeTab === 'inventory' && <RealTimeInventoryView selectedBranch={selectedBranch} onNavigate={(tab) => setActiveTab(tab)} />}

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

          </main>
        </div>

      </div>

      {/* C. MOBILE BOTTOM NAVIGATION & DRAWER */}
      <MobileNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedBranch={authState.selectedBranch}
        onChangeBranch={() => authStore.clearSelectedBranch()}
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
