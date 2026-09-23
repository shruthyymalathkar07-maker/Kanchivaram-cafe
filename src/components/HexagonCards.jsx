import React from 'react';
import { Layers, Package, Tag, TrendingUp } from 'lucide-react';

export default function HexagonCards({ onOpenModal, selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';
  return (
    <div className="flex flex-col gap-2.5 w-full max-w-[380px] mx-auto items-center justify-center p-0">
      
      {/* Top 4 Badges Grid - 2x2 Perfectly Aligned */}
      <div className="grid grid-cols-2 gap-3.5 w-full place-items-center">
        
        {/* 1. TOP LEFT: GOLD METALLIC RIMMED HEXAGON BADGE */}
        <div 
          onClick={() => onOpenModal && onOpenModal('TOTAL_SALES')}
          className="relative w-full aspect-square max-w-[140px] max-h-[140px] cursor-pointer transition-all duration-300 transform hover:scale-105 group"
          title="Click for Total Orders details"
        >
          <div 
            className="w-full h-full p-1.5 bg-[linear-gradient(135deg,#ffe875_0%,#d4af37_40%,#996515_70%,#e6c651_100%)] flex items-center justify-center shadow-lg border border-[#fff8c4]"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          >
            <div 
              className="w-full h-full bg-gradient-to-b from-[#fdfbf7] to-[#ebdcc8] border border-[#b8860b] flex flex-col justify-center items-center text-center p-1.5"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              <div className="w-6 h-6 rounded-full bg-[#0f3823]/10 text-[#0f3823] flex items-center justify-center shadow-inner mb-0.5">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <p className="text-[8.5px] font-extrabold text-[#456351] uppercase tracking-wider leading-none">
                TOTAL ORDERS
              </p>
              <h4 className="text-xl font-black text-[#11291f] tracking-tight font-sans mt-0.5">
                186
              </h4>
            </div>
          </div>
        </div>

        {/* 2. TOP RIGHT: GOLD METALLIC RIMMED PENTAGON BADGE */}
        <div 
          onClick={() => onOpenModal && onOpenModal('TOTAL_SALES')}
          className="relative w-full aspect-square max-w-[140px] max-h-[140px] cursor-pointer transition-all duration-300 transform hover:scale-105 group"
          title="Click for Products Sold details"
        >
          <div 
            className="w-full h-full p-1.5 bg-[linear-gradient(135deg,#ffe875_0%,#d4af37_40%,#996515_70%,#e6c651_100%)] flex items-center justify-center shadow-lg border border-[#fff8c4]"
            style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}
          >
            <div 
              className="w-full h-full bg-gradient-to-b from-[#fdfbf7] to-[#ebdcc8] border border-[#b8860b] flex flex-col justify-center items-center text-center p-1.5"
              style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}
            >
              <div className="w-6 h-6 rounded-full bg-[#0f3823]/10 text-[#0f3823] flex items-center justify-center shadow-inner mb-0.5">
                <Package className="w-3.5 h-3.5" />
              </div>
              <p className="text-[8.5px] font-extrabold text-[#456351] uppercase tracking-wider leading-none">
                PRODUCTS SOLD
              </p>
              <h4 className="text-xl font-black text-[#11291f] tracking-tight font-sans mt-0.5">
                421
              </h4>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM LEFT: GOLD METALLIC RIMMED CIRCLE BADGE */}
        <div 
          onClick={() => onOpenModal && onOpenModal('DISCOUNTS')}
          className="relative w-full aspect-square max-w-[140px] max-h-[140px] rounded-full p-1.5 bg-[linear-gradient(135deg,#ffe875_0%,#d4af37_40%,#996515_70%,#e6c651_100%)] flex items-center justify-center shadow-lg border border-[#fff8c4] cursor-pointer transition-all duration-300 transform hover:scale-105 group"
          title="Click for Discounts Audit"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#fdfbf7] to-[#ebdcc8] border-2 border-[#b8860b] flex flex-col justify-center items-center text-center p-1.5 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-[#0f3823]/10 text-[#0f3823] flex items-center justify-center shadow-inner mb-0.5">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <p className="text-[8.5px] font-extrabold text-[#456351] uppercase tracking-wider leading-none">
              TOTAL DISCOUNTS
            </p>
            <h4 className="text-lg font-black text-[#11291f] tracking-tight font-sans mt-0.5">
              ₹1,320
            </h4>
          </div>
        </div>

        {/* 4. BOTTOM RIGHT: GOLD METALLIC RIMMED CIRCLE BADGE */}
        <div 
          onClick={() => onOpenModal && onOpenModal('TOTAL_SALES')}
          className="relative w-full aspect-square max-w-[140px] max-h-[140px] rounded-full p-1.5 bg-[linear-gradient(135deg,#ffe875_0%,#d4af37_40%,#996515_70%,#e6c651_100%)] flex items-center justify-center shadow-lg border border-[#fff8c4] cursor-pointer transition-all duration-300 transform hover:scale-105 group"
          title="Click for Cash Collection details"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#fdfbf7] to-[#ebdcc8] border-2 border-[#b8860b] flex flex-col justify-center items-center text-center p-1.5 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-[#0f3823]/10 text-[#0f3823] font-extrabold text-xs flex items-center justify-center shadow-inner mb-0.5">
              ₹
            </div>
            <p className="text-[8.5px] font-extrabold text-[#456351] uppercase tracking-wider leading-none">
              CASH COLLECTION
            </p>
            <h4 className="text-lg font-black text-[#11291f] tracking-tight font-sans mt-0.5">
              ₹XX,XXX
            </h4>
          </div>
        </div>

      </div>

      {/* 5. GOLDEN METALLIC CYLINDRICAL CARD FOR NET SALES (Below Discounts & Cash Collection) */}
      <div 
        onClick={() => onOpenModal && onOpenModal('TOTAL_SALES')}
        className="w-full rounded-full p-1.5 bg-[linear-gradient(135deg,#ffe875_0%,#d4af37_40%,#996515_70%,#e6c651_100%)] shadow-xl border border-[#fff8c4] cursor-pointer transition-all duration-300 transform hover:scale-102 group mt-0.5"
        title="Click for Net Sales Breakdown"
      >
        <div className="w-full rounded-full bg-gradient-to-r from-[#fdfbf7] via-[#f7f0e3] to-[#ebdcc8] border-2 border-[#b8860b] px-3.5 py-1.5 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 ${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white rounded-full shadow-md`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[8.5px] font-black text-[#456351] uppercase tracking-widest leading-none">
                NET SALES (ONLINE &amp; POS)
              </p>
              <h4 className="text-lg font-black text-[#11291f] tracking-tight font-sans mt-0.5">
                ₹18,450
              </h4>
            </div>
          </div>

          <div className={`hidden sm:flex items-center gap-1 text-[8.5px] font-extrabold ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} border-l border-[#cabb9e] pl-2.5`}>
            <span className={`${isBrownBranch ? 'bg-[#3E2312]/10' : 'bg-[#0f3823]/10'} px-1.5 py-0.5 rounded-full`}>Swiggy <strong>₹8,450</strong></span>
            <span className={`${isBrownBranch ? 'bg-[#3E2312]/10' : 'bg-[#0f3823]/10'} px-1.5 py-0.5 rounded-full`}>Zomato <strong>₹8,450</strong></span>
            <span className={`${isBrownBranch ? 'bg-[#3E2312]/10' : 'bg-[#0f3823]/10'} px-1.5 py-0.5 rounded-full`}>Dunzo <strong>₹6,450</strong></span>
          </div>
        </div>
      </div>

    </div>
  );
}





