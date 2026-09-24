import { io } from 'socket.io-client';
import { PRODUCT_CATEGORIES, CLIENT_PRODUCTS_MASTER } from '../data/masterData';

// Determine Base URL (Dynamic environment support: Vite env or localhost default)
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === ''
);

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000' : 'https://kanchivaram-cafe.onrender.com');
const API_BASE_URL = BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api` : 'https://kanchivaram-cafe.onrender.com/api';

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

export async function fetchInventoryPurchases(branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/purchases`, {
      headers: { 'x-branch-id': branchId }
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch purchases error:', err);
    return null;
  }
}

export async function fetchStockLedger(branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/ledger`, {
      headers: { 'x-branch-id': branchId }
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch ledger error:', err);
    return null;
  }
}

export async function createPurchaseStockIn(purchasePayload, branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-branch-id': branchId
      },
      body: JSON.stringify(purchasePayload)
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Create purchase stock in error:', err);
    return { success: false, message: err.message };
  }
}

export async function createInventoryItem(itemPayload, branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-branch-id': branchId
      },
      body: JSON.stringify(itemPayload)
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Create inventory item error:', err);
    return { success: false, message: err.message };
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

export async function fetchCustomers(branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      headers: {
        'x-branch-id': branchId
      }
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch customers error:', err);
    return { success: false, customers: [] };
  }
}

export async function createCustomer(customerPayload, branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-branch-id': branchId
      },
      body: JSON.stringify(customerPayload)
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Create customer error:', err);
    return { success: false, message: err.message };
  }
}

export async function deleteCustomer(customerId, branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
      method: 'DELETE',
      headers: {
        'x-branch-id': branchId
      }
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Delete customer error:', err);
    return { success: false, message: err.message };
  }
}

export async function fetchExpenses(branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
      headers: {
        'x-branch-id': branchId
      }
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch expenses error:', err);
    return { success: false, expenses: [] };
  }
}

export async function createExpense(expensePayload, branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-branch-id': branchId
      },
      body: JSON.stringify(expensePayload)
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Create expense error:', err);
    return { success: false, message: err.message };
  }
}

export async function updateExpense(id, expensePayload, branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-branch-id': branchId
      },
      body: JSON.stringify(expensePayload)
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Update expense error:', err);
    return { success: false, message: err.message };
  }
}

export async function deleteExpense(id, branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'x-branch-id': branchId
      }
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Delete expense error:', err);
    return { success: false, message: err.message };
  }
}

// -------------------------------------------------------------
// STAFF & SHIFTS API SERVICES (PostgreSQL Connected)
// -------------------------------------------------------------

export async function fetchStaff(branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/staff?branchId=${branchId}`, {
      headers: {
        'x-branch-id': branchId
      }
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Fetch staff error:', err);
    return { success: false, staff: [] };
  }
}

export async function createStaff(staffPayload, branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-branch-id': branchId
      },
      body: JSON.stringify(staffPayload)
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Create staff error:', err);
    return { success: false, message: err.message };
  }
}

export async function updateStaff(id, staffPayload, branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-branch-id': branchId
      },
      body: JSON.stringify(staffPayload)
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Update staff error:', err);
    return { success: false, message: err.message };
  }
}

export async function deleteStaff(id, branchId = 'branch-1') {
  try {
    const res = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'DELETE',
      headers: {
        'x-branch-id': branchId
      }
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Delete staff error:', err);
    return { success: false, message: err.message };
  }
}





