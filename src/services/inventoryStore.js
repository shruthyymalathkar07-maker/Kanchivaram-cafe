// Centralized Single Source of Truth Real-Time Inventory Store for Kanchivaram Café
import { CLIENT_RAW_MATERIALS_MASTER, CLIENT_BOM_MASTER } from '../data/masterData';
import { 
  fetchInventoryMaster, 
  fetchInventoryPurchases, 
  fetchStockLedger, 
  createPurchaseStockIn, 
  updateItemThreshold as apiUpdateItemThreshold,
  fetchCustomers,
  socket 
} from './api';

const getTodayIso = () => new Date().toISOString().split('T')[0];
const getDisplayDate = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const getDisplayTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

// Always sort master items alphabetically in ascending order (A-Z)
const createInitialItems = () => [...CLIENT_RAW_MATERIALS_MASTER]
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  .map(rm => ({
    id: rm.id,
    name: rm.name,
    category: rm.category || 'Unspecified',
    rawCategory: rm.category,
    unit: rm.unit || 'units',
    openingStock: 0,
    stockIn: 0,
    stockOut: 0,
    minThreshold: 0,
    costPerUnit: 0,
    supplier: 'Unassigned',
    lastMovement: '-'
  }));

class InventoryStore {
  constructor() {
    this.branches = {
      'branch-1': {
        items: createInitialItems(),
        ledger: [],
        purchases: [],
        customers: [],
        sales: []
      },
      'branch-2': {
        items: createInitialItems(),
        ledger: [],
        purchases: [],
        customers: [],
        sales: []
      }
    };
    this.currentBranchId = 'branch-1';
    this.listeners = new Set();
    this.isHydrating = false;

    // Listen to real-time socket events
    if (socket) {
      socket.on('inventory_updated', (data) => {
        const targetBranch = data?.branchId || this.currentBranchId;
        this.hydrateFromBackend(targetBranch);
      });

      socket.on('purchase_created', (data) => {
        const targetBranch = data?.branchId || this.currentBranchId;
        this.hydrateFromBackend(targetBranch);
      });

      socket.on('customer_updated', (data) => {
        const targetBranch = data?.branchId || this.currentBranchId;
        this.hydrateFromBackend(targetBranch);
      });

      socket.on('sale_created', (data) => {
        const targetBranch = data?.branchId || this.currentBranchId;
        this.hydrateFromBackend(targetBranch);
      });

      socket.on('inventory_threshold_updated', (data) => {
        if (data?.id) {
          const b = this.branches[data.branchId || this.currentBranchId];
          if (b) {
            const item = b.items.find(i => i.id === data.id);
            if (item) {
              item.minThreshold = Number(data.minThreshold || 0);
              this.notify();
            }
          }
        }
      });
    }
  }

  setBranch(branchId) {
    if (branchId && this.currentBranchId !== branchId) {
      this.currentBranchId = branchId;
      if (!this.branches[branchId]) {
        this.branches[branchId] = {
          items: createInitialItems(),
          ledger: [],
          purchases: [],
          customers: [],
          sales: []
        };
      }
      this.hydrateFromBackend(branchId);
      this.notify();
    }
  }

