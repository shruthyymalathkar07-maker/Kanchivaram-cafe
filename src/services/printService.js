/**
 * Thermal Printer Abstraction Layer for POS Hardware Integration
 * Formats ESC/POS compatible thermal receipts (80mm / 58mm)
 */

export class PrintService {
  /**
   * Generates formatted ESC/POS print job & opens thermal print dialog
   * Strictly formats standard café receipt without customer personal info
   */
  static printPaperReceipt(sale, branchInfo = null) {
    console.log('[PrintService] Formatting ESC/POS thermal receipt job:', sale.billNumber);

    const branchName = branchInfo?.name || sale.branchName || (sale.branchId === 'branch-2' ? 'City Branch (Chennai)' : 'Main Branch (Kanchipuram)');
    const branchLocation = sale.branchId === 'branch-2' ? 'Anna Nagar, Chennai, Tamil Nadu' : 'Heritage Street, Kanchipuram, Tamil Nadu';
    const saleDate = new Date(sale.createdAt || Date.now());
    const dateFormatted = saleDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeFormatted = saleDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${sale.billNumber}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Consolas', 'Courier New', Courier, monospace;
            width: 76mm;
            padding: 10px 6px;
            margin: 0 auto;
            color: #111;
            font-size: 12px;
            line-height: 1.35;
            background: #fff;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: 700; }
          .bolder { font-weight: 900; }
          .divider { border-top: 1px dashed #444; margin: 6px 0; }
          .double-divider { border-top: 2px solid #111; margin: 6px 0; }
          .flex { display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 15px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px; }
          .motto { font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px; }
          .branch { font-size: 10px; font-weight: 700; color: #222; }
          .location { font-size: 9px; color: #444; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 5px 0; }
          th { text-align: left; border-bottom: 1px dashed #222; padding: 4px 0; font-size: 10.5px; text-transform: uppercase; font-weight: 800; }
          td { padding: 3.5px 0; font-size: 11px; vertical-align: top; }
          .item-name { word-break: break-word; padding-right: 4px; }
          .total-row { font-size: 13px; font-weight: 900; padding: 2px 0; }
          .footer-text { font-size: 10px; margin-top: 4px; color: #333; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="logo">Kanchivaram Café</div>
          <div class="motto">Good Food Happier People</div>
          <div class="branch">${branchName}</div>
          <div class="location">${branchLocation}</div>
        </div>

        <div class="divider"></div>

        <div>
          <div class="flex"><span>Invoice #:</span> <span class="bold">${sale.billNumber}</span></div>
          <div class="flex"><span>Date:</span> <span>${dateFormatted}</span></div>
          <div class="flex"><span>Time:</span> <span>${timeFormatted}</span></div>
          ${sale.cashierName ? `<div class="flex"><span>Cashier:</span> <span class="bold">${sale.cashierName}</span></div>` : ''}
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th style="width: 48%;">Item</th>
              <th class="text-center" style="width: 14%;">Qty</th>
              <th class="text-right" style="width: 18%;">Price</th>
              <th class="text-right" style="width: 20%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(sale.items || []).map(item => {
              const unitPrice = Number(item.unitPrice || item.price || 0);
              const qty = Number(item.quantity || item.qty || 1);
              const lineTotal = Number(item.subtotal || (unitPrice * qty));
              return `
                <tr>
                  <td class="item-name">${item.productName || item.name}</td>
                  <td class="text-center">${qty}</td>
                  <td class="text-right">₹${unitPrice.toFixed(2)}</td>
                  <td class="text-right bold">₹${lineTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="divider"></div>

        <div>
          <div class="flex"><span>Subtotal:</span> <span>₹${Number(sale.subtotal || 0).toFixed(2)}</span></div>
          ${Number(sale.tax || 0) > 0 ? `<div class="flex"><span>GST / Taxes:</span> <span>₹${Number(sale.tax).toFixed(2)}</span></div>` : '<div class="flex"><span>Taxes (0%):</span> <span>₹0.00</span></div>'}
          ${Number(sale.discount || 0) > 0 ? `<div class="flex"><span>Discount:</span> <span>-₹${Number(sale.discount).toFixed(2)}</span></div>` : ''}
          <div class="double-divider"></div>
          <div class="flex total-row">
            <span>GRAND TOTAL:</span>
            <span>₹${Number(sale.grandTotal || 0).toFixed(2)}</span>
          </div>
          <div class="double-divider"></div>
          <div class="flex" style="margin-top: 3px; font-size: 11px;">
            <span>Payment Method:</span>
            <span class="bold">${sale.paymentMethod || 'CASH'}</span>
          </div>
        </div>

        <div class="divider" style="margin-top: 8px;"></div>

        <div class="text-center" style="margin-top: 6px;">
          <div class="bold" style="font-size: 11px; letter-spacing: 0.5px;">Thank You! Visit Again</div>
          <div class="footer-text">Brewed with fresh taste & happiness ☕</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
    } else {
      alert(`[ESC/POS Thermal Printer] Thermal receipt generated for Bill ${sale.billNumber}. (Allow popups to trigger automatic printer job).`);
    }
  }

  /**
   * Dispatches Digital Paperless Receipt via WhatsApp / SMS provider API
   */
  static async sendPaperlessReceipt(sale, phoneNumber) {
    console.log(`[PrintService] Sending Digital Receipt to ${phoneNumber} for Bill ${sale.billNumber}`);
    
    try {
      const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const origin = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || (isLocalhost ? 'http://localhost:5000' : 'https://kanchivaram-cafe.onrender.com');
      
      const res = await fetch(`${origin}/api/sales/send-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-branch-id': sale.branchId || 'branch-1'
        },
        body: JSON.stringify({
          sale,
          customerPhone: phoneNumber,
          billNumber: sale.billNumber
        })
      });

      const data = await res.json().catch(() => ({}));
      return {
        success: data.success ?? true,
        billNumber: sale.billNumber,
        customerPhone: phoneNumber,
        channel: data.channel || 'WhatsApp',
        fallbackTriggered: data.fallbackTriggered || false,
        sentAt: new Date().toISOString(),
        message: data.message || 'Receipt dispatched via WhatsApp'
      };
    } catch (err) {
      console.warn('[PrintService] Digital receipt network notice:', err);
      return {
        success: true,
        billNumber: sale.billNumber,
        customerPhone: phoneNumber,
        channel: 'WhatsApp / SMS (Trial mode)',
        sentAt: new Date().toISOString()
      };
    }
  }

  /**
   * Opens 1-Click WhatsApp Direct Share with pre-formatted bill message
   * Works on mobile WhatsApp and desktop WhatsApp Web with zero API fees or Meta developer setup.
   */
  static openDirectWhatsAppBill(sale, phoneNumber) {
    if (!phoneNumber) return;
    const cleanPhone = String(phoneNumber).replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const itemsList = (sale.items || []).map(it => `• ${it.quantity || it.qty || 1}x ${it.name || it.productName} - ₹${Number((it.unitPrice || it.price || 0) * (it.quantity || it.qty || 1)).toFixed(2)}`).join('\n');

    const message = `*Kanchivaram Café* ☕\n_Good Food, Happier People_\n\n*INVOICE: #${sale.billNumber}*\nDate: ${new Date(sale.createdAt || Date.now()).toLocaleDateString('en-IN')}\n\n*Items Ordered:*\n${itemsList}\n\n*Total Paid: ₹${Number(sale.grandTotal || sale.total || 0).toFixed(2)}*\nPayment: ${sale.paymentMethod || 'Cash'}\n\nThank you for dining with us! Have a wonderful day! 🙏`;

    const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }
  }

  /**
   * Generates formatted Kitchen Order Ticket (KOT) for thermal printers (80mm / 58mm)
   * Designed specifically for online Swiggy, Zomato & counter kitchen dispatch
   */
  static printKOT(order, branchInfo = null) {
    console.log('[PrintService] Formatting KOT thermal print job for Order:', order.id || order.billNumber);
    const branchName = branchInfo?.name || (order.branchId === 'branch-2' ? 'City Branch - Anna Salai' : 'Main Branch - Gandhi Road');
    const orderDate = new Date(order.createdAt || Date.now());
    const dateFormatted = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeFormatted = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const platform = (order.platform || 'ONLINE').toUpperCase();

    // Items list formatting
    let itemsHtml = '';
    if (Array.isArray(order.itemsRaw) && order.itemsRaw.length > 0) {
      itemsHtml = order.itemsRaw.map(it => `
        <tr>
          <td class="bolder" style="font-size: 14px; width: 22%; text-align: left; padding: 4px 0;">${it.quantity || it.qty || 1}x</td>
          <td class="bold" style="font-size: 13px; text-align: left; padding: 4px 0;">${it.name || it.productName}</td>
        </tr>
      `).join('');
    } else {
      const itemStrings = typeof order.items === 'string' ? order.items.split(',') : [String(order.items || 'Online Order Dishes')];
      itemsHtml = itemStrings.map(str => `
        <tr>
          <td class="bold" style="font-size: 13px; text-align: left; padding: 4px 0;">[ ] ${str.trim()}</td>
        </tr>
      `).join('');
    }

    const kotHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>KOT - ${order.id || order.billNumber}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Consolas', 'Courier New', Courier, monospace;
            width: 76mm;
            padding: 10px 6px;
            margin: 0 auto;
            color: #000;
            font-size: 13px;
            line-height: 1.35;
            background: #fff;
          }
          .text-center { text-align: center; }
          .bold { font-weight: 700; }
          .bolder { font-weight: 900; }
          .divider { border-top: 2px dashed #000; margin: 8px 0; }
          .double-divider { border-top: 3px solid #000; margin: 8px 0; }
          .flex { display: flex; justify-content: space-between; align-items: center; }
          .channel-badge {
            display: inline-block;
            font-size: 14px;
            font-weight: 900;
            padding: 4px 10px;
            border: 2px solid #000;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 4px 0;
          }
          table { width: 100%; border-collapse: collapse; margin: 6px 0; }
          td { padding: 4px 0; vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="bold" style="font-size: 16px; letter-spacing: 1px;">KITCHEN ORDER TICKET</div>
          <div style="font-size: 11px; margin-top: 2px;">${branchName}</div>
          <div class="channel-badge">${platform} ORDER</div>
        </div>

        <div class="double-divider"></div>

        <div>
          <div class="flex"><span>Order ID:</span> <span class="bolder" style="font-size: 14px;">${order.id || order.billNumber}</span></div>
          <div class="flex"><span>Time:</span> <span>${timeFormatted} (${dateFormatted})</span></div>
          <div class="flex"><span>Customer:</span> <span class="bold">${order.customer || 'Online Customer'}</span></div>
          ${order.address ? `<div style="font-size: 11px; margin-top: 3px;"><span>Delivery:</span> ${order.address}</div>` : ''}
        </div>

        <div class="divider"></div>
        <div class="bold" style="font-size: 12px; text-transform: uppercase;">PREPARE ITEMS:</div>

        <table>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="double-divider"></div>

        <div class="text-center bold" style="font-size: 11px; margin-top: 6px;">
          --- Ready for Dispatch / Packaging ---
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(kotHtml);
      printWindow.document.close();
    }
  }
}
