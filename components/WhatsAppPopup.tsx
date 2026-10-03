'use client';

import { useState, useEffect } from 'react';

interface Props {
  phone: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  templateOrder: string;
  templateGeneral: string;
  enabled: boolean;
}

export default function WhatsAppPopup({
  phone,
  title,
  subtitle,
  templateOrder,
  templateGeneral,
  enabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'menu' | 'order' | 'custom'>('menu');
  const [form, setForm] = useState({
    produk: '',
    jumlah: '1',
    nama: '',
    alamat: '',
    pesan: '',
  });

  useEffect(() => {
    setMounted(true);
    const saved = typeof window !== 'undefined' && sessionStorage.getItem('wa-popup-dismissed');
    if (saved === '1') return;
    const timer = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!enabled || !mounted || !phone) return null;

  function cleanPhone(p: string): string {
    let n = String(p).replace(/[^\d]/g, '');
    if (n.startsWith('0')) n = '62' + n.slice(1);
    if (!n.startsWith('62')) n = '62' + n;
    return n;
  }

  function dismiss() {
    setOpen(false);
    if (typeof window !== 'undefined') sessionStorage.setItem('wa-popup-dismissed', '1');
  }

  function buildMessage(): string {
    if (mode === 'order') {
      return templateOrder
        .replace(/{produk}/g, form.produk || '-')
        .replace(/{jumlah}/g, form.jumlah || '1')
        .replace(/{nama}/g, form.nama || '-')
        .replace(/{alamat}/g, form.alamat || '-');
    }
    return form.pesan || templateGeneral;
  }

  function sendWA() {
    const text = encodeURIComponent(buildMessage());
    const url = `https://wa.me/${cleanPhone(phone)}?text=${text}`;
    window.open(url, '_blank');
    dismiss();
  }

  return (
    <>
      <button
        type="button"
        className="wa-float"
        onClick={() => setOpen(!open)}
        aria-label="Chat WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff">
          <path d="M16.004 2C8.28 2 2 8.28 2 16.004c0 2.463.65 4.777 1.79 6.784L2 30l7.383-1.762A13.94 13.94 0 0 0 16.004 30C23.72 30 30 23.72 30 16.004S23.72 2 16.004 2zm0 25.5a11.44 11.44 0 0 1-5.83-1.596l-.418-.248-4.377 1.045 1.07-4.257-.272-.44A11.44 11.44 0 0 1 4.5 16.004c0-6.343 5.16-11.504 11.504-11.504s11.5 5.16 11.5 11.504S22.347 27.5 16.004 27.5z"/>
        </svg>
        <span className="wa-float-badge" />
      </button>

      {open && (
        <>
          <div className="wa-overlay" onClick={dismiss} />
          <div className="wa-modal">
            <div className="wa-modal-head">
              <div className="wa-modal-head-left">
                <div className="wa-avatar">💬</div>
                <div>
                  <div className="wa-modal-name">Gumilar Jaya Store</div>
                  <div className="wa-modal-status">
                    <span className="wa-dot" /> Biasanya balas &lt; 5 menit
                  </div>
                </div>
              </div>
              <button type="button" onClick={dismiss} className="wa-modal-close" aria-label="Tutup">×</button>
            </div>

            <div className="wa-modal-body">
              {mode === 'menu' && (
                <>
                  <div className="wa-modal-title">{title}</div>
                  <div className="wa-modal-subtitle">{subtitle}</div>

                  <button type="button" className="wa-option" onClick={() => setMode('order')}>
                    <span className="wa-option-icon">🛒</span>
                    <span className="wa-option-text">
                      <b>Pesan Produk</b>
                      <small>Isi form pesanan, otomatis ke WhatsApp</small>
                    </span>
                    <span className="wa-option-arrow">→</span>
                  </button>

                  <button type="button" className="wa-option" onClick={() => setMode('custom')}>
                    <span className="wa-option-icon">💬</span>
                    <span className="wa-option-text">
                      <b>Tanya Umum</b>
                      <small>Ketik pesan bebas</small>
                    </span>
                    <span className="wa-option-arrow">→</span>
                  </button>
                </>
              )}

              {mode === 'order' && (
                <>
                  <div className="wa-modal-title">Form Pesanan</div>
                  <div className="wa-modal-subtitle">Isi data, kami balas dengan harga & ketersediaan</div>

                  <label className="wa-label">Produk yang dipesan *</label>
                  <input
                    type="text"
                    className="wa-input"
                    value={form.produk}
                    onChange={(e) => setForm({ ...form, produk: e.target.value })}
                    placeholder="Contoh: Listrik Pascabayar"
                  />

                  <label className="wa-label">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    className="wa-input"
                    value={form.jumlah}
                    onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                  />

                  <label className="wa-label">Nama Anda *</label>
                  <input
                    type="text"
                    className="wa-input"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="Nama lengkap"
                  />

                  <label className="wa-label">Alamat / Catatan</label>
                  <textarea
                    rows={2}
                    className="wa-input"
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    placeholder="Alamat pengiriman atau catatan tambahan"
                  />

                  <div className="wa-actions">
                    <button type="button" className="wa-btn wa-btn-ghost" onClick={() => setMode('menu')}>← Kembali</button>
                    <button
                      type="button"
                      className="wa-btn wa-btn-primary"
                      onClick={sendWA}
                      disabled={!form.produk.trim() || !form.nama.trim()}
                    >
                      Kirim via WhatsApp →
                    </button>
                  </div>
                </>
              )}

              {mode === 'custom' && (
                <>
                  <div className="wa-modal-title">Tanya Langsung</div>
                  <div className="wa-modal-subtitle">Ketik pertanyaan Anda</div>

                  <textarea
                    rows={5}
                    className="wa-input"
                    value={form.pesan}
                    onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                    placeholder={templateGeneral}
                  />

                  <div className="wa-actions">
                    <button type="button" className="wa-btn wa-btn-ghost" onClick={() => setMode('menu')}>← Kembali</button>
                    <button type="button" className="wa-btn wa-btn-primary" onClick={sendWA}>
                      Kirim via WhatsApp →
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="wa-modal-foot">Powered by WhatsApp</div>
          </div>
        </>
      )}
    </>
  );
}
