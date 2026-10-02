'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Testimonial } from '@/lib/types';

export default function TestimonialManager({ initial }: { initial: Testimonial[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState({ name: '', city: '', product_type: '', content: '' });
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!form.name.trim() || !form.content.trim()) return;
    setBusy(true);
    const res = await fetch('/api/admin/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sort_order: items.length + 1 }),
    });
    setBusy(false);
    if (res.ok) {
      setForm({ name: '', city: '', product_type: '', content: '' });
      router.refresh();
      const r = await fetch('/api/admin/testimonials').then((x) => x.json()).catch(() => null);
      if (r?.data) setItems(r.data);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Hapus testimoni dari "${name}"?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) {
      setItems((p) => p.filter((x) => x.id !== id));
      router.refresh();
    }
  }

  return (
    <>
      <div className="admin-card">
        <h3>Tambah Testimoni</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <input placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9 }} />
          <input placeholder="Kota" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={{ padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9 }} />
          <input placeholder="Jenis produk" value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })} style={{ padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9 }} />
        </div>
        <textarea placeholder="Isi testimoni" rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9, marginBottom: 12, fontFamily: 'inherit' }} />
        <button onClick={add} disabled={busy || !form.name.trim() || !form.content.trim()} className="btn btn-primary">
          + Tambah Testimoni
        </button>
      </div>

      <div className="admin-card">
        <h3>Daftar Testimoni ({items.length})</h3>
        {items.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '20px 0' }}>Belum ada testimoni.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Nama</th><th>Kota</th><th>Produk</th><th>Isi</th><th style={{ textAlign: 'right' }}>Aksi</th></tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td><b>{t.name}</b></td>
                  <td>{t.city}</td>
                  <td>{t.product_type}</td>
                  <td style={{ maxWidth: 300 }}>{t.content}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => remove(t.id, t.name)} disabled={busy} className="btn btn-danger btn-icon">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}