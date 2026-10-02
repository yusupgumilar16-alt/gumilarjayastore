import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const b = await request.json();
  const admin = createAdminClient();

  const subtotal = (b.items || []).reduce(
    (sum: number, it: any) => sum + (it.qty || 0) * (it.unit_price || 0),
    0
  );
  const total = Math.max(0, subtotal - (b.discount || 0) + (b.tax || 0));

  const { data: invoice, error } = await admin
    .from('invoices')
    .insert({
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
    .select()
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: error?.message || 'Gagal membuat kwitansi' }, { status: 500 });
  }

  const items = (b.items || []).map((it: any) => ({
    invoice_id: invoice.id,
    product_id: it.product_id || null,
    description: it.description,
    qty: it.qty || 1,
    unit_price: it.unit_price || 0,
    subtotal: (it.qty || 1) * (it.unit_price || 0),
  }));

  if (items.length > 0) {
    const { error: itemErr } = await admin.from('invoice_items').insert(items);
    if (itemErr) {
      await admin.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json({ error: itemErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, id: invoice.id });
}