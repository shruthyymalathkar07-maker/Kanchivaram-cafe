import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MapPin, Coffee, UtensilsCrossed, ArrowDown, ChevronDown, CheckCircle2 } from 'lucide-react';

/**
 * BranchHeroReveal
 * Arched-Mask-to-Fullscreen Hero Reveal Transition Component
 * 
 * Works dynamically for both Main Branch (Emerald Theme) and City Branch (Brown Theme).
 */
export default function BranchHeroReveal({
  branchName = "Main Branch",
  branchCode = "KVCM-MAIN",
  tagline = "Heritage South Indian Dining, Filter Coffee & Pure Ghee Delicacies",
  locationText = "Temple Road, Central Kanchipuram",
  heroImage = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1600&q=85",
  isBrownBranch = false,
  onQuickAction,
  children
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const containerRef = useRef(null);

  // Trigger entrance sequence smoothly on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasEntered(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Theme palettes
  const theme = isBrownBranch ? {
    primaryBg: '#3E2312',
    accentBg: '#542A16',
    gold: '#C69A4B',
    goldLight: '#E8D8C2',
    pillBg: 'bg-[#542A16]/90 border-[#C69A4B]/40 text-[#E8D8C2]',
    btnPrimary: 'bg-[#542A16] hover:bg-[#3D1E0F] text-white border border-[#C69A4B]/60 shadow-[0_4px_14px_rgba(84,42,22,0.5)]',
    badge: 'bg-[#FAF6EE] text-[#3E2312] border-[#C69A4B]/40'
  } : {
    primaryBg: '#0f3823',
    accentBg: '#103825',
    gold: '#d4af37',
    goldLight: '#c5e4d4',
    pillBg: 'bg-[#0f3823]/90 border-[#4ade80]/40 text-[#c5e4d4]',
    btnPrimary: 'bg-[#0f3823] hover:bg-[#092617] text-white border border-[#4ade80]/60 shadow-[0_4px_14px_rgba(4,148,93,0.5)]',
    badge: 'bg-[#f8f6f0] text-[#0f3823] border-[#4ade80]/40'
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col transition-all duration-700">
      
      {/* ========================================================================= */}
      {/* 1. ARCHED-TO-FULLSCREEN HERO CONTAINER                                    */}
      {/* ========================================================================= */}
      <div className={`relative w-full transition-all duration-700 ease-out overflow-hidden ${
        isExpanded ? 'h-[440px] sm:h-[500px] mb-6 rounded-2xl shadow-xl' : 'h-[280px] sm:h-[320px] mb-4'
      }`}>

        {/* Ambient background glow when in arch mode */}
        <div 
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none rounded-2xl ${
            isExpanded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            background: isBrownBranch 
              ? 'radial-gradient(ellipse at 50% 30%, rgba(84,42,22,0.18) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at 50% 30%, rgba(15,56,35,0.18) 0%, transparent 70%)'
          }}
        />

        {/* Header Overlay & Introductory Typography (Arch State) */}
        <div className={`absolute inset-x-0 top-0 z-20 flex flex-col items-center justify-center text-center px-4 pt-2 transition-all duration-500 pointer-events-none ${
          isExpanded ? 'opacity-0 -translate-y-6' : 'opacity-100 translate-y-0'
        }`}>
          <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[10px] font-black tracking-widest uppercase mb-1 shadow-2xs backdrop-blur-md ${theme.pillBg}`}>
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            <span>{branchCode} • {branchName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-[#11291f] tracking-tight">
            Welcome to <span style={{ color: theme.gold }}>{branchName}</span>
          </h2>
          <p className="text-[11px] text-[#547363] font-semibold line-clamp-1 max-w-md">
            {tagline}
          </p>
        </div>

        {/* ======================================================================= */}
        {/* 2. THE DYNAMIC ARCHED MASK / EXPANDING FRAME                            */}
        {/* ======================================================================= */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative mx-auto h-full overflow-hidden transition-all duration-700 ease-in-out cursor-pointer group select-none border border-[#d4af37]/40 shadow-lg ${
            isExpanded 
              ? 'w-full rounded-2xl' 
              : 'w-[92%] sm:w-[540px] md:w-[620px] rounded-t-[140px] rounded-b-2xl shadow-2xl'
          } ${hasEntered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          {/* Main Hero Image */}
          <img
            src={heroImage}
            alt={`${branchName} Hero`}
            className={`w-full h-full object-cover object-center transition-transform duration-700 will-change-transform ${
              isExpanded ? 'scale-100' : 'scale-110 group-hover:scale-115'
            }`}
          />

          {/* Dark Contrast Gradients for visual clarity */}
          <div className={`absolute inset-0 transition-opacity duration-700 ${
            isExpanded 
              ? 'bg-gradient-to-t from-black/85 via-black/40 to-black/25 opacity-100' 
              : 'bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-85 group-hover:opacity-75'
          }`} />

          {/* Bottom Bar Content in Arch Mode */}
          <div className={`absolute bottom-3 inset-x-0 z-20 px-4 flex items-center justify-between transition-all duration-500 ${
            isExpanded ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 pointer-events-auto translate-y-0'
          }`}>
            <div className="flex items-center gap-1.5 text-white drop-shadow-md">
              <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="text-[11px] font-bold tracking-wide">{locationText}</span>
            </div>

            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/40 transition-all cursor-pointer shadow-xs"
            >
              <span>Expand View</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Expanded Fullscreen Reveal Content */}
          <div className={`absolute inset-0 z-30 flex flex-col justify-end p-6 sm:p-10 text-white transition-all duration-700 ${
            isExpanded ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
          }`}>
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-[#d4af37]/60 text-[#d4af37] text-xs font-black uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Branch Operational</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-tight leading-none drop-shadow-md">
                {branchName}
              </h2>

              <p className="text-xs sm:text-sm text-[#e8d8c2] font-light leading-relaxed drop-shadow-xs max-w-xl">
                {tagline}. Managed with real-time stock sync, table order routing, and rapid cloud billing.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onQuickAction) onQuickAction('pos');
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all transform hover:scale-105 cursor-pointer ${theme.btnPrimary}`}
                >
                  Start Billing (POS)
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onQuickAction) onQuickAction('inventory');
                  }}
                  className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/40 transition-all cursor-pointer"
                >
                  View Stock
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="px-3 py-2 rounded-full text-xs font-bold text-[#e8d8c2] hover:text-white transition-colors cursor-pointer"
                >
                  Collapse Arch
                </button>
              </div>
            </div>
          </div>

          {/* Arched Top Golden Decorative Trim in Arch Mode */}
          <div className={`absolute top-0 inset-x-0 h-16 pointer-events-none transition-opacity duration-500 ${
            isExpanded ? 'opacity-0' : 'opacity-100'
          }`}>
            <div className="w-full h-full border-t-2 border-[#d4af37]/60 rounded-t-[140px]" />
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. HOME DASHBOARD CONTENT WRAPPER                                         */}
      {/* ========================================================================= */}
      <div className="w-full">
        {children}
      </div>

    </div>
  );
}
