'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Invoice, InvoiceItem, Customer } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import CustomerPicker from '@/components/CustomerPicker';

type Item = {
  description: string;
  qty: number;
  unit_price: number;
  product_id: string | null;
};

type Product = { id: string; name: string; price: number };

export default function InvoiceForm({
  initial,
  initialItems,
  products,
  initialCustomer,
}: {
  initial: Invoice | null;
  initialItems: InvoiceItem[];
  products: Product[];
  initialCustomer?: Customer | null;
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoice_number || '');
  const [loadingNumber, setLoadingNumber] = useState(!initial);
  const [customer, setCustomer] = useState<Customer | null>(initialCustomer || null);

  const [form, setForm] = useState({
    invoice_date: initial?.invoice_date || today,
    due_date: initial?.due_date || '',
    status: initial?.status || 'draft',
    payment_method: initial?.payment_method || '',
    notes: initial?.notes || '',
    discount: initial?.discount || 0,
    tax: initial?.tax || 0,
    customer_name: initial?.customer_name || '',
    customer_email: initial?.customer_email || '',
    customer_phone: initial?.customer_phone || '',
    customer_address: initial?.customer_address || '',
  });

  const [items, setItems] = useState<Item[]>(
    initialItems.length > 0
      ? initialItems.map((it) => ({
          description: it.description,
          qty: it.qty,
          unit_price: it.unit_price,
          product_id: it.product_id,
        }))
      : [{ description: '', qty: 1, unit_price: 0, product_id: null }]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate invoice number (hanya untuk kwitansi baru)
  useEffect(() => {
    if (initial || invoiceNumber) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/invoices/next-number');
        const data = await res.json();
        if (mounted && data.number) setInvoiceNumber(data.number);
      } catch { /* ignore */ }
      finally { if (mounted) setLoadingNumber(false); }
    })();
    return () => { mounted = false; };
  }, [initial, invoiceNumber]);

  // Auto-fill dari customer terpilih
  useEffect(() => {
    if (customer) {
      setForm((f) => ({
        ...f,
        customer_name: customer.name,
        customer_email: customer.email || '',
        customer_phone: customer.phone || '',
        customer_address: customer.address || '',
      }));
    }
  }, [customer]);

  const subtotal = items.reduce((s, i) => s + i.qty * i.unit_price, 0);
  const total = Math.max(0, subtotal - form.discount + form.tax);

  function updateItem(idx: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: '', qty: 1, unit_price: 0, product_id: null }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  function pickProduct(idx: number, productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    updateItem(idx, { product_id: p.id, description: p.name, unit_price: p.price });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const cleanItems = items.filter((it) => it.description.trim());

    const payload = {
      ...form,
      invoice_number: invoiceNumber,
      customer_id: customer?.id || null,
      customer_id_display: customer?.customer_code || '',
      due_date: form.due_date || null,
      discount: Number(form.discount) || 0,
      tax: Number(form.tax) || 0,
      items: cleanItems,
    };

    try {
      const url = initial ? `/api/admin/invoices/${initial.id}` : '/api/admin/invoices';
      const method = initial ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

      router.push(`/admin/kwitansi/${data.id || initial?.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 9, background: '#fee2e2', color: '#991b1b', fontSize: '.86rem', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* NOMOR KWITANSI */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Nomor Kwitansi</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {loadingNumber ? (
            <div style={{ padding: '14px 20px', fontFamily: 'SF Mono, Consolas, monospace', fontSize: '1.15rem', color: '#94a3b8' }}>
              Membuat nomor…
            </div>
          ) : (
            <>
              <div style={{
                padding: '14px 20px',
                fontFamily: 'SF Mono, Consolas, monospace',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#2563eb',
                background: '#eff6ff',
                borderRadius: 10,
                border: '1px solid #bfdbfe',
                letterSpacing: '.02em',
              }}>
                {invoiceNumber}
              </div>
              <span style={{ fontSize: '.78rem', color: '#64748b' }}>
                Dibuat otomatis, tidak bisa diubah
              </span>
            </>
          )}
        </div>
      </div>

      {/* PELANGGAN */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Pelanggan</h3>
        <CustomerPicker value={customer} onChange={setCustomer} />

        {!customer && (
          <>
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: '.82rem', color: '#92400e' }}>
              Belum pilih pelanggan. Isi manual di bawah atau pilih dari daftar.
            </div>

            <div className="admin-form-grid" style={{ marginTop: 16 }}>
              <div>
                <label>Nama Pelanggan *</label>
                <input type="text" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
                <label>Email</label>
                <input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
              </div>
              <div>
                <label>Telepon</label>
                <input type="text" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
                <label>Alamat</label>
                <textarea rows={2} value={form.customer_address} onChange={(e) => setForm({ ...form, customer_address: e.target.value })} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* INFO KWITANSI */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Informasi Kwitansi</h3>
        <div className="admin-form-grid">
          <div>
            <label>Tanggal</label>
            <input type="date" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} required />
            <label>Jatuh Tempo</label>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div>
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="draft">Draft</option>
              <option value="terkirim">Terkirim</option>
              <option value="dibayar">Lunas</option>
              <option value="batal">Batal</option>
            </select>
            <label>Metode Pembayaran</label>
            <input type="text" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} placeholder="Transfer BCA / Tunai / QRIS" />
          </div>
        </div>
      </div>

      {/* ITEMS */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Item Kwitansi</h3>

        <div style={{ display: 'grid', gap: 10 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 80px 140px 130px 40px', gap: 8, alignItems: 'center' }}>
              <select value={item.product_id || ''} onChange={(e) => pickProduct(idx, e.target.value)} style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 8 }}>
                <option value="">— Pilih produk —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input type="text" placeholder="Deskripsi item" value={item.description} onChange={(e) => updateItem(idx, { description: e.target.value })} style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
              <input type="number" min="1" value={item.qty} onChange={(e) => updateItem(idx, { qty: parseInt(e.target.value) || 1 })} style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
              <input type="number" min="0" value={item.unit_price} onChange={(e) => updateItem(idx, { unit_price: parseInt(e.target.value) || 0 })} style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 8 }} />
              <input type="text" readOnly value={formatRupiah(item.qty * item.unit_price)} style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--bg-soft)' }} />
              <button type="button" onClick={() => removeItem(idx)} className="btn btn-danger btn-icon" disabled={items.length <= 1}>×</button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addItem} className="btn btn-ghost" style={{ marginTop: 12 }}>
          + Tambah Item
        </button>
      </div>

      {/* TOTALS */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Total & Catatan</h3>
        <div className="admin-form-grid">
          <div>
            <label>Catatan</label>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '.92rem' }}>
              <span>Subtotal</span><b>{formatRupiah(subtotal)}</b>
            </div>
            <label>Diskon (Rp)</label>
            <input type="number" min="0" value={form.discount} onChange={(e) => setForm({ ...form, discount: parseInt(e.target.value) || 0 })} />
            <label>Pajak (Rp)</label>
            <input type="number" min="0" value={form.tax} onChange={(e) => setForm({ ...form, tax: parseInt(e.target.value) || 0 })} />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '2px solid var(--ink)', marginTop: 12 }}>
              <b style={{ fontSize: '1.05rem' }}>Total</b>
              <b style={{ color: 'var(--blue)', fontSize: '1.15rem' }}>{formatRupiah(total)}</b>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="button" onClick={() => router.back()} className="btn btn-ghost">Batal</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan Kwitansi'}
        </button>
      </div>
    </form>
  );
}