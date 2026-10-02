import Link from 'next/link';
import type { SettingsMap } from '@/lib/types';

export default function Nav({ settings }: { settings: SettingsMap }) {
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">GJ</span>
          <span className="brand-text">
            <b>{settings.site_name || 'Gumilar Jaya'}</b>
            <small>Store</small>
          </span>
        </Link>
        <nav className="nav-links">
          <Link href="/produk">Produk</Link>
          <Link href="/#kategori">Kategori</Link>
          <Link href="/#cerita">Cerita</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="nav-right">
          <Link href="/produk" className="btn btn-primary">
            Belanja
          </Link>
        </div>
      </div>
    </header>
  );
}