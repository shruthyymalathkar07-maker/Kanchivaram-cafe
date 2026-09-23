import React, { useState } from 'react';
import { 
  Receipt, 
  Trash2, 
  Plus, 
  Minus, 
  Smartphone, 
  Printer, 
  Banknote, 
  QrCode, 
  CreditCard,
  Pause,
  RotateCcw,
  Tag,
  FileText,
  ChevronDown
} from 'lucide-react';

export default function POSView() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([
    { id: 1, name: 'Caffè Latte', price: 200, qty: 1, img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=300&q=80' },
    { id: 2, name: 'Ghee Roast Dosa', price: 315, qty: 1, img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=300&q=80' },
  ]);
  const [billMethod, setBillMethod] = useState('sms'); // 'sms' | 'print'
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'upi' | 'card'
  const [phone, setPhone] = useState('');
  const [saveNumber, setSaveNumber] = useState(true);

  const categories = ['All', 'Caffè Latte', 'Caffè Dosa', 'Manottims', 'Tour', 'Peawatts', 'Manota', 'More'];

  const products = [
    { id: 101, name: 'Caffè Latte', price: 15.00, stock: 'high', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
    { id: 102, name: 'Ghee Roast Dosa', price: 25.00, stock: 'high', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80' },
    { id: 103, name: 'Cadaal Dosa', price: 15.00, stock: 'high', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80' },
    { id: 104, name: 'Malai Tea', price: 10.00, stock: 'high', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80' },
    { id: 105, name: 'Caffè Latte', price: 15.00, stock: 'low', img: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=400&q=80' },
    { id: 106, name: 'Caffè Latte', price: 15.00, stock: 'high', img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=400&q=80' },
    { id: 107, name: 'Cadsal Dosa', price: 15.00, stock: 'low', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80' },
    { id: 108, name: 'Suared Dosa', price: 15.00, stock: 'high', img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80' },
    { id: 109, name: 'Caffè Latte', price: 13.00, stock: 'high', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
    { id: 110, name: 'Ghee Roast Dosa', price: 25.00, stock: 'high', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80' },
    { id: 111, name: 'Filter Coffee', price: 20.00, stock: 'high', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80' },
    { id: 112, name: 'Medu Vada', price: 20.00, stock: 'high', img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80' },
  ];

  const addToCart = (product) => {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, img: product.img }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = item.qty + delta;
        return nextQty > 0 ? { ...item, qty: nextQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = 0.00;
  const grandTotal = subtotal + tax;

  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      
      {/* Top Banner Row */}
      <div className="bg-[#ebdcd0] text-[#122b20] p-4 rounded-3xl border border-[#d8ccbc] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-[#11291d] flex items-center gap-2">
            <span>POS / Billing</span>
          </h2>
          <p className="text-xs text-[#476655] font-semibold">
            Serve Goodness. Bill Smarter.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#122b20] text-white text-xs font-extrabold rounded-full shadow flex items-center gap-2 border border-[#27523f]">
            <Receipt className="w-4 h-4 text-[#4ade80]" />
            <span>Direct Register Mode</span>
          </div>
          <div className="text-xs font-mono text-[#547363] font-bold hidden sm:block">
            Tue, 8 Sept 2026 | 06:55 PM
          </div>
        </div>
      </div>

      {/* Main Grid: Products (Left) + Cart Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Category Tabs Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all shadow-sm ${
                  activeCategory === cat
                    ? 'bg-[#183a2c] text-white ring-2 ring-[#4ade80]/50'
                    : 'bg-[#f5efe6] text-[#122b20] hover:bg-[#eadecc] border border-[#d8ccbc]'
                }`}
              >
                {cat === 'More' ? (
                  <span className="flex items-center gap-1">More <ChevronDown className="w-3 h-3" /></span>
                ) : cat}
              </button>
            ))}
          </div>

          {/* 3 x 4 Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {products.map(p => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-[#f7f3ec] rounded-2xl border border-[#d8ccbc] p-3 shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 flex flex-col justify-between"
              >
                {/* Product Image */}
                <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden mb-2 bg-[#ded3c4]">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                </div>

                {/* Product Info */}
                <div>
                  <h4 className="font-extrabold text-[#122b20] text-xs sm:text-sm line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="font-black text-[#122b20] text-xs sm:text-sm mt-0.5 font-mono">
                    ₹{p.price.toFixed(2)}
                  </p>
                </div>

                {/* Stock Progress Line */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex-1 h-1.5 bg-[#ded3c4] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${p.stock === 'low' ? 'w-1/4 bg-red-500' : 'w-4/5 bg-[#183a2c]'}`}></div>
                  </div>
                  <span className="text-[10px] text-[#547363] font-semibold">Stock</span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Current Cart Panel with Chamfer Corner */}
        <div className="lg:col-span-4">
          <div className="bg-[#f5efe6] rounded-3xl border-2 border-[#d8ccbc] shadow-2xl overflow-hidden flex flex-col justify-between">
            
            {/* Cart Chamfer Header */}
            <div className="bg-[#ded3c4] p-4 border-b border-[#c8bcab] flex items-center justify-between clip-chamfer-top">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#183a2c]" />
                <h3 className="font-extrabold text-[#122b20] text-base">Current Cart</h3>
              </div>
              <button
                onClick={clearCart}
                className="flex items-center gap-1 px-3 py-1 bg-[#f5efe6] hover:bg-white text-red-700 text-xs font-bold rounded-full border border-[#c8bcab] shadow-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-[#6e9684] text-xs font-semibold">
                  Cart is empty. Click menu items on the left to add.
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-[#fbf8f3] p-3 rounded-2xl border border-[#ded3c4] shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={item.img} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-extrabold text-[#122b20] text-xs">{item.name}</h4>
                        <p className="font-bold text-[#122b20] text-xs font-mono">₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-[#ded3c4] px-2 py-1 rounded-full text-xs border border-[#c8bcab]">
                        <button onClick={() => updateQty(item.id, -1)} className="p-0.5 hover:text-red-700 text-[#122b20]">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold text-[#122b20] px-1">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-0.5 hover:text-green-700 text-[#122b20]">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-800 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Grand Total */}
            <div className="p-4 bg-[#ebdcd0] border-t border-[#d8ccbc] space-y-2 text-xs">
              <div className="flex justify-between text-[#547363] font-semibold">
                <span>Subtotal</span>
                <span className="font-mono text-[#122b20]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#547363] font-semibold">
                <span>Grand Total</span>
                <span className="font-mono text-[#122b20]">₹{grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#547363] font-semibold">
                <span>Tax</span>
                <span className="font-mono text-[#122b20]">₹{tax.toFixed(2)}</span>
              </div>

              {/* Big Grand Total Box */}
              <div className="bg-[#f5efe6] p-3 rounded-2xl border-2 border-[#d8ccbc] flex items-center justify-between shadow-inner mt-2">
                <span className="font-extrabold text-[#122b20] text-sm sm:text-base">Grand Total</span>
                <span className="font-black text-[#122b20] text-xl sm:text-2xl font-mono">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Bill to Customer Section */}
            <div className="p-4 bg-[#f5efe6] border-t border-[#d8ccbc] space-y-3">
              <p className="text-[11px] font-extrabold text-[#547363] uppercase tracking-wider flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" /> Bill to Customer
              </p>

              {/* Options: SMS / Paper Receipt */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBillMethod('sms')}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                    billMethod === 'sms'
                      ? 'bg-[#183a2c] text-white border-[#183a2c] shadow-md'
                      : 'bg-[#fbf8f3] text-[#122b20] border-[#d8ccbc]'
                  }`}
                >
                  <div className="p-1.5 bg-[#4ade80]/20 rounded-xl text-[#4ade80]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-[11px]">Send via SMS</p>
                    <p className="text-[9px] opacity-80">Paperless Billing</p>
                  </div>
                </button>

                <button
                  onClick={() => setBillMethod('print')}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                    billMethod === 'print'
                      ? 'bg-[#183a2c] text-white border-[#183a2c] shadow-md'
                      : 'bg-[#fbf8f3] text-[#122b20] border-[#d8ccbc]'
                  }`}
                >
                  <div className="p-1.5 bg-white/20 rounded-xl text-[#122b20]">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-[11px]">Print Bill</p>
                    <p className="text-[9px] opacity-80">Paper Receipt</p>
                  </div>
                </button>
              </div>

              {/* Mobile Input */}
              <div className="flex items-center bg-[#fbf8f3] border border-[#d8ccbc] rounded-xl px-3 py-2">
                <span className="text-xs font-bold text-[#122b20] pr-2 border-r border-[#d8ccbc] flex items-center gap-1">
                  +91 <ChevronDown className="w-3 h-3" />
                </span>
                <input
                  type="text"
                  placeholder="Enter customer mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-2 bg-transparent text-xs text-[#122b20] placeholder-[#86a896] focus:outline-none font-semibold"
                />
              </div>

              {/* Save number checkbox */}
              <label className="flex items-center gap-2 text-xs font-bold text-[#547363] cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveNumber}
                  onChange={(e) => setSaveNumber(e.target.checked)}
                  className="rounded text-[#183a2c] focus:ring-0 w-4 h-4 accent-[#183a2c]"
                />
                <span>Save number for future orders</span>
              </label>
            </div>

            {/* Payment Method Action Buttons */}
            <div className="p-4 bg-[#ded3c4] border-t border-[#c8bcab] grid grid-cols-3 gap-2">
              <button
                onClick={() => { setPaymentMode('cash'); alert("Order placed with CASH!"); }}
                className={`py-3 px-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all ${
                  paymentMode === 'cash' ? 'bg-[#183a2c] text-white ring-2 ring-[#4ade80]' : 'bg-[#122b20] text-white hover:bg-[#183a2c]'
                }`}
              >
                <Banknote className="w-4 h-4 text-[#4ade80]" />
                <span>CASH</span>
              </button>

              <button
                onClick={() => { setPaymentMode('upi'); alert("Order placed with UPI!"); }}
                className={`py-3 px-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all ${
                  paymentMode === 'upi' ? 'bg-[#183a2c] text-white ring-2 ring-[#4ade80]' : 'bg-[#122b20] text-white hover:bg-[#183a2c]'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#4ade80]" />
                <span>UPI</span>
              </button>

              <button
                onClick={() => { setPaymentMode('card'); alert("Order placed with CARD!"); }}
                className={`py-3 px-2 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all ${
                  paymentMode === 'card' ? 'bg-[#183a2c] text-white ring-2 ring-[#4ade80]' : 'bg-[#122b20] text-white hover:bg-[#183a2c]'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#4ade80]" />
                <span>CARD</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Bar: Quick Actions & Motto */}
      <div className="bg-[#f5efe6] p-3 rounded-2xl border border-[#d8ccbc] shadow flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-extrabold text-[#547363] px-2">Quick Actions</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fbf8f3] hover:bg-white text-[#122b20] font-bold text-xs rounded-full border border-[#d8ccbc]">
            <Pause className="w-3.5 h-3.5 text-[#e67e22]" /> <span>Hold Bill</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fbf8f3] hover:bg-white text-[#122b20] font-bold text-xs rounded-full border border-[#d8ccbc]">
            <RotateCcw className="w-3.5 h-3.5 text-[#183a2c]" /> <span>Recall Bill</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fbf8f3] hover:bg-white text-[#122b20] font-bold text-xs rounded-full border border-[#d8ccbc]">
            <Tag className="w-3.5 h-3.5 text-[#b03a2e]" /> <span>Apply Discount</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fbf8f3] hover:bg-white text-[#122b20] font-bold text-xs rounded-full border border-[#d8ccbc]">
            <FileText className="w-3.5 h-3.5 text-[#547363]" /> <span>Add Note</span>
          </button>
        </div>

        <div className="font-serif italic text-xs font-bold text-[#473418] pr-2">
          “ Brewing Success Together ” ♡
        </div>
      </div>

    </div>
  );
}
