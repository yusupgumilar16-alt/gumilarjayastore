// ============================================================
//  Perhitungan & validasi kwitansi — satu sumber kebenaran.
//  Dipakai form (client) DAN API (server) supaya angka yang
//  tampil di layar selalu sama dengan yang tersimpan.
//  File ini sengaja murni (tanpa import server/browser).
// ============================================================

export const INVOICE_STATUSES = ['draft', 'terkirim', 'dibayar', 'batal'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  terkirim: 'Terkirim',
  dibayar: 'Lunas',
  batal: 'Batal',
};

export function isInvoiceStatus(v: unknown): v is InvoiceStatus {
  return typeof v === 'string' && (INVOICE_STATUSES as readonly string[]).includes(v);
}

/** Ubah input apa pun menjadi bilangan bulat; nilai tidak valid -> fallback. */
export function toInt(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Tipe pembayaran selalu diturunkan dari metode (tidak dipercaya dari client). */
export function paymentTypeFor(method: string): 'tunai' | 'non_tunai' {
  return method.trim().toLowerCase() === 'tunai' ? 'tunai' : 'non_tunai';
}

/** Tanggal lokal (bukan UTC) format YYYY-MM-DD. Di WIB, toISOString() salah hari sebelum jam 07.00. */
export function localDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface CleanItem {
  product_id: string | null;
  description: string;
  qty: number;
  unit_price: number;
  subtotal: number;
  admin_fee: number;
  penalty: number;
}

/** Bersihkan daftar item: buang baris tanpa deskripsi, paksa qty >= 1 dan harga >= 0. */
export function cleanItems(raw: unknown): CleanItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CleanItem[] = [];
  for (const r of raw) {
    const description = str(r?.description);
    if (!description) continue;
    const qty = Math.max(1, toInt(r?.qty, 1));
    const unit_price = Math.max(0, toInt(r?.unit_price, 0));
    out.push({
      product_id: typeof r?.product_id === 'string' && r.product_id ? r.product_id : null,
      description,
      qty,
      unit_price,
      subtotal: qty * unit_price,
      admin_fee: Math.max(0, toInt(r?.admin_fee, 0)),
      penalty: Math.max(0, toInt(r?.penalty, 0)),
    });
  }
  return out;
}

export interface Totals {
  subtotal: number;
  discount: number;
  adminFee: number;
  total: number;
}

/** total = subtotal − diskon + biaya admin (tidak pernah negatif). */
export function computeTotals(items: { qty: number; unit_price: number }[], discount: unknown, adminFee: unknown): Totals {
  const subtotal = items.reduce((s, it) => s + Math.max(1, toInt(it.qty, 1)) * Math.max(0, toInt(it.unit_price, 0)), 0);
  const d = Math.max(0, toInt(discount, 0));
  const a = Math.max(0, toInt(adminFee, 0));
  return { subtotal, discount: d, adminFee: a, total: Math.max(0, subtotal - d + a) };
}

export interface InvoiceInput {
  customer_id: string | null;
  customer_id_display: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  invoice_number: string; // '' = dibuat otomatis (POST) / tidak diubah (PATCH)
  invoice_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  payment_method: string;
  payment_type: 'tunai' | 'non_tunai';
  notes: string;
  items: CleanItem[];
  subtotal: number;
  discount: number;
  admin_fee: number;
  total: number;
  /** true bila body membawa customer_id (PATCH hanya menimpa relasi pelanggan bila ada). */
  hasCustomerLink: boolean;
}

export type ValidationResult = { ok: true; value: InvoiceInput } | { ok: false; error: string };

const rupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

/** Validasi + normalisasi body kwitansi. Dipakai form dan API. */
export function validateInvoiceInput(b: any): ValidationResult {
  if (!b || typeof b !== 'object') return { ok: false, error: 'Data kwitansi tidak valid' };

  const customer_name = str(b.customer_name);
  if (!customer_name) return { ok: false, error: 'Pelanggan belum dipilih. Pilih dari database atau isi nama secara manual.' };

  const invoice_date = str(b.invoice_date);
  if (!DATE_RE.test(invoice_date)) return { ok: false, error: 'Tanggal kwitansi tidak valid' };

  const due_raw = str(b.due_date);
  if (due_raw && !DATE_RE.test(due_raw)) return { ok: false, error: 'Tanggal jatuh tempo tidak valid' };
  if (due_raw && due_raw < invoice_date) return { ok: false, error: 'Jatuh tempo tidak boleh lebih awal dari tanggal kwitansi' };

  const status = b.status === undefined || b.status === '' ? 'draft' : b.status;
  if (!isInvoiceStatus(status)) return { ok: false, error: 'Status kwitansi tidak valid' };

  const items = cleanItems(b.items);
  if (items.length === 0) return { ok: false, error: 'Isi minimal satu item (deskripsi wajib diisi)' };

  const totals = computeTotals(items, b.discount, b.admin_fee);
  if (totals.subtotal <= 0) return { ok: false, error: 'Harga item masih Rp 0. Isi harga item terlebih dahulu.' };
  if (totals.discount > totals.subtotal) {
    return { ok: false, error: `Diskon (${rupiah(totals.discount)}) melebihi subtotal (${rupiah(totals.subtotal)})` };
  }

  const payment_method = str(b.payment_method);

  return {
    ok: true,
    value: {
      customer_id: typeof b.customer_id === 'string' && b.customer_id ? b.customer_id : null,
      customer_id_display: str(b.customer_id_display),
      customer_name,
      customer_email: str(b.customer_email),
      customer_phone: str(b.customer_phone),
      customer_address: str(b.customer_address),
      invoice_number: str(b.invoice_number),
      invoice_date,
      due_date: due_raw || null,
      status,
      payment_method,
      payment_type: paymentTypeFor(payment_method),
      notes: typeof b.notes === 'string' ? b.notes : '',
      items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      admin_fee: totals.adminFee,
      total: totals.total,
      hasCustomerLink: 'customer_id' in b,
    },
  };
}
