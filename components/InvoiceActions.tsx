'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Invoice } from '@/lib/types';

export default function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isPaid = invoice.status === 'dibayar';

  async function setStatus(status: string) {
    setBusy(true);
    await fetch(`/api/admin/invoices/${invoice.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Hapus kwitansi ${invoice.invoice_number}?`)) return;
    setBusy(true);
    await fetch(`/api/admin/invoices/${invoice.id}`, { method: 'DELETE' });
    setBusy(false);
    router.push('/admin/kwitansi');
    router.refresh();
  }

  return (
    <div className="admin-card">
      <h3>Aksi Kwitansi</h3>

      {/* TOMBOL LUNAS BESAR */}
      <div style={{ marginBottom: 20 }}>
        {!isPaid ? (
          <button
            onClick={() => setStatus('dibayar')}
            disabled={busy}
            style={{
              width: '100%',
              padding: '18px 24px',
              borderRadius: 14,
              background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)',
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: 700,
              letterSpacing: '.06em',
              border: 'none',
              cursor: busy ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              boxShadow: '0 8px 24px rgba(16,185,129,.3)',
              transition: 'all .18s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(16,185,129,.4)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,.3)'; }}
          >
            {busy ? 'MEMPROSES…' : '✓  TANDAI LUNAS'}
          </button>
        ) : (
          <div style={{
            padding: '18px 24px',
            borderRadius: 14,
            background: '#f0fdf4',
            border: '2px solid #10b981',
            textAlign: 'center',
            marginBottom: 10,
          }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669', letterSpacing: '.06em' }}>
              ✓ KWITANSI LUNAS
            </div>
            <button
              onClick={() => setStatus('draft')}
              disabled={busy}
              style={{
                marginTop: 10,
                padding: '6px 14px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid #cbd5e1',
                fontSize: '.78rem',
                color: '#64748b',
                cursor: busy ? 'wait' : 'pointer',
              }}
            >
              Batalkan status LUNAS
            </button>
          </div>
        )}
      </div>

      {/* STATUS LAIN */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '.78rem', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
          Status lain:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'draft', label: 'Draft' },
            { key: 'terkirim', label: 'Terkirim' },
            { key: 'batal', label: 'Batal' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              disabled={busy || invoice.status === s.key}
              className={`btn ${invoice.status === s.key ? 'btn-primary' : 'btn-ghost'} btn-icon`}
              style={{ opacity: busy ? .6 : 1 }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* EDIT */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <Link href={`/admin/kwitansi/${invoice.id}/edit`} className="btn btn-ghost">
          Edit Kwitansi
        </Link>
        <a
          href={`/invoice/${invoice.public_token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
        >
          Lihat Publik
        </a>
      </div>

      {/* DELETE */}
      <div style={{ paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <button onClick={remove} disabled={busy} className="btn btn-danger" style={{ width: '100%' }}>
          Hapus Kwitansi
        </button>
      </div>
    </div>
  );
}