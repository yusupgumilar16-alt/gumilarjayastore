import { createAdminClient } from '@/lib/supabase/admin';
import TestimonialManager from '@/components/TestimonialManager';
import type { Testimonial } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Testimoni' };

export default async function AdminTestimonialsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('testimonials').select('*').order('sort_order');
  return (
    <>
      <h1 style={{ marginBottom: 24 }}>Testimoni</h1>
      <TestimonialManager initial={(data || []) as Testimonial[]} />
    </>
  );
}