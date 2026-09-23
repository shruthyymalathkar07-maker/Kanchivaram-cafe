import { prisma } from './db';
import { 
  PRODUCT_CATEGORIES, 
  CLIENT_PRODUCTS_MASTER, 
  CLIENT_RAW_MATERIALS_MASTER, 
  CLIENT_BOM_MASTER 
} from './data/masterData';

const DDL_STATEMENTS = [
  CREATE TABLE IF NOT EXISTS public.Branch (
    id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    badge TEXT NOT NULL,
    location TEXT NOT NULL,
    fullAddress TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Operational (Live)',
    tablesCount INTEGER NOT NULL DEFAULT 24,
    posTerminals INTEGER NOT NULL DEFAULT 3,
    accentColor TEXT NOT NULL DEFAULT '#0D3B2E',
    badgeBg TEXT NOT NULL DEFAULT 'bg-[#0D3B2E]',
    badgeText TEXT NOT NULL DEFAULT 'text-white',
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT Branch_pkey PRIMARY KEY (id)
  );,
  CREATE UNIQUE INDEX IF NOT EXISTS Branch_code_key ON public.Branch(code);,

  CREATE TABLE IF NOT EXISTS public.StoreSetting (
    id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    branchId TEXT NOT NULL,
    storeName TEXT NOT NULL DEFAULT 'Kanchivaram Café',
    branchName TEXT NOT NULL,
    gstin TEXT NOT NULL DEFAULT '33AAACK1234F1Z9',
    fssaiNo TEXT NOT NULL DEFAULT '12421008000142',
    contactPhone TEXT NOT NULL DEFAULT '+91 98765 43210',
    contactEmail TEXT NOT NULL DEFAULT 'contact@kanchivaram.cafe',
    cgstPercent DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    sgstPercent DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    autoPrintReceipt BOOLEAN NOT NULL DEFAULT true,
    defaultPaymentMode TEXT NOT NULL DEFAULT 'CASH',
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT StoreSetting_pkey PRIMARY KEY (id)
  );,
  CREATE UNIQUE INDEX IF NOT EXISTS StoreSetting_branchId_key ON public.StoreSetting(branchId);,

  CREATE TABLE IF NOT EXISTS public.ProductCategory (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '✨',
    displayOrder INTEGER NOT NULL DEFAULT 0,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ProductCategory_pkey PRIMARY KEY (id)
  );,
  CREATE UNIQUE INDEX IF NOT EXISTS ProductCategory_name_key ON public.ProductCategory(name);,
  CREATE UNIQUE INDEX IF NOT EXISTS ProductCategory_slug_key ON public.ProductCategory(slug);,

  CREATE TABLE IF NOT EXISTS public.Product (
    id TEXT NOT NULL,
    branchId TEXT,
    categoryId TEXT NOT NULL,
    categoryName TEXT NOT NULL,
    name TEXT NOT NULL,
    servingQty DOUBLE PRECISION NOT NULL,
    uom TEXT NOT NULL,
    dineInPrice DOUBLE PRECISION NOT NULL,
    deliveryPrice DOUBLE PRECISION NOT NULL,
    packingCharge DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    description TEXT,
    image TEXT,
    isAvailable BOOLEAN NOT NULL DEFAULT true,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT Product_pkey PRIMARY KEY (id)
  );,

  CREATE TABLE IF NOT EXISTS public.InventoryItem (
    id TEXT NOT NULL,
    branchId TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    openingStock DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    stockIn DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    stockOut DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    wasteSpoilage DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    minThreshold DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    pricePerUnit DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    department TEXT NOT NULL DEFAULT 'Kitchen',
    lastMovement TIMESTAMP(3),
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT InventoryItem_pkey PRIMARY KEY (id)
  );,

  CREATE TABLE IF NOT EXISTS public.Recipe (
    id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    productId TEXT NOT NULL,
    productName TEXT NOT NULL,
    category TEXT NOT NULL,
    servingQty DOUBLE PRECISION NOT NULL,
    uom TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETE',
    finalProcess TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT Recipe_pkey PRIMARY KEY (id)
  );,
  CREATE UNIQUE INDEX IF NOT EXISTS Recipe_productId_key ON public.Recipe(productId);,

  CREATE TABLE IF NOT EXISTS public.RecipeItem (
    id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    recipeId TEXT NOT NULL,
    stepNumber INTEGER NOT NULL DEFAULT 1,
    rawMaterialName TEXT NOT NULL,
    inventoryItemId TEXT,
    quantity DOUBLE PRECISION NOT NULL,
    uom TEXT NOT NULL,
    process TEXT NOT NULL,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT RecipeItem_pkey PRIMARY KEY (id)
  );,

  CREATE TABLE IF NOT EXISTS public.Sale (
    id TEXT NOT NULL,
    branchId TEXT NOT NULL,
    billNumber TEXT NOT NULL,
    customerId TEXT,
    customerName TEXT,
    customerPhone TEXT,
    channel TEXT NOT NULL DEFAULT 'POS',
    subtotal DOUBLE PRECISION NOT NULL,
    discount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    tax DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    grandTotal DOUBLE PRECISION NOT NULL,
    paymentMethod TEXT NOT NULL DEFAULT 'CASH',
    receiptType TEXT NOT NULL DEFAULT 'PAPER',
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    cashierName TEXT NOT NULL DEFAULT 'Shruthy',
    orderNote TEXT,
    isCancelled BOOLEAN NOT NULL DEFAULT false,
    dateIso TEXT NOT NULL,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT Sale_pkey PRIMARY KEY (id)
  );,
  CREATE UNIQUE INDEX IF NOT EXISTS Sale_billNumber_key ON public.Sale(billNumber);,

  CREATE TABLE IF NOT EXISTS public.SaleItem (
    id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    saleId TEXT NOT NULL,
    productId TEXT,
    name TEXT NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    total DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL DEFAULT 'units',
    categoryName TEXT,
    CONSTRAINT SaleItem_pkey PRIMARY KEY (id)
  );,

  CREATE TABLE IF NOT EXISTS public.StockLedger (
    id TEXT NOT NULL,
    branchId TEXT NOT NULL,
    itemId TEXT NOT NULL,
    itemName TEXT NOT NULL,
    type TEXT NOT NULL,
    qty DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    supplier TEXT DEFAULT '-',
    ref TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'POS / Sales',
    notes TEXT,
    remainingAfter DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    purchaseId TEXT,
    dateIso TEXT NOT NULL,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT StockLedger_pkey PRIMARY KEY (id)
  );,

  CREATE TABLE IF NOT EXISTS public.Customer (
    id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    branchId TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    loyaltyPoints INTEGER NOT NULL DEFAULT 0,
    totalOrders INTEGER NOT NULL DEFAULT 0,
    totalSpent DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    lastOrderDate TIMESTAMP(3),
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT Customer_pkey PRIMARY KEY (id)
  );,
  CREATE UNIQUE INDEX IF NOT EXISTS Customer_phone_key ON public.Customer(phone);,

  CREATE TABLE IF NOT EXISTS public.Purchase (
    id TEXT NOT NULL,
    branchId TEXT NOT NULL,
    poNumber TEXT NOT NULL,
    supplierName TEXT NOT NULL,
    supplierPhone TEXT,
    invoiceNumber TEXT,
    subtotal DOUBLE PRECISION NOT NULL,
    gstAmount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    grandTotal DOUBLE PRECISION NOT NULL,
    paymentStatus TEXT NOT NULL DEFAULT 'PAID',
    paymentMethod TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    status TEXT NOT NULL DEFAULT 'RECEIVED',
    receivedBy TEXT NOT NULL DEFAULT 'Shruthy',
    notes TEXT,
    dateIso TEXT NOT NULL,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT Purchase_pkey PRIMARY KEY (id)
  );,
  CREATE UNIQUE INDEX IF NOT EXISTS Purchase_poNumber_key ON public.Purchase(poNumber);,

  CREATE TABLE IF NOT EXISTS public.PurchaseItem (
    id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    purchaseId TEXT NOT NULL,
    inventoryItemId TEXT NOT NULL,
    itemName TEXT NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    unitCost DOUBLE PRECISION NOT NULL,
    totalCost DOUBLE PRECISION NOT NULL,
    CONSTRAINT PurchaseItem_pkey PRIMARY KEY (id)
  );,

  CREATE TABLE IF NOT EXISTS public.Expense (
    id TEXT NOT NULL,
    branchId TEXT NOT NULL,
    voucherNo TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    paymentMethod TEXT NOT NULL DEFAULT 'CASH',
    paidTo TEXT,
    authorizedBy TEXT NOT NULL DEFAULT 'Shruthy',
    notes TEXT,
    dateIso TEXT NOT NULL,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT Expense_pkey PRIMARY KEY (id)
  );,
  CREATE UNIQUE INDEX IF NOT EXISTS Expense_voucherNo_key ON public.Expense(voucherNo);,

  CREATE TABLE IF NOT EXISTS public.Staff (
    id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    branchId TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    salary DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    shift TEXT NOT NULL DEFAULT 'MORNING',
    isActive BOOLEAN NOT NULL DEFAULT true,
    joinDate TEXT NOT NULL,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT Staff_pkey PRIMARY KEY (id)
  );,

  CREATE TABLE IF NOT EXISTS public.User (
    id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    branchId TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Owner & General Manager',
    passwordHash TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT 'SA',
    isActive BOOLEAN NOT NULL DEFAULT true,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT User_pkey PRIMARY KEY (id)
  );,
  CREATE UNIQUE INDEX IF NOT EXISTS User_email_key ON public.User(email);,
  CREATE UNIQUE INDEX IF NOT EXISTS User_phone_key ON public.User(phone);
];

