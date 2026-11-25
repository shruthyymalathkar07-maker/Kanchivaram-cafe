// Kanchivaram Café — WhatsApp Business API Service (Meta Cloud API & Interakt BSP)
import dotenv from 'dotenv';

dotenv.config();

export interface DigitalReceiptPayload {
  billNumber: string;
  customerName?: string | null;
  customerPhone: string;
  items: {
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    unit?: string;
  }[];
  subtotal: number;
  tax: number;
  discount?: number;
  grandTotal: number;
  paymentMethod: string;
  channel?: string;
  cashierName?: string;
  dateIso?: string;
  branchName?: string;
  branchId?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  message: string;
  messageId?: string;
  isMock?: boolean;
  formattedText?: string;
}

/**
 * Normalizes phone number to standard E.164 format for WhatsApp (+91 for India).
 */
export function normalizeWhatsAppNumber(rawPhone: string): string {
  const digitsOnly = (rawPhone || '').replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly;
  }
  return digitsOnly;
}

/**
 * Formats a clean, professional, branded WhatsApp digital receipt message.
 */
export function formatReceiptMessage(receipt: DigitalReceiptPayload): string {
  const branchTitle = receipt.branchName || (receipt.branchId === 'branch-2' ? 'City Branch - Anna Salai' : 'Main Branch - Gandhi Road');
  const custName = (receipt.customerName && receipt.customerName.trim() && !receipt.customerName.includes('Customer'))
    ? receipt.customerName.trim()
    : 'Valued Guest';

  const itemsList = receipt.items.map(item => {
    const qty = item.quantity || 1;
    const price = item.subtotal || (item.unitPrice * qty);
    return `• ${qty}x ${item.productName} — ₹${price.toFixed(2)}`;
  }).join('\n');

  const discountLine = (receipt.discount && receipt.discount > 0)
    ? `\nDiscount: -₹${receipt.discount.toFixed(2)}`
    : '';

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
`🍵 *KANCHIVARAM CAFÉ*
📍 *${branchTitle}*
━━━━━━━━━━━━━━━━━━━━
🧾 *E-RECEIPT #${receipt.billNumber}*
📅 *Date:* ${today}
👤 *Customer:* ${custName}
━━━━━━━━━━━━━━━━━━━━
*ITEMS ORDERED:*
${itemsList}
━━━━━━━━━━━━━━━━━━━━
Subtotal: ₹${receipt.subtotal.toFixed(2)}${discountLine}
${receipt.tax > 0 ? `GST / Taxes: ₹${receipt.tax.toFixed(2)}` : 'Taxes: ₹0.00'}
*TOTAL PAID: ₹${receipt.grandTotal.toFixed(2)}*
*Payment Mode:* ${receipt.paymentMethod || 'CASH'}
━━━━━━━━━━━━━━━━━━━━
✨ _Good Food, Happier People!_
_Thank you for dining with us!_`
  );
}

/**
 * Sends a digital receipt to the customer's WhatsApp.
 * Supports Meta Cloud API, Interakt BSP, or Mock Development Mode.
 */
