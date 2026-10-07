import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Coffee, 
  DollarSign, 
  Layers, 
  ChefHat, 
  CheckCircle2, 
  ChevronDown, 
  Info,
  Tag
} from 'lucide-react';
import { PRODUCT_CATEGORIES, CLIENT_RAW_MATERIALS_MASTER, normalizeUnit, isOriginalProduct } from '../data/masterData';
import { createProduct, updateProduct, deleteProduct } from '../services/api';
import { inventoryStore } from '../services/inventoryStore';

export default function AddMenuItemModal({ 
  isOpen, 
  onClose, 
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
  productToEdit = null,
  existingProducts = [], 
  selectedBranch 
}) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';
  const fileInputRef = useRef(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('cat-kc-signatures');
  const [servingQty, setServingQty] = useState('1');
  const [uom, setUom] = useState('Nos.');
  const [description, setDescription] = useState('');
  
  // Pricing & Tax
  const [dineInPrice, setDineInPrice] = useState('');
  const [swiggyPrice, setSwiggyPrice] = useState('');
  const [zomatoPrice, setZomatoPrice] = useState('');
  const [gstPercent, setGstPercent] = useState('5');
  
  // Image & Standardization State
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [standardizedImage, setStandardizedImage] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageFileName, setImageFileName] = useState('');

  // Availability State
  const [isAvailable, setIsAvailable] = useState(true);

  // BOM / Recipe State
  const [enableBOM, setEnableBOM] = useState(false);
  const [recipeServingQty, setRecipeServingQty] = useState('1');
  const [recipeServingUom, setRecipeServingUom] = useState('Nos.');
  const [finalProcess, setFinalProcess] = useState('');
  const [ingredients, setIngredients] = useState([
    { rawMaterialId: '', rawMaterialName: '', quantity: '', uom: 'g', process: 'Add' }
  ]);

  // Add-ons / Extras State
  const [enableAddons, setEnableAddons] = useState(false);
  const [addonsList, setAddonsList] = useState([
    { id: 'add-1', name: '', price: '', isAvailable: true, rawMaterialId: '', quantity: '', uom: 'g' }
  ]);

  // Validation & Submission State
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Raw Materials Master list for BOM dropdown (Alphabetical A-Z)
  const [availableRawMaterials, setAvailableRawMaterials] = useState(() => {
    return [...CLIENT_RAW_MATERIALS_MASTER].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  });

  useEffect(() => {
    const invState = inventoryStore.getState();
    if (invState?.items && invState.items.length > 0) {
      setAvailableRawMaterials(invState.items);
    }
  }, [isOpen]);

  // Sync / Initialize Form Data when modal opens or productToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setName(productToEdit.name || '');
        setCategoryId(productToEdit.categoryId || 'cat-kc-signatures');
        setServingQty(String(productToEdit.servingQty || 1));
        setUom(productToEdit.uom || 'Nos.');
        setDescription(productToEdit.description || '');
        setDineInPrice(productToEdit.dineInPrice !== undefined ? String(productToEdit.dineInPrice) : (productToEdit.price !== undefined ? String(productToEdit.price) : ''));
        setSwiggyPrice(productToEdit.swiggyPrice !== undefined && productToEdit.swiggyPrice !== null ? String(productToEdit.swiggyPrice) : '');
        setZomatoPrice(productToEdit.zomatoPrice !== undefined && productToEdit.zomatoPrice !== null ? String(productToEdit.zomatoPrice) : '');
        setGstPercent(productToEdit.gstPercent !== undefined ? String(productToEdit.gstPercent) : '5');
        setStandardizedImage(productToEdit.image || '');
        setRawImageSrc(productToEdit.image || null);
        setImageFileName('');
        setIsAvailable(productToEdit.isAvailable !== false);

        // Populate BOM if present
        if (productToEdit.recipe && productToEdit.recipe.ingredients && productToEdit.recipe.ingredients.length > 0) {
          setEnableBOM(true);
          setRecipeServingQty(String(productToEdit.recipe.servingQty || productToEdit.servingQty || 1));
          setRecipeServingUom(productToEdit.recipe.servingUom || productToEdit.uom || 'Nos.');
          setFinalProcess(productToEdit.recipe.finalProcess || '');
          setIngredients(productToEdit.recipe.ingredients.map(ing => ({
            rawMaterialId: ing.rawMaterialId || '',
            rawMaterialName: ing.rawMaterialName || ing.name || '',
            quantity: String(ing.quantity || ing.qty || ''),
            uom: ing.uom || 'g',
            process: ing.process || 'Add'
          })));
        } else {
          setEnableBOM(false);
          setRecipeServingQty('1');
          setRecipeServingUom('Nos.');
          setFinalProcess('');
          setIngredients([{ rawMaterialId: '', rawMaterialName: '', quantity: '', uom: 'g', process: 'Add' }]);
        }

        // Populate Addons if present
        if (productToEdit.addons && Array.isArray(productToEdit.addons) && productToEdit.addons.length > 0) {
          setEnableAddons(true);
          setAddonsList(productToEdit.addons.map(a => ({
            id: a.id || `add-${Date.now()}`,
            name: a.name || '',
            price: String(a.price || 0),
            isAvailable: a.isAvailable !== false,
            rawMaterialId: a.rawMaterialId || '',
            quantity: a.quantity ? String(a.quantity) : '',
            uom: a.uom || 'g'
          })));
        } else {
          setEnableAddons(false);
          setAddonsList([{ id: 'add-1', name: '', price: '', isAvailable: true, rawMaterialId: '', quantity: '', uom: 'g' }]);
        }
      } else {
        // Reset to initial clean state
        setName('');
        setCategoryId('cat-kc-signatures');
        setServingQty('1');
        setUom('Nos.');
        setDescription('');
        setDineInPrice('');
        setSwiggyPrice('');
        setZomatoPrice('');
        setGstPercent('5');
        setRawImageSrc(null);
        setStandardizedImage('');
        setImageFileName('');
        setIsAvailable(true);
        setEnableBOM(false);
        setRecipeServingQty('1');
        setRecipeServingUom('Nos.');
        setFinalProcess('');
        setIngredients([{ rawMaterialId: '', rawMaterialName: '', quantity: '', uom: 'g', process: 'Add' }]);
        setEnableAddons(false);
        setAddonsList([{ id: 'add-1', name: '', price: '', isAvailable: true, rawMaterialId: '', quantity: '', uom: 'g' }]);
      }
      setErrorMessage('');
      setIsConfirmRemoveOpen(false);
    }
  }, [isOpen, productToEdit]);

  // Check for duplicate name warning (excluding self when editing)
  const duplicateWarning = name.trim() && existingProducts.some(
    p => p.id !== productToEdit?.id && p.name.trim().toLowerCase() === name.trim().toLowerCase()
  );

  // Available categories (excluding 'all' pseudo-filter)
  const menuCategories = PRODUCT_CATEGORIES.filter(c => c.id !== 'all');

  // Handle Image Upload & Automatic Standardization to 4:3 Aspect Ratio (400x300)
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPEG, WebP).');
      return;
    }

    setImageFileName(file.name);
    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Target exact POS card frame aspect ratio: 4:3 (400 width x 300 height)
        const targetWidth = 400;
        const targetHeight = 300;
        const targetAspect = targetWidth / targetHeight;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setIsProcessingImage(false);
          return;
        }

        // Calculate aspect-fill center crop (cover)
        const sourceWidth = img.naturalWidth || img.width;
        const sourceHeight = img.naturalHeight || img.height;
        const sourceAspect = sourceWidth / sourceHeight;

        let renderWidth, renderHeight, offsetX, offsetY;

        if (sourceAspect > targetAspect) {
          // Source is wider than target -> crop left/right
          renderHeight = sourceHeight;
          renderWidth = sourceHeight * targetAspect;
          offsetX = (sourceWidth - renderWidth) / 2;
          offsetY = 0;
        } else {
          // Source is taller than target -> crop top/bottom
          renderWidth = sourceWidth;
          renderHeight = sourceWidth / targetAspect;
          offsetX = 0;
          offsetY = (sourceHeight - renderHeight) / 2;
        }

        // Draw centered and cropped image
        ctx.fillStyle = '#ebdcc8';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(
          img,
          offsetX, offsetY, renderWidth, renderHeight,
          0, 0, targetWidth, targetHeight
        );

        // Export standardized JPEG at 90% quality
        const standardizedDataUrl = canvas.toDataURL('image/jpeg', 0.90);
        setStandardizedImage(standardizedDataUrl);
        setRawImageSrc(event.target.result);
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        alert('Failed to load the selected image. Please try another image.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // BOM Ingredient Handlers
  const handleAddIngredient = () => {
    setIngredients(prev => [
      ...prev,
      { rawMaterialId: '', rawMaterialName: '', quantity: '', uom: 'g', process: 'Add' }
    ]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index, field, value) => {
    setIngredients(prev => {
      const updated = [...prev];
      if (field === 'rawMaterialId') {
        const matched = availableRawMaterials.find(rm => rm.id === value);
        updated[index] = {
          ...updated[index],
          rawMaterialId: value,
          rawMaterialName: matched ? matched.name : '',
          uom: matched ? normalizeUnit(matched.unit) : updated[index].uom
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Add-on Handlers
  const handleAddAddon = () => {
    setAddonsList(prev => [
      ...prev,
      { id: `add-${Date.now()}`, name: '', price: '', isAvailable: true, rawMaterialId: '', quantity: '', uom: 'g' }
    ]);
  };

  const handleRemoveAddon = (index) => {
    setAddonsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddonChange = (index, field, value) => {
    setAddonsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage('Item Name is required.');
      return;
    }

    if (duplicateWarning) {
      setErrorMessage(`A menu item named "${cleanName}" already exists. Please enter a unique name.`);
      return;
    }

    const numDineInPrice = parseFloat(dineInPrice);
    if (isNaN(numDineInPrice) || numDineInPrice < 0) {
      setErrorMessage('Please enter a valid Dining / In-Store Price.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCatObj = menuCategories.find(c => c.id === categoryId);
      const categoryName = selectedCatObj ? selectedCatObj.name : 'KC Signatures';

      // Build BOM payload if enabled
      let recipePayload = null;
      if (enableBOM) {
        const validIngredients = ingredients
          .filter(ing => (ing.rawMaterialId || ing.rawMaterialName) && parseFloat(ing.quantity) > 0)
          .map(ing => ({
            rawMaterialId: ing.rawMaterialId,
            rawMaterialName: ing.rawMaterialName || (availableRawMaterials.find(r => r.id === ing.rawMaterialId)?.name || 'Ingredient'),
            quantity: parseFloat(ing.quantity),
            uom: ing.uom || 'units',
            process: ing.process || 'Add'
          }));

        if (validIngredients.length > 0) {
          recipePayload = {
            servingQty: parseFloat(recipeServingQty) || parseFloat(servingQty) || 1,
            servingUom: recipeServingUom || uom || 'Nos.',
            finalProcess: finalProcess || `Prepare and serve ${cleanName}`,
            ingredients: validIngredients
          };
        }
      }

      // Build Add-ons payload if enabled
      let finalAddons = [];
      if (enableAddons) {
        finalAddons = addonsList
          .filter(a => a.name.trim() && parseFloat(a.price) >= 0)
          .map(a => ({
            id: a.id || `add-${Date.now()}`,
            name: a.name.trim(),
            price: parseFloat(a.price) || 0,
            isAvailable: a.isAvailable !== false,
            rawMaterialId: a.rawMaterialId || null,
            quantity: a.quantity ? parseFloat(a.quantity) : null,
            uom: a.uom || 'g'
          }));
      }

      const productPayload = {
        name: cleanName,
        categoryId,
        categoryName,
        servingQty: parseFloat(servingQty) || 1,
        uom: uom || 'Nos.',
        dineInPrice: numDineInPrice,
        swiggyPrice: swiggyPrice ? parseFloat(swiggyPrice) : numDineInPrice,
        zomatoPrice: zomatoPrice ? parseFloat(zomatoPrice) : numDineInPrice,
        deliveryPrice: swiggyPrice ? parseFloat(swiggyPrice) : numDineInPrice,
        gstPercent: gstPercent ? parseFloat(gstPercent) : 5.0,
        addons: finalAddons,
        description: description.trim(),
        image: standardizedImage || null,
        isAvailable: Boolean(isAvailable),
        branchId: selectedBranch?.id || 'branch-1',
        recipe: recipePayload
      };

      if (productToEdit) {
        const res = await updateProduct(productToEdit.id, productPayload, selectedBranch?.id || 'branch-1');
        if (!res || res.success === false) {
          throw new Error(res?.error || 'Failed to update menu item.');
        }

        if (onProductUpdated) {
          onProductUpdated(res.product || { ...productPayload, id: productToEdit.id });
        }
      } else {
        const res = await createProduct(productPayload, selectedBranch?.id || 'branch-1');

        if (!res || res.success === false) {
          throw new Error(res?.error || 'Failed to save menu item to database.');
        }

        // If product has a recipe, register it dynamically with inventoryStore
        if (res.product && recipePayload) {
          inventoryStore.customRecipes[res.product.id] = {
            productId: res.product.id,
            productName: cleanName,
            status: 'COMPLETE',
            processes: recipePayload.ingredients.map(ing => ({
              rawMaterialId: ing.rawMaterialId,
              rawMaterialName: ing.rawMaterialName,
              qty: ing.quantity,
              uom: ing.uom,
              process: ing.process
            }))
          };
        }

        if (onProductCreated) {
          onProductCreated(res.product);
        }
      }

      onClose();
    } catch (err) {
      console.error('[AddMenuItemModal] Save error:', err);
      setErrorMessage(err.message || 'Failed to save menu item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!productToEdit || isDeleting) return;
    setIsDeleting(true);
    setErrorMessage('');
    try {
      const branchId = selectedBranch?.id || 'branch-1';
      const res = await deleteProduct(productToEdit.id, branchId);
      if (res && res.success === false) {
        throw new Error(res.error || 'Failed to remove menu item');
      }
      if (onProductDeleted) {
        onProductDeleted(productToEdit.id);
      }
      setIsConfirmRemoveOpen(false);
      onClose();
    } catch (err) {
      console.error('[AddMenuItemModal] Delete error:', err);
      setErrorMessage(err.message || 'Failed to remove menu item. Please check the server connection.');
      setIsConfirmRemoveOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const currentCategoryName = menuCategories.find(c => c.id === categoryId)?.name || 'KC Signatures';
  const previewPrice = parseFloat(dineInPrice) || 0;

  return typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 modal-backdrop-overlay animate-fadeIn overflow-y-auto">
      <div className="bg-[#fdfbf7] border-2 border-[#cabb9e] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <div className="bg-[#ebdcc8] text-[#11291f] p-4 px-6 border-b border-[#cabb9e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${isBrownBranch ? 'bg-[#3E2312] text-[#C69A4B]' : 'bg-[#0f3823] text-[#4ade80]'} rounded-xl shadow-xs shrink-0`}>
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black text-[#11291f] leading-tight">
                {productToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <p className="text-xs font-bold text-[#456351] mt-0.5">
                {productToEdit ? 'Manage pricing, photo, availability, BOM recipe & extras' : 'Add directly to POS catalog with pricing, photo, GST, BOM & add-ons'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#456351] hover:text-[#11291f] hover:bg-[#ded2be] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY (SCROLLABLE FORM WITH TWO-COLUMN WORKSPACE)                    */}
        {/* ========================================================================= */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6 text-xs text-[#11291f]">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-800 font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MAIN GRID: FORM INPUTS (LEFT) + IMAGE STANDARDIZATION PREVIEW (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: FORM DETAILS (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="bg-[#f8f5ee] p-4 rounded-2xl border border-[#ded4c5] space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-[#ded4c5] pb-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#0f3823]" />
                  <h3 className="font-serif font-black text-xs uppercase tracking-wider text-[#11291f]">
                    1. Basic Item Details
                  </h3>
                </div>

                {/* Item Name */}
                <div>
                  <label className="font-extrabold text-[#11291f] block mb-1">
                    Item Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="e.g. Strawberry Milkshake"
                    className={`w-full px-3 py-2 bg-white border ${duplicateWarning ? 'border-red-500 ring-1 ring-red-400' : 'border-[#cabb9e]'} rounded-xl font-bold text-[#11291f] focus:outline-none focus:ring-2 ${isBrownBranch ? 'focus:ring-[#7A4325]' : 'focus:ring-[#0f3823]'}`}
                  />
                  {duplicateWarning && (
                    <p className="text-[10.5px] font-bold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      A product with this name already exists in the menu.
                    </p>
                  )}
                </div>

                {/* Category & Serving Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-[#11291f] block mb-1">
                      Category <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:outline-none focus:ring-2 focus:ring-[#0f3823]"
                    >
                      {menuCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="font-extrabold text-[#11291f] block mb-1">Serving Qty</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={servingQty}
                        onChange={(e) => setServingQty(e.target.value)}
                        placeholder="1"
                        className="w-full px-2.5 py-2 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-[#11291f] block mb-1">Unit</label>
                      <select
                        value={uom}
                        onChange={(e) => setUom(e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-[#cabb9e] rounded-xl font-bold text-[#11291f] focus:outline-none"
                      >
                        <option value="Nos.">Nos.</option>
                        <option value="ml">ml</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="L">L</option>
                        <option value="Plate">Plate</option>
                        <option value="Cup">Cup</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Item Description / Notes */}
                <div>
                  <label className="font-extrabold text-[#11291f] block mb-1">
                    Short Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Fresh farm strawberries blended with rich chilled milk"
                    className="w-full px-3 py-1.5 bg-white border border-[#cabb9e] rounded-xl font-medium text-[#11291f] focus:outline-none"
                  />
                </div>

              </div>

              {/* SECTION 2: PRICING & GST */}
              <div className="bg-[#f8f5ee] p-4 rounded-2xl border border-[#ded4c5] space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-[#ded4c5] pb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#0f3823]" />
                  <h3 className="font-serif font-black text-xs uppercase tracking-wider text-[#11291f]">
                    2. Pricing & GST
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Dining Price */}
                  <div>
                    <label className="font-extrabold text-[#11291f] block mb-1">
                      Dining Price (₹) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={dineInPrice}
                      onChange={(e) => setDineInPrice(e.target.value)}
                      placeholder="120"
                      className="w-full px-3 py-2 bg-white border border-[#cabb9e] rounded-xl font-mono font-black text-[#0f3823] focus:outline-none focus:ring-2 focus:ring-[#0f3823]"
                    />
                    <span className="text-[10px] font-bold text-[#547363] mt-0.5 block">POS in-store price</span>
                  </div>

                  {/* Swiggy Price */}
                  <div>
                    <label className="font-extrabold text-[#11291f] block mb-1">
                      Swiggy Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={swiggyPrice}
                      onChange={(e) => setSwiggyPrice(e.target.value)}
                      placeholder={dineInPrice ? String(Number(dineInPrice) + 20) : '140'}
                      className="w-full px-3 py-2 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] focus:outline-none"
                    />
                    <span className="text-[10px] font-bold text-[#547363] mt-0.5 block">Online channel rate</span>
                  </div>

                  {/* Zomato Price */}
                  <div>
                    <label className="font-extrabold text-[#11291f] block mb-1">
                      Zomato Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={zomatoPrice}
                      onChange={(e) => setZomatoPrice(e.target.value)}
                      placeholder={dineInPrice ? String(Number(dineInPrice) + 25) : '145'}
                      className="w-full px-3 py-2 bg-white border border-[#cabb9e] rounded-xl font-mono font-bold text-[#11291f] focus:outline-none"
                    />
                    <span className="text-[10px] font-bold text-[#547363] mt-0.5 block">Online channel rate</span>
                  </div>
                </div>

                {/* GST Percentage */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <label className="font-extrabold text-[#11291f] block">Applicable GST / Tax Rate</label>
                    <span className="text-[10.5px] font-bold text-[#547363]">Standard Food & Beverage is 5.0%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {['0', '5', '12', '18'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGstPercent(g)}
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                          gstPercent === g
                            ? 'bg-[#0f3823] text-white shadow-xs'
                            : 'bg-white text-[#456351] border border-[#cabb9e] hover:bg-[#eae1d0]'
                        }`}
                      >
                        {g}%
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* SECTION 3: AVAILABILITY STATUS */}
              <div className="bg-[#f8f5ee] p-3.5 rounded-2xl border border-[#ded4c5] flex items-center justify-between shadow-2xs">
                <div>
                  <h4 className="font-extrabold text-xs text-[#11291f]">POS Availability Status</h4>
                  <p className="text-[10.5px] font-bold text-[#547363]">
                    {isAvailable ? 'Available for new sales on POS' : 'Marked Unavailable (hidden from POS active billing)'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#cabb9e]">
                  <button
                    type="button"
                    onClick={() => setIsAvailable(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isAvailable ? 'bg-emerald-700 text-white shadow-2xs' : 'text-[#456351] hover:text-[#11291f]'
                    }`}
                  >
                    ✓ Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAvailable(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !isAvailable ? 'bg-amber-700 text-white shadow-2xs' : 'text-[#456351] hover:text-[#11291f]'
                    }`}
                  >
                    Unavailable
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: IMAGE STANDARDIZATION & LIVE POS CARD PREVIEW (5 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-[#f8f5ee] p-4 rounded-2xl border border-[#ded4c5] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#ded4c5] pb-1.5">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-[#0f3823]" />
                    <h3 className="font-serif font-black text-xs uppercase tracking-wider text-[#11291f]">
                      Product Image & Preview
                    </h3>
                  </div>
                  <span className="text-[9.5px] font-bold text-[#547363] bg-white px-2 py-0.5 rounded-md border border-[#cabb9e]">
                    Auto 4:3 Fit
                  </span>
                </div>

                {/* Image Upload Trigger */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-white hover:bg-[#faf6ee] text-[#11291f] border border-[#cabb9e] rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#0f3823]" />
                    <span>{imageFileName ? 'Change Photo' : 'Upload Food Photo'}</span>
                  </button>

                  {standardizedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setStandardizedImage('');
                        setImageFileName('');
                        setRawImageSrc(null);
                      }}
                      className="p-2 bg-white hover:bg-red-50 text-red-700 border border-[#cabb9e] rounded-xl cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {imageFileName && (
                  <p className="text-[10px] font-bold text-[#547363] truncate">
                    Loaded: <span className="font-mono text-[#11291f]">{imageFileName}</span>
                  </p>
                )}

                {/* Live Exact POS Product Card Preview */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#547363]">
                      Exact POS Card Preview
                    </span>
                    <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Standardized Frame
                    </span>
                  </div>

                  <div className="bg-[#fdfbf7] p-2.5 rounded-xl border border-[#cabb9e] shadow-xs flex flex-col justify-between h-[195px] max-w-[260px] mx-auto w-full">
                    {/* Image Area with 4:3 standardized fit */}
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-[#ebdcc8] flex items-center justify-center border border-[#cabb9e]/40">
                      <img
                        src={standardizedImage || '/dishes/prod-1.jpg'}
                        alt={name || 'Menu Item Preview'}
                        className="w-full h-full object-cover object-center"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#0f3823]/85 backdrop-blur-xs text-white text-[8.5px] font-bold rounded">
                        {currentCategoryName}
                      </span>
                      <button type="button" className="absolute top-1 right-1 p-1 bg-[#0f3823] text-white rounded-md shadow-xs">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Title & Price */}
                    <div className="pt-1">
                      <h4 className="text-[11px] font-extrabold text-[#11291f] truncate leading-tight">
                        {name.trim() || 'Product Name'}
                      </h4>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-xs font-black text-[#0f3823] font-mono">
                          ₹{previewPrice.toFixed(2)}
                        </span>
                        <span className="text-[9px] font-bold text-[#557361]">
                          {servingQty || '1'} {uom}
                        </span>
                      </div>

                      {/* Stock Progress Bar */}
                      <div className="w-full bg-[#e5dac8] h-1 rounded-full overflow-hidden mt-1">
                        <div className="h-full rounded-full bg-emerald-600 w-4/5" />
                      </div>
                    </div>
                  </div>

                  <p className="text-[9.5px] font-bold text-[#547363] text-center pt-1">
                    Uploaded image auto-crops and aligns to match all 59 existing dish cards.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: BOM / RECIPE (BILL OF MATERIALS) BUILDER                       */}
          {/* ========================================================================= */}
          <div className="bg-[#f8f5ee] p-4 rounded-2xl border border-[#ded4c5] space-y-3 shadow-2xs">
            
            <div className="flex items-center justify-between border-b border-[#ded4c5] pb-2">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-[#0f3823]" />
                <div>
                  <h3 className="font-serif font-black text-xs uppercase tracking-wider text-[#11291f]">
                    3. BOM / Recipe Master (Inventory Deduction)
                  </h3>
                  <p className="text-[10.5px] font-bold text-[#547363]">
                    Attach recipe ingredients to auto-deduct raw materials upon POS billing
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableBOM}
                  onChange={(e) => setEnableBOM(e.target.checked)}
                  className="w-4 h-4 text-[#0f3823] rounded focus:ring-0 cursor-pointer accent-[#0f3823]"
                />
                <span className="font-extrabold text-xs text-[#11291f]">
                  {enableBOM ? 'Recipe Enabled' : 'Enable Recipe'}
                </span>
              </label>
            </div>

            {enableBOM ? (
              <div className="space-y-3 pt-1">
                <div className="p-2.5 bg-[#ebdcc8]/50 rounded-xl border border-[#cabb9e] text-[10.5px] text-[#456351] font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#0f3823] shrink-0" />
                  <span>
                    Select raw materials from the café's verified inventory master. Ingredients will deduct accurately per quantity sold.
                  </span>
                </div>

                {/* Recipe Ingredient Rows */}
                <div className="space-y-2">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-white rounded-xl border border-[#cabb9e] shadow-2xs">
                      
                      {/* Step Number Badge */}
                      <span className="w-6 h-6 rounded-full bg-[#ebdcc8] text-[#11291f] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      {/* Raw Material Selector */}
                      <div className="flex-1 min-w-[160px]">
                        <select
                          value={ing.rawMaterialId}
                          onChange={(e) => handleIngredientChange(idx, 'rawMaterialId', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#faf8f4] border border-[#cabb9e] rounded-lg font-bold text-xs text-[#11291f] focus:outline-none"
                        >
                          <option value="">Select Raw Material *</option>
                          {availableRawMaterials.map(rm => (
                            <option key={rm.id} value={rm.id}>
                              {rm.name} ({normalizeUnit(rm.unit)})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="w-24">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={ing.quantity}
                          onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full px-2.5 py-1.5 bg-[#faf8f4] border border-[#cabb9e] rounded-lg font-mono font-bold text-xs text-[#11291f] focus:outline-none"
                        />
                      </div>

                      {/* Unit */}
                      <div className="w-20">
                        <input
                          type="text"
                          value={ing.uom}
                          onChange={(e) => handleIngredientChange(idx, 'uom', e.target.value)}
                          placeholder="Unit"
                          className="w-full px-2.5 py-1.5 bg-[#faf8f4] border border-[#cabb9e] rounded-lg font-bold text-xs text-[#11291f] focus:outline-none"
                        />
                      </div>

                      {/* Process Description */}
                      <div className="w-32">
                        <input
                          type="text"
                          value={ing.process}
                          onChange={(e) => handleIngredientChange(idx, 'process', e.target.value)}
                          placeholder="Process (e.g. Add)"
                          className="w-full px-2.5 py-1.5 bg-[#faf8f4] border border-[#cabb9e] rounded-lg font-medium text-xs text-[#11291f] focus:outline-none"
                        />
                      </div>

                      {/* Delete Row */}
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(idx)}
                          className="p-1.5 text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Remove Ingredient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="py-1.5 px-3 bg-white hover:bg-[#faf6ee] text-[#11291f] border border-[#cabb9e] rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0f3823]" />
                    <span>+ Add Ingredient</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[11px] text-[#547363]">Final Prep Note:</span>
                    <input
                      type="text"
                      value={finalProcess}
                      onChange={(e) => setFinalProcess(e.target.value)}
                      placeholder="e.g. Blend & serve in milkshake glass"
                      className="px-3 py-1 bg-white border border-[#cabb9e] rounded-xl font-medium text-xs text-[#11291f] w-56 focus:outline-none"
                    />
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-[11px] font-bold text-[#547363] py-1">
                Recipe is not enabled for this item. Product can be saved without inventing a recipe, and will not cause fake stock deductions.
              </p>
            )}

          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: OPTIONAL ADD-ONS / EXTRAS                                      */}
          {/* ========================================================================= */}
          <div className="bg-[#f8f5ee] p-4 rounded-2xl border border-[#ded4c5] space-y-3 shadow-2xs">
            
            <div className="flex items-center justify-between border-b border-[#ded4c5] pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0f3823]" />
                <div>
                  <h3 className="font-serif font-black text-xs uppercase tracking-wider text-[#11291f]">
                    4. Optional Add-ons & Extras
                  </h3>
                  <p className="text-[10.5px] font-bold text-[#547363]">
                    Configure extra toppings, cheeses, or sides (e.g. Extra Cheese +₹20)
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableAddons}
                  onChange={(e) => setEnableAddons(e.target.checked)}
                  className="w-4 h-4 text-[#0f3823] rounded focus:ring-0 cursor-pointer accent-[#0f3823]"
                />
                <span className="font-extrabold text-xs text-[#11291f]">
                  {enableAddons ? 'Add-ons Enabled' : 'Enable Add-ons'}
                </span>
              </label>
            </div>

            {enableAddons ? (
              <div className="space-y-2.5 pt-1">
                {addonsList.map((addon, idx) => (
                  <div key={addon.id || idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-white rounded-xl border border-[#cabb9e] shadow-2xs">
                    
                    {/* Add-on Name */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={addon.name}
                        onChange={(e) => handleAddonChange(idx, 'name', e.target.value)}
                        placeholder="Add-on Name (e.g. Extra Cheese)"
                        className="w-full px-2.5 py-1.5 bg-[#faf8f4] border border-[#cabb9e] rounded-lg font-bold text-xs text-[#11291f] focus:outline-none"
                      />
                    </div>

                    {/* Extra Price */}
                    <div className="w-28">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#547363]">+₹</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={addon.price}
                          onChange={(e) => handleAddonChange(idx, 'price', e.target.value)}
                          placeholder="20"
                          className="w-full pl-7 pr-2 py-1.5 bg-[#faf8f4] border border-[#cabb9e] rounded-lg font-mono font-bold text-xs text-[#11291f] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Available Toggle */}
                    <label className="flex items-center gap-1.5 px-2 py-1 bg-[#faf8f4] border border-[#cabb9e] rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addon.isAvailable}
                        onChange={(e) => handleAddonChange(idx, 'isAvailable', e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#0f3823]"
                      />
                      <span className="text-[11px] font-bold text-[#11291f]">Active</span>
                    </label>

                    {/* Delete Row */}
                    {addonsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAddon(idx)}
                        className="p-1.5 text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Remove Addon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddAddon}
                  className="py-1.5 px-3 bg-white hover:bg-[#faf6ee] text-[#11291f] border border-[#cabb9e] rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0f3823]" />
                  <span>+ Add Extra / Topping</span>
                </button>
              </div>
            ) : null}

          </div>

          {/* ========================================================================= */}
          {/* MODAL ACTIONS FOOTER                                                      */}
          {/* ========================================================================= */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#ded4c5] sticky bottom-0 bg-[#fdfbf7] py-2 z-10">
            {productToEdit && !isOriginalProduct(productToEdit.id) ? (
              <button
                type="button"
                onClick={() => setIsConfirmRemoveOpen(true)}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer mr-auto"
                title="Remove this custom menu item"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Remove Menu Item</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#11291f] font-black text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isProcessingImage}
                className={`px-6 py-2.5 ${isBrownBranch ? 'bg-[#3E2312] hover:bg-[#2D190D] border-[#542A16]' : 'bg-[#0f3823] hover:bg-[#092416] border-[#194c31]'} text-white font-black text-xs rounded-xl shadow-md border flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{productToEdit ? 'Saving Changes...' : 'Saving Menu Item...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                    <span>{productToEdit ? 'Save Changes' : 'Save Menu Item'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL: REMOVE MENU ITEM                                      */}
      {/* ========================================================================= */}
      {isConfirmRemoveOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 modal-backdrop-overlay flex items-center justify-center p-4 z-[60] animate-fadeIn">
          <div className="bg-[#fdfbf7] w-full max-w-sm rounded-2xl border-2 border-[#cabb9e] shadow-2xl p-5 space-y-4 animate-fadeIn">
            
            <div className="flex items-center gap-3 pb-3 border-b border-[#ebdcc8]">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl border border-rose-300">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-serif font-black text-[#11291f]">Remove Menu Item?</h3>
                <p className="text-xs font-bold text-[#547363]">Product Management Action</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#11291f]">
                Are you sure you want to remove <strong className="text-rose-800 underline">"{name}"</strong>?
              </p>
              <p className="text-[#547363] leading-relaxed font-medium">
                This item will no longer be available for POS or online ordering.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ebdcc8]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsConfirmRemoveOpen(false)}
                className="px-4 py-2 bg-[#ebe0cb] hover:bg-[#dfd3bc] text-[#11291f] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmRemove}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow-md border border-rose-900 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 text-white" />
                    <span>Remove Item</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>,
    document.body
  );
}
