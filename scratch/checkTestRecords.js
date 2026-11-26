const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({ 
    include: { items: true }, 
    orderBy: { createdAt: 'desc' }, 
    take: 10 
  });
  console.log('=== LIVE SALES IN DATABASE ===', sales.length);
  sales.forEach(s => {
    console.log(`[Sale] #${s.billNumber} | ₹${s.grandTotal} | ${s.customerName || 'No Name'} | Phone: ${s.customerPhone} | Created: ${s.createdAt}`);
    s.items.forEach(i => console.log(`   -> ${i.quantity}x ${i.productName} (₹${i.unitPrice})`));
  });

  const ledger = await prisma.stockLedger.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 20 
  });
  console.log('\n=== LIVE STOCK LEDGER IN DATABASE ===', ledger.length);
  ledger.forEach(l => {
    console.log(`[Ledger] ${l.itemName} | Type: ${l.movementType} | Qty: ${l.quantity} | Ref: ${l.reference || l.orderId} | Reason: ${l.reason} | Time: ${l.createdAt}`);
  });

  const inventoryMoved = await prisma.inventoryItem.findMany({
    where: {
      OR: [
        { stockOut: { gt: 0 } },
        { stockIn: { gt: 0 } }
      ]
    }
  });
  console.log('\n=== INVENTORY ITEMS WITH MOVEMENTS ===', inventoryMoved.length);
  inventoryMoved.forEach(im => {
    console.log(`[Inv] ${im.name} (${im.id}) | StockIn: ${im.stockIn} | StockOut: ${im.stockOut}`);
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Check error:', err);
  process.exit(1);
});
