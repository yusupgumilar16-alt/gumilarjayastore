import { createAdminClient } from '@/lib/supabase/admin';
import FaqManager from '@/components/FaqManager';
import type { Faq } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'FAQ' };

export default async function AdminFaqPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('faqs').select('*').order('sort_order');
  return (
    <>
      <h1 style={{ marginBottom: 24 }}>Pertanyaan Umum (FAQ)</h1>
      <FaqManager initial={(data || []) as Faq[]} />
    </>
  );
}