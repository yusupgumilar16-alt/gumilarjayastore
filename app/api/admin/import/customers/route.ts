import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { detectIdType, idTypeLabel, parseNumber, findValue } from '@/lib/import-helpers';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Row {
  id_number: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  id_type?: string;
  notes?: string;
}

export async function POST(request: Request) {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const rows: Row[] = body.rows || [];
  const filename = body.filename || '';
  const dryRun = !!body.dryRun;

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Tidak ada data untuk di-import' }, { status: 400 });
  }

  const admin = createAdminClient();
  const batchId = `IMP-CUST-${Date.now()}`;
  const errors: any[] = [];
  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 karena baris 1 biasanya header

    try {
      // Validasi minimal
      if (!row.name || !row.name.trim()) {
        errors.push({ row: rowNum, error: 'Nama kosong', data: row });
        failed++;
        continue;
      }

      // Kalau ID number ada, cek apakah sudah terdaftar
      if (row.id_number && row.id_number.trim()) {
        const { data: existing } = await admin
          .from('customer_ids')
          .select('customer_id')
          .eq('id_number', row.id_number.trim())
          .maybeSingle();

        if (existing) {
          skipped++;
          continue;
        }
      }

      if (dryRun) {
        // Mode preview: cek saja, tidak simpan
        success++;
        continue;
      }

      // Buat customer code
      const { data: codeData } = await admin.rpc('next_customer_code');
      const customerCode = codeData as unknown as string;

      // Insert customer
      const { data: customer, error: custErr } = await admin
        .from('customers')
        .insert({
          customer_code: customerCode,
          name: row.name.trim(),
          email: (row.email || '').trim(),
          phone: (row.phone || '').trim(),
          address: (row.address || '').trim(),
          notes: (row.notes || '').trim(),
        })
        .select()
        .single();

      if (custErr || !customer) {
        errors.push({ row: rowNum, error: custErr?.message || 'Gagal simpan pelanggan', data: row });
        failed++;
        continue;
      }

      // Tambah customer ID kalau ada
      if (row.id_number && row.id_number.trim()) {
        const idType = (row.id_type as any) || detectIdType(row.id_number);
        const { error: idErr } = await admin
          .from('customer_ids')
          .insert({
            customer_id: customer.id,
            id_type: idType,
            id_label: idTypeLabel(idType),
            id_number: row.id_number.trim(),
            is_primary: true,
          });

        if (idErr) {
          // Rollback customer
          await admin.from('customers').delete().eq('id', customer.id);
          errors.push({ row: rowNum, error: `ID pelanggan: ${idErr.message}`, data: row });
          failed++;
          continue;
        }
      }

      success++;
    } catch (err: any) {
      errors.push({ row: rowNum, error: err.message || 'Error', data: row });
      failed++;
    }
  }

  // Log hasil
  if (!dryRun) {
    await admin.from('import_logs').insert({
      batch_id: batchId,
      import_type: 'customers',
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