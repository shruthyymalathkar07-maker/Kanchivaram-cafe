import { prisma } from './db';
import { 
  PRODUCT_CATEGORIES, 
  CLIENT_PRODUCTS_MASTER, 
  CLIENT_RAW_MATERIALS_MASTER, 
  CLIENT_BOM_MASTER 
} from './data/masterData';
import { seedDefaultUsers } from './auth';

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 1000): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt >= retries) {
        throw err;
      }
      console.log(`[Retry ${attempt}/${retries}] Reconnecting after error: ${err.message || err.code}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

export async function executeProductionHandoverCleanup() {
  console.log('================================================================================');
  console.log('🧹 EXECUTING PRODUCTION HANDOVER CLEANUP — KANCHIPURAM CAFÉ');
  console.log('================================================================================\n');

  console.log('STEP 1: Checking pre-cleanup record counts...');
  const [
    preSales,
    preSaleItems,
    prePurchases,
    prePurchaseItems,
    preLedger,
    preExpenses,
    preStaff,
    preCustomers,
    preInventory
  ] = await withRetry(() => Promise.all([
    prisma.sale.count(),
    prisma.saleItem.count(),
    prisma.purchase.count(),
    prisma.purchaseItem.count(),
    prisma.stockLedger.count(),
    prisma.expense.count(),
    prisma.staff.count(),
    prisma.customer.count(),
    prisma.inventoryItem.count()
  ]));

  console.log(`- Sales: ${preSales} (Items: ${preSaleItems})`);
  console.log(`- Purchases: ${prePurchases} (Items: ${prePurchaseItems})`);
  console.log(`- Stock Ledger: ${preLedger}`);
  console.log(`- Expenses: ${preExpenses}`);
  console.log(`- Staff: ${preStaff}`);
  console.log(`- Customers: ${preCustomers}`);
  console.log(`- Inventory Items: ${preInventory}\n`);

  console.log('STEP 2: Deleting transactional test records in foreign-key order...');
  
  // 1. Delete SaleItems & Sales
  const delSaleItems = await prisma.saleItem.deleteMany({});
  const delSales = await prisma.sale.deleteMany({});
  console.log(`✓ Deleted ${delSaleItems.count} SaleItem records and ${delSales.count} Sale records.`);

  // 2. Delete PurchaseItems & Purchases
  const delPurchaseItems = await prisma.purchaseItem.deleteMany({});
  const delPurchases = await prisma.purchase.deleteMany({});
  console.log(`✓ Deleted ${delPurchaseItems.count} PurchaseItem records and ${delPurchases.count} Purchase records.`);

  // 3. Delete StockLedger audit records
  const delLedger = await prisma.stockLedger.deleteMany({});
  console.log(`✓ Deleted ${delLedger.count} StockLedger records.`);

  // 4. Delete Expense records
  const delExpenses = await prisma.expense.deleteMany({});
  console.log(`✓ Deleted ${delExpenses.count} Expense records.`);

  // 5. Delete Customer records
  const delCustomers = await prisma.customer.deleteMany({});
  console.log(`✓ Deleted ${delCustomers.count} Customer records.`);

  // 6. Delete Staff test records if any
  const delStaff = await prisma.staff.deleteMany({});
  console.log(`✓ Deleted ${delStaff.count} Staff records.`);

  // 7. Remove non-master InventoryItem records (e.g. rm-lemon-audit)
  const masterIds = new Set(CLIENT_RAW_MATERIALS_MASTER.map(rm => rm.id));
  const allInv = await prisma.inventoryItem.findMany({ select: { id: true } });
  const testInvIds = allInv.filter(i => !masterIds.has(i.id)).map(i => i.id);

  if (testInvIds.length > 0) {
    // Delete any recipeItems referencing test inventory items
    await prisma.recipeItem.deleteMany({
      where: { inventoryItemId: { in: testInvIds } }
    });
    const delTestInv = await prisma.inventoryItem.deleteMany({
      where: { id: { in: testInvIds } }
    });
    console.log(`✓ Deleted ${delTestInv.count} non-master/test InventoryItem records.`);
  }

  console.log('\nSTEP 3: Resetting 117 Master Inventory Items to clean 0 stock...');
  await withRetry(() => prisma.inventoryItem.updateMany({
    data: {
      openingStock: 0.0,
      stockIn: 0.0,
      stockOut: 0.0,
      minThreshold: 0.0,
      costPerUnit: 0.0,
      supplier: 'Unassigned',
      lastMovement: null
    }
  }));

  const existingInv = await withRetry(() => prisma.inventoryItem.findMany({ select: { id: true } }));
  const existingInvIds = new Set(existingInv.map(i => i.id));
  const missingInv = CLIENT_RAW_MATERIALS_MASTER.filter(rm => !existingInvIds.has(rm.id));
  if (missingInv.length > 0) {
    for (const rm of missingInv) {
      const categoryName = rm.category || 'Raw Ingredients';
      await withRetry(() => prisma.inventoryItem.create({
        data: {
          id: rm.id,
          name: rm.name,
          category: categoryName,
          unit: rm.unit || 'units',
          openingStock: 0.0,
          stockIn: 0.0,
          stockOut: 0.0,
          minThreshold: 0.0,
          costPerUnit: 0.0,
          supplier: 'Unassigned',
          lastMovement: null
        }
      }));
    }
  }
  console.log(`✓ Synchronized all 117 Raw Material Master items with 0 stock.`);

  console.log('\nSTEP 4: Verifying and preserving all Master Data...');
  // 1. Branches
  const branches = [
    {
      id: 'branch-1',
      code: 'KCB-MAIN-01',
      name: 'Main Branch - Gandhi Road',
      badge: 'Main Branch',
      location: 'Gandhi Road',
      fullAddress: 'No. 42, Gandhi Road, Near Temple Tower, Kanchipuram, Tamil Nadu - 631501',
      status: 'Operational (Live)',
      tablesCount: 24,
      posTerminals: 3,
      accentColor: '#0D3B2E',
      badgeBg: 'bg-[#0D3B2E]',
      badgeText: 'text-white'
    },
    {
      id: 'branch-2',
      code: 'KCB-CITY-02',
      name: 'City Branch - Anna Salai',
      badge: 'City Branch',
      location: 'Anna Salai',
      fullAddress: 'No. 18, Anna Salai Commercial Complex, Kanchipuram, Tamil Nadu - 631502',
      status: 'Operational (Live)',
      tablesCount: 18,
      posTerminals: 2,
      accentColor: '#5C3826',
      badgeBg: 'bg-[#5C3826]',
      badgeText: 'text-white'
    }
  ];
  for (const b of branches) {
    await withRetry(() => prisma.branch.upsert({
      where: { id: b.id },
      update: b,
      create: b
    }));
    await withRetry(() => prisma.storeSetting.upsert({
      where: { branchId: b.id },
      update: {
        storeName: 'Kanchivaram Café',
        branchName: b.name,
        gstin: '33AAACK1234F1Z9',
        fssaiNo: '12421008000142',
        contactPhone: '+91 98765 43210',
        contactEmail: 'contact@kanchivaram.cafe',
        cgstPercent: 2.5,
        sgstPercent: 2.5,
        autoPrintReceipt: true,
        defaultPaymentMode: 'CASH'
      },
      create: {
        branchId: b.id,
        storeName: 'Kanchivaram Café',
        branchName: b.name,
        gstin: '33AAACK1234F1Z9',
        fssaiNo: '12421008000142',
        contactPhone: '+91 98765 43210',
        contactEmail: 'contact@kanchivaram.cafe',
        cgstPercent: 2.5,
        sgstPercent: 2.5,
        autoPrintReceipt: true,
        defaultPaymentMode: 'CASH'
      }
    }));
  }

  // 2. Categories (9)
  const catCount = await withRetry(() => prisma.productCategory.count());
  if (catCount !== 9) {
    for (const cat of PRODUCT_CATEGORIES) {
      await withRetry(() => prisma.productCategory.upsert({
        where: { id: cat.id },
        update: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          displayOrder: cat.displayOrder
        },
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          displayOrder: cat.displayOrder
        }
      }));
    }
  }

  // 3. Products (59)
  const prodCount = await withRetry(() => prisma.product.count());
  if (prodCount !== 59) {
    for (const prod of CLIENT_PRODUCTS_MASTER) {
      await withRetry(() => prisma.product.upsert({
        where: { id: prod.id },
        update: {
          categoryId: prod.categoryId,
          categoryName: prod.category,
          name: prod.name,
          servingQty: prod.servingQty,
          uom: prod.uom,
          dineInPrice: prod.dineInPrice,
          deliveryPrice: prod.deliveryPrice,
          packingCharge: prod.packingCharge,
          description: prod.description,
          image: prod.image,
          isAvailable: true
        },
        create: {
          id: prod.id,
          categoryId: prod.categoryId,
          categoryName: prod.category,
          name: prod.name,
          servingQty: prod.servingQty,
          uom: prod.uom,
          dineInPrice: prod.dineInPrice,
          deliveryPrice: prod.deliveryPrice,
          packingCharge: prod.packingCharge,
          description: prod.description,
          image: prod.image,
          isAvailable: true
        }
      }));
    }
  }

  // 4. BOM Recipes (9)
  const recipeCount = await withRetry(() => prisma.recipe.count());
  if (recipeCount !== 9) {
    for (const bom of CLIENT_BOM_MASTER) {
      const recipeRecord = await withRetry(() => prisma.recipe.upsert({
        where: { productId: bom.productId },
        update: {
          productName: bom.productName,
          status: bom.status,
          servingQty: bom.servingQty,
          servingUom: bom.servingUom || 'units',
          finalProcess: bom.finalProcess || ''
        },
        create: {
          id: `recipe-${bom.productId}`,
          productId: bom.productId,
          productName: bom.productName,
          status: bom.status,
          servingQty: bom.servingQty,
          servingUom: bom.servingUom || 'units',
          finalProcess: bom.finalProcess || ''
        }
      }));

      await withRetry(() => prisma.recipeItem.deleteMany({
        where: { recipeId: recipeRecord.id }
      }));

      if (bom.processes && bom.processes.length > 0) {
        for (let step = 0; step < bom.processes.length; step++) {
          const item = bom.processes[step];
          await withRetry(() => prisma.recipeItem.create({
            data: {
              id: `ri-${recipeRecord.id}-${step + 1}`,
              recipeId: recipeRecord.id,
              stepNumber: step + 1,
              rawMaterialName: item.rawMaterialName,
              inventoryItemId: item.rawMaterialId,
              quantity: item.qty,
              uom: item.uom,
              process: item.process
            }
          }));
        }
      }
    }
  }

  // 5. Auth Users
  await seedDefaultUsers();

  console.log('\nSTEP 5: Verifying Post-Cleanup Database State...');
  const [
    postBranches,
    postSettings,
    postCategories,
    postProducts,
    postInventory,
    postRecipes,
    postUsers,
    postSales,
    postSaleItems,
    postPurchases,
    postPurchaseItems,
    postLedger,
    postExpenses,
    postStaff,
    postCustomers
  ] = await Promise.all([
    prisma.branch.count(),
    prisma.storeSetting.count(),
    prisma.productCategory.count(),
    prisma.product.count(),
    prisma.inventoryItem.count(),
    prisma.recipe.count(),
    prisma.user.count(),
    prisma.sale.count(),
    prisma.saleItem.count(),
    prisma.purchase.count(),
    prisma.purchaseItem.count(),
    prisma.stockLedger.count(),
    prisma.expense.count(),
    prisma.staff.count(),
    prisma.customer.count()
  ]);

  const nonZeroStock = await prisma.inventoryItem.count({
    where: {
      OR: [
        { openingStock: { gt: 0 } },
        { stockIn: { gt: 0 } },
        { stockOut: { gt: 0 } }
      ]
    }
  });

  console.log('--------------------------------------------------------------------------------');
  console.log('📊 FINAL POST-CLEANUP RECORD AUDIT:');
  console.log('--------------------------------------------------------------------------------');
  console.log(`• Branches:         ${postBranches} / 2 (Main Branch & City Branch)`);
  console.log(`• Store Settings:   ${postSettings} / 2 (Main & City configurations)`);
  console.log(`• Categories:       ${postCategories} / 9 (100% Preserved)`);
  console.log(`• Products:         ${postProducts} / 59 (100% Preserved)`);
  console.log(`• Inventory Items:  ${postInventory} / 117 (100% Preserved with 0 opening stock)`);
  console.log(`• Recipes:          ${postRecipes} / 9 (100% Preserved)`);
  console.log(`• Auth Users:       ${postUsers} / 2 (Admin & Manager credentials intact)`);
  console.log(`• Sales:            ${postSales} (₹0 sales)`);
  console.log(`• Sale Items:       ${postSaleItems} (0 items)`);
  console.log(`• Purchases:        ${postPurchases} (0 records)`);
  console.log(`• Purchase Items:   ${postPurchaseItems} (0 items)`);
  console.log(`• Stock Ledger:     ${postLedger} (0 movements)`);
  console.log(`• Expenses:         ${postExpenses} (0 expenses)`);
  console.log(`• Customers:        ${postCustomers} (0 customers)`);
  console.log(`• Staff:            ${postStaff} (0 records)`);
  console.log(`• Non-zero Stock:   ${nonZeroStock} items (All items at clean 0 quantity)`);
  console.log('--------------------------------------------------------------------------------\n');

  if (
    postSales === 0 &&
    postSaleItems === 0 &&
    postPurchases === 0 &&
    postPurchaseItems === 0 &&
    postLedger === 0 &&
    postExpenses === 0 &&
    postCustomers === 0 &&
    postStaff === 0 &&
    nonZeroStock === 0 &&
    postCategories === 9 &&
    postProducts === 59 &&
    postInventory === 117 &&
    postBranches === 2 &&
    postSettings === 2
  ) {
    console.log('🎉 PRODUCTION HANDOVER CLEAN STATE — PASS');
    return true;
  } else {
    console.error('❌ Clean state verification failed assertions!');
    return false;
  }
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('cleanupProductionDatabase')) {
  executeProductionHandoverCleanup()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Cleanup error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
