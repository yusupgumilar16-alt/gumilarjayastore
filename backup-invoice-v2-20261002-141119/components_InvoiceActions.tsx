'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Invoice } from '@/lib/types';

export default function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

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
      <h3>Aksi</h3>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <Link href={`/admin/kwitansi/${invoice.id}/edit`} className="btn btn-ghost">Edit Kwitansi</Link>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ alignSelf: 'center', fontSize: '.85rem', color: 'var(--muted)', marginRight: 6 }}>Ubah status:</span>
        {['draft', 'terkirim', 'dibayar', 'batal'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            disabled={busy || invoice.status === s}
            className={`btn ${invoice.status === s ? 'btn-primary' : 'btn-ghost'} btn-icon`}
          >
            {s}
          </button>
        ))}
      </div>

      <button onClick={remove} disabled={busy} className="btn btn-danger">
        Hapus Kwitansi
      </button>
    </div>
  );
}