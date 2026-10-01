import React from 'react';
import { ArrowDownRight, ArrowUpRight, Repeat, Package } from 'lucide-react';

export default function DailyStockMovement({ stockMovement = [] }) {
  const movementList = stockMovement.length > 0 ? stockMovement : [
    { id: '1', name: 'Organic Whole Milk', category: 'Cold Beverages', unit: 'packets', openingStock: 25, stockIn: 10, stockOut: 30, remaining: 5 },
    { id: '2', name: 'Artisanal Sandwich Bread', category: 'Sandwiches', unit: 'loaves', openingStock: 15, stockIn: 5, stockOut: 17, remaining: 3 },
    { id: '3', name: 'Arabica Coffee Beans', category: 'Coffee', unit: 'kg', openingStock: 10, stockIn: 0, stockOut: 8, remaining: 2 },
    { id: '4', name: 'Special Masala Tea Powder', category: 'Tea', unit: 'kg', openingStock: 8, stockIn: 2, stockOut: 4, remaining: 6 },
    { id: '5', name: 'Pure Cow Ghee', category: 'Snacks', unit: 'kg', openingStock: 12, stockIn: 5, stockOut: 6, remaining: 11 }
  ];

  return (
    <div className="bg-[#143326] rounded-3xl p-6 border border-[#224f3c] shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1f4a38]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#1b4231] rounded-lg text-[#4ade80]">
              <Repeat className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">
              Daily Physical Stock Movement
            </h3>
          </div>
          <p className="text-xs text-[#83a997] font-semibold mt-0.5">
            Opening Stock vs Received (Stock In) vs Consumed (Stock Out) vs Remaining (Quantity Based)
          </p>
        </div>

        <span className="px-3 py-1 bg-[#0d2118] text-[#4ade80] text-xs font-bold rounded-full border border-[#224f3c]">
          Today's Audit Log
        </span>
      </div>

      {/* Movement Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[#83a997] border-b border-[#1f4a38] uppercase font-semibold text-[11px] tracking-wider">
              <th className="py-3 px-4">ITEM NAME</th>
              <th className="py-3 px-4">CATEGORY</th>
              <th className="py-3 px-4 text-center">OPENING</th>
              <th className="py-3 px-4 text-center text-emerald-400">STOCK IN (+)</th>
              <th className="py-3 px-4 text-center text-rose-400">STOCK OUT (-)</th>
              <th className="py-3 px-4 text-right text-white">REMAINING</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b4231] font-medium text-[12px]">
            {movementList.map((item) => (
              <tr key={item.id} className="hover:bg-[#183d2e] transition-colors text-slate-200">
                <td className="py-3 px-4 font-medium text-[12px] text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#4ade80] shrink-0" />
                  <span>{item.name}</span>
                </td>
                <td className="py-3 px-4 font-medium text-[12px] text-[#83a997]">{item.category}</td>
                <td className="py-3 px-4 text-center font-medium text-[12px]">{item.openingStock} {item.unit}</td>
                <td className="py-3 px-4 text-center font-medium text-[12px] text-emerald-400">
                  +{item.stockIn} {item.unit}
                </td>
                <td className="py-3 px-4 text-center font-medium text-[12px] text-rose-400">
                  -{item.stockOut} {item.unit}
                </td>
                <td className="py-3 px-4 text-right font-medium text-[12px] text-white">
                  <span className={`px-2.5 py-1 rounded-lg ${
                    item.remaining <= 3 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-[#0d2118] text-[#4ade80] border border-[#224f3c]'
                  }`}>
                    {item.remaining} {item.unit}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
