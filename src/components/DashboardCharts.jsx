import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Calendar } from 'lucide-react';

export default function DashboardCharts({ stats, timeframe, setTimeframe }) {
  const trendData = stats?.charts?.salesTrend || [
    { time: '08:00 AM', sales: 0, orders: 0 },
    { time: '10:00 AM', sales: 0, orders: 0 },
    { time: '12:00 PM', sales: 0, orders: 0 },
    { time: '02:00 PM', sales: 0, orders: 0 },
    { time: '04:00 PM', sales: 0, orders: 0 },
    { time: '06:00 PM', sales: 0, orders: 0 },
    { time: '08:00 PM', sales: 0, orders: 0 }
  ];

  const distributionData = stats?.charts?.salesDistribution || [
    { name: 'In-Store POS', value: 0, percentage: 0, color: '#4ade80' },
    { name: 'Swiggy Delivery', value: 0, percentage: 0, color: '#f97316' },
    { name: 'Direct Online', value: 0, percentage: 0, color: '#3b82f6' }
  ];

  const COLORS = ['#4ade80', '#f97316', '#3b82f6', '#a855f7'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. SALES TREND AREA CHART (7 Cols) */}
      <div className="lg:col-span-7 bg-[#143326] rounded-3xl p-6 border border-[#224f3c] shadow-xl flex flex-col justify-between">
        
        {/* Header with Timeframe Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#1b4231] rounded-lg text-[#4ade80]">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-extrabold text-[#d2e8dd] uppercase tracking-wider">
                Sales Trend Revenue
              </h3>
            </div>
            <p className="text-xs text-[#83a997] font-semibold">
              Live hourly transaction velocity across all counters
            </p>
          </div>

          <div className="flex items-center bg-[#0d2118] p-1 rounded-full border border-[#1f4a38] self-start sm:self-center">
            {['today', 'week', 'month'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-1 rounded-full text-xs font-extrabold capitalize transition-all cursor-pointer ${
                  timeframe === t
                    ? 'bg-[#4ade80] text-[#0d2118] shadow'
                    : 'text-[#83a997] hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#69917f" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#69917f" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d2118',
                  borderColor: '#245742',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                formatter={(val) => [`₹${val}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#4ade80"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* 2. SALES DISTRIBUTION DONUT CHART (5 Cols) */}
      <div className="lg:col-span-5 bg-[#143326] rounded-3xl p-6 border border-[#224f3c] shadow-xl flex flex-col justify-between">
        
        <div className="space-y-1 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#1b4231] rounded-lg text-orange-400">
              <PieIcon className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-extrabold text-[#d2e8dd] uppercase tracking-wider">
              Sales Distribution
            </h3>
          </div>
          <p className="text-xs text-[#83a997] font-semibold">
            Revenue breakdown by ordering channel
          </p>
        </div>

        {/* Recharts Pie Donut Chart */}
        <div className="w-full h-[220px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={6}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d2118',
                  borderColor: '#245742',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Sales']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Clean Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1d4534]">
          {distributionData.map((d, i) => (
            <div key={i} className="text-center bg-[#0d2118] p-2 rounded-xl border border-[#1f4a38]">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#9ebfb0]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color || COLORS[i] }}></span>
                <span className="truncate">{d.name}</span>
              </div>
              <p className="text-xs font-black text-white mt-1">₹{d.value.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
