'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { SettingsMap } from '@/lib/types';

const MENU = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/produk', label: 'Produk', icon: '📦' },
  { href: '/admin/kategori', label: 'Kategori', icon: '🏷️' },
  { href: '/admin/testimoni', label: 'Testimoni', icon: '💬' },
  { href: '/admin/faq', label: 'FAQ', icon: '❓' },
  { href: '/admin/pelanggan-customers', label: 'Pelanggan', icon: '👥' },
  { href: '/admin/kwitansi', label: 'Kwitansi', icon: '📄' },
  { href: '/admin/pesanan', label: 'Pesanan', icon: '🛒' },
  { href: '/admin/import', label: 'Import', icon: '📥' },
  { href: '/admin/riwayat-import', label: 'Riwayat', icon: '📋' },
  { href: '/admin/pengaturan', label: 'Pengaturan', icon: '⚙️' },
];

export default function AdminShell({
  settings,
  userName,
  children,
}: {
  settings: SettingsMap;
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const logoSrc = settings.brand_logo_url || '';
  const initials = settings.brand_logo_text || 'GJ';

  return (
    <div className="adm">
      <button
        className={`adm-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        type="button"
      >
        <span className="adm-toggle-icon" />
      </button>

      {open && <div className="adm-overlay" onClick={() => setOpen(false)} />}

      <aside className={`adm-sidebar ${open ? 'open' : ''}`}>
        <Link href="/admin" className="adm-brand">
          {logoSrc ? (
            <img src={logoSrc} alt="Logo" className="adm-brand-logo" />
          ) : (
            <span className="adm-brand-mark">{initials.slice(0, 2).toUpperCase()}</span>
          )}
          <span className="adm-brand-text">
            <b>{settings.site_name || 'Gumilar Jaya'}</b>
            <small>Admin Panel</small>
          </span>
        </Link>

        <nav className="adm-nav">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`adm-nav-link ${isActive(m.href, m.exact) ? 'active' : ''}`}
            >
              <span className="adm-nav-icon">{m.icon}</span>
              <span className="adm-nav-label">{m.label}</span>
            </Link>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <Link href="/" target="_blank" className="adm-sidebar-footer-btn">
            🌐 Lihat Situs
          </Link>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <span className="adm-greeting">Halo, <b>{userName}</b></span>
          <div className="adm-topbar-right">
            <Link href="/" target="_blank" className="adm-topbar-btn">
              🌐 <span className="adm-topbar-btn-label">Situs</span>
            </Link>
            <form action="/api/admin/logout" method="POST" style={{ display: 'inline' }}>
              <button type="submit" className="adm-topbar-btn">
                🚪 <span className="adm-topbar-btn-label">Keluar</span>
              </button>
            </form>
          </div>
        </header>

        <div className="adm-body">{children}</div>
      </div>
    </div>
  );
}