  // Hydrate inventory state from PostgreSQL backend API
  async hydrateFromBackend(branchId = this.currentBranchId) {
    try {
      if (!this.branches[branchId]) {
        this.branches[branchId] = {
          items: createInitialItems(),
          ledger: [],
          purchases: [],
          customers: [],
          sales: []
        };
      }

      const [masterRes, purchasesRes, ledgerRes, customersRes] = await Promise.all([
        fetchInventoryMaster(branchId),
        fetchInventoryPurchases(branchId),
        fetchStockLedger(branchId),
        fetchCustomers(branchId)
      ]);

      if (masterRes && masterRes.items && Array.isArray(masterRes.items)) {
        const currentItems = this.branches[branchId].items;
        const currentItemMap = new Map(currentItems.map(i => [i.id, i]));

        // Merge backend items into client catalog
        const updatedList = masterRes.items.map(dbItem => {
          const existing = currentItemMap.get(dbItem.id) || {};
          return {
            ...existing,
            id: dbItem.id,
            name: dbItem.name,
            category: dbItem.category || existing.category || 'Unspecified',
            rawCategory: dbItem.category || existing.rawCategory,
            unit: dbItem.unit || existing.unit || 'units',
            openingStock: Number(dbItem.openingStock || 0),
            stockIn: Number(dbItem.stockIn || 0),
            stockOut: Number(dbItem.stockOut || 0),
            minThreshold: Number(dbItem.minThreshold || 0),
            costPerUnit: Number(dbItem.costPerUnit || 0),
            supplier: dbItem.supplier || existing.supplier || 'Unassigned',
            lastMovement: dbItem.lastMovementDisplay || (dbItem.lastMovement ? new Date(dbItem.lastMovement).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : (existing.lastMovement || '-'))
          };
        });

        // Ensure all 117 standard items exist even if database only had a subset
        const dbIdSet = new Set(masterRes.items.map(i => i.id));
        CLIENT_RAW_MATERIALS_MASTER.forEach(std => {
          if (!dbIdSet.has(std.id) && !updatedList.some(i => i.name.toLowerCase() === std.name.toLowerCase())) {
            updatedList.push({
              id: std.id,
              name: std.name,
              category: std.category || 'Unspecified',
              rawCategory: std.category,
              unit: std.unit || 'units',
              openingStock: 0,
              stockIn: 0,
              stockOut: 0,
              minThreshold: 0,
              costPerUnit: 0,
              supplier: 'Unassigned',
              lastMovement: '-'
            });
          }
        });

        // Sort ascending A-Z
        updatedList.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        this.branches[branchId].items = updatedList;
      }

      if (purchasesRes && purchasesRes.purchases && Array.isArray(purchasesRes.purchases)) {
        this.branches[branchId].purchases = purchasesRes.purchases;
      }

      if (ledgerRes && ledgerRes.ledger && Array.isArray(ledgerRes.ledger)) {
        this.branches[branchId].ledger = ledgerRes.ledger;
      }

      if (customersRes && customersRes.customers && Array.isArray(customersRes.customers)) {
        this.branches[branchId].customers = customersRes.customers;
      }

      this.notify();
    } catch (err) {
      console.warn(`[InventoryStore] Backend hydration notice for ${branchId}:`, err);
    }
  }

