import Link from 'next/link';
import type { SettingsMap } from '@/lib/types';

export default function Footer({ settings }: { settings: SettingsMap }) {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand" style={{ marginBottom: 14 }}>
              <span className="brand-mark">GJ</span>
              <span className="brand-text">
                <b>{settings.site_name || 'Gumilar Jaya'}</b>
                <small>Store</small>
              </span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '.86rem', maxWidth: 300 }}>
              {settings.site_description}
            </p>
          </div>
          <div className="foot-col">
            <h4>Belanja</h4>
            <Link href="/produk">Semua Produk</Link>
            <Link href="/produk?filter=digital">Produk Digital</Link>
            <Link href="/produk?filter=fisik">Produk Fisik</Link>
            <Link href="/produk?filter=baru">Terbaru</Link>
          </div>
          <div className="foot-col">
            <h4>Bantuan</h4>
            <Link href="/#faq">FAQ</Link>
            <a href={`mailto:${settings.contact_email}`}>Hubungi Kami</a>
          </div>
          <div className="foot-col">
            <h4>Kontak</h4>
            <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
            {settings.contact_whatsapp && (
              <a href={`https://wa.me/${settings.contact_whatsapp}`} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            )}
            {settings.social_instagram && (
              <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            {settings.social_tiktok && (
              <a href={settings.social_tiktok} target="_blank" rel="noopener noreferrer">
                TikTok
              </a>
            )}
          </div>
        </div>
        <div className="foot-bot">
          <span>© {year} {settings.site_name}</span>
          <span>Dibuat dengan hati</span>
        </div>
      </div>
    </footer>
  );
}