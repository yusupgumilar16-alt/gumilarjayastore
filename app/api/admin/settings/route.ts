import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin.from('settings').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'Body kosong' }, { status: 400 });
  }

  const admin = createAdminClient();

  const rows = Object.entries(body).map(([key, value]) => ({
    key,
    value: String(value ?? ''),
  }));

  const { error } = await admin.from('settings').upsert(rows, { onConflict: 'key' });

  if (error) {
    console.error('Settings save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, saved: rows.length });
}
