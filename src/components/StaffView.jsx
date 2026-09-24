import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Clock, 
  Building2, 
  DollarSign, 
  Edit3, 
  Trash2, 
  X,
  CheckCircle2
} from 'lucide-react';
import { fetchStaff, createStaff, deleteStaff, socket } from '../services/api';

const INITIAL_STAFF = [];

const TIME_OPTIONS = [
  '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', 
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', 
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', 
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', 
  '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', 
  '11:00 PM', '11:30 PM', '12:00 AM'
];

export default function StaffView({ selectedBranch }) {
  const branchId = selectedBranch?.id || 'branch-1';
  const isBrownBranch = branchId === 'branch-2';
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for New Staff Member
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('Master Filter Coffee Barista');
  const [shiftType, setShiftType] = useState('Morning');
  const [startTime, setStartTime] = useState('06:30 AM');
  const [endTime, setEndTime] = useState('03:30 PM');
  const [phoneInput, setPhoneInput] = useState('');
  const [payInput, setPayInput] = useState('');

  const loadStaffData = async () => {
    try {
      const res = await fetchStaff(branchId);
      if (res && res.success && Array.isArray(res.staff)) {
        setStaffList(res.staff);
      }
    } catch (err) {
      console.warn('[StaffView] Failed to load staff from PostgreSQL:', err);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, [branchId]);

  useEffect(() => {
    if (!socket) return;
    const handleStaffCreated = (data) => {
      if (data?.branchId === branchId && data.staff) {
        setStaffList(prev => {
          if (prev.some(s => s.id === data.staff.id)) return prev;
          return [data.staff, ...prev];
        });
      }
    };
    const handleStaffUpdated = (data) => {
      if (data?.branchId === branchId && data.staff) {
        setStaffList(prev => prev.map(s => s.id === data.staff.id ? data.staff : s));
      }
    };
    const handleStaffDeleted = (data) => {
      if (data?.branchId === branchId && data.id) {
        setStaffList(prev => prev.filter(s => s.id !== data.id));
      }
    };

    socket.on('staff_created', handleStaffCreated);
    socket.on('staff_updated', handleStaffUpdated);
    socket.on('staff_deleted', handleStaffDeleted);

    return () => {
      socket.off('staff_created', handleStaffCreated);
      socket.off('staff_updated', handleStaffUpdated);
      socket.off('staff_deleted', handleStaffDeleted);
    };
  }, [branchId]);

  const handleShiftTypeChange = (val) => {
    setShiftType(val);
    if (val === 'Morning') {
      setStartTime('06:30 AM');
      setEndTime('03:30 PM');
    } else if (val === 'Evening') {
      setStartTime('03:30 PM');
      setEndTime('11:00 PM');
    } else if (val === 'Full Day') {
      setStartTime('07:00 AM');
      setEndTime('08:00 PM');
    } else if (val === 'Night') {
      setStartTime('10:00 PM');
      setEndTime('06:00 AM');
    }
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = 
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone || '').includes(searchQuery);

    const matchesStatus = selectedStatusFilter === 'All' || s.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!nameInput.trim() || !phoneInput.trim()) return;

    const formattedSchedule = `${shiftType} (${startTime} - ${endTime})`;
    const formattedPhone = phoneInput.trim().startsWith('+91') ? phoneInput.trim() : `+91 ${phoneInput.trim()}`;
    const cleanPayNum = payInput ? Number(payInput) : 18000;

    const payload = {
      name: nameInput.trim(),
      role: roleInput,
      shift: formattedSchedule,
      shiftType,
      startTime,
      endTime,
      phone: formattedPhone,
      status: 'On Duty',
      monthlyPay: cleanPayNum,
      joinedDate: 'Today',
      branchId
    };

    try {
      const res = await createStaff(payload, branchId);
      if (res && res.success && res.staff) {
        setStaffList(prev => [res.staff, ...prev.filter(s => s.id !== res.staff.id)]);
      } else {
        await loadStaffData();
      }
    } catch (err) {
      console.error('[StaffView] Error adding staff:', err);
    }

    setNameInput('');
    setPhoneInput('');
    setPayInput('');
    setShiftType('Morning');
    setStartTime('06:30 AM');
    setEndTime('03:30 PM');
    setIsAddModalOpen(false);
  };

  const handleDeleteStaff = async (id) => {
    try {
      const res = await deleteStaff(id, branchId);
      if (res && res.success) {
        setStaffList(prev => prev.filter(s => s.id !== id));
      } else {
        await loadStaffData();
      }
    } catch (err) {
      console.error('[StaffView] Error deleting staff:', err);
    }
  };

  return (
    <div className="space-y-3 font-sans relative pb-6 w-full">
      
      {/* 1. TOP HEADER BANNER */}
      {/* DESKTOP HEADER (MD+): 100% STRICTLY FROZEN */}
      <div className="hidden md:flex bg-[#ebdcc8] p-3.5 sm:p-4 rounded-2xl border border-[#cabb9e] shadow-xs flex-row items-center justify-between gap-3 shrink-0 relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
          <div className={`p-2.5 ${isBrownBranch ? 'bg-[#3E2312] border-[#542A16]' : 'bg-[#0f3823] border-[#194c31]'} text-white rounded-xl shadow-md border shrink-0`}>
            <UserCheck className={`w-6 h-6 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-[#11291f]">
              Staff Management & Shifts
            </h2>
            <p className="text-xs text-[#456351] font-bold mt-0.5">
              Manage café baristas, chefs, cashiers, shift schedules, and staff profiles.
            </p>
          </div>
        </div>

        {staffList.length > 0 && (
          <div className="flex items-center gap-2 z-10 text-right shrink-0">
            <img
              src="/staff_empty_illustration.png"
              alt="Staff Management Decorative Illustration"
              className="h-16 sm:h-20 max-h-20 w-auto object-contain drop-shadow-xs"
            />
          </div>
        )}
      </div>

      {/* MOBILE HEADER (< MD): CLEAN STRUCTURED ARRANGEMENT */}
      <div className="md:hidden bg-[#ebdcc8] p-3 sm:p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs flex items-center justify-between gap-2.5 shrink-0 relative overflow-hidden">
        <div className="flex items-start gap-2.5 z-10 min-w-0 flex-1">
          <div className={`p-2 ${isBrownBranch ? 'bg-[#3E2312] border-[#542A16]' : 'bg-[#0f3823] border-[#194c31]'} text-white rounded-xl shadow-md border shrink-0 mt-0.5`}>
            <UserCheck className={`w-4.5 h-4.5 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm min-[380px]:text-[15px] font-black font-serif text-[#11291f] leading-tight">
              Staff Management & Shifts
            </h2>
            <p className="text-[10px] min-[380px]:text-[11px] text-[#456351] font-bold mt-0.5 leading-snug">
              Manage baristas, chefs, cashiers, & shift schedules.
            </p>
          </div>
        </div>

        {staffList.length > 0 && (
          <div className="flex items-center justify-end z-10 shrink-0">
            <img
              src="/staff_empty_illustration.png"
              alt="Staff Management Decorative Illustration"
              className="h-22 min-[380px]:h-26 sm:h-30 w-auto max-w-[135px] min-[380px]:max-w-[165px] object-contain object-right drop-shadow-xs"
            />
          </div>
        )}
      </div>

      {/* 2. SEARCH / ACTION ROW */}
      <div className="bg-[#fdfbf7] p-2.5 rounded-2xl border border-[#cabb9e] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
        
        {/* Left: Long Search Bar */}
        <div className="relative w-full md:w-[420px] max-w-full">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name or role..."
            className={`w-full pl-10 pr-4 py-1.5 bg-[#f0ebd9] border border-[#cabb9e] rounded-xl text-xs text-[#0f231a] placeholder-[#385344] focus:outline-none focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]/40' : 'focus:ring-[#0f3823]/40'} font-extrabold shadow-inner transition-all`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} hover:text-black rounded-full cursor-pointer`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center Gap: Single "+ Add Staff Member" Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={`flex items-center justify-center gap-1.5 px-5 py-2 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D] border-[#542A16]' : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]'} text-white text-xs font-black rounded-xl border transition-all cursor-pointer shadow-md shrink-0 w-full md:w-auto`}
        >
          <Plus className={`w-4 h-4 ${isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]'}`} />
          <span>Add Staff Member</span>
        </button>

        {/* Right: Status Filters */}
        <div className="flex items-center bg-[#ebdcc8]/40 p-1 rounded-xl border border-[#cabb9e]/60 shrink-0 w-full md:w-auto justify-center md:justify-end">
          {['All', 'On Duty', 'Scheduled', 'Off Duty'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatusFilter(status)}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedStatusFilter === status 
                  ? `${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white shadow-xs` 
                  : 'text-[#456351] hover:bg-[#ebdcc8]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

      </div>

      {/* 3. MAIN CONTENT CONTAINER (DESKTOP TABLE: md:block & MOBILE CARDS: md:hidden) */}
      <div className="w-full">
        
        {/* DESKTOP TABLE: STRICTLY FROZEN (hidden md:block) */}
        <div className="hidden md:block bg-[#fdfbf7] rounded-2xl border border-[#cabb9e] shadow-sm overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]'} text-white text-[11px] font-extrabold uppercase tracking-wider grid grid-cols-12 gap-2 items-center`}>
                <th className="py-3 px-4 col-span-2 whitespace-nowrap">STAFF NAME</th>
                <th className="py-3 px-4 col-span-2 whitespace-nowrap">ROLE / DESIGNATION</th>
                <th className="py-3 px-4 col-span-2 whitespace-nowrap">SHIFT SCHEDULE</th>
                <th className="py-3 px-4 col-span-2 whitespace-nowrap">CONTACT PHONE</th>
                <th className="py-3 px-4 col-span-2 whitespace-nowrap">MONTHLY SALARY</th>
                <th className="py-3 px-4 col-span-1 text-center whitespace-nowrap">STATUS</th>
                <th className="py-3 px-4 col-span-1 text-center whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className={`text-xs ${filteredStaff.length > 0 ? 'divide-y divide-[#f0e8dc]' : ''}`}>
              {filteredStaff.length === 0 ? (
                <tr className="w-full my-auto">
                  <td colSpan="7" className="py-8 px-4 text-center bg-[#fdfbf7] w-full block">
                    {/* Center 3D Staff Team Illustration (UNTOUCHED) */}
                    <div className="relative w-full max-w-2xl sm:max-w-3xl h-auto flex items-center justify-center mb-4 transition-transform hover:scale-102 mx-auto">
                      <img
                        src="/staff_empty_illustration.png"
                        alt="Staff Management Empty Illustration"
                        className="w-full h-auto max-h-72 sm:max-h-80 md:max-h-84 object-contain relative z-10 drop-shadow-md"
                      />
                    </div>

                    {/* Empty State Text */}
                    <div className="text-center space-y-1.5 relative z-10 max-w-md mx-auto">
                      <h3 className="text-xl sm:text-2xl font-serif font-black text-[#11291f] tracking-wide">
                        No staff members yet!
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-[#547363] leading-relaxed">
                        Start by adding your first staff member to manage roles, shifts, and keep your café running smoothly.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#fbf8f3] transition-colors grid grid-cols-12 gap-2 items-center">
                    <td className="py-3 px-4 col-span-2 font-extrabold text-[#11291f]">{staff.name}</td>
                    <td className={`py-3 px-4 col-span-2 font-bold ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`}>{staff.role}</td>
                    <td className="py-3 px-4 col-span-2 font-semibold text-[#547363]">{staff.shift}</td>
                    <td className="py-3 px-4 col-span-2 font-mono text-[#11291f]">{staff.phone}</td>
                    <td className={`py-3 px-4 col-span-2 font-mono font-black ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'}`}>{staff.pay}</td>
                    <td className="py-3 px-4 col-span-1 text-center">
                      <span className={`px-2 py-0.5 text-[9.5px] font-black rounded-full border shadow-2xs ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B] border-[#542A16]' : 'bg-[#0f3823] text-[#4ade80] border-[#194c31]'}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 col-span-1 text-center">
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE STRUCTURED STAFF CARDS: DEDICATED ARRANGEMENT (<md) */}
        <div className="md:hidden space-y-3">
          {filteredStaff.length === 0 ? (
            <div className="bg-[#fdfbf7] rounded-2xl border border-[#cabb9e] p-6 text-center shadow-xs">
              {/* Preserved Staff Empty Illustration */}
              <div className="relative w-full max-w-xs h-auto flex items-center justify-center mb-3 mx-auto">
                <img
                  src="/staff_empty_illustration.png"
                  alt="Staff Management Empty Illustration"
                  className="w-full h-auto max-h-48 object-contain drop-shadow-sm"
                />
              </div>
              <h3 className="text-lg font-serif font-black text-[#11291f]">
                No staff members yet!
              </h3>
              <p className="text-xs text-[#547363] font-medium mt-1 leading-relaxed">
                Tap "+ Add Staff Member" to add your first barista, chef, or cashier.
              </p>
            </div>
          ) : (
            filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#cabb9e] shadow-xs space-y-2.5"
              >
                {/* Header: Name, Role & Status + Delete */}
                <div className="flex items-start justify-between gap-2 border-b border-[#ebdcc8] pb-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif font-black text-sm text-[#11291f] leading-snug break-words">
                      {staff.name}
                    </h4>
                    <span className={`inline-block text-[11px] font-extrabold ${isBrownBranch ? 'text-[#7A4325]' : 'text-[#0f3823]'} mt-0.5`}>
                      {staff.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 text-[9.5px] font-black rounded-full border shadow-2xs ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B] border-[#542A16]' : 'bg-[#0f3823] text-[#4ade80] border-[#194c31]'}`}>
                      {staff.status}
                    </span>
                    <button
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      title="Delete Staff"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Shift Schedule Box */}
                <div className="bg-[#ebdcc8]/40 p-2.5 rounded-xl border border-[#cabb9e]/60">
                  <div className="flex items-center gap-1.5 text-[9.5px] uppercase font-black text-[#547363]">
                    <Clock className="w-3.5 h-3.5 text-[#547363] shrink-0" />
                    <span>Shift Schedule</span>
                  </div>
                  <p className="font-mono font-bold text-[11px] text-[#11291f] mt-1">
                    {staff.shift}
                  </p>
                </div>

                {/* Card Bottom: Pay & Phone */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#ded4c5]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#547363] block">Monthly Pay</span>
                    <span className="font-mono font-black text-[#11291f] text-[11px]">
                      {staff.pay}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#547363] block">Contact Phone</span>
                    <a
                      href={`tel:${staff.phone}`}
                      className="font-mono font-bold text-[#11291f] hover:underline flex items-center gap-1 mt-0.5 text-[11px]"
                    >
                      <Phone className="w-3 h-3 text-[#547363] shrink-0" />
                      <span>{staff.phone}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ADD STAFF MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <form onSubmit={handleAddStaff} className="bg-[#fdfbf7] border-2 border-[#d4af37] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#cabb9e]">
              <h3 className={`font-serif font-black text-base ${isBrownBranch ? 'text-[#3E2312]' : 'text-[#0f3823]'}`}>Add New Staff Member</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1 text-[#557361] hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-extrabold text-[#11291f] block mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Karthik Raja"
                  className={`w-full px-3.5 py-2.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                />
              </div>

              <div>
                <label className="font-extrabold text-[#11291f] block mb-1.5">Role / Designation</label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className={`w-full px-3 py-2.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                >
                  <option value="Master Filter Coffee Barista">Master Filter Coffee Barista</option>
                  <option value="Head Tiffin Chef">Head Tiffin Chef</option>
                  <option value="POS Cashier & Billing">POS Cashier & Billing</option>
                  <option value="Kitchen Helper & Steward">Kitchen Helper & Steward</option>
                  <option value="Assistant Store Manager">Assistant Store Manager</option>
                </select>
              </div>

              {/* Shift / Working Schedule Section */}
              <div className="bg-[#ebdcc8]/30 p-3 rounded-xl border border-[#cabb9e]/60 space-y-2.5">
                <div>
                  <label className="font-extrabold text-[#11291f] block mb-1.5">Shift / Working Schedule</label>
                  <select
                    value={shiftType}
                    onChange={(e) => handleShiftTypeChange(e.target.value)}
                    className={`w-full px-3 py-2.5 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                  >
                    <option value="Morning">Morning Shift (06:30 AM - 03:30 PM)</option>
                    <option value="Evening">Evening Shift (03:30 PM - 11:00 PM)</option>
                    <option value="Full Day">Full Day Shift (07:00 AM - 08:00 PM)</option>
                    <option value="Night">Night Shift (10:00 PM - 06:00 AM)</option>
                    <option value="Custom">Custom Schedule</option>
                  </select>
                </div>

                {/* Start Time & End Time */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-extrabold text-[#547363] block mb-1.5">Start Time</label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={`w-full px-2.5 py-2 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-xs text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-[#547363] block mb-1.5">End Time</label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={`w-full px-2.5 py-2 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-xs text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-[#11291f] block mb-1.5">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full px-3.5 py-2.5 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                />
              </div>

              <div>
                <label className="font-extrabold text-[#11291f] block mb-1.5">Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={payInput}
                  onChange={(e) => setPayInput(e.target.value)}
                  placeholder="e.g. 24000"
                  className={`w-full px-3.5 py-2.5 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ded4c5]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-1.5 bg-[#ebe0cb] text-[#122c20] font-black text-xs rounded-xl hover:bg-[#dfd3bc] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-1.5 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D]' : 'bg-[#0f3823] hover:bg-[#0a2618]'} text-white font-black text-xs rounded-xl cursor-pointer`}
              >
                Save Staff Profile
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
