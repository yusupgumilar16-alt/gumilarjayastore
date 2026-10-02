import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const b = await request.json();
  const admin = createAdminClient();

  // Kalau hanya update status
  if (Object.keys(b).length === 1 && b.status) {
    const { error } = await admin.from('invoices').update({ status: b.status }).eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Update lengkap
  const subtotal = (b.items || []).reduce(
    (sum: number, it: any) => sum + (it.qty || 0) * (it.unit_price || 0),
    0
  );
  const total = Math.max(0, subtotal - (b.discount || 0) + (b.tax || 0));

  const { error } = await admin
    .from('invoices')
    .update({
      invoice_number: b.invoice_number,
      customer_name: b.customer_name,
      customer_email: b.customer_email || '',
      customer_phone: b.customer_phone || '',
      customer_address: b.customer_address || '',
      invoice_date: b.invoice_date,
      due_date: b.due_date || null,
      subtotal,
      discount: b.discount || 0,
      tax: b.tax || 0,
      total,
      status: b.status || 'draft',
      payment_method: b.payment_method || '',
      notes: b.notes || '',
    })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from('invoice_items').delete().eq('invoice_id', params.id);

  const items = (b.items || []).map((it: any) => ({
    invoice_id: params.id,
    product_id: it.product_id || null,
    description: it.description,
    qty: it.qty || 1,
    unit_price: it.unit_price || 0,
    subtotal: (it.qty || 1) * (it.unit_price || 0),
  }));

  if (items.length > 0) {
    const { error: itemErr } = await admin.from('invoice_items').insert(items);
    if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 500 });
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
  const { error } = await admin.from('invoices').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}