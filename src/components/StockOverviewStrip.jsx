import React from 'react';
import { PackageCheck, ArrowRight, AlertTriangle, Boxes, ShoppingCart, Archive, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { stockPipelineSummary } from '../data/mockData';

export default function StockOverviewStrip({ onOpenInventory }) {
  const summary = stockPipelineSummary;

  return (
    <div className="mt-6 space-y-4">
      
      {/* 📦 Stock Overview Pipeline Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-[#4ade80]" />
          <h3 className="text-base font-bold text-slate-100 tracking-wide">
            📦 Stock Overview & Daily Movement
          </h3>
          <span className="text-xs text-[#7da592] hidden md:inline">
            ( Opening + Received → Available → Sold → Remaining )
          </span>
        </div>

        {/* View Stock Details Button */}
        <button
          onClick={onOpenInventory}
          className="flex items-center gap-1.5 text-xs font-bold text-[#4ade80] hover:text-white bg-[#16382a] hover:bg-[#1f4a38] px-3.5 py-1.5 rounded-full border border-[#2e684f] transition-all"
        >
          <span>View Detailed Inventory Table</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stock Pipeline Flow Strip (Stock Received → Stock Available → Stock Sold/Used → Stock Remaining → Low Stock) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Step 1: Stock Received Today */}
        <div className="bg-[#163529] p-3.5 rounded-2xl border border-[#27523f] flex items-center gap-3 relative overflow-hidden group hover:border-[#4ade80]/50 transition-all">
          <div className="p-2.5 bg-[#1e4838] rounded-xl text-[#4ade80] shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#86b09c] uppercase tracking-wider">
              1. Received Today
            </p>
            <h4 className="text-xl font-bold text-white mt-0.5">
              +{summary.receivedToday} <span className="text-xs text-[#a4c5b5] font-normal">units</span>
            </h4>
          </div>
          <div className="hidden lg:block absolute right-1 top-1/2 -translate-y-1/2 text-[#27523f]">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Step 2: Stock Available */}
        <div className="bg-[#163529] p-3.5 rounded-2xl border border-[#27523f] flex items-center gap-3 relative overflow-hidden group hover:border-[#4ade80]/50 transition-all">
          <div className="p-2.5 bg-[#1e4838] rounded-xl text-[#d9a752] shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#86b09c] uppercase tracking-wider">
              2. Total Available
            </p>
            <h4 className="text-xl font-bold text-white mt-0.5">
              {summary.totalAvailable} <span className="text-xs text-[#a4c5b5] font-normal">units</span>
            </h4>
          </div>
        </div>

        {/* Step 3: Sold / Used Today */}
        <div className="bg-[#163529] p-3.5 rounded-2xl border border-[#27523f] flex items-center gap-3 relative overflow-hidden group hover:border-[#4ade80]/50 transition-all">
          <div className="p-2.5 bg-[#1e4838] rounded-xl text-[#e67e22] shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#86b09c] uppercase tracking-wider">
              3. Sold / Used
            </p>
            <h4 className="text-xl font-bold text-white mt-0.5">
              {summary.soldUsedToday} <span className="text-xs text-[#a4c5b5] font-normal">units</span>
            </h4>
          </div>
        </div>

        {/* Step 4: Total Remaining */}
        <div className="bg-[#163529] p-3.5 rounded-2xl border border-[#27523f] flex items-center gap-3 relative overflow-hidden group hover:border-[#4ade80]/50 transition-all">
          <div className="p-2.5 bg-[#1e4838] rounded-xl text-[#4ade80] shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#86b09c] uppercase tracking-wider">
              4. Remaining Stock
            </p>
            <h4 className="text-xl font-bold text-white mt-0.5">
              {summary.totalRemaining} <span className="text-xs text-[#a4c5b5] font-normal">units</span>
            </h4>
          </div>
        </div>

        {/* Step 5: Low Stock Alerts Button */}
        <div 
          onClick={onOpenInventory}
          className="col-span-2 sm:col-span-1 bg-gradient-to-r from-[#381616] to-[#2a1212] p-3.5 rounded-2xl border-2 border-red-500/40 flex items-center gap-3 cursor-pointer hover:border-red-500 transition-all group"
        >
          <div className="p-2.5 bg-red-500/20 rounded-xl text-red-400 shrink-0 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-red-300 uppercase tracking-wider">
              5. Low Stock Alerts
            </p>
            <h4 className="text-xl font-black text-red-400 mt-0.5 flex items-center gap-1.5">
              <span>{summary.lowStockCount} Items</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            </h4>
          </div>
        </div>

      </div>

      {/* Prominent Low Stock Alert Banner (Requested explicitly by user) */}
      <div 
        onClick={onOpenInventory}
        className="bg-gradient-to-r from-[#2c1515] via-[#241313] to-[#1f0e0e] border border-red-500/40 rounded-2xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg cursor-pointer hover:border-red-400 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-full text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-red-200 text-sm flex items-center gap-2">
              <span>⚠️ Low Stock Alerts — {summary.lowStockCount} items need urgent restocking</span>
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-red-300/90 font-mono">
              {summary.lowStockItems.map((item, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <strong>{item.name}</strong> • {item.remaining} remaining
                </span>
              ))}
            </div>
          </div>
        </div>

        <button className="flex items-center gap-1 text-xs font-bold text-red-300 bg-red-950/60 hover:bg-red-900/80 px-3.5 py-1.5 rounded-full border border-red-500/40 transition-colors shrink-0">
          <span>Manage Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
