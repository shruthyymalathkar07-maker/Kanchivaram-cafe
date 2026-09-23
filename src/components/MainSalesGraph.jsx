import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { salesOverview } from '../data/mockData';

export default function MainSalesGraph() {
  const [period, setPeriod] = useState('today');
  const currentData = salesOverview[period] || salesOverview.today;

  return (
    <div className="dark-marble-bg text-slate-100 rounded-3xl p-6 border-2 border-[#1e4835] shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[390px]">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
        
        {/* Left Stats Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#1e4835] rounded-full text-[#4ade80] shadow">
              <TrendingUp className="w-4 h-4" />
            </span>
            <p className="text-xs font-medium text-[#a3c7b5]">
              Total Sales ({period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'})
            </p>
            <span className="px-2.5 py-0.5 bg-[#19402e] text-[#4ade80] text-[11px] font-extrabold rounded-full border border-[#2d664b]">
              +{currentData.growthPercent}%
            </span>
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              ₹{currentData.totalSales.toLocaleString('en-IN')}
            </h3>
          </div>

          {/* POS vs Online Breakdown text as seen in original screenshot */}
          <div className="flex items-center gap-3 text-xs text-[#86b09c] pt-1">
            <span>POS <strong className="text-slate-100 font-bold">₹{currentData.posSales.toLocaleString('en-IN')}</strong></span>
            <span>•</span>
            <span>Online <strong className="text-slate-100 font-bold">₹{currentData.onlineSales.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Right Time Period Toggles */}
        <div className="flex items-center bg-[#0b1c15] p-1 rounded-full border border-[#1e4835] self-start sm:self-center">
          {['today', 'week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-200 ${
                period === p
                  ? 'bg-slate-100 text-[#0e261b] shadow'
                  : 'text-[#86b09c] hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

      </div>

      {/* Glowing Green Line Graph */}
      <div className="w-full h-[210px] pt-4 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="#49735d" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#49735d" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `₹${val / 1000}k`}
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
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#4ade80" 
              strokeWidth={3.5} 
              fillOpacity={1} 
              fill="url(#salesGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
