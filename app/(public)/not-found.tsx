import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section" style={{ textAlign: 'center', padding: '120px 0' }}>
      <div className="wrap">
        <h1 style={{ fontSize: '5rem', color: 'var(--blue)', marginBottom: 8 }}>404</h1>
        <h2 style={{ marginBottom: 16 }}>Halaman tidak ditemukan</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 32 }}>
          Mungkin Anda salah ketik, atau halaman sudah dipindahkan.
        </p>
        <Link href="/" className="btn btn-primary">
          Kembali ke Beranda
        </Link>
      </div>
    </section>
  );
}