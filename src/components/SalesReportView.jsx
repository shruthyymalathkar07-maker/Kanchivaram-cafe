import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Tag, 
  Wallet, 
  ShoppingBag, 
  Calendar, 
  CheckCircle, 
  BarChart2, 
  CreditCard, 
  QrCode, 
  Banknote,
  Filter,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { inventoryStore } from '../services/inventoryStore';

export default function SalesReportView({ selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  const [period, setPeriod] = useState('today'); // 'today', 'week', 'month'
  const [selectedChannelFilter, setSelectedChannelFilter] = useState('ALL'); // 'ALL', 'POS', 'ONLINE'
  const [sales, setSales] = useState(() => inventoryStore.getState().sales || []);

  // Real-time subscription to inventoryStore sales
  useEffect(() => {
    setSales(inventoryStore.getState().sales || []);
    const unsubscribe = inventoryStore.subscribe(state => {
      setSales(state.sales || []);
    });
    return () => unsubscribe();
  }, []);

  // Filter sales by selected time period
  const getFilteredByPeriod = (allSales, selectedPeriod) => {
    if (!allSales || allSales.length === 0) return [];
    const todayIso = new Date().toISOString().split('T')[0];
    
    if (selectedPeriod === 'today') {
      return allSales.filter(s => s.dateIso === todayIso || !s.dateIso);
    }
    if (selectedPeriod === 'week') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return allSales.filter(s => new Date(s.createdAt || s.dateIso || Date.now()) >= sevenDaysAgo);
    }
    if (selectedPeriod === 'month') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return allSales.filter(s => new Date(s.createdAt || s.dateIso || Date.now()) >= thirtyDaysAgo);
    }
    return allSales;
  };

  const periodSales = getFilteredByPeriod(sales, period);

  // Dynamic Sales & Tax Calculations
  const grossSales = periodSales.reduce((sum, s) => {
    const lineTotalSum = (s.items || []).reduce((acc, i) => acc + (i.total || ((i.qty || 1) * (i.price || 0))), 0);
    return sum + (lineTotalSum > 0 ? lineTotalSum : (s.subtotal || 0));
  }, 0);

  const discounts = periodSales.reduce((sum, s) => sum + (s.discount || 0), 0);
  const netSales = periodSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
  const gstAmount = periodSales.reduce((sum, s) => sum + (s.tax || 0), 0);
  const taxableAmount = Math.max(0, netSales - gstAmount);
  const totalOrders = periodSales.length;

  // Filter transactions for Audit Ledger Table
  const filteredTransactions = periodSales.filter(t => {
    const isPos = !t.channel || t.channel === 'POS' || t.channel === 'In-Store POS';
    if (selectedChannelFilter === 'POS') return isPos;
    if (selectedChannelFilter === 'ONLINE') return !isPos;
    return true;
  });

  // Channel Settlement Breakdown sums
  const posSalesList = periodSales.filter(s => !s.channel || s.channel === 'POS' || s.channel === 'In-Store POS');
  const posSalesTotal = posSalesList.reduce((acc, s) => acc + (s.grandTotal || 0), 0);

  const swiggySalesList = periodSales.filter(s => s.channel === 'Swiggy');
  const swiggyTotal = swiggySalesList.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const swiggyCount = swiggySalesList.length;

  const zomatoSalesList = periodSales.filter(s => s.channel === 'Zomato');
  const zomatoTotal = zomatoSalesList.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const zomatoCount = zomatoSalesList.length;

  const dunzoSalesList = periodSales.filter(s => s.channel === 'Dunzo');
  const dunzoTotal = dunzoSalesList.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const dunzoCount = dunzoSalesList.length;

  const otherSalesList = periodSales.filter(s => s.channel && !['POS', 'In-Store POS', 'Swiggy', 'Zomato', 'Dunzo'].includes(s.channel));
  const otherTotal = otherSalesList.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const otherCount = otherSalesList.length;

  const onlinePlatforms = [
    { id: 'swiggy', name: 'Swiggy', logo: '🟧', grossSales: swiggyTotal, ordersCount: swiggyCount, netSales: swiggyTotal },
    { id: 'zomato', name: 'Zomato', logo: '🟥', grossSales: zomatoTotal, ordersCount: zomatoCount, netSales: zomatoTotal },
    { id: 'dunzo', name: 'Dunzo', logo: '🟩', grossSales: dunzoTotal, ordersCount: dunzoCount, netSales: dunzoTotal },
    { id: 'other', name: 'Other Online / Direct', logo: '🌐', grossSales: otherTotal, ordersCount: otherCount, netSales: otherTotal }
  ];

  // CSV File Export Handler
  const handleExportCSV = () => {
    const headers = ["Date & Time", "Bill Ref", "Channel", "Payment Method", "Gross Sales (INR)", "Discount (INR)", "Taxable Amount (INR)", "GST 5% (INR)", "Net Amount (INR)", "Status"];
    
    const csvRows = filteredTransactions.map(t => {
      const gSales = (t.subtotal || 0) + (t.tax || 0);
      const disc = t.discount || 0;
      const gst = t.tax || 0;
      const net = t.grandTotal || 0;
      const taxAmt = Math.max(0, net - gst);

      return [
        `"${t.date} ${t.time || ''}"`,
        `"${t.billNumber || t.id}"`,
        `"${t.channel || 'In-Store POS'}"`,
        `"${t.paymentMethod || 'CASH'}"`,
        gSales.toFixed(2),
        disc.toFixed(2),
        taxAmt.toFixed(2),
        gst.toFixed(2),
        net.toFixed(2),
        `"Completed"`
      ];
    });

    const csvData = [headers.join(","), ...csvRows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Kanchivaram_Cafe_GST_Sales_Report_${period.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3 font-sans relative pb-6 w-full">
      
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER IN WARM CREAM MATCHING HOME & POS THEME STRICTLY            */}
      {/* ========================================================================= */}
      <div className="bg-[#ebdcc8] text-[#122c20] rounded-2xl p-3.5 px-4 border border-[#cabb9e] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 relative overflow-hidden">
        


        <div className="flex items-center gap-3 z-10 min-w-0">
          <div className={`p-2.5 rounded-xl shadow-xs border shrink-0 ${
            isBrownBranch ? 'bg-[#542A16] text-white border-[#7A4325]' : 'bg-[#0f3823] text-white border-[#194c31]'
          }`}>
            <FileText className={`w-5 h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-serif font-black text-[#11291f] leading-tight flex items-center gap-2 truncate">
              SALES, TAX & GST AUDIT REPORTS
            </h2>
            <p className="text-xs text-[#456351] font-bold mt-0.5 truncate">
              Comprehensive revenue audit, 5% GST tax breakdown, and platform settlements.
            </p>
          </div>
        </div>

        {/* Right Action Bar: Period Selector & Real CSV Export Button */}
        <div className="flex flex-wrap items-center gap-2.5 z-10 self-start md:self-center shrink-0">
          
          {/* Period Selector Pills */}
          <div className={`flex items-center p-1 rounded-xl border shadow-2xs shrink-0 ${
            isBrownBranch ? 'bg-[#2D190D] border-[#542A16]' : 'bg-[#092416] border-[#194c31]'
          }`}>
            {['today', 'week', 'month'].map((t) => (
              <button
                key={t}
                onClick={() => setPeriod(t)}
                className={`px-3 py-1 rounded-lg text-xs font-black capitalize transition-all cursor-pointer ${
                  period === t
                    ? isBrownBranch ? 'bg-[#FAF6EE] text-[#3E2312] shadow-md font-extrabold' : 'bg-[#f8f6f0] text-[#0f3823] shadow-md font-extrabold'
                    : isBrownBranch ? 'text-[#C69A4B]/80 hover:text-white' : 'text-[#87a997] hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Export GST Report (CSV) Button */}
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer border shrink-0 whitespace-nowrap ${
              isBrownBranch ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]' : 'bg-[#103825] hover:bg-[#0a2618] border-[#194c31]'
            }`}
            title="Download CSV report file"
          >
            <Download className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
            <span>EXPORT GST REPORT (CSV)</span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SALES & TAX SUMMARY METRIC CARDS                                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 shrink-0">
        
        {/* Card 1: Gross Sales */}
        <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs space-y-1 min-w-0">
          <span className={`text-[10px] font-black ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} uppercase tracking-wider block truncate`}>Gross Sales</span>
          <p className={`text-base sm:text-lg font-mono font-black ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} leading-none truncate`}>₹{grossSales.toFixed(2)}</p>
          <span className="text-[9.5px] font-bold text-[#456351] block truncate">Total Invoiced</span>
        </div>

        {/* Card 2: Total Discounts */}
        <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black text-rose-900 uppercase tracking-wider block truncate">Discounts</span>
          <p className="text-base sm:text-lg font-mono font-black text-rose-700 leading-none truncate">₹{discounts.toFixed(2)}</p>
          <span className="text-[9.5px] font-bold text-[#456351] block truncate">Promotions</span>
        </div>

        {/* Card 3: Taxable Sales Amount */}
        <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black text-[#11291f] uppercase tracking-wider block truncate">Taxable Sales</span>
          <p className="text-base sm:text-lg font-mono font-black text-[#11291f] leading-none truncate">₹{taxableAmount.toFixed(2)}</p>
          <span className="text-[9.5px] font-bold text-[#456351] block truncate">Base Revenue</span>
        </div>

        {/* Card 4: Total GST Collected (5%) */}
        <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black text-[#b8860b] uppercase tracking-wider block truncate">GST (5%)</span>
          <p className="text-base sm:text-lg font-mono font-black text-[#b8860b] leading-none truncate">₹{gstAmount.toFixed(2)}</p>
          <span className="text-[9.5px] font-bold text-[#456351] block truncate">Output Tax</span>
        </div>

        {/* Card 5: Net Realized Amount */}
        <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs space-y-1 min-w-0">
          <span className={`text-[10px] font-black ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} uppercase tracking-wider block truncate`}>Net Realized</span>
          <p className={`text-base sm:text-lg font-mono font-black ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} leading-none truncate`}>₹{netSales.toFixed(2)}</p>
          <span className="text-[9.5px] font-bold text-[#456351] block truncate">Collected</span>
        </div>

        {/* Card 6: Total Orders Count */}
        <div className="bg-[#ebdcc8] p-3 rounded-xl border border-[#cabb9e] shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black text-[#11291f] uppercase tracking-wider block truncate">Total Bills</span>
          <p className="text-base sm:text-lg font-mono font-black text-[#11291f] leading-none truncate">{totalOrders}</p>
          <span className="text-[9.5px] font-bold text-[#456351] block truncate">Completed Orders</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. SALES ANALYTICS GRAPH & CHANNEL BREAKDOWN ROW                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 shrink-0">
        
        {/* Left Column: Sales Over Time Graph Card (LG: 7 Cols) */}
        <div className={`lg:col-span-7 rounded-2xl p-4 border-2 shadow-md flex flex-col justify-between space-y-3 overflow-hidden transition-colors duration-500 ${
          isBrownBranch ? 'bg-[#3E2312] text-white border-[#542A16]' : 'bg-[#0f3823] text-white border-[#194c31]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
              <h3 className="font-serif font-black text-sm text-white">Sales & Revenue Trend ({period.toUpperCase()})</h3>
            </div>
            {periodSales.length > 0 && (
              <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                isBrownBranch ? 'bg-[#542A16] text-[#C69A4B] border-[#7A4325]' : 'bg-[#184a30] text-[#4ade80] border-[#2d664b]'
              }`}>
                {periodSales.length} Transactions
              </span>
            )}
          </div>

          {/* Graph Content Container */}
          <div className="w-full h-44 relative flex flex-col justify-between pt-2 overflow-hidden">
            {periodSales.length === 0 ? (
              /* CLEAN ELEGANT EMPTY STATE WHEN NO SALES */
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 my-auto">
                <BarChart2 className={`w-8 h-8 mb-2 ${isBrownBranch ? 'text-[#C69A4B]/40' : 'text-[#4ade80]/40'}`} />
                <h4 className={`text-base font-serif font-black ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`}>No sales data yet</h4>
                <p className={`text-xs font-bold mt-1 max-w-xs leading-relaxed ${isBrownBranch ? 'text-[#E8D8C2]' : 'text-[#87a997]'}`}>
                  Completed POS bills and online orders will appear here automatically.
                </p>
              </div>
            ) : (
              /* REAL PLOTTED GRAPH WHEN SALES EXIST - X-AXIS LABELS STRICTLY INSIDE CARD */
              <div className="flex-1 relative flex flex-col justify-between h-full">
                <div className="flex-1 relative flex">
                  <div className={`flex flex-col justify-between text-[9px] font-mono pr-2 py-0.5 select-none shrink-0 ${isBrownBranch ? 'text-[#C69A4B]/70' : 'text-[#628774]'}`}>
                    <span>₹{(Math.max(...periodSales.map(s => s.grandTotal || 0)) || 100).toFixed(0)}</span>
                    <span>₹{((Math.max(...periodSales.map(s => s.grandTotal || 0)) || 100) / 2).toFixed(0)}</span>
                    <span>₹0</span>
                  </div>

                  <div className="flex-1 h-full relative">
                    <svg className="w-full h-full overflow-hidden" viewBox="0 0 500 130" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="salesReportGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isBrownBranch ? "#C69A4B" : "#4ade80"} stopOpacity="0.45" />
                          <stop offset="100%" stopColor={isBrownBranch ? "#C69A4B" : "#4ade80"} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="20" x2="500" y2="20" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                      <line x1="0" y1="65" x2="500" y2="65" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                      <line x1="0" y1="110" x2="500" y2="110" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                      
                      {/* Dynamically Plotted Sales Line */}
                      {(() => {
                        const maxVal = Math.max(...periodSales.map(s => s.grandTotal || 0)) || 100;
                        const points = periodSales.map((s, idx) => {
                          const x = periodSales.length === 1 ? 250 : (idx / (periodSales.length - 1)) * 480 + 10;
                          const y = 110 - ((s.grandTotal || 0) / maxVal) * 90;
                          return { x, y, sale: s };
                        });
                        const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
                        const areaD = `${pathD} L ${points[points.length - 1].x} 125 L ${points[0].x} 125 Z`;

                        return (
                          <>
                            <path d={areaD} fill="url(#salesReportGrad)" />
                            <path d={pathD} fill="none" stroke={isBrownBranch ? "#C69A4B" : "#4ade80"} strokeWidth="3" strokeLinecap="round" />
                            {points.map((pt, i) => (
                              <circle key={i} cx={pt.x} cy={pt.y} r="4" fill={isBrownBranch ? "#C69A4B" : "#4ade80"} stroke={isBrownBranch ? "#3E2312" : "#0f3823"} strokeWidth="2" />
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* X-AXIS TIME LABELS STRICTLY INSIDE THE GRAPH CONTAINER AT BOTTOM */}
                <div className={`flex justify-between text-[9px] font-mono pl-8 pr-2 pt-1 select-none font-bold shrink-0 border-t ${
                  isBrownBranch ? 'text-[#C69A4B]/80 border-[#542A16]' : 'text-[#87a997] border-[#194c31]/50'
                }`}>
                  {periodSales.slice(0, 6).map((s, i) => (
                    <span key={i} className="truncate max-w-[60px]">{s.time || s.billNumber || `Bill #${i+1}`}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: POS vs Online & Platform Settlements (LG: 5 Cols) */}
        <div className="lg:col-span-5 bg-[#fdfbf7] rounded-2xl p-4 border border-[#cabb9e] shadow-xs space-y-3 flex flex-col justify-between">
          
          <div className="flex items-center justify-between border-b border-[#ded4c5] pb-2">
            <h3 className="font-serif font-black text-sm text-[#11291f] flex items-center gap-1.5">
              <ShoppingBag className={`w-4 h-4 ${isBrownBranch ? 'text-[#542A16]' : 'text-[#0f3823]'}`} /> Channel Settlement Breakdown
            </h3>
            <span className="text-[10px] font-bold text-[#557361]">POS vs Platforms</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* POS Sales Strip */}
            <div className="bg-[#ebdcc8] p-2.5 rounded-xl border border-[#cabb9e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 text-white rounded-lg ${isBrownBranch ? 'bg-[#542A16]' : 'bg-[#0f3823]'}`}>
                  <Banknote className={`w-3.5 h-3.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
                </span>
                <div>
                  <h4 className="font-extrabold text-[#11291f] text-xs">In-Store POS Sales</h4>
                  <p className="text-[10px] text-[#456351] font-bold">Cash, UPI & Card Collections</p>
                </div>
              </div>
              <strong className="text-sm font-mono font-black text-[#0f3823]">₹{posSalesTotal.toFixed(2)}</strong>
            </div>

            {/* Online Platforms Strip */}
            <div className="space-y-1.5 pt-1">
              {onlinePlatforms.map((p) => (
                <div key={p.id} className="bg-white p-2 rounded-xl border border-[#ded4c5] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.logo}</span>
                    <div>
                      <h5 className="font-extrabold text-[#11291f] text-[11px] leading-tight">{p.name}</h5>
                      <p className="text-[9.5px] text-[#557361] font-bold">₹{p.grossSales.toFixed(2)} / {p.ordersCount} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-xs text-[#11291f] block">₹{p.grossSales.toFixed(2)}</span>
                    <span className="text-[9.5px] text-emerald-800 font-bold block">Net: ₹{p.netSales.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. DETAILED TAX & GST AUDIT TRANSACTION TABLE                             */}
      {/* ========================================================================= */}
      <div className="bg-[#fdfbf7] rounded-2xl border border-[#cabb9e] shadow-xs p-3 space-y-3 shrink-0 mt-3">
        
        {/* Table Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#0f3823]" />
            <h3 className="font-serif font-black text-sm text-[#11291f]">
              Tax & GST Audit Ledger ({period.toUpperCase()})
            </h3>
            <span className="px-2 py-0.5 bg-[#ebe0cb] text-[#456351] rounded-full text-[10px] font-bold">
              {filteredTransactions.length} records
            </span>
          </div>

          {/* Channel Filter Pills */}
          <div className="flex items-center gap-1 bg-[#ebe0cb] p-0.5 rounded-xl border border-[#cabb9e]">
            {[
              { id: 'ALL', label: 'All Transactions' },
              { id: 'POS', label: 'In-Store POS' },
              { id: 'ONLINE', label: 'Online Channels' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedChannelFilter(f.id)}
                className={`px-3 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  selectedChannelFilter === f.id
                    ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-2xs`
                    : 'text-[#456351] hover:text-[#122c20]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>

        {/* GST Transaction Content: Desktop Table (md+) & Mobile Cards (<md) */}
        <div>
          {/* DESKTOP TABLE: STRICTLY FROZEN & UNCHANGED (md:block) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-[#ded4c5]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#ebdcc8] text-[#11291f] font-black uppercase text-[10px] tracking-wider border-b border-[#cabb9e] whitespace-nowrap">
                  <th className="py-2.5 px-3">DATE & TIME</th>
                  <th className="py-2.5 px-3">BILL / REF #</th>
                  <th className="py-2.5 px-3">CHANNEL</th>
                  <th className="py-2.5 px-3 text-center">PAYMENT</th>
                  <th className="py-2.5 px-3 text-right">GROSS SALES (₹)</th>
                  <th className="py-2.5 px-3 text-right text-rose-800">DISCOUNT (₹)</th>
                  <th className="py-2.5 px-3 text-right font-black">TAXABLE (₹)</th>
                  <th className="py-2.5 px-3 text-right text-amber-900 font-black">GST 5% (₹)</th>
                  <th className="py-2.5 px-3 text-right font-black text-[#0f3823]">NET AMOUNT (₹)</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded4c5] bg-white text-[#122c20] font-medium whitespace-nowrap">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 px-4 text-center bg-[#fdfbf7]">
                      <div className="text-center space-y-1.5 max-w-sm mx-auto">
                        <h4 className="text-base font-serif font-black text-[#11291f]">No transactions yet</h4>
                        <p className="text-xs font-bold text-[#547363] leading-relaxed">
                          Completed POS bills and online orders will appear here automatically.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const gSales = (tx.subtotal || 0) + (tx.tax || 0);
                    const disc = tx.discount || 0;
                    const gst = tx.tax || 0;
                    const net = tx.grandTotal || 0;
                    const taxAmt = Math.max(0, net - gst);

                    return (
                      <tr key={tx.id} className="hover:bg-[#fbf8f3] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#557361] text-[11px]">
                          {tx.date} {tx.time ? `at ${tx.time}` : ''}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-black text-[#0f3823]">
                          {tx.billNumber || tx.id}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#11291f]">
                          {tx.channel || 'In-Store POS'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 bg-[#ebdcc8] text-[#122c20] text-[10px] font-extrabold rounded-md uppercase">
                            {tx.paymentMethod || 'CASH'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#11291f]">
                          ₹{gSales.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                          {disc > 0 ? `-₹${disc.toFixed(2)}` : '₹0.00'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-[#11291f]">
                          ₹{taxAmt.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-amber-800">
                          ₹{gst.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-sm text-[#0f3823]">
                          ₹{net.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 bg-[#0f3823] text-[#4ade80] text-[9.5px] font-black rounded-full shadow-2xs uppercase">
                            Completed
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE STRUCTURED AUDIT CARDS: DEDICATED ARRANGEMENT (<md) */}
          <div className="md:hidden space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#cabb9e] p-6 text-center shadow-xs">
                <h4 className="text-base font-serif font-black text-[#11291f]">No transactions yet</h4>
                <p className="text-xs text-[#547363] mt-1 font-medium">
                  Completed bills and online orders will appear here.
                </p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const gSales = (tx.subtotal || 0) + (tx.tax || 0);
                const disc = tx.discount || 0;
                const gst = tx.tax || 0;
                const net = tx.grandTotal || 0;
                const taxAmt = Math.max(0, net - gst);

                return (
                  <div
                    key={tx.id}
                    className="bg-white p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-2"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#ebdcc8] pb-1.5 text-xs">
                      <div>
                        <span className="font-mono font-black text-[#0f3823] block">{tx.billNumber || tx.id}</span>
                        <span className="text-[10px] text-[#557361] font-mono">{tx.date} {tx.time ? `• ${tx.time}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-[#ebdcc8] text-[#122c20] text-[9.5px] font-extrabold rounded uppercase">
                          {tx.paymentMethod || 'CASH'}
                        </span>
                        <span className="px-2 py-0.5 bg-[#0f3823] text-[#4ade80] text-[9px] font-black rounded-full uppercase">
                          Done
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-3 gap-1.5 bg-[#ebdcc8]/30 p-2 rounded-xl border border-[#cabb9e]/50 text-xs">
                      <div>
                        <span className="text-[9px] text-[#547363] uppercase font-bold block">Taxable</span>
                        <span className="font-mono font-bold text-[#11291f]">₹{taxAmt.toFixed(2)}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] text-amber-900 uppercase font-bold block">GST 5%</span>
                        <span className="font-mono font-bold text-amber-800">₹{gst.toFixed(2)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-[#0f3823] uppercase font-bold block">Net Total</span>
                        <span className="font-mono font-black text-[#0f3823]">₹{net.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
