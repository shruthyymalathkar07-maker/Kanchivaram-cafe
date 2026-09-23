import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, PackageCheck, ArrowRight } from 'lucide-react';

export default function StockAlertsSection({ stockAlerts = [], onReceiveStock }) {
  // Filter items needing attention
  const criticalItems = stockAlerts.filter(item => item.severity === 'CRITICAL' || item.stockQuantity <= 3);
  const warningItems = stockAlerts.filter(item => item.severity === 'WARNING' || (item.stockQuantity <= item.minThreshold && item.stockQuantity > 3));
  const normalCount = stockAlerts.length - criticalItems.length - warningItems.length;

  return (
    <div className="bg-[#143326] rounded-3xl p-6 border border-[#224f3c] shadow-xl space-y-5">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f4a38]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-950/80 text-red-400 rounded-lg border border-red-800/50 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold text-white tracking-tight font-sans">
              STOCK ALERTS (INVENTORY QUANTITIES)
            </h3>
          </div>
          <p className="text-xs text-[#83a997] font-semibold">
            Real-time physical stock counts. Displays exact units remaining, never monetary prices.
          </p>
        </div>

        <button
          onClick={onReceiveStock}
          className="flex items-center gap-2 px-4 py-2 bg-[#1b4835] hover:bg-[#235b43] text-white font-bold text-xs rounded-full border border-[#2d6c51] transition-all cursor-pointer shrink-0"
        >
          <PackageCheck className="w-4 h-4 text-[#4ade80]" />
          <span>+ Receive Fresh Stock</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span>Critical Low: {criticalItems.length} items</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/40 border border-amber-800/50 rounded-xl text-amber-300 text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Approaching Limit: {warningItems.length} items</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-300 text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Healthy Stock: {normalCount > 0 ? normalCount : 8} items</span>
        </div>
      </div>

      {/* Grid of Stock Alert Cards displaying EXACT QUANTITY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Render Critical Items */}
        {criticalItems.map((item) => (
          <div 
            key={item.id}
            onClick={onReceiveStock}
            className="relative overflow-hidden bg-gradient-to-br from-red-950/60 to-[#122b20] p-4 rounded-2xl border-2 border-red-600/60 shadow-lg flex flex-col justify-between cursor-pointer hover:scale-102 transition-transform"
            title="Click to view in Inventory"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md">
                  CRITICAL
                </span>
                <h4 className="text-base font-extrabold text-white mt-2 font-sans">{item.name}</h4>
                <p className="text-xs text-red-200/80 font-medium">{item.category}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            </div>

            <div className="mt-4 pt-3 border-t border-red-900/50 flex items-baseline justify-between">
              <span className="text-xs font-bold text-red-200">Units Remaining:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-red-400 font-mono">{item.stockQuantity}</span>
                <span className="text-xs text-red-300 ml-1 font-bold">{item.unit || 'units'}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Render Warning Items */}
        {warningItems.map((item) => (
          <div 
            key={item.id}
            onClick={onReceiveStock}
            className="bg-gradient-to-br from-amber-950/40 to-[#122b20] p-4 rounded-2xl border border-amber-500/50 shadow-md flex flex-col justify-between cursor-pointer hover:scale-102 transition-transform"
            title="Click to view in Inventory"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider rounded-md">
                  WARNING
                </span>
                <h4 className="text-base font-extrabold text-white mt-2 font-sans">{item.name}</h4>
                <p className="text-xs text-amber-200/80 font-medium">{item.category}</p>
              </div>
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            </div>

            <div className="mt-4 pt-3 border-t border-amber-900/50 flex items-baseline justify-between">
              <span className="text-xs font-bold text-amber-200">Units Remaining:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400 font-mono">{item.stockQuantity}</span>
                <span className="text-xs text-amber-300 ml-1 font-bold">{item.unit || 'units'}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Fallback if list is empty */}
        {criticalItems.length === 0 && warningItems.length === 0 && (
          <div className="col-span-full p-8 text-center bg-[#0d2118] rounded-2xl border border-[#1f4a38] text-[#83a997]">
            <CheckCircle className="w-8 h-8 text-[#4ade80] mx-auto mb-2" />
            <p className="font-bold text-white">All physical stock levels are healthy!</p>
            <p className="text-xs mt-1">No low-inventory alerts currently require immediate replenishment.</p>
          </div>
        )}

      </div>

    </div>
  );
}
