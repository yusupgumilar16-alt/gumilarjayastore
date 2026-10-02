import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: false, message: 'Email wajib diisi' }, { status: 400 });
    }

    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return NextResponse.json({ ok: false, message: 'Format email tidak valid' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from('subscribers').insert({ email: clean });

    if (error && error.code === '23505') {
      // duplicate key — email sudah terdaftar
      return NextResponse.json({ ok: true, message: 'Email sudah terdaftar. Terima kasih!' });
    }

    if (error) {
      console.error('Subscribe error:', error);
      return NextResponse.json({ ok: false, message: 'Gagal menyimpan. Coba lagi.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Terima kasih! Email Anda sudah terdaftar.' });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ ok: false, message: 'Gagal. Coba lagi.' }, { status: 500 });
  }
}