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
  channel?: string;
  fallbackTriggered?: boolean;
}

export interface IntegrationCredentials {
  whatsappProvider?: string;
  interaktApiKey?: string;
  whatsappToken?: string;
  whatsappPhoneId?: string;
  smsApiKey?: string;
}

export interface SmsSendResult {
  success: boolean;
  message: string;
  messageId?: string;
  isMock?: boolean;
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
 * Formats a concise, branded SMS receipt within 160 characters.
 */
export function formatSmsReceiptMessage(receipt: DigitalReceiptPayload): string {
  const branchTitle = receipt.branchName || (receipt.branchId === 'branch-2' ? 'City Branch' : 'Main Branch');
  const total = Number(receipt.grandTotal || 0).toFixed(2);
  const cust = (receipt.customerName && receipt.customerName.trim() && !receipt.customerName.includes('Customer'))
    ? ` Dear ${receipt.customerName.trim()},`
    : '';
  return `Kanchivaram Cafe (${branchTitle}):${cust} Thank you for your visit! Bill #${receipt.billNumber} of Rs.${total} is generated. Good Food, Happier People!`;
}

/**
 * Sends a digital receipt via standard SMS (Fast2SMS or 2Factor).
 */
export async function sendSmsReceipt(
  cleanPhone: string,
  receipt: DigitalReceiptPayload,
  explicitApiKey?: string
): Promise<SmsSendResult> {
  const phone10 = cleanPhone.replace(/\D/g, '').slice(-10);
  if (phone10.length !== 10) {
    return { success: false, message: 'Invalid 10-digit phone number for SMS delivery.' };
  }

  const messageText = formatSmsReceiptMessage(receipt);
  const apiKey = explicitApiKey || process.env.FAST2SMS_API_KEY || process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY;

  const isMock = !apiKey || apiKey === 'YOUR_FAST2SMS_API_KEY' || apiKey === 'YOUR_2FACTOR_API_KEY';

  if (isMock) {
    console.log('\n============================================================');
    console.log(`💬 [SMS DIGITAL RECEIPT - TRIAL MODE] To: +91 ${phone10}`);
    console.log('------------------------------------------------------------');
    console.log(messageText);
    console.log('============================================================\n');

    return {
      success: true,
      message: `SMS receipt logged in Trial Mode to +91 ${phone10}.`,
      messageId: `mock_sms_${Date.now()}`,
      isMock: true
    };
  }

  // 1. Try Fast2SMS (Quick transactional route)
  try {
    const fast2smsUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=q&message=${encodeURIComponent(messageText)}&flash=0&numbers=${phone10}`;
    const fRes = await fetch(fast2smsUrl, { method: 'GET' });
    const fData: any = await fRes.json().catch(() => ({}));
    if (fRes.ok && (fData.return === true || fData.status_code === 200)) {
      console.log(`[Fast2SMS Sent] Bill #${receipt.billNumber} delivered to +91 ${phone10}`);
      return {
        success: true,
        message: 'Digital receipt dispatched successfully via SMS (Fast2SMS).',
        messageId: fData.request_id || `f2s_${Date.now()}`,
        isMock: false
      };
    }
  } catch (err: any) {
    console.warn('[Fast2SMS Receipt Notice]', err.message);
  }

  // 2. Try 2Factor TSMS route
  try {
    const twoFactorUrl = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/ADDON_SERVICES/SEND/TSMS`;
    const tfRes = await fetch(twoFactorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        From: 'KANCLE',
        To: phone10,
        Msg: messageText
      })
    });
    const tfData: any = await tfRes.json().catch(() => ({}));
    if (tfRes.ok && tfData.Status === 'Success') {
      console.log(`[2Factor SMS Sent] Bill #${receipt.billNumber} delivered to +91 ${phone10}`);
      return {
        success: true,
        message: 'Digital receipt dispatched successfully via SMS (2Factor).',
        messageId: tfData.Details || `2fa_${Date.now()}`,
        isMock: false
      };
    }
  } catch (err: any) {
    console.warn('[2Factor Receipt Notice]', err.message);
  }

  return {
    success: false,
    message: 'Could not deliver SMS via configured gateway.'
  };
}

/**
 * Sends a digital receipt to the customer's WhatsApp.
 * Supports Meta Cloud API, Interakt BSP, or Mock Development Mode.
 * AUTOMATIC FALLBACK: If customer does not have WhatsApp, automatically delivers standard SMS!
 */
