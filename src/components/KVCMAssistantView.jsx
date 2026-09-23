import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Trash2,
  User,
  Sparkles,
  Coffee,
  BarChart2,
  Package,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Truck,
  Percent,
  Clock
} from 'lucide-react';
import { inventoryStore } from '../services/inventoryStore';
import { expenseStore } from '../services/expenseStore';

// ─── Verified KVCM Analytics & Financial Calculation Engine ───────────────────
export const getKVCMResponse = (query, state, expenseState) => {
  const q = query.toLowerCase();
  const todayIso = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayIso.slice(0, 7);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 1. Filter ONLY valid completed sales (strictly exclude cancelled, refunded, or returned)
  const validSales = (state.sales || []).filter(
    s => s.status !== 'CANCELLED' && s.status !== 'REFUNDED' && !s.isCancelled
  );

  const todaySales = validSales.filter(s => (s.dateIso || '').startsWith(todayIso));
  const sevenDaysSales = validSales.filter(s => {
    const d = s.createdAt ? new Date(s.createdAt) : (s.dateIso ? new Date(s.dateIso) : null);
    return d && d >= sevenDaysAgo;
  });
  const monthSales = validSales.filter(s => (s.dateIso || '').startsWith(currentMonthPrefix));

  // 2. Filter Operating Expenses
  const allExpenses = expenseState?.expenses || [];
  const todayExpenses = allExpenses.filter(e => e.date === todayIso);
  const sevenDaysExpenses = allExpenses.filter(e => new Date(e.date) >= sevenDaysAgo);
  const monthExpenses = allExpenses.filter(e => (e.date || '').startsWith(currentMonthPrefix));

  // 3. Filter Purchases / Raw Ingredients Stock-In
  const allPurchases = state.purchases || [];
  const todayPurchases = allPurchases.filter(p => (p.dateIso || '').startsWith(todayIso));
  const sevenDaysPurchases = allPurchases.filter(p => {
    const d = p.dateIso ? new Date(p.dateIso) : (p.date ? new Date(p.date) : null);
    return d && d >= sevenDaysAgo;
  });
  const monthPurchases = allPurchases.filter(p => (p.dateIso || '').startsWith(currentMonthPrefix));

  const items = state.items || [];
  const lowStock = items.filter(i => i.status === 'LOW_STOCK' || i.status === 'CRITICAL');

  // =========================================================================
  // INTENT A: PROFIT & LOSS / NET MARGIN / FINANCIAL BREAKDOWN
  // =========================================================================
  if (
    q.includes('profit') || 
    q.includes('loss') || 
    q.includes('p&l') || 
    q.includes('p and l') || 
    q.includes('net margin') || 
    q.includes('earnings') || 
    q.includes('bottom line')
  ) {
    const isWeek = q.includes('week') || q.includes('7 day') || q.includes('seven day');
    const isMonth = q.includes('month') || q.includes('monthly');
    const periodLabel = isWeek ? 'Past 7 Days' : isMonth ? 'This Month' : 'Today';

    const targetSales = isWeek ? sevenDaysSales : isMonth ? monthSales : todaySales;
    const targetExpenses = isWeek ? sevenDaysExpenses : isMonth ? monthExpenses : todayExpenses;
    const targetPurchases = isWeek ? sevenDaysPurchases : isMonth ? monthPurchases : todayPurchases;

    // Revenue calculations from valid completed transactions
    const grossRevenue = targetSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const totalDiscounts = targetSales.reduce((sum, s) => sum + (s.discount || 0), 0);
    const totalTax = targetSales.reduce((sum, s) => sum + (s.tax || 0), 0);
    const netTaxableRevenue = Math.max(0, grossRevenue - totalTax);

    // Cost calculations
    const opExpensesTotal = targetExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const purchasesTotal = targetPurchases.reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0);
    const totalRecordedCosts = opExpensesTotal + purchasesTotal;

    const hasSales = targetSales.length > 0;
    const hasExpenses = targetExpenses.length > 0;
    const hasPurchases = targetPurchases.length > 0;
    const hasCostData = hasExpenses || hasPurchases;

    // CASE 1: No data recorded at all
    if (!hasSales && !hasCostData) {
      return {
        icon: DollarSign,
        text: `📊 Verified Profit & Loss Statement (${periodLabel})\n\nNo completed sales or expense records found for ${periodLabel.toLowerCase()}.\n\n• Net Sales Revenue: ₹0.00 (0 completed bills)\n• Operating Expenses: ₹0.00 (0 entries)\n• Stock Purchases: ₹0.00 (0 invoices)\n\n💡 Complete orders in POS and record operational expenses in the Expenses module to generate your live verified P&L calculations.`
      };
    }

    // CASE 2: Sales exist, but ZERO expense/cost records exist
    if (hasSales && !hasCostData) {
      return {
        icon: DollarSign,
        text: `📊 Profit & Loss Status (${periodLabel})\n\n📈 REVENUE RECORDED:\n• Gross Sales: ₹${grossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${targetSales.length} completed orders)\n• Discounts Applied: ₹${totalDiscounts.toFixed(2)}\n• GST (5%) Collected: ₹${totalTax.toFixed(2)}\n• Net Taxable Revenue: ₹${netTaxableRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n⚠️ REQUIRED COST DATA UNAVAILABLE:\nNo operational expenses (e.g. rent, utilities, wages) or supplier stock purchases have been logged in the system for ${periodLabel.toLowerCase()}.\n\nℹ️ To calculate verified Net Profit or Loss, please record your daily expenses in the Expenses module and supplier invoices in Purchase & Stock In. KVCM only calculates profit/loss from verified data and never estimates or invents missing cost figures.`
      };
    }

    // CASE 3: Costs exist, but ZERO sales exist
    if (!hasSales && hasCostData) {
      return {
        icon: DollarSign,
        text: `📊 Profit & Loss Status (${periodLabel})\n\n📉 RECORDED OPERATING OUTFLOWS:\n• Operating Expenses: ₹${opExpensesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${targetExpenses.length} entries)\n• Raw Material Stock In: ₹${purchasesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${targetPurchases.length} invoices)\n• Total Recorded Costs: ₹${totalRecordedCosts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n📈 REVENUE:\n• Net Sales Revenue: ₹0.00 (0 completed sales)\n\n🔴 CURRENT NET OUTFLOW: -₹${totalRecordedCosts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n💡 Start taking orders in POS to begin offsetting recorded costs with live revenue.`
      };
    }

    // CASE 4: BOTH Sales and Costs exist -> Exact Verified P&L Calculation
    const netResult = netTaxableRevenue - totalRecordedCosts;
    const isProfit = netResult > 0;
    const isBreakEven = netResult === 0;
    const margin = netTaxableRevenue > 0 ? ((netResult / netTaxableRevenue) * 100).toFixed(1) : '0.0';

    let resultBanner = '';
    if (isProfit) {
      resultBanner = `🟢 NET PROFIT: +₹${netResult.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Net Margin: ${margin}%)`;
    } else if (isBreakEven) {
      resultBanner = `⚖️ BREAK-EVEN: ₹0.00 (Revenue matches recorded costs)`;
    } else {
      resultBanner = `🔴 NET LOSS: -₹${Math.abs(netResult).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }

    return {
      icon: DollarSign,
      text: `📊 Verified Profit & Loss Statement (${periodLabel})\n\n📈 REVENUE BREAKDOWN:\n• Gross Sales (POS + Online): ₹${grossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${targetSales.length} orders)\n• Discounts Given: -₹${totalDiscounts.toFixed(2)}\n• GST (5%) Collected: ₹${totalTax.toFixed(2)}\n• Net Taxable Revenue: ₹${netTaxableRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n📉 RECORDED COSTS & OUTFLOWS:\n• Operating Expenses (Utilities, Rent, etc.): ₹${opExpensesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${targetExpenses.length} entries)\n• Raw Material Stock Purchases: ₹${purchasesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${targetPurchases.length} invoices)\n• Total Recorded Costs: ₹${totalRecordedCosts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n═══════════════════════════════════\n${resultBanner}\n═══════════════════════════════════\n\n📋 Note: Computed strictly from completed, unreturned orders and recorded cost entries.`
    };
  }

  // =========================================================================
  // INTENT B: PRODUCT-LEVEL ANALYTICS, 7-DAY TRENDS & CUSTOMER PREFERENCES
  // =========================================================================
  if (
    q.includes('trend') || 
    q.includes('7 day') || 
    q.includes('seven day') || 
    q.includes('product') || 
    q.includes('item') || 
    q.includes('analytics') || 
    q.includes('preference') || 
    q.includes('demand') || 
    q.includes('top sell') || 
    q.includes('best sell') || 
    q.includes('popular') || 
    q.includes('variety') || 
    q.includes('variation') || 
    q.includes('average')
  ) {
    // Build 7-day comprehensive product ledger
    const productMap = {};
    const categoryMap = {};

    sevenDaysSales.forEach(sale => {
      const saleDate = sale.dateIso || todayIso;
      (sale.items || []).forEach(item => {
        const name = item.name || 'Unknown Item';
        const category = item.categoryName || 'General';

        if (!productMap[name]) {
          productMap[name] = {
            name,
            category,
            todayQty: 0,
            todayRevenue: 0,
            sevenDayQty: 0,
            sevenDayRevenue: 0,
            activeDays: new Set()
          };
        }

        const qty = Number(item.qty || 1);
        const revenue = Number(item.total || (qty * (item.price || 0)));

        productMap[name].sevenDayQty += qty;
        productMap[name].sevenDayRevenue += revenue;
        productMap[name].activeDays.add(saleDate);

        if (saleDate === todayIso) {
          productMap[name].todayQty += qty;
          productMap[name].todayRevenue += revenue;
        }

        categoryMap[category] = (categoryMap[category] || 0) + qty;
      });
    });

    const productsList = Object.values(productMap);

    // Check if user is asking about a SPECIFIC product name (e.g. "filter coffee", "ghee roast", etc.)
    const specificMatch = productsList.find(p => q.includes(p.name.toLowerCase()));
    if (specificMatch) {
      const dailyAvg = (specificMatch.sevenDayQty / 7).toFixed(1);
      return {
        icon: TrendingUp,
        text: `☕ Product Sales Analytics: ${specificMatch.name}\n\n📅 TODAY'S PERFORMANCE:\n• Quantity Sold: ${specificMatch.todayQty} units\n• Revenue: ₹${specificMatch.todayRevenue.toFixed(2)}\n\n📊 PAST 7 DAYS PERFORMANCE:\n• Total Quantity Sold: ${specificMatch.sevenDayQty} units\n• 7-Day Daily Average: ${dailyAvg} units/day\n• Total 7-Day Revenue: ₹${specificMatch.sevenDayRevenue.toFixed(2)}\n• Sales Consistency: Active on ${specificMatch.activeDays.size} of the last 7 days\n• Category: ${specificMatch.category}\n\n📌 Note: Verified historical sales metrics provided to help guide your menu and inventory decisions.`
      };
    }

    if (productsList.length === 0) {
      return {
        icon: TrendingUp,
        text: `📊 Product Sales & 7-Day Demand Analytics\n\nNo product sales recorded in the past 7 days. Once you complete orders in POS or receive online orders, your verified product-level sales volumes, daily averages, and customer preference trends will be generated here in real time.`
      };
    }

    // Sort products by 7-Day Quantity descending
    const sortedBy7Day = [...productsList].sort((a, b) => b.sevenDayQty - a.sevenDayQty);
    const top7Day = sortedBy7Day.slice(0, 5);

    // Sort products by Today's Quantity descending
    const sortedByToday = [...productsList].filter(p => p.todayQty > 0).sort((a, b) => b.todayQty - a.todayQty).slice(0, 5);

    // Formatted 7-Day Top Sellers Ranking
    let top7DayText = top7Day.map((p, idx) => {
      const dailyAvg = (p.sevenDayQty / 7).toFixed(1);
      return `${idx + 1}. ${p.name}: ${p.sevenDayQty} units (avg ${dailyAvg}/day) — ₹${p.sevenDayRevenue.toFixed(2)}`;
    }).join('\n');

    // Formatted Today's Sales Ranking
    let todayText = sortedByToday.length > 0 
      ? sortedByToday.map((p, idx) => `${idx + 1}. ${p.name}: ${p.todayQty} served — ₹${p.todayRevenue.toFixed(2)}`).join('\n')
      : '• No items sold today yet.';

    // Category Preference Distribution
    const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
    const topCatName = sortedCategories[0]?.[0] || 'Beverages';
    const totalUnitsSold = productsList.reduce((sum, p) => sum + p.sevenDayQty, 0);
    const topCatUnits = sortedCategories[0]?.[1] || 0;
    const topCatShare = totalUnitsSold > 0 ? ((topCatUnits / totalUnitsSold) * 100).toFixed(0) : '0';

    // High consistency items (sold on 4+ out of 7 days)
    const steadyItems = productsList.filter(p => p.activeDays.size >= 4).map(p => p.name);
    const consistencyNote = steadyItems.length > 0 
      ? `• High-Consistency Daily Staples: ${steadyItems.slice(0, 3).join(', ')} (ordered across multiple active days)`
      : '• Sales distributed across various menu items.';

    return {
      icon: TrendingUp,
      text: `📊 Product Sales & 7-Day Analytics Report\n\n🏆 TOP-SELLING PRODUCTS (Past 7 Days):\n${top7DayText}\n\n☕ TODAY'S HIGHEST VELOCITY ITEMS:\n${todayText}\n\n📈 CUSTOMER PREFERENCE & DEMAND INSIGHTS:\n• Highest Demand Category: ${topCatName} (${topCatShare}% of total 7-day volume)\n${consistencyNote}\n• Total 7-Day Volume: ${totalUnitsSold} items served across ${sevenDaysSales.length} orders\n\n═══════════════════════════════════\n📌 Management Advisory:\nThe above calculations report verified historical volume and customer demand trends from your actual POS & Online sales records to support your product and variation planning. KVCM Assistant reports verified calculations only and does not automatically add, modify, or recommend specific menu items.\n═══════════════════════════════════`
    };
  }

  // =========================================================================
  // INTENT C: TODAY'S SALES & REVENUE SUMMARY
  // =========================================================================
  if (q.includes('sales') || q.includes('revenue') || q.includes('today')) {
    if (todaySales.length === 0) {
      return {
        icon: BarChart2,
        text: `📊 Today's Sales\n\nNo completed sales recorded yet for today. Head to POS / Billing to start taking orders — your revenue will show up here in real time! ☕`
      };
    }
    const posSales = todaySales.filter(s => !s.channel || s.channel === 'POS' || s.channel === 'In-Store POS');
    const onlineSales = todaySales.filter(s => s.channel && s.channel !== 'POS' && s.channel !== 'In-Store POS');
    const posTotal = posSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const onlineTotal = onlineSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const totalSales = todaySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const totalDiscounts = todaySales.reduce((sum, s) => sum + (s.discount || 0), 0);
    const totalTax = todaySales.reduce((sum, s) => sum + (s.tax || 0), 0);

    const cashSales = todaySales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const digitalSales = todaySales.filter(s => s.paymentMethod !== 'CASH').reduce((sum, s) => sum + (s.grandTotal || 0), 0);

    return {
      icon: BarChart2,
      text: `📊 Today's Sales Summary\n\nTotal Revenue: ₹${totalSales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}\nTotal Completed Bills: ${todaySales.length}\n\n🖥️ In-Store POS: ₹${posTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} (${posSales.length} bills)\n🛵 Online Platforms: ₹${onlineTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} (${onlineSales.length} orders)\n\n💳 Collections:\n• Cash: ₹${cashSales.toFixed(2)}\n• Digital / UPI / Card: ₹${digitalSales.toFixed(2)}\n\n🎟️ Discounts Given: ₹${totalDiscounts.toFixed(2)}\n🧾 GST 5% Collected: ₹${totalTax.toFixed(2)}`
    };
  }

  // =========================================================================
  // INTENT D: TAX & GST BREAKDOWN
  // =========================================================================
  if (q.includes('tax') || q.includes('gst') || q.includes('cgst') || q.includes('sgst')) {
    if (todaySales.length === 0) {
      return {
        icon: Percent,
        text: `🧾 Today's Tax (GST 5%)\n\nNo sales recorded yet today, so tax is ₹0.00. Complete your first POS bill to see live GST data here! ☕`
      };
    }
    const totalSales = todaySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const totalTax = todaySales.reduce((sum, s) => sum + (s.tax || 0), 0);
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const taxableSales = Math.max(0, totalSales - totalTax);

    return {
      icon: Percent,
      text: `🧾 Today's GST Summary\n\nTotal Tax Collected: ₹${totalTax.toFixed(2)}\n  • CGST (2.5%): ₹${cgst.toFixed(2)}\n  • SGST (2.5%): ₹${sgst.toFixed(2)}\n\nTaxable Sales: ₹${taxableSales.toFixed(2)}\nBased on ${todaySales.length} completed bills. All GST amounts are logged for official reporting. 📋`
    };
  }

  // =========================================================================
  // INTENT E: LOW STOCK & CRITICAL ALERTS
  // =========================================================================
  if (q.includes('low stock') || q.includes('low') || q.includes('running out') || q.includes('reorder')) {
    if (lowStock.length === 0) {
      return {
        icon: Package,
        text: `✅ Stock Status\n\nGreat news! All inventory items are at healthy stock levels. No items are running low right now. Keep an eye on the Inventory page for real-time updates. 📦`
      };
    }
    const critical = lowStock.filter(i => i.status === 'CRITICAL');
    const low = lowStock.filter(i => i.status === 'LOW_STOCK');
    let msg = `⚠️ Low Stock Alert\n\n${lowStock.length} item(s) need attention:\n`;
    if (critical.length > 0) {
      msg += `\n🔴 CRITICAL (reorder immediately):\n`;
      critical.forEach(i => { msg += `• ${i.name}: ${i.remainingStock} ${i.unit} left (min: ${i.minThreshold})\n`; });
    }
    if (low.length > 0) {
      msg += `\n🟡 LOW STOCK (reorder soon):\n`;
      low.forEach(i => { msg += `• ${i.name}: ${i.remainingStock} ${i.unit} left (min: ${i.minThreshold})\n`; });
    }
    msg += `\nGo to Purchase / Stock In to raise a purchase order! 🛒`;
    return { icon: AlertTriangle, text: msg };
  }

  // =========================================================================
  // INTENT F: GENERAL INVENTORY OVERVIEW
  // =========================================================================
  if (q.includes('stock') || q.includes('inventory')) {
    const healthy = items.filter(i => i.status === 'HEALTHY').length;
    const lowCount = items.filter(i => i.status === 'LOW_STOCK').length;
    const critCount = items.filter(i => i.status === 'CRITICAL').length;
    return {
      icon: Package,
      text: `📦 Inventory Overview\n\nTotal SKUs Tracked: ${items.length}\n✅ Healthy: ${healthy} items\n🟡 Low Stock: ${lowCount} items\n🔴 Critical: ${critCount} items\n\n${critCount > 0 ? '⚠️ Action needed! Some items are critically low.' : lowCount > 0 ? 'Consider placing purchase orders for low stock items soon.' : 'All items are at healthy levels. Well done!'}`
    };
  }

  // =========================================================================
  // INTENT G: ONLINE ORDERS
  // =========================================================================
  if (q.includes('online') || q.includes('pending') || q.includes('swiggy') || q.includes('zomato') || q.includes('dunzo')) {
    const onlineOrders = todaySales.filter(s => s.channel && s.channel !== 'POS' && s.channel !== 'In-Store POS');
    const swiggy = onlineOrders.filter(s => s.channel === 'Swiggy');
    const zomato = onlineOrders.filter(s => s.channel === 'Zomato');
    const dunzo = onlineOrders.filter(s => s.channel === 'Dunzo');
    const other = onlineOrders.filter(s => !['Swiggy', 'Zomato', 'Dunzo'].includes(s.channel));
    const onlineTotal = onlineOrders.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

    if (onlineOrders.length === 0) {
      return {
        icon: ShoppingBag,
        text: `🛵 Online Orders\n\nNo online orders received today yet. Check the Online Orders page to accept and manage incoming orders from Swiggy, Zomato, and Dunzo! 📱`
      };
    }
    return {
      icon: ShoppingBag,
      text: `🛵 Today's Online Orders\n\nTotal Online Revenue: ₹${onlineTotal.toFixed(2)}\nTotal Orders: ${onlineOrders.length}\n\n📦 By Platform:\n• Swiggy: ${swiggy.length} orders (₹${swiggy.reduce((acc, s) => acc + (s.grandTotal || 0), 0).toFixed(2)})\n• Zomato: ${zomato.length} orders (₹${zomato.reduce((acc, s) => acc + (s.grandTotal || 0), 0).toFixed(2)})\n• Dunzo: ${dunzo.length} orders (₹${dunzo.reduce((acc, s) => acc + (s.grandTotal || 0), 0).toFixed(2)})\n${other.length > 0 ? `• Other Channels: ${other.length} orders (₹${other.reduce((acc, s) => acc + (s.grandTotal || 0), 0).toFixed(2)})\n` : ''}\nCheck the Online Orders page for live order tracking! 📱`
    };
  }

  // =========================================================================
  // INTENT H: EXPENSES
  // =========================================================================
  if (q.includes('expense') || q.includes('expenses') || q.includes('cost') || q.includes('spending')) {
    const opTotalToday = todayExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const purchasesTotalToday = todayPurchases.reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0);
    const combinedToday = opTotalToday + purchasesTotalToday;

    if (allExpenses.length === 0 && allPurchases.length === 0) {
      return {
        icon: DollarSign,
        text: `💸 Expenses & Cost Overview\n\nNo expense or purchase records logged yet. Head to the Expenses page from the sidebar to record operating costs (Rent, Utilities, Supplies) and Purchase & Stock In for ingredient purchases. 📊`
      };
    }

    let catMap = {};
    todayExpenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + (parseFloat(e.amount) || 0);
    });
    if (purchasesTotalToday > 0) {
      catMap['Raw Ingredients (Stock In)'] = purchasesTotalToday;
    }

    let breakdownText = Object.entries(catMap).map(([cat, amt]) => `• ${cat}: ₹${amt.toFixed(2)}`).join('\n');

    return {
      icon: DollarSign,
      text: `💸 Today's Expense Breakdown\n\nTotal Recorded Outflow Today: ₹${combinedToday.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n📋 Category Details:\n${breakdownText || '• No expense entries recorded for today.'}\n\nTrack all operational outlays in the Expenses page to keep your profit margins healthy! 📊`
    };
  }

  // =========================================================================
  // INTENT I: PURCHASE / STOCK IN
  // =========================================================================
  if (q.includes('purchase') || q.includes('stock in') || q.includes('supplier')) {
    const purchaseTotal = todayPurchases.reduce((sum, p) => sum + (p.totalAmount || p.grandTotal || 0), 0);
    return {
      icon: Truck,
      text: `🚛 Purchase & Stock In\n\nToday's Invoices: ${todayPurchases.length} invoice(s)\nTotal Spend Today: ₹${purchaseTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}\n\nAll recorded stock purchases automatically update real-time inventory and feed into verified cost calculations! 📦`
    };
  }

  // =========================================================================
  // DEFAULT RESPONSE
  // =========================================================================
  return {
    icon: Coffee,
    text: `☕ Hello! I'm KVCM Assistant — your verified café operations & analytics assistant.\n\nI can calculate and report live data for:\n• 📊 Verified Profit & Loss (Revenue - Recorded Costs)\n• 📈 Individual Product Sales & 7-Day Trends\n• 🏆 Top-Selling Products & Customer Preferences\n• 💰 Today's Gross & Net Sales (POS vs Online)\n• 🧾 GST / Tax Breakdowns (CGST & SGST)\n• 📦 Real-Time Inventory & Low Stock Alerts\n• 💸 Operating Expenses & Supplier Stock In\n\nTap a quick question below or ask me any question! 😊`
  };
};

