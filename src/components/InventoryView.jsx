import React, { useState } from 'react';
import { Search, Plus, AlertTriangle, CheckCircle, ArrowLeft, RefreshCw, Filter, PackageCheck, Truck } from 'lucide-react';
import { initialInventory } from '../data/mockData';

export default function InventoryView({ onBackToHome }) {
  const [items, setItems] = useState(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'low', 'normal'
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addQty, setAddQty] = useState('');

  // Stock calculation logic
  const itemsWithMath = items.map(item => {
    const totalAvailable = item.openingStock + item.received;
    const remainingStock = totalAvailable - item.soldUsed;
    const isLow = remainingStock <= item.minThreshold;
    return {
      ...item,
      totalAvailable,
      remainingStock,
      isLow,
      status: isLow ? '🔴 Low Stock' : '🟢 Normal'
    };
  });

  const filteredItems = itemsWithMath.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'low' && item.isLow) || 
                          (statusFilter === 'normal' && !item.isLow);
    return matchesSearch && matchesStatus;
  });

  const totalLowStockCount = itemsWithMath.filter(i => i.isLow).length;
  const totalItemsCount = itemsWithMath.length;

  const handleAddStockSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem || !addQty || isNaN(addQty)) return;
    const qtyNum = parseFloat(addQty);

    setItems(prev => prev.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          received: item.received + qtyNum
        };
      }
      return item;
    }));

    setShowAddStockModal(false);
    setSelectedItem(null);
    setAddQty('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#163529] p-5 rounded-3xl border border-[#27523f] shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 bg-[#0f231a] hover:bg-[#1d4737] rounded-full border border-[#27523f] text-[#4ade80] transition-colors"
            title="Back to Home Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-sans flex items-center gap-2">
              <span>📦 Stock Movement & Product Inventory</span>
            </h2>
            <p className="text-xs text-[#86b09c] mt-0.5">
              Showing exact daily movement, stock math & minimum threshold status for every product
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedItem(itemsWithMath[0]);
              setShowAddStockModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4ade80] hover:bg-[#3ec470] text-[#0f231a] font-bold text-xs rounded-full shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Receive Stock</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-[#163529] p-4 rounded-2xl border border-[#27523f]">
          <p className="text-xs text-[#86b09c] font-semibold uppercase">Total Tracked Products</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">{totalItemsCount} Products</h3>
          <p className="text-[11px] text-[#6e9684] mt-0.5">Beverages, Tiffin & Ingredients</p>
        </div>

        <div className="bg-[#163529] p-4 rounded-2xl border border-[#27523f]">
          <p className="text-xs text-[#86b09c] font-semibold uppercase">Stock Received Today</p>
          <h3 className="text-2xl font-extrabold text-[#4ade80] mt-1">
            +{itemsWithMath.reduce((acc, i) => acc + i.received, 0)} Units
          </h3>
          <p className="text-[11px] text-[#6e9684] mt-0.5">Supplier Restocks</p>
        </div>

        <div className="bg-[#163529] p-4 rounded-2xl border border-[#27523f]">
          <p className="text-xs text-[#86b09c] font-semibold uppercase">Total Sold / Used</p>
          <h3 className="text-2xl font-extrabold text-[#e67e22] mt-1">
            {itemsWithMath.reduce((acc, i) => acc + i.soldUsed, 0)} Units
          </h3>
          <p className="text-[11px] text-[#6e9684] mt-0.5">POS & Online Orders</p>
        </div>

        <div className={`p-4 rounded-2xl border ${totalLowStockCount > 0 ? 'bg-[#381616] border-red-500/40 text-red-200' : 'bg-[#163529] border-[#27523f] text-white'}`}>
          <p className="text-xs font-semibold uppercase opacity-80">Low Stock Alerts</p>
          <h3 className="text-2xl font-black mt-1 flex items-center gap-2">
            <span>{totalLowStockCount} Items</span>
            {totalLowStockCount > 0 && <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />}
          </h3>
          <p className="text-[11px] opacity-70 mt-0.5">Below Min Threshold</p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#163529] p-4 rounded-2xl border border-[#27523f] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7da592]" />
          <input
            type="text"
            placeholder="Search product or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f231a] border border-[#27523f] rounded-full text-xs text-white placeholder-[#6e9684] focus:outline-none focus:border-[#4ade80]"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-[#86b09c] font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-100 text-[#0f231a]'
                : 'bg-[#0f231a] text-[#86b09c] hover:text-white border border-[#27523f]'
            }`}
          >
            All Products ({totalItemsCount})
          </button>

          <button
            onClick={() => setStatusFilter('low')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'low'
                ? 'bg-red-500 text-white shadow'
                : 'bg-[#0f231a] text-red-300 hover:text-white border border-red-500/30'
            }`}
          >
            🔴 Low Stock ({totalLowStockCount})
          </button>

          <button
            onClick={() => setStatusFilter('normal')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === 'normal'
                ? 'bg-[#4ade80] text-[#0f231a] shadow'
                : 'bg-[#0f231a] text-[#4ade80] hover:text-white border border-[#4ade80]/30'
            }`}
          >
            🟢 Normal ({totalItemsCount - totalLowStockCount})
          </button>
        </div>

      </div>

      {/* Main Stock Movement Table */}
      <div className="bg-[#163529] rounded-3xl border border-[#27523f] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f231a] text-[#a4c5b5] text-xs uppercase font-semibold border-b border-[#27523f]">
                <th className="py-4 px-5">Product Name</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4 text-right">Opening Stock</th>
                <th className="py-4 px-4 text-right">Stock Received</th>
                <th className="py-4 px-4 text-right text-[#d9a752]">Total Available</th>
                <th className="py-4 px-4 text-right text-amber-400">Sold / Used</th>
                <th className="py-4 px-4 text-right text-[#4ade80] font-bold">Remaining Stock</th>
                <th className="py-4 px-4 text-right">Min Threshold</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e4838] text-sm text-slate-200">
              {filteredItems.map((item) => (
                <tr 
                  key={item.id}
                  className={`hover:bg-[#1a4233] transition-colors ${
                    item.isLow ? 'bg-red-950/20' : ''
                  }`}
                >
                  <td className="py-3.5 px-5 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-[#86b09c]">
                    <span className="px-2.5 py-1 rounded-full bg-[#0f231a] border border-[#27523f]">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-[#a4c5b5]">
                    {item.openingStock} <span className="text-[11px] text-[#6e9684]">{item.unit}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-[#4ade80] font-semibold">
                    +{item.received} <span className="text-[11px] text-[#6e9684]">{item.unit}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-[#d9a752] font-semibold">
                    {item.totalAvailable} <span className="text-[11px] text-[#6e9684]">{item.unit}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-amber-300 font-semibold">
                    {item.soldUsed} <span className="text-[11px] text-[#6e9684]">{item.unit}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-lg font-extrabold text-[#4ade80]">
                    {item.remainingStock} <span className="text-xs text-[#a4c5b5] font-normal">{item.unit}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-[#a4c5b5]">
                    {item.minThreshold} <span className="text-[11px] text-[#6e9684]">{item.unit}</span>
                  </td>

                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                      item.isLow
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                        : 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/40'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowAddStockModal(true);
                      }}
                      className="px-3 py-1 bg-[#1e4a38] hover:bg-[#4ade80] hover:text-[#0f231a] text-xs font-bold text-[#4ade80] rounded-full border border-[#2e684f] transition-all"
                    >
                      + Add Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Stock Modal */}
      {showAddStockModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#122a20] text-slate-100 w-full max-w-md rounded-3xl border border-[#27523f] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#27523f] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#4ade80]" />
                <span>Receive New Stock</span>
              </h3>
              <button
                onClick={() => setShowAddStockModal(false)}
                className="text-[#86b09c] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#86b09c] block mb-1">
                  Select Product:
                </label>
                <select
                  value={selectedItem.id}
                  onChange={(e) => {
                    const found = itemsWithMath.find(i => i.id === e.target.value);
                    if (found) setSelectedItem(found);
                  }}
                  className="w-full p-2.5 bg-[#163529] border border-[#27523f] rounded-xl text-white text-sm focus:outline-none focus:border-[#4ade80]"
                >
                  {itemsWithMath.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.remainingStock} {i.unit} currently remaining)</option>
                  ))}
                </select>
              </div>

              <div className="bg-[#163529] p-3 rounded-xl border border-[#27523f] text-xs space-y-1">
                <p>Current Opening: <strong className="text-white">{selectedItem.openingStock} {selectedItem.unit}</strong></p>
                <p>Already Received: <strong className="text-[#4ade80]">{selectedItem.received} {selectedItem.unit}</strong></p>
                <p>Sold / Used: <strong className="text-amber-300">{selectedItem.soldUsed} {selectedItem.unit}</strong></p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#86b09c] block mb-1">
                  New Quantity Received ({selectedItem.unit}):
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder={`e.g. 10 ${selectedItem.unit}`}
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  className="w-full p-2.5 bg-[#163529] border border-[#27523f] rounded-xl text-white text-sm focus:outline-none focus:border-[#4ade80]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStockModal(false)}
                  className="px-4 py-2 bg-[#163529] hover:bg-[#1f4a38] text-xs font-bold text-[#86b09c] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4ade80] hover:bg-[#3ec470] text-[#0f231a] text-xs font-bold rounded-full shadow"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
