import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('customers')
    .select('*, customer_ids(*)')
    .eq('id', params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const admin = createAdminClient();

  // Update customer
  const { error } = await admin
    .from('customers')
    .update({
      name: body.name,
      email: body.email || '',
      phone: body.phone || '',
      address: body.address || '',
      notes: body.notes || '',
    })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Ganti IDs: hapus semua lalu insert baru
  if (Array.isArray(body.ids)) {
    await admin.from('customer_ids').delete().eq('customer_id', params.id);

    const idRows = body.ids
      .filter((i: any) => i.id_number && i.id_number.trim())
      .map((i: any, idx: number) => ({
        customer_id: params.id,
        id_type: i.id_type || 'lainnya',
        id_label: i.id_label || 'ID',
        id_number: i.id_number.trim(),
        is_primary: idx === 0,
      }));

    if (idRows.length > 0) {
      const { error: idErr } = await admin.from('customer_ids').insert(idRows);
      if (idErr) return NextResponse.json({ error: idErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  // Soft delete: archive saja
  const { error } = await admin
    .from('customers')
    .update({ is_archived: true })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}