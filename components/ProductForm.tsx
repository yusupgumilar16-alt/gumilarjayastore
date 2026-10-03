'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Category, Product } from '@/lib/types';

export default function ProductForm({
  initial,
  categories,
}: {
  initial: Product | null;
  categories: Category[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState(initial?.image || '');
  const [uploading, setUploading] = useState(false);
  const [isListrik, setIsListrik] = useState(initial?.service_type === 'listrik');

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload gagal');
      setImage(data.url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const payload: any = {
      name: fd.get('name'),
      category_id: fd.get('category_id') || null,
      type: fd.get('type') || 'digital',
      price: parseInt(String(fd.get('price'))) || 0,
      discount_price: fd.get('discount_price') ? parseInt(String(fd.get('discount_price'))) : null,
      description: fd.get('description') || '',
      image: image || null,
      stock: parseInt(String(fd.get('stock'))) || 0,
      download_url: fd.get('download_url') || null,
      is_featured: fd.get('is_featured') === 'on',
      is_new: fd.get('is_new') === 'on',
      service_type: isListrik ? 'listrik' : null,
      requires_manual_price: isListrik || fd.get('requires_manual_price') === 'on',
      default_admin_fee: parseInt(String(fd.get('default_admin_fee'))) || 0,
    };

    try {
      const url = initial ? `/api/admin/products/${initial.id}` : '/api/admin/products';
      const method = initial ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      router.push('/admin/produk');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card">
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 9, background: '#fee2e2', color: '#991b1b', fontSize: '.86rem', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="admin-form-grid">
        <div>
          <label>Nama Produk *</label>
          <input type="text" name="name" required defaultValue={initial?.name || ''} />

          <label>Kategori</label>
          <select name="category_id" defaultValue={initial?.category_id || ''}>
            <option value="">— Pilih kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label>Tipe</label>
          <select name="type" defaultValue={initial?.type || 'digital'}>
            <option value="digital">Digital</option>
            <option value="fisik">Fisik</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '10px 14px', background: '#fef3c7', borderRadius: 9 }}>
            <input type="checkbox" checked={isListrik} onChange={(e) => setIsListrik(e.target.checked)} />
            <span style={{ fontWeight: 600, fontSize: '.88rem' }}>⚡ Produk Listrik & Utilitas</span>
          </label>

          <label>Deskripsi</label>
          <textarea name="description" rows={5} defaultValue={initial?.description || ''} />
        </div>

        <div>
          <label>Harga (Rp) *</label>
          <input type="number" name="price" required min="0" defaultValue={initial?.price || 0} />

          <label>Harga Diskon (opsional)</label>
          <input type="number" name="discount_price" min="0" defaultValue={initial?.discount_price || ''} />

          <label>Stok</label>
          <input type="number" name="stock" min="0" defaultValue={initial?.stock || 0} />

          {isListrik && (
            <>
              <label>Biaya Admin Default (Rp)</label>
              <input type="number" name="default_admin_fee" min="0" defaultValue={initial?.default_admin_fee || 2500} />
            </>
          )}

          <label>Link Download (digital)</label>
          <input type="text" name="download_url" defaultValue={initial?.download_url || ''} />

          <label>Gambar Produk</label>
          {image && (
            <div style={{ marginBottom: 10 }}>
              <img src={image} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0' }} />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImage} disabled={uploading} />
          {uploading && <p style={{ fontSize: '.8rem', color: '#2563eb', marginTop: 6 }}>Mengunggah…</p>}

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontWeight: 500 }}>
            <input type="checkbox" name="is_featured" defaultChecked={initial?.is_featured} />
            Tampilkan sebagai unggulan
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
            <input type="checkbox" name="is_new" defaultChecked={initial?.is_new} />
            Tandai sebagai produk baru
          </label>
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 10,
        paddingTop: 20, borderTop: '1px solid #e2e8f0', marginTop: 20,
      }}>
        <Link href="/admin/produk" className="btn btn-ghost">Batal</Link>
        <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
          {saving ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}