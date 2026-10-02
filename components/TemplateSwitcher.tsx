'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TemplateSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const templates = [
    { id: 'v3', name: 'Modern Band', emoji: '🎨' },
    { id: 'v4', name: 'Company Curve', emoji: '📊' },
  ];

  async function switchTo(id: string) {
    if (id === current) return;
    setLoading(id);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_template: id }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="template-switcher no-print">
      <span className="template-switcher-label">Model Kwitansi:</span>
      <div className="template-switcher-buttons">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTo(t.id)}
            disabled={loading !== null}
            className={`template-switcher-btn ${current === t.id ? 'active' : ''}`}
          >
            <span>{t.emoji}</span>
            <span>{t.name}</span>
            {loading === t.id && <span style={{ marginLeft: 4 }}>…</span>}
          </button>
        ))}
      </div>
    </div>
  );
}