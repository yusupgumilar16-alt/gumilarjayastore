import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import ProductForm from '@/components/ProductForm';
import type { Category, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('categories').select('*').order('sort_order'),
  ]);

  if (!product) notFound();

  return (
    <>
      <div className="admin-card-head">
        <h1>Edit Produk</h1>
        <Link href="/admin/produk" className="btn btn-ghost">← Kembali</Link>
      </div>
      <ProductForm
        initial={product as Product}
        categories={(categories || []) as Category[]}
      />
    </>
  );
}