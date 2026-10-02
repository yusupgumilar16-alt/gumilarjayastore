import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const number = (searchParams.get('number') || '').trim().toUpperCase();

  if (!number) {
    return NextResponse.json({ error: 'Nomor kwitansi wajib diisi' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('public_token, invoice_number, status')
    .eq('invoice_number', number)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Kwitansi tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ token: data.public_token });
}