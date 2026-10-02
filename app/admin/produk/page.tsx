import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatRupiah } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Produk' };

export default async function ProductsPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  const list = (products || []).map((p: any) => ({
    ...p,
    category_name: p.categories?.name || '—',
  }));

  return (
    <>
      <div className="admin-card-head">
        <h1>Produk <span style={{ color: '#94a3b8', fontWeight: 500 }}>({list.length})</span></h1>
        <Link href="/admin/produk/baru" className="btn btn-primary">+ Tambah Produk</Link>
      </div>

      <div className="admin-card">
        {list.length === 0 ? (
          <p style={{ color: '#64748b', padding: '40px 0', textAlign: 'center' }}>
            Belum ada produk.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}></th>
                  <th>Nama</th>
                  <th>Kategori</th>
                  <th>Tipe</th>
                  <th>Harga</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt={p.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: '#eff6ff', display: 'grid', placeItems: 'center', color: '#2563eb', fontWeight: 700 }}>
                          {p.service_type === 'listrik' ? '⚡' : p.type === 'digital' ? '📄' : '📦'}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      {p.service_type === 'listrik' && (
                        <span style={{ fontSize: '.65rem', padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 99, fontWeight: 700 }}>
                          ⚡ LISTRIK
                        </span>
                      )}
                    </td>
                    <td>{p.category_name}</td>
                    <td><span className={`badge ${p.type}`}>{p.type}</span></td>
                    <td style={{ fontWeight: 700 }}>{formatRupiah(p.discount_price || p.price)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/produk/${p.id}`} style={{
                        display: 'inline-grid', placeItems: 'center',
                        width: 34, height: 34, borderRadius: 9,
                        background: '#eff6ff', color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        textDecoration: 'none', fontSize: '.9rem',
                      }}>✎</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}