// Kanchivaram Café Master DB & PostgreSQL Prisma Service
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { 
  PRODUCT_CATEGORIES, 
  CLIENT_PRODUCTS_MASTER, 
  CLIENT_RAW_MATERIALS_MASTER, 
  CLIENT_BOM_MASTER,
  ClientProductMaster,
  ClientInventoryMaster,
  ClientBOMMaster
} from './data/masterData';

// Load environment variables
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'server/.env') });

export const prisma = new PrismaClient({
  log: ['warn', 'error']
});

// Verify connection
prisma.$connect()
  .then(() => {
    console.log('✅ [PostgreSQL] Connected successfully to database via Prisma.');
  })
  .catch((err) => {
    console.error('❌ [PostgreSQL] Database connection failed:', err.message);
  });

// Re-export Master Data
export { 
  PRODUCT_CATEGORIES, 
  CLIENT_PRODUCTS_MASTER, 
  CLIENT_RAW_MATERIALS_MASTER, 
  CLIENT_BOM_MASTER 
};

export interface SaleRecord {
  id: string;
  branchId: string;
  billNumber: string;
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'ONLINE';
  receiptType: 'PAPER' | 'DIGITAL';
  customerPhone?: string;
  customerName?: string;
  cashierName: string;
  status: string;
  channel: 'IN_STORE' | 'POS' | 'SWIGGY' | 'ZOMATO' | 'DIRECT_ONLINE';
  createdAt: string;
  dateIso: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    unit?: string;
    categoryName?: string;
  }[];
  bomDeductionsApplied?: boolean;
}

export interface StockLedgerEntry {
  id: string;
  branchId: string;
  itemId: string;
  itemName: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
  qty: number;
  unit: string;
  supplier: string;
  ref: string;
  source: string;
  notes: string;
  remainingAfter: number;
  purchaseId?: string;
  dateIso: string;
  createdAt: string;
}

// Multi-Branch In-Memory State Container (for runtime cache & fallbacks)
export class BranchDataManager {
  branches: Record<string, {
    products: ClientProductMaster[];
    inventoryItems: ClientInventoryMaster[];
    recipes: ClientBOMMaster[];
    categories: typeof PRODUCT_CATEGORIES;
    sales: SaleRecord[];
    ledger: StockLedgerEntry[];
  }>;

  constructor() {
    this.branches = {
      'branch-1': this.createBranchState('branch-1'),
      'branch-2': this.createBranchState('branch-2')
    };
  }

  private createBranchState(branchId: string) {
    return {
      products: CLIENT_PRODUCTS_MASTER.map(p => ({ ...p })),
      inventoryItems: CLIENT_RAW_MATERIALS_MASTER.map(rm => ({ ...rm })),
      recipes: CLIENT_BOM_MASTER.map(b => ({ ...b })),
      categories: [...PRODUCT_CATEGORIES],
      sales: [],
      ledger: []
    };
  }

  getBranchData(branchId: string = 'branch-1') {
    if (!this.branches[branchId]) {
      this.branches[branchId] = this.createBranchState(branchId);
    }
    return this.branches[branchId];
  }
}

export const branchDb = new BranchDataManager();

// Backward compatibility references for existing routes
export const mockCategories = PRODUCT_CATEGORIES;
export const mockProducts = CLIENT_PRODUCTS_MASTER;
export const mockRawMaterials = CLIENT_RAW_MATERIALS_MASTER;
export const mockBOMRecipes = CLIENT_BOM_MASTER;
export const mockSalesHistory: SaleRecord[] = [];
