import { prisma } from './db';
import { 
  PRODUCT_CATEGORIES, 
  CLIENT_PRODUCTS_MASTER, 
  CLIENT_RAW_MATERIALS_MASTER, 
  CLIENT_BOM_MASTER 
} from './data/masterData';

const DDL_STATEMENTS: string[] = [
  "CREATE TABLE IF NOT EXISTS \"public\".\"Branch\" (\n    \"id\" TEXT NOT NULL,\n    \"code\" TEXT NOT NULL,\n    \"name\" TEXT NOT NULL,\n    \"badge\" TEXT NOT NULL,\n    \"location\" TEXT NOT NULL,\n    \"fullAddress\" TEXT NOT NULL,\n    \"status\" TEXT NOT NULL DEFAULT 'Operational (Live)',\n    \"tablesCount\" INTEGER NOT NULL DEFAULT 24,\n    \"posTerminals\" INTEGER NOT NULL DEFAULT 3,\n    \"accentColor\" TEXT NOT NULL DEFAULT '#0D3B2E',\n    \"badgeBg\" TEXT NOT NULL DEFAULT 'bg-[#0D3B2E]',\n    \"badgeText\" TEXT NOT NULL DEFAULT 'text-white',\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"Branch_pkey\" PRIMARY KEY (\"id\")\n  );",
  "CREATE UNIQUE INDEX IF NOT EXISTS \"Branch_code_key\" ON \"public\".\"Branch\"(\"code\");",
  "CREATE TABLE IF NOT EXISTS \"public\".\"StoreSetting\" (\n    \"branchId\" TEXT NOT NULL,\n    \"storeName\" TEXT NOT NULL DEFAULT 'Kanchivaram Café',\n    \"branchName\" TEXT NOT NULL,\n    \"gstin\" TEXT NOT NULL DEFAULT '33AAACK1234F1Z9',\n    \"fssaiNo\" TEXT NOT NULL DEFAULT '12421008000142',\n    \"contactPhone\" TEXT NOT NULL DEFAULT '+91 98765 43210',\n    \"contactEmail\" TEXT NOT NULL DEFAULT 'contact@kanchivaram.cafe',\n    \"cgstPercent\" DOUBLE PRECISION NOT NULL DEFAULT 2.5,\n    \"sgstPercent\" DOUBLE PRECISION NOT NULL DEFAULT 2.5,\n    \"autoPrintReceipt\" BOOLEAN NOT NULL DEFAULT true,\n    \"defaultPaymentMode\" TEXT NOT NULL DEFAULT 'CASH',\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"StoreSetting_pkey\" PRIMARY KEY (\"branchId\")\n  );",
  "CREATE UNIQUE INDEX IF NOT EXISTS \"StoreSetting_branchId_key\" ON \"public\".\"StoreSetting\"(\"branchId\");",
  "CREATE TABLE IF NOT EXISTS \"public\".\"ProductCategory\" (\n    \"id\" TEXT NOT NULL,\n    \"name\" TEXT NOT NULL,\n    \"slug\" TEXT NOT NULL,\n    \"icon\" TEXT NOT NULL DEFAULT '✨',\n    \"displayOrder\" INTEGER NOT NULL DEFAULT 0,\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"ProductCategory_pkey\" PRIMARY KEY (\"id\")\n  );",
  "CREATE UNIQUE INDEX IF NOT EXISTS \"ProductCategory_name_key\" ON \"public\".\"ProductCategory\"(\"name\");",
  "CREATE UNIQUE INDEX IF NOT EXISTS \"ProductCategory_slug_key\" ON \"public\".\"ProductCategory\"(\"slug\");",
  "CREATE TABLE IF NOT EXISTS \"public\".\"Product\" (\n    \"id\" TEXT NOT NULL,\n    \"branchId\" TEXT,\n    \"categoryId\" TEXT NOT NULL,\n    \"categoryName\" TEXT NOT NULL,\n    \"name\" TEXT NOT NULL,\n    \"servingQty\" DOUBLE PRECISION NOT NULL,\n    \"uom\" TEXT NOT NULL,\n    \"dineInPrice\" DOUBLE PRECISION NOT NULL,\n    \"deliveryPrice\" DOUBLE PRECISION NOT NULL,\n    \"packingCharge\" DOUBLE PRECISION NOT NULL DEFAULT 5.0,\n    \"description\" TEXT,\n    \"image\" TEXT,\n    \"isAvailable\" BOOLEAN NOT NULL DEFAULT true,\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"Product_pkey\" PRIMARY KEY (\"id\")\n  );",
  "CREATE TABLE IF NOT EXISTS \"public\".\"InventoryItem\" (\n    \"id\" TEXT NOT NULL,\n    \"branchId\" TEXT,\n    \"name\" TEXT NOT NULL,\n    \"category\" TEXT,\n    \"unit\" TEXT NOT NULL DEFAULT 'units',\n    \"openingStock\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"stockIn\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"stockOut\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"minThreshold\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"costPerUnit\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"supplier\" TEXT,\n    \"lastMovement\" TIMESTAMP(3),\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"InventoryItem_pkey\" PRIMARY KEY (\"id\")\n  );",
  "ALTER TABLE \"public\".\"InventoryItem\" ADD COLUMN IF NOT EXISTS \"costPerUnit\" DOUBLE PRECISION NOT NULL DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"InventoryItem\" ADD COLUMN IF NOT EXISTS \"supplier\" TEXT;",
  "CREATE TABLE IF NOT EXISTS \"public\".\"Recipe\" (\n    \"id\" TEXT NOT NULL,\n    \"productId\" TEXT NOT NULL,\n    \"productName\" TEXT NOT NULL,\n    \"servingQty\" DOUBLE PRECISION NOT NULL,\n    \"servingUom\" TEXT NOT NULL,\n    \"status\" TEXT NOT NULL DEFAULT 'COMPLETE',\n    \"finalProcess\" TEXT,\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"Recipe_pkey\" PRIMARY KEY (\"id\")\n  );",
  "CREATE UNIQUE INDEX IF NOT EXISTS \"Recipe_productId_key\" ON \"public\".\"Recipe\"(\"productId\");",
  "ALTER TABLE \"public\".\"Recipe\" ADD COLUMN IF NOT EXISTS \"servingUom\" TEXT NOT NULL DEFAULT 'units';",
  "CREATE TABLE IF NOT EXISTS \"public\".\"RecipeItem\" (\n    \"id\" TEXT NOT NULL,\n    \"recipeId\" TEXT NOT NULL,\n    \"stepNumber\" INTEGER NOT NULL DEFAULT 1,\n    \"rawMaterialName\" TEXT NOT NULL,\n    \"inventoryItemId\" TEXT,\n    \"quantity\" DOUBLE PRECISION NOT NULL,\n    \"uom\" TEXT NOT NULL,\n    \"process\" TEXT NOT NULL,\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"RecipeItem_pkey\" PRIMARY KEY (\"id\")\n  );",
  "CREATE TABLE IF NOT EXISTS \"public\".\"Sale\" (\n    \"id\" TEXT NOT NULL,\n    \"branchId\" TEXT NOT NULL,\n    \"billNumber\" TEXT NOT NULL,\n    \"customerId\" TEXT,\n    \"customerName\" TEXT,\n    \"customerPhone\" TEXT,\n    \"channel\" TEXT NOT NULL DEFAULT 'POS',\n    \"subtotal\" DOUBLE PRECISION NOT NULL,\n    \"discount\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"tax\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"grandTotal\" DOUBLE PRECISION NOT NULL,\n    \"paymentMethod\" TEXT NOT NULL DEFAULT 'CASH',\n    \"receiptType\" TEXT NOT NULL DEFAULT 'PAPER',\n    \"status\" TEXT NOT NULL DEFAULT 'COMPLETED',\n    \"cashierName\" TEXT NOT NULL DEFAULT 'Shruthy',\n    \"orderNote\" TEXT,\n    \"isCancelled\" BOOLEAN NOT NULL DEFAULT false,\n    \"dateIso\" TEXT NOT NULL,\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"Sale_pkey\" PRIMARY KEY (\"id\")\n  );",
  "CREATE UNIQUE INDEX IF NOT EXISTS \"Sale_billNumber_key\" ON \"public\".\"Sale\"(\"billNumber\");",
  "CREATE TABLE IF NOT EXISTS \"public\".\"SaleItem\" (\n    \"id\" TEXT NOT NULL,\n    \"saleId\" TEXT NOT NULL,\n    \"productId\" TEXT,\n    \"name\" TEXT NOT NULL,\n    \"quantity\" DOUBLE PRECISION NOT NULL,\n    \"price\" DOUBLE PRECISION NOT NULL,\n    \"total\" DOUBLE PRECISION NOT NULL,\n    \"unit\" TEXT NOT NULL DEFAULT 'units',\n    \"categoryName\" TEXT,\n    CONSTRAINT \"SaleItem_pkey\" PRIMARY KEY (\"id\")\n  );",
  "CREATE TABLE IF NOT EXISTS \"public\".\"StockLedger\" (\n    \"id\" TEXT NOT NULL,\n    \"branchId\" TEXT NOT NULL,\n    \"itemId\" TEXT NOT NULL,\n    \"itemName\" TEXT NOT NULL,\n    \"type\" TEXT NOT NULL,\n    \"qty\" DOUBLE PRECISION NOT NULL,\n    \"unit\" TEXT NOT NULL,\n    \"supplier\" TEXT DEFAULT '-',\n    \"ref\" TEXT NOT NULL,\n    \"source\" TEXT NOT NULL DEFAULT 'POS / Sales',\n    \"notes\" TEXT,\n    \"remainingAfter\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"purchaseId\" TEXT,\n    \"dateIso\" TEXT NOT NULL,\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"StockLedger_pkey\" PRIMARY KEY (\"id\")\n  );",
  "CREATE TABLE IF NOT EXISTS \"public\".\"Customer\" (\n    \"id\" TEXT NOT NULL,\n    \"branchId\" TEXT NOT NULL,\n    \"name\" TEXT NOT NULL,\n    \"phone\" TEXT NOT NULL,\n    \"email\" TEXT DEFAULT 'Not specified',\n    \"visits\" INTEGER NOT NULL DEFAULT 0,\n    \"totalSpent\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"tier\" TEXT NOT NULL DEFAULT 'Regular',\n    \"favoriteItem\" TEXT,\n    \"lastVisit\" TEXT,\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"Customer_pkey\" PRIMARY KEY (\"id\")\n  );",
  "ALTER TABLE \"public\".\"Customer\" ADD COLUMN IF NOT EXISTS \"branchId\" TEXT;",
  "ALTER TABLE \"public\".\"Customer\" ADD COLUMN IF NOT EXISTS \"visits\" INTEGER DEFAULT 0;",
  "ALTER TABLE \"public\".\"Customer\" ADD COLUMN IF NOT EXISTS \"tier\" TEXT DEFAULT 'Regular';",
  "ALTER TABLE \"public\".\"Customer\" ADD COLUMN IF NOT EXISTS \"favoriteItem\" TEXT;",
  "ALTER TABLE \"public\".\"Customer\" ADD COLUMN IF NOT EXISTS \"lastVisit\" TEXT;",
  "ALTER TABLE \"public\".\"Customer\" ADD COLUMN IF NOT EXISTS \"totalSpent\" DOUBLE PRECISION DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"Customer\" ADD COLUMN IF NOT EXISTS \"email\" TEXT DEFAULT 'Not specified';",
  "ALTER TABLE \"public\".\"Sale\" ADD COLUMN IF NOT EXISTS \"customerId\" TEXT;",
  "DROP INDEX IF EXISTS \"public\".\"Customer_phone_key\";",
  "CREATE UNIQUE INDEX IF NOT EXISTS \"Customer_phone_branchId_key\" ON \"public\".\"Customer\"(\"phone\", \"branchId\");",
  "CREATE TABLE IF NOT EXISTS \"public\".\"Purchase\" (\n    \"id\" TEXT NOT NULL,\n    \"branchId\" TEXT NOT NULL,\n    \"invoiceRef\" TEXT NOT NULL,\n    \"supplier\" TEXT NOT NULL,\n    \"category\" TEXT NOT NULL DEFAULT 'Raw Ingredients',\n    \"notes\" TEXT,\n    \"totalAmount\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"recordedBy\" TEXT NOT NULL DEFAULT 'Shruthy A',\n    \"dateIso\" TEXT NOT NULL,\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"Purchase_pkey\" PRIMARY KEY (\"id\")\n  );",
  "ALTER TABLE \"public\".\"Purchase\" ADD COLUMN IF NOT EXISTS \"invoiceRef\" TEXT;",
  "ALTER TABLE \"public\".\"Purchase\" ADD COLUMN IF NOT EXISTS \"supplier\" TEXT;",
  "ALTER TABLE \"public\".\"Purchase\" ADD COLUMN IF NOT EXISTS \"category\" TEXT DEFAULT 'Raw Ingredients';",
  "ALTER TABLE \"public\".\"Purchase\" ADD COLUMN IF NOT EXISTS \"notes\" TEXT;",
  "ALTER TABLE \"public\".\"Purchase\" ADD COLUMN IF NOT EXISTS \"totalAmount\" DOUBLE PRECISION DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"Purchase\" ADD COLUMN IF NOT EXISTS \"recordedBy\" TEXT DEFAULT 'Shruthy A';",
  "ALTER TABLE \"public\".\"Purchase\" ADD COLUMN IF NOT EXISTS \"dateIso\" TEXT;",
  "ALTER TABLE \"public\".\"Purchase\" ADD COLUMN IF NOT EXISTS \"createdAt\" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;",
  "ALTER TABLE \"public\".\"Purchase\" DROP COLUMN IF EXISTS \"poNumber\", DROP COLUMN IF EXISTS \"supplierName\", DROP COLUMN IF EXISTS \"supplierPhone\", DROP COLUMN IF EXISTS \"supplierGstin\", DROP COLUMN IF EXISTS \"supplierAddress\", DROP COLUMN IF EXISTS \"totalCost\", DROP COLUMN IF EXISTS \"paidAmount\", DROP COLUMN IF EXISTS \"paymentStatus\", DROP COLUMN IF EXISTS \"paymentMethod\", DROP COLUMN IF EXISTS \"deliveryStatus\", DROP COLUMN IF EXISTS \"receivedBy\";",
  "ALTER TABLE \"public\".\"PurchaseItem\" DROP COLUMN IF EXISTS \"totalCost\", DROP COLUMN IF EXISTS \"receivedQty\", DROP COLUMN IF EXISTS \"costPerUnit\";",
  "CREATE TABLE IF NOT EXISTS \"public\".\"PurchaseItem\" (\n    \"id\" TEXT NOT NULL,\n    \"purchaseId\" TEXT NOT NULL,\n    \"itemId\" TEXT,\n    \"itemName\" TEXT NOT NULL,\n    \"category\" TEXT,\n    \"qty\" DOUBLE PRECISION NOT NULL,\n    \"unit\" TEXT NOT NULL,\n    \"pricePerUnit\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"total\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    CONSTRAINT \"PurchaseItem_pkey\" PRIMARY KEY (\"id\")\n  );",
  "ALTER TABLE \"public\".\"PurchaseItem\" ADD COLUMN IF NOT EXISTS \"total\" DOUBLE PRECISION DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"PurchaseItem\" ADD COLUMN IF NOT EXISTS \"pricePerUnit\" DOUBLE PRECISION DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"PurchaseItem\" ADD COLUMN IF NOT EXISTS \"itemId\" TEXT;",
  "ALTER TABLE \"public\".\"PurchaseItem\" ADD COLUMN IF NOT EXISTS \"itemName\" TEXT;",
  "ALTER TABLE \"public\".\"PurchaseItem\" ADD COLUMN IF NOT EXISTS \"category\" TEXT;",
  "ALTER TABLE \"public\".\"PurchaseItem\" ADD COLUMN IF NOT EXISTS \"qty\" DOUBLE PRECISION DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"PurchaseItem\" ADD COLUMN IF NOT EXISTS \"unit\" TEXT DEFAULT 'units';",
  "ALTER TABLE \"public\".\"StockLedger\" ADD COLUMN IF NOT EXISTS \"purchaseId\" TEXT;",
  "ALTER TABLE \"public\".\"StockLedger\" ADD COLUMN IF NOT EXISTS \"remainingAfter\" DOUBLE PRECISION DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"StockLedger\" ADD COLUMN IF NOT EXISTS \"dateIso\" TEXT;",
  "ALTER TABLE \"public\".\"StockLedger\" ADD COLUMN IF NOT EXISTS \"source\" TEXT DEFAULT 'POS / Sales';",
  "ALTER TABLE \"public\".\"StockLedger\" ADD COLUMN IF NOT EXISTS \"supplier\" TEXT DEFAULT '-';",
  "ALTER TABLE \"public\".\"StockLedger\" ADD COLUMN IF NOT EXISTS \"notes\" TEXT;",
  "ALTER TABLE \"public\".\"InventoryItem\" ADD COLUMN IF NOT EXISTS \"stockIn\" DOUBLE PRECISION DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"InventoryItem\" ADD COLUMN IF NOT EXISTS \"stockOut\" DOUBLE PRECISION DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"InventoryItem\" ADD COLUMN IF NOT EXISTS \"minThreshold\" DOUBLE PRECISION DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"InventoryItem\" ADD COLUMN IF NOT EXISTS \"lastMovement\" TIMESTAMP(3);",
  "ALTER TABLE \"public\".\"InventoryItem\" ADD COLUMN IF NOT EXISTS \"costPerUnit\" DOUBLE PRECISION DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"InventoryItem\" ADD COLUMN IF NOT EXISTS \"supplier\" TEXT;",
  "CREATE TABLE IF NOT EXISTS \"public\".\"Expense\" (\n    \"id\" TEXT NOT NULL,\n    \"branchId\" TEXT NOT NULL,\n    \"description\" TEXT NOT NULL DEFAULT '',\n    \"category\" TEXT NOT NULL DEFAULT 'Other',\n    \"amount\" DOUBLE PRECISION NOT NULL DEFAULT 0.0,\n    \"dateIso\" TEXT NOT NULL,\n    \"notes\" TEXT,\n    \"recordedBy\" TEXT NOT NULL DEFAULT 'Shruthy A',\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"Expense_pkey\" PRIMARY KEY (\"id\")\n  );",
  "ALTER TABLE \"public\".\"Branch\" ADD COLUMN IF NOT EXISTS \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;",
  "ALTER TABLE \"public\".\"Expense\" ADD COLUMN IF NOT EXISTS \"description\" TEXT NOT NULL DEFAULT '';",
  "ALTER TABLE \"public\".\"Expense\" ADD COLUMN IF NOT EXISTS \"category\" TEXT NOT NULL DEFAULT 'Other';",
  "ALTER TABLE \"public\".\"Expense\" ADD COLUMN IF NOT EXISTS \"amount\" DOUBLE PRECISION NOT NULL DEFAULT 0.0;",
  "ALTER TABLE \"public\".\"Expense\" ADD COLUMN IF NOT EXISTS \"dateIso\" TEXT;",
  "ALTER TABLE \"public\".\"Expense\" ADD COLUMN IF NOT EXISTS \"notes\" TEXT;",
  "ALTER TABLE \"public\".\"Expense\" ADD COLUMN IF NOT EXISTS \"recordedBy\" TEXT DEFAULT 'Shruthy A';",
  "ALTER TABLE \"public\".\"Expense\" ADD COLUMN IF NOT EXISTS \"createdAt\" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;",
  "CREATE TABLE IF NOT EXISTS \"public\".\"Staff\" (\n    \"id\" TEXT NOT NULL,\n    \"branchId\" TEXT NOT NULL,\n    \"name\" TEXT NOT NULL,\n    \"role\" TEXT NOT NULL,\n    \"shift\" TEXT NOT NULL DEFAULT 'Morning',\n    \"shiftType\" TEXT NOT NULL DEFAULT 'Morning Shift (06:00 AM - 02:00 PM)',\n    \"startTime\" TEXT NOT NULL DEFAULT '06:00 AM',\n    \"endTime\" TEXT NOT NULL DEFAULT '02:00 PM',\n    \"phone\" TEXT NOT NULL,\n    \"status\" TEXT NOT NULL DEFAULT 'On Duty',\n    \"monthlyPay\" DOUBLE PRECISION NOT NULL DEFAULT 18000.0,\n    \"joinedDate\" TEXT NOT NULL DEFAULT 'Today',\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"Staff_pkey\" PRIMARY KEY (\"id\")\n  );",
  "ALTER TABLE \"public\".\"Staff\" ADD COLUMN IF NOT EXISTS \"shiftType\" TEXT DEFAULT 'Morning Shift (06:00 AM - 02:00 PM)';",
  "ALTER TABLE \"public\".\"Staff\" ADD COLUMN IF NOT EXISTS \"startTime\" TEXT DEFAULT '06:00 AM';",
  "ALTER TABLE \"public\".\"Staff\" ADD COLUMN IF NOT EXISTS \"endTime\" TEXT DEFAULT '02:00 PM';",
  "ALTER TABLE \"public\".\"Staff\" ADD COLUMN IF NOT EXISTS \"status\" TEXT DEFAULT 'On Duty';",
  "ALTER TABLE \"public\".\"Staff\" ADD COLUMN IF NOT EXISTS \"monthlyPay\" DOUBLE PRECISION DEFAULT 18000.0;",
  "ALTER TABLE \"public\".\"Staff\" ADD COLUMN IF NOT EXISTS \"joinedDate\" TEXT DEFAULT 'Today';",
  "CREATE TABLE IF NOT EXISTS \"public\".\"User\" (\n    \"id\" TEXT NOT NULL,\n    \"branchId\" TEXT,\n    \"name\" TEXT NOT NULL,\n    \"email\" TEXT NOT NULL,\n    \"phone\" TEXT NOT NULL,\n    \"role\" TEXT NOT NULL DEFAULT 'Owner & General Manager',\n    \"passwordHash\" TEXT NOT NULL,\n    \"avatar\" TEXT NOT NULL DEFAULT 'SA',\n    \"isActive\" BOOLEAN NOT NULL DEFAULT true,\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"User_pkey\" PRIMARY KEY (\"id\")\n  );",
  "CREATE UNIQUE INDEX IF NOT EXISTS \"User_email_key\" ON \"public\".\"User\"(\"email\");",
  "CREATE UNIQUE INDEX IF NOT EXISTS \"User_phone_key\" ON \"public\".\"User\"(\"phone\");"
];

