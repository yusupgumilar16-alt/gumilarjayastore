import type { Metadata } from 'next';
import './globals.css';
// ⬇️ IMPORT DULU
import type { Metadata, Viewport } from 'next';
import './globals.css';

// ⬇️ METADATA DI SINI (setelah import, sebelum function)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};
export const metadata: Metadata = {
  // ... metadata lain ...
  verification: {
    google: 'abc123xyz-kode-dari-search-console',
  },
};

export const metadata: Metadata = {
  metadataBase: new URL('https://gumilarjaya.store'),
  title: {
    default: 'Gumilar Jaya Store - Produk Digital & Fisik Terkurasi',
    template: '%s | Gumilar Jaya Store',
  },
  description: 'Marketplace produk digital dan fisik terkurasi.',
  keywords: ['produk digital', 'template', 'e-book', 'apparel', 'kopi'],
  openGraph: { /* ... */ },
  twitter: { /* ... */ },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  verification: {
    google: 'kode-verifikasi-anda',
  },
};

// ⬇️ FUNCTION DI BAWAH
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

export const metadata: Metadata = {
  title: 'Gumilar Jaya Store',
  description: 'Produk digital & fisik, dipilih satu per satu.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
