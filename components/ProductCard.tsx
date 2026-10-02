import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatRupiah, truncate } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const isDigital = product.type === 'digital';
  return (
    <article className="product">
      <Link href={`/produk/${product.slug}`} className="p-thumb">
        <span className={`p-badge ${isDigital ? 'dig' : 'fis'}`}>
          {isDigital ? 'Digital' : 'Fisik'}
        </span>
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <svg width="52" height="52" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="14" y="8" width="32" height="44" rx="1.5" />
            <path d="M20 18h20M20 25h20M20 32h12M20 39h20" />
          </svg>
        )}
      </Link>
      <div className="p-body">
        <span className="p-cat">{product.category_name || '—'}</span>
        <h3>
          <Link href={`/produk/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="p-desc">{truncate(product.description, 60)}</p>
        <div className="p-meta">
          <span className="star">★</span>
          <span>{product.rating} · {product.sold} terjual</span>
        </div>
        <div className="p-foot">
          <div className="p-price">
            {product.discount_price ? (
              <>
                <b>{formatRupiah(product.discount_price)}</b>
                <s>{formatRupiah(product.price)}</s>
              </>
            ) : (
              <b>{formatRupiah(product.price)}</b>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}