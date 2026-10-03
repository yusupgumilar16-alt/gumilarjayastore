import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const b = await request.json();
    const admin = createAdminClient();

    const subtotal = (b.items || []).reduce((sum: number, it: any) => sum + (it.qty || 0) * (it.unit_price || 0), 0);
    const adminFee = parseInt(b.admin_fee) || 0;
    const total = Math.max(0, subtotal - (b.discount || 0) + adminFee);

    let invoiceNumber = b.invoice_number;
    if (!invoiceNumber) {
      const now = new Date();
      const prefix = `GJS/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/`;
      const { data: last } = await admin.from('invoices').select('invoice_number')
        .like('invoice_number', prefix + '%')
        .order('invoice_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      let seq = 1;
      if (last) seq = parseInt(last.invoice_number.split('/')[3] || '0', 10) + 1;
      invoiceNumber = prefix + String(seq).padStart(4, '0');
    }

    const { data: invoice, error } = await admin.from('invoices').insert({
      invoice_number: invoiceNumber,
      customer_id: b.customer_id || null,
      customer_id_display: b.customer_id_display || '',
      customer_name: b.customer_name,
      customer_email: b.customer_email || '',
      customer_phone: b.customer_phone || '',
      customer_address: b.customer_address || '',
      invoice_date: b.invoice_date,
      due_date: b.due_date || null,
      subtotal,
      discount: b.discount || 0,
      tax: adminFee,
      total,
      status: b.status || 'draft',
      payment_method: b.payment_method || '',
      payment_type: b.payment_type || 'tunai',
      notes: b.notes || '',
    }).select().single();

    if (error || !invoice) return NextResponse.json({ error: error?.message || 'Gagal' }, { status: 500 });

    const items = (b.items || []).map((it: any) => ({
      invoice_id: invoice.id,
      product_id: it.product_id || null,
      description: it.description,
      qty: it.qty || 1,
      unit_price: it.unit_price || 0,
      subtotal: (it.qty || 1) * (it.unit_price || 0),
      admin_fee: parseInt(it.admin_fee) || 0,
      penalty: parseInt(it.penalty) || 0,
    }));

    if (items.length > 0) {
      const { error: itemErr } = await admin.from('invoice_items').insert(items);
      if (itemErr) {
        await admin.from('invoices').delete().eq('id', invoice.id);
        return NextResponse.json({ error: itemErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, id: invoice.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal' }, { status: 500 });
  }
}