export async function sendWhatsAppReceipt(
  receipt: DigitalReceiptPayload,
  customConfig?: IntegrationCredentials
): Promise<WhatsAppSendResult> {
  const formattedPhone = normalizeWhatsAppNumber(receipt.customerPhone);
  if (!formattedPhone || formattedPhone.length < 10) {
    return {
      success: false,
      message: 'Invalid customer phone number provided for digital receipt.'
    };
  }

  const clean10Phone = formattedPhone.slice(-10);
  const messageText = formatReceiptMessage(receipt);

  const provider = (customConfig?.whatsappProvider || process.env.WHATSAPP_PROVIDER || 'interakt').trim().toLowerCase();
  const metaToken = customConfig?.whatsappToken || process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_API_KEY || process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = customConfig?.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;
  const smsApiKey = customConfig?.smsApiKey || process.env.FAST2SMS_API_KEY || process.env.TWO_FACTOR_API_KEY;
  const interaktApiKey = customConfig?.interaktApiKey || process.env.INTERAKT_API_KEY;

  const isMockMode = (
    provider === 'mock' ||
    (!metaToken && !interaktApiKey) ||
    metaToken === 'YOUR_WHATSAPP_TOKEN' ||
    interaktApiKey === 'YOUR_INTERAKT_API_KEY'
  );

  // 1. Mock Development Mode (Logs formatted WhatsApp bill & SMS fallback preview)
  if (isMockMode) {
    console.log('\n============================================================');
    console.log(`📱 [WHATSAPP DIGITAL RECEIPT] Dispatched to +${formattedPhone}:`);
    console.log('------------------------------------------------------------');
    console.log(messageText);
    console.log('------------------------------------------------------------');
    console.log(`💬 [AUTO SMS FALLBACK READY] If recipient is not on WhatsApp:`);
    console.log(formatSmsReceiptMessage(receipt));
    console.log('============================================================\n');

    return {
      success: true,
      message: `Digital receipt dispatched to WhatsApp (+${formattedPhone}) [Trial Mode: Auto SMS fallback enabled].`,
      messageId: `mock_wa_${Date.now()}`,
      isMock: true,
      channel: 'WhatsApp',
      formattedText: messageText
    };
  }

  // Helper to run automatic SMS fallback when WhatsApp is unavailable or recipient has no WhatsApp
  const triggerSmsFallback = async (reason: string): Promise<WhatsAppSendResult> => {
    console.log(`[Auto SMS Fallback] Triggering standard SMS fallback for bill #${receipt.billNumber} to +91 ${clean10Phone} (Reason: ${reason})...`);
    const smsRes = await sendSmsReceipt(clean10Phone, receipt, smsApiKey);
    if (smsRes.success) {
      return {
        success: true,
        message: `Customer is not on WhatsApp. Digital bill delivered successfully via standard SMS!`,
        messageId: smsRes.messageId,
        channel: 'SMS Fallback',
        fallbackTriggered: true,
        isMock: smsRes.isMock,
        formattedText: messageText
      };
    }
    return {
      success: false,
      message: `WhatsApp delivery failed (${reason}), and SMS fallback could not be delivered.`,
      channel: 'Failed',
      fallbackTriggered: true
    };
  };

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
          channel: 'WhatsApp',
          isMock: false
        };
      }

      const isNotOnWhatsApp = (
        data?.error?.code === 131026 ||
        (data?.error?.message && /not.*whatsapp/i.test(data.error.message)) ||
        (data?.error?.error_data?.details && /not.*whatsapp/i.test(data.error.error_data.details))
      );

      console.warn('[Meta WhatsApp Error]', data?.error?.message || data);

      // Recipient is not on WhatsApp or delivery failed -> Fallback to SMS!
      return await triggerSmsFallback(isNotOnWhatsApp ? 'Recipient not on WhatsApp' : (data?.error?.message || 'Meta Cloud API Error'));
    } catch (err: any) {
      console.error('[Meta WhatsApp Network Error]', err.message);
      return await triggerSmsFallback('Network error connecting to WhatsApp');
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
          phoneNumber: clean10Phone,
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
          channel: 'WhatsApp',
          isMock: false
        };
      }

      return await triggerSmsFallback(data?.message || 'Interakt delivery failure');
    } catch (err: any) {
      console.error('[Interakt Network Error]', err.message);
      return await triggerSmsFallback('Network error connecting to Interakt');
    }
  }

  // Direct fallback if no provider configured
  return await triggerSmsFallback('No WhatsApp provider configured');
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
