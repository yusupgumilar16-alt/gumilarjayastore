'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckInvoiceForm() {
  const router = useRouter();
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const clean = number.trim().toUpperCase();
    if (!clean) {
      setError('Masukkan nomor kwitansi');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/check-invoice?number=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!res.ok || !data.token) {
        setError(data.error || 'Kwitansi tidak ditemukan. Periksa kembali nomor Anda.');
        setLoading(false);
        return;
      }

      router.push(`/invoice/${data.token}`);
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 10,
          background: '#fee2e2',
          color: '#991b1b',
          fontSize: '.86rem',
          marginBottom: 16,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.1rem' }}>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <label style={{
        display: 'block',
        fontSize: '.82rem',
        fontWeight: 700,
        marginBottom: 8,
        color: '#334155',
        letterSpacing: '.02em',
      }}>
        Nomor Kwitansi
      </label>

      <input
        type="text"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="INV/2026/10/0001"
        autoFocus
        style={{
          width: '100%',
          padding: '14px 18px',
          border: '2px solid #e2e8f0',
          borderRadius: 12,
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '.02em',
          outline: 'none',
          fontFamily: 'SF Mono, Consolas, monospace',
          transition: 'border-color .18s',
          background: '#fff',
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
      />

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
        style={{
          width: '100%',
          marginTop: 18,
          padding: '15px 24px',
          fontSize: '.95rem',
          borderRadius: 12,
        }}
      >
        {loading ? 'Mencari…' : 'Cari Kwitansi'}
      </button>
    </form>
  );
}