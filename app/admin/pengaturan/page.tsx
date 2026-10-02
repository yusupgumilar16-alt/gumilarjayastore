import { createAdminClient } from '@/lib/supabase/admin';
import SettingsForm from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pengaturan' };

export default async function SettingsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('settings').select('*').order('category').order('key');
  return (
    <>
      <div className="admin-card-head"><h1>Pengaturan Situs</h1></div>
      <SettingsForm initial={data || []} />
    </>
  );
}