import { execSync } from 'child_process';
import { prisma } from './db';
import { 
  PRODUCT_CATEGORIES, 
  CLIENT_PRODUCTS_MASTER, 
  CLIENT_RAW_MATERIALS_MASTER, 
  CLIENT_BOM_MASTER 
} from './data/masterData';

export async function ensureDatabaseInitialized() {
  if (!process.env.DATABASE_URL) {
    console.warn('[DB Init] No DATABASE_URL defined, running in memory fallback.');
    return;
  }

  console.log('🔄 [DB Init] Checking and synchronizing PostgreSQL schema with Neon...');
  try {
    // 1. Push schema to PostgreSQL so all tables exist
    execSync('npx prisma db push --schema=server/prisma/schema.prisma --accept-data-loss', {
      stdio: 'inherit',
      env: process.env
    });
    console.log('✅ [DB Init] Prisma schema push completed successfully.');
  } catch (pushErr: any) {
    console.error('❌ [DB Init] Prisma db push error:', pushErr.message);
  }

  // 2. Check and seed master data if empty
  try {
    const productCount = await prisma.product.count();
    console.log([DB Init] Current product count in PostgreSQL: );

    if (productCount < 59) {
      console.log('🌱 [DB Init] Seeding Branches, Categories, Products, Inventory & BOM...');
      
      // Seed branches
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

      // Seed categories
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

      // Seed products
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

      // Seed inventory raw materials
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

      // Seed Recipes / BOM
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

        // Delete existing items for clean recreate
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
    console.error('❌ [DB Init] Seeding error:', seedErr.message);
  }
}
