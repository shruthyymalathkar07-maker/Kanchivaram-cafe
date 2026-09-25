import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  Utensils, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  ChevronDown,
  Globe,
  X,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import { fetchSales, socket } from '../services/api';

export default function OnlineOrdersView({ selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  // Orders State (Default empty array [] -> Populated from PostgreSQL)
  const [orders, setOrders] = useState([]);

  // Load online orders from PostgreSQL backend
  useEffect(() => {
    let isMounted = true;
    const loadOnlineOrders = async () => {
      const branchId = selectedBranch?.id || 'branch-1';
      try {
        const salesData = await fetchSales('today', branchId, 'ONLINE');
        if (isMounted && Array.isArray(salesData)) {
          const mapped = salesData
            .filter(s => s.channel && !['POS', 'IN_STORE', 'In-Store POS'].includes(s.channel))
            .map(s => ({
              id: s.billNumber || s.id,
              platform: (s.channel || 'ONLINE').toUpperCase(),
              customer: s.customerName || 'Online Customer',
              phone: s.customerPhone || 'Phone unavailable',
              address: s.orderNote || 'Delivery Address',
              items: (s.items || []).map(i => `${i.quantity || 1}x ${i.name || i.productName}`).join(', ') || 'Online Order Items',
              total: s.grandTotal || 0,
              status: s.status || 'DONE',
              createdAt: s.createdAt
            }));
          setOrders(mapped);
        }
      } catch (err) {
        console.warn('[OnlineOrdersView] Fetch error:', err);
      }
    };

    loadOnlineOrders();

    if (socket) {
      socket.on('sale_created', loadOnlineOrders);
      return () => {
        isMounted = false;
        socket.off('sale_created', loadOnlineOrders);
      };
    }

    return () => { isMounted = false; };
  }, [selectedBranch?.id]);

  // Filter States
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Selected Order Modal State
  const [activeOrderDetail, setActiveOrderDetail] = useState(null);

  // Dynamic Metrics Calculation
  const totalOrdersCount = orders.length;
  const totalSalesAmount = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const newOrdersCount = orders.filter(o => o.status?.toUpperCase() === 'NEW').length;
  const prepOrdersCount = orders.filter(o => ['PREP', 'PREPARING'].includes(o.status?.toUpperCase())).length;
  const dispatchOrdersCount = orders.filter(o => ['DISPATCH', 'DISPATCHED'].includes(o.status?.toUpperCase())).length;
  const doneOrdersCount = orders.filter(o => ['DONE', 'DELIVERED', 'COMPLETED'].includes(o.status?.toUpperCase())).length;
  const cancelledOrdersCount = orders.filter(o => o.status?.toUpperCase() === 'CANCELLED').length;

  // Channel Counts Calculation
  const zomatoCount = orders.filter(o => o.platform?.toUpperCase() === 'ZOMATO').length;
  const swiggyCount = orders.filter(o => o.platform?.toUpperCase() === 'SWIGGY').length;
  const dunzoCount = orders.filter(o => o.platform?.toUpperCase() === 'DUNZO').length;
  const otherCount = orders.filter(o => !['ZOMATO', 'SWIGGY', 'DUNZO'].includes(o.platform?.toUpperCase())).length;

  // Filtered Orders List
  const filteredOrders = orders.filter(order => {
    // Channel filter
    if (selectedChannel !== 'ALL') {
      if (selectedChannel === 'OTHER') {
        if (['ZOMATO', 'SWIGGY', 'DUNZO'].includes(order.platform?.toUpperCase())) return false;
      } else if (order.platform?.toUpperCase() !== selectedChannel) {
        return false;
      }
    }
    // Status filter
    if (selectedStatus !== 'ALL') {
      const orderSt = order.status?.toUpperCase();
      if (selectedStatus === 'NEW' && orderSt !== 'NEW') return false;
      if (selectedStatus === 'PREPARING' && !['PREP', 'PREPARING'].includes(orderSt)) return false;
      if (selectedStatus === 'DISPATCHED' && !['DISPATCH', 'DISPATCHED'].includes(orderSt)) return false;
      if (selectedStatus === 'DONE' && !['DONE', 'DELIVERED', 'COMPLETED'].includes(orderSt)) return false;
      if (selectedStatus === 'CANCELLED' && orderSt !== 'CANCELLED') return false;
    }
    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = order.id?.toLowerCase().includes(q);
      const matchCustomer = order.customer?.toLowerCase().includes(q);
      const matchItem = order.items?.toLowerCase().includes(q);
      const matchPhone = order.phone?.toLowerCase().includes(q);
      if (!matchId && !matchCustomer && !matchItem && !matchPhone) return false;
    }
    return true;
  });

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (activeOrderDetail && activeOrderDetail.id === orderId) {
      setActiveOrderDetail(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="space-y-4 font-sans relative pb-6 w-full">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER MATCHING KANCHIVARAM CAFÉ DESIGN SYSTEM             */}
      {/* ========================================================================= */}
      <div className="bg-[#ebdcc8] text-[#122c20] rounded-2xl p-3 px-4 border border-[#cabb9e] shadow-sm flex flex-row items-center justify-between gap-3 shrink-0 relative overflow-hidden">
        
        {/* Left Side: Bike Icon & Title */}
        <div className="flex items-center gap-3 z-10">
          <div className={`p-2 rounded-xl shadow-xs border ${
            isBrownBranch ? 'bg-[#542A16] text-white border-[#7A4325]' : 'bg-[#0f3823] text-white border-[#194c31]'
          }`}>
            <Bike className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-serif font-black text-[#11291f] leading-none">
              Online Orders
            </h2>
            <p className="text-xs text-[#456351] font-bold mt-1">
              Manage Zomato, Swiggy, Dunzo and other delivery orders in one place.
            </p>
          </div>
        </div>

        {/* Right Side: Decorative Illustration */}
        {orders.length > 0 && (
          <div className="flex items-center gap-2 z-10 text-right shrink-0">
            <img
              src="/online_orders_empty_illustration.png"
              alt="Online Orders Delivery Illustration"
              className="h-16 sm:h-20 max-h-20 w-auto object-contain drop-shadow-xs"
            />
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 2. SEVEN SUMMARY METRIC CARDS ROW WITH PASTEL BACKGROUNDS     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 shrink-0">
        
        {/* Card 1: Today's Online Orders (Soft Pastel Green) */}
        <div className="bg-[#e2edd8] p-2.5 rounded-2xl border border-[#c5dbb4] shadow-xs flex items-center gap-2.5">
          <div className="p-2 bg-transparent text-[#11291f] shrink-0">
            <ShoppingBag className="w-5 h-5 text-[#11291f]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#425a4c] leading-tight">Today's<br />Online Orders</p>
            <p className="text-lg font-black font-mono text-[#11291f] mt-0.5 leading-none">{totalOrdersCount}</p>
          </div>
        </div>

        {/* Card 2: Online Sales (Soft Pastel Peach/Warm Beige) */}
        <div className="bg-[#fceee0] p-2.5 rounded-2xl border border-[#f5dac3] shadow-xs flex items-center gap-2.5">
          <div className="p-2 bg-transparent text-amber-900 shrink-0">
            <TrendingUp className="w-5 h-5 text-amber-900" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#634e3d] leading-none truncate">Online Sales</p>
            <p className="text-base font-black font-mono text-[#11291f] mt-1 leading-none">₹{totalSalesAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Card 3: New Orders (Soft Pastel Pink) */}
        <div className="bg-[#fde2e4] p-2.5 rounded-2xl border border-[#f9c6cb] shadow-xs flex items-center gap-2.5">
          <div className="p-2 bg-transparent text-red-600 shrink-0">
            <Clock className="w-5 h-5 text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#684146] leading-none truncate">New Orders</p>
            <p className="text-lg font-black font-mono text-red-600 mt-1 leading-none">{newOrdersCount}</p>
          </div>
        </div>

        {/* Card 4: Preparing (Soft Pastel Sky Blue) */}
        <div className="bg-[#e0f0fe] p-2.5 rounded-2xl border border-[#c4e3fe] shadow-xs flex items-center gap-2.5">
          <div className="p-2 bg-transparent text-blue-700 shrink-0">
            <Utensils className="w-5 h-5 text-blue-700" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#395368] leading-none truncate">Preparing</p>
            <p className="text-lg font-black font-mono text-blue-800 mt-1 leading-none">{prepOrdersCount}</p>
          </div>
        </div>

        {/* Card 5: Dispatched (Soft Pastel Warm Peach) */}
        <div className="bg-[#fdeed9] p-2.5 rounded-2xl border border-[#f9d9b7] shadow-xs flex items-center gap-2.5">
          <div className="p-2 bg-transparent text-orange-800 shrink-0">
            <Bike className="w-5 h-5 text-orange-800" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#634f3b] leading-none truncate">Dispatched</p>
            <p className="text-lg font-black font-mono text-orange-900 mt-1 leading-none">{dispatchOrdersCount}</p>
          </div>
        </div>

        {/* Card 6: Done (Soft Pastel Mint Green) */}
        <div className="bg-[#e2f0d9] p-2.5 rounded-2xl border border-[#c7e3b8] shadow-xs flex items-center gap-2.5">
          <div className="p-2 bg-transparent text-emerald-800 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-800" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#3e563d] leading-none truncate">Done</p>
            <p className="text-lg font-black font-mono text-emerald-900 mt-1 leading-none">{doneOrdersCount}</p>
          </div>
        </div>

        {/* Card 7: Cancelled (Soft Pastel Red/Pink) */}
        <div className="bg-[#fde2e4] p-2.5 rounded-2xl border border-[#f9c6cb] shadow-xs flex items-center gap-2.5">
          <div className="p-2 bg-transparent text-rose-700 shrink-0">
            <XCircle className="w-5 h-5 text-rose-700" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#684146] leading-none truncate">Cancelled</p>
            <p className="text-lg font-black font-mono text-rose-700 mt-1 leading-none">{cancelledOrdersCount}</p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CHANNEL FILTERS + SEARCH BAR + STATUS SELECTOR ROW                     */}
      {/* ========================================================================= */}
      <div className="bg-[#fdfbf7] p-2.5 rounded-2xl border border-[#cabb9e] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        
        {/* Left: Platform Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedChannel('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedChannel === 'ALL'
                ? isBrownBranch ? 'bg-[#542A16] text-white shadow-xs' : 'bg-[#0f3823] text-white shadow-xs'
                : 'bg-[#ebdcc8]/40 text-[#547363] hover:bg-[#ebdcc8] border border-[#cabb9e]/50'
            }`}
          >
            All Orders ({totalOrdersCount})
          </button>

          <button
            onClick={() => setSelectedChannel('ZOMATO')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedChannel === 'ZOMATO'
                ? 'bg-[#cb202d] text-white shadow-xs'
                : 'bg-[#ebdcc8]/40 text-[#cb202d] hover:bg-[#ebdcc8] border border-[#cabb9e]/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#cb202d] inline-block"></span>
            Zomato ({zomatoCount})
          </button>

          <button
            onClick={() => setSelectedChannel('SWIGGY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedChannel === 'SWIGGY'
                ? 'bg-[#fc8019] text-white shadow-xs'
                : 'bg-[#ebdcc8]/40 text-[#fc8019] hover:bg-[#ebdcc8] border border-[#cabb9e]/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#fc8019] inline-block"></span>
            Swiggy ({swiggyCount})
          </button>

          <button
            onClick={() => setSelectedChannel('DUNZO')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedChannel === 'DUNZO'
                ? 'bg-[#00b386] text-white shadow-xs'
                : 'bg-[#ebdcc8]/40 text-[#00b386] hover:bg-[#ebdcc8] border border-[#cabb9e]/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00b386] inline-block"></span>
            Dunzo ({dunzoCount})
          </button>

          <button
            onClick={() => setSelectedChannel('OTHER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedChannel === 'OTHER'
                ? 'bg-[#0f3823] text-white shadow-xs'
                : 'bg-[#ebdcc8]/40 text-[#547363] hover:bg-[#ebdcc8] border border-[#cabb9e]/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Other ({otherCount})
          </button>
        </div>

        {/* Right: Search Bar & Status Dropdown */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f3823]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, customer, item or order ID..."
              className="w-full pl-10 pr-3 py-1.5 bg-[#f0ebd9] border border-[#cabb9e] rounded-xl text-xs text-[#0f231a] placeholder-[#385344] focus:outline-none focus:ring-2 focus:ring-[#0f3823]/40 font-extrabold shadow-inner transition-all"
            />
          </div>

          {/* Status Select */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-7 pr-7 py-1.5 bg-[#fdfbf7] border border-[#cabb9e] rounded-xl text-xs font-bold text-[#11291f] focus:outline-none focus:border-[#0f3823] cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="PREPARING">Preparing</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DONE">Done</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Filter className="w-3 h-3 text-[#547363] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-[#547363] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN DUAL-STATE CONTENT AREA                                           */}
      {/* ========================================================================= */}
      
      {/* ------------------------------------------------------------------------- */}
      {/* STATE 1: ZERO REAL ORDERS -> SHOW APPROVED EMPTY STATE                    */}
      {/* ------------------------------------------------------------------------- */}
      {orders.length === 0 && (
        <div className="flex-1 bg-[#fdfbf7] rounded-2xl border border-[#cabb9e] shadow-sm p-6 sm:p-10 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          
          {/* Center Delivery Packaging Illustration Asset (100% Transparent PNG) */}
          <div className="relative w-full max-w-sm sm:max-w-md h-auto flex items-center justify-center mb-4 transition-transform hover:scale-102">
            <img
              src="/online_orders_empty_illustration.png"
              alt="Online Orders Delivery Packaging"
              className="w-full h-auto max-h-64 sm:max-h-72 object-contain relative z-10 drop-shadow-md"
            />
          </div>

          {/* Empty State Text */}
          <div className="text-center space-y-1.5 relative z-10">
            <h3 className="text-xl sm:text-2xl font-serif font-black text-[#11291f] tracking-wide">
              No online orders yet!
            </h3>
            <p className="text-xs sm:text-sm font-bold text-[#547363] max-w-md mx-auto leading-relaxed">
              Orders from Zomato, Swiggy, Dunzo and other channels will appear here automatically once integrated.
            </p>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* STATE 2: REAL ONLINE ORDERS EXIST -> SHOW POPULATED ORDERS GRID & LIST    */}
      {/* ------------------------------------------------------------------------- */}
      {orders.length > 0 && (
        <div className="flex-1 space-y-4">
          
          {filteredOrders.length === 0 ? (
            <div className="bg-[#fdfbf7] rounded-2xl border border-[#cabb9e] p-8 text-center text-[#547363] font-bold text-xs">
              No online orders match your active filter or search query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map(order => {
                const isZomato = order.platform?.toUpperCase() === 'ZOMATO';
                const isSwiggy = order.platform?.toUpperCase() === 'SWIGGY';
                const isDunzo = order.platform?.toUpperCase() === 'DUNZO';
                const badgeBg = isZomato ? 'bg-[#cb202d]' : isSwiggy ? 'bg-[#fc8019]' : isDunzo ? 'bg-[#00b386]' : 'bg-[#0f3823]';

                return (
                  <div
                    key={order.id}
                    onClick={() => setActiveOrderDetail(order)}
                    className="bg-[#fdfbf7] rounded-2xl p-4 border border-[#cabb9e] shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md hover:border-[#0f3823]/40 transition-all cursor-pointer relative overflow-hidden group"
                  >
                    {/* Top Row: Channel Badge & Order ID */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 text-white font-black text-[10px] uppercase rounded-full shadow-2xs ${badgeBg}`}>
                        {order.platform || 'ONLINE'}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#456351]">
                        {order.id}
                      </span>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-[#11291f] text-sm group-hover:text-[#0f3823] transition-colors">
                        {order.customer || 'Guest Customer'}
                      </h4>
                      <p className="text-xs text-[#547363] font-mono font-medium">
                        {order.phone || 'Phone unavailable'}
                      </p>
                      <p className="text-[11px] text-[#547363]/80 line-clamp-1">
                        {order.address || 'Address unavailable'}
                      </p>
                    </div>

                    {/* Items Summary Box */}
                    <div className="bg-[#ebdcc8]/40 p-2.5 rounded-xl border border-[#cabb9e]/50 text-xs">
                      <p className="text-[9.5px] uppercase font-black text-[#547363] tracking-wider mb-0.5">
                        Items Ordered:
                      </p>
                      <p className="font-bold text-[#11291f] line-clamp-2">
                        {order.items}
                      </p>
                    </div>

                    {/* Amount & Time */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-[#547363]">Grand Total</span>
                      <span className="font-black text-base font-mono text-[#11291f]">
                        ₹{Number(order.total || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Status Actions Row */}
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="bg-[#ebdcc8]/50 p-1 rounded-xl border border-[#cabb9e] grid grid-cols-4 gap-1 text-center"
                    >
                      {[
                        { id: 'NEW', label: 'New' },
                        { id: 'PREPARING', label: 'Prep' },
                        { id: 'DISPATCHED', label: 'Dispatch' },
                        { id: 'DONE', label: 'Done' }
                      ].map(st => {
                        const currentSt = order.status?.toUpperCase();
                        const isMatch = (st.id === 'PREPARING' && ['PREP', 'PREPARING'].includes(currentSt)) ||
                                        (st.id === 'DISPATCHED' && ['DISPATCH', 'DISPATCHED'].includes(currentSt)) ||
                                        (st.id === 'DONE' && ['DONE', 'DELIVERED', 'COMPLETED'].includes(currentSt)) ||
                                        (currentSt === st.id);

                        return (
                          <button
                            key={st.id}
                            onClick={() => updateOrderStatus(order.id, st.id)}
                            className={`py-1 rounded-lg text-[10px] font-black transition-all ${
                              isMatch
                                ? 'bg-[#0f3823] text-white shadow-xs'
                                : 'text-[#547363] hover:text-[#11291f]'
                            }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ORDER DETAIL MODAL DIALOG (STATE 2 ITEM VIEW)                          */}
      {/* ========================================================================= */}
      {activeOrderDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#fdfbf7] rounded-3xl border border-[#cabb9e] shadow-2xl max-w-lg w-full p-6 space-y-4 relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#ebdcc8] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#0f3823] text-[#4ade80] text-xs font-black rounded-full font-mono">
                  {activeOrderDetail.platform || 'ONLINE'}
                </span>
                <h3 className="text-base font-black font-serif text-[#11291f]">
                  Order {activeOrderDetail.id}
                </h3>
              </div>
              <button
                onClick={() => setActiveOrderDetail(null)}
                className="p-1 text-[#547363] hover:text-[#11291f] rounded-lg hover:bg-[#ebdcc8]/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3 text-xs">
              
              {/* Customer Box */}
              <div className="bg-[#ebdcc8]/30 p-3 rounded-2xl border border-[#cabb9e]/50 space-y-1">
                <p className="font-extrabold text-[#11291f] text-sm flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#0f3823]" />
                  <span>{activeOrderDetail.customer || 'Customer'}</span>
                </p>
                <p className="text-[#547363] font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#0f3823]" />
                  <span>{activeOrderDetail.phone || 'N/A'}</span>
                </p>
                <p className="text-[#547363] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0f3823] shrink-0" />
                  <span>{activeOrderDetail.address || 'N/A'}</span>
                </p>
              </div>

              {/* Items Box */}
              <div className="bg-white p-3 rounded-2xl border border-[#cabb9e]/60 space-y-1.5">
                <p className="font-black text-[#11291f] uppercase tracking-wider text-[10px]">
                  Order Items Breakdown:
                </p>
                <p className="font-bold text-[#11291f] text-sm">
                  {activeOrderDetail.items}
                </p>
              </div>

              {/* Total & Status Box */}
              <div className="flex items-center justify-between p-3 bg-[#e2edd8] rounded-2xl border border-[#c5dbb4]">
                <div>
                  <p className="text-[10px] font-bold text-[#425a4c] uppercase">Total Payable</p>
                  <p className="text-xl font-black font-mono text-[#11291f]">
                    ₹{Number(activeOrderDetail.total || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#425a4c] uppercase">Current Status</p>
                  <span className="px-3 py-1 bg-[#0f3823] text-white font-black text-xs rounded-full inline-block mt-0.5">
                    {activeOrderDetail.status || 'NEW'}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveOrderDetail(null)}
                className="px-5 py-2 bg-[#0f3823] text-white text-xs font-black rounded-xl shadow-xs border border-[#194c31]"
              >
                Close Order Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
