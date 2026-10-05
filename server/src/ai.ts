// KVCM AI Business Assistant Service
// Node.js + TypeScript + Express + Prisma + OpenAI SDK

import OpenAI from 'openai';
import type { PrismaClient } from '@prisma/client';
import { normalizeUnit } from './db';

export interface KVCMQueryOptions {
  query: string;
  branchId: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export interface KVCMQueryResponse {
  success: boolean;
  answer: string;
  branchId: string;
  dataContext?: any;
  modelUsed?: string;
  error?: string;
}

/**
 * Fetches verified, branch-isolated business data from PostgreSQL.
 * Branch isolation is strictly enforced: only data matching branchId is retrieved.
 */
export async function fetchBranchBusinessContext(prisma: PrismaClient, branchId: string) {
  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];
  const currentMonthIso = todayIso.slice(0, 7);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Branch details
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: { settings: true }
  });

  const branchName = branch?.name || (branchId === 'branch-2' ? 'City Branch' : 'Main Branch');

  // 2. Sales records (strictly filtered by branchId and non-cancelled)
  const sales = await prisma.sale.findMany({
    where: {
      branchId,
      isCancelled: false
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 300
  });

  const todaySales = sales.filter(s => s.dateIso === todayIso || (s.createdAt && new Date(s.createdAt).toISOString().startsWith(todayIso)));
  const sevenDaysSales = sales.filter(s => {
    const d = s.createdAt ? new Date(s.createdAt) : (s.dateIso ? new Date(s.dateIso) : null);
    return d && d >= sevenDaysAgo;
  });
  const monthSales = sales.filter(s => (s.dateIso || '').startsWith(currentMonthIso) || (s.createdAt && new Date(s.createdAt).toISOString().startsWith(currentMonthIso)));

  // Financial aggregates
  const todayTotal = todaySales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const todayOrders = todaySales.length;
  const isPos = (ch: string) => {
    const c = (ch || '').toUpperCase();
    return c === 'POS' || c === 'IN_STORE' || c === 'IN-STORE POS';
  };
  const todayPos = todaySales.filter(s => isPos(s.channel)).reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const todayOnline = todaySales.filter(s => !isPos(s.channel)).reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const todayCash = todaySales.filter(s => (s.paymentMethod || '').toUpperCase() === 'CASH').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const todayUpi = todaySales.filter(s => (s.paymentMethod || '').toUpperCase() === 'UPI').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const todayCard = todaySales.filter(s => (s.paymentMethod || '').toUpperCase() === 'CARD').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const todayDiscount = todaySales.reduce((acc, s) => acc + (s.discount || 0), 0);
  const todayTax = todaySales.reduce((acc, s) => acc + (s.tax || 0), 0);

  const sevenDaysTotal = sevenDaysSales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const monthTotal = monthSales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);

  // 3. Inventory & Raw Materials (strictly isolated by branchId or global fallback)
  const rawItems = await prisma.inventoryItem.findMany({
    where: {
      OR: [
        { branchId },
        { branchId: null }
      ]
    },
    orderBy: { name: 'asc' }
  });

  const parsedInventory = rawItems.map(i => {
    const opening = Number(i.openingStock || 0);
    const stockIn = Number(i.stockIn || 0);
    const stockOut = Number(i.stockOut || 0);
    const remainingStock = Math.max(0, opening + stockIn - stockOut);
    const minThreshold = Number(i.minThreshold || 0);
    const isLowStock = minThreshold > 0 && remainingStock <= minThreshold;
    const status = isLowStock ? (remainingStock === 0 ? 'CRITICAL' : 'LOW_STOCK') : 'HEALTHY';
    return {
      id: i.id,
      name: i.name,
      category: i.category || 'General',
      unit: normalizeUnit(i.unit || 'NOS'),
      openingStock: opening,
      stockIn,
      stockOut,
      remainingStock,
      minThreshold,
      status,
      isLowStock
    };
  });

  // Only items with minThreshold > 0 and remainingStock <= minThreshold qualify as low stock
  const lowStockItems = parsedInventory.filter(i => i.isLowStock);
  const healthyItems = parsedInventory.filter(i => !i.isLowStock);

  // 4. Operating Expenses
  const expenses = await prisma.expense.findMany({
    where: { branchId },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  const todayExpenses = expenses.filter(e => e.dateIso === todayIso);
  const todayExpensesTotal = todayExpenses.reduce((acc, e) => acc + (parseFloat(String(e.amount)) || 0), 0);
  const monthExpenses = expenses.filter(e => (e.dateIso || '').startsWith(currentMonthIso));
  const monthExpensesTotal = monthExpenses.reduce((acc, e) => acc + (parseFloat(String(e.amount)) || 0), 0);

  // 5. Stock Purchases
  const purchases = await prisma.purchase.findMany({
    where: { branchId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  const todayPurchases = purchases.filter(p => (p.dateIso || '').startsWith(todayIso));
  const todayPurchasesTotal = todayPurchases.reduce((acc, p) => acc + (parseFloat(String(p.totalAmount)) || 0), 0);
  const monthPurchases = purchases.filter(p => (p.dateIso || '').startsWith(currentMonthIso));
  const monthPurchasesTotal = monthPurchases.reduce((acc, p) => acc + (parseFloat(String(p.totalAmount)) || 0), 0);

  // 6. Top menu items sold (Today & 7-Days)
  const itemMapToday: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const s of todaySales) {
    for (const item of (s.items || [])) {
      const name = item.name || 'Unknown Item';
      const qty = item.quantity || 1;
      const rev = item.total || (qty * (item.price || 0));
      if (!itemMapToday[name]) {
        itemMapToday[name] = { name, quantity: 0, revenue: 0 };
      }
      itemMapToday[name].quantity += qty;
      itemMapToday[name].revenue += rev;
    }
  }

  const itemMap7Days: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const s of sevenDaysSales) {
    for (const item of (s.items || [])) {
      const name = item.name || 'Unknown Item';
      const qty = item.quantity || 1;
      const rev = item.total || (qty * (item.price || 0));
      if (!itemMap7Days[name]) {
        itemMap7Days[name] = { name, quantity: 0, revenue: 0 };
      }
      itemMap7Days[name].quantity += qty;
      itemMap7Days[name].revenue += rev;
    }
  }

  const topDishesToday = Object.values(itemMapToday)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const topDishes7Days = Object.values(itemMap7Days)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    branchId,
    branchName,
    todayIso,
    sales: {
      today: {
        totalAmount: todayTotal,
        orderCount: todayOrders,
        inStorePos: todayPos,
        onlineDelivery: todayOnline,
        cashCollected: todayCash,
        upiCollected: todayUpi,
        cardCollected: todayCard,
        discountsGiven: todayDiscount,
        taxCollected: todayTax,
        topItems: topDishesToday
      },
      past7Days: {
        totalAmount: sevenDaysTotal,
        orderCount: sevenDaysSales.length,
        topItems: topDishes7Days
      },
      thisMonth: {
        totalAmount: monthTotal,
        orderCount: monthSales.length
      }
    },
    inventory: {
      totalTrackedItems: parsedInventory.length,
      healthyCount: healthyItems.length,
      lowStockCount: lowStockItems.length,
      lowStockList: lowStockItems.map(i => ({
        name: i.name,
        category: i.category,
        remainingStock: i.remainingStock,
        unit: i.unit,
        threshold: i.minThreshold,
        status: i.status
      })),
      allItems: parsedInventory
    },
    expenses: {
      todayTotal: todayExpensesTotal,
      todayCount: todayExpenses.length,
      monthTotal: monthExpensesTotal,
      recent: expenses.slice(0, 5).map(e => ({
        title: e.description,
        category: e.category,
        amount: parseFloat(String(e.amount)),
        date: e.dateIso
      }))
    },
    purchases: {
      todayTotal: todayPurchasesTotal,
      monthTotal: monthPurchasesTotal,
      recent: purchases.slice(0, 5).map(p => ({
        invoiceNo: p.invoiceRef,
        supplierName: p.supplier,
        totalAmount: parseFloat(String(p.totalAmount)),
        date: p.dateIso
      }))
    }
  };
}

/**
 * Handles KVCM AI Assistant queries with verified database context.
 * Strictly branch-isolated. OpenAI is invoked via backend only.
 */
export async function processKVCMQuery(
  prisma: PrismaClient,
  options: KVCMQueryOptions
): Promise<KVCMQueryResponse> {
  const { query, branchId, userRole } = options;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return {
      success: false,
      answer: 'Please enter a valid question about your café operations.',
      branchId
    };
  }

  // 1. Fetch verified branch-isolated database context
  const context = await fetchBranchBusinessContext(prisma, branchId);

  // 2. Check OpenAI Configuration
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // If OpenAI API key is configured, use OpenAI Chat Completions API
  if (apiKey && apiKey !== 'YOUR_OPENAI_API_KEY' && apiKey.startsWith('sk-')) {
    try {
      const openai = new OpenAI({ apiKey });

      const systemPrompt = `You are KVCM Assistant, the intelligent and professional AI operations assistant for Kanchivaram Café.

CURRENT AUTHORIZED BRANCH CONTEXT:
- Branch: ${context.branchName} (ID: ${context.branchId})
- Today's Date: ${context.todayIso}

CRITICAL RULES:
1. You are authorized ONLY for "${context.branchName}". You must NEVER provide or infer data for any other branch.
2. NEVER invent, hallucinate, or estimate business numbers. All numbers MUST come strictly from the VERIFIED DATABASE CONTEXT below.
3. INVENTORY QUERIES:
   - "Stock Status": Provide the real status of inventory items with remaining quantities (openingStock + stockIn - stockOut). Mention healthy items and any low stock items.
   - "Low Stock Items": Report ONLY items where minThreshold > 0 and remainingStock <= minThreshold. If lowStockCount is 0, explicitly state: "There are currently no low-stock items in ${context.branchName}." Do NOT create fake alerts for items with 0 threshold.
   - Specific Item Stock (e.g. "lemon stock", "how much milk"): Search the inventory context and report exact remaining quantity, unit, purchased count, and status.
4. TOP SELLING ITEMS: List dishes sold with quantity and revenue from the verified sales data.
5. FINANCIALS: Report verified revenue, GST, and expenses accurately formatted with ₹.
6. Keep answers concise, clear, and professional.

VERIFIED DATABASE CONTEXT (Authoritative Source of Truth):
${JSON.stringify({
  branchName: context.branchName,
  todayIso: context.todayIso,
  sales: context.sales,
  inventory: {
    totalTrackedItems: context.inventory.totalTrackedItems,
    healthyCount: context.inventory.healthyCount,
    lowStockCount: context.inventory.lowStockCount,
    lowStockList: context.inventory.lowStockList,
    sampleItems: context.inventory.allItems.slice(0, 30).map(i => ({
      name: i.name,
      remainingStock: i.remainingStock,
      unit: i.unit,
      minThreshold: i.minThreshold,
      status: i.status
    }))
  },
  expenses: context.expenses,
  purchases: context.purchases
}, null, 2)}
`;

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query.trim() }
        ],
        temperature: 0.2,
        max_tokens: 600
      });

      const aiAnswer = completion.choices?.[0]?.message?.content || '';

      if (aiAnswer.trim()) {
        return {
          success: true,
          answer: aiAnswer.trim(),
          branchId,
          modelUsed: model,
          dataContext: {
            todaySales: context.sales.today.totalAmount,
            todayOrders: context.sales.today.orderCount,
            lowStockCount: context.inventory.lowStockCount
          }
        };
      }
    } catch (err: any) {
      console.warn('[KVCM OpenAI Service Error]:', err.message);
      // Fall through to deterministic verified engine on OpenAI error
    }
  }

  // 3. Deterministic Verified Fallback Engine (when OpenAI is offline/unconfigured)
  const q = query.toLowerCase().trim();

  // A. Specific item stock search (e.g., "lemon stock", "what is the current lemon stock?", "sugar stock", "milk")
  const strippedItemQuery = q
    .replace(/what is the current/g, '')
    .replace(/what is the/g, '')
    .replace(/what is/g, '')
    .replace(/how much/g, '')
    .replace(/how many/g, '')
    .replace(/current/g, '')
    .replace(/stock status/g, '')
    .replace(/stock/g, '')
    .replace(/inventory/g, '')
    .replace(/quantity/g, '')
    .replace(/available/g, '')
    .replace(/left/g, '')
    .replace(/[?!.]/g, '')
    .trim();

  if (strippedItemQuery.length >= 3) {
    const matchedItem = context.inventory.allItems.find(item => 
      item.name.toLowerCase() === strippedItemQuery ||
      item.name.toLowerCase().includes(strippedItemQuery) ||
      strippedItemQuery.includes(item.name.toLowerCase())
    );

    if (matchedItem) {
      const statusLabel = matchedItem.status === 'HEALTHY' ? 'Healthy' : 'Low Stock';
      return {
        success: true,
        answer: `📦 Stock Status for ${matchedItem.name} (${context.branchName}):\n• Remaining Stock: ${matchedItem.remainingStock} ${matchedItem.unit} (${statusLabel})\n• Opening Stock: ${matchedItem.openingStock} ${matchedItem.unit}\n• Total Purchased (Stock In): ${matchedItem.stockIn} ${matchedItem.unit}\n• Total Consumed (Stock Out): ${matchedItem.stockOut} ${matchedItem.unit}\n• Minimum Threshold: ${matchedItem.minThreshold} ${matchedItem.unit}`,
        branchId,
        dataContext: matchedItem
      };
    }
  }

  // B. Distinct Low Stock Items query (explicitly looking for low stock / critical alerts)
  if (q.includes('low stock') || q.includes('critical stock') || q.includes('out of stock') || q.includes('running out') || q.includes('reorder')) {
    if (context.inventory.lowStockCount === 0) {
      return {
        success: true,
        answer: `✅ There are currently no low-stock items in ${context.branchName}.\n\nAll ${context.inventory.totalTrackedItems} tracked inventory items are at healthy stock levels above their configured minimum thresholds.`,
        branchId,
        dataContext: context.inventory
      };
    }
    const listStr = context.inventory.lowStockList.map(i => `• ${i.name}: ${i.remainingStock} ${i.unit} (Min Threshold: ${i.threshold})`).join('\n');
    return {
      success: true,
      answer: `⚠️ Low Stock Alert for ${context.branchName} (${context.inventory.lowStockCount} items below threshold):\n\n${listStr}\n\n💡 Raise a purchase invoice in Purchase / Stock In to replenish these ingredients.`,
      branchId,
      dataContext: context.inventory
    };
  }

  // C. General Stock Status query (lists real inventory items with health status)
  if (q.includes('stock status') || q.includes('inventory') || q.includes('stock')) {
    const sampleList = context.inventory.allItems.slice(0, 8).map(i => 
      `• ${i.name}: ${i.remainingStock} ${i.unit} (${i.status === 'HEALTHY' ? 'Healthy' : 'Low Stock'})`
    ).join('\n');
    return {
      success: true,
      answer: `📦 Real-Time Inventory Stock Status for ${context.branchName}:\n• Total Tracked Items: ${context.inventory.totalTrackedItems}\n• Healthy Items: ${context.inventory.healthyCount}\n• Low Stock Items: ${context.inventory.lowStockCount}\n\n📋 Active Stock Levels:\n${sampleList}${context.inventory.totalTrackedItems > 8 ? `\n...and ${context.inventory.totalTrackedItems - 8} more items in live inventory.` : ''}`,
      branchId,
      dataContext: context.inventory
    };
  }

  // D. Profit & Loss / P&L
  if (q.includes('profit') || q.includes('loss') || q.includes('p&l') || q.includes('p and l') || q.includes('margin') || q.includes('bottom line')) {
    const grossRev = context.sales.today.totalAmount;
    const tax = context.sales.today.taxCollected;
    const netTaxable = Math.max(0, grossRev - tax);
    const expenses = context.expenses.todayTotal;
    const purchases = context.purchases.todayTotal;
    const totalCosts = expenses + purchases;
    const netProfit = netTaxable - totalCosts;

    if (grossRev === 0 && totalCosts === 0) {
      return {
        success: true,
        answer: `📊 Verified Profit & Loss Statement (Today) for ${context.branchName}:\n\nNo completed sales or expense records found for today.\n• Net Sales Revenue: ₹0.00 (0 completed bills)\n• Operating Expenses: ₹0.00 (0 entries)\n• Stock Purchases: ₹0.00 (0 invoices)\n\n💡 Complete orders in POS and record operational expenses to generate live P&L figures.`,
        branchId,
        dataContext: { grossRev, totalCosts, netProfit }
      };
    }

    const banner = netProfit > 0 
      ? `🟢 NET PROFIT: +₹${netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      : netProfit === 0
      ? `⚖️ BREAK-EVEN: ₹0.00`
      : `🔴 NET LOSS: -₹${Math.abs(netProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    return {
      success: true,
      answer: `📊 Verified Profit & Loss Statement (Today) for ${context.branchName}:\n\n📈 REVENUE:\n• Gross Sales: ₹${grossRev.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${context.sales.today.orderCount} orders)\n• GST Collected: ₹${tax.toFixed(2)}\n• Net Taxable Revenue: ₹${netTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n📉 RECORDED COSTS:\n• Operating Expenses: ₹${expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• Stock Purchases: ₹${purchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• Total Recorded Costs: ₹${totalCosts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n═══════════════════════════════════\n${banner}\n═══════════════════════════════════`,
      branchId,
      dataContext: { grossRev, totalCosts, netProfit }
    };
  }

  // E. Sales & Revenue / 7-Day Trends
  if (q.includes('sale') || q.includes('revenue') || q.includes('collection') || q.includes('trend')) {
    if (q.includes('week') || q.includes('7 day') || q.includes('trend')) {
      return {
        success: true,
        answer: `📊 Past 7 Days Sales for ${context.branchName}:\n• Total Revenue: ₹${context.sales.past7Days.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• Completed Bills: ${context.sales.past7Days.orderCount} orders`,
        branchId,
        dataContext: context.sales.past7Days
      };
    }
    if (q.includes('month')) {
      return {
        success: true,
        answer: `📊 This Month's Sales for ${context.branchName}:\n• Total Revenue: ₹${context.sales.thisMonth.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• Completed Bills: ${context.sales.thisMonth.orderCount} orders`,
        branchId,
        dataContext: context.sales.thisMonth
      };
    }
    return {
      success: true,
      answer: `📊 Today's Sales for ${context.branchName}:\n• Total Revenue: ₹${context.sales.today.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• Completed Orders: ${context.sales.today.orderCount}\n• In-Store POS: ₹${context.sales.today.inStorePos.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• Online Delivery: ₹${context.sales.today.onlineDelivery.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• Cash: ₹${context.sales.today.cashCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })} | Digital/UPI: ₹${context.sales.today.upiCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      branchId,
      dataContext: context.sales.today
    };
  }

  // F. Top Selling Items
  if (q.includes('top sell') || q.includes('best sell') || q.includes('top item') || q.includes('popular') || q.includes('favorite') || q.includes('dish')) {
    const list = context.sales.today.topItems.length > 0 ? context.sales.today.topItems : context.sales.past7Days.topItems;
    const periodLabel = context.sales.today.topItems.length > 0 ? "Today" : "Past 7 Days";
    if (list.length === 0) {
      return {
        success: true,
        answer: `☕ No completed item sales recorded yet for ${context.branchName}. Complete bills in POS to see your top-selling products here.`,
        branchId
      };
    }
    const itemsStr = list.map((item, idx) => `${idx + 1}. ${item.name}: ${item.quantity} sold, ₹${item.revenue.toFixed(2)} revenue`).join('\n');
    return {
      success: true,
      answer: `🏆 Top Selling Items (${periodLabel}) at ${context.branchName}:\n\n${itemsStr}`,
      branchId,
      dataContext: list
    };
  }

  // G. Operating Expenses
  if (q.includes('expense') || q.includes('spend') || q.includes('cost')) {
    return {
      success: true,
      answer: `💼 Operating Expenses for ${context.branchName}:\n• Today's Expenses: ₹${context.expenses.todayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${context.expenses.todayCount} entries)\n• This Month's Total: ₹${context.expenses.monthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      branchId,
      dataContext: context.expenses
    };
  }

  // H. Tax / GST
  if (q.includes('tax') || q.includes('gst') || q.includes('cgst') || q.includes('sgst')) {
    const tax = context.sales.today.taxCollected;
    const cgst = tax / 2;
    const sgst = tax / 2;
    return {
      success: true,
      answer: `🧾 Today's Tax Summary (GST 5%) for ${context.branchName}:\n• Total Tax Collected: ₹${tax.toFixed(2)}\n  - CGST (2.5%): ₹${cgst.toFixed(2)}\n  - SGST (2.5%): ₹${sgst.toFixed(2)}\n• Completed Bills: ${context.sales.today.orderCount}`,
      branchId,
      dataContext: { tax, cgst, sgst }
    };
  }

  // I. Purchases / Stock In
  if (q.includes('purchase') || q.includes('stock in') || q.includes('supplier') || q.includes('invoice') || q.includes('vendor')) {
    return {
      success: true,
      answer: `📦 Stock Purchases for ${context.branchName}:\n• Today's Stock Purchases: ₹${context.purchases.todayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• This Month's Purchases: ₹${context.purchases.monthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• Recent Invoices: ${context.purchases.recent.length} recorded`,
      branchId,
      dataContext: context.purchases
    };
  }

  // J. Online Orders
  if (q.includes('online') || q.includes('pending') || q.includes('swiggy') || q.includes('zomato') || q.includes('dunzo')) {
    return {
      success: true,
      answer: `🛵 Online Orders for ${context.branchName}:\n• Online Revenue Today: ₹${context.sales.today.onlineDelivery.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\nCheck the Online Orders page for incoming delivery partner requests.`,
      branchId,
      dataContext: { onlineDelivery: context.sales.today.onlineDelivery }
    };
  }

  // K. General Fallback
  return {
    success: true,
    answer: `☕ Hello! I am KVCM Assistant for ${context.branchName}. I can answer questions about today's sales, profit & loss, real-time inventory stock levels, low-stock alerts, operating expenses, and purchases based on your live verified database.`,
    branchId,
    dataContext: {
      branchName: context.branchName,
      todaySales: context.sales.today.totalAmount,
      lowStockCount: context.inventory.lowStockCount
    }
  };
}

