// Centralized Single Source of Truth Real-Time Inventory Store for Kanchivaram Café
import { CLIENT_RAW_MATERIALS_MASTER, CLIENT_BOM_MASTER, normalizeUnit } from '../data/masterData';
import { 
  fetchInventoryMaster, 
  fetchInventoryPurchases, 
  fetchStockLedger, 
  createPurchaseStockIn, 
  createStockOutTransaction,
  deleteInventoryPurchase,
  updateItemThreshold as apiUpdateItemThreshold,
  fetchCustomers,
  socket 
} from './api';

const getTodayIso = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const getDisplayDate = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
const getDisplayTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });

// Always sort master items alphabetically in ascending order (A-Z)
const createInitialItems = () => [...CLIENT_RAW_MATERIALS_MASTER]
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  .map(rm => ({
    id: rm.id,
    name: rm.name,
    category: rm.category || 'Unspecified',
    rawCategory: rm.category,
    unit: normalizeUnit(rm.unit || 'NOS'),
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
    this.hydrationSequence = 0;
    this.hydrationTimers = {};

    // Listen to real-time socket events with deduplication and debounced sync
    if (socket) {
      socket.on('inventory_updated', (data) => {
        const targetBranch = data?.branchId || this.currentBranchId;
        this.scheduleDebouncedHydration(targetBranch, 200);
      });

      socket.on('purchase_created', (data) => {
        const targetBranch = data?.branchId || this.currentBranchId;
        if (data?.purchase && this.branches[targetBranch]) {
          const list = this.branches[targetBranch].purchases;
          const exists = list.some(p => p.id === data.purchase.id || (data.purchase.invoiceRef && p.invoiceRef === data.purchase.invoiceRef));
          if (!exists) {
            this.branches[targetBranch].purchases = [data.purchase, ...list];
            this.notify();
          }
        }
        this.scheduleDebouncedHydration(targetBranch, 200);
      });

      socket.on('purchase_deleted', (data) => {
        const targetBranch = data?.branchId || this.currentBranchId;
        if (data?.id && this.branches[targetBranch]) {
          this.branches[targetBranch].purchases = this.branches[targetBranch].purchases.filter(p => p.id !== data.id);
          this.notify();
        }
        this.scheduleDebouncedHydration(targetBranch, 200);
      });

      socket.on('customer_updated', (data) => {
        const targetBranch = data?.branchId || this.currentBranchId;
        this.scheduleDebouncedHydration(targetBranch, 200);
      });

      socket.on('sale_created', (data) => {
        const targetBranch = data?.branchId || this.currentBranchId;
        this.scheduleDebouncedHydration(targetBranch, 200);
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

  scheduleDebouncedHydration(branchId = this.currentBranchId, delayMs = 150) {
    if (this.hydrationTimers[branchId]) {
      clearTimeout(this.hydrationTimers[branchId]);
    }
    this.hydrationTimers[branchId] = setTimeout(() => {
      this.hydrateFromBackend(branchId);
      delete this.hydrationTimers[branchId];
    }, delayMs);
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
    const seq = ++this.hydrationSequence;
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

      // If a newer hydration started while this was in-flight, discard stale result
      if (seq !== this.hydrationSequence) return;

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
            unit: normalizeUnit(dbItem.unit || existing.unit || 'NOS'),
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
              unit: normalizeUnit(std.unit || 'NOS'),
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
        const seenIds = new Set();
        const dedupedPurchases = [];
        for (const p of purchasesRes.purchases) {
          const key = p.id || p.invoiceRef;
          if (!seenIds.has(key)) {
            seenIds.add(key);
            dedupedPurchases.push(p);
          }
        }
        this.branches[branchId].purchases = dedupedPurchases;
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
      const res = await apiUpdateItemThreshold(itemId, numThreshold, targetBranch);
      if (res && res.success === false) {
        throw new Error(res.message || 'Failed to update threshold');
      }
      await this.hydrateFromBackend(targetBranch);
      return { success: true };
    } catch (err) {
      console.warn('[InventoryStore] Error persisting threshold:', err);
      throw err;
    }
  }

  // RECORD MULTI-ITEM OR SINGLE PURCHASE INVOICE (PostgreSQL Single Source of Truth)
  async recordPurchase(purchasePayload, branchId = this.currentBranchId) {
    const { invoiceRef, supplier, date, notes, items } = purchasePayload;
    if (!items || items.length === 0) return null;

    const targetBranch = branchId || this.currentBranchId;
    const displayDate = date || getDisplayDate();

    const serverPayload = {
      invoiceRef,
      supplier,
      date: displayDate,
      notes,
      items
    };

    try {
      const res = await createPurchaseStockIn(serverPayload, targetBranch);
      if (res && res.success && res.purchase) {
        if (!this.branches[targetBranch]) {
          this.branches[targetBranch] = { items: createInitialItems(), ledger: [], purchases: [], customers: [], sales: [] };
        }
        
        // Immediately insert newly created purchase into store
        const existingList = this.branches[targetBranch].purchases;
        const alreadyPresent = existingList.some(p => p.id === res.purchase.id || (res.purchase.invoiceRef && p.invoiceRef === res.purchase.invoiceRef));
        if (!alreadyPresent) {
          this.branches[targetBranch].purchases = [res.purchase, ...existingList];
        } else {
          this.branches[targetBranch].purchases = existingList.map(p => 
            (p.id === res.purchase.id || (res.purchase.invoiceRef && p.invoiceRef === res.purchase.invoiceRef)) ? res.purchase : p
          );
        }
        this.notify();

        // Background sync to update stock items and ledger balances
        this.scheduleDebouncedHydration(targetBranch, 50);
        return res.purchase;
      }
    } catch (err) {
      console.warn('[InventoryStore] Error persisting purchase to PostgreSQL:', err);
    }

    return null;
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

  // DELETE PURCHASE AND REVERSE STOCK (PostgreSQL + Local Reversal)
  async deletePurchase(purchaseId, branchId = this.currentBranchId) {
    const targetBranch = branchId || this.currentBranchId;

    // Immediately remove locally so user sees instantaneous removal
    if (this.branches[targetBranch]) {
      this.branches[targetBranch].purchases = this.branches[targetBranch].purchases.filter(p => p.id !== purchaseId);
      this.notify();
    }

    try {
      const res = await deleteInventoryPurchase(purchaseId, targetBranch);
      this.scheduleDebouncedHydration(targetBranch, 50);
      return res && res.success !== false;
    } catch (err) {
      console.warn('[InventoryStore] Error deleting purchase from PostgreSQL:', err);
      this.scheduleDebouncedHydration(targetBranch, 50);
      return false;
    }
  }

  // UPDATE PURCHASE WITH SAFE STOCK ADJUSTMENT
  async updatePurchase(purchaseId, updatedPayload, branchId = this.currentBranchId) {
    await this.deletePurchase(purchaseId, branchId);
    return this.recordPurchase(updatedPayload, branchId);
  }

  // RECORD STOCK OUT / MANUAL CONSUMPTION / WASTAGE (PostgreSQL + Optimistic Local)
  async recordStockOut(payload, branchId = this.currentBranchId) {
    const { itemId, itemName, qty, unit, source, ref, notes } = payload;
    const numQty = parseFloat(qty) || 0;
    if (numQty <= 0) return null;

    const targetBranch = branchId || this.currentBranchId;
    const normUnit = normalizeUnit(unit || 'NOS');

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

    const targetItem = item || { id: itemId || 'generic', name: itemName || 'Inventory Item', unit: normUnit };
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
      unit: normUnit,
      supplier: '-',
      ref: ref || `Usage #${Math.floor(1000 + Math.random() * 9000)}`,
      source: source || 'Kitchen Consumption',
      notes: notes || 'Manual stock deduction',
      remainingAfter: newRemaining
    };

    this.ledger.unshift(newMovement);
    this.notify();

    // Persist to PostgreSQL backend via API
    try {
      const res = await createStockOutTransaction({
        itemId: targetItem.id,
        itemName: targetItem.name,
        qty: numQty,
        unit: normUnit,
        source: source || 'Kitchen Consumption',
        ref: ref || `Usage #${Math.floor(1000 + Math.random() * 9000)}`,
        notes: notes || 'Manual stock deduction',
        branchId: targetBranch
      }, targetBranch);

      this.scheduleDebouncedHydration(targetBranch, 50);
      return res?.movement || newMovement;
    } catch (err) {
      console.warn('[InventoryStore] Error persisting stock out to PostgreSQL:', err);
      this.scheduleDebouncedHydration(targetBranch, 50);
      return newMovement;
    }
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

    // 3. Customer Matching & Dynamic Customer Store Calculation
    const cleanedPhone = customerPhone ? customerPhone.replace(/\D/g, '').slice(-10) : null;
    const cleanCustName = customerName && customerName.trim() && customerName !== 'Walk-in Customer' ? customerName.trim() : null;

    if (cleanedPhone || cleanCustName) {
      let customer = this.customers.find(c => {
        const cCleanPhone = c.phone ? c.phone.replace(/\D/g, '').slice(-10) : '';
        const phoneMatch = Boolean(cleanedPhone && cCleanPhone && cleanedPhone === cCleanPhone);
        const nameMatch = Boolean(cleanCustName && c.name && c.name.trim().toLowerCase() === cleanCustName.toLowerCase());
        return phoneMatch || nameMatch;
      });

      const formattedPhone = customerPhone && customerPhone.trim() 
        ? (customerPhone.trim().startsWith('+91') ? customerPhone.trim() : `+91 ${customerPhone.trim()}`) 
        : (customer?.phone || 'Not specified');

      if (customer) {
        if (!customer.purchaseHistory) customer.purchaseHistory = [];
        
        // Avoid duplicate transaction injection
        if (!customer.purchaseHistory.some(tx => tx.billNumber === finalBillNumber || tx.id === completedTransaction.id)) {
          customer.purchaseHistory.unshift(completedTransaction);
        }

        // Dynamically compute Total Spent & Orders strictly from this customer's purchase history
        customer.totalSpent = customer.purchaseHistory.reduce((sum, tx) => sum + (Number(tx.grandTotal) || Number(tx.total) || 0), 0);
        customer.visits = customer.purchaseHistory.length;
        customer.lastVisit = `${displayDate}, ${displayTime}`;
        
        if (cleanCustName && (!customer.name || customer.name.includes('Customer'))) {
          customer.name = cleanCustName;
        }

        // Derive Favourite Item strictly from this customer's actual items
        const itemCounts = {};
        const itemLastSeen = {};
        customer.purchaseHistory.forEach((b, bIdx) => {
          (b.items || []).forEach(itemObj => {
            const iName = itemObj.name || itemObj.productName || itemObj.itemName;
            const iQty = parseFloat(itemObj.qty || itemObj.quantity || 1);
            if (iName) {
              itemCounts[iName] = (itemCounts[iName] || 0) + iQty;
              if (itemLastSeen[iName] === undefined) {
                itemLastSeen[iName] = bIdx; // Lower index = most recently purchased
              }
            }
          });
        });
        let topItem = customer.purchaseHistory.length === 0 ? 'No purchases yet' : 'None';
        let topQty = 0;
        let mostRecentIdx = Infinity;
        Object.entries(itemCounts).forEach(([name, count]) => {
          const lastIdx = itemLastSeen[name] ?? Infinity;
          if (count > topQty || (count === topQty && lastIdx < mostRecentIdx)) {
            topQty = count;
            topItem = name;
            mostRecentIdx = lastIdx;
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
        const newCustName = cleanCustName || (customerPhone ? `Customer (${customerPhone.slice(-4)})` : 'Valued Customer');
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
          favoriteItem: (items && items.length > 0) ? ([...items].sort((a, b) => (parseFloat(b.qty || b.quantity || 1) - parseFloat(a.qty || a.quantity || 1)))[0]?.name || items[0]?.name || 'None') : 'No purchases yet',
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
