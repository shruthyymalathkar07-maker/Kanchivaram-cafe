import React, { useState } from 'react';
import { X, UtensilsCrossed, ArrowUpRight, DollarSign, Receipt, CreditCard, ShieldCheck, Download, Filter } from 'lucide-react';
import { onlinePlatformsData, posCollectionData, salesOverview } from '../data/mockData';

export default function NetSalesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeFilter, setActiveFilter] = useState('all');
  const sales = salesOverview.today;

  const totalOnlineGross = onlinePlatformsData.reduce((acc, p) => acc + p.grossSales, 0);
  const totalOnlineNet = onlinePlatformsData.reduce((acc, p) => acc + p.netSales, 0);
  const totalOnlineCommissions = onlinePlatformsData.reduce((acc, p) => acc + p.commissionAmount, 0);
  const totalOnlineTaxes = onlinePlatformsData.reduce((acc, p) => acc + p.taxes, 0);
  const totalOnlineDiscounts = onlinePlatformsData.reduce((acc, p) => acc + p.discounts, 0);

  const grandTotalNetSales = totalOnlineNet + posCollectionData.totalPOS - (sales.totalDiscounts - totalOnlineDiscounts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fdfbf7] text-[#11291f] w-full max-w-5xl rounded-3xl border-2 border-[#d4af37] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#ebdcc8] border-b border-[#cabb9e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f3823] text-[#4ade80] flex items-center justify-center border border-[#194c31] shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-black text-[#11291f]">
                Online Food Apps & Net Sales Breakdown
              </h2>
              <p className="text-xs text-[#456351] font-bold">
                Individual platform payouts, POS cash collections, taxes & discounts summary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#0f3823] bg-[#fdfbf7] hover:bg-[#dfd3bc] rounded-full border border-[#cabb9e] transition-colors shadow-2xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#fdfbf7]">
          
          {/* Top High-level Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs">
              <p className="text-xs text-[#456351] font-black uppercase">Grand Total Net Sales</p>
              <h3 className="text-2xl font-black font-mono text-[#0f3823] mt-1">
                ₹{grandTotalNetSales.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-[#547363] font-bold mt-1">
                (POS + Online App Net Payouts)
              </p>
            </div>

            <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs">
              <p className="text-xs text-amber-900 font-black uppercase">Online Food Apps Net</p>
              <h3 className="text-2xl font-black font-mono text-amber-700 mt-1">
                ₹{totalOnlineNet.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-[#547363] font-bold mt-1">
                Swiggy + Zomato + Magicpin
              </p>
            </div>

            <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs">
              <p className="text-xs text-[#0f3823] font-black uppercase">POS Direct Collection</p>
              <h3 className="text-2xl font-black font-mono text-[#0f3823] mt-1">
                ₹{posCollectionData.totalPOS.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-[#547363] font-bold mt-1">
                Cash, UPI & Card Counter Sales
              </p>
            </div>

            <div className="bg-[#fbf8f3] p-4 rounded-2xl border border-[#cabb9e] shadow-xs">
              <p className="text-xs text-rose-900 font-black uppercase">Taxes & Commissions</p>
              <h3 className="text-2xl font-black font-mono text-rose-700 mt-1">
                ₹{(totalOnlineCommissions + sales.totalTaxes).toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-[#547363] font-bold mt-1">
                App Comm + GST Collected
              </p>
            </div>

          </div>

          {/* Online Food Ordering Apps Breakdown Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#11291f] uppercase flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#0f3823]" />
                <span>Online Food Ordering Apps - Platform Breakdown</span>
              </h3>
              <span className="text-xs text-[#456351] font-mono font-bold">3 Active Platforms</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {onlinePlatformsData.map((platform) => (
                <div 
                  key={platform.id}
                  className="p-4 rounded-2xl border border-[#cabb9e] bg-[#fbf8f3] shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{platform.logo}</span>
                      <div>
                        <h4 className="font-bold text-[#11291f] text-base">{platform.name}</h4>
                        <p className="text-xs text-[#547363] font-bold">{platform.ordersCount} Orders today</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ebdcc8] text-[#0f3823]">
                      Comm {platform.commissionRate}%
                    </span>
                  </div>

                  {/* Financial Breakdown Table */}
                  <div className="space-y-1.5 text-xs border-t border-[#cabb9e]/50 pt-3">
                    <div className="flex justify-between text-[#547363] font-bold">
                      <span>Gross Sales:</span>
                      <span className="font-mono text-[#11291f]">₹{platform.grossSales.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>Commission ({platform.commissionRate}%):</span>
                      <span className="font-mono">-₹{platform.commissionAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[#547363] font-bold">
                      <span>GST / Taxes:</span>
                      <span className="font-mono text-[#11291f]">₹{platform.taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-amber-700 font-bold">
                      <span>Platform Discounts:</span>
                      <span className="font-mono">-₹{platform.discounts}</span>
                    </div>
                  </div>

                  {/* Net Payout Total */}
                  <div className="pt-3 border-t border-[#cabb9e]/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#11291f]">Net Sales Payout:</span>
                    <span className="text-lg font-black text-[#0f3823] font-mono">
                      ₹{platform.netSales.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* POS Cash & Counter Collection Section */}
          <div className="bg-[#fbf8f3] p-5 rounded-2xl border border-[#cabb9e] space-y-3.5 shadow-xs">
            <h3 className="text-sm font-black text-[#11291f] uppercase flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#0f3823]" />
              <span>POS Store Cash Collection & Counter Sales</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-[#f0ebd9] p-3.5 rounded-xl border border-[#cabb9e]">
                <p className="text-xs text-[#456351] font-bold">Cash Collection</p>
                <h4 className="text-xl font-black text-[#0f3823] font-mono mt-1">₹{posCollectionData.cash.toLocaleString('en-IN')}</h4>
                <p className="text-[11px] text-[#547363] mt-0.5">Physical Cash Drawer</p>
              </div>

              <div className="bg-[#f0ebd9] p-3.5 rounded-xl border border-[#cabb9e]">
                <p className="text-xs text-[#456351] font-bold">UPI / QR Payments</p>
                <h4 className="text-xl font-black text-[#0f3823] font-mono mt-1">₹{posCollectionData.upi.toLocaleString('en-IN')}</h4>
                <p className="text-[11px] text-[#547363] mt-0.5">GPay, PhonePe, Paytm</p>
              </div>

              <div className="bg-[#f0ebd9] p-3.5 rounded-xl border border-[#cabb9e]">
                <p className="text-xs text-[#456351] font-bold">Card Swipes</p>
                <h4 className="text-xl font-black text-[#0f3823] font-mono mt-1">₹{posCollectionData.card.toLocaleString('en-IN')}</h4>
                <p className="text-[11px] text-[#547363] mt-0.5">POS Card Machine</p>
              </div>
            </div>
          </div>

          {/* Taxes and Discounts Audit Summary Table */}
          <div className="bg-[#fbf8f3] p-5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-3">
            <h3 className="text-xs font-black text-[#11291f] uppercase">
              📊 Total Taxes & Discounts Audit
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[#cabb9e]">
              <table className="w-full text-left text-xs text-[#11291f]">
                <thead className="bg-[#ebdcc8] text-[#11291f] uppercase font-black text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Gross Sales</th>
                    <th className="py-2.5 px-3">Taxes Collected</th>
                    <th className="py-2.5 px-3">Discounts Allowed</th>
                    <th className="py-2.5 px-3">Net Realized</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cabb9e]/50 font-medium">
                  <tr>
                    <td className="py-2.5 px-3 font-extrabold text-[#11291f]">POS Store Counters</td>
                    <td className="py-2.5 px-3 font-mono">₹12,000.00</td>
                    <td className="py-2.5 px-3 font-mono">₹600.00</td>
                    <td className="py-2.5 px-3 font-mono">₹650.00</td>
                    <td className="py-2.5 px-3 font-mono text-[#0f3823] font-black">₹11,950.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-extrabold text-[#11291f]">Swiggy Delivery</td>
                    <td className="py-2.5 px-3 font-mono">₹3,850.00</td>
                    <td className="py-2.5 px-3 font-mono">₹192.50</td>
                    <td className="py-2.5 px-3 font-mono">₹350.00</td>
                    <td className="py-2.5 px-3 font-mono text-[#0f3823] font-black">₹2,614.50</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-extrabold text-[#11291f]">Zomato Delivery</td>
                    <td className="py-2.5 px-3 font-mono">₹2,600.00</td>
                    <td className="py-2.5 px-3 font-mono">₹130.00</td>
                    <td className="py-2.5 px-3 font-mono">₹220.00</td>
                    <td className="py-2.5 px-3 font-mono text-[#0f3823] font-black">₹1,782.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-extrabold text-[#11291f]">Magicpin / Ondoor</td>
                    <td className="py-2.5 px-3 font-mono">₹1,200.00</td>
                    <td className="py-2.5 px-3 font-mono">₹60.00</td>
                    <td className="py-2.5 px-3 font-mono">₹100.00</td>
                    <td className="py-2.5 px-3 font-mono text-[#0f3823] font-black">₹896.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#ebdcc8] border-t border-[#cabb9e] flex items-center justify-between">
          <p className="text-xs text-[#456351] font-bold">
            Audit generated for <strong className="text-[#11291f]">Shruthy (Manager)</strong> on {new Date().toLocaleDateString('en-GB')}
          </p>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => alert("Net sales report exported to PDF!")}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#fdfbf7] hover:bg-[#dfd3bc] text-[#11291f] text-xs font-bold rounded-xl border border-[#cabb9e] transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit PDF</span>
            </button>
            
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#0f3823] hover:bg-[#0a2618] text-white text-xs font-black rounded-xl shadow-md border border-[#194c31] transition-colors cursor-pointer"
            >
              Close Breakdown
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
