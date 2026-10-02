'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TemplateSwitcher from './TemplateSwitcher';

type Setting = { key: string; value: string; category?: string };

const GROUPS = [
  { key: 'brand', title: '🎨 Identitas Brand', keys: ['site_name','site_tagline','site_description','brand_logo_text','brand_tagline','brand_address','brand_logo_url','brand_favicon_url','brand_primary_color','brand_secondary_color'] },
  { key: 'contact', title: '📞 Kontak', keys: ['contact_email','contact_whatsapp','social_instagram','social_tiktok'] },
  { key: 'hero', title: '🖼️ Hero Landing Page', keys: ['hero_eyebrow','hero_title','hero_subtitle'] },
  { key: 'stats', title: '📊 Statistik', keys: ['stat_customers','stat_products','stat_rating','stat_ontime'] },
  { key: 'bank', title: '🏦 Rekening', keys: ['brand_bank_name','brand_bank_account','brand_bank_holder'] },
  { key: 'invoice', title: '📄 Kwitansi', keys: ['invoice_template','invoice_footer_note','invoice_thank_you','invoice_strip_text','invoice_primary_color','invoice_accent_color','invoice_show_qr','invoice_qr_caption','invoice_signature_name','invoice_signature_title'] },
  { key: 'listrik', title: '⚡ Listrik & Utilitas', keys: ['listrik_default_admin_fee','listrik_default_penalty'] },
  { key: 'notif', title: '🔔 Notifikasi', keys: ['whatsapp_template'] },
];

export default function SettingsForm({ initial }: { initial: Setting[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(initial.map((s) => [s.key, s.value || '']))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

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

  function isColor(key: string) { return key.includes('color'); }
  function isImage(key: string) { return key.includes('logo') || key.includes('favicon'); }
  function isBool(key: string) { return key === 'invoice_show_qr' || key === 'app_maintenance'; }
  function isLong(key: string, value: string) {
    return value.length > 60 || ['hero_subtitle','site_description','hero_title','invoice_footer_note','whatsapp_template','app_maintenance_message'].includes(key);
  }

  async function uploadFile(key: string, file: File) {
    setUploading(key);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload gagal');
      set(key, data.url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(null);
    }
  }

  const knownKeys = new Set(GROUPS.flatMap((g) => g.keys));
  const unknownKeys = initial.filter((s) => !knownKeys.has(s.key));

  return (
    <form onSubmit={handleSubmit}>
      {GROUPS.map((group) => {
        const items = initial.filter((s) => group.keys.includes(s.key));
        if (items.length === 0) return null;
        return (
          <div key={group.key} className="admin-card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>{group.title}</h3>

            {group.key === 'invoice' && (
              <div style={{ marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                <div style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 12, color: '#0b2745' }}>
                  Model Kwitansi
                </div>
                <TemplateSwitcher current={values.invoice_template || 'v3'} />
              </div>
            )}

            <div className="admin-form-grid">
              {items.filter((s) => s.key !== 'invoice_template').map((s) => (
                <div key={s.key}>
                  <label>{humanize(s.key)}</label>

                  {isImage(s.key) ? (
                    <div>
                      {values[s.key] && (
                        <div style={{ marginBottom: 10 }}>
                          <img src={values[s.key]} alt="Preview"
                            style={{ maxWidth: 120, maxHeight: 120, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 10, padding: 8, background: '#fff' }} />
                        </div>
                      )}
                      <input type="file" accept="image/*"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(s.key, f); }}
                        disabled={uploading === s.key} />
                      {uploading === s.key && <p style={{ fontSize: '.78rem', color: '#2563eb', marginTop: 4 }}>Mengunggah…</p>}
                    </div>
                  ) : isColor(s.key) ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input type="color" value={values[s.key] || '#2563eb'} onChange={(e) => set(s.key, e.target.value)}
                        style={{ width: 60, height: 44, padding: 4, cursor: 'pointer' }} />
                      <input type="text" value={values[s.key] || ''} onChange={(e) => set(s.key, e.target.value)} style={{ flex: 1 }} />
                    </div>
                  ) : isBool(s.key) ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 9, background: '#fff' }}>
                      <input type="checkbox" checked={values[s.key] === 'true'} onChange={(e) => set(s.key, e.target.checked ? 'true' : 'false')} />
                      <span style={{ fontSize: '.86rem' }}>Aktifkan</span>
                    </label>
                  ) : isLong(s.key, values[s.key] || '') ? (
                    <textarea rows={3} value={values[s.key] || ''} onChange={(e) => set(s.key, e.target.value)} />
                  ) : (
                    <input type="text" value={values[s.key] || ''} onChange={(e) => set(s.key, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {unknownKeys.length > 0 && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 16 }}>🔧 Lainnya</h3>
          <div className="admin-form-grid">
            {unknownKeys.map((s) => (
              <div key={s.key}>
                <label>{humanize(s.key)}</label>
                <input type="text" value={values[s.key] || ''} onChange={(e) => set(s.key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 12, padding: 16, background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 12, position: 'sticky', bottom: 16, boxShadow: '0 -4px 20px rgba(15,23,42,.06)',
      }}>
        {saved ? (
          <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Tersimpan</span>
        ) : (
          <span style={{ color: '#64748b', fontSize: '.82rem' }}>Perubahan tersimpan setelah menekan Simpan.</span>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
        </button>
      </div>
    </form>
  );
}