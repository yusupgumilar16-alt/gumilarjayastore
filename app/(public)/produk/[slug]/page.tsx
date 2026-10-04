import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { formatRupiah } from '@/lib/utils';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
// ⬇️ IMPORT
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

// ⬇️ FUNCTION UNTUK AMBIL DATA (kalau perlu)
async function getProduct(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return data;
}

// ⬇️ METADATA DI SINI (sebelum component)
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Produk Tidak Ditemukan' };

  return {
    title: product.name,
    description: product.description?.slice(0, 160),
    alternates: { canonical: `/produk/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image ? [{ url: product.image }] : [],
    },
  };
}

// ⬇️ COMPONENT DI BAWAH
export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  // ...
}
export const dynamic = 'force-dynamic';

async function getProduct(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .maybeSingle();

  if (!data) return null;

  return {
    ...data,
    category_name: data.categories?.name || '',
    category_slug: data.categories?.slug || '',
  } as Product & { category_slug: string };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Produk tidak ditemukan' };
  return {
    title: product.name,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const supabase = createClient();
  const { data: relatedData } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(4);

  const related: Product[] = (relatedData || []).map((p: any) => ({
    ...p,
    category_name: p.categories?.name || '',
  }));

  const isDigital = product.type === 'digital';

  return (
    <>
      <section className="section">
        <div className="wrap detail">
          <div className="detail-visual">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <svg width="80" height="80" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <rect x="14" y="8" width="32" height="44" rx="1.5" />
                <path d="M20 18h20M20 25h20M20 32h12M20 39h20" />
              </svg>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <span className={`p-badge ${isDigital ? 'dig' : 'fis'}`} style={{ position: 'static' }}>
                {isDigital ? 'Digital' : 'Fisik'}
              </span>
            </div>

            <h1 style={{ marginBottom: 8 }}>{product.name}</h1>

            {product.category_slug && (
              <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
                <Link href={`/kategori/${product.category_slug}`} style={{ color: 'var(--blue)' }}>
                  {product.category_name}
                </Link>
              </p>
            )}

            <div className="p-meta" style={{ marginBottom: 20, fontSize: '.9rem' }}>
              <span className="star">★</span>
              <span>{product.rating} · {product.sold} terjual</span>
              {product.stock > 0 && !isDigital && (
                <>
                  <span>·</span>
                  <span>Stok {product.stock}</span>
                </>
              )}
            </div>

            <p style={{ marginBottom: 28, fontSize: '1rem' }}>{product.description}</p>

            <div className="detail-price">
              {product.discount_price ? (
                <>
                  <b>{formatRupiah(product.discount_price)}</b>
                  <s>{formatRupiah(product.price)}</s>
                </>
              ) : (
                <b>{formatRupiah(product.price)}</b>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-lg"
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              >
                {isDigital ? 'Beli & Download' : 'Tambah ke Keranjang'}
              </button>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || ''}?text=${encodeURIComponent(
                  `Halo, saya tertarik dengan produk "${product.name}" (${formatRupiah(product.discount_price || product.price)}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-lg"
              >
                Tanya via WhatsApp
              </a>
            </div>
            <p style={{ marginTop: 14, fontSize: '.8rem', color: 'var(--muted)' }}>
              Checkout online akan segera tersedia. Untuk sementara, hubungi kami via WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 style={{ marginBottom: 24 }}>Produk terkait</h2>
            <div className="prod-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
