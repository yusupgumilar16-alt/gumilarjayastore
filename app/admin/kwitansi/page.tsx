import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatRupiah, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kwitansi' };

export default async function AdminInvoicesPage() {
  const supabase = createAdminClient();
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  const list = invoices || [];

  return (
    <>
      <div className="admin-card-head">
        <h1 style={{ margin: 0 }}>Kwitansi ({list.length})</h1>
        <Link href="/admin/kwitansi/baru" className="btn btn-primary">+ Buat Kwitansi</Link>
      </div>

      <div className="admin-card">
        {list.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>
            Belum ada kwitansi. Klik &quot;Buat Kwitansi&quot; untuk memulai.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <Link href={`/admin/kwitansi/${inv.id}`} style={{ color: 'var(--blue)', fontWeight: 600 }}>
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td>{formatDate(inv.invoice_date)}</td>
                  <td>
                    <b>{inv.customer_name}</b>
                    {inv.customer_email && <><br /><small style={{ color: 'var(--muted)' }}>{inv.customer_email}</small></>}
                  </td>
                  <td><b>{formatRupiah(inv.total)}</b></td>
                  <td><span className={`status-badge status-${inv.status}`}>{inv.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/kwitansi/${inv.id}`} className="btn btn-ghost btn-icon">Lihat</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}