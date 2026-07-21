import { test, expect } from '@playwright/test';

// Helper function to inject dummy auth user into localStorage so we can test protected routes
async function loginAsKasir(page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 1,
        nama: 'Kasir Adjie',
        email: 'admin@warungadjie.id',
        role: 'admin',
        access_token: 'dummy-token-123'
      })
    );
  });
}

test.describe('Warung Adjie - E2E UI & UTF-8 Mojibake Verification Suite', () => {
  
  test('1. Halaman Login tidak mengalami mojibake dan merender dengan bersih', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Warung Adjie/i);

    // Verify specific welcome heading emoji
    await expect(page.locator('h2')).toContainText('Selamat Datang 👋');

    // Verify no mojibake in text content
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toMatch(/[Ãðâ]/);
  });

  test('2. Dashboard merender emoji UTF-8 dengan sempurna tanpa mojibake', async ({ page }) => {
    await loginAsKasir(page);
    await page.goto('/');

    // Check Header title and inner Dashboard headings
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('h2')).toContainText('Ringkasan Penjualan 📊');
    await expect(page.locator('body')).toContainText('📈 Tren Pendapatan');
    await expect(page.locator('body')).toContainText('🏆 Produk Terlaris');
    await expect(page.locator('body')).toContainText('⚠️ Stok Kritis');

    // Assert absence of double-encoded mojibake artifacts
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toMatch(/[Ãðâ]/);
  });

  test('3. Daftar Produk (/barang) menampilkan placeholder & tombol bersih', async ({ page }) => {
    await loginAsKasir(page);
    await page.goto('/barang');

    await expect(page.locator('h1')).toContainText('Daftar Produk');
    
    // Check search placeholder icon clean UTF-8
    const searchInput = page.locator('input[placeholder*="Cari nama produk"]');
    await expect(searchInput).toHaveAttribute('placeholder', /🔍 Cari nama produk/);

    // Check add button text & icon
    await expect(page.locator('button', { hasText: 'Tambah' })).toContainText('➕');
    await expect(page.locator('h2')).toContainText('➕ Tambah Produk');

    // Verify no mojibake anywhere on page
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toMatch(/[Ãðâ]/);
  });

  test('4. Laporan (/laporan) merender ikon keuangan, grafik & tombol PDF', async ({ page }) => {
    await loginAsKasir(page);
    await page.goto('/laporan');

    await expect(page.locator('h1')).toContainText('Laporan Laba Rugi');
    await expect(page.locator('h2')).toContainText(/Laporan Bulan/);

    // Verify stat cards and table headings emojis
    await expect(page.locator('body')).toContainText('💰');
    await expect(page.locator('body')).toContainText('📦');
    await expect(page.locator('body')).toContainText('📈');
    await expect(page.locator('body')).toContainText('📊 Pendapatan Harian');
    await expect(page.locator('body')).toContainText('🏷️ Laba per Kategori');
    await expect(page.locator('body')).toContainText('🏆 Top Produk Terjual');
    await expect(page.locator('button', { hasText: 'Cetak PDF' })).toContainText('🖨️');

    // Ensure zero mojibake bytes on entire report screen
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toMatch(/[Ãðâ]/);
  });

  test('5. Katalog Produk Umum (/katalog) merender bersih', async ({ page }) => {
    await page.goto('/katalog');

    await expect(page.locator('h1')).toContainText('Katalog Warung Adjie');

    const bodyText = await page.innerText('body');
    expect(bodyText).not.toMatch(/[Ãðâ]/);
  });

  test('6. Riwayat Transaksi (/riwayat-transaksi) merender daftar transaksi tanpa error substring/TypeError', async ({ page }) => {
    await loginAsKasir(page);
    await page.goto('/riwayat-transaksi');

    await expect(page.locator('h1')).toContainText('Riwayat Transaksi');
    await expect(page.locator('body')).not.toContainText('Ups! Terjadi Kesalahan');
    await expect(page.locator('body')).not.toContainText('substring is not a function');

    const searchInput = page.locator('input[placeholder*="Cari ID"]');
    await expect(searchInput).toHaveAttribute('placeholder', /🔍 Cari ID atau nama produk/);

    const bodyText = await page.innerText('body');
    expect(bodyText).not.toMatch(/[Ãðâ]/);
  });
});
