import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function MainSalesGraph({ stats, selectedBranch, activePeriod, onPeriodChange }) {
  const [internalPeriod, setInternalPeriod] = useState('today');
  const period = activePeriod || internalPeriod;
  const setPeriod = onPeriodChange || setInternalPeriod;
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  const currentTotalSales = stats?.kpis?.totalSales?.amount ?? 0;
  const currentPosSales = stats?.kpis?.totalSales?.inStore ?? 0;
  const currentOnlineSales = stats?.kpis?.totalSales?.online ?? 0;
  const growthRate = stats?.kpis?.totalSales?.growth ?? 0;

  const chartData = (stats?.charts?.salesTrend && stats.charts.salesTrend.length > 0)
    ? stats.charts.salesTrend
    : (period === 'today'
        ? ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'].map(t => ({ time: t, sales: 0, orders: 0 }))
        : period === 'week'
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(t => ({ time: t, sales: 0, orders: 0 }))
          : ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(t => ({ time: t, sales: 0, orders: 0 }))
      );

  const rawMax = Math.max(...chartData.map(d => d.sales || 0), 0);
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

  const formatYTick = (val) => {
    if (val >= 1000) {
      const k = val / 1000;
      return `₹${k % 1 === 0 ? k : k.toFixed(1)}k`;
    }
    return `₹${Math.round(val)}`;
  };

  const primaryColor = isBrownBranch ? '#C69A4B' : '#4ade80';

  return (
    <div className={`text-slate-100 rounded-3xl p-6 border-2 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[390px] transition-colors duration-500 ${
      isBrownBranch ? 'bg-[#3E2312] border-[#542A16]' : 'bg-[#0f3823] border-[#194c31]'
    }`}>
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
        
        {/* Left Stats Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-full shadow ${
              isBrownBranch ? 'bg-[#542A16] text-[#C69A4B]' : 'bg-[#194c31] text-[#4ade80]'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </span>
            <p className={`text-xs font-medium ${isBrownBranch ? 'text-[#E8D8C2]' : 'text-[#a3c7b5]'}`}>
              Total Sales ({period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'})
            </p>
            <span className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border ${
              isBrownBranch ? 'bg-[#542A16] text-[#C69A4B] border-[#7A4325]' : 'bg-[#184a30] text-[#4ade80] border-[#2d664b]'
            }`}>
              +{growthRate}%
            </span>
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              ₹{currentTotalSales.toLocaleString('en-IN')}
            </h3>
          </div>

          {/* POS vs Online Breakdown text */}
          <div className={`flex items-center gap-3 text-xs pt-1 ${isBrownBranch ? 'text-[#E8D8C2]' : 'text-[#86b09c]'}`}>
            <span>POS <strong className="text-slate-100 font-bold">₹{currentPosSales.toLocaleString('en-IN')}</strong></span>
            <span>•</span>
            <span>Online <strong className="text-slate-100 font-bold">₹{currentOnlineSales.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Right Time Period Toggles */}
        <div className={`flex items-center p-1 rounded-full border self-start sm:self-center ${
          isBrownBranch ? 'bg-[#2D190D] border-[#542A16]' : 'bg-[#0b1c15] border-[#1e4835]'
        }`}>
          {['today', 'week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-200 cursor-pointer ${
                period === p
                  ? isBrownBranch ? 'bg-[#FAF6EE] text-[#3E2312] shadow' : 'bg-slate-100 text-[#0e261b] shadow'
                  : isBrownBranch ? 'text-[#C69A4B]/80 hover:text-white' : 'text-[#86b09c] hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

      </div>

      {/* Histogram Bar Chart */}
      <div className="w-full h-[210px] pt-4 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity={0.95} />
                <stop offset="100%" stopColor={primaryColor} stopOpacity={0.65} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="#49735d" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(t) => t.replace(':00', '')}
            />
            <YAxis 
              stroke="#49735d" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              domain={[0, niceMax]}
              tickFormatter={formatYTick}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0b1c15',
                borderColor: '#1e4835',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}
              formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
            />
            <Bar 
              dataKey="sales" 
              fill="url(#salesBarGrad)" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
