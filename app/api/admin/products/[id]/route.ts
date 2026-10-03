import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const admin = createAdminClient();

    const { error } = await admin
      .from('products')
      .update({
        name: body.name,
        category_id: body.category_id || null,
        type: body.type || 'digital',
        price: parseInt(body.price) || 0,
        discount_price: body.discount_price ? parseInt(body.discount_price) : null,
        description: body.description || '',
        image: body.image || null,
        stock: parseInt(body.stock) || 0,
        download_url: body.download_url || null,
        is_featured: !!body.is_featured,
        is_new: !!body.is_new,
        service_type: body.service_type || null,
        requires_manual_price: !!body.requires_manual_price,
        default_admin_fee: parseInt(body.default_admin_fee) || 0,
      })
      .eq('id', params.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { error } = await admin.from('products').delete().eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal' }, { status: 500 });
  }
}