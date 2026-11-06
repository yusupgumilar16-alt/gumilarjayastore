import type { createAdminClient } from '@/lib/supabase/admin';

type AdminClient = ReturnType<typeof createAdminClient>;

/** Tahun & bulan menurut WIB (server biasanya berjalan di UTC, jadi tanggal 1 pukul 00–07 WIB bisa salah bulan). */
export function jakartaYearMonth(d: Date = new Date()): { year: string; month: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(d);
  return {
    year: parts.find((p) => p.type === 'year')?.value || String(d.getFullYear()),
    month: parts.find((p) => p.type === 'month')?.value || String(d.getMonth() + 1).padStart(2, '0'),
  };
}

/**
 * Satu-satunya pembuat nomor kwitansi otomatis (form baru, endpoint next-number).
 * Memakai fungsi SQL next_invoice_number (sama seperti import) agar penomoran
 * tidak bentrok; bila tidak ada, hitung manual dari nomor tertinggi bulan ini.
 */
export async function generateInvoiceNumber(admin: AdminClient): Promise<string> {
  const { data, error } = await admin.rpc('next_invoice_number');
  if (!error && typeof data === 'string' && data.trim()) return data.trim();

  const { year, month } = jakartaYearMonth();
  const prefix = `GJS/${year}/${month}/`;
  const { data: rows } = await admin
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', prefix + '%')
    .order('invoice_number', { ascending: false })
    .limit(50);

  // Ambil angka tertinggi; nomor manual non-numerik (mis. ".../ABC") diabaikan, bukan menghasilkan "NaN".
  let max = 0;
  for (const r of rows || []) {
    const tail = String(r.invoice_number || '').slice(prefix.length);
    if (/^\d+$/.test(tail)) max = Math.max(max, parseInt(tail, 10));
  }
  return prefix + String(max + 1).padStart(4, '0');
}