// ─── Quick Question Config ─────────────────────────────────────────────────────
const QUICK_QUESTIONS = [
  { label: "Today's Sales", icon: BarChart2 },
  { label: "Profit & Loss", icon: DollarSign },
  { label: "7-Day Sales Trends", icon: TrendingUp },
  { label: "Top Selling Items", icon: Sparkles },
  { label: "Today's Expenses", icon: DollarSign },
  { label: "Today's Tax", icon: Percent },
  { label: "Stock Status", icon: Package },
  { label: "Low Stock Items", icon: AlertTriangle },
  { label: "Pending Online Orders", icon: ShoppingBag },
  { label: "Purchase / Stock In", icon: Truck },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function KVCMAssistantView({ selectedBranch }) {
  const isBrownBranch = selectedBranch?.id === 'branch-2';

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I'm KVCM Assistant. How can I help you with your café today? ☕",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: Coffee
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollContainerRef = useRef(null);

  // Sync selected branch to stores
  useEffect(() => {
    if (selectedBranch?.id) {
      inventoryStore.setBranch(selectedBranch.id);
      expenseStore.setBranch(selectedBranch.id);
    }
  }, [selectedBranch?.id]);

  // Auto-scroll strictly inside the conversation container ONLY (prevents page/window scroll)
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = (text) => {
    const queryText = (text || input).trim();
    if (!queryText || isTyping) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message immediately
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: now
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate a short thinking delay, then respond
    setTimeout(() => {
      if (selectedBranch?.id) {
        inventoryStore.setBranch(selectedBranch.id);
        expenseStore.setBranch(selectedBranch.id);
      }
      const state = inventoryStore.getState();
      const expenseState = expenseStore.getState();
      const response = getKVCMResponse(queryText, state, expenseState);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        icon: response.icon || Bot,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleClear = () => {
    setMessages([{
      id: 'welcome-cleared',
      sender: 'bot',
      text: "Chat cleared! I'm KVCM Assistant — ready to help. What would you like to know? ☕",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: Coffee
    }]);
    setIsTyping(false);
  };

  // ── Branch-aware theme tokens (reuse exact existing palette) ──
  const accent      = isBrownBranch ? '#542A16' : '#0f3823';
  const accentLight = isBrownBranch ? '#3E2312' : '#0a2618';
  const accentBdr   = isBrownBranch ? '#7A4325' : '#194c31';
  const accentText  = isBrownBranch ? '#C69A4B' : '#4ade80';
  const headerBg    = isBrownBranch ? 'bg-[#3E2312]' : 'bg-[#0f3823]';
  const btnPrimary  = isBrownBranch
    ? 'bg-[#542A16] hover:bg-[#3D1E0F] border-[#7A4325]'
    : 'bg-[#0f3823] hover:bg-[#0a2618] border-[#194c31]';
  const iconAccent  = isBrownBranch ? 'text-[#C69A4B]' : 'text-[#4ade80]';
  const pillActive  = isBrownBranch
    ? 'bg-[#542A16] text-white border-[#7A4325]'
    : 'bg-[#0f3823] text-white border-[#194c31]';
  const pillIdle    = isBrownBranch
    ? 'bg-[#ebdcc8]/60 hover:bg-[#e0d0bb] text-[#3E2312] border-[#cabb9e]'
    : 'bg-[#ebdcc8]/60 hover:bg-[#e0d0bb] text-[#11291f] border-[#cabb9e]';
  const userBubble  = isBrownBranch
    ? 'bg-[#542A16] text-white'
    : 'bg-[#0f3823] text-white';
  const botBubble   = 'bg-[#fdfbf7] border border-[#e2d5c3] text-[#11291f]';
  const inputFocus  = isBrownBranch ? 'focus:ring-[#C69A4B]/40' : 'focus:ring-[#4ade80]/30';

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-[#F8F0E3] rounded-2xl border border-[#cabb9e] shadow-sm overflow-hidden">

      {/* ── Header Card ─────────────────────────────────────────────────── */}
      <div className={`${headerBg} text-white px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between shrink-0 border-b-2 ${isBrownBranch ? 'border-[#7A4325]' : 'border-[#194c31]'}`}>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={`p-2 rounded-xl border ${isBrownBranch ? 'bg-[#2D190D] border-[#7A4325]' : 'bg-[#0a2618] border-[#194c31]'} shadow-inner`}>
            <Bot className={`w-4 h-4 sm:w-5 sm:h-5 ${iconAccent}`} />
          </div>
          <div>
            <h2 className="font-serif font-black text-sm sm:text-base leading-tight">KVCM Assistant</h2>
            <p className={`text-[10px] sm:text-[11px] font-medium ${iconAccent} flex items-center gap-1`}>
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Your smart café operations assistant</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          title="Clear conversation"
          className={`p-1.5 rounded-xl ${isBrownBranch ? 'bg-[#2D190D] hover:bg-[#3E2312] text-[#C69A4B]' : 'bg-[#0a2618] hover:bg-[#0f3823] text-[#4ade80]'} border ${isBrownBranch ? 'border-[#542A16]' : 'border-[#194c31]'} cursor-pointer transition-colors`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── Quick Questions ──────────────────────────────────────────────── */}
      <div className="px-3 sm:px-4 py-2 border-b border-[#e8d8c2] bg-[#fdfbf7] shrink-0">
        <p className="text-[9.5px] font-mono font-bold text-[#547363] uppercase tracking-wider mb-1.5">Quick Questions</p>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {QUICK_QUESTIONS.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.label}
                onClick={() => handleSend(q.label)}
                disabled={isTyping}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${pillIdle}`}
              >
                <Icon className="w-3 h-3" />
                {q.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Messages Area ────────────────────────────────────────────────── */}
      <div 
        ref={chatScrollContainerRef} 
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-6 pb-4 md:py-4 space-y-3 custom-scrollbar touch-pan-y"
      >
        {messages.map((msg) => {
          const MsgIcon = msg.icon || Bot;
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex ${isBot ? 'items-start gap-2.5' : 'items-end flex-row-reverse gap-2.5'}`}
            >
              {/* Avatar */}
              {isBot ? (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${isBrownBranch ? 'bg-[#3E2312] border-[#7A4325]' : 'bg-[#0f3823] border-[#194c31]'}`}>
                  <MsgIcon className={`w-4 h-4 ${iconAccent}`} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#ebdcc8] border border-[#cabb9e] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#547363]" />
                </div>
              )}

              {/* Bubble */}
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-xs ${isBot ? botBubble : userBubble}`}>
                <p className="text-xs font-medium leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>
                <p className={`text-[9.5px] mt-1 flex items-center gap-1 ${isBot ? 'text-[#8aaa98]' : 'text-white/60'}`}>
                  <Clock className="w-2.5 h-2.5" />
                  {msg.timestamp}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${isBrownBranch ? 'bg-[#3E2312] border-[#7A4325]' : 'bg-[#0f3823] border-[#194c31]'}`}>
              <Bot className={`w-4 h-4 ${iconAccent}`} />
            </div>
            <div className={`${botBubble} rounded-2xl px-4 py-3 shadow-xs`}>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isBrownBranch ? 'bg-[#C69A4B]' : 'bg-[#4ade80]'} animate-bounce`} style={{ animationDelay: '0ms' }} />
                <span className={`w-1.5 h-1.5 rounded-full ${isBrownBranch ? 'bg-[#C69A4B]' : 'bg-[#4ade80]'} animate-bounce`} style={{ animationDelay: '150ms' }} />
                <span className={`w-1.5 h-1.5 rounded-full ${isBrownBranch ? 'bg-[#C69A4B]' : 'bg-[#4ade80]'} animate-bounce`} style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Input Bar ────────────────────────────────────────────────────── */}
      <div className={`px-3 sm:px-4 py-3 sm:py-3.5 border-t-2 ${isBrownBranch ? 'border-[#d4be9b] bg-[#fbf6ed]' : 'border-[#cabb9e] bg-[#fdfbf7]'} shadow-[0_-4px_16px_rgba(0,0,0,0.06)] shrink-0`}>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask KVCM Assistant anything about your café..."
              disabled={isTyping}
              className={`w-full pl-4 pr-4 py-2.5 sm:py-3 bg-white border-2 ${
                isBrownBranch 
                  ? 'border-[#a3795b] focus:border-[#542A16] text-[#2D190D]' 
                  : 'border-[#6e9b82] focus:border-[#0f3823] text-[#0f231a]'
              } rounded-full text-xs sm:text-sm font-semibold placeholder-[#7d6e5d] focus:outline-none focus:ring-3 ${inputFocus} transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] disabled:opacity-60`}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${btnPrimary} border text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
        <p className="text-[10px] sm:text-[10.5px] text-[#7d6e5d] text-center mt-1.5 font-bold">
          KVCM Assistant • Powered by your café's live data
        </p>
      </div>

    </div>
  );
}