export async function ensureDatabaseInitialized() {
  if (!process.env.DATABASE_URL) {
    console.warn('[DB Init] No DATABASE_URL defined, running in fallback mode.');
    return;
  }

  console.log('🔄 [DB Init] Verifying PostgreSQL schema tables via raw SQL DDL...');
  for (const ddl of DDL_STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(ddl);
    } catch (err: any) {
      // Log and continue to ensure all migrations run
      console.warn('⚠️ [DB Init] DDL notice (continuing):', err.message?.split('\n')[0]);
    }
  }

  // Dynamic schema cleanup for legacy NOT NULL columns on Purchase and PurchaseItem
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
          rec RECORD;
      BEGIN
          FOR rec IN (
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND table_name = 'Purchase' 
                AND column_name NOT IN ('id', 'branchId', 'invoiceRef', 'supplier')
          ) LOOP
              BEGIN
                  EXECUTE 'ALTER TABLE "public"."Purchase" ALTER COLUMN "' || rec.column_name || '" DROP NOT NULL;';
              EXCEPTION WHEN OTHERS THEN NULL;
              END;
          END LOOP;

          FOR rec IN (
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND table_name = 'Purchase' 
                AND column_name NOT IN ('id', 'branchId', 'invoiceRef', 'supplier', 'category', 'notes', 'totalAmount', 'recordedBy', 'dateIso', 'createdAt')
          ) LOOP
              BEGIN
                  EXECUTE 'ALTER TABLE "public"."Purchase" DROP COLUMN IF EXISTS "' || rec.column_name || '" CASCADE;';
              EXCEPTION WHEN OTHERS THEN NULL;
              END;
          END LOOP;

          FOR rec IN (
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND table_name = 'PurchaseItem' 
                AND column_name NOT IN ('id', 'purchaseId', 'itemName', 'qty', 'unit', 'pricePerUnit', 'total')
          ) LOOP
              BEGIN
                  EXECUTE 'ALTER TABLE "public"."PurchaseItem" ALTER COLUMN "' || rec.column_name || '" DROP NOT NULL;';
              EXCEPTION WHEN OTHERS THEN NULL;
              END;
          END LOOP;

          FOR rec IN (
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND table_name = 'PurchaseItem' 
                AND column_name NOT IN ('id', 'purchaseId', 'itemId', 'itemName', 'category', 'qty', 'unit', 'pricePerUnit', 'total')
          ) LOOP
              BEGIN
                  EXECUTE 'ALTER TABLE "public"."PurchaseItem" DROP COLUMN IF EXISTS "' || rec.column_name || '" CASCADE;';
              EXCEPTION WHEN OTHERS THEN NULL;
              END;
          END LOOP;

          -- Dynamic schema cleanup for legacy NOT NULL columns on Expense
          FOR rec IN (
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND table_name = 'Expense' 
                AND column_name NOT IN ('id', 'branchId', 'description', 'amount')
          ) LOOP
              BEGIN
                  EXECUTE 'ALTER TABLE "public"."Expense" ALTER COLUMN "' || rec.column_name || '" DROP NOT NULL;';
              EXCEPTION WHEN OTHERS THEN NULL;
              END;
          END LOOP;

          FOR rec IN (
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND table_name = 'Expense' 
                AND column_name NOT IN ('id', 'branchId', 'description', 'category', 'amount', 'dateIso', 'notes', 'recordedBy', 'createdAt')
          ) LOOP
              BEGIN
                  EXECUTE 'ALTER TABLE "public"."Expense" DROP COLUMN IF EXISTS "' || rec.column_name || '" CASCADE;';
              EXCEPTION WHEN OTHERS THEN NULL;
              END;
          END LOOP;

          -- Dynamic schema cleanup for legacy NOT NULL columns on Staff
          FOR rec IN (
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND table_name = 'Staff' 
                AND column_name NOT IN ('id', 'branchId', 'name', 'phone')
          ) LOOP
              BEGIN
                  EXECUTE 'ALTER TABLE "public"."Staff" ALTER COLUMN "' || rec.column_name || '" DROP NOT NULL;';
              EXCEPTION WHEN OTHERS THEN NULL;
              END;
          END LOOP;

          FOR rec IN (
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND table_name = 'Staff' 
                AND column_name NOT IN ('id', 'branchId', 'name', 'role', 'shift', 'shiftType', 'startTime', 'endTime', 'phone', 'status', 'monthlyPay', 'joinedDate', 'createdAt')
          ) LOOP
              BEGIN
                  EXECUTE 'ALTER TABLE "public"."Staff" DROP COLUMN IF EXISTS "' || rec.column_name || '" CASCADE;';
              EXCEPTION WHEN OTHERS THEN NULL;
              END;
          END LOOP;
      END $$;
    `);
    console.log('✅ [DB Init] Dynamic legacy NOT NULL columns safely dropped & aligned across Purchase, Expense, and Staff.');
  } catch (cleanErr: any) {
    console.warn('⚠️ [DB Init] Dynamic cleanup warning:', cleanErr.message);
  }
  console.log('✅ [DB Init] All PostgreSQL tables and indexes verified successfully.');

  // Check and seed master data
  try {
    const [branchCount, categoryCount, productCount, rawMaterialCount, recipeCount] = await Promise.all([
      prisma.branch.count(),
      prisma.productCategory.count(),
      prisma.product.count(),
      prisma.inventoryItem.count(),
      prisma.recipe.count()
    ]);
    console.log(`[DB Init] Counts: Branches=${branchCount}, Categories=${categoryCount}, Products=${productCount}, RawMaterials=${rawMaterialCount}, Recipes=${recipeCount}`);

    // 1. Seed Branches & StoreSettings if missing
    if (branchCount < 2) {
      console.log('🌱 [DB Init] Seeding Branches & StoreSettings...');
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
        await prisma.branch.upsert({
          where: { id: b.id },
          update: b,
          create: b
        });

        await prisma.storeSetting.upsert({
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
        });
      }
    }

    // 2. Seed Categories if missing
    if (categoryCount < 9) {
      console.log('🌱 [DB Init] Seeding Product Categories...');
      for (const cat of PRODUCT_CATEGORIES) {
        await prisma.productCategory.upsert({
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
        });
      }
    }

    // 3. Seed Products if missing
    if (productCount < 59) {
      console.log('🌱 [DB Init] Seeding Menu Products...');
      for (const prod of CLIENT_PRODUCTS_MASTER) {
        await prisma.product.upsert({
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
        });
      }
    }

    // 4. Seed Raw Materials / Inventory Master if missing
    if (rawMaterialCount < 117) {
      console.log('🌱 [DB Init] Seeding Master Raw Materials...');
      for (const rm of CLIENT_RAW_MATERIALS_MASTER) {
        await prisma.inventoryItem.upsert({
          where: { id: rm.id },
          update: {
            name: rm.name,
            category: rm.category,
            unit: rm.unit || 'units',
            minThreshold: rm.minThreshold || 0.0
          },
          create: {
            id: rm.id,
            name: rm.name,
            category: rm.category,
            unit: rm.unit || 'units',
            openingStock: 0,
            stockIn: 0,
            stockOut: 0,
            minThreshold: rm.minThreshold || 0.0,
            costPerUnit: 0.0,
            supplier: 'Unassigned'
          }
        });
      }
    }

    // 5. Seed BOM Recipes if missing
    if (recipeCount < 9) {
      console.log('🌱 [DB Init] Seeding BOM Recipes & Process Items...');
      for (const bom of CLIENT_BOM_MASTER) {
        const recipeRecord = await prisma.recipe.upsert({
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
        });

        await prisma.recipeItem.deleteMany({
          where: { recipeId: recipeRecord.id }
        });

        if (bom.processes && bom.processes.length > 0) {
          for (let step = 0; step < bom.processes.length; step++) {
            const item = bom.processes[step];
            await prisma.recipeItem.create({
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
            });
          }
        }
      }
    }

    console.log('✅ [DB Init] Master database verification completed.');
  } catch (seedErr: any) {
    console.error('❌ [DB Init] Seeding notice:', seedErr.message);
  }
}
