import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatRupiah, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: totalProducts },
    { count: totalCategories },
    { count: totalTestimonials },
    { count: totalFaqs },
    { count: totalSubscribers },
    { count: totalInvoices },
    { data: recentInvoices },
    { data: recentProducts },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }),
    supabase.from('faqs').select('*', { count: 'exact', head: true }),
    supabase.from('subscribers').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('id, invoice_number, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('id, name, price, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: 'Produk', value: totalProducts || 0, href: '/admin/produk' },
    { label: 'Kategori', value: totalCategories || 0, href: '/admin/kategori' },
    { label: 'Testimoni', value: totalTestimonials || 0, href: '/admin/testimoni' },
    { label: 'FAQ', value: totalFaqs || 0, href: '/admin/faq' },
    { label: 'Kwitansi', value: totalInvoices || 0, href: '/admin/kwitansi' },
    { label: 'Pelanggan', value: totalSubscribers || 0, href: '/admin/pelanggan' },
  ];

  return (
    <>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>

      <div className="stat-grid">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="stat-card">
            <b>{s.value}</b>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Kwitansi Terbaru</h3>
            <Link href="/admin/kwitansi" className="btn btn-ghost" style={{ fontSize: '.8rem', padding: '6px 12px' }}>
              Lihat semua
            </Link>
          </div>
          {!recentInvoices || recentInvoices.length === 0 ? (
            <p style={{ color: 'var(--muted)', padding: '20px 0' }}>Belum ada kwitansi.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Pelanggan</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link href={`/admin/kwitansi/${inv.id}`} style={{ color: 'var(--blue)', fontWeight: 600 }}>
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td>{inv.customer_name}</td>
                    <td><b>{formatRupiah(inv.total || 0)}</b></td>
                    <td><span className={`status-badge status-${inv.status}`}>{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Produk Terbaru</h3>
            <Link href="/admin/produk" className="btn btn-ghost" style={{ fontSize: '.8rem', padding: '6px 12px' }}>
              Lihat semua
            </Link>
          </div>
          {!recentProducts || recentProducts.length === 0 ? (
            <p style={{ color: 'var(--muted)', padding: '20px 0' }}>Belum ada produk.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Harga</th>
                  <th>Ditambahkan</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.name}</b></td>
                    <td>{formatRupiah(p.price)}</td>
                    <td style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{formatDateTime(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}