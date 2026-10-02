import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
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
}

export async function POST(request: Request) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const admin = createAdminClient();

  // Ambil kode pelanggan berikutnya dari function
  const { data: codeData, error: codeErr } = await admin.rpc('next_customer_code');
  if (codeErr) return NextResponse.json({ error: codeErr.message }, { status: 500 });
  const customerCode = codeData as unknown as string;

  // Insert customer
  const { data: customer, error } = await admin
    .from('customers')
    .insert({
      customer_code: customerCode,
      name: body.name,
      email: body.email || '',
      phone: body.phone || '',
      address: body.address || '',
      notes: body.notes || '',
    })
    .select()
    .single();

  if (error || !customer) {
    return NextResponse.json({ error: error?.message || 'Gagal menyimpan pelanggan' }, { status: 500 });
  }

  // Insert customer IDs (kalau ada)
  const ids = Array.isArray(body.ids) ? body.ids : [];
  if (ids.length > 0) {
    const idRows = ids
      .filter((i: any) => i.id_number && i.id_number.trim())
      .map((i: any, idx: number) => ({
        customer_id: customer.id,
        id_type: i.id_type || 'lainnya',
        id_label: i.id_label || 'ID',
        id_number: i.id_number.trim(),
        is_primary: idx === 0,
      }));

    if (idRows.length > 0) {
      const { error: idErr } = await admin.from('customer_ids').insert(idRows);
      if (idErr) {
        // Rollback customer
        await admin.from('customers').delete().eq('id', customer.id);
        return NextResponse.json({ error: idErr.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true, customer });
}