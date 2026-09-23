import { Router, Request, Response } from 'express';
import { 
  prisma,
  branchDb, 
  PRODUCT_CATEGORIES, 
  CLIENT_PRODUCTS_MASTER, 
  CLIENT_RAW_MATERIALS_MASTER, 
  CLIENT_BOM_MASTER,
  SaleRecord,
  StockLedgerEntry
} from '../db';
import { Server as SocketServer } from 'socket.io';

export function createApiRouter(io: SocketServer) {
  const router = Router();

  // Helper to extract branch from request header or query
  const getBranchId = (req: Request): string => {
    return (req.headers['x-branch-id'] as string) || (req.query.branchId as string) || 'branch-1';
  };

  // 1. GET /api/branches (Returns configured branches and store settings)
  router.get('/branches', async (req: Request, res: Response) => {
    try {
      if (prisma) {
        const branches = await prisma.branch.findMany({
          include: { settings: true }
        });
        if (branches.length > 0) {
          return res.json({ success: true, count: branches.length, branches });
        }
      }
    } catch (err: any) {
      console.warn('[API /branches] PostgreSQL query fallback:', err.message);
    }

    // Fallback response
    res.json({
      success: true,
      count: 2,
      branches: [
        { id: 'branch-1', name: 'Main Branch - Gandhi Road', badge: 'Main Branch', location: 'Gandhi Road', status: 'Operational (Live)' },
        { id: 'branch-2', name: 'City Branch - Anna Salai', badge: 'City Branch', location: 'Anna Salai', status: 'Operational (Live)' }
      ]
    });
  });

  // 2. GET /api/categories (Returns 9 Product Categories)
  router.get('/categories', async (req: Request, res: Response) => {
    try {
      if (prisma) {
        const categories = await prisma.productCategory.findMany({
          orderBy: { displayOrder: 'asc' }
        });
        if (categories.length > 0) {
          return res.json({ success: true, count: categories.length, categories });
        }
      }
    } catch (err: any) {
      console.warn('[API /categories] PostgreSQL query fallback:', err.message);
    }

    res.json({ success: true, count: PRODUCT_CATEGORIES.length, categories: PRODUCT_CATEGORIES });
  });

  // 3. GET /api/products (Returns exact 59 Menu Products & 9 Categories from PostgreSQL)
  router.get('/products', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const [dbProducts, dbCategories] = await Promise.all([
          prisma.product.findMany({ orderBy: { id: 'asc' } }),
          prisma.productCategory.findMany({ orderBy: { displayOrder: 'asc' } })
        ]);

        if (dbProducts.length > 0) {
          const mappedProducts = dbProducts.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.categoryName,
            categoryName: p.categoryName,
            categoryId: p.categoryId,
            servingQty: p.servingQty,
            uom: p.uom,
            dineInPrice: p.dineInPrice,
            deliveryPrice: p.deliveryPrice,
            packingCharge: p.packingCharge,
            description: p.description,
            price: p.dineInPrice,
            unit: p.uom,
            stockQuantity: 40,
            image: p.image || `/dishes/${p.id}.jpg`
          }));

          return res.json({
            success: true,
            branchId,
            totalCount: mappedProducts.length, // 59
            categories: dbCategories,          // 9
            products: mappedProducts
          });
        }
      }
    } catch (err: any) {
      console.warn('[API /products] PostgreSQL query fallback:', err.message);
    }

    const branchData = branchDb.getBranchData(branchId);
    res.json({
      success: true,
      branchId,
      totalCount: branchData.products.length, // 59
      categories: branchData.categories,      // 9
      products: branchData.products
    });
  });

  // 4. GET /api/inventory/master (Returns exact 117 Raw Material Master Items from PostgreSQL)
  router.get('/inventory/master', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const dbItems = await prisma.inventoryItem.findMany({
          orderBy: { id: 'asc' }
        });

        if (dbItems.length > 0) {
          return res.json({
            success: true,
            branchId,
            totalCount: dbItems.length, // 117
            items: dbItems
          });
        }
      }
    } catch (err: any) {
      console.warn('[API /inventory/master] PostgreSQL query fallback:', err.message);
    }

    const branchData = branchDb.getBranchData(branchId);
    res.json({
      success: true,
      branchId,
      totalCount: branchData.inventoryItems.length, // 117
      items: branchData.inventoryItems
    });
  });

  // 5. GET /api/recipes (Returns BOM / Recipes Master: 2 Complete, 7 Awaiting Details from PostgreSQL)
  router.get('/recipes', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const dbRecipes = await prisma.recipe.findMany({
          include: {
            items: {
              orderBy: { stepNumber: 'asc' }
            }
          }
        });

        if (dbRecipes.length > 0) {
          const completeRecipes = dbRecipes.filter(r => r.status === 'COMPLETE');
          const pendingRecipes = dbRecipes.filter(r => r.status === 'AWAITING_RECIPE_DETAILS');

          const formattedRecipes = dbRecipes.map(r => ({
            productId: r.productId,
            productName: r.productName,
            servingQty: r.servingQty,
            servingUom: r.servingUom,
            status: r.status,
            finalProcess: r.finalProcess,
            processes: r.items.map(item => ({
              step: item.stepNumber,
              rawMaterialName: item.rawMaterialName,
              rawMaterialId: item.inventoryItemId,
              qty: item.quantity,
              uom: item.uom,
              process: item.process
            }))
          }));

          return res.json({
            success: true,
            branchId,
            totalCount: formattedRecipes.length, // 9
            completeCount: completeRecipes.length,  // 2
            pendingCount: pendingRecipes.length,    // 7
            recipes: formattedRecipes
          });
        }
      }
    } catch (err: any) {
      console.warn('[API /recipes] PostgreSQL query fallback:', err.message);
    }

    const branchData = branchDb.getBranchData(branchId);
    const completeRecipes = branchData.recipes.filter(r => r.status === 'COMPLETE');
    const pendingRecipes = branchData.recipes.filter(r => r.status === 'AWAITING_RECIPE_DETAILS');

    res.json({
      success: true,
      branchId,
      totalCount: branchData.recipes.length, // 9
      completeCount: completeRecipes.length,  // 2
      pendingCount: pendingRecipes.length,    // 7
      recipes: branchData.recipes
    });
  });

  // 6. POST /api/sales (Create Bill Transaction & Execute BOM Stock Deductions in PostgreSQL)
  router.post('/sales', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    const branchData = branchDb.getBranchData(branchId);
    const { items, subtotal, tax, discount, grandTotal, paymentMethod, receiptType, customerPhone, customerName, cashierName, channel } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    const billNumber = `KC-2026-${1000 + Date.now().toString().slice(-4)}`;
    const todayIso = new Date().toISOString().split('T')[0];
    const saleId = `sale-${Date.now()}`;

    const newSale: SaleRecord = {
      id: saleId,
      branchId,
      billNumber,
      subtotal: parseFloat(subtotal) || 0,
      tax: parseFloat(tax) || 0,
      discount: parseFloat(discount || 0),
      grandTotal: parseFloat(grandTotal) || 0,
      paymentMethod: paymentMethod || 'CASH',
      receiptType: receiptType || 'PAPER',
      customerPhone,
      customerName,
      cashierName: cashierName || 'Shruthy',
      status: 'COMPLETED',
      channel: channel || 'POS',
      createdAt: new Date().toISOString(),
      dateIso: todayIso,
      items: items.map((item: any) => ({
        productId: item.id || item.productId,
        productName: item.name || item.productName,
        quantity: parseFloat(item.quantity || item.qty || 1),
        unitPrice: parseFloat(item.price || item.unitPrice || 0),
        subtotal: parseFloat(item.total || ((item.price || 0) * (item.quantity || 1))),
        unit: item.unit || 'units',
        categoryName: item.categoryName || item.category || 'General'
      })),
      bomDeductionsApplied: false
    };

    // POS → INVENTORY BOM LOGIC
    const appliedDeductions: { rawMaterial: string; qtyDeducted: number; uom: string; product: string }[] = [];

    // Attempt DB persistence
    try {
      if (!prisma) {
        return res.status(503).json({
          success: false,
          error: 'DATABASE_UNAVAILABLE',
          message: 'PostgreSQL database connection is unavailable. Transaction aborted for data safety.'
        });
      }

      // Fetch recipes to check for BOM deduction
      const dbRecipes = await prisma.recipe.findMany({
        include: { items: true }
      });

      for (const saleItem of newSale.items) {
        const matchedBOM = dbRecipes.find(r => 
          (r.productId === saleItem.productId) || 
          (r.productName.toLowerCase() === saleItem.productName.toLowerCase())
        );

        if (matchedBOM && matchedBOM.status === 'COMPLETE' && matchedBOM.items.length > 0) {
          newSale.bomDeductionsApplied = true;

          for (const proc of matchedBOM.items) {
            const totalRawQty = proc.quantity * saleItem.quantity;
            
            if (proc.inventoryItemId) {
              await prisma.inventoryItem.update({
                where: { id: proc.inventoryItemId },
                data: {
                  stockOut: { increment: totalRawQty },
                  lastMovement: new Date()
                }
              });

              await prisma.stockLedger.create({
                data: {
                  id: `MV-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
                  branchId,
                  itemId: proc.inventoryItemId,
                  itemName: proc.rawMaterialName,
                  type: 'STOCK_OUT',
                  qty: totalRawQty,
                  unit: proc.uom,
                  supplier: '-',
                  ref: billNumber,
                  source: 'POS / Recipe BOM',
                  notes: `BOM Consumption: ${saleItem.quantity} x ${saleItem.productName} (${proc.process})`,
                  remainingAfter: 0,
                  dateIso: todayIso
                }
              });
            }

            appliedDeductions.push({
              rawMaterial: proc.rawMaterialName,
              qtyDeducted: totalRawQty,
              uom: proc.uom,
              product: saleItem.productName
            });
          }
        }
      }

      // Persist Sale and SaleItems to PostgreSQL
      await prisma.sale.create({
        data: {
          id: saleId,
          branchId,
          billNumber,
          customerPhone,
          customerName,
          channel: newSale.channel,
          subtotal: newSale.subtotal,
          discount: newSale.discount,
          tax: newSale.tax,
          grandTotal: newSale.grandTotal,
          paymentMethod: newSale.paymentMethod,
          receiptType: newSale.receiptType,
          status: 'COMPLETED',
          cashierName: newSale.cashierName,
          dateIso: todayIso,
          items: {
            create: newSale.items.map(item => ({
              productId: item.productId,
              name: item.productName,
              quantity: item.quantity,
              price: item.unitPrice,
              total: item.subtotal,
              unit: item.unit,
              categoryName: item.categoryName
            }))
          }
        }
      });

      // Emit Socket.IO live updates to connected POS clients
      io.emit('sale_created', { sale: newSale, branchId, deductions: appliedDeductions });

      return res.status(201).json({
        success: true,
        message: 'Sale finalized and persisted to PostgreSQL successfully',
        sale: newSale,
        appliedDeductions
      });
    } catch (dbErr: any) {
      console.error('[Sale Creation DB Error]:', dbErr.message);
      return res.status(500).json({
        success: false,
        error: 'DATABASE_TRANSACTION_FAILED',
        message: 'Failed to write transaction to PostgreSQL database. Transaction was not recorded.',
        details: dbErr.message
      });
    }
  });

  // 7. GET /api/dashboard/stats (Aggregated KPI Analytics)
  router.get('/dashboard/stats', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    const period = (req.query.period as string) || 'today';
    const todayIso = new Date().toISOString().split('T')[0];

    try {
      if (prisma) {
        const sales = await prisma.sale.findMany({
          where: {
            branchId,
            ...(period === 'today' ? { dateIso: todayIso } : {})
          },
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        });

        const totalSales = sales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
        const posSales = sales.filter(s => s.channel === 'POS' || s.channel === 'IN_STORE').reduce((acc, s) => acc + s.grandTotal, 0);
        const onlineSales = sales.filter(s => s.channel !== 'POS' && s.channel !== 'IN_STORE').reduce((acc, s) => acc + s.grandTotal, 0);
        const totalDiscounts = sales.reduce((acc, s) => acc + (s.discount || 0), 0);
        const totalTax = sales.reduce((acc, s) => acc + (s.tax || 0), 0);
        const netSales = Math.max(0, totalSales - totalTax - totalDiscounts);

        const cashCollected = sales.filter(s => s.paymentMethod === 'CASH').reduce((acc, s) => acc + s.grandTotal, 0);
        const upiCollected = sales.filter(s => s.paymentMethod === 'UPI').reduce((acc, s) => acc + s.grandTotal, 0);
        const cardCollected = sales.filter(s => s.paymentMethod === 'CARD').reduce((acc, s) => acc + s.grandTotal, 0);
        const productsSold = sales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0);

        return res.json({
          success: true,
          branchId,
          data: {
            period,
            kpis: {
              totalSales: {
                amount: Math.round(totalSales),
                growth: 0,
                inStore: Math.round(posSales),
                online: Math.round(onlineSales),
                orderCount: sales.length
              },
              netSales: {
                amount: Math.round(netSales),
                overallNet: Math.round(netSales),
                inStoreNet: Math.round(posSales),
                onlineNet: Math.round(onlineSales)
              },
              discounts: {
                amount: Math.round(totalDiscounts),
                transactionCount: sales.filter(s => (s.discount || 0) > 0).length
              },
              cashCollection: {
                amount: Math.round(cashCollected),
                upiAmount: Math.round(upiCollected),
                cardAmount: Math.round(cardCollected)
              },
              onlineSales: {
                amount: Math.round(onlineSales),
                orderCount: sales.filter(s => s.channel !== 'POS' && s.channel !== 'IN_STORE').length
              }
            },
            productsSold,
            recentTransactions: sales.slice(0, 10)
          }
        });
      }
    } catch (err: any) {
      console.warn('[API /dashboard/stats] DB query fallback:', err.message);
    }

    const branchData = branchDb.getBranchData(branchId);
    const periodSales = branchData.sales.filter(s => {
      if (period === 'today') return s.dateIso === todayIso;
      return true;
    });

    const totalSales = periodSales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
    const posSales = periodSales.filter(s => s.channel === 'POS' || s.channel === 'IN_STORE').reduce((acc, s) => acc + s.grandTotal, 0);
    const onlineSales = periodSales.filter(s => s.channel !== 'POS' && s.channel !== 'IN_STORE').reduce((acc, s) => acc + s.grandTotal, 0);
    const totalDiscounts = periodSales.reduce((acc, s) => acc + (s.discount || 0), 0);
    const totalTax = periodSales.reduce((acc, s) => acc + (s.tax || 0), 0);
    const netSales = Math.max(0, totalSales - totalTax - totalDiscounts);

    const cashCollected = periodSales.filter(s => s.paymentMethod === 'CASH').reduce((acc, s) => acc + s.grandTotal, 0);
    const upiCollected = periodSales.filter(s => s.paymentMethod === 'UPI').reduce((acc, s) => acc + s.grandTotal, 0);
    const cardCollected = periodSales.filter(s => s.paymentMethod === 'CARD').reduce((acc, s) => acc + s.grandTotal, 0);
    const productsSold = periodSales.reduce((acc, s) => acc + (s.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0), 0);

    res.json({
      success: true,
      branchId,
      data: {
        period,
        kpis: {
          totalSales: {
            amount: Math.round(totalSales),
            growth: 0,
            inStore: Math.round(posSales),
            online: Math.round(onlineSales),
            orderCount: periodSales.length
          },
          netSales: {
            amount: Math.round(netSales),
            overallNet: Math.round(netSales),
            inStoreNet: Math.round(posSales),
            onlineNet: Math.round(onlineSales)
          },
          discounts: {
            amount: Math.round(totalDiscounts),
            transactionCount: periodSales.filter(s => (s.discount || 0) > 0).length
          },
          cashCollection: {
            amount: Math.round(cashCollected),
            upiAmount: Math.round(upiCollected),
            cardAmount: Math.round(cardCollected)
          },
          onlineSales: {
            amount: Math.round(onlineSales),
            orderCount: periodSales.filter(s => s.channel !== 'POS' && s.channel !== 'IN_STORE').length
          }
        },
        productsSold,
        recentTransactions: periodSales.slice(0, 10)
      }
    });
  });

  return router;
}
