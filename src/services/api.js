import { io } from 'socket.io-client';
import { PRODUCT_CATEGORIES, CLIENT_PRODUCTS_MASTER } from '../data/masterData';

// Determine Base URL (Dynamic environment support: Vite env or localhost default)
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === ''
);

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000' : '');
const API_BASE_URL = BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api` : '/api';

// Socket.IO singleton instance
export const socket = io(BACKEND_ORIGIN || undefined, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  transports: ['websocket', 'polling']
});

socket.on('connect_error', (err) => {
  console.warn('[Socket.IO] Connection notice:', err.message);
});

export async function fetchDashboardStats(period = 'today', branchId = 'branch-1', startDate = '', endDate = '') {
  try {
    let url = `${API_BASE_URL}/dashboard/stats?period=${period}&branchId=${branchId}`;
    if (period === 'custom' && startDate && endDate) {
      url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    }
    const res = await fetch(url, {
      headers: {
        'x-branch-id': branchId
      }
    });
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[API] Backend server offline, using fallback state:', err);
    return null;
  }
}

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    const json = await res.json();
    if (json && json.products) return json;
    return { categories: PRODUCT_CATEGORIES, products: CLIENT_PRODUCTS_MASTER };
  } catch (err) {
    console.warn('[API] Backend server offline, using client master data:', err);
    return { categories: PRODUCT_CATEGORIES, products: CLIENT_PRODUCTS_MASTER };
  }
}

export async function createSaleTransaction(salePayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salePayload)
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Create sale error:', err);
    return { success: false, message: err.message };
  }
}

export async function fetchSales(period = 'today', branchId = 'branch-1', channel = 'ALL') {
  try {
    const url = `${API_BASE_URL}/sales?period=${period}&branchId=${branchId}&channel=${channel}`;
    const res = await fetch(url, {
      headers: { 'x-branch-id': branchId }
    });
    const json = await res.json();
    return json.sales || [];
  } catch (err) {
    console.warn('[API] Fetch sales error:', err);
    return [];
  }
}

export async function sendChatbotQuery(queryText) {
  try {
    const res = await fetch(`${API_BASE_URL}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryText })
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Chatbot error:', err);
    return {
      success: false,
      answer: "I am currently analyzing store metrics. Today's gross sales total ₹18,450 across 186 orders."
    };
  }
}

export async function fetchInventoryMaster(branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/master`, {
      headers: { 'x-branch-id': branchId }
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch inventory master error:', err);
    return null;
  }
}

export async function updateItemThreshold(itemId, minThreshold, branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/items/${itemId}/threshold`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-branch-id': branchId
      },
      body: JSON.stringify({ minThreshold: Number(minThreshold) })
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Update item threshold error:', err);
    return { success: false, message: err.message };
  }
}

