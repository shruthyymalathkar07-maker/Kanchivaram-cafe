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
import { fetchDashboardStats, fetchSales, socket } from '../services/api';

export default function SalesReportView({ selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  const [period, setPeriod] = useState('today'); // 'today', 'week', 'month'
  const [selectedChannelFilter, setSelectedChannelFilter] = useState('ALL'); // 'ALL', 'POS', 'ONLINE'
  const [sales, setSales] = useState([]);
  const [reportStats, setReportStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live PostgreSQL sales data
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const branchId = selectedBranch?.id || 'branch-1';
      try {
        const [statsData, salesData] = await Promise.all([
          fetchDashboardStats(period, branchId),
          fetchSales(period, branchId, 'ALL')
        ]);

        if (isMounted) {
          if (statsData) setReportStats(statsData);
          if (salesData && Array.isArray(salesData)) {
            setSales(salesData);
          } else if (statsData?.recentTransactions) {
            setSales(statsData.recentTransactions);
          }
        }
      } catch (err) {
        console.warn('[SalesReportView] Error loading PostgreSQL data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    if (socket) {
      const handleLiveSale = () => {
        loadData();
      };
      socket.on('sale_created', handleLiveSale);
      socket.on('inventory_updated', handleLiveSale);
      return () => {
        isMounted = false;
        socket.off('sale_created', handleLiveSale);
        socket.off('inventory_updated', handleLiveSale);
      };
    }

    return () => { isMounted = false; };
  }, [period, selectedBranch?.id]);

  const periodSales = sales.length > 0 ? sales : (reportStats?.recentTransactions || []);

  // Format accurate transaction date & time from actual DB timestamp (Asia/Kolkata / IST)
  const formatTxDateTime = (tx) => {
    if (tx.createdAt) {
      try {
        const d = new Date(tx.createdAt);
        if (!isNaN(d.getTime())) {
          const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
          const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
          return `${dateStr} at ${timeStr}`;
        }
      } catch (_) {}
    }
    const dStr = tx.date || tx.dateIso || 'Today';
    const tStr = tx.time ? ` at ${tx.time}` : '';
    return `${dStr}${tStr}`;
  };

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

  const onlinePlatforms = [
    { id: 'swiggy', name: 'Swiggy', logo: '🟧', grossSales: swiggyTotal, ordersCount: swiggyCount, netSales: swiggyTotal },
    { id: 'zomato', name: 'Zomato', logo: '🟥', grossSales: zomatoTotal, ordersCount: zomatoCount, netSales: zomatoTotal }
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
          <div className="w-full h-44 relative flex flex-col justify-between pt-1 overflow-hidden">
            {(() => {
              let trendData = [];
              if (period === 'today') {
                const defaultBuckets = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];
                const rawList = Array.isArray(reportStats?.charts?.salesTrend) ? reportStats.charts.salesTrend : [];
                trendData = defaultBuckets.map(b => {
                  const bNorm = b.toUpperCase().replace(/\s+/g, '');
                  const found = rawList.find(d => {
                    const tNorm = (d.time || '').toUpperCase().replace(/\s+/g, '').replace(/^0/, '').replace(':00', '');
                    return tNorm === bNorm || tNorm.replace(/^0/, '') === bNorm;
                  });
                  return { time: b, sales: found?.sales || 0, orders: found?.orders || 0 };
                });
              } else if (period === 'week') {
                const defaultBuckets = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const rawList = Array.isArray(reportStats?.charts?.salesTrend) ? reportStats.charts.salesTrend : [];
                trendData = defaultBuckets.map(b => {
                  const found = rawList.find(d => (d.time || '').toUpperCase().startsWith(b.toUpperCase().slice(0, 3)));
                  return { time: b, sales: found?.sales || 0, orders: found?.orders || 0 };
                });
              } else {
                // month
                const defaultBuckets = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                const rawList = Array.isArray(reportStats?.charts?.salesTrend) ? reportStats.charts.salesTrend : [];
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

              const count = trendData.length;
              const slotWidth = 500 / Math.max(1, count);
              const barWidth = count === 4 ? 64 : (count === 7 ? 40 : 34);
              const baselineY = 110;
              const maxHeight = 95;

              return (
                <div className="flex-1 relative flex flex-col justify-between h-full">
                  <div className="flex-1 relative flex">
                    {/* Left Y-Axis Values */}
                    <div className={`flex flex-col justify-between text-[9.5px] font-mono pr-2 py-0.5 select-none w-9 text-right shrink-0 font-bold ${isBrownBranch ? 'text-[#C69A4B]/80' : 'text-[#87a997]'}`}>
                      <span>{formatYTick(niceMax)}</span>
                      <span>{formatYTick(niceMax / 2)}</span>
                      <span>₹0</span>
                    </div>

                    {/* SVG Histogram Chart (Stretches Full Width & Height) */}
                    <div className="flex-1 h-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 115" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="salesReportBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isBrownBranch ? "#E5B869" : "#4ade80"} stopOpacity="0.95" />
                            <stop offset="100%" stopColor={isBrownBranch ? "#8D4D20" : "#166534"} stopOpacity="0.75" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Gridlines */}
                        <line x1="0" y1="15" x2="500" y2="15" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                        <line x1="0" y1="62" x2="500" y2="62" stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeDasharray="3 3" />
                        <line x1="0" y1={baselineY} x2="500" y2={baselineY} stroke={isBrownBranch ? "#542A16" : "#194c31"} strokeWidth="1.2" />

                        {/* Histogram Bars */}
                        {trendData.map((d, idx) => {
                          const rawBarHeight = Math.max(0, ((d.sales || 0) / niceMax) * maxHeight);
                          const hasSales = (d.sales || 0) > 0;
                          const actualHeight = hasSales ? Math.max(4, rawBarHeight) : 2.5;
                          const barX = idx * slotWidth + (slotWidth - barWidth) / 2;
                          const topY = baselineY - actualHeight;

                          return (
                            <g key={idx}>
                              <rect
                                x={barX}
                                y={topY}
                                width={barWidth}
                                height={actualHeight}
                                rx="3.5"
                                ry="3.5"
                                fill={hasSales ? "url(#salesReportBarGrad)" : (isBrownBranch ? "#542A16" : "#194c31")}
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
                                  height={2.5}
                                  rx="1.2"
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

                  {/* X-Axis Time Ticks Centered Under Each Bar */}
                  <div 
                    className="w-full pt-1 select-none font-bold shrink-0"
                    style={{
                      paddingLeft: '36px',
                      display: 'grid',
                      gridTemplateColumns: `repeat(${trendData.length}, minmax(0, 1fr))`
                    }}
                  >
                    {trendData.map((d, i) => (
                      <span key={i} className={`text-[10px] font-mono text-center font-bold tracking-tight truncate ${isBrownBranch ? 'text-[#E8D8C2]' : 'text-[#a3c7b5]'}`}>
                        {d.time}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
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
          
          <div className="flex items-center gap-2 flex-wrap">
            <CheckCircle className="w-4 h-4 text-[#0f3823] shrink-0" />
            <h3 className="font-serif font-black text-sm text-[#11291f] tracking-normal">
              Tax & GST Audit Ledger ({period.toUpperCase()})
            </h3>
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 bg-[#ebe0cb] text-[#456351] rounded-full text-[10px] sm:text-[10.5px] font-bold leading-normal whitespace-nowrap shrink-0 text-center">
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
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-[#ebdcc8] text-[#11291f] font-semibold uppercase text-[11px] tracking-wider border-b border-[#cabb9e] whitespace-nowrap">
                  <th className="py-2.5 px-3 text-center font-semibold">DATE & TIME</th>
                  <th className="py-2.5 px-3 text-center font-semibold">BILL / REF #</th>
                  <th className="py-2.5 px-3 text-center font-semibold">CHANNEL</th>
                  <th className="py-2.5 px-3 text-center font-semibold">PAYMENT</th>
                  <th className="py-2.5 px-3 text-center font-semibold">GROSS SALES (₹)</th>
                  <th className="py-2.5 px-3 text-center text-rose-800 font-semibold">DISCOUNT (₹)</th>
                  <th className="py-2.5 px-3 text-center font-semibold">TAXABLE (₹)</th>
                  <th className="py-2.5 px-3 text-center text-amber-900 font-semibold">GST 5% (₹)</th>
                  <th className="py-2.5 px-3 text-center font-semibold text-[#0f3823]">NET AMOUNT (₹)</th>
                  <th className="py-2.5 px-3 text-center font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded4c5] bg-white text-black font-medium whitespace-nowrap">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 px-4 text-center bg-[#fdfbf7]">
                      <div className="text-center space-y-1.5 max-w-sm mx-auto">
                        <h4 className="text-base font-serif font-semibold text-black">No transactions yet</h4>
                        <p className="text-xs font-normal text-[#547363] leading-relaxed">
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
                        <td className="py-2.5 px-3 text-[12.5px] font-semibold text-black text-center">
                          {formatTxDateTime(tx)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[12.5px] text-black text-center">
                          {tx.billNumber || tx.id}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[12.5px] text-black text-center">
                          {tx.channel || 'In-Store POS'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 bg-[#ebdcc8] text-black text-[11.5px] font-semibold rounded-md uppercase">
                            {tx.paymentMethod || 'CASH'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-[12.5px] text-black">
                          ₹{gSales.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-[12.5px] text-rose-700">
                          {disc > 0 ? `-₹${disc.toFixed(2)}` : '₹0.00'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-[12.5px] text-black">
                          ₹{taxAmt.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-[12.5px] text-amber-800">
                          ₹{gst.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-[12.5px] text-[#0f3823]">
                          ₹{net.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block px-3.5 py-1 bg-[#0f3823] text-[#4ade80] text-[9.5px] font-semibold rounded-full shadow-2xs uppercase tracking-wider">
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
                <h4 className="text-base font-serif font-black text-black">No transactions yet</h4>
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
                        <span className="font-semibold text-[12.5px] text-black block">{tx.billNumber || tx.id}</span>
                        <span className="text-[11.5px] text-[#557361] font-normal">{formatTxDateTime(tx)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-[#ebdcc8] text-black text-[10.5px] font-semibold rounded uppercase">
                          {tx.paymentMethod || 'CASH'}
                        </span>
                        <span className="px-2 py-0.5 bg-[#0f3823] text-[#4ade80] text-[9px] font-semibold rounded-full uppercase">
                          Done
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-3 gap-1.5 bg-[#ebdcc8]/30 p-2 rounded-xl border border-[#cabb9e]/50 text-xs">
                      <div>
                        <span className="text-[10px] text-[#547363] uppercase font-semibold block">Taxable</span>
                        <span className="font-semibold text-[12.5px] text-black">₹{taxAmt.toFixed(2)}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-amber-900 uppercase font-semibold block">GST 5%</span>
                        <span className="font-semibold text-[12.5px] text-amber-800">₹{gst.toFixed(2)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#0f3823] uppercase font-semibold block">Net Total</span>
                        <span className="font-semibold text-[12.5px] text-[#0f3823]">₹{net.toFixed(2)}</span>
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
