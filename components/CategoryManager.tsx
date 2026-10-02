'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/lib/types';
import { slugify } from '@/lib/utils';

export default function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [busy, setBusy] = useState(false);

  async function addCategory() {
    if (!newName.trim()) return;
    setBusy(true);
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        slug: slugify(newName),
        description: newDesc,
        sort_order: items.length + 1,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setNewName('');
      setNewDesc('');
      router.refresh();
      const r = await fetch('/api/admin/categories').then((x) => x.json()).catch(() => null);
      if (r?.data) setItems(r.data);
    }
  }

  async function updateCategory(id: string, patch: Partial<Category>) {
    setBusy(true);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setBusy(false);
    if (res.ok) {
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      router.refresh();
    }
  }

  async function deleteCategory(id: string, name: string) {
    if (!confirm(`Hapus kategori "${name}"? Produk dalam kategori ini akan kehilangan kategori.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) {
      setItems((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    }
  }

  return (
    <>
      <div className="admin-card">
        <h3>Tambah Kategori Baru</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, marginBottom: 6 }}>Nama</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Kategori baru"
              style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, marginBottom: 6 }}>Deskripsi</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Deskripsi singkat"
              style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9 }}
            />
          </div>
          <button
            onClick={addCategory}
            disabled={busy || !newName.trim()}
            className="btn btn-primary"
            style={{ padding: '11px 20px' }}
          >
            + Tambah
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h3>Daftar Kategori ({items.length})</h3>
        {items.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '20px 0' }}>Belum ada kategori.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Slug</th>
                <th>Deskripsi</th>
                <th>Urutan</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <CategoryRow
                  key={c.id}
                  category={c}
                  onUpdate={(patch) => updateCategory(c.id, patch)}
                  onDelete={() => deleteCategory(c.id, c.name)}
                  busy={busy}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function CategoryRow({
  category,
  onUpdate,
  onDelete,
  busy,
}: {
  category: Category;
  onUpdate: (patch: Partial<Category>) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [name, setName] = useState(category.name);
  const [desc, setDesc] = useState(category.description);
  const [order, setOrder] = useState(category.sort_order);

  const changed =
    name !== category.name || desc !== category.description || order !== category.sort_order;

  return (
    <tr>
      <td><input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 7 }} /></td>
      <td><code style={{ fontSize: '.8rem' }}>{category.slug}</code></td>
      <td><input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 7 }} /></td>
      <td><input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} style={{ width: 70, padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 7 }} /></td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {changed && (
          <button
            onClick={() => onUpdate({ name, description: desc, sort_order: order })}
            className="btn btn-ghost btn-icon"
            disabled={busy}
          >
            Simpan
          </button>
        )}
        <button onClick={onDelete} className="btn btn-danger btn-icon" disabled={busy}>
          Hapus
        </button>
      </td>
    </tr>
  );
}
