import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatRupiah, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kwitansi' };

export default async function InvoicesPage() {
  const supabase = createAdminClient();
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  const list = invoices || [];

  return (
    <>
      <div className="admin-card-head">
        <h1>Kwitansi <span style={{ color: '#94a3b8', fontWeight: 500 }}>({list.length})</span></h1>
        <Link href="/admin/kwitansi/baru" className="btn btn-primary">+ Buat Kwitansi</Link>
      </div>

      <div className="admin-card">
        {list.length === 0 ? (
          <p style={{ color: '#64748b', padding: '40px 0', textAlign: 'center' }}>
            Belum ada kwitansi.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Tanggal</th>
                  <th>Pelanggan</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((inv: any) => (
                  <tr key={inv.id}>
                    <td>
                      <Link href={`/admin/kwitansi/${inv.id}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td>{formatDate(inv.invoice_date)}</td>
                    <td><b>{inv.customer_name}</b></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatRupiah(inv.total)}</td>
                    <td><span className={`status-badge status-${inv.status}`}>{inv.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/kwitansi/${inv.id}`} style={{
                        display: 'inline-grid', placeItems: 'center',
                        width: 34, height: 34, borderRadius: 9,
                        background: '#eff6ff', color: '#2563eb',
                        border: '1px solid #bfdbfe', textDecoration: 'none', fontSize: '.9rem',
                      }}>👁</Link>
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