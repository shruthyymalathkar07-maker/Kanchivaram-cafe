import React, { useState } from 'react';
import { 
  Building2, 
  Receipt, 
  Printer, 
  ShieldCheck, 
  Bell, 
  Save, 
  CheckCircle2, 
  Coffee,
  Globe,
  Sliders
} from 'lucide-react';

export default function SettingsView({ selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';
  
  const [activeTab, setActiveTab] = useState('store');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Store Information State
  const [storeName, setStoreName] = useState('Kanchivaram Café');
  const [branchName, setBranchName] = useState(selectedBranch?.name || 'Main Branch - Kanchipuram');
  const [gstin, setGstin] = useState('33AAACK1234F1Z9');
  const [fssaiNo, setFssaiNo] = useState('12421008000142');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [contactEmail, setContactEmail] = useState('contact@kanchivaram.cafe');

  // Billing & Tax Preferences State
  const [cgstPercent, setCgstPercent] = useState('2.5');
  const [sgstPercent, setSgstPercent] = useState('2.5');
  const [enableServiceCharge, setEnableServiceCharge] = useState(false);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(true);
  const [defaultPaymentMode, setDefaultPaymentMode] = useState('CASH');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 pb-8 select-none">
      
      {/* Header Banner — light cream card, same as Staff Management header */}
      <div className="bg-[#ebdcc8] p-3.5 sm:p-4 rounded-2xl border border-[#cabb9e] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
          <div className={`p-2.5 ${isBrownBranch ? 'bg-[#3E2312] border-[#542A16]' : 'bg-[#0f3823] border-[#194c31]'} text-white rounded-xl shadow-md border shrink-0`}>
            <Sliders className={`w-6 h-6 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-[#11291f]">
              Café Settings &amp; Preferences
            </h2>
            <p className="text-xs text-[#456351] font-bold mt-0.5">
              Configure store details, tax rates, POS receipt printing, and branch preferences.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className={`flex items-center gap-2 px-3 py-1.5 ${isBrownBranch ? 'bg-[#3E2312]/20 border-[#C69A4B]/40 text-[#7A4325]' : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-800'} border rounded-xl text-xs font-bold animate-fadeIn`}>
            <CheckCircle2 className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-emerald-600'}`} />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#cabb9e] pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'store'
              ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs`
              : 'bg-[#ebe0cb] text-[#456351] hover:bg-[#ded2bb]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Store Information</span>
        </button>

        <button
          onClick={() => setActiveTab('tax')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tax'
              ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs`
              : 'bg-[#ebe0cb] text-[#456351] hover:bg-[#ded2bb]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Tax &amp; Billing Rates</span>
        </button>

        <button
          onClick={() => setActiveTab('printer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'printer'
              ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs`
              : 'bg-[#ebe0cb] text-[#456351] hover:bg-[#ded2bb]'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Thermal Printer Setup</span>
        </button>
      </div>

      {/* Settings Main Form */}
      <form onSubmit={handleSaveSettings} className="bg-[#fdfbf7] border border-[#cabb9e] rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* TAB 1: STORE INFORMATION */}
        {activeTab === 'store' && (
          <div className="space-y-4">
            <h3 className={`text-sm font-bold font-serif ${isBrownBranch ? 'text-[#3E2312]' : 'text-[#0f3823]'} uppercase tracking-wider border-b border-[#ded4c5] pb-2`}>
              Café &amp; Branch Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>Café Brand Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-semibold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>Active Branch</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-semibold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>FSSAI License Number</label>
                <input
                  type="text"
                  value={fssaiNo}
                  onChange={(e) => setFssaiNo(e.target.value)}
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>Contact Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-semibold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-semibold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TAX & BILLING RATES */}
        {activeTab === 'tax' && (
          <div className="space-y-4">
            <h3 className={`text-sm font-bold font-serif ${isBrownBranch ? 'text-[#3E2312]' : 'text-[#0f3823]'} uppercase tracking-wider border-b border-[#ded4c5] pb-2`}>
              GST Tax &amp; Billing Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>CGST (%) Rate</label>
                <input
                  type="number"
                  step="0.1"
                  value={cgstPercent}
                  onChange={(e) => setCgstPercent(e.target.value)}
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>SGST (%) Rate</label>
                <input
                  type="number"
                  step="0.1"
                  value={sgstPercent}
                  onChange={(e) => setSgstPercent(e.target.value)}
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>Default POS Payment Mode</label>
                <select
                  value={defaultPaymentMode}
                  onChange={(e) => setDefaultPaymentMode(e.target.value)}
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI / QR CODE</option>
                  <option value="CARD">CREDIT / DEBIT CARD</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="autoPrint"
                  checked={autoPrintReceipt}
                  onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                  className={`w-4 h-4 rounded ${isBrownBranch ? 'text-[#7A4325] focus:ring-[#7A4325]' : 'text-[#0f3823] focus:ring-[#0f3823]'} cursor-pointer`}
                />
                <label htmlFor="autoPrint" className="text-xs font-bold text-[#11291f] cursor-pointer">
                  Automatically Trigger Thermal Receipt Printing on Sale Checkout
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRINTER SETUP */}
        {activeTab === 'printer' && (
          <div className="space-y-4">
            <h3 className={`text-sm font-bold font-serif ${isBrownBranch ? 'text-[#3E2312]' : 'text-[#0f3823]'} uppercase tracking-wider border-b border-[#ded4c5] pb-2`}>
              Thermal Receipt Printer Setup
            </h3>

            <div className="p-4 bg-[#ebe0cb]/50 border border-[#cabb9e] rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className={`font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'}`}>Connected Printer:</span>
                <span className={`font-bold px-2.5 py-1 rounded-full border ${isBrownBranch ? 'text-[#7A4325] bg-[#F5EDE0] border-[#C69A4B]' : 'text-emerald-700 bg-emerald-100 border-emerald-300'}`}>
                  ● Ready (ESC/POS 80mm Thermal Printer)
                </span>
              </div>
              <p className="text-[#456351] font-medium">
                Thermal receipt printing is configured for automatic browser print integration (`window.print()`).
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-[#ded4c5] flex justify-end">
          <button
            type="submit"
            className={`px-6 py-2.5 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D] border-[#542A16]' : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]'} text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border`}
          >
            <Save className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
            <span>Save Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
}
