import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import ProductForm from '@/components/ProductForm';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Tambah Produk' };

export default async function NewProductPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('categories').select('*').order('sort_order');

  return (
    <>
      <div className="admin-card-head">
        <h1>Tambah Produk</h1>
        <Link href="/admin/produk" className="btn btn-ghost">← Kembali</Link>
      </div>
      <ProductForm initial={null} categories={(data || []) as Category[]} />
    </>
  );
}