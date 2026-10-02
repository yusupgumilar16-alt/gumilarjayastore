import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseNumber, parseDate, parseTime, normalizeCategory, detectIdType, idTypeLabel } from '@/lib/import-helpers';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Row {
  external_ref: string;
  invoice_date: string;
  category: string;
  id_number: string;
  customer_name: string;
  address: string;
  token_number: string;
  subtotal: number;
  penalty: number;
  admin_fee: number;
  total: number;
  payment_time: string;
  period: string;
}

export async function POST(request: Request) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const rows: Row[] = body.rows || [];
  const filename = body.filename || '';
  const dryRun = !!body.dryRun;
  const autoCreateCustomer = body.autoCreateCustomer !== false;

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Tidak ada data untuk di-import' }, { status: 400 });
  }

  const admin = createAdminClient();
  const batchId = `IMP-INV-${Date.now()}`;
  const errors: any[] = [];
  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    try {
      // Validasi
      if (!row.customer_name || !row.customer_name.trim()) {
        errors.push({ row: rowNum, error: 'Nama pelanggan kosong', data: row });
        failed++;
        continue;
      }

      if (!row.invoice_date) {
        errors.push({ row: rowNum, error: 'Tanggal kosong', data: row });
        failed++;
        continue;
      }

      // Skip kalau external_ref sudah ada
      if (row.external_ref && row.external_ref.trim()) {
        const { data: existing } = await admin
          .from('invoices')
          .select('id')
          .eq('external_ref', row.external_ref.trim())
          .maybeSingle();

        if (existing) {
          skipped++;
          continue;
        }
      }

      if (dryRun) {
        success++;
        continue;
      }

      // Cari / buat pelanggan
      let customerId: string | null = null;
      if (row.id_number && row.id_number.trim() && autoCreateCustomer) {
        const { data: cid, error: cidErr } = await admin.rpc('find_or_create_customer', {
          p_id_number: row.id_number.trim(),
          p_name: row.customer_name.trim(),
          p_address: row.address || '',
          p_id_type: detectIdType(row.id_number),
        });

        if (!cidErr && cid) {
          customerId = cid as unknown as string;
        }
      }

      // Generate nomor kwitansi
      const { data: numData } = await admin.rpc('next_invoice_number');
      const invoiceNumber = (numData as unknown as string) || `GJS/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/0001`;

      // Hitung total kalau tidak ada
      const subtotal = parseNumber(row.subtotal);
      const penalty = parseNumber(row.penalty);
      const adminFee = parseNumber(row.admin_fee);
      const total = parseNumber(row.total) || (subtotal + penalty + adminFee);

      // Insert invoice
      const { data: invoice, error: invErr } = await admin
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          customer_id: customerId,
          customer_id_display: '',
          customer_name: row.customer_name.trim(),
          customer_address: (row.address || '').trim(),
          customer_email: '',
          customer_phone: '',
          invoice_date: parseDate(row.invoice_date),
          due_date: null,
          subtotal,
          discount: 0,
          tax: 0,
          total,
          status: 'dibayar',
          payment_method: '',
          notes: row.period || '',
          external_ref: (row.external_ref || '').trim(),
          category: normalizeCategory(row.category || ''),
          token_number: (row.token_number || '').trim(),
          penalty,
          admin_fee: adminFee,
          payment_time: parseTime(row.payment_time),
          period: (row.period || '').trim(),
          import_batch: batchId,
          imported_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (invErr || !invoice) {
        errors.push({ row: rowNum, error: invErr?.message || 'Gagal simpan', data: row });
        failed++;
        continue;
      }

      // Insert items
      const items: any[] = [];
      if (subtotal > 0) {
        items.push({
          invoice_id: invoice.id,
          description: row.period || normalizeCategory(row.category || ''),
          qty: 1,
          unit_price: subtotal,
          subtotal,
        });
      }
      if (adminFee > 0) {
        items.push({
          invoice_id: invoice.id,
          description: 'Biaya Admin',
          qty: 1,
          unit_price: adminFee,
          subtotal: adminFee,
        });
      }
      if (penalty > 0) {
        items.push({
          invoice_id: invoice.id,
          description: 'Denda',
          qty: 1,
          unit_price: penalty,
          subtotal: penalty,
        });
      }

      if (items.length > 0) {
        await admin.from('invoice_items').insert(items);
      }

      success++;
    } catch (err: any) {
      errors.push({ row: rowNum, error: err.message || 'Error', rowData: row });
      failed++;
    }
  }

  if (!dryRun) {
    await admin.from('import_logs').insert({
      batch_id: batchId,
      import_type: 'invoices',
      filename,
      total_rows: rows.length,
      success_rows: success,
      failed_rows: failed,
      skipped_rows: skipped,
      errors: errors.slice(0, 100),
      created_by: user.id,
    });
  }

  return NextResponse.json({
    ok: true,
    batch_id: batchId,
    dry_run: dryRun,
    total: rows.length,
    success,
    failed,
    skipped,
    errors: errors.slice(0, 50),
  });
}