import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import type { Product, Category, Testimonial, Faq } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import FaqAccordion from '@/components/FaqAccordion';
import SubscribeForm from '@/components/SubscribeForm';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();
  const settings = await getSettings();

  const [categoriesRes, productsRes, testimonialsRes, faqsRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase
      .from('products')
      .select('*, categories(name)')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('faqs').select('*').eq('is_active', true).order('sort_order'),
  ]);

  const categories: Category[] = categoriesRes.data || [];
  const products: Product[] = (productsRes.data || []).map((p: any) => ({
    ...p,
    category_name: p.categories?.name || '',
  }));
  const testimonials: Testimonial[] = testimonialsRes.data || [];
  const faqs: Faq[] = faqsRes.data || [];

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <span className="hero-eyebrow">{settings.hero_eyebrow}</span>
            <h1>{settings.hero_title}</h1>
            <p className="lead">{settings.hero_subtitle}</p>
            <div className="hero-actions">
              <Link href="/produk" className="btn btn-primary btn-lg">
                Lihat Katalog
              </Link>
              <a href="#cerita" className="btn-link">atau Kenali Kami</a>
            </div>
            <div className="hero-trust">
              <div><b>{settings.stat_customers}</b> pelanggan</div>
              <div><b>{settings.stat_rating}</b> rating</div>
              <div><b>{settings.stat_products}</b> produk</div>
            </div>
          </div>
          <div className="hero-visual">
            <svg viewBox="0 0 400 400" fill="none" className="hero-illustration">
              <rect x="90" y="60" width="200" height="140" rx="14" fill="#f0f6ff" stroke="#dbeafe" strokeWidth="1.5" transform="rotate(-6 190 130)" />
              <rect x="110" y="80" width="200" height="140" rx="14" fill="#ede9fe" stroke="#ddd6fe" strokeWidth="1.5" transform="rotate(3 210 150)" />
              <g transform="translate(80,140)">
                <rect width="240" height="170" rx="18" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                <rect x="20" y="22" width="44" height="44" rx="11" fill="#eff6ff" />
                <path d="M34 40h16M34 46h10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                <rect x="80" y="24" width="120" height="10" rx="3" fill="#0b1220" opacity=".82" />
                <rect x="80" y="42" width="80" height="8" rx="3" fill="#94a3b8" opacity=".55" />
                <rect x="20" y="90" width="120" height="8" rx="3" fill="#cbd5e1" />
                <rect x="20" y="106" width="90" height="8" rx="3" fill="#cbd5e1" />
                <rect x="20" y="130" width="60" height="20" rx="6" fill="#2563eb" />
              </g>
              <g transform="translate(160,270)">
                <rect width="180" height="100" rx="14" fill="#d1fae5" stroke="#a7f3d0" strokeWidth="1.5" />
                <circle cx="30" cy="30" r="14" fill="#ffffff" opacity=".9" />
                <path d="M25 30l3 3 6-7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
                <rect x="52" y="22" width="100" height="8" rx="3" fill="#0b1220" opacity=".5" />
                <rect x="52" y="38" width="70" height="6" rx="3" fill="#0b1220" opacity=".28" />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="stats">
        <div className="wrap stats-inner">
          <div className="stat"><b>{settings.stat_customers}</b><span>Pelanggan aktif</span></div>
          <div className="stat"><b>{settings.stat_products}</b><span>Produk terkurasi</span></div>
          <div className="stat"><b>{settings.stat_rating}</b><span>Rating kepuasan</span></div>
          <div className="stat"><b>{settings.stat_ontime}</b><span>Pesanan tepat waktu</span></div>
        </div>
      </section>

      {/* ============ KATEGORI ============ */}
      {categories.length > 0 && (
        <section className="section" id="kategori">
          <div className="wrap">
            <div className="section-head center">
              <span className="eyebrow">Jelajahi</span>
              <h2>Kategori pilihan.</h2>
              <p>Dari file kerja sampai perlengkapan rumah, semuanya sudah dikurasi.</p>
            </div>
            <div className="cat-grid">
              {categories.map((c) => (
                <Link key={c.id} href={`/kategori/${c.slug}`} className="cat-card">
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ PRODUK UNGGULAN ============ */}
      {products.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="prod-bar">
              <div className="section-head" style={{ marginBottom: 0 }}>
                <span className="eyebrow">Katalog</span>
                <h2 style={{ marginTop: 14 }}>Yang paling sering dibeli.</h2>
              </div>
              <Link href="/produk" className="btn btn-ghost">
                Lihat semua →
              </Link>
            </div>
            <div className="prod-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ KENAPA ============ */}
      <section className="section why">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Kenapa di Sini</span>
            <h2>Belanja yang tidak membuat Anda waswas.</h2>
          </div>
          <div className="why-grid">
            <div className="why-item"><h3>Pembayaran Aman</h3><p>Lewat Midtrans, transfer bank, atau e-wallet.</p></div>
            <div className="why-item"><h3>Download Instan</h3><p>Link download dikirim ke email setelah bayar.</p></div>
            <div className="why-item"><h3>Pengiriman Terlacak</h3><p>Dikemas dengan tangan, dikirim hari yang sama.</p></div>
            <div className="why-item"><h3>Garansi 7 Hari</h3><p>Tukar atau uang kembali dalam 7 hari.</p></div>
          </div>
        </div>
      </section>

      {/* ============ CERITA ============ */}
      <section className="section" id="cerita">
        <div className="wrap story">
          <div className="story-visual">
            <svg width="180" height="180" viewBox="0 0 200 200" fill="none" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M100 180V60" />
              <path d="M100 140c-22-6-38-24-42-46 20-2 40 10 42 32" />
              <path d="M100 120c22-6 38-24 42-46-20-2-40 10-42 32" />
              <circle cx="100" cy="40" r="6" />
              <path d="M70 180h60" opacity=".3" />
            </svg>
          </div>
          <div>
            <span className="eyebrow">Cerita Kami</span>
            <h2>Dimulai dari satu meja kayu di Garut.</h2>
            <p>Gumilar Jaya Store dimulai tahun 2019 sebagai toko kecil yang menjual template dan kaos buatan sendiri.</p>
            <p>Enam tahun kemudian, kami masih melakukan hal yang sama: memilih satu per satu, menguji sebelum menjual.</p>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONI ============ */}
      {testimonials.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head center">
              <span className="eyebrow">Kata Pembeli</span>
              <h2>Bukan kami yang bilang, tapi mereka.</h2>
            </div>
            <div className="testi-grid">
              {testimonials.map((t) => (
                <div key={t.id} className="testi">
                  <p className="testi-quote">{t.content}</p>
                  <div className="testi-foot">
                    <div className="testi-av">{t.name.slice(0, 2).toUpperCase()}</div>
                    <div className="testi-info">
                      <b>{t.name}</b>
                      <span>{(t.city || '').toUpperCase()} · {(t.product_type || '').toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ FAQ ============ */}
      {faqs.length > 0 && (
        <section className="section" id="faq" style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--line)' }}>
          <div className="wrap">
            <div className="section-head center">
              <span className="eyebrow">Pertanyaan Umum</span>
              <h2>Hal-hal yang sering ditanyakan.</h2>
            </div>
            <FaqAccordion faqs={faqs} />
          </div>
        </section>
      )}

      {/* ============ CTA NEWSLETTER ============ */}
      <section className="section">
        <div className="wrap">
          <div className="cta-block">
            <h2>Dapatkan produk baru, satu email sebulan.</h2>
            <p>Kami kirim satu email setiap awal bulan. Isi: produk baru, catatan pendek, kadang kode diskon.</p>
            <SubscribeForm />
          </div>
        </div>
      </section>
    </>
  );
}