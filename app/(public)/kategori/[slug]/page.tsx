import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

async function getCategory(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const cat = await getCategory(params.slug);
  if (!cat) return { title: 'Kategori tidak ditemukan' };
  return {
    title: cat.name,
    description: cat.description?.slice(0, 160) || `Kategori ${cat.name} di Gumilar Jaya Store`,
    alternates: { canonical: `/kategori/${cat.slug}` },
    openGraph: {
      title: cat.name,
      description: cat.description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategory(params.slug);
  if (!category) notFound();

  const supabase = createClient();
  const settings = await getSettings();
  const { data } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  const products: Product[] = (data || []).map((p: any) => ({
    ...p,
    category_name: p.categories?.name || category.name,
  }));

  const waPhone = settings.contact_whatsapp || '';

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <Link href="/produk" style={{ color: 'var(--blue)', fontSize: '.85rem', fontWeight: 600 }}>
            ← Semua Produk
          </Link>
          <span className="eyebrow" style={{ display: 'block', marginTop: 18 }}>Kategori</span>
          <h2>{category.name}</h2>
          <p>{category.description}</p>
        </div>

        {products.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>
            Belum ada produk di kategori ini.
          </p>
        ) : (
          <div className="prod-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} waPhone={waPhone} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
