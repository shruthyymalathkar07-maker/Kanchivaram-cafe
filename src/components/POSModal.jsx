import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Printer, CheckCircle2 } from 'lucide-react';

export default function POSModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [cart, setCart] = useState([
    { id: '1', name: 'Filter Coffee', price: 40, qty: 2 },
    { id: '2', name: 'Ghee Roast Dosa', price: 110, qty: 1 },
  ]);

  const [paymentMode, setPaymentMode] = useState('cash');
  const [orderComplete, setOrderComplete] = useState(false);

  const menuItems = [
    { id: '1', name: 'Filter Coffee', price: 40, category: 'Beverages' },
    { id: '2', name: 'Ghee Roast Dosa', price: 110, category: 'Tiffin' },
    { id: '3', name: 'Café Latte', price: 90, category: 'Beverages' },
    { id: '4', name: 'Medu Vada (2 pcs)', price: 60, category: 'Tiffin' },
    { id: '5', name: 'Idli Sambar (2 pcs)', price: 50, category: 'Tiffin' },
    { id: '6', name: 'Mysore Masala Dosa', price: 130, category: 'Tiffin' },
  ];

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : i;
      }
      return i;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleCheckout = () => {
    setOrderComplete(true);
    setTimeout(() => {
      setOrderComplete(false);
      setCart([]);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#122a20] text-slate-100 w-full max-w-4xl rounded-3xl border border-[#27523f] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#17382a] border-b border-[#27523f] flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🛒 POS Quick Billing Terminal</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#86b09c] hover:text-white bg-[#0f231a] rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderComplete ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-[#4ade80]/20 text-[#4ade80] rounded-full flex items-center justify-center mx-auto border border-[#4ade80]">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">Bill Printed & Order Saved!</h3>
            <p className="text-sm text-[#86b09c]">Stock updated automatically across inventory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-y-auto">
            
            {/* Left Menu Items Selector */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-[#27523f] space-y-4">
              <h3 className="text-sm font-bold text-[#4ade80] uppercase tracking-wider">
                Select Menu Items
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="p-3 bg-[#163529] hover:bg-[#1f4a38] rounded-2xl border border-[#27523f] text-left transition-all group"
                  >
                    <p className="font-bold text-white text-sm group-hover:text-[#4ade80]">{item.name}</p>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-[#86b09c]">{item.category}</span>
                      <span className="font-mono text-[#d9a752] font-bold">₹{item.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Bill Receipt Summary */}
            <div className="p-6 bg-[#0f231a] flex flex-col justify-between space-y-4">
              <h3 className="text-sm font-bold text-[#d9a752] uppercase tracking-wider">
                Current Bill Items ({cart.length})
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-xs text-[#6e9684] italic py-8 text-center">No items added to bill yet.</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-[#163529] p-2.5 rounded-xl border border-[#27523f] text-xs">
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[#86b09c]">₹{item.price} each</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-[#0f231a] px-2 py-1 rounded-lg border border-[#27523f]">
                          <button onClick={() => updateQty(item.id, -1)} className="text-white hover:text-red-400">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-white w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="text-white hover:text-[#4ade80]">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-mono text-[#4ade80] font-bold w-12 text-right">
                          ₹{item.price * item.qty}
                        </span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total Math & Checkout */}
              <div className="space-y-3 pt-3 border-t border-[#27523f]">
                <div className="flex justify-between text-xs text-[#86b09c]">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs text-[#86b09c]">
                  <span>GST (5%):</span>
                  <span className="font-mono text-white">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-1 border-t border-[#27523f]">
                  <span>Total Amount:</span>
                  <span className="font-mono text-[#4ade80]">₹{total.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {['cash', 'upi', 'card'].map(m => (
                    <button
                      key={m}
                      onClick={() => setPaymentMode(m)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                        paymentMode === m
                          ? 'bg-[#d9a752] text-[#0f231a]'
                          : 'bg-[#163529] text-[#86b09c] border border-[#27523f]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <button
                  disabled={cart.length === 0}
                  onClick={handleCheckout}
                  className="w-full py-3 bg-[#4ade80] hover:bg-[#3ec470] disabled:bg-gray-700 text-[#0f231a] font-extrabold text-sm rounded-2xl shadow flex items-center justify-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Complete & Print Bill (₹{total.toFixed(2)})</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
