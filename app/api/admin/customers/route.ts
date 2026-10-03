import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    const admin = createAdminClient();
    let query = admin
      .from('customers')
      .select('*, customer_ids(*)')
      .eq('is_archived', false)
      .order('name', { ascending: true })
      .limit(50);

    if (q) {
      query = query.or(`name.ilike.%${q}%,customer_code.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal' }, { status: 500 });
  }
}