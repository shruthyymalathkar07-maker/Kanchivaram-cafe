import React, { useState, useEffect } from 'react';
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
  Sliders,
  Copy,
  Check,
  MessageSquare,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  fetchStoreSettings, 
  updateStoreSettings,
  fetchIntegrationSettings,
  updateIntegrationSettings
} from '../services/api';

export default function SettingsView({ selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';
  const branchId = selectedBranch?.id || 'branch-1';
  
  const [activeTab, setActiveTab] = useState('store');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Store Information State
  const [storeName, setStoreName] = useState('Kanchivaram Café');
  const [branchName, setBranchName] = useState(selectedBranch?.name || 'Main Branch');
  const [gstin, setGstin] = useState('');
  const [fssaiNo, setFssaiNo] = useState('12421008000142');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [contactEmail, setContactEmail] = useState('contact@kanchivaram.cafe');

  // Billing & Tax Preferences State
  const [cgstPercent, setCgstPercent] = useState('0.0');
  const [sgstPercent, setSgstPercent] = useState('0.0');
  const [enableServiceCharge, setEnableServiceCharge] = useState(false);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(true);
  const [defaultPaymentMode, setDefaultPaymentMode] = useState('CASH');

  // Integrations & External APIs State
  const [smsApiKey, setSmsApiKey] = useState('');
  const [swiggyRestaurantId, setSwiggyRestaurantId] = useState(branchId === 'branch-2' ? 'SWIGGY-KCB-CITY' : 'SWIGGY-KCB-MAIN');
  const [swiggyApiKey, setSwiggyApiKey] = useState('');
  const [zomatoMerchantId, setZomatoMerchantId] = useState(branchId === 'branch-2' ? 'ZOMATO-KCB-CITY' : 'ZOMATO-KCB-MAIN');
  const [zomatoApiKey, setZomatoApiKey] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      const data = await fetchStoreSettings(branchId);
      if (isMounted && data) {
        if (data.storeName) setStoreName(data.storeName);
        if (data.branchName) setBranchName(data.branchName);
        if (typeof data.gstin !== 'undefined') setGstin(data.gstin || '');
        if (typeof data.fssaiNo !== 'undefined') setFssaiNo(data.fssaiNo || '');
        if (typeof data.contactPhone !== 'undefined') setContactPhone(data.contactPhone || '');
        if (typeof data.contactEmail !== 'undefined') setContactEmail(data.contactEmail || '');
        if (typeof data.cgstPercent !== 'undefined') setCgstPercent(String(data.cgstPercent));
        if (typeof data.sgstPercent !== 'undefined') setSgstPercent(String(data.sgstPercent));
        if (typeof data.autoPrintReceipt !== 'undefined') setAutoPrintReceipt(Boolean(data.autoPrintReceipt));
        if (data.defaultPaymentMode) setDefaultPaymentMode(data.defaultPaymentMode);
      }

      // Also load branch integration credentials
      const integ = await fetchIntegrationSettings(branchId);
      if (isMounted && integ) {
        if (typeof integ.smsApiKey !== 'undefined') setSmsApiKey(integ.smsApiKey || '');
        if (typeof integ.swiggyRestaurantId !== 'undefined') setSwiggyRestaurantId(integ.swiggyRestaurantId || (branchId === 'branch-2' ? 'SWIGGY-KCB-CITY' : 'SWIGGY-KCB-MAIN'));
        if (typeof integ.swiggyApiKey !== 'undefined') setSwiggyApiKey(integ.swiggyApiKey || '');
        if (typeof integ.zomatoMerchantId !== 'undefined') setZomatoMerchantId(integ.zomatoMerchantId || (branchId === 'branch-2' ? 'ZOMATO-KCB-CITY' : 'ZOMATO-KCB-MAIN'));
        if (typeof integ.zomatoApiKey !== 'undefined') setZomatoApiKey(integ.zomatoApiKey || '');
      }
    };
    loadSettings();
    return () => { isMounted = false; };
  }, [branchId]);

  const handleCopy = (text, fieldKey) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const storePayload = {
        storeName: (storeName || '').trim() || 'Kanchivaram Café',
        branchName: (branchName || '').trim() || (branchId === 'branch-2' ? 'City Branch' : 'Main Branch'),
        gstin: (gstin || '').trim(),
        fssaiNo: (fssaiNo || '').trim(),
        contactPhone: (contactPhone || '').trim(),
        contactEmail: (contactEmail || '').trim(),
        cgstPercent: isNaN(parseFloat(cgstPercent)) ? 0.0 : parseFloat(cgstPercent),
        sgstPercent: isNaN(parseFloat(sgstPercent)) ? 0.0 : parseFloat(sgstPercent),
        autoPrintReceipt,
        defaultPaymentMode
      };
      const integPayload = {
        smsApiKey,
        swiggyRestaurantId,
        swiggyApiKey,
        zomatoMerchantId,
        zomatoApiKey
      };

      await Promise.all([
        updateStoreSettings(storePayload, branchId),
        updateIntegrationSettings(integPayload, branchId)
      ]);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('[SettingsView] Save error:', err);
    } finally {
      setIsSaving(false);
    }
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
      <div className="flex items-center gap-2 border-b border-[#cabb9e] pb-2 overflow-x-auto no-scrollbar w-full py-1">
        <button
          type="button"
          onClick={() => setActiveTab('store')}
          className={`inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 leading-normal ${
            activeTab === 'store'
              ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs`
              : 'bg-[#ebe0cb] text-[#456351] hover:bg-[#ded2bb]'
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Store Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tax')}
          className={`inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 leading-normal ${
            activeTab === 'tax'
              ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs`
              : 'bg-[#ebe0cb] text-[#456351] hover:bg-[#ded2bb]'
          }`}
        >
          <Receipt className="w-4 h-4 shrink-0" />
          <span>Tax &amp; Billing Rates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('printer')}
          className={`inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 leading-normal ${
            activeTab === 'printer'
              ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs`
              : 'bg-[#ebe0cb] text-[#456351] hover:bg-[#ded2bb]'
          }`}
        >
          <Printer className="w-4 h-4 shrink-0" />
          <span>Thermal Printer Setup</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('integrations')}
          className={`inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 leading-normal ${
            activeTab === 'integrations'
              ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs`
              : 'bg-[#ebe0cb] text-[#456351] hover:bg-[#ded2bb]'
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>Integrations &amp; APIs</span>
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
                  placeholder="Leave blank if not GST registered"
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
                <p className="text-[10px] text-[#6b7280] mt-1">Leave empty or UNREGISTERED if café is not GST registered.</p>
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

            {/* Live Effective Combined Tax Rate Indicator */}
            <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
              ((parseFloat(cgstPercent) || 0) + (parseFloat(sgstPercent) || 0)) === 0
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center gap-2">
                <span className="font-bold">Effective Tax Rate on Bills:</span>
                <span className="font-black font-mono text-base px-2 py-0.5 rounded-lg bg-white border shadow-xs">
                  {((parseFloat(cgstPercent) || 0) + (parseFloat(sgstPercent) || 0)).toFixed(1)}%
                </span>
                {((parseFloat(cgstPercent) || 0) + (parseFloat(sgstPercent) || 0)) === 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900 border border-amber-300">
                    ● Non-GST / Unregistered (₹0.00 Tax on Bills)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/70 text-emerald-900 border border-emerald-300">
                    ● GST Registered ({cgstPercent}% CGST + {sgstPercent}% SGST)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#555] font-medium">
                Changes apply instantly across POS Billing, thermal prints, online orders &amp; WhatsApp bills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>CGST (%) Rate</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={cgstPercent}
                  onChange={(e) => setCgstPercent(e.target.value)}
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
                <p className="text-[10px] text-[#6b7280] mt-1">Set to 0 if not GST registered, or 2.5 for standard restaurant rate.</p>
              </div>

              <div>
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>SGST (%) Rate</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={sgstPercent}
                  onChange={(e) => setSgstPercent(e.target.value)}
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
                <p className="text-[10px] text-[#6b7280] mt-1">Set to 0 if not GST registered, or 2.5 for standard restaurant rate.</p>
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

        {/* TAB 4: INTEGRATIONS & APIS */}
        {activeTab === 'integrations' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ded4c5] pb-2">
              <div>
                <h3 className={`text-sm font-bold font-serif ${isBrownBranch ? 'text-[#3E2312]' : 'text-[#0f3823]'} uppercase tracking-wider`}>
                  Third-Party Integrations &amp; Partner APIs
                </h3>
                <p className="text-[11px] text-[#456351] font-semibold mt-0.5">
                  Configure WhatsApp Cloud billing, SMS OTP gateways, and Swiggy &amp; Zomato delivery integrations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    showSecrets 
                      ? 'bg-amber-100/70 border-amber-300 text-amber-900' 
                      : 'bg-[#ebe0cb] border-[#cabb9e] text-[#456351] hover:bg-[#ded2bb]'
                  }`}
                >
                  {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSecrets ? 'Hide Secrets' : 'Show Secrets'}</span>
                </button>
              </div>
            </div>

            {/* Direct Sharing & Live SMS Banner */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-emerald-950">
                  Direct WhatsApp Sharing &amp; SMS Gateway Active
                </p>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  WhatsApp bills are delivered directly via 1-Click WhatsApp Direct Sharing with <strong>zero third-party API fees or subscriptions</strong>. For telecom SMS receipts and OTP login verification, enter your Fast2SMS API key below.
                </p>
              </div>
            </div>

            {/* Section 1: WhatsApp & SMS Messaging */}
            <div className="bg-[#ebe0cb]/40 border border-[#cabb9e] rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#ded4c5]">
                <div className={`p-2 rounded-lg ${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shrink-0`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#11291f]">
                    WhatsApp Direct Sharing &amp; SMS Gateway
                  </h4>
                  <p className="text-[11px] text-[#456351]">
                    Sends instant digital bills via your professional WhatsApp and handles SMS OTP login.
                  </p>
                </div>
              </div>

              {/* Feature 1: WhatsApp 1-Click Direct Share (Active & Free) */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-emerald-950 flex items-center gap-2">
                    <span>1-Click WhatsApp Direct Sharing: Active</span>
                    <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-800 text-[10px] font-black rounded-full">100% Free Forever</span>
                  </p>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    At POS checkout, click <strong>"Share Bill on WhatsApp"</strong> to instantly send the formatted receipt and cordial greeting to the customer's phone from your WhatsApp Web or mobile app. Zero monthly API fees, and your professional number stays 100% safe on your phone!
                  </p>
                </div>
              </div>

              {/* Feature 2: SMS Gateway (Fast2SMS) */}
              <div className="text-xs space-y-1">
                <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'}`}>
                  SMS Gateway API Key (Fast2SMS)
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={smsApiKey}
                  onChange={(e) => setSmsApiKey(e.target.value)}
                  placeholder="e.g. f2s_live_auth_key_... (from fast2sms.com > Dev API)"
                  className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-mono text-xs font-semibold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                />
                <p className="text-[10px] text-[#6b7280]">
                  Powers cashier/manager OTP login authentication and delivers normal SMS bills to customers who do not have WhatsApp.
                </p>
              </div>
            </div>

            {/* Section 2: Swiggy Partner Integration */}
            <div className="bg-[#ebe0cb]/40 border border-[#cabb9e] rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#ded4c5]">
                <div className="p-2 rounded-lg bg-[#fc8019] text-white shrink-0 font-black text-xs">
                  S
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#11291f]">
                    Swiggy Partner Integration
                  </h4>
                  <p className="text-[11px] text-[#456351]">
                    Receives real-time food orders and syncs menu items directly with your POS.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>
                    Swiggy Restaurant / Outlet ID
                  </label>
                  <input
                    type="text"
                    value={swiggyRestaurantId}
                    onChange={(e) => setSwiggyRestaurantId(e.target.value)}
                    placeholder="e.g. SWIGGY-KCB-MAIN"
                    className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-mono text-xs font-semibold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>
                    Swiggy Partner API Key / Secret
                  </label>
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={swiggyApiKey}
                    onChange={(e) => setSwiggyApiKey(e.target.value)}
                    placeholder="e.g. swg_sec_..."
                    className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-mono text-xs font-semibold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>
                    Swiggy Webhook Callback URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="https://kanchivaram-cafe.onrender.com/api/integrations/swiggy/webhook"
                      className="w-full p-2.5 bg-[#f4ebd9] border border-[#cabb9e] rounded-xl font-mono text-xs font-medium text-[#2d3748] select-all cursor-text focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy('https://kanchivaram-cafe.onrender.com/api/integrations/swiggy/webhook', 'swiggy')}
                      className={`px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                        copiedField === 'swiggy'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white hover:bg-[#ded2bb] border-[#cabb9e] text-[#11291f]'
                      }`}
                    >
                      {copiedField === 'swiggy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'swiggy' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-[#6b7280] mt-1">Paste this URL into your Swiggy Partner Developer Portal under "Order Push Webhooks"</p>
                </div>
              </div>
            </div>

            {/* Section 3: Zomato Merchant Integration */}
            <div className="bg-[#ebe0cb]/40 border border-[#cabb9e] rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#ded4c5]">
                <div className="p-2 rounded-lg bg-[#e23744] text-white shrink-0 font-black text-xs">
                  Z
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#11291f]">
                    Zomato Merchant Integration
                  </h4>
                  <p className="text-[11px] text-[#456351]">
                    Pushes customer delivery orders into the POS kitchen display system and billing ledger.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>
                    Zomato Merchant / ResID
                  </label>
                  <input
                    type="text"
                    value={zomatoMerchantId}
                    onChange={(e) => setZomatoMerchantId(e.target.value)}
                    placeholder="e.g. ZOMATO-KCB-MAIN"
                    className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-mono text-xs font-semibold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>
                    Zomato Merchant API Key / Secret
                  </label>
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={zomatoApiKey}
                    onChange={(e) => setZomatoApiKey(e.target.value)}
                    placeholder="e.g. zom_sec_..."
                    className={`w-full p-2.5 bg-white border border-[#cabb9e] rounded-xl font-mono text-xs font-semibold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'} focus:outline-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block font-bold ${isBrownBranch ? 'text-[#5A321F]' : 'text-[#11291f]'} mb-1`}>
                    Zomato Webhook Callback URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="https://kanchivaram-cafe.onrender.com/api/integrations/zomato/webhook"
                      className="w-full p-2.5 bg-[#f4ebd9] border border-[#cabb9e] rounded-xl font-mono text-xs font-medium text-[#2d3748] select-all cursor-text focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy('https://kanchivaram-cafe.onrender.com/api/integrations/zomato/webhook', 'zomato')}
                      className={`px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                        copiedField === 'zomato'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white hover:bg-[#ded2bb] border-[#cabb9e] text-[#11291f]'
                      }`}
                    >
                      {copiedField === 'zomato' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'zomato' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-[#6b7280] mt-1">Paste this URL into your Zomato Merchant Dashboard under "Webhook Notifications"</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-[#ded4c5] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-2.5 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D] border-[#542A16]' : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]'} text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border disabled:opacity-50`}
          >
            <Save className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
