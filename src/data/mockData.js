// Mock Data for Kanchivaram Cafe Dashboard & Inventory System

export const salesOverview = {
  today: {
    totalSales: 18450,
    posSales: 12000,
    onlineSales: 6450,
    growthPercent: 12.4,
    totalOrders: 186,
    productsSold: 421,
    totalDiscounts: 1320,
    totalTaxes: 982.5,
    chartData: [
      { time: '07:00 AM', sales: 850, pos: 600, online: 250 },
      { time: '09:00 AM', sales: 2400, pos: 1800, online: 600 },
      { time: '11:00 AM', sales: 3900, pos: 2900, online: 1000 },
      { time: '01:00 PM', sales: 6800, pos: 4200, online: 2600 },
      { time: '03:00 PM', sales: 9400, pos: 6100, online: 3300 },
      { time: '05:00 PM', sales: 13800, pos: 8900, online: 4900 },
      { time: '06:55 PM', sales: 18450, pos: 12000, online: 6450 },
    ]
  },
  week: {
    totalSales: 124500,
    posSales: 82000,
    onlineSales: 42500,
    growthPercent: 8.7,
    totalOrders: 1280,
    productsSold: 2940,
    totalDiscounts: 8900,
    totalTaxes: 6620,
    chartData: [
      { time: 'Mon', sales: 16200, pos: 11000, online: 5200 },
      { time: 'Tue', sales: 18450, pos: 12000, online: 6450 },
      { time: 'Wed', sales: 17100, pos: 11500, online: 5600 },
      { time: 'Thu', sales: 19300, pos: 12800, online: 6500 },
      { time: 'Fri', sales: 22400, pos: 14500, online: 7900 },
      { time: 'Sat', sales: 25800, pos: 16800, online: 9000 },
      { time: 'Sun', sales: 25250, pos: 16400, online: 8850 },
    ]
  },
  month: {
    totalSales: 540000,
    posSales: 355000,
    onlineSales: 185000,
    growthPercent: 15.2,
    totalOrders: 5400,
    productsSold: 12800,
    totalDiscounts: 36000,
    totalTaxes: 28500,
    chartData: [
      { time: 'Week 1', sales: 122000, pos: 80000, online: 42000 },
      { time: 'Week 2', sales: 134000, pos: 88000, online: 46000 },
      { time: 'Week 3', sales: 139000, pos: 91000, online: 48000 },
      { time: 'Week 4', sales: 145000, pos: 96000, online: 49000 },
    ]
  }
};

export const onlinePlatformsData = [
  {
    id: 'swiggy',
    name: 'Swiggy',
    logo: '🛵',
    color: '#e67e22',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    grossSales: 3850,
    commissionRate: 18,
    commissionAmount: 693,
    taxes: 192.50,
    discounts: 350,
    netSales: 2614.50,
    ordersCount: 28,
    popularItem: 'Filter Coffee + Ghee Roast Combo'
  },
  {
    id: 'zomato',
    name: 'Zomato',
    logo: '🔴',
    color: '#cb202d',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    grossSales: 2600,
    commissionRate: 18,
    commissionAmount: 468,
    taxes: 130.00,
    discounts: 220,
    netSales: 1782.00,
    ordersCount: 19,
    popularItem: 'Special Mysore Masala Dosa'
  },
  {
    id: 'magicpin',
    name: 'Magicpin / Ondoor',
    logo: '⚡',
    color: '#8e44ad',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    grossSales: 1200,
    commissionRate: 12,
    commissionAmount: 144,
    taxes: 60.00,
    discounts: 100,
    netSales: 896.00,
    ordersCount: 9,
    popularItem: 'Idli Vada Platter'
  }
];

export const posCollectionData = {
  cash: 7200,
  upi: 3800,
  card: 1000,
  totalPOS: 12000,
  ordersCount: 130
};

export const stockPipelineSummary = {
  receivedToday: 120,
  totalAvailable: 320,
  soldUsedToday: 86,
  totalRemaining: 234,
  lowStockCount: 4,
  lowStockItems: [
    { name: 'Milk', remaining: '8 L' },
    { name: 'Coffee Beans', remaining: '2 kg' },
    { name: 'Ghee', remaining: '1.5 kg' },
    { name: 'Paneer', remaining: '3 kg' }
  ]
};

import { CLIENT_RAW_MATERIALS_MASTER, CLIENT_PRODUCTS_MASTER, PRODUCT_CATEGORIES } from './masterData';

export const initialInventory = CLIENT_RAW_MATERIALS_MASTER;
export { CLIENT_PRODUCTS_MASTER, PRODUCT_CATEGORIES };

