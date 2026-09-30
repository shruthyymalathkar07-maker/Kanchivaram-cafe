import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApiRouter } from '../server/src/routes/api.js';
import { prisma } from '../server/src/db.js';

async function runCleanStateFunctionalityTests() {
  console.log('================================================================================');
  console.log('🧪 VERIFYING CLEAN STATE APPLICATION FUNCTIONALITY');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  const app = express();
  app.use(express.json());
  const server = http.createServer(app);
  const io = new SocketServer(server, { cors: { origin: '*' } });
  app.use('/api', createApiRouter(io));

  const PORT = 5097;
  await new Promise<void>((resolve) => server.listen(PORT, () => resolve()));
  const BASE_URL = `http://localhost:${PORT}/api`;

  try {
    // 1. Test Dashboard Stats for Main Branch & City Branch
    const dashRes1 = await fetch(`${BASE_URL}/dashboard/stats?branchId=branch-1`).then(r => r.json());
    assert(dashRes1.success === true, 'Test 1: Dashboard API responds successfully for Main Branch');
    const kpis = dashRes1.data?.kpis || dashRes1.kpis;
    assert(kpis.totalSales.amount === 0, 'Test 2: Total Sales is ₹0');
    assert(kpis.totalSales.inStore === 0, 'Test 3: POS In-Store Sales is ₹0');
    assert(kpis.totalSales.online === 0, 'Test 4: Online Sales is ₹0');
    assert(kpis.totalSales.orderCount === 0, 'Test 5: Order Count is 0');
    assert(kpis.discounts.amount === 0, 'Test 6: Discounts is ₹0');
    assert(kpis.cashCollection.amount === 0, 'Test 7: Cash Collection is ₹0');

    // 2. Test Products & Categories API
    const prodRes = await fetch(`${BASE_URL}/products`).then(r => r.json());
    assert(prodRes.products.length === 59, `Test 8: Products API returns all 59 products (got ${prodRes.products.length})`);
    assert(prodRes.categories.length === 9, `Test 9: Products API returns all 9 categories (got ${prodRes.categories.length})`);

    // 3. Test Inventory Master API
    const invRes = await fetch(`${BASE_URL}/inventory/master`, { headers: { 'x-branch-id': 'branch-1' } }).then(r => r.json());
    assert(invRes.items.length === 117, `Test 10: Inventory Master returns all 117 items (got ${invRes.items.length})`);
    
    const allZero = invRes.items.every((i: any) => (i.openingStock || 0) === 0 && (i.stockIn || 0) === 0 && (i.stockOut || 0) === 0);
    assert(allZero === true, 'Test 11: All 117 Inventory items have exactly 0 stock');

    // 4. Test Purchases API
    const purRes = await fetch(`${BASE_URL}/inventory/purchases?branchId=branch-1`).then(r => r.json());
    assert(purRes.purchases.length === 0, 'Test 12: Purchases API returns 0 records');

    // 5. Test Ledger API
    const ledRes = await fetch(`${BASE_URL}/inventory/ledger?branchId=branch-1`).then(r => r.json());
    assert(ledRes.ledger.length === 0, 'Test 13: Stock Ledger API returns 0 records');

    // 6. Test Customers API
    const custRes = await fetch(`${BASE_URL}/customers?branchId=branch-1`).then(r => r.json());
    assert(custRes.customers.length === 0, 'Test 14: Customers API returns 0 records');

    // 7. Test Expenses API
    const expRes = await fetch(`${BASE_URL}/expenses?branchId=branch-1`).then(r => r.json());
    assert(expRes.expenses.length === 0, 'Test 15: Expenses API returns 0 records');

    // 8. Test Controlled Ephemeral POS Sale & Stock Deduction (Cleaned Up Immediately)
    const tempBillNumber = `KC-TEST-HANDOVER-${Date.now()}`;
    const saleCreateRes = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-branch-id': 'branch-1' },
      body: JSON.stringify({
        branchId: 'branch-1',
        billNumber: tempBillNumber,
        subtotal: 100,
        tax: 5,
        discount: 0,
        grandTotal: 105,
        paymentMethod: 'CASH',
        receiptType: 'PAPER',
        channel: 'POS',
        dateIso: new Date().toISOString().split('T')[0],
        items: [{ productId: 'prod-45', productName: 'Filter Coffee', quantity: 2, unitPrice: 25, subtotal: 50 }]
      })
    }).then(r => r.json());
    assert(saleCreateRes.success === true, 'Test 16: Temporary POS sale creation works dynamically');

    // Immediately clean up temporary test sale & stock movement
    if (saleCreateRes.sale?.id) {
      await prisma.saleItem.deleteMany({ where: { saleId: saleCreateRes.sale.id } });
      await prisma.sale.delete({ where: { id: saleCreateRes.sale.id } });
    }
    await prisma.stockLedger.deleteMany({ where: { ref: tempBillNumber } });
    console.log('✓ Ephemeral test transaction created and immediately deleted.');

    // 9. Confirm clean state remains at exactly 0
    const [finalSales, finalPurchases, finalExpenses, finalCustomers] = await Promise.all([
      prisma.sale.count(),
      prisma.purchase.count(),
      prisma.expense.count(),
      prisma.customer.count()
    ]);
    assert(finalSales === 0 && finalPurchases === 0 && finalExpenses === 0 && finalCustomers === 0, 'Test 17: Database remains clean at 0 transactions');

  } catch (err: any) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    await prisma.$disconnect();
  }

  console.log('\n================================================================================');
  console.log(`📊 CLEAN STATE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================================\n');

  if (failed === 0) {
    console.log('🎉 ALL CLEAN-STATE FUNCTIONALITY CHECKS PASSED.');
  } else {
    process.exit(1);
  }
}

runCleanStateFunctionalityTests();
