import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatRupiah, truncate } from '@/lib/utils';

interface Props {
  product: Product;
  waPhone?: string;
}

function cleanPhone(p: string): string {
  let n = String(p).replace(/[^\d]/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  if (!n.startsWith('62')) n = '62' + n;
  return n;
}

export default function ProductCard({ product, waPhone }: Props) {
  const isDigital = product.type === 'digital';
  const isPriceZero = !product.price || product.price === 0;

  // URL produk — pakai path relatif, fallback ke slug
  const productUrl = `/produk/${product.slug}`;

  // Bangun pesan WA
  const waMessage = `Halo, saya ingin bertanya tentang produk ini:

📦 *${product.name}*
🔗 ${productUrl}${product.category_name ? `\n📁 Kategori: ${product.category_name}` : ''}

Apakah produk ini tersedia? Mohon informasi lebih lanjut. Terima kasih.`;

  const waLink = waPhone
    ? `https://wa.me/${cleanPhone(waPhone)}?text=${encodeURIComponent(waMessage)}`
    : '#';

  return (
    <article className="product">
      <Link href={productUrl} className="p-thumb">
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
          <Link href={productUrl}>{product.name}</Link>
        </h3>
        <p className="p-desc">{truncate(product.description, 60)}</p>

        <div className="p-meta">
          <span className="star">★</span>
          <span>{product.rating} · {product.sold} terjual</span>
        </div>

        <div className="p-foot">
          {isPriceZero ? (
            // Harga 0 — tampilkan tombol Tanya WA saja
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-ask-wa"
            >
              <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16.004 2C8.28 2 2 8.28 2 16.004c0 2.463.65 4.777 1.79 6.784L2 30l7.383-1.762A13.94 13.94 0 0 0 16.004 30C23.72 30 30 23.72 30 16.004S23.72 2 16.004 2z"/>
              </svg>
              Tanyakan Produk Ini
            </a>
          ) : (
            // Harga ada — tampilkan harga + tombol WA kecil
            <>
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
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-ask-wa-icon"
                aria-label="Tanya via WhatsApp"
                title="Tanya via WhatsApp"
              >
                <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16.004 2C8.28 2 2 8.28 2 16.004c0 2.463.65 4.777 1.79 6.784L2 30l7.383-1.762A13.94 13.94 0 0 0 16.004 30C23.72 30 30 23.72 30 16.004S23.72 2 16.004 2z"/>
                </svg>
              </a>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
