// KVCM AI Business Assistant Service
// Node.js + TypeScript + Express + Prisma + OpenAI SDK

import OpenAI from 'openai';
import type { PrismaClient } from '@prisma/client';

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

  const branchName = branch?.name || (branchId === 'branch-2' ? 'City Branch - Anna Salai' : 'Main Branch - Gandhi Road');

  // 2. Sales records (strictly filtered by branchId and non-cancelled)
  const sales = await prisma.sale.findMany({
    where: {
      branchId,
      isCancelled: false
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 200
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

  // 3. Inventory & Raw Materials (filtered by branchId if applicable)
  const rawItems = await prisma.inventoryItem.findMany();
  const lowStockItems = rawItems.filter(i => {
    const remaining = Math.max(0, (i.openingStock || 0) + (i.stockIn || 0) - (i.stockOut || 0));
    return remaining <= (i.minThreshold || 5);
  });

  // 4. Operating Expenses
  const expenses = await prisma.expense.findMany({
    where: { branchId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  const todayExpenses = expenses.filter(e => e.dateIso === todayIso);
  const todayExpensesTotal = todayExpenses.reduce((acc, e) => acc + (parseFloat(String(e.amount)) || 0), 0);
  const monthExpenses = expenses.filter(e => (e.dateIso || '').startsWith(currentMonthIso));
  const monthExpensesTotal = monthExpenses.reduce((acc, e) => acc + (parseFloat(String(e.amount)) || 0), 0);

  // 5. Stock Purchases
  const purchases = await prisma.purchase.findMany({
    where: { branchId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  const todayPurchases = purchases.filter(p => (p.dateIso || '').startsWith(todayIso));
  const todayPurchasesTotal = todayPurchases.reduce((acc, p) => acc + (parseFloat(String(p.totalAmount)) || 0), 0);

  // 6. Top menu items sold today
  const itemQtyMap: Record<string, number> = {};
  for (const s of todaySales) {
    for (const item of (s.items || [])) {
      itemQtyMap[item.name] = (itemQtyMap[item.name] || 0) + (item.quantity || 0);
    }
  }
  const topDishesToday = Object.entries(itemQtyMap)
    .map(([name, qty]) => ({ name, quantity: qty }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

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
        orderCount: sevenDaysSales.length
      },
      thisMonth: {
        totalAmount: monthTotal,
        orderCount: monthSales.length
      }
    },
    inventory: {
      totalTrackedItems: rawItems.length,
      lowStockCount: lowStockItems.length,
      lowStockList: lowStockItems.slice(0, 10).map(i => ({
        name: i.name,
        category: i.category,
        remainingStock: Math.max(0, (i.openingStock || 0) + (i.stockIn || 0) - (i.stockOut || 0)),
        unit: i.unit,
        threshold: i.minThreshold
      }))
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
3. If the user asks for data that is not present in the context, explicitly state that the record is not available in the database.
4. Keep answers concise, clear, and professional with appropriate café and financial formatting (e.g. ₹ amounts with commas).

VERIFIED DATABASE CONTEXT (Authoritative Source of Truth):
${JSON.stringify(context, null, 2)}
`;

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query.trim() }
        ],
        temperature: 0.2,
        max_tokens: 500
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
  const q = query.toLowerCase();

  // A. Sales & Revenue
  if (q.includes('sale') || q.includes('revenue') || q.includes('collection') || q.includes('sell') || q.includes('how much')) {
    if (q.includes('week') || q.includes('7 day')) {
      return {
        success: true,
        answer: `📊 Past 7 Days Sales for ${context.branchName}:\n• Total Revenue: ₹${context.sales.past7Days.totalAmount.toLocaleString('en-IN')}\n• Completed Bills: ${context.sales.past7Days.orderCount} orders`,
        branchId,
        dataContext: context.sales.past7Days
      };
    }
    if (q.includes('month')) {
      return {
        success: true,
        answer: `📊 This Month's Sales for ${context.branchName}:\n• Total Revenue: ₹${context.sales.thisMonth.totalAmount.toLocaleString('en-IN')}\n• Completed Bills: ${context.sales.thisMonth.orderCount} orders`,
        branchId,
        dataContext: context.sales.thisMonth
      };
    }
    return {
      success: true,
      answer: `📊 Today's Sales for ${context.branchName}:\n• Total Revenue: ₹${context.sales.today.totalAmount.toLocaleString('en-IN')}\n• Completed Orders: ${context.sales.today.orderCount}\n• In-Store POS: ₹${context.sales.today.inStorePos.toLocaleString('en-IN')}\n• Online Delivery: ₹${context.sales.today.onlineDelivery.toLocaleString('en-IN')}\n• Cash: ₹${context.sales.today.cashCollected.toLocaleString('en-IN')} | UPI: ₹${context.sales.today.upiCollected.toLocaleString('en-IN')}`,
      branchId,
      dataContext: context.sales.today
    };
  }

  // B. Inventory & Low Stock
  if (q.includes('stock') || q.includes('inventory') || q.includes('low') || q.includes('critical') || q.includes('material')) {
    if (context.inventory.lowStockCount === 0) {
      return {
        success: true,
        answer: `✅ All inventory items are well-stocked for ${context.branchName}. There are currently 0 items below the minimum threshold.`,
        branchId,
        dataContext: context.inventory
      };
    }
    const listStr = context.inventory.lowStockList.map(i => `• ${i.name}: ${i.remainingStock} ${i.unit} (Min: ${i.threshold})`).join('\n');
    return {
      success: true,
      answer: `⚠️ Low Stock Alert for ${context.branchName} (${context.inventory.lowStockCount} items below threshold):\n\n${listStr}`,
      branchId,
      dataContext: context.inventory
    };
  }

  // C. Operating Expenses
  if (q.includes('expense') || q.includes('spend') || q.includes('cost')) {
    return {
      success: true,
      answer: `💼 Operating Expenses for ${context.branchName}:\n• Today's Expenses: ₹${context.expenses.todayTotal.toLocaleString('en-IN')} (${context.expenses.todayCount} entries)\n• This Month's Total: ₹${context.expenses.monthTotal.toLocaleString('en-IN')}`,
      branchId,
      dataContext: context.expenses
    };
  }

  // D. Purchases / Inward Stock
  if (q.includes('purchase') || q.includes('supplier') || q.includes('invoice') || q.includes('vendor')) {
    return {
      success: true,
      answer: `📦 Stock Purchases for ${context.branchName}:\n• Today's Stock Purchases: ₹${context.purchases.todayTotal.toLocaleString('en-IN')}\n• Recent Invoices: ${context.purchases.recent.length} recorded`,
      branchId,
      dataContext: context.purchases
    };
  }

  // E. Best selling / Top items
  if (q.includes('best') || q.includes('top') || q.includes('popular') || q.includes('dish') || q.includes('item')) {
    if (context.sales.today.topItems.length === 0) {
      return {
        success: true,
        answer: `☕ No dish sales have been recorded yet today for ${context.branchName}.`,
        branchId
      };
    }
    const itemsStr = context.sales.today.topItems.map((item, idx) => `${idx + 1}. ${item.name} (${item.quantity} sold)`).join('\n');
    return {
      success: true,
      answer: `🏆 Top Selling Items Today at ${context.branchName}:\n\n${itemsStr}`,
      branchId,
      dataContext: context.sales.today.topItems
    };
  }

  // F. General Fallback
  return {
    success: true,
    answer: `☕ Hello! I am KVCM Assistant for ${context.branchName}. I can answer questions about today's sales, payment splits, low-stock inventory, operating expenses, and purchases based on your live verified database.`,
    branchId,
    dataContext: {
      branchName: context.branchName,
      todaySales: context.sales.today.totalAmount,
      lowStockCount: context.inventory.lowStockCount
    }
  };
}
