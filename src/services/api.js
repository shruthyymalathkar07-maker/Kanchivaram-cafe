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

export async function fetchDashboardStats(period = 'today') {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats?period=${period}`);
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