export async function ensureDatabaseInitialized() {
  if (!process.env.DATABASE_URL) {
    console.warn('[DB Init] No DATABASE_URL defined, running in fallback mode.');
    return;
  }

  console.log('🔄 [DB Init] Verifying PostgreSQL schema tables via raw SQL DDL...');
  try {
    for (const ddl of DDL_STATEMENTS) {
      await prisma.(ddl);
    }
    console.log('✅ [DB Init] All PostgreSQL tables and indexes verified successfully.');
  } catch (err: any) {
    console.error('❌ [DB Init] DDL execution notice:', err.message);
  }

  // Check and seed master data if empty
  try {
    const productCount = await prisma.product.count();
    console.log([DB Init] Current product count in PostgreSQL: );

    if (productCount < 59) {
      console.log('🌱 [DB Init] Seeding Branches, Categories, Products, Inventory & BOM...');
      
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

      for (const rm of CLIENT_RAW_MATERIALS_MASTER) {
        await prisma.inventoryItem.upsert({
          where: { id: rm.id },
          update: {
            name: rm.name,
            category: rm.category,
            unit: rm.unit || 'units',
            minThreshold: rm.minThreshold || 5,
            pricePerUnit: rm.pricePerUnit || 10,
            department: rm.department || 'Kitchen'
          },
          create: {
            id: rm.id,
            name: rm.name,
            category: rm.category,
            unit: rm.unit || 'units',
            openingStock: 0,
            stockIn: 0,
            stockOut: 0,
            wasteSpoilage: 0,
            minThreshold: rm.minThreshold || 5,
            pricePerUnit: rm.pricePerUnit || 10,
            department: rm.department || 'Kitchen'
          }
        });
      }

      for (const bom of CLIENT_BOM_MASTER) {
        const recipeRecord = await prisma.recipe.upsert({
          where: { productId: bom.productId },
          update: {
            productName: bom.productName,
            status: bom.status,
            category: bom.category,
            servingQty: bom.servingQty,
            uom: bom.uom,
            finalProcess: bom.finalProcess || ''
          },
          create: {
            productId: bom.productId,
            productName: bom.productName,
            status: bom.status,
            category: bom.category,
            servingQty: bom.servingQty,
            uom: bom.uom,
            finalProcess: bom.finalProcess || ''
          }
        });

        await prisma.recipeItem.deleteMany({
          where: { recipeId: recipeRecord.id }
        });

        if (bom.items && bom.items.length > 0) {
          for (let step = 0; step < bom.items.length; step++) {
            const item = bom.items[step];
            await prisma.recipeItem.create({
              data: {
                recipeId: recipeRecord.id,
                stepNumber: step + 1,
                rawMaterialName: item.rawMaterialName,
                inventoryItemId: item.inventoryItemId,
                quantity: item.quantity,
                uom: item.uom,
                process: item.process
              }
            });
          }
        }
      }

      console.log('✅ [DB Init] Master data successfully initialized and seeded into PostgreSQL.');
    } else {
      console.log('✅ [DB Init] Master data already populated in PostgreSQL.');
    }
  } catch (seedErr: any) {
    console.error('❌ [DB Init] Seeding notice:', seedErr.message);
  }
}