  get items() {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { items: createInitialItems(), ledger: [], purchases: [], customers: [], sales: [] };
    }
    return this.branches[this.currentBranchId].items;
  }

  set items(val) {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { items: createInitialItems(), ledger: [], purchases: [], customers: [], sales: [] };
    }
    this.branches[this.currentBranchId].items = val;
  }

  get ledger() {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { items: createInitialItems(), ledger: [], purchases: [], customers: [], sales: [] };
    }
    return this.branches[this.currentBranchId].ledger;
  }

  set ledger(val) {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { items: createInitialItems(), ledger: [], purchases: [], customers: [], sales: [] };
    }
    this.branches[this.currentBranchId].ledger = val;
  }

  get purchases() {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { items: createInitialItems(), ledger: [], purchases: [], customers: [], sales: [] };
    }
    return this.branches[this.currentBranchId].purchases;
  }

  set purchases(val) {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { items: createInitialItems(), ledger: [], purchases: [], customers: [], sales: [] };
    }
    this.branches[this.currentBranchId].purchases = val;
  }

  get customers() {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { items: createInitialItems(), ledger: [], purchases: [], customers: [], sales: [] };
    }
    return this.branches[this.currentBranchId].customers;
  }

  set customers(val) {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { items: createInitialItems(), ledger: [], purchases: [], customers: [], sales: [] };
    }
    this.branches[this.currentBranchId].customers = val;
  }

  get sales() {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { items: createInitialItems(), ledger: [], purchases: [], customers: [], sales: [] };
    }
    return this.branches[this.currentBranchId].sales;
  }

  set sales(val) {
    if (!this.branches[this.currentBranchId]) {
      this.branches[this.currentBranchId] = { items: createInitialItems(), ledger: [], purchases: [], customers: [], sales: [] };
    }
    this.branches[this.currentBranchId].sales = val;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.getState()));
  }

  // Get current calculated remaining stock of an item
  getItemRemainingStock(item) {
    return Math.max(0, (Number(item.openingStock) || 0) + (Number(item.stockIn) || 0) - (Number(item.stockOut) || 0));
  }

  getItemStatus(item) {
    const remaining = this.getItemRemainingStock(item);
    const threshold = Number(item.minThreshold) || 0;
    if (threshold <= 0) return 'HEALTHY';
    if (remaining <= (threshold / 2)) return 'CRITICAL';
    if (remaining <= threshold) return 'LOW_STOCK';
    return 'HEALTHY';
  }

  // Returns full compiled state for Inventory Page, Purchase Page & Home Dashboard
  getState() {
    const todayIso = getTodayIso();
    const displayDate = getDisplayDate();

    // Compile items with calculated remaining stock & status, sorted A-Z
    const compiledItems = [...this.items]
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
      .map(item => {
        const remaining = this.getItemRemainingStock(item);
        const status = this.getItemStatus(item);
        return {
          ...item,
          remainingStock: remaining,
          status
        };
      });

    // Calculate daily metrics from ledger for selected/today date
    let dailyStockIn = 0;
    let dailyStockOut = 0;

    this.ledger.forEach(entry => {
      if (entry.dateIso === todayIso) {
        if (entry.type === 'STOCK_IN') dailyStockIn += Number(entry.qty || 0);
        if (entry.type === 'STOCK_OUT') dailyStockOut += Number(entry.qty || 0);
      }
    });

    // Total remaining stock across all inventory items
    const totalRemainingStock = compiledItems.reduce((acc, i) => acc + i.remainingStock, 0);

    // Purchase calculations
    const totalPurchasesValue = this.purchases.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
    const todayPurchases = this.purchases.filter(p => p.dateIso === todayIso);
    const todayStockInUnits = this.purchases.length === 0 ? 0 : todayPurchases.reduce((sum, p) => sum + (p.items || []).reduce((s, i) => s + (Number(i.qty) || 0), 0), 0);

    // Filter low stock & critical items
    const lowStockItems = compiledItems.filter(i => i.status !== 'HEALTHY');
    const criticalItems = compiledItems.filter(i => i.status === 'CRITICAL');

    return {
      items: compiledItems,
      ledger: [...this.ledger].sort((a, b) => (b.createdAt || b.id).localeCompare(a.createdAt || a.id)),
      purchases: [...this.purchases].sort((a, b) => (b.createdAt || b.id).localeCompare(a.createdAt || a.id)),
      customers: [...this.customers],
      sales: [...this.sales],
      summary: {
        totalItemsCount: compiledItems.length,
        dailyStockIn,
        dailyStockOut,
        totalRemainingStock,
        totalPurchasesValue,
        todayStockInUnits,
        lowStockCount: lowStockItems.length,
        criticalCount: criticalItems.length,
        displayDate
      },
      lowStockItems,
      criticalItems
    };
  }

  // UPDATE MINIMUM STOCK THRESHOLD FOR AN ITEM
  async updateItemThreshold(itemId, newThreshold, branchId = this.currentBranchId) {
    const numThreshold = Math.max(0, parseFloat(newThreshold) || 0);
    const targetBranch = branchId || this.currentBranchId;
    const b = this.branches[targetBranch];
    
    if (b) {
      const item = b.items.find(i => i.id === itemId);
      if (item) {
        item.minThreshold = numThreshold;
        this.notify();
      }
    }

    // Persist to PostgreSQL backend via API
    try {
      await apiUpdateItemThreshold(itemId, numThreshold, targetBranch);
    } catch (err) {
      console.warn('[InventoryStore] Error persisting threshold:', err);
    }
  }

  // RECORD MULTI-ITEM OR SINGLE PURCHASE INVOICE
  async recordPurchase(purchasePayload, branchId = this.currentBranchId) {
    const { invoiceRef, supplier, date, notes, items } = purchasePayload;
    if (!items || items.length === 0) return;

    const targetBranch = branchId || this.currentBranchId;
    const displayDate = date || getDisplayDate();
    const todayIso = getTodayIso();
    const displayTime = getDisplayTime();
    const purchaseId = `PUR-${Date.now().toString().slice(-4)}`;

    let grandTotal = 0;
    const processedItems = [];

    items.forEach(itemInput => {
      const numQty = parseFloat(itemInput.qty) || 0;
      if (numQty <= 0) return;
      const pricePerUnit = parseFloat(itemInput.pricePerUnit) || parseFloat(itemInput.cost) || 0;
      const itemTotal = numQty * pricePerUnit;
      grandTotal += itemTotal;

      let itemObj = this.items.find(i => 
        (itemInput.itemId && i.id === itemInput.itemId) || 
        (itemInput.itemName && i.name.toLowerCase() === itemInput.itemName.toLowerCase())
      );

      if (itemObj) {
        itemObj.stockIn = (Number(itemObj.stockIn) || 0) + numQty;
        itemObj.lastMovement = displayDate;
        if (supplier) itemObj.supplier = supplier;
        if (pricePerUnit > 0) itemObj.costPerUnit = pricePerUnit;
      } else if (itemInput.itemName) {
        // Create new inventory item dynamically in local catalog
        itemObj = {
          id: `rm-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          name: itemInput.itemName.trim(),
          category: itemInput.category || 'General Ingredients',
          unit: itemInput.unit || 'units',
          openingStock: 0,
          stockIn: numQty,
          stockOut: 0,
          minThreshold: 0,
          costPerUnit: pricePerUnit,
          supplier: supplier || 'Local Supplier',
          lastMovement: displayDate
        };
        this.items.push(itemObj);
        this.items.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      }

      if (itemObj) {
        const remainingAfter = this.getItemRemainingStock(itemObj);
        
        // Add movement ledger entry for each line item
        this.ledger.unshift({
          id: `MV-${Date.now().toString().slice(-4)}-${Math.floor(Math.random()*100)}`,
          date: displayDate,
          dateIso: todayIso,
          time: displayTime,
          itemId: itemObj.id,
          itemName: itemObj.name,
          type: 'STOCK_IN',
          qty: numQty,
          unit: itemInput.unit || itemObj.unit,
          supplier: supplier || itemObj.supplier,
          ref: invoiceRef || `PO #${purchaseId}`,
          source: 'Purchase / Stock In',
          notes: notes || `Purchase In (${invoiceRef || purchaseId})`,
          remainingAfter,
          purchaseId
        });

        processedItems.push({
          itemId: itemObj.id,
          itemName: itemObj.name,
          category: itemObj.category,
          qty: numQty,
          unit: itemInput.unit || itemObj.unit,
          pricePerUnit,
          total: itemTotal
        });
      }
    });

    const newPurchase = {
      id: purchaseId,
      invoiceRef: invoiceRef || `PO #${purchaseId}`,
      date: displayDate,
      dateIso: todayIso,
      supplier: supplier || 'General Supplier',
      category: processedItems[0]?.category || 'Raw Ingredients',
      notes: notes || 'Incoming stock purchase',
      totalAmount: grandTotal,
      items: processedItems
    };

    this.purchases.unshift(newPurchase);
    this.notify();

    // Persist to PostgreSQL backend asynchronously
    try {
      const serverPayload = {
        invoiceRef: newPurchase.invoiceRef,
        supplier: newPurchase.supplier,
        date: displayDate,
        notes: newPurchase.notes,
        items: items
      };
      await createPurchaseStockIn(serverPayload, targetBranch);
      // Re-hydrate to ensure perfect alignment with server timestamps & IDs
      await this.hydrateFromBackend(targetBranch);
    } catch (err) {
      console.warn('[InventoryStore] Error persisting purchase to PostgreSQL:', err);
    }

    return newPurchase;
  }

  // RECORD SINGLE OR QUICK STOCK IN (Maps directly to recordPurchase)
  async recordStockIn(stockInPayload, branchId = this.currentBranchId) {
    const formattedPurchasePayload = {
      invoiceRef: stockInPayload.invoiceRef || `PO #SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: stockInPayload.supplier || 'Local Vendor',
      date: stockInPayload.date || getDisplayDate(),
      notes: stockInPayload.notes || 'Incoming stock',
      items: [
        {
          itemId: stockInPayload.itemId,
          itemName: stockInPayload.itemName,
          category: stockInPayload.category || 'Raw Ingredients',
          qty: stockInPayload.qty,
          unit: stockInPayload.unit || 'kg',
          pricePerUnit: stockInPayload.cost || stockInPayload.pricePerUnit || 0
        }
      ]
    };
    return this.recordPurchase(formattedPurchasePayload, branchId);
  }

  // DELETE PURCHASE AND REVERSE STOCK
  deletePurchase(purchaseId) {
    const purchaseIndex = this.purchases.findIndex(p => p.id === purchaseId);
    if (purchaseIndex === -1) return false;

    const purchase = this.purchases[purchaseIndex];

    // Safely subtract quantities from stockIn
    purchase.items.forEach(pItem => {
      const matched = this.items.find(i => i.id === pItem.itemId || i.name.toLowerCase() === pItem.itemName.toLowerCase());
      if (matched) {
        matched.stockIn = Math.max(0, (Number(matched.stockIn) || 0) - (Number(pItem.qty) || 0));
      }
    });

    // Remove corresponding ledger movements
    this.ledger = this.ledger.filter(m => m.purchaseId !== purchaseId && m.ref !== purchase.invoiceRef);

    // Remove purchase
    this.purchases.splice(purchaseIndex, 1);
    this.notify();
    return true;
  }

  // UPDATE PURCHASE WITH SAFE STOCK ADJUSTMENT
  updatePurchase(purchaseId, updatedPayload, branchId = this.currentBranchId) {
    this.deletePurchase(purchaseId);
    return this.recordPurchase(updatedPayload, branchId);
  }

  // RECORD STOCK OUT / POS SALES / CONSUMPTION
  recordStockOut(payload) {
    const { itemId, itemName, qty, unit, source, ref, notes } = payload;
    const numQty = parseFloat(qty) || 0;
    if (numQty <= 0) return;

    const item = this.items.find(i => 
      (itemId && i.id === itemId) || 
      (itemName && i.name.toLowerCase() === itemName.toLowerCase())
    );

    const displayDate = getDisplayDate();
    const todayIso = getTodayIso();
    const displayTime = getDisplayTime();

    if (item) {
      item.stockOut = (item.stockOut || 0) + numQty;
      item.lastMovement = displayDate;
    }

    const targetItem = item || { id: 'generic', name: itemName || 'POS Item', unit: unit || 'units' };
    const newRemaining = item ? this.getItemRemainingStock(item) : 0;

    const newMovement = {
      id: `MV-${Date.now().toString().slice(-4)}-${Math.floor(Math.random()*100)}`,
      date: displayDate,
      dateIso: todayIso,
      time: displayTime,
      itemId: targetItem.id,
      itemName: targetItem.name,
      type: 'STOCK_OUT',
      qty: numQty,
      unit: targetItem.unit || 'units',
      supplier: '-',
      ref: ref || `POS #BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      source: source || 'POS / Sales',
      notes: notes || 'Product sold via POS',
      remainingAfter: newRemaining
    };

    this.ledger.unshift(newMovement);
    this.notify();
    return newMovement;
  }

  // RECORD COMPLETED POS BILL & EXECUTE BOM DEDUCTION LOGIC
  recordCompletedBill(saleData) {
    const {
      billNumber,
      items,
      subtotal,
      tax,
      discount,
      grandTotal,
      paymentMethod,
      customerName,
      customerPhone,
      receiptType,
      channel,
      cashierName,
      orderNote
    } = saleData;

    const displayDate = getDisplayDate();
    const todayIso = getTodayIso();
    const displayTime = getDisplayTime();
    const nowIso = new Date().toISOString();

    const finalBillNumber = billNumber || `KC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const completedTransaction = {
      id: `sale-${Date.now()}`,
      billNumber: finalBillNumber,
      date: displayDate,
      dateIso: todayIso,
      time: displayTime,
      createdAt: nowIso,
      customerName: (customerName && customerName.trim() && customerName !== 'Walk-in Customer') ? customerName.trim() : null,
      customerPhone: customerPhone ? customerPhone.trim() : null,
      items: (items || []).map(i => ({
        id: i.id,
        name: i.name,
        qty: i.quantity || i.qty || 1,
        price: i.price,
        total: (i.quantity || i.qty || 1) * (i.price || 0),
        unit: i.unit || 'units',
        categoryName: i.categoryName || i.category || 'General'
      })),
      subtotal,
      tax,
      discount: discount || 0,
      grandTotal,
      paymentMethod: paymentMethod || 'CASH',
      receiptType: receiptType || 'PAPER',
      channel: channel || 'POS',
      cashierName: cashierName || 'Shruthy',
      orderNote: orderNote || ''
    };

    // 1. Save completed sale transaction to sales database list
    this.sales.unshift(completedTransaction);

    // 2. PART 7 — POS → INVENTORY LOGIC:
    // Execute BOM deduction ONLY when a complete BOM exists for that product.
    // If a product has no BOM, DO NOT invent fake deductions.
    if (items && items.length > 0) {
      items.forEach(it => {
        const productQty = parseFloat(it.quantity || it.qty || 1);
        const matchedBOM = CLIENT_BOM_MASTER.find(b => 
          (b.productId === it.id) || 
          (b.productName.toLowerCase() === it.name.toLowerCase())
        );

        if (matchedBOM && matchedBOM.status === 'COMPLETE' && matchedBOM.processes.length > 0) {
          // Deduct each BOM ingredient
          matchedBOM.processes.forEach(proc => {
            const rawQtyToDeduct = proc.qty * productQty;
            this.recordStockOut({
              itemId: proc.rawMaterialId,
              itemName: proc.rawMaterialName,
              qty: rawQtyToDeduct,
              unit: proc.uom,
              source: 'POS / Recipe BOM',
              ref: finalBillNumber,
              notes: `BOM: ${productQty} x ${it.name} (${proc.process})`
            });
          });
        }
        // If no BOM exists: leave raw-material deduction pending without fake inventory deductions.
      });
    }

    // 3. Customer Matching & Customer Store Update
    const cleanedPhone = customerPhone ? customerPhone.replace(/\s+/g, '').replace(/[-+]/g, '') : null;

    if (cleanedPhone && cleanedPhone.length >= 7) {
      let customer = this.customers.find(c => {
        const cCleaned = c.phone ? c.phone.replace(/\s+/g, '').replace(/[-+]/g, '') : '';
        return cCleaned === cleanedPhone || (cCleaned.length >= 10 && cleanedPhone.endsWith(cCleaned.slice(-10)));
      });

      const formattedPhone = customerPhone.trim().startsWith('+91') ? customerPhone.trim() : `+91 ${customerPhone.trim()}`;

      if (customer) {
        customer.visits = (customer.visits || 0) + 1;
        customer.totalSpent = (customer.totalSpent || 0) + grandTotal;
        customer.lastVisit = `${displayDate}, ${displayTime}`;
        if (customerName && customerName.trim() && customerName !== 'Walk-in Customer' && (!customer.name || customer.name.includes('Customer'))) {
          customer.name = customerName.trim();
        }
        if (!customer.purchaseHistory) customer.purchaseHistory = [];
        customer.purchaseHistory.unshift(completedTransaction);

        // Derive Favourite Item from actual purchase history
        const itemCounts = {};
        customer.purchaseHistory.forEach(b => {
          (b.items || []).forEach(itemObj => {
            itemCounts[itemObj.name] = (itemCounts[itemObj.name] || 0) + itemObj.qty;
          });
        });
        let topItem = customer.favoriteItem || items[0]?.name || 'Kanchivaram Filter Coffee';
        let topQty = 0;
        Object.entries(itemCounts).forEach(([name, count]) => {
          if (count > topQty) {
            topQty = count;
            topItem = name;
          }
        });
        customer.favoriteItem = topItem;

        if (customer.totalSpent >= 10000 || customer.visits >= 20) {
          customer.tier = 'VIP Gold';
        } else if (customer.totalSpent >= 3000 || customer.visits >= 8) {
          customer.tier = 'Frequent';
        } else {
          customer.tier = 'Regular';
        }

      } else {
        const newCustName = (customerName && customerName.trim() && customerName !== 'Walk-in Customer') ? customerName.trim() : `Customer (${customerPhone.slice(-4)})`;
        const newCustomer = {
          id: `c-${Date.now()}`,
          name: newCustName,
          phone: formattedPhone,
          email: 'Not specified',
          visits: 1,
          totalSpent: grandTotal,
          firstVisit: `${displayDate}, ${displayTime}`,
          lastVisit: `${displayDate}, ${displayTime}`,
          tier: grandTotal >= 10000 ? 'VIP Gold' : grandTotal >= 3000 ? 'Frequent' : 'Regular',
          favoriteItem: items[0]?.name || 'Kanchivaram Filter Coffee',
          purchaseHistory: [completedTransaction]
        };
        this.customers.unshift(newCustomer);
      }
    }

    this.notify();
    return completedTransaction;
  }
}

export const inventoryStore = new InventoryStore();
