import LoginForm from './LoginForm';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Masuk Admin' };

export default async function LoginPage() {
  const settings = await getSettings();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%)',
      padding: 20,
    }}>
      <div style={{
        background: '#fff',
        padding: 40,
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(15,23,42,.1)',
        width: '100%',
        maxWidth: 400,
      }}>
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <span className="brand-mark">GJ</span>
          <span className="brand-text">
            <b>{settings.site_name}</b>
            <small>Admin</small>
          </span>
        </div>
        <h1 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: 6 }}>
          Masuk ke Panel
        </h1>
        <p style={{ color: 'var(--muted)', textAlign: 'center', fontSize: '.88rem', marginBottom: 24 }}>
          Kelola produk, kategori, dan konten
        </p>
        <LoginForm />
      </div>
    </div>
  );
}