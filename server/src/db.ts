// Kanchivaram Café Master DB & PostgreSQL Prisma Service
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { 
  PRODUCT_CATEGORIES, 
  CLIENT_PRODUCTS_MASTER, 
  CLIENT_RAW_MATERIALS_MASTER, 
  CLIENT_BOM_MASTER,
  ORIGINAL_PRODUCT_IDS,
  isOriginalProduct,
  ClientProductMaster,
  ClientInventoryMaster,
  ClientBOMMaster,
  normalizeUnit
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
  CLIENT_BOM_MASTER,
  ORIGINAL_PRODUCT_IDS,
  isOriginalProduct,
  normalizeUnit
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
  orderNote?: string | null;
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

export interface BranchIntegrations {
  whatsappToken: string;
  whatsappPhoneId: string;
  smsApiKey: string;
  swiggyRestaurantId: string;
  swiggyApiKey: string;
  zomatoMerchantId: string;
  zomatoApiKey: string;
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
  integrations: Record<string, BranchIntegrations>;
  settings: Record<string, any>;

  constructor() {
    this.branches = {
      'branch-1': this.createBranchState('branch-1'),
      'branch-2': this.createBranchState('branch-2')
    };
    this.integrations = {
      'branch-1': {
        whatsappToken: process.env.WHATSAPP_TOKEN || '',
        whatsappPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        smsApiKey: process.env.FAST2SMS_API_KEY || process.env.TWO_FACTOR_API_KEY || '',
        swiggyRestaurantId: process.env.SWIGGY_RESTAURANT_ID || 'SWIGGY-KCB-MAIN',
        swiggyApiKey: process.env.SWIGGY_API_KEY || '',
        zomatoMerchantId: process.env.ZOMATO_MERCHANT_ID || 'ZOMATO-KCB-MAIN',
        zomatoApiKey: process.env.ZOMATO_API_KEY || ''
      },
      'branch-2': {
        whatsappToken: process.env.WHATSAPP_TOKEN || '',
        whatsappPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        smsApiKey: process.env.FAST2SMS_API_KEY || process.env.TWO_FACTOR_API_KEY || '',
        swiggyRestaurantId: process.env.SWIGGY_RESTAURANT_ID_CITY || 'SWIGGY-KCB-CITY',
        swiggyApiKey: process.env.SWIGGY_API_KEY_CITY || '',
        zomatoMerchantId: process.env.ZOMATO_MERCHANT_ID_CITY || 'ZOMATO-KCB-CITY',
        zomatoApiKey: process.env.ZOMATO_API_KEY_CITY || ''
      }
    };
    this.settings = {
      'branch-1': {
        branchId: 'branch-1',
        storeName: 'Kanchivaram Café',
        branchName: 'Main Branch - Gandhi Road',
        gstin: '',
        fssaiNo: '12421008000142',
        contactPhone: '+91 98765 43210',
        contactEmail: 'contact@kanchivaram.cafe',
        cgstPercent: 0.0,
        sgstPercent: 0.0,
        autoPrintReceipt: true,
        defaultPaymentMode: 'CASH'
      },
      'branch-2': {
        branchId: 'branch-2',
        storeName: 'Kanchivaram Café',
        branchName: 'City Branch - Anna Salai',
        gstin: '',
        fssaiNo: '12421008000142',
        contactPhone: '+91 98765 43210',
        contactEmail: 'contact@kanchivaram.cafe',
        cgstPercent: 0.0,
        sgstPercent: 0.0,
        autoPrintReceipt: true,
        defaultPaymentMode: 'CASH'
      }
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

  getIntegrations(branchId: string = 'branch-1'): BranchIntegrations {
    if (!this.integrations[branchId]) {
      this.integrations[branchId] = {
        whatsappToken: '',
        whatsappPhoneId: '',
        smsApiKey: '',
        swiggyRestaurantId: `SWIGGY-${branchId.toUpperCase()}`,
        swiggyApiKey: '',
        zomatoMerchantId: `ZOMATO-${branchId.toUpperCase()}`,
        zomatoApiKey: ''
      };
    }
    return this.integrations[branchId];
  }

  updateIntegrations(branchId: string = 'branch-1', updates: Partial<BranchIntegrations>): BranchIntegrations {
    const current = this.getIntegrations(branchId);
    this.integrations[branchId] = {
      ...current,
      ...updates
    };
    return this.integrations[branchId];
  }

  getSettings(branchId: string = 'branch-1') {
    if (!this.settings[branchId]) {
      this.settings[branchId] = {
        branchId,
        storeName: 'Kanchivaram Café',
        branchName: branchId === 'branch-2' ? 'City Branch - Anna Salai' : 'Main Branch - Gandhi Road',
        gstin: '',
        fssaiNo: '12421008000142',
        contactPhone: '+91 98765 43210',
        contactEmail: 'contact@kanchivaram.cafe',
        cgstPercent: 0.0,
        sgstPercent: 0.0,
        autoPrintReceipt: true,
        defaultPaymentMode: 'CASH'
      };
    }
    return this.settings[branchId];
  }

  updateSettings(branchId: string = 'branch-1', updates: Record<string, any>) {
    const current = this.getSettings(branchId);
    this.settings[branchId] = {
      ...current,
      ...updates
    };
    return this.settings[branchId];
  }
}

export const branchDb = new BranchDataManager();

// Backward compatibility references for existing routes
export const mockCategories = PRODUCT_CATEGORIES;
export const mockProducts = CLIENT_PRODUCTS_MASTER;
export const mockRawMaterials = CLIENT_RAW_MATERIALS_MASTER;
export const mockBOMRecipes = CLIENT_BOM_MASTER;
export const mockSalesHistory: SaleRecord[] = [];
