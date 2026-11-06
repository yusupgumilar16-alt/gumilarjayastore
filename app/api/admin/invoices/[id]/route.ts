import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isInvoiceStatus, validateInvoiceInput } from '@/lib/invoice-calc';

const UNIQUE_VIOLATION = '23505';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let b: any;
    try {
      b = await request.json();
    } catch {
      return NextResponse.json({ error: 'Data kwitansi tidak valid' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Ubah status saja (tombol Lunas / Draft / Terkirim / Batal)
    if (b && typeof b === 'object' && Object.keys(b).length === 1 && 'status' in b) {
      if (!isInvoiceStatus(b.status)) {
        return NextResponse.json({ error: 'Status kwitansi tidak valid' }, { status: 400 });
      }
      const { data, error } = await admin.from('invoices').update({ status: b.status }).eq('id', params.id).select('id');
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!data || data.length === 0) return NextResponse.json({ error: 'Kwitansi tidak ditemukan' }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    const v = validateInvoiceInput(b);
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    const d = v.value;

    const { data: existing } = await admin.from('invoices').select('id').eq('id', params.id).maybeSingle();
    if (!existing) return NextResponse.json({ error: 'Kwitansi tidak ditemukan' }, { status: 404 });

    // Urutan aman tanpa transaksi database:
    //   1) catat item lama  2) tambah item baru  3) update header  4) hapus item lama
    // Bila langkah 2/3 gagal, item lama tetap utuh (sebelumnya item dihapus lebih dulu
    // sehingga kegagalan insert meninggalkan kwitansi tanpa item).
    const { data: oldItems, error: oldErr } = await admin.from('invoice_items').select('id').eq('invoice_id', params.id);
    if (oldErr) return NextResponse.json({ error: oldErr.message }, { status: 500 });
    const oldIds = (oldItems || []).map((r: any) => r.id);

    const { data: newItems, error: insErr } = await admin
      .from('invoice_items')
      .insert(d.items.map((it) => ({ invoice_id: params.id, ...it })))
      .select('id');
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    const newIds = (newItems || []).map((r: any) => r.id);

    const header: Record<string, any> = {
      customer_name: d.customer_name,
      customer_email: d.customer_email,
      customer_phone: d.customer_phone,
      customer_address: d.customer_address,
      invoice_date: d.invoice_date,
      due_date: d.due_date,
      subtotal: d.subtotal,
      discount: d.discount,
      tax: d.admin_fee, // kolom `tax` = Biaya Admin (lihat POST)
      total: d.total,
      status: d.status,
      payment_method: d.payment_method,
      payment_type: d.payment_type,
      notes: d.notes,
    };
    // Nomor kosong = biarkan nomor lama (sebelumnya nomor bisa terhapus jadi '').
    if (d.invoice_number) header.invoice_number = d.invoice_number;
    // Relasi pelanggan ikut diperbarui bila admin mengganti pelanggan di form edit.
    if (d.hasCustomerLink) {
      header.customer_id = d.customer_id;
      header.customer_id_display = d.customer_id_display;
    }

    const { error: updErr } = await admin.from('invoices').update(header).eq('id', params.id);
    if (updErr) {
      if (newIds.length > 0) await admin.from('invoice_items').delete().in('id', newIds); // batalkan item baru
      if (updErr.code === UNIQUE_VIOLATION) {
        return NextResponse.json({ error: `Nomor kwitansi ${d.invoice_number} sudah dipakai kwitansi lain.` }, { status: 409 });
      }
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    if (oldIds.length > 0) {
      const { error: delErr } = await admin.from('invoice_items').delete().in('id', oldIds);
      if (delErr) {
        // Simpan ulang akan membersihkan sisa item lama (semua item yang ada saat itu dihapus & diganti).
        return NextResponse.json({ error: 'Kwitansi tersimpan, tetapi item lama belum terhapus. Simpan sekali lagi untuk merapikan.' }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { error } = await admin.from('invoices').delete().eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal' }, { status: 500 });
  }
}
