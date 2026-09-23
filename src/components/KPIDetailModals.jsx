import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  DollarSign, 
  Tag, 
  Wallet, 
  ShoppingBag, 
  Clock, 
  Store, 
  ExternalLink,
  CheckCircle2,
  Receipt,
  Calendar,
  Percent,
  FileText
} from 'lucide-react';
import { inventoryStore } from '../services/inventoryStore';

export default function KPIDetailModals({ activeModal, onClose, stats, selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  // Tax Report Period Filter States
  const [taxPeriod, setTaxPeriod] = useState('today'); // 'today', 'week', 'month', 'prev_month', 'custom'
  const [customStart, setCustomStart] = useState(() => new Date().toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);
  const [allSales, setAllSales] = useState(() => inventoryStore.getState().sales || []);

  useEffect(() => {
    setAllSales(inventoryStore.getState().sales || []);
    const unsubscribe = inventoryStore.subscribe((state) => {
      setAllSales(state.sales || []);
    });
    return () => unsubscribe();
  }, []);

  if (!activeModal) return null;

  const kpis = stats?.kpis || {};

  // Tax period filtering logic on actual sales transactions
  const getTaxFilteredSales = () => {
    if (!allSales || allSales.length === 0) return [];
    const todayIso = new Date().toISOString().split('T')[0];
    const now = new Date();

    if (taxPeriod === 'today') {
      return allSales.filter(s => s.dateIso === todayIso || !s.dateIso);
    }
    if (taxPeriod === 'week') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return allSales.filter(s => new Date(s.createdAt || s.dateIso || Date.now()) >= sevenDaysAgo);
    }
    if (taxPeriod === 'month') {
      const currentMonthPrefix = todayIso.slice(0, 7);
      return allSales.filter(s => (s.dateIso || '').startsWith(currentMonthPrefix));
    }
    if (taxPeriod === 'prev_month') {
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthPrefix = prevMonthDate.toISOString().slice(0, 7);
      return allSales.filter(s => (s.dateIso || '').startsWith(prevMonthPrefix));
    }
    if (taxPeriod === 'custom') {
      return allSales.filter(s => {
        const d = s.dateIso || todayIso;
        return d >= customStart && d <= customEnd;
      });
    }
    return allSales;
  };

  const taxFilteredSales = getTaxFilteredSales();

  // Dynamic Sales Tax Calculations
  const taxTotalSales = taxFilteredSales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const taxGstAmount = taxFilteredSales.reduce((acc, s) => acc + (s.tax || 0), 0);
  const taxTaxableSales = Math.max(0, taxTotalSales - taxGstAmount);
  const taxTransactionCount = taxFilteredSales.length;

  const cgstAmount = taxGstAmount / 2;
  const sgstAmount = taxGstAmount / 2;

  const posTaxSales = taxFilteredSales.filter(s => !s.channel || s.channel === 'POS' || s.channel === 'In-Store POS');
  const posGstAmount = posTaxSales.reduce((acc, s) => acc + (s.tax || 0), 0);

  const onlineTaxSales = taxFilteredSales.filter(s => s.channel && !['POS', 'In-Store POS'].includes(s.channel));
  const onlineGstAmount = onlineTaxSales.reduce((acc, s) => acc + (s.tax || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-[#fdfbf7] text-[#11291f] rounded-3xl border-2 border-[#d4af37] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans">
        
        {/* ========================================================================= */}
        {/* LIGHT PREMIUM MODAL HEADER                                                */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#ebdcc8] border-b border-[#cabb9e] shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isBrownBranch ? 'bg-[#3E2312] border-[#542A16]' : 'bg-[#0f3823] border-[#194c31]'} text-white border shadow-md shrink-0`}>
              {activeModal === 'TOTAL_SALES' && <TrendingUp className={`w-5 h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />}
              {activeModal === 'NET_SALES' && <DollarSign className={`w-5 h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />}
              {activeModal === 'DISCOUNTS' && <Tag className="w-5 h-5 text-rose-400" />}
              {activeModal === 'CASH_COLLECTION' && <Wallet className={`w-5 h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />}
              {activeModal === 'ONLINE_SALES' && <ShoppingBag className="w-5 h-5 text-amber-400" />}
              {activeModal === 'TAX_AUDIT' && <Receipt className={`w-5 h-5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-black tracking-tight text-[#11291f]">
                {activeModal === 'TOTAL_SALES' && 'Total Sales Analytics & Channel Breakdown'}
                {activeModal === 'NET_SALES' && 'Net Revenue & Margin Audit'}
                {activeModal === 'DISCOUNTS' && 'Discounts & Promotional Audit'}
                {activeModal === 'CASH_COLLECTION' && 'Cash & Payment Collection Audit'}
                {activeModal === 'ONLINE_SALES' && 'Online Platforms & Delivery Revenue'}
                {activeModal === 'TAX_AUDIT' && 'Sales Tax & GST Audit Reporting'}
              </h2>
              <p className="text-xs text-[#456351] font-bold mt-0.5">
                Kanchivaram Café • Real-Time Business Sales Audit
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`p-2 rounded-full bg-[#fdfbf7] hover:bg-[#dfd3bc] ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} border border-[#cabb9e] transition-colors cursor-pointer shadow-2xs`}
            title="Close Audit Popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY (WARM CREAM THEME WITH LIGHT CARDS)                            */}
        {/* ========================================================================= */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 bg-[#fdfbf7]">

          {/* ------------------------------------------------------------------------- */}
          {/* 1. TOTAL SALES / CHANNEL BREAKDOWN                                        */}
          {/* ------------------------------------------------------------------------- */}
          {activeModal === 'TOTAL_SALES' && (
            <div className="space-y-5">
              
              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                
                <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs space-y-1">
                  <p className="text-xs font-black text-[#456351] uppercase tracking-wider">Gross Revenue</p>
                  <h3 className="text-2xl font-black font-mono text-[#0f3823]">
                    ₹{(kpis.totalSales?.amount || 18450).toLocaleString('en-IN')}
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-extrabold">+14.2% vs yesterday</span>
                </div>

                <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs space-y-1">
                  <p className="text-xs font-black text-[#456351] uppercase tracking-wider">Total Orders</p>
                  <h3 className="text-2xl font-black font-mono text-[#11291f]">
                    {kpis.totalSales?.orderCount || 186}
                  </h3>
                  <span className="text-[11px] text-[#547363] font-bold">
                    Avg bill ₹{Math.round((kpis.totalSales?.amount || 18450) / (kpis.totalSales?.orderCount || 186))}
                  </span>
                </div>

                <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs space-y-1">
                  <p className="text-xs font-black text-[#456351] uppercase tracking-wider">In-Store vs Online</p>
                  <h3 className="text-2xl font-black font-mono text-[#0f3823]">65% / 35%</h3>
                  <span className="text-[11px] text-[#547363] font-bold">Strong counter sales</span>
                </div>

              </div>

              {/* Channel Breakdown Visual Progress Bars */}
              <div className="bg-[#fbf8f3] p-5 rounded-2xl border border-[#cabb9e] space-y-3.5 shadow-xs">
                <h4 className="text-xs font-black text-[#11291f] uppercase tracking-wider">Channel Breakdown</h4>
                
                <div className="space-y-3">
                  
                  {/* In-Store POS */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="flex items-center gap-2 text-[#11291f]">
                        <Store className={`w-4 h-4 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} /> In-Store POS Sales
                      </span>
                      <span className={`${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} font-mono font-black`}>
                        ₹{(kpis.totalSales?.inStore || 12000).toLocaleString('en-IN')} (65%)
                      </span>
                    </div>
                    <div className="w-full bg-[#ebdcc8] h-2.5 rounded-full overflow-hidden">
                      <div className={`${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} h-full rounded-full`} style={{ width: '65%' }} />
                    </div>
                  </div>

                  {/* Swiggy Orders */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="flex items-center gap-2 text-[#11291f]">
                        <ShoppingBag className="w-4 h-4 text-amber-600" /> Swiggy Orders
                      </span>
                      <span className="text-amber-700 font-mono font-black">
                        ₹{(kpis.totalSales?.swiggy || 4500).toLocaleString('en-IN')} (24%)
                      </span>
                    </div>
                    <div className="w-full bg-[#ebdcc8] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-600 h-full rounded-full" style={{ width: '24%' }} />
                    </div>
                  </div>

                  {/* Direct Online */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="flex items-center gap-2 text-[#11291f]">
                        <ExternalLink className="w-4 h-4 text-blue-600" /> Direct Online Website
                      </span>
                      <span className="text-blue-700 font-mono font-black">
                        ₹{(kpis.totalSales?.otherOnline || 1950).toLocaleString('en-IN')} (11%)
                      </span>
                    </div>
                    <div className="w-full bg-[#ebdcc8] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '11%' }} />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* 2. NET SALES / MARGIN AUDIT                                               */}
          {/* ------------------------------------------------------------------------- */}
          {activeModal === 'NET_SALES' && (
            <div className="space-y-5">
              
              {/* Highlight Banner */}
              <div className="bg-[#ebdcc8]/70 p-5 rounded-2xl border border-[#cabb9e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <p className="text-xs font-black text-[#456351] uppercase tracking-wider">Overall Net Sales (Gross Minus Tax & Discounts)</p>
                  <h3 className="text-3xl font-black font-mono text-[#0f3823] mt-1">
                    ₹{(kpis.netSales?.overallNet || 16208).toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="text-right text-xs text-[#456351] font-bold space-y-0.5">
                  <p>Gross Sales: <strong className="text-[#11291f]">₹{(kpis.totalSales?.amount ?? 0).toLocaleString('en-IN')}</strong></p>
                  <p>Taxes: <strong className="text-rose-700">-₹{(kpis.tax?.gstAmount ?? 0).toLocaleString('en-IN')}</strong></p>
                  <p>Discounts: <strong className="text-rose-700">-₹{(kpis.discounts?.amount ?? 0).toLocaleString('en-IN')}</strong></p>
                </div>
              </div>

              <h4 className="text-xs font-black text-[#11291f] uppercase tracking-wider">Channel Net Revenue Audit</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                
                <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-black text-[#456351]">
                    <span>In-Store Counter Net</span>
                    <Store className={`w-4 h-4 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
                  </div>
                  <h4 className={`text-2xl font-black font-mono ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`}>
                    ₹{(kpis.netSales?.inStoreNet ?? 0).toLocaleString('en-IN')}
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-extrabold">Direct counter sales</p>
                </div>

                <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-black text-[#456351]">
                    <span>Swiggy Delivery Net</span>
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                  </div>
                  <h4 className="text-2xl font-black font-mono text-[#11291f]">
                    ₹{(kpis.onlineSales?.swiggy ?? 0).toLocaleString('en-IN')}
                  </h4>
                  <p className="text-[11px] text-[#547363] font-bold">Swiggy channel</p>
                </div>

                <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-black text-[#456351]">
                    <span>Direct Web Orders Net</span>
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-2xl font-black font-mono text-[#11291f]">
                    ₹{(kpis.onlineSales?.otherChannels ?? 0).toLocaleString('en-IN')}
                  </h4>
                  <p className="text-[11px] text-[#547363] font-bold">Direct Online channel</p>
                </div>

              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* 3. DISCOUNTS & PROMOTIONAL AUDIT                                          */}
          {/* ------------------------------------------------------------------------- */}
          {activeModal === 'DISCOUNTS' && (
            <div className="space-y-5">
              
              {/* Top Highlight Card */}
              <div className="bg-[#fef2f2] p-5 rounded-2xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <p className="text-xs font-black text-rose-900 uppercase tracking-wider">Total Discounts Applied</p>
                  <h3 className="text-3xl font-black font-mono text-rose-700 mt-1">
                    ₹{(kpis.discounts?.amount ?? 0).toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="text-right text-xs text-rose-900 font-bold space-y-0.5">
                  <p className="font-extrabold">{kpis.discounts?.transactionCount ?? 0} Discounted Bills</p>
                  <p>Avg discount: <strong className="text-rose-700">₹{kpis.discounts?.avgDiscount ?? 0} / bill</strong></p>
                </div>
              </div>

              {/* Discount Categories */}
              <div className="space-y-3 bg-[#fbf8f3] p-5 rounded-2xl border border-[#cabb9e] shadow-xs">
                <h4 className="text-xs font-black text-[#11291f] uppercase tracking-wider">Discount Breakdown</h4>
                {(kpis.discounts?.transactionCount === 0 || !kpis.discounts?.byType) ? (
                  <p className="text-xs font-bold text-[#628774] text-center py-3">No promotional discounts recorded in selected timeframe.</p>
                ) : (
                  kpis.discounts.byType.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#f0ebd9] border border-[#cabb9e]">
                      <div>
                        <p className="text-xs font-bold text-[#11291f]">{d.name}</p>
                        <p className="text-[11px] text-[#547363] font-semibold">{d.count} transactions</p>
                      </div>
                      <span className="text-sm font-extrabold text-rose-700 font-mono">-₹{d.amount}</span>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* 4. CASH COLLECTION & PAYMENT AUDIT                                       */}
          {/* ------------------------------------------------------------------------- */}
          {activeModal === 'CASH_COLLECTION' && (
            <div className="space-y-5">
              
              {/* Highlight Card */}
              <div className="bg-[#ebdcc8]/70 p-5 rounded-2xl border border-[#cabb9e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <p className="text-xs font-black text-[#456351] uppercase tracking-wider">Physical Cash Collected</p>
                  <h3 className={`text-3xl font-black font-mono ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} mt-1`}>
                    ₹{(kpis.cashCollection?.amount ?? 0).toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="text-right text-xs text-[#456351] font-bold space-y-0.5">
                  <p>UPI Total: <strong className="text-[#11291f]">₹{(kpis.cashCollection?.upiAmount ?? 0).toLocaleString('en-IN')}</strong></p>
                  <p>Card Swipes: <strong className="text-[#11291f]">₹{(kpis.cashCollection?.cardAmount ?? 0).toLocaleString('en-IN')}</strong></p>
                </div>
              </div>

              {/* Payment Distribution */}
              <div className="bg-[#fbf8f3] p-5 rounded-2xl border border-[#cabb9e] space-y-4 shadow-xs">
                <h4 className="text-xs font-black text-[#11291f] uppercase tracking-wider">Payment Method Distribution</h4>
                {(kpis.cashCollection?.split || [
                  { method: 'Cash Payments', amount: kpis.cashCollection?.amount ?? 0, percentage: 0 },
                  { method: 'UPI / QR Payments (GPay, PhonePe)', amount: kpis.cashCollection?.upiAmount ?? 0, percentage: 0 },
                  { method: 'Card Swipes', amount: kpis.cashCollection?.cardAmount ?? 0, percentage: 0 }
                ]).map((m, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#11291f]">
                      <span>{m.method}</span>
                      <span className={`font-mono ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} font-black`}>₹{m.amount.toLocaleString('en-IN')} ({m.percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#ebdcc8] h-2.5 rounded-full overflow-hidden">
                      <div className={`${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} h-full rounded-full`} style={{ width: `${m.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* 5. ONLINE SALES / PRODUCT REVENUE                                         */}
          {/* ------------------------------------------------------------------------- */}
          {activeModal === 'ONLINE_SALES' && (
            <div className="space-y-5">
              
              {/* Highlight Banner */}
              <div className="bg-[#fef3c7]/70 p-5 rounded-2xl border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <p className="text-xs font-black text-amber-900 uppercase tracking-wider">Total Online Channel Revenue</p>
                  <h3 className="text-3xl font-black font-mono text-amber-800 mt-1">
                    ₹{(kpis.onlineSales?.amount ?? 0).toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="text-right text-xs text-amber-900 font-bold space-y-0.5">
                  <p className="font-extrabold">{kpis.onlineSales?.orderCount ?? 0} Online Orders</p>
                  <p>Net: <strong className="text-emerald-700">₹{(kpis.onlineSales?.netOnlineSales ?? 0).toLocaleString('en-IN')}</strong></p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-800 uppercase">Swiggy Delivery</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="text-2xl font-black font-mono text-[#11291f]">
                    ₹{(kpis.onlineSales?.swiggy ?? 0).toLocaleString('en-IN')}
                  </h4>
                  <p className="text-[11px] text-[#547363] font-bold">Swiggy channel</p>
                </div>

                <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-800 uppercase">Direct Café App</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="text-2xl font-black font-mono text-[#11291f]">
                    ₹{(kpis.onlineSales?.otherChannels ?? 0).toLocaleString('en-IN')}
                  </h4>
                  <p className="text-[11px] text-[#547363] font-bold">Direct app / online orders</p>
                </div>

              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* 6. TAX AUDIT & GST REPORTING                                              */}
          {/* ------------------------------------------------------------------------- */}
          {activeModal === 'TAX_AUDIT' && (
            <div className="space-y-5">
              
              {/* Period Selector Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#ebe0cb]/60 p-2 rounded-2xl border border-[#cabb9e]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'today', label: 'Today (Per Day)' },
                    { id: 'week', label: 'This Week' },
                    { id: 'month', label: 'This Month' },
                    { id: 'prev_month', label: 'Previous Month' },
                    { id: 'custom', label: 'Custom Range' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setTaxPeriod(p.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        taxPeriod === p.id
                          ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs`
                          : 'text-[#456351] hover:bg-[#ebdcc8] hover:text-[#11291f]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {taxPeriod === 'custom' && (
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className={`px-2 py-1 bg-white border border-[#cabb9e] rounded-lg text-xs font-mono font-bold focus:outline-none ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                    />
                    <span className="text-[#547363]">to</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className={`px-2 py-1 bg-white border border-[#cabb9e] rounded-lg text-xs font-mono font-bold focus:outline-none ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                    />
                  </div>
                )}
              </div>

              {/* 4 Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#fbf8f3] p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-1">
                  <span className="text-[10px] font-black text-[#456351] uppercase tracking-wider block">Total Sales</span>
                  <p className={`text-xl font-mono font-black ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`}>₹{taxTotalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <span className="text-[10px] text-[#547363] font-bold block">Gross Invoiced</span>
                </div>

                <div className="bg-[#fbf8f3] p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-1">
                  <span className="text-[10px] font-black text-[#11291f] uppercase tracking-wider block">Taxable Sales</span>
                  <p className="text-xl font-mono font-black text-[#11291f]">₹{taxTaxableSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <span className="text-[10px] text-[#547363] font-bold block">Base Revenue</span>
                </div>

                <div className="bg-[#fbf8f3] p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-1">
                  <span className="text-[10px] font-black text-[#b8860b] uppercase tracking-wider block">Tax Amount (5%)</span>
                  <p className="text-xl font-mono font-black text-[#b8860b]">₹{taxGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <span className="text-[10px] text-[#547363] font-bold block">Output GST Collected</span>
                </div>

                <div className="bg-[#fbf8f3] p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-1">
                  <span className="text-[10px] font-black text-[#456351] uppercase tracking-wider block">Bills / Orders</span>
                  <p className="text-xl font-mono font-black text-[#11291f]">{taxTransactionCount}</p>
                  <span className="text-[10px] text-[#547363] font-bold block">Total Transactions</span>
                </div>
              </div>

              {/* Tax Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] space-y-2">
                  <h4 className="text-xs font-black text-[#11291f] uppercase tracking-wider flex items-center justify-between">
                    <span>GST Tax Breakdown</span>
                    <Percent className={`w-4 h-4 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
                  </h4>
                  <div className="space-y-2 text-xs font-bold">
                    <div className="flex justify-between p-2 bg-[#f4ebd9] rounded-xl border border-[#ded4c5]">
                      <span>CGST (2.5% Central Tax)</span>
                      <span className="font-mono font-black text-[#11291f]">₹{cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-[#f4ebd9] rounded-xl border border-[#ded4c5]">
                      <span>SGST (2.5% State Tax)</span>
                      <span className="font-mono font-black text-[#11291f]">₹{sgstAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] space-y-2">
                  <h4 className="text-xs font-black text-[#11291f] uppercase tracking-wider flex items-center justify-between">
                    <span>Channel Tax Collected</span>
                    <Store className={`w-4 h-4 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
                  </h4>
                  <div className="space-y-2 text-xs font-bold">
                    <div className="flex justify-between p-2 bg-[#f4ebd9] rounded-xl border border-[#ded4c5]">
                      <span>In-Store POS GST (5%)</span>
                      <span className={`font-mono font-black ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`}>₹{posGstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-[#f4ebd9] rounded-xl border border-[#ded4c5]">
                      <span>Online Platforms GST (5%)</span>
                      <span className="font-mono font-black text-amber-700">₹{onlineGstAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Tax Ledger Table */}
              <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] space-y-3">
                <h4 className="text-xs font-black text-[#11291f] uppercase tracking-wider flex items-center justify-between">
                  <span>Sales Tax Audit Ledger ({taxFilteredSales.length} Transactions)</span>
                  <FileText className={`w-4 h-4 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
                </h4>

                <div className="overflow-x-auto rounded-xl border border-[#ded4c5] max-h-56">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#ebdcc8] text-[#11291f] font-black uppercase text-[10px] tracking-wider border-b border-[#cabb9e]">
                        <th className="py-2 px-3">Date &amp; Ref</th>
                        <th className="py-2 px-3">Channel</th>
                        <th className="py-2 px-3 text-right">Taxable</th>
                        <th className="py-2 px-3 text-right">CGST (2.5%)</th>
                        <th className="py-2 px-3 text-right">SGST (2.5%)</th>
                        <th className="py-2 px-3 text-right">Total Tax</th>
                        <th className="py-2 px-3 text-right">Net Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ded4c5] bg-white font-medium text-[#11291f]">
                      {taxFilteredSales.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-6 text-center text-xs font-bold text-[#547363]">
                            No completed sales tax records found for this period.
                          </td>
                        </tr>
                      ) : (
                        taxFilteredSales.map(t => {
                          const tGst = t.tax || 0;
                          const tNet = t.grandTotal || 0;
                          const tTaxable = Math.max(0, tNet - tGst);
                          return (
                            <tr key={t.id} className="hover:bg-[#fbf8f3]">
                              <td className="py-2 px-3 font-mono font-bold text-[11px]">
                                {t.date} <span className="text-[#547363] text-[10px]">({t.billNumber || t.id})</span>
                              </td>
                              <td className="py-2 px-3">
                                <span className="px-1.5 py-0.5 bg-[#ebe0cb] text-[10px] font-bold rounded">
                                  {t.channel || 'POS'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-mono">₹{tTaxable.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-mono text-[#547363]">₹{(tGst / 2).toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-mono text-[#547363]">₹{(tGst / 2).toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-[#b8860b]">₹{tGst.toFixed(2)}</td>
                              <td className={`py-2 px-3 text-right font-mono font-black ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`}>₹{tNet.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* LIGHT MODAL FOOTER                                                        */}
        {/* ========================================================================= */}
        <div className="px-6 py-3.5 bg-[#ebdcc8] border-t border-[#cabb9e] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className={`px-6 py-2 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D] border-[#542A16]' : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]'} text-white font-black text-xs rounded-xl shadow-md border transition-all cursor-pointer`}
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
}

