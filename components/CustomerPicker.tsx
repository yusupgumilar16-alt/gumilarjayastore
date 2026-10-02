'use client';

import { useEffect, useRef, useState } from 'react';
import type { Customer } from '@/lib/types';
import { ID_TYPE_OPTIONS, detectIdType, formatCustomerId } from '@/lib/customer-helpers';

interface CustomerIdInput {
  id_type: string;
  id_label: string;
  id_number: string;
}

interface Props {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
}

export default function CustomerPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Search with debounce
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.data || []);
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  if (value) {
    return (
      <div style={{ padding: 16, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', color: '#0284c7', fontWeight: 700, marginBottom: 4 }}>
              Pelanggan Terpilih
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 2 }}>
              {value.name} <span style={{ color: '#64748b', fontSize: '.82rem', fontWeight: 500 }}>({value.customer_code})</span>
            </div>
            {value.email && <div style={{ fontSize: '.82rem', color: '#334155' }}>{value.email}</div>}
            {value.phone && <div style={{ fontSize: '.82rem', color: '#334155' }}>{value.phone}</div>}
            {value.address && <div style={{ fontSize: '.82rem', color: '#334155', marginTop: 2 }}>{value.address}</div>}
            {value.ids && value.ids.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {value.ids.map((id) => (
                  <span key={id.id} style={{
                    fontSize: '.72rem',
                    padding: '3px 10px',
                    borderRadius: 99,
                    background: '#fff',
                    border: '1px solid #bae6fd',
                    color: '#075985',
                    fontWeight: 600,
                  }}>
                    {formatCustomerId(id.id_type as any, id.id_number)}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setQuery(''); }}
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: '.78rem' }}
          >
            Ganti
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Ketik nama pelanggan, kode, atau email…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        style={{
          width: '100%',
          padding: '11px 14px',
          border: '1px solid var(--line)',
          borderRadius: 9,
          fontSize: '.9rem',
          outline: 'none',
        }}
      />

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: 12,
          boxShadow: '0 12px 32px rgba(15,23,42,.12)',
          zIndex: 50,
          maxHeight: 340,
          overflowY: 'auto',
        }}>
          {loading && (
            <div style={{ padding: 16, color: '#64748b', fontSize: '.86rem' }}>Mencari…</div>
          )}

          {!loading && results.length > 0 && (
            <div>
              {results.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(c); setOpen(false); setQuery(''); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 2 }}>
                    {c.name} <span style={{ color: '#64748b', fontWeight: 500 }}>({c.customer_code})</span>
                  </div>
                  <div style={{ fontSize: '.78rem', color: '#64748b' }}>
                    {[c.email, c.phone].filter(Boolean).join(' · ') || '—'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div style={{ padding: 16, color: '#64748b', fontSize: '.86rem' }}>
              Pelanggan tidak ditemukan.
            </div>
          )}

          <button
            type="button"
            onClick={() => { setShowNewForm(true); setOpen(false); }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '14px 16px',
              background: '#f0f9ff',
              border: 'none',
              borderTop: '1px solid #bae6fd',
              cursor: 'pointer',
              color: '#0284c7',
              fontWeight: 700,
              fontSize: '.86rem',
            }}
          >
            + Tambah Pelanggan Baru
          </button>
        </div>
      )}

      {showNewForm && (
        <NewCustomerModal
          onClose={() => setShowNewForm(false)}
          onCreated={(c) => { onChange(c); setShowNewForm(false); setQuery(''); }}
        />
      )}
    </div>
  );
}

// ---------- MODAL TAMBAH PELANGGAN BARU ----------
function NewCustomerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (c: Customer) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [ids, setIds] = useState<CustomerIdInput[]>([{ id_type: 'pln', id_label: 'ID PLN', id_number: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateId(idx: number, patch: Partial<CustomerIdInput>) {
    setIds((prev) => prev.map((i, n) => n === idx ? { ...i, ...patch } : i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, address, notes,
          ids: ids.filter((i) => i.id_number.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

      // Fetch ulang dengan IDs
      const detail = await fetch(`/api/admin/customers/${data.customer.id}`).then((r) => r.json());
      onCreated(detail.data || data.customer);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,.5)',
        zIndex: 100,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 18,
          maxWidth: 620,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(15,23,42,.24)',
        }}
      >
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Tambah Pelanggan Baru</h3>
            <p style={{ margin: '4px 0 0', fontSize: '.82rem', color: 'var(--muted)' }}>
              Kode pelanggan akan dibuat otomatis.
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ fontSize: '1.4rem', color: '#94a3b8', padding: 4 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 9, background: '#fee2e2', color: '#991b1b', fontSize: '.86rem', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, marginBottom: 6 }}>Nama Pelanggan *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} autoFocus
            style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9, fontSize: '.9rem', outline: 'none' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9, fontSize: '.9rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, marginBottom: 6 }}>Telepon / WA</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9, fontSize: '.9rem', outline: 'none' }} />
            </div>
          </div>

          <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, marginTop: 14, marginBottom: 6 }}>Alamat</label>
          <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9, fontSize: '.9rem', outline: 'none', fontFamily: 'inherit' }} />

          <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
            <div style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#64748b', marginBottom: 12 }}>
              ID Pelanggan (opsional, bisa lebih dari satu)
            </div>

            {ids.map((id, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 40px', gap: 8, marginBottom: 8 }}>
                <select
                  value={id.id_type}
                  onChange={(e) => {
                    const t = e.target.value;
                    const opt = ID_TYPE_OPTIONS.find((o) => o.value === t);
                    updateId(idx, { id_type: t, id_label: opt?.label || 'ID' });
                  }}
                  style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: '.86rem' }}
                >
                  {ID_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder={ID_TYPE_OPTIONS.find((o) => o.value === id.id_type)?.hint || 'Nomor ID'}
                  value={id.id_number}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Auto-detect tipe kalau user belum pilih tipe
                    updateId(idx, { id_number: val });
                  }}
                  style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: '.86rem', fontFamily: 'SF Mono, Consolas, monospace' }}
                />
                <button
                  type="button"
                  onClick={() => setIds((prev) => prev.filter((_, i) => i !== idx))}
                  disabled={ids.length <= 1}
                  className="btn btn-danger"
                  style={{ padding: 0, opacity: ids.length <= 1 ? .4 : 1 }}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setIds((prev) => [...prev, { id_type: 'lainnya', id_label: 'ID Lainnya', id_number: '' }])}
              className="btn btn-ghost"
              style={{ fontSize: '.8rem', padding: '6px 12px' }}
            >
              + Tambah ID
            </button>
          </div>

          <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, marginTop: 14, marginBottom: 6 }}>Catatan</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9, fontSize: '.9rem', outline: 'none', fontFamily: 'inherit' }} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={saving}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>
              {saving ? 'Menyimpan…' : 'Simpan Pelanggan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}