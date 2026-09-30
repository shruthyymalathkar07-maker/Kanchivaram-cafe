import { prisma } from '../server/src/db.js';

async function inspectDb() {
  console.log('================================================================================');
  console.log('🔍 INSPECTING PRODUCTION POSTGRESQL DATABASE RECORD COUNTS');
  console.log('================================================================================\n');

  try {
    const [
      branches,
      users,
      categories,
      products,
      inventoryItems,
      recipes,
      recipeItems,
      sales,
      saleItems,
      stockLedgers,
      purchases,
      purchaseItems,
      expenses,
      staff,
      customers,
      storeSettings
    ] = await Promise.all([
      prisma.branch.count(),
      prisma.user.count(),
      prisma.productCategory.count(),
      prisma.product.count(),
      prisma.inventoryItem.count(),
      prisma.recipe.count(),
      prisma.recipeItem.count(),
      prisma.sale.count(),
      prisma.saleItem.count(),
      prisma.stockLedger.count(),
      prisma.purchase.count(),
      prisma.purchaseItem.count(),
      prisma.expense.count(),
      prisma.staff.count(),
      prisma.customer.count(),
      prisma.storeSetting.count()
    ]);

    console.log('--- MASTER DATA TABLES ---');
    console.log(`Branch:           ${branches} records`);
    console.log(`User:             ${users} records`);
    console.log(`ProductCategory:  ${categories} records`);
    console.log(`Product:          ${products} records`);
    console.log(`InventoryItem:    ${inventoryItems} records`);
    console.log(`Recipe:           ${recipes} records`);
    console.log(`RecipeItem:       ${recipeItems} records`);
    console.log(`StoreSetting:     ${storeSettings} records`);

    console.log('\n--- TRANSACTIONAL / TEST DATA TABLES ---');
    console.log(`Sale:             ${sales} records`);
    console.log(`SaleItem:         ${saleItems} records`);
    console.log(`StockLedger:      ${stockLedgers} records`);
    console.log(`Purchase:         ${purchases} records`);
    console.log(`PurchaseItem:     ${purchaseItems} records`);
    console.log(`Expense:          ${expenses} records`);
    console.log(`Staff:            ${staff} records`);
    console.log(`Customer:         ${customers} records`);

    // Check inventory stock stats
    const itemsWithNonZeroStock = await prisma.inventoryItem.findMany({
      where: {
        OR: [
          { openingStock: { gt: 0 } },
          { stockIn: { gt: 0 } },
          { stockOut: { gt: 0 } }
        ]
      },
      select: { id: true, name: true, openingStock: true, stockIn: true, stockOut: true }
    });

    console.log(`\nInventory items with non-zero stock/movements: ${itemsWithNonZeroStock.length}`);
    if (itemsWithNonZeroStock.length > 0) {
      console.log('Sample non-zero items:', itemsWithNonZeroStock.slice(0, 5));
    }

    // Check Users
    const userRecords = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true }
    });
    console.log('\nUser records:', userRecords);

  } catch (err: any) {
    console.error('Inspection error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectDb();
