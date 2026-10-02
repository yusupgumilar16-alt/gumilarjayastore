import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import AdminShell from '@/components/AdminShell';

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
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('username, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const userName = profile?.full_name || profile?.username || user.email || 'Admin';

  return (
    <AdminShell settings={settings} userName={userName}>
      {children}
    </AdminShell>
  );
}