import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateInvoiceInput } from '@/lib/invoice-calc';
import { generateInvoiceNumber } from '@/lib/invoice-number';

const UNIQUE_VIOLATION = '23505';
const MAX_AUTO_NUMBER_TRIES = 3;

export async function POST(request: Request) {
  try {
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Data kwitansi tidak valid' }, { status: 400 });
    }

    // Semua angka dihitung ulang di server dari item; nilai total dari client tidak dipercaya.
    const v = validateInvoiceInput(body);
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    const d = v.value;

    const admin = createAdminClient();
    const manualNumber = d.invoice_number;

    // Nomor otomatis bisa bentrok bila dua kwitansi dibuat bersamaan -> coba lagi dengan nomor baru.
    let invoice: { id: string } | null = null;
    for (let attempt = 0; attempt < MAX_AUTO_NUMBER_TRIES; attempt++) {
      const invoiceNumber = manualNumber || (await generateInvoiceNumber(admin));

      const { data, error } = await admin.from('invoices').insert({
        invoice_number: invoiceNumber,
        customer_id: d.customer_id,
        customer_id_display: d.customer_id_display,
        customer_name: d.customer_name,
        customer_email: d.customer_email,
        customer_phone: d.customer_phone,
        customer_address: d.customer_address,
        invoice_date: d.invoice_date,
        due_date: d.due_date,
        subtotal: d.subtotal,
        discount: d.discount,
        // Catatan: kolom `tax` dipakai untuk Biaya Admin sejak awal (form tidak punya input pajak).
        tax: d.admin_fee,
        total: d.total,
        status: d.status,
        payment_method: d.payment_method,
        payment_type: d.payment_type,
        notes: d.notes,
      }).select('id').single();

      if (!error && data) {
        invoice = data;
        break;
      }
      if (error?.code === UNIQUE_VIOLATION) {
        if (manualNumber) {
          return NextResponse.json({ error: `Nomor kwitansi ${manualNumber} sudah dipakai. Gunakan nomor lain atau kosongkan agar dibuat otomatis.` }, { status: 409 });
        }
        continue; // nomor otomatis bentrok -> generate ulang
      }
      return NextResponse.json({ error: error?.message || 'Gagal menyimpan kwitansi' }, { status: 500 });
    }

    if (!invoice) {
      return NextResponse.json({ error: 'Gagal membuat nomor kwitansi otomatis. Coba lagi.' }, { status: 409 });
    }

    const rows = d.items.map((it) => ({ invoice_id: invoice!.id, ...it }));
    const { error: itemErr } = await admin.from('invoice_items').insert(rows);
    if (itemErr) {
      // Jangan tinggalkan kwitansi tanpa item.
      await admin.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json({ error: itemErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: invoice.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal' }, { status: 500 });
  }
}
