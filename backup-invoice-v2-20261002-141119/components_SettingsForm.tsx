'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Setting = { key: string; value: string };

export default function SettingsForm({ initial }: { initial: Setting[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(initial.map((s) => [s.key, s.value || '']))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert('Gagal menyimpan.');
    }
  }

  function set(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function humanize(key: string) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-grid">
        {initial.map((s) => {
          const isLong = (s.value || '').length > 60 || ['hero_subtitle', 'site_description', 'hero_title'].includes(s.key);
          return (
            <div key={s.key}>
              <label>{humanize(s.key)}</label>
              {isLong ? (
                <textarea
                  rows={3}
                  value={values[s.key] || ''}
                  onChange={(e) => set(s.key, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  value={values[s.key] || ''}
                  onChange={(e) => set(s.key, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="admin-form-actions">
        {saved && (
          <span style={{ marginRight: 'auto', color: '#16a34a', fontWeight: 600, alignSelf: 'center' }}>
            ✓ Tersimpan
          </span>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
        </button>
      </div>
    </form>
  );
}
