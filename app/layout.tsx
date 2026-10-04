import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://gumilarjaya.store'),
  title: {
    default: 'Gumilar Jaya Store - Produk Digital & Fisik Terkurasi',
    template: '%s | Gumilar Jaya Store',
  },
  description: 'Marketplace produk digital dan fisik terkurasi. Template, e-book, apparel, hingga kopi specialty. Belanja aman dan mudah.',
  keywords: ['produk digital', 'template', 'e-book', 'apparel', 'kopi', 'marketplace Indonesia'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://gumilarjaya.store',
    siteName: 'Gumilar Jaya Store',
    title: 'Gumilar Jaya Store - Produk Digital & Fisik Terkurasi',
    description: 'Belanja produk digital dan fisik pilihan. Aman, cepat, dan terpercaya.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gumilar Jaya Store',
    description: 'Produk digital & fisik terkurasi.',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
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
