import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = createAdminClient();
  const { data } = await admin.from('testimonials').select('*').order('sort_order');
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await request.json();
  const admin = createAdminClient();
  const { error } = await admin.from('testimonials').insert({
    name: b.name,
    city: b.city || '',
    product_type: b.product_type || '',
    content: b.content,
    sort_order: b.sort_order || 0,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}