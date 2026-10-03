import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import type { Product, Category, Testimonial, Faq } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import FaqAccordion from '@/components/FaqAccordion';
import SubscribeForm from '@/components/SubscribeForm';
import WhatsAppPopup from '@/components/WhatsAppPopup';

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

  const heroWords = (settings.hero_title || 'Produk digital & fisik, dipilih satu per satu.').split(/\s+/);

  return (
    <>
      {/* HERO — tanpa visual kartu */}
      <section className="hero hero-simple">
        <div className="wrap">
          <div className="hero-simple-inner">
            <span className="hero-eyebrow">
              {settings.hero_eyebrow || 'Marketplace terkurasi · Sejak 2019'}
            </span>

            <h1 className="hero-simple-title">
              {heroWords.map((word, i) => (
                <span key={i} style={{ animationDelay: `${0.05 * i}s` }}>{word} </span>
              ))}
            </h1>

            <p className="hero-simple-lead">
              {settings.hero_subtitle || 'Template, e-book, apparel, hingga kopi specialty.'}
            </p>

            <div className="hero-simple-actions">
              <Link href="/produk" className="btn btn-primary btn-lg">Lihat Katalog</Link>
              <a href="#kategori" className="btn btn-ghost btn-lg">Jelajahi Kategori</a>
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI */}
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

      {/* PRODUK */}
      {products.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="prod-bar">
              <div className="section-head" style={{ marginBottom: 0 }}>
                <span className="eyebrow">Katalog</span>
                <h2 style={{ marginTop: 14 }}>Yang paling sering dibeli.</h2>
              </div>
              <Link href="/produk" className="btn btn-ghost">Lihat semua →</Link>
            </div>
            <div className="prod-grid">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* KENAPA */}
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

      {/* TESTIMONI */}
      {testimonials.length > 0 && (
        <section className="section">
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

      {/* FAQ */}
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

      {/* NEWSLETTER */}
      <section className="section">
        <div className="wrap">
          <div className="cta-block">
            <h2>Dapatkan produk baru, satu email sebulan.</h2>
            <p>Kami kirim satu email setiap awal bulan. Isi: produk baru, catatan pendek, kadang kode diskon.</p>
            <SubscribeForm />
          </div>
        </div>
      </section>

      {/* WA POPUP */}
      <WhatsAppPopup
        enabled={settings.wa_popup_enabled !== 'false'}
        phone={settings.contact_whatsapp || ''}
        title={settings.wa_popup_title || 'Butuh bantuan?'}
        subtitle={settings.wa_popup_subtitle || 'Chat kami via WhatsApp — balas cepat di jam kerja'}
        buttonLabel={settings.wa_popup_button || 'Chat via WhatsApp'}
        templateOrder={settings.wa_template_order || 'Halo, saya ingin memesan:\n\nProduk: {produk}\nJumlah: {jumlah}\n\nNama: {nama}\nAlamat: {alamat}\n\nMohon info ketersediaan dan total harga.'}
        templateGeneral={settings.wa_template_general || 'Halo, saya ingin bertanya tentang produk.'}
      />
    </>
  );
}
