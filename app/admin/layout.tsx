import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import AdminSidebar from '@/components/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const settings = await getSettings();

  // Ambil profil admin
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('username, full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  const displayName = profile?.full_name || profile?.username || user.email || 'Admin';

  return (
    <div className="admin-shell">
      <AdminSidebar settings={settings} />
      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ fontSize: '.9rem', color: 'var(--muted)' }}>
            Halo, <b style={{ color: 'var(--ink)' }}>{displayName}</b>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/" target="_blank" className="btn btn-ghost" style={{ fontSize: '.82rem', padding: '8px 14px' }}>
              Lihat Situs →
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button type="submit" className="btn btn-ghost" style={{ fontSize: '.82rem', padding: '8px 14px' }}>
                Keluar
              </button>
            </form>
          </div>
        </header>
        <div className="admin-body">{children}</div>
      </div>
    </div>
  );
}