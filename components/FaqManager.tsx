'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Faq } from '@/lib/types';

export default function FaqManager({ initial }: { initial: Faq[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!form.question.trim() || !form.answer.trim()) return;
    setBusy(true);
    const res = await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sort_order: items.length + 1 }),
    });
    setBusy(false);
    if (res.ok) {
      setForm({ question: '', answer: '' });
      router.refresh();
      const r = await fetch('/api/admin/faqs').then((x) => x.json()).catch(() => null);
      if (r?.data) setItems(r.data);
    }
  }

  async function remove(id: string) {
    if (!confirm('Hapus FAQ ini?')) return;
    setBusy(true);
    const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) {
      setItems((p) => p.filter((x) => x.id !== id));
      router.refresh();
    }
  }

  return (
    <>
      <div className="admin-card">
        <h3>Tambah FAQ</h3>
        <input placeholder="Pertanyaan" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9, marginBottom: 12 }} />
        <textarea placeholder="Jawaban" rows={3} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 9, marginBottom: 12, fontFamily: 'inherit' }} />
        <button onClick={add} disabled={busy || !form.question.trim() || !form.answer.trim()} className="btn btn-primary">
          + Tambah FAQ
        </button>
      </div>

      <div className="admin-card">
        <h3>Daftar FAQ ({items.length})</h3>
        {items.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '20px 0' }}>Belum ada FAQ.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((f) => (
              <div key={f.id} style={{ padding: 18, border: '1px solid var(--line)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{f.question}</div>
                    <div style={{ fontSize: '.88rem', color: 'var(--ink-2)' }}>{f.answer}</div>
                  </div>
                  <button onClick={() => remove(f.id)} disabled={busy} className="btn btn-danger btn-icon">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}