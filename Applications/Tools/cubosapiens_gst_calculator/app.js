/* ============================================================
   cuboGST – app.js
   Sections:
   1.  State
   2.  Element references
   3.  Theme toggle
   4.  Tab switching
   5.  Mode toggle (exclusive / inclusive)
   6.  GST slab buttons
   7.  Custom rate input
   8.  Tax type toggle (intra / inter)
   9.  Amount input listener
   10. calculateSingle()
   11. renderBreakdown()
   12. Bulk items — addItem / removeItem / buildItemCard
   13. calculateBulkItem()
   14. renderBulkSummary()
   15. Export bulk JSON
   16. Export bulk PDF
   17. fmt() — currency formatter
   18. Toast helper
   ============================================================ */


/* ── 1. State ── */
let mode     = 'exclusive';  // 'exclusive' | 'inclusive'
let gstRate  = 5;            // percent
let taxType  = 'intra';      // 'intra' | 'inter'
let bulkItems = [];          // [{ id, name, qty, price, rate, mode }]
let itemNextId = 0;


/* ── 2. Element References ── */
const themeToggle     = document.getElementById('themeToggle');
const amountInput     = document.getElementById('amountInput');
const customRateInput = document.getElementById('customRate');
const baseLabel       = document.getElementById('baseLabel');
const baseVal         = document.getElementById('baseVal');
const taxRows         = document.getElementById('taxRows');
const totalVal        = document.getElementById('totalVal');
const bulkList        = document.getElementById('bulkList');
const btnAddItem      = document.getElementById('btnAddItem');
const summaryRows     = document.getElementById('summaryRows');
const summaryTotal    = document.getElementById('summaryTotal');
const grandTotal      = document.getElementById('grandTotal');
const btnExportBulkJSON = document.getElementById('btnExportBulkJSON');
const btnExportBulkPDF  = document.getElementById('btnExportBulkPDF');
const toastEl         = document.getElementById('toast');


/* ── 3. Theme Toggle ── */
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});


/* ── 4. Tab Switching ── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});


/* ── 5. Mode Toggle (exclusive / inclusive) ── */
document.querySelectorAll('.seg-btn[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn[data-mode]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    calculateSingle();
  });
});


/* ── 6. GST Slab Buttons ── */
document.querySelectorAll('.slab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.slab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gstRate = parseFloat(btn.dataset.rate);
    customRateInput.value = '';  // clear custom
    calculateSingle();
  });
});


/* ── 7. Custom Rate Input ── */
customRateInput.addEventListener('input', () => {
  const val = parseFloat(customRateInput.value);
  if (!isNaN(val) && val >= 0) {
    document.querySelectorAll('.slab-btn').forEach(b => b.classList.remove('active'));
    gstRate = val;
    calculateSingle();
  }
});


/* ── 8. Tax Type Toggle (intra / inter) ── */
document.querySelectorAll('.seg-btn[data-taxtype]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn[data-taxtype]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    taxType = btn.dataset.taxtype;
    calculateSingle();
  });
});


/* ── 9. Amount Input Listener ── */
amountInput.addEventListener('input', calculateSingle);


/* ── 10. calculateSingle ── */
function calculateSingle() {
  const inputAmt = parseFloat(amountInput.value) || 0;
  const rate     = gstRate / 100;

  let base, gstAmt, total;

  if (mode === 'exclusive') {
    // User enters base price → add GST on top
    base   = inputAmt;
    gstAmt = base * rate;
    total  = base + gstAmt;
    baseLabel.textContent = 'Base amount';
  } else {
    // User enters final price → extract GST
    total  = inputAmt;
    base   = total / (1 + rate);
    gstAmt = total - base;
    baseLabel.textContent = 'Base amount (extracted)';
  }

  baseVal.textContent  = fmt(base);
  totalVal.textContent = fmt(total);

  renderBreakdown(gstAmt);
}


/* ── 11. renderBreakdown ── */
function renderBreakdown(gstAmt) {
  taxRows.innerHTML = '';

  if (taxType === 'intra') {
    // Split GST into CGST + SGST (equal halves)
    const half = gstAmt / 2;

    const cgstRow = document.createElement('div');
    cgstRow.className = 'tax-detail';
    cgstRow.innerHTML = `
      <span class="bk-label">CGST (${(gstRate / 2).toFixed(2)}%)</span>
      <span class="bk-value">${fmt(half)}</span>
    `;

    const sgstRow = document.createElement('div');
    sgstRow.className = 'tax-detail';
    sgstRow.innerHTML = `
      <span class="bk-label">SGST (${(gstRate / 2).toFixed(2)}%)</span>
      <span class="bk-value">${fmt(half)}</span>
    `;

    taxRows.appendChild(cgstRow);
    taxRows.appendChild(sgstRow);
  } else {
    // IGST — full amount, no split
    const igstRow = document.createElement('div');
    igstRow.className = 'tax-detail';
    igstRow.innerHTML = `
      <span class="bk-label">IGST (${gstRate}%)</span>
      <span class="bk-value">${fmt(gstAmt)}</span>
    `;
    taxRows.appendChild(igstRow);
  }
}


