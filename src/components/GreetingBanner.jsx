import React from 'react';
import { PlusCircle, PackagePlus, ShoppingBag, BarChart2 } from 'lucide-react';

export default function GreetingBanner({ 
  onNewBill, 
  onReceiveStock, 
  onOnlineOrders, 
  onSalesAudit 
}) {
  return (
    <div className="space-y-4 mb-4">
      
      {/* Top Banner Card matching Cream Background & Serif Quote */}
      <div className="relative overflow-hidden bg-[#f5efe6] text-[#122b20] rounded-3xl p-5 shadow-md border border-[#e5d7c5] flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Welcome Text */}
        <div className="space-y-1 z-10">
          <h2 className="text-xl sm:text-2xl font-bold font-sans text-[#10271d] flex items-center gap-2">
            Good Morning, Shruthy! <span className="text-xl">☕</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#476655] font-semibold">
            Fresh brews. Smooth operations. You've got this!
          </p>
        </div>

        {/* Right Quote matching exact quotation styling */}
        <div className="z-10 text-right">
          <p className="font-serif italic text-sm text-[#473418] font-bold tracking-wide">
            " Brewing Success Together ♡ "
          </p>
        </div>

      </div>

      {/* Quick Action Buttons matching reference photo */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* New Bill Button (Dark pill) */}
        <button
          onClick={onNewBill}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#183a2c] hover:bg-[#204a39] text-white font-semibold text-xs rounded-full shadow border border-[#27523f] transition-all"
        >
          <span className="p-1 bg-[#255742] rounded-full text-[#4ade80]">
            <PlusCircle className="w-3.5 h-3.5" />
          </span>
          <span>New Bill</span>
        </button>

        {/* Receive Stock Button (Cream pill) */}
        <button
          onClick={onReceiveStock}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#f5efe6] hover:bg-[#eadecc] text-[#122b20] font-semibold text-xs rounded-full shadow-sm border border-[#e5d7c5] transition-all"
        >
          <PackagePlus className="w-3.5 h-3.5 text-[#183a2c]" />
          <span>Receive Stock</span>
        </button>

        {/* Online Orders Button (Cream pill) */}
        <button
          onClick={onOnlineOrders}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#f5efe6] hover:bg-[#eadecc] text-[#122b20] font-semibold text-xs rounded-full shadow-sm border border-[#e5d7c5] transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#e67e22]" />
          <span>Online Orders</span>
        </button>

        {/* Sales Audit Button (Cream pill) */}
        <button
          onClick={onSalesAudit}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#f5efe6] hover:bg-[#eadecc] text-[#122b20] font-semibold text-xs rounded-full shadow-sm border border-[#e5d7c5] transition-all"
        >
          <BarChart2 className="w-3.5 h-3.5 text-[#8e44ad]" />
          <span>Sales Audit</span>
        </button>

      </div>
    </div>
  );
}
