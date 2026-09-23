import { PrismaClient } from '@prisma/client';
import { 
  PRODUCT_CATEGORIES, 
  CLIENT_PRODUCTS_MASTER, 
  CLIENT_RAW_MATERIALS_MASTER, 
  CLIENT_BOM_MASTER 
} from '../src/data/masterData';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seed: Kanchivaram Café PostgreSQL ---');

  // 1. Branches Master
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
    console.log(`[Seed] Branch: ${b.name} (${b.id})`);
  }

  // 2. Store Settings
  for (const b of branches) {
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

  // 3. Product Categories Master (9 Categories)
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
    console.log(`[Seed] Category: ${cat.name} (${cat.id})`);
  }

  // 4. Products Master (59 Products)
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
  console.log(`[Seed] 59 Products successfully upserted.`);

  // 5. Raw Materials / Inventory Master (117 Items, 0 opening stock)
  for (const rm of CLIENT_RAW_MATERIALS_MASTER) {
    await prisma.inventoryItem.upsert({
      where: { id: rm.id },
      update: {
        name: rm.name,
        category: rm.category,
        unit: rm.unit || 'units',
        openingStock: 0,
        costPerUnit: 0,
        minThreshold: 0,
        supplier: rm.supplier || 'Unassigned'
      },
      create: {
        id: rm.id,
        name: rm.name,
        category: rm.category,
        unit: rm.unit || 'units',
        openingStock: 0,
        stockIn: 0,
        stockOut: 0,
        costPerUnit: 0,
        minThreshold: 0,
        supplier: rm.supplier || 'Unassigned'
      }
    });
  }
  console.log(`[Seed] 117 Raw Material Items successfully upserted with 0 opening stock.`);

  // 6. BOM Recipes Master
  for (const bom of CLIENT_BOM_MASTER) {
    const recipe = await prisma.recipe.upsert({
      where: { productId: bom.productId },
      update: {
        productName: bom.productName,
        servingQty: bom.servingQty,
        servingUom: bom.servingUom,
        status: bom.status,
        finalProcess: bom.finalProcess
      },
      create: {
        productId: bom.productId,
        productName: bom.productName,
        servingQty: bom.servingQty,
        servingUom: bom.servingUom,
        status: bom.status,
        finalProcess: bom.finalProcess
      }
    });

    // Delete existing recipe items for clean upsert
    await prisma.recipeItem.deleteMany({
      where: { recipeId: recipe.id }
    });

    if (bom.processes && bom.processes.length > 0) {
      for (const p of bom.processes) {
        await prisma.recipeItem.create({
          data: {
            recipeId: recipe.id,
            stepNumber: p.step,
            rawMaterialName: p.rawMaterialName,
            inventoryItemId: p.rawMaterialId,
            quantity: p.qty,
            uom: p.uom,
            process: p.process
          }
        });
      }
    }
    console.log(`[Seed] Recipe: ${bom.productName} (${bom.status}, ${bom.processes.length} steps)`);
  }

  console.log('--- Phase 1A Seed Complete ---');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