/* ── 12. Bulk Items — add / remove / buildItemCard ── */
function addItem() {
  const id   = itemNextId++;
  const item = { id, name: '', qty: 1, price: 0, rate: 18, mode: 'exclusive' };
  bulkItems.push(item);

  const card = buildItemCard(item);
  bulkList.appendChild(card);
  renderBulkSummary();
}

function removeItem(id) {
  const card = bulkList.querySelector(`[data-item-id="${id}"]`);
  if (card) {
    card.style.opacity = '0'; card.style.transition = 'opacity 0.2s ease';
    setTimeout(() => { card.remove(); renderBulkSummary(); }, 200);
  }
  bulkItems = bulkItems.filter(i => i.id !== id);
}

function buildItemCard(item) {
  const card = document.createElement('div');
  card.className = 'bulk-item-card';
  card.dataset.itemId = item.id;

  // Column header labels (only on first card or always visible)
  const colHeader = document.createElement('div');
  colHeader.className = 'bulk-col-header';
  colHeader.innerHTML = `
    <span class="col-label">Item name</span>
    <span class="col-label">Price (₹)</span>
    <span class="col-label">Qty</span>
    <span class="col-label">GST %</span>
    <span></span>
  `;
  card.appendChild(colHeader);

  // Input grid
  const grid = document.createElement('div');
  grid.className = 'bulk-item-grid';

  // Name
  const nameInput = document.createElement('input');
  nameInput.className = 'field-input';
  nameInput.placeholder = 'Item name';
  nameInput.value = item.name;
  nameInput.addEventListener('input', () => {
    item.name = nameInput.value;
    renderBulkSummary();
  });

  // Price
  const priceInput = document.createElement('input');
  priceInput.className = 'field-input';
  priceInput.type = 'number'; priceInput.placeholder = '0.00';
  priceInput.min = 0; priceInput.step = 0.01;
  priceInput.value = item.price || '';
  priceInput.addEventListener('input', () => {
    item.price = parseFloat(priceInput.value) || 0;
    updateItemTotal(card, item);
    renderBulkSummary();
  });

  // Quantity
  const qtyInput = document.createElement('input');
  qtyInput.className = 'field-input qty-cell';
  qtyInput.type = 'number'; qtyInput.placeholder = '1';
  qtyInput.min = 1; qtyInput.step = 1;
  qtyInput.value = item.qty;
  qtyInput.addEventListener('input', () => {
    item.qty = parseInt(qtyInput.value) || 1;
    updateItemTotal(card, item);
    renderBulkSummary();
  });

  // GST rate select
  const rateSelect = document.createElement('select');
  rateSelect.className = 'field-select';
  [0, 5, 12, 18, 28].forEach(r => {
    const opt = document.createElement('option');
    opt.value = r; opt.textContent = `${r}%`;
    if (r === item.rate) opt.selected = true;
    rateSelect.appendChild(opt);
  });
  rateSelect.addEventListener('change', () => {
    item.rate = parseFloat(rateSelect.value);
    updateItemTotal(card, item);
    renderBulkSummary();
  });

  // Remove
  const removeBtn = document.createElement('button');
  removeBtn.className = 'icon-btn';
  removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  removeBtn.addEventListener('click', () => removeItem(item.id));

  grid.appendChild(nameInput);
  grid.appendChild(priceInput);
  grid.appendChild(qtyInput);
  grid.appendChild(rateSelect);
  grid.appendChild(removeBtn);
  card.appendChild(grid);

  // Item total row
  const totalRow = document.createElement('div');
  totalRow.className = 'item-total';
  totalRow.dataset.role = 'itemTotal';
  totalRow.innerHTML = `<span>Total (incl. GST)</span><strong>₹ 0.00</strong>`;
  card.appendChild(totalRow);

  return card;
}

function updateItemTotal(card, item) {
  const { base, gstAmt, total } = calculateBulkItem(item);
  const row = card.querySelector('[data-role="itemTotal"]');
  if (row) {
    row.innerHTML = `
      <span>Base: ${fmt(base)} + GST (${item.rate}%): ${fmt(gstAmt)}</span>
      <strong>${fmt(total)}</strong>
    `;
  }
}

btnAddItem.addEventListener('click', () => addItem());