export async function sendWhatsAppReceipt(receipt: DigitalReceiptPayload): Promise<WhatsAppSendResult> {
  const formattedPhone = normalizeWhatsAppNumber(receipt.customerPhone);
  if (!formattedPhone || formattedPhone.length < 10) {
    return {
      success: false,
      message: 'Invalid customer phone number provided for WhatsApp digital receipt.'
    };
  }

  const messageText = formatReceiptMessage(receipt);

  const provider = (process.env.WHATSAPP_PROVIDER || 'mock').trim().toLowerCase();
  const metaToken = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_API_KEY || process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;
  const interaktApiKey = process.env.INTERAKT_API_KEY;

  const isMockMode = (
    provider === 'mock' ||
    (!metaToken && !interaktApiKey) ||
    metaToken === 'YOUR_WHATSAPP_TOKEN' ||
    interaktApiKey === 'YOUR_INTERAKT_API_KEY'
  );

  // 1. Mock Development Mode (Logs formatted WhatsApp bill to console)
  if (isMockMode) {
    console.log('\n============================================================');
    console.log(`📱 [WHATSAPP DIGITAL RECEIPT] Dispatched to +${formattedPhone}:`);
    console.log('------------------------------------------------------------');
    console.log(messageText);
    console.log('============================================================\n');

    return {
      success: true,
      message: `Digital receipt dispatched to WhatsApp (+${formattedPhone}) [Trial / Mock Mode].`,
      messageId: `mock_wa_${Date.now()}`,
      isMock: true,
      formattedText: messageText
    };
  }

  // 2. Meta WhatsApp Cloud API
  if (metaToken && phoneNumberId) {
    try {
      const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: messageText
          }
        })
      });

      const data: any = await response.json().catch(() => ({}));

      if (response.ok && data?.messages?.[0]?.id) {
        return {
          success: true,
          message: 'Digital receipt sent via WhatsApp successfully.',
          messageId: data.messages[0].id,
          isMock: false
        };
      }

      console.warn('[Meta WhatsApp Error]', data?.error?.message || data);
      return {
        success: false,
        message: data?.error?.message || 'Failed to deliver receipt via WhatsApp Cloud API.'
      };
    } catch (err: any) {
      console.error('[Meta WhatsApp Network Error]', err.message);
      return {
        success: false,
        message: 'Network error connecting to WhatsApp Cloud API.'
      };
    }
  }

  // 3. Interakt WhatsApp BSP
  if (interaktApiKey) {
    try {
      const response = await fetch('https://api.interakt.ai/v1/public/message/', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${interaktApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          countryCode: '+91',
          phoneNumber: formattedPhone.slice(-10),
          type: 'Text',
          data: {
            message: messageText
          }
        })
      });

      const data: any = await response.json().catch(() => ({}));
      if (response.ok && data?.result) {
        return {
          success: true,
          message: 'Digital receipt sent via Interakt WhatsApp successfully.',
          messageId: data.id || `interakt_${Date.now()}`,
          isMock: false
        };
      }

      return {
        success: false,
        message: data?.message || 'Failed to deliver receipt via Interakt.'
      };
    } catch (err: any) {
      console.error('[Interakt Network Error]', err.message);
      return {
        success: false,
        message: 'Network error connecting to Interakt API.'
      };
    }
  }

  return {
    success: true,
    message: 'Receipt logged in trial mode.',
    isMock: true
  };
}

/**
 * Sends a 6-digit Login Authentication OTP via WhatsApp.
 */
export async function sendWhatsAppAuthOtp(mobile: string, otp: string): Promise<WhatsAppSendResult> {
  const formattedPhone = normalizeWhatsAppNumber(mobile);
  if (!formattedPhone || formattedPhone.length < 10) {
    return {
      success: false,
      message: 'Invalid mobile number for OTP dispatch.'
    };
  }

  const messageText = (
`🔐 *KANCHIVARAM CAFÉ*
*Password Reset Verification*
━━━━━━━━━━━━━━━━━━━━
Your 6-digit login OTP code is:

👉 *${otp}*

⏰ Valid for *10 minutes*.
⚠️ _Do not share this code with anyone._`
  );

  const provider = (process.env.WHATSAPP_PROVIDER || 'mock').trim().toLowerCase();
  const metaToken = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_API_KEY || process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;

  if (provider === 'mock' || !metaToken || !phoneNumberId) {
    console.log(`📱 [WHATSAPP OTP] Sent to +${formattedPhone} | Code: ${otp}`);
    return {
      success: true,
      message: `OTP sent via WhatsApp to +${formattedPhone} [Trial Mode: ${otp}]`,
      isMock: true
    };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${metaToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: messageText
        }
      })
    });

    const data: any = await response.json().catch(() => ({}));
    if (response.ok && data?.messages?.[0]?.id) {
      return {
        success: true,
        message: 'OTP sent via WhatsApp successfully.',
        messageId: data.messages[0].id
      };
    }

    return {
      success: false,
      message: data?.error?.message || 'Failed to dispatch WhatsApp OTP.'
    };
  } catch (err: any) {
    console.error('[WhatsApp OTP Error]', err.message);
    return {
      success: false,
      message: 'Failed to communicate with WhatsApp service.'
    };
  }
}
