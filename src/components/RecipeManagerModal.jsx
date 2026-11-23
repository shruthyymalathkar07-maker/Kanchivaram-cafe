import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Search, 
  ChefHat, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RotateCcw, 
  UtensilsCrossed, 
  Layers, 
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  ALL_RECIPE_CATEGORIES, 
  ALL_PRODUCTS_CATALOG, 
  CLIENT_BOM_MASTER, 
  CLIENT_RAW_MATERIALS_MASTER,
  normalizeUnit 
} from '../data/masterData';
import { inventoryStore } from '../services/inventoryStore';

const STANDARD_UOMS = ['g', 'kg', 'ml', 'L', 'Nos.', 'tsp.', 'Cup', 'Cubes', 'Slices', 'Pinch'];

export default function RecipeManagerModal({ isOpen, onClose, selectedBranch }) {
  if (!isOpen) return null;

  const isBrownBranch = selectedBranch?.id === 'branch-2';

  // Active filters
  const [selectedCatId, setSelectedCatId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, COMPLETE, REVIEW

  // Master recipe list from BOM + custom recipes in store
  const [activeRecipeKey, setActiveRecipeKey] = useState(null);
  const [editServingQty, setEditServingQty] = useState('1');
  const [editServingUom, setEditServingUom] = useState('Nos.');
  const [ingredients, setIngredients] = useState([]);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [newRmId, setNewRmId] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUom, setNewUom] = useState('g');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [recipeRevision, setRecipeRevision] = useState(0);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    const unsub = inventoryStore.subscribe(() => {
      setRecipeRevision(r => r + 1);
    });
    return unsub;
  }, []);

  // Raw materials sorted alphabetically for dropdown
  const sortedRawMaterials = useMemo(() => {
    return [...CLIENT_RAW_MATERIALS_MASTER].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Merge BOM recipes with products catalog
  const recipeItems = useMemo(() => {
    const custom = inventoryStore.customRecipes || {};
    let customPrices = {};
    try {
      customPrices = JSON.parse(localStorage.getItem('kc_dish_prices') || '{}');
    } catch {}
    return ALL_PRODUCTS_CATALOG
      .filter(prod => !inventoryStore.isProductDeleted(prod.id))
      .map(prod => {
      // Find matching recipe
      const bomItem = custom[prod.id] || custom[prod.name.toLowerCase()] || CLIENT_BOM_MASTER.find(b => 
        b.productId === prod.id || b.productName.toLowerCase() === prod.name.toLowerCase()
      );

      const procs = bomItem?.processes || [];
      const hasQuantities = procs.length > 0 && procs.some(p => (parseFloat(p.qty) || 0) > 0);
      const isComplete = bomItem?.status === 'COMPLETE' && hasQuantities;

      return {
        id: prod.id,
        name: prod.name,
        category: prod.category,
        categoryId: prod.categoryId,
        isSubRecipe: !!prod.isSubRecipe,
        isKitchenPrep: !!prod.isKitchenPrep,
        image: prod.image,
        servingQty: bomItem?.servingQty || prod.servingQty || 1,
        servingUom: bomItem?.servingUom || prod.uom || 'Nos.',
        price: customPrices[prod.id] || prod.dineInPrice || prod.price || 0,
        isComplete,
        processes: procs,
        rawRecipe: bomItem
      };
    });
  }, [saveSuccessMsg, recipeRevision]);

  // Filtered recipe items
  const filteredRecipes = useMemo(() => {
    return recipeItems.filter(item => {
      // Category filter
      if (selectedCatId === 'cat-submenu') {
        if (!item.isSubRecipe && !item.isKitchenPrep && item.category !== 'SubMenu') return false;
      } else if (selectedCatId !== 'all') {
        if (item.categoryId !== selectedCatId) return false;
      }

      // Status filter
      if (statusFilter === 'COMPLETE' && !item.isComplete) return false;
      if (statusFilter === 'REVIEW' && item.isComplete) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesIngredient = (item.processes || []).some(p => (p.rawMaterialName || '').toLowerCase().includes(q));
        if (!matchesName && !matchesCategory && !matchesIngredient) return false;
      }

      return true;
    });
  }, [recipeItems, selectedCatId, statusFilter, searchQuery]);

  // Set default active recipe
  useEffect(() => {
    if (!activeRecipeKey && filteredRecipes.length > 0) {
      loadRecipeForEdit(filteredRecipes[0]);
    }
  }, [filteredRecipes]);

  const loadRecipeForEdit = (recipeItem) => {
    setActiveRecipeKey(recipeItem.id);
    setEditServingQty(String(recipeItem.servingQty || 1));
    setEditServingUom(recipeItem.servingUom || 'Nos.');
    setIngredients(
      (recipeItem.processes || []).map((p, idx) => ({
        step: p.step || idx + 1,
        rawMaterialId: p.rawMaterialId,
        rawMaterialName: p.rawMaterialName,
        qty: String(p.qty ?? 0),
        uom: p.uom || 'g',
        process: p.process || 'Add'
      }))
    );
    setIsAddingIngredient(false);
    setSaveSuccessMsg('');
  };

  const selectedRecipe = useMemo(() => {
    return recipeItems.find(r => r.id === activeRecipeKey) || filteredRecipes[0] || null;
  }, [activeRecipeKey, recipeItems, filteredRecipes]);

  // Handle ingredient quantity update
  const handleQtyChange = (index, value) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qty: value };
      return updated;
    });
  };

  // Handle ingredient UOM update
  const handleUomChange = (index, value) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], uom: value };
      return updated;
    });
  };

  // Handle remove ingredient
  const handleRemoveIngredient = (index) => {
    setIngredients(prev => prev.filter((_, idx) => idx !== index));
  };

  // Handle add new ingredient
  const handleConfirmAddIngredient = () => {
    if (!newRmId) return;
    const matchedRm = sortedRawMaterials.find(rm => rm.id === newRmId);
    if (!matchedRm) return;

    setIngredients(prev => [
      ...prev,
      {
        step: prev.length + 1,
        rawMaterialId: matchedRm.id,
        rawMaterialName: matchedRm.name,
        qty: newQty ? String(newQty) : '10',
        uom: newUom || matchedRm.unit || 'g',
        process: 'Add'
      }
    ]);

    setNewRmId('');
    setNewQty('');
    setNewUom('g');
    setIsAddingIngredient(false);
  };

  // Handle Save Recipe
  const handleSaveRecipe = () => {
    if (!selectedRecipe) return;

    const validatedProcesses = ingredients.map((ing, idx) => ({
      step: idx + 1,
      rawMaterialId: ing.rawMaterialId,
      rawMaterialName: ing.rawMaterialName,
      qty: parseFloat(ing.qty) || 0,
      uom: ing.uom || 'g',
      process: ing.process || 'Add'
    }));

    const recipePayload = {
      productId: selectedRecipe.id,
      productName: selectedRecipe.name,
      servingQty: parseFloat(editServingQty) || 1,
      servingUom: editServingUom || 'Nos.',
      status: validatedProcesses.some(p => p.qty > 0) ? 'COMPLETE' : 'AWAITING_RECIPE_DETAILS',
      processes: validatedProcesses,
      finalProcess: 'Prepare as per recipe and serve'
    };

    inventoryStore.saveCustomRecipe(selectedRecipe.id, recipePayload);
    setRecipeRevision(r => r + 1);
    setSaveSuccessMsg(`Recipe for "${selectedRecipe.name}" saved and active!`);

    setTimeout(() => {
      setSaveSuccessMsg('');
    }, 3500);
  };

  // Handle Delete Dish and Recipe from Recipe Manager and POS
  const handleDeleteDishAndRecipe = () => {
    if (!selectedRecipe) return;
    const deletedName = selectedRecipe.name;
    const deletedId = selectedRecipe.id;

    inventoryStore.deleteProductEverywhere(deletedId, deletedName);
    setRecipeRevision(r => r + 1);
    setIsConfirmDeleteOpen(false);
    setActiveRecipeKey(null);
    setSaveSuccessMsg(`Dish "${deletedName}" and its recipe have been discontinued and removed from POS Billing.`);

    setTimeout(() => {
      setSaveSuccessMsg('');
    }, 4000);
  };

  // Modal Content
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fbf8f3] w-full max-w-5xl h-[92vh] max-h-[850px] rounded-3xl border border-[#ded3c4] shadow-2xl flex flex-col overflow-hidden">
        
        {/* ================================================================= */}
        {/* 1. TOP HEADER BAR                                                */}
        {/* ================================================================= */}
        <div className={`p-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-3 shrink-0 ${
          isBrownBranch ? 'bg-[#3E2312] text-white border-[#542A16]' : 'bg-[#122c20] text-white border-[#1c4532]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isBrownBranch ? 'bg-[#542A16] border-[#704225] text-[#C69A4B]' : 'bg-[#1b4331] border-[#296349] text-[#4ade80]'
            }`}>
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight font-serif flex items-center gap-2">
                <span>Recipe & Portion Formulas (BOM)</span>
                <span className="text-[10px] uppercase font-sans font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/90">
                  {isBrownBranch ? 'City Branch' : 'Main Branch'}
                </span>
              </h2>
              <p className="text-xs text-white/70">
                Configure exact kitchen ingredient grams & prep batch yields for automated stock deduction
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Recipe Manager"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* 2. CATEGORY TABS (ALL CATEGORIES FULLY VISIBLE & UNCLUTTERED)      */}
        {/* ================================================================= */}
        <div className="bg-[#f5efe6] border-b border-[#ded3c4] p-3 px-4 sm:px-6 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_RECIPE_CATEGORIES.map(cat => {
              const isActive = selectedCatId === cat.id;
              const isKitchenSub = cat.id === 'cat-submenu';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                    isActive
                      ? isBrownBranch 
                        ? 'bg-[#542A16] text-white ring-2 ring-[#C69A4B] shadow-sm' 
                        : 'bg-[#122c20] text-white ring-2 ring-[#4ade80] shadow-sm'
                      : isKitchenSub
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-black'
                        : 'bg-[#ebdcc8] hover:bg-[#dfd0ba] text-[#122c20] border border-[#cabb9e]'
                  }`}
                >
                  <span className="text-xs">{cat.icon || '☕'}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. MAIN SPLIT BODY (Left Dish List + Right Recipe Editor)         */}
        {/* ================================================================= */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* LEFT COLUMN: Dish Selector List (35% width on desktop) */}
          <div className="w-full md:w-80 lg:w-96 border-r border-[#ded3c4] flex flex-col bg-[#fdfbf7] shrink-0 h-48 md:h-auto overflow-hidden">
            
            {/* Search Input & Status Filters */}
            <div className="p-3 border-b border-[#ded3c4] bg-[#f8f3ea] space-y-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7b9887]" />
                <input
                  type="text"
                  placeholder="Search dish or ingredient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#ded3c4] rounded-xl text-xs text-[#122c20] focus:outline-none focus:ring-1 focus:ring-[#122c20]"
                />
              </div>

              {/* Status Filter Toggle */}
              <div className="flex items-center gap-1 bg-[#ebdcc8] p-1 rounded-xl border border-[#cabb9e] text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-white text-[#122c20] shadow-xs font-black' : 'text-[#456351] hover:text-[#122c20]'
                  }`}
                >
                  All ({filteredRecipes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('COMPLETE')}
                  className={`flex-1 py-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    statusFilter === 'COMPLETE' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-[#456351] hover:text-emerald-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Complete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('REVIEW')}
                  className={`flex-1 py-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    statusFilter === 'REVIEW' ? 'bg-white text-amber-900 shadow-xs font-black' : 'text-[#456351] hover:text-amber-900'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Review</span>
                </button>
              </div>
            </div>

            {/* List of Dishes */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#eee4d6] p-1">
              {filteredRecipes.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#6e8a79]">
                  No recipes found matching current filters.
                </div>
              ) : (
                filteredRecipes.map(item => {
                  const isSelected = selectedRecipe?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => loadRecipeForEdit(item)}
                      className={`w-full p-2.5 text-left rounded-xl transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                        isSelected 
                          ? isBrownBranch 
                            ? 'bg-[#f0dfc8] border border-[#C69A4B]/60 shadow-xs' 
                            : 'bg-[#e5f3eb] border border-[#122c20]/30 shadow-xs'
                          : 'hover:bg-[#f5efe6]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          onError={(e) => { e.target.src = '/branch_main.jpg'; }}
                          className="w-9 h-9 rounded-lg object-cover border border-[#ded3c4] shrink-0 bg-stone-100" 
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#122c20] font-black' : 'text-[#2b3a31]'}`}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-[#6e8a79] truncate">
                            {item.category} • {item.servingQty} {item.servingUom}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {item.isComplete ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{item.processes.length}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Edit</span>
                          </span>
                        )}
                        <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#122c20]' : 'text-stone-300'}`} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Recipe Formula Editor */}
          <div className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden">
            {selectedRecipe ? (
              <div className="flex-1 flex flex-col min-h-0">
                
                {/* Dish Header Card */}
                <div className="p-4 sm:px-6 bg-[#fbf8f3] border-b border-[#ded3c4] flex items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={selectedRecipe.image} 
                      alt={selectedRecipe.name} 
                      onError={(e) => { e.target.src = '/branch_main.jpg'; }}
                      className="w-12 h-12 rounded-xl object-cover border border-[#ded3c4] shadow-xs" 
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-[#122c20] font-serif truncate">
                          {selectedRecipe.name}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          selectedRecipe.isComplete 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {selectedRecipe.isComplete ? '🟢 Active Recipe' : '🟡 Review Quantities'}
                        </span>
                      </div>
                      <p className="text-xs text-[#5a7a67] mt-0.5">
                        Category: <strong className="text-[#122c20]">{selectedRecipe.category}</strong> • Price: <strong className="text-[#122c20]">₹{selectedRecipe.price}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Serving Yield Input */}
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#ded3c4] shrink-0 text-xs shadow-xs">
                    <span className="text-[#5a7a67] font-semibold">Yield / Serving:</span>
                    <input
                      type="number"
                      value={editServingQty}
                      onChange={(e) => setEditServingQty(e.target.value)}
                      className="w-12 text-center font-bold text-[#122c20] bg-stone-50 rounded border border-[#ded3c4] py-0.5"
                    />
                    <select
                      value={editServingUom}
                      onChange={(e) => setEditServingUom(e.target.value)}
                      className="bg-stone-50 font-bold text-[#122c20] rounded border border-[#ded3c4] py-0.5 px-1"
                    >
                      {STANDARD_UOMS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Save Feedback Banner */}
                {saveSuccessMsg && (
                  <div className="bg-emerald-600 text-white text-xs font-bold px-6 py-2 flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  </div>
                )}

                {/* Ingredients Table */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase font-extrabold text-[#456351] tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>Bill of Materials (BOM) — Ingredients Breakdown ({ingredients.length})</span>
                    </h4>
                    
                    <button
                      type="button"
                      onClick={() => setIsAddingIngredient(true)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#eef7f2] hover:bg-[#d8efe2] text-[#122c20] border border-[#a4dcbc] text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Add Ingredient</span>
                    </button>
                  </div>

                  {/* Add Ingredient Inline Dropdown */}
                  {isAddingIngredient && (
                    <div className="p-3 bg-[#f5efe6] border border-[#ded3c4] rounded-2xl flex flex-wrap items-center gap-2.5 animate-fadeIn">
                      <select
                        value={newRmId}
                        onChange={(e) => setNewRmId(e.target.value)}
                        className="flex-1 min-w-[200px] bg-white border border-[#ded3c4] rounded-xl px-3 py-1.5 text-xs text-[#122c20] font-medium"
                      >
                        <option value="">Select Raw Material from Master List...</option>
                        {sortedRawMaterials.map(rm => (
                          <option key={rm.id} value={rm.id}>{rm.name} ({rm.category || 'General'})</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Portion Qty"
                        value={newQty}
                        onChange={(e) => setNewQty(e.target.value)}
                        className="w-24 bg-white border border-[#ded3c4] rounded-xl px-3 py-1.5 text-xs text-center font-bold text-[#122c20]"
                      />

                      <select
                        value={newUom}
                        onChange={(e) => setNewUom(e.target.value)}
                        className="w-24 bg-white border border-[#ded3c4] rounded-xl px-2 py-1.5 text-xs font-bold text-[#122c20]"
                      >
                        {STANDARD_UOMS.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleConfirmAddIngredient}
                          className="px-3 py-1.5 bg-[#122c20] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#1a3d2d] cursor-pointer"
                        >
                          Add to Recipe
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingIngredient(false)}
                          className="px-2.5 py-1.5 bg-stone-200 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ingredients Rows */}
                  <div className="border border-[#ded3c4] rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#f5efe6] text-[#456351] font-extrabold uppercase text-[10.5px] border-b border-[#ded3c4]">
                          <th className="py-2.5 px-4 w-12 text-center">#</th>
                          <th className="py-2.5 px-4">Raw Ingredient Name</th>
                          <th className="py-2.5 px-4 w-32 text-center">Portion Qty</th>
                          <th className="py-2.5 px-4 w-28 text-center">Unit (UOM)</th>
                          <th className="py-2.5 px-4 w-16 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0e8dc] text-black">
                        {ingredients.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-stone-400">
                              No ingredients listed yet. Click <strong>+ Add Ingredient</strong> above.
                            </td>
                          </tr>
                        ) : (
                          ingredients.map((ing, idx) => (
                            <tr key={idx} className="hover:bg-[#fbf8f3] transition-colors">
                              <td className="py-2.5 px-4 text-center font-bold text-stone-400">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-4 font-bold text-[#122c20]">
                                {ing.rawMaterialName}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <input
                                  type="number"
                                  step="any"
                                  value={ing.qty}
                                  onChange={(e) => handleQtyChange(idx, e.target.value)}
                                  className="w-20 px-2 py-1 text-center font-black text-xs text-[#122c20] bg-white border border-[#cabb9e] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#122c20]"
                                />
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <select
                                  value={ing.uom}
                                  onChange={(e) => handleUomChange(idx, e.target.value)}
                                  className="px-2 py-1 text-xs font-bold text-[#122c20] bg-white border border-[#cabb9e] rounded-lg focus:outline-none"
                                >
                                  {STANDARD_UOMS.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveIngredient(idx)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Remove Ingredient from Recipe"
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
                </div>

                {/* Footer Action Bar */}
                <div className="p-3.5 px-6 bg-[#f5efe6] border-t border-[#ded3c4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsConfirmDeleteOpen(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
                      title="Discontinue dish and delete from Recipe Manager and POS Billing"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete Dish & Recipe</span>
                    </button>
                    <p className="text-[11px] text-[#5a7a67] hidden md:block">
                      Formulas sync instantly across branches.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => loadRecipeForEdit(selectedRecipe)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Changes</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveRecipe}
                      className={`px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                        isBrownBranch 
                          ? 'bg-[#3E2312] hover:bg-[#542A16] border border-[#704225]' 
                          : 'bg-[#122c20] hover:bg-[#1a3d2d] border border-[#23553e]'
                      }`}
                    >
                      <Save className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="whitespace-nowrap">Save & Activate Recipe</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8 text-stone-400">
                Select a dish from the left to view or edit its recipe.
              </div>
            )}
          </div>

        </div>

        {/* Safety Confirmation Dialog for Discontinuing / Deleting Dish */}
        {isConfirmDeleteOpen && selectedRecipe && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-[#fdfbf7] max-w-md w-full rounded-2xl border-2 border-rose-300 p-5 shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0 border border-rose-200">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#122c20] font-serif">
                    Discontinue & Delete Dish?
                  </h3>
                  <p className="text-xs text-[#5a7a67] mt-1 leading-relaxed">
                    Are you sure you want to discontinue <strong className="text-rose-700">"{selectedRecipe.name}"</strong>?
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    This will permanently remove the dish and its recipe formula from both the <strong>Recipe Manager</strong> and the <strong>POS Billing screen</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#ded3c4]">
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDishAndRecipe}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete Dish & Recipe</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
