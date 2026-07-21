const STORE_NAME = 'WARUNG ADJIE';

const fmt = (n) => Number(n).toLocaleString('id-ID');

const getReceiptCSS = () => `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  @page {
    size: 50mm 210mm;
    margin: 2mm 3mm;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #000;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    -webkit-font-smoothing: none;
    font-smooth: never;
  }

  .receipt {
    width: 100%;
    padding: 2mm 0;
  }

  /* ── HEADER ── */
  .receipt-header {
    text-align: center;
    margin-bottom: 2mm;
  }

  .store-name {
    font-size: 15px;
    font-weight: bold;
    letter-spacing: 2px;
    margin-bottom: 1.5mm;
  }

  .receipt-label {
    font-size: 11px;
    font-weight: 600;
    line-height: 1.6;
  }

  /* ── DIVIDER ── */
  .divider-solid {
    border: none;
    border-top: 1.5px solid #000;
    margin: 2mm 0;
  }

  .divider-dashed {
    border: none;
    border-top: 1px dashed #000;
    margin: 2mm 0;
  }

  /* ── ITEM TABLE ── */
  .item-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2mm;
  }

  .item-name-cell {
    font-size: 12px;
    font-weight: bold;
    padding-bottom: 0.5mm;
    color: #000;
  }

  .item-qty-cell {
    font-size: 11px;
    font-weight: 600;
    color: #000;
    width: 55%;
    vertical-align: top;
    padding-bottom: 2mm;
  }

  .item-price-cell {
    font-size: 11px;
    font-weight: bold;
    color: #000;
    width: 45%;
    text-align: right;
    vertical-align: top;
    padding-bottom: 2mm;
    white-space: nowrap;
  }

  /* ── SUMMARY TABLE ── */
  .summary-table {
    width: 100%;
    border-collapse: collapse;
  }

  .summary-label {
    font-size: 11px;
    font-weight: 600;
    color: #000;
    width: 45%;
    vertical-align: middle;
    padding: 1mm 0;
  }

  .summary-value {
    font-size: 11px;
    font-weight: 600;
    color: #000;
    text-align: right;
    vertical-align: middle;
    padding: 1mm 0;
    white-space: nowrap;
  }

  .summary-label.bold,
  .summary-value.bold {
    font-size: 13px;
    font-weight: bold;
    color: #000;
  }

  /* ── FOOTER ── */
  .receipt-footer {
    text-align: center;
    font-size: 10px;
    font-weight: 600;
    color: #000;
    margin-top: 3mm;
    line-height: 1.8;
  }

  .separator-line {
    display: block;
    font-size: 10px;
    margin: 1mm 0;
    letter-spacing: 2px;
  }
`;

/**
 * Bangun baris item HTML (pakai <table> agar tidak terpotong)
 */
function buildItemRow(nama, jumlah, hargaSatuan, subtotal) {
  return `
    <table class="item-table">
      <tr>
        <td class="item-name-cell" colspan="2">${nama}</td>
      </tr>
      <tr>
        <td class="item-qty-cell">${jumlah} x Rp ${fmt(hargaSatuan)}</td>
        <td class="item-price-cell">Rp ${fmt(subtotal)}</td>
      </tr>
    </table>
  `;
}

/**
 * Buat HTML struk dari data transaksi baru (ModalStruk di halaman Transaksi)
 * @param {Object} struk - { items, total, dibayar, kembalian, tanggal }
 */
export function printStrukTransaksi(struk) {
  const tgl = new Date(struk.tanggal);
  const tglStr = tgl.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const waktuStr = tgl.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const itemsHtml = struk.items.map(item =>
    buildItemRow(item.nama, item.jumlah, item.harga_jual, item.harga_jual * item.jumlah)
  ).join('');

  const html = buildHTML({
    title: `Struk - ${STORE_NAME}`,
    headerExtra: '',
    tglStr,
    waktuStr,
    itemsHtml,
    summaryHtml: `
      <table class="summary-table">
        <tr>
          <td class="summary-label bold">TOTAL</td>
          <td class="summary-value bold">Rp ${fmt(struk.total)}</td>
        </tr>
        <tr>
          <td class="summary-label">Tunai</td>
          <td class="summary-value">Rp ${fmt(struk.dibayar)}</td>
        </tr>
        <tr>
          <td class="summary-label">Kembali</td>
          <td class="summary-value">Rp ${fmt(struk.kembalian)}</td>
        </tr>
      </table>
    `,
  });

  openPrintWindow(html);
}

/**
 * Buat HTML struk dari data riwayat transaksi
 * @param {Object} trx - data dari API getRiwayatTransaksi
 */
export function printStrukRiwayat(trx) {
  const tgl = new Date(trx.tanggal);
  const tglStr = tgl.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const waktuStr = tgl.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const noStruk = String(trx.id).substring(0, 8).toUpperCase();

  let itemsHtml = '';
  if (trx.detail && trx.detail.length > 0) {
    itemsHtml = trx.detail.map(d =>
      buildItemRow(d.nama_barang, d.jumlah, d.harga_satuan, d.jumlah * d.harga_satuan)
    ).join('');
  } else {
    itemsHtml = `<p style="font-style:italic;font-size:9px;margin:1mm 0;">Tidak ada detail produk</p>`;
  }

  const html = buildHTML({
    title: `Struk #${noStruk} - ${STORE_NAME}`,
    headerExtra: `<div class="receipt-label">No: #${noStruk}</div>`,
    tglStr,
    waktuStr,
    itemsHtml,
    summaryHtml: `
      <table class="summary-table">
        <tr>
          <td class="summary-label bold">TOTAL</td>
          <td class="summary-value bold">Rp ${fmt(trx.total_harga)}</td>
        </tr>
      </table>
    `,
  });

  openPrintWindow(html);
}

/**
 * Bangun dokumen HTML lengkap untuk struk
 */
function buildHTML({ title, headerExtra, tglStr, waktuStr, itemsHtml, summaryHtml }) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>${getReceiptCSS()}</style>
</head>
<body>
  <div class="receipt">

    <div class="receipt-header">
      <div class="store-name">${STORE_NAME}</div>
      ${headerExtra}
      <div class="receipt-label">${tglStr}</div>
      <div class="receipt-label">${waktuStr} WIB</div>
    </div>

    <hr class="divider-solid">

    ${itemsHtml}

    <hr class="divider-dashed">

    ${summaryHtml}

    <hr class="divider-solid">

    <div class="receipt-footer">
      <span class="separator-line">- - - - - - - - -</span>
      Terima kasih telah berbelanja!<br>
      Barang yang sudah dibeli<br>
      tidak dapat dikembalikan.
      <span class="separator-line">- - - - - - - - -</span>
    </div>

  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() { window.close(); }, 500);
      }, 400);
    };
  <\/script>
</body>
</html>`;
}

/**
 * Buka popup window untuk mencetak
 * Lebar 320px agar konten 58mm tidak terpotong di layar sebelum print
 */
function openPrintWindow(html) {
  const popup = window.open(
    '', '_blank',
    'width=320,height=820,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes'
  );

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    alert(
      'Popup diblokir oleh browser!\n\n' +
      'Silakan izinkan popup untuk situs ini:\n' +
      '1. Klik ikon kunci/blokir di address bar\n' +
      '2. Pilih "Izinkan popup"\n' +
      '3. Refresh halaman dan coba cetak lagi'
    );
    return;
  }

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}
