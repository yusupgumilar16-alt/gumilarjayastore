import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

type SearchParams = { filter?: string };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const settings = await getSettings();
  const filter = searchParams.filter || 'all';

  let query = supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  if (filter === 'digital' || filter === 'fisik') {
    query = query.eq('type', filter);
  } else if (filter === 'baru') {
    query = query.eq('is_new', true);
  }

  const { data } = await query;
  const products: Product[] = (data || []).map((p: any) => ({
    ...p,
    category_name: p.categories?.name || '',
  }));

  const filters = [
    { key: 'all', label: 'Semua' },
    { key: 'digital', label: 'Digital' },
    { key: 'fisik', label: 'Fisik' },
    { key: 'baru', label: 'Terbaru' },
  ];

  const waPhone = settings.contact_whatsapp || '';

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Katalog</span>
          <h2>Semua produk.</h2>
          <p>Pilih sesuai kebutuhan Anda — file yang bisa diunduh seketika, atau paket yang akan datang ke rumah.</p>
        </div>

        <div className="filters" style={{ marginBottom: 32 }}>
          {filters.map((f) => (
            <Link
              key={f.key}
              href={f.key === 'all' ? '/produk' : `/produk?filter=${f.key}`}
              className={`chip ${filter === f.key ? 'active' : ''}`}
            >
              {f.label}
            </Link>
          ))}
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
