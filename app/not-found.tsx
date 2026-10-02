import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      padding: 20, background: 'linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: '5rem', fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: '1.5rem', margin: '16px 0 12px' }}>Halaman tidak ditemukan</h1>
        <p style={{ color: '#64748b', marginBottom: 28, fontSize: '.95rem' }}>
          Halaman yang Anda cari mungkin sudah dipindahkan.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}>
            ← Beranda
          </Link>
          <Link href="/admin" style={{ padding: '12px 24px', background: '#fff', color: '#0b1220', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}>
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}