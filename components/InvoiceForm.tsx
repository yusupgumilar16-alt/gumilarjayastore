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
  admin_fee: number;
  penalty: number;
};

type Product = { id: string; name: string; price: number; service_type?: string; default_admin_fee?: number };

const PAYMENT_METHODS = [
  'Tunai',
  'Transfer BCA',
  'Transfer Mandiri',
  'Transfer BNI',
  'Transfer BRI',
  'QRIS',
  'GoPay',
  'OVO',
  'DANA',
  'ShopeePay',
  'Lainnya',
];

const DEFAULT_ADMIN_FEE = 2500;

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

  const [customer, setCustomer] = useState<Customer | null>(initialCustomer || null);
  const [manualMode, setManualMode] = useState(false);

  const [form, setForm] = useState({
    invoice_number: initial?.invoice_number || '',
    customer_name: initial?.customer_name || '',
    customer_email: initial?.customer_email || '',
    customer_phone: initial?.customer_phone || '',
    customer_address: initial?.customer_address || '',
    invoice_date: initial?.invoice_date || today,
    due_date: initial?.due_date || '',
    status: initial?.status || 'draft',
    payment_method: initial?.payment_method || 'Tunai',
    payment_type: (initial as any)?.payment_type || 'tunai',
    notes: initial?.notes || '',
    discount: initial?.discount || 0,
    admin: (initial as any)?.admin_fee || DEFAULT_ADMIN_FEE,
  });

  const [items, setItems] = useState<Item[]>(
    initialItems.length > 0
      ? initialItems.map((it) => ({
          description: it.description,
          qty: it.qty,
          unit_price: it.unit_price,
          product_id: it.product_id,
          admin_fee: (it as any).admin_fee || 0,
          penalty: (it as any).penalty || 0,
        }))
      : [{
          description: '',
          qty: 1,
          unit_price: 0,
          product_id: null,
          admin_fee: 0,
          penalty: 0,
        }]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill dari customer terpilih
  useEffect(() => {
    if (customer && !manualMode) {
      setForm((f) => ({
        ...f,
        customer_name: customer.name,
        customer_email: customer.email || '',
        customer_phone: customer.phone || '',
        customer_address: customer.address || '',
      }));
    }
  }, [customer, manualMode]);

  // Auto-set payment_type berdasarkan payment_method
  useEffect(() => {
    const isTunai = form.payment_method === 'Tunai';
    setForm((f) => ({ ...f, payment_type: isTunai ? 'tunai' : 'non_tunai' }));
  }, [form.payment_method]);

  const subtotal = items.reduce((s, i) => s + i.qty * i.unit_price, 0);
  const adminFee = Number(form.admin) || 0;
  const total = Math.max(0, subtotal - form.discount + adminFee);

  function updateItem(idx: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, {
      description: '', qty: 1, unit_price: 0, product_id: null, admin_fee: 0, penalty: 0,
    }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  function pickProduct(idx: number, productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    updateItem(idx, {
      product_id: p.id,
      description: p.name,
      unit_price: p.price,
      admin_fee: p.default_admin_fee || 0,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const cleanItems = items.filter((it) => it.description.trim());

    const payload = {
      ...form,
      customer_id: customer?.id || null,
      customer_id_display: customer?.customer_code || '',
      due_date: form.due_date || null,
      discount: Number(form.discount) || 0,
      admin_fee: Number(form.admin) || 0,
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
    <form onSubmit={handleSubmit} className="admin-card">
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 9,
          background: '#fee2e2', color: '#991b1b',
          fontSize: '.86rem', marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {/* === PELANGGAN === */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Pelanggan</h3>
        <CustomerPicker
          value={customer}
          onChange={(c) => {
            setCustomer(c);
            setManualMode(!c);
          }}
          onManualFill={() => {
            setCustomer(null);
            setManualMode(true);
          }}
        />

        {manualMode && (
          <div className="admin-form-grid" style={{ marginTop: 16 }}>
            <div>
              <label>Nama Pelanggan *</label>
              <input type="text" value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
              <label>Email</label>
              <input type="email" value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
            </div>
            <div>
              <label>Telepon</label>
              <input type="text" value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
              <label>Alamat</label>
              <textarea rows={2} value={form.customer_address}
                onChange={(e) => setForm({ ...form, customer_address: e.target.value })} />
            </div>
          </div>
        )}
      </div>

      {/* === INFO KWITANSI === */}
      <div style={{ marginBottom: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Informasi Kwitansi</h3>
        <div className="admin-form-grid">
          <div>
            <label>Nomor Kwitansi</label>
            <input type="text" value={form.invoice_number}
              onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
              placeholder="Akan dibuat otomatis kalau kosong" />

            <label>Tanggal</label>
            <input type="date" value={form.invoice_date}
              onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} required />

            <label>Jatuh Tempo</label>
            <input type="date" value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div>
            <label>Status</label>
            <select value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="draft">Draft</option>
              <option value="terkirim">Terkirim</option>
              <option value="dibayar">Lunas</option>
              <option value="batal">Batal</option>
            </select>

            <label>Metode Pembayaran</label>
            <select value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <label>Tipe Pembayaran</label>
            <div style={{
              padding: '11px 14px', border: '1px solid #e2e8f0',
              borderRadius: 10, background: '#f8fafc',
              fontSize: '.85rem', fontWeight: 700,
              color: form.payment_type === 'tunai' ? '#059669' : '#2563eb',
            }}>
              {form.payment_type === 'tunai' ? '💵 TUNAI' : '💳 NON TUNAI'}
            </div>
          </div>
        </div>
      </div>

      {/* === ITEMS === */}
      <div style={{ marginBottom: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Item Kwitansi</h3>

        <div style={{ display: 'grid', gap: 8 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1.5fr 60px 120px 120px 40px',
              gap: 6, alignItems: 'center',
            }}>
              <select value={item.product_id || ''}
                onChange={(e) => pickProduct(idx, e.target.value)}
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '.85rem' }}>
                <option value="">— Produk —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input type="text" placeholder="Deskripsi" value={item.description}
                onChange={(e) => updateItem(idx, { description: e.target.value })}
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '.85rem' }} />
              <input type="number" min="1" value={item.qty}
                onChange={(e) => updateItem(idx, { qty: parseInt(e.target.value) || 1 })}
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '.85rem' }} />
              <input type="number" min="0" value={item.unit_price}
                onChange={(e) => updateItem(idx, { unit_price: parseInt(e.target.value) || 0 })}
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '.85rem' }}
                placeholder="Harga" />
              <input type="text" readOnly value={formatRupiah(item.qty * item.unit_price)}
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '.85rem', background: '#f8fafc' }} />
              <button type="button" onClick={() => removeItem(idx)} disabled={items.length <= 1}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: '1px solid #fecaca', background: '#fef2f2',
                  color: '#dc2626', cursor: 'pointer', fontSize: '1rem',
                }}>×</button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addItem} className="btn btn-ghost"
          style={{ marginTop: 12, fontSize: '.85rem' }}>
          + Tambah Item
        </button>
      </div>

      {/* === TOTAL === */}
      <div style={{ paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Total & Catatan</h3>
        <div className="admin-form-grid">
          <div>
            <label>Catatan</label>
            <textarea rows={4} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 14px', background: '#f8fafc',
              borderRadius: 8, fontSize: '.9rem',
            }}>
              <span style={{ color: '#64748b' }}>Subtotal</span>
              <b style={{ fontFamily: 'monospace' }}>{formatRupiah(subtotal)}</b>
            </div>

            <label style={{ marginTop: 4 }}>Admin (Rp)</label>
            <input type="number" min="0" value={form.admin}
              onChange={(e) => setForm({ ...form, admin: parseInt(e.target.value) || 0 })}
              style={{
                width: '100%', padding: '11px 14px',
                border: '1px solid #e2e8f0', borderRadius: 10,
                fontSize: '.9rem', fontWeight: 700,
              }} />
            <div style={{ fontSize: '.72rem', color: '#64748b', marginTop: -6 }}>
              Default: Rp {DEFAULT_ADMIN_FEE.toLocaleString('id-ID')}
            </div>

            <label>Diskon (Rp)</label>
            <input type="number" min="0" value={form.discount}
              onChange={(e) => setForm({ ...form, discount: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: '.9rem' }} />

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '14px 16px', background: '#eff6ff',
              borderRadius: 10, marginTop: 8,
            }}>
              <b style={{ fontSize: '1.05rem' }}>Total</b>
              <b style={{ color: '#2563eb', fontSize: '1.2rem', fontFamily: 'monospace' }}>
                {formatRupiah(total)}
              </b>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 10,
        paddingTop: 20, borderTop: '1px solid #e2e8f0', marginTop: 20,
      }}>
        <button type="button" onClick={() => router.back()} className="btn btn-ghost">Batal</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan Kwitansi'}
        </button>
      </div>
    </form>
  );
}