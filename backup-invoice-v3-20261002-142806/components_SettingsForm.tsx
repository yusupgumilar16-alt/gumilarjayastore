'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Setting = { key: string; value: string };

const GROUPS: { title: string; keys: string[] }[] = [
  {
    title: 'Identitas Brand',
    keys: ['site_name', 'site_tagline', 'site_description', 'brand_logo_text', 'brand_tagline', 'brand_address'],
  },
  {
    title: 'Kontak',
    keys: ['contact_email', 'contact_whatsapp', 'social_instagram', 'social_tiktok'],
  },
  {
    title: 'Hero Landing Page',
    keys: ['hero_eyebrow', 'hero_title', 'hero_subtitle'],
  },
  {
    title: 'Statistik Landing Page',
    keys: ['stat_customers', 'stat_products', 'stat_rating', 'stat_ontime'],
  },
  {
    title: 'Kwitansi — Rekening',
    keys: ['brand_bank_name', 'brand_bank_account', 'brand_bank_holder'],
  },
  {
    title: 'Kwitansi — Tampilan',
    keys: ['invoice_footer_note', 'invoice_thank_you', 'invoice_strip_text', 'invoice_primary_color', 'invoice_accent_color'],
  },
];

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

  function isColor(key: string) {
    return key.includes('color');
  }

  function isLong(key: string, value: string) {
    return value.length > 60 || ['hero_subtitle', 'site_description', 'hero_title', 'invoice_footer_note'].includes(key);
  }

  const knownKeys = new Set(GROUPS.flatMap((g) => g.keys));
  const unknownKeys = initial.filter((s) => !knownKeys.has(s.key));

  return (
    <form onSubmit={handleSubmit}>
      {GROUPS.map((group) => {
        const items = initial.filter((s) => group.keys.includes(s.key));
        if (items.length === 0) return null;
        return (
          <div key={group.title} className="admin-card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>{group.title}</h3>
            <div className="admin-form-grid">
              {items.map((s) => (
                <div key={s.key}>
                  <label>{humanize(s.key)}</label>
                  {isColor(s.key) ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="color"
                        value={values[s.key] || '#2563eb'}
                        onChange={(e) => set(s.key, e.target.value)}
                        style={{ width: 60, height: 44, padding: 4, cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={values[s.key] || ''}
                        onChange={(e) => set(s.key, e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  ) : isLong(s.key, values[s.key] || '') ? (
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
              ))}
            </div>
          </div>
        );
      })}

      {unknownKeys.length > 0 && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 16 }}>Lainnya</h3>
          <div className="admin-form-grid">
            {unknownKeys.map((s) => (
              <div key={s.key}>
                <label>{humanize(s.key)}</label>
                <input
                  type="text"
                  value={values[s.key] || ''}
                  onChange={(e) => set(s.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        position: 'sticky',
        bottom: 20,
        background: '#fff',
        padding: 16,
        borderRadius: 12,
        border: '1px solid var(--line)',
        boxShadow: '0 -4px 20px rgba(15,23,42,.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
      }}>
        {saved ? (
          <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '.92rem' }}>
            ✓ Pengaturan tersimpan
          </span>
        ) : (
          <span style={{ color: '#64748b', fontSize: '.82rem' }}>
            Perubahan tersimpan setelah menekan tombol.
          </span>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
        </button>
      </div>
    </form>
  );
}