import React, { useState } from 'react';
import { Search, Plus, UtensilsCrossed } from 'lucide-react';
import { CLIENT_PRODUCTS_MASTER } from '../data/masterData';

export default function MenuProductsView({ selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = CLIENT_PRODUCTS_MASTER.map(p => ({
    id: p.id,
    name: p.name,
    sku: `KC-${p.categoryId.replace('cat-', '').toUpperCase().slice(0, 3)}-${p.id.replace('prod-', '').padStart(3, '0')}`,
    category: p.category,
    price: p.dineInPrice,
    tax: 'GST 5% (Food & Beverage)',
    stock: `${p.servingQty} ${p.uom}`,
    status: 'Available',
    img: p.image
  }));

  const filtered = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#fbf8f3] rounded-3xl p-6 border border-[#e5d8c8] shadow-lg space-y-6 animate-fadeIn">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#122b20] font-sans">
            Menu & Products List
          </h2>
          <p className="text-xs text-[#547363]">
            Manage items, prices, tax categories, and live availability
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7da592]" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 bg-white border border-[#d8ccbc] rounded-full text-xs text-[#122b20] focus:outline-none ${isBrownBranch ? 'focus:border-[#C69A4B]' : 'focus:border-[#4ade80]'}`}
            />
          </div>

          <button className={`flex items-center gap-2 px-4 py-2 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D] border-[#542A16]' : 'bg-[#183a2c] hover:bg-[#204a39] border-[#27523f]'} text-white font-bold text-xs rounded-full shadow border`}>
            <Plus className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table matching Image 4 */}
      <div className="bg-white rounded-2xl border border-[#e5d8c8] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f5efe6] text-[#547363] uppercase font-bold border-b border-[#e5d8c8]">
                <th className="py-3.5 px-4 w-12 text-center">Item</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">SKU / Code</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Price</th>
                <th className="py-3.5 px-4">Tax Category</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e8dc] text-[#122b20]">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-[#fcfaf7] transition-colors">
                  <td className="py-3 px-4 text-center">
                    <img src={item.img} alt={item.name} className="w-9 h-9 rounded-full object-cover mx-auto border border-[#ded3c4]" />
                  </td>
                  <td className="py-3 px-4 font-extrabold text-[#122b20]">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#547363] text-[11px]">
                    {item.sku}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#547363]">
                    {item.category}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#122b20]">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-[#547363]">
                    <span className="bg-[#f5efe6] px-2.5 py-1 rounded-full text-[10px] border border-[#e5d8c8]">
                      {item.tax}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#122b20]">
                    {item.stock}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${isBrownBranch ? 'bg-[#f3e8d4] text-[#7A4325] border border-[#d4b896]' : 'bg-[#e2f7ed] text-[#168a53] border border-[#a3e5c4]'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
