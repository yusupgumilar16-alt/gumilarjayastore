import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const s = createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  // Panggil function SQL next_invoice_number
  const { data, error } = await admin.rpc('next_invoice_number');

  if (error) {
    // Fallback: hitung manual
    const now = new Date();
    const prefix = `GJS/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/`;
    const { data: last } = await admin
      .from('invoices')
      .select('invoice_number')
      .like('invoice_number', prefix + '%')
      .order('invoice_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    let seq = 1;
    if (last) {
      const parts = last.invoice_number.split('/');
      seq = parseInt(parts[3] || '0', 10) + 1;
    }
    const number = prefix + String(seq).padStart(4, '0');
    return NextResponse.json({ number, fallback: true });
  }

  return NextResponse.json({ number: data });
}