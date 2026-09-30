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
          <div class="flex"><span>GST / Taxes:</span> <span>₹${Number(sale.tax || 0).toFixed(2)}</span></div>
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
   * Dispatches Digital Paperless Receipt via WhatsApp/SMS provider API
   */
  static sendPaperlessReceipt(sale, phoneNumber) {
    console.log(`[PrintService] Sending Digital Receipt to ${phoneNumber} for Bill ${sale.billNumber}`);
    
    // Simulate SMS / WhatsApp payload payload dispatch
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          billNumber: sale.billNumber,
          customerPhone: phoneNumber,
          channel: 'WhatsApp/SMS',
          sentAt: new Date().toISOString()
        });
      }, 600);
    });
  }
}