/* ── 13. calculateBulkItem ── */
function calculateBulkItem(item) {
  const rate  = item.rate / 100;
  const qty   = item.qty || 1;

  let base, gstAmt, total;

  if (item.mode === 'inclusive') {
    total  = item.price * qty;
    base   = total / (1 + rate);
    gstAmt = total - base;
  } else {
    base   = item.price * qty;
    gstAmt = base * rate;
    total  = base + gstAmt;
  }

  return { base, gstAmt, total };
}


/* ── 14. renderBulkSummary ── */
function renderBulkSummary() {
  summaryRows.innerHTML = '';

  if (bulkItems.length === 0) {
    summaryRows.innerHTML = '<p class="empty-hint">Add items above to see the bill</p>';
    summaryTotal.style.display = 'none';
    return;
  }

  let grandBase = 0, grandGST = 0, grandTot = 0;

  bulkItems.forEach(item => {
    const { base, gstAmt, total } = calculateBulkItem(item);
    grandBase += base;
    grandGST  += gstAmt;
    grandTot  += total;

    const row = document.createElement('div');
    row.className = 'summary-item-row';
    row.innerHTML = `
      <span class="summary-item-name">${item.name || `Item ${item.id + 1}`}
        <span style="color:var(--text-3);font-size:0.72rem;margin-left:4px;">
          ×${item.qty} · ${item.rate}% GST
        </span>
      </span>
      <span class="summary-item-val">${fmt(total)}</span>
    `;
    summaryRows.appendChild(row);
  });

  // Subtotals
  const subRow = document.createElement('div');
  subRow.className = 'summary-item-row';
  subRow.style.cssText = 'color:var(--text-3);font-size:0.78rem;';
  subRow.innerHTML = `
    <span>Base total · GST total</span>
    <span style="font-family:'DM Mono',monospace;">${fmt(grandBase)} + ${fmt(grandGST)}</span>
  `;
  summaryRows.appendChild(subRow);

  summaryTotal.style.display = 'block';
  grandTotal.textContent = fmt(grandTot);
}


/* ── 15. Export bulk JSON ── */
btnExportBulkJSON.addEventListener('click', () => {
  if (bulkItems.length === 0) { showToast('Add items first'); return; }

  const data = {
    items: bulkItems.map(item => {
      const { base, gstAmt, total } = calculateBulkItem(item);
      return {
        name:    item.name || `Item ${item.id + 1}`,
        qty:     item.qty,
        unitPrice: item.price,
        gstRate: item.rate,
        base:    +base.toFixed(2),
        gst:     +gstAmt.toFixed(2),
        total:   +total.toFixed(2),
      };
    }),
    grandTotal: +bulkItems.reduce((s, i) => s + calculateBulkItem(i).total, 0).toFixed(2),
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'cuboGST-bill.json'; a.click();
  showToast('JSON exported!');
});


/* ── 16. Export bulk PDF ── */
btnExportBulkPDF.addEventListener('click', () => {
  if (bulkItems.length === 0) { showToast('Add items first'); return; }

  let rows = '';
  let grandTot = 0;

  bulkItems.forEach(item => {
    const { base, gstAmt, total } = calculateBulkItem(item);
    grandTot += total;
    rows += `<tr>
      <td>${item.name || `Item ${item.id + 1}`}</td>
      <td>${item.qty}</td>
      <td>${fmt(item.price)}</td>
      <td>${item.rate}%</td>
      <td>${fmt(base)}</td>
      <td>${fmt(gstAmt)}</td>
      <td>${fmt(total)}</td>
    </tr>`;
  });

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>cuboGST Bill</title>
  <style>
    body { font-family: 'DM Sans', sans-serif; padding: 32px; color: #1d1d1f; }
    h1 { font-size: 1.5rem; color: #e34949; margin-bottom: 4px; }
    p  { color: #6e6e73; font-size: 0.82rem; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { background: #f5f5f7; padding: 8px 10px; text-align: left;
         font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; color: #aeaeb2; }
    td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; }
    .grand { margin-top: 20px; padding: 16px; background: #fff5f5;
             border-radius: 10px; display: flex; justify-content: space-between; }
    .grand span { font-size: 0.9rem; color: #6e6e73; }
    .grand strong { font-size: 1.3rem; color: #e34949; }
  </style></head><body>
  <h1>cuboGST — Tax Invoice</h1>
  <p>Generated on ${new Date().toLocaleDateString()}</p>
  <table>
    <thead><tr>
      <th>Item</th><th>Qty</th><th>Unit Price</th>
      <th>GST %</th><th>Base</th><th>GST</th><th>Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="grand">
    <span>Grand Total (incl. GST)</span>
    <strong>${fmt(grandTot)}</strong>
  </div>
  </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
});


/* ── 17. fmt() — Currency Formatter ── */
function fmt(n) {
  return '₹ ' + (n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


/* ── 18. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}


/* ── Init ── */
calculateSingle();
