'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SettingsMap } from '@/lib/types';

const MENU = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/produk', label: 'Produk' },
  { href: '/admin/kategori', label: 'Kategori' },
  { href: '/admin/testimoni', label: 'Testimoni' },
  { href: '/admin/faq', label: 'FAQ' },
  { href: '/admin/pelanggan-customers', label: 'Pelanggan' },
  { href: '/admin/kwitansi', label: 'Kwitansi' },
  { href: '/admin/pesanan', label: 'Pesanan' },  { href: '/admin/import', label: 'Import Data' },

  { href: '/admin/pengaturan', label: 'Pengaturan' },
];

export default function AdminSidebar({ settings }: { settings: SettingsMap }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="brand" style={{ marginBottom: 24 }}>
        <span className="brand-mark">GJ</span>
        <span className="brand-text">
          <b>{settings.site_name || 'Gumilar Jaya'}</b>
          <small>Admin</small>
        </span>
      </Link>

      <nav className="admin-nav">
        {MENU.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`admin-nav-link ${isActive(m.href, m.exact) ? 'active' : ''}`}
          >
            {m.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}