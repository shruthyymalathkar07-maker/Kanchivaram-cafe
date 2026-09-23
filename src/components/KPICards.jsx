import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Tag, 
  Wallet, 
  ShoppingBag, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

export default function KPICards({ stats, onOpenModal }) {
  const cards = [
    {
      id: 'total-sales',
      title: 'TOTAL SALES',
      value: `₹${(stats?.kpis?.totalSales?.amount ?? 0).toLocaleString('en-IN')}`,
      subtext: `${stats?.kpis?.totalSales?.orderCount ?? 0} Orders • +${stats?.kpis?.totalSales?.growth ?? 0}%`,
      icon: TrendingUp,
      accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
      type: 'TOTAL_SALES'
    },
    {
      id: 'net-sales',
      title: 'NET SALES',
      value: `₹${(stats?.kpis?.netSales?.amount ?? 0).toLocaleString('en-IN')}`,
      subtext: `In-Store: ₹${(stats?.kpis?.netSales?.inStoreNet ?? 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      accentColor: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300',
      type: 'NET_SALES'
    },
    {
      id: 'discounts',
      title: 'DISCOUNTS',
      value: `₹${(stats?.kpis?.discounts?.amount ?? 0).toLocaleString('en-IN')}`,
      subtext: `${stats?.kpis?.discounts?.transactionCount ?? 0} Discounted Bills`,
      icon: Tag,
      accentColor: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300',
      type: 'DISCOUNTS'
    },
    {
      id: 'cash-collection',
      title: 'CASH COLLECTION',
      value: `₹${(stats?.kpis?.cashCollection?.amount ?? 0).toLocaleString('en-IN')}`,
      subtext: `UPI: ₹${(stats?.kpis?.cashCollection?.upiAmount ?? 0).toLocaleString('en-IN')}`,
      icon: Wallet,
      accentColor: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
      badgeBg: 'bg-blue-500/20 text-blue-300',
      type: 'CASH_COLLECTION'
    },
    {
      id: 'online-sales',
      title: 'ONLINE SALES',
      value: `₹${(stats?.kpis?.onlineSales?.amount ?? 0).toLocaleString('en-IN')}`,
      subtext: `Swiggy: ₹${(stats?.kpis?.onlineSales?.swiggy ?? 0).toLocaleString('en-IN')}`,
      icon: ShoppingBag,
      accentColor: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-400',
      badgeBg: 'bg-orange-500/20 text-orange-300',
      type: 'ONLINE_SALES'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onOpenModal(card.type)}
            className="group relative overflow-hidden bg-[#143326] hover:bg-[#194030] rounded-2xl p-4 border border-[#224f3c] hover:border-[#34785c] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.accentColor} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />

            <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#94baa8] tracking-wider uppercase">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl bg-[#0f281d] border border-[#224f3c] group-hover:scale-110 transition-transform ${card.badgeBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Main Number */}
              <div>
                <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight font-sans">
                  {card.value}
                </h3>
                <p className="text-xs font-semibold text-[#83a997] mt-1 flex items-center justify-between">
                  <span>{card.subtext}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#547866] group-hover:text-white transition-colors" />
                </p>
              </div>

              {/* Click Indicator Strip */}
              <div className="pt-2 border-t border-[#1d4534] flex items-center justify-between text-[10px] text-[#69917f] group-hover:text-[#4ade80] transition-colors font-bold">
                <span>Click for breakdown</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
