import { createAdminClient } from '@/lib/supabase/admin';
import { formatRupiah, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pesanan' };

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const list = orders || [];

  return (
    <>
      <h1 style={{ marginBottom: 24 }}>Pesanan ({list.length})</h1>
      <div className="admin-card">
        {list.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>
            Belum ada pesanan. Pesanan akan muncul di sini setelah fitur checkout aktif.
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
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td><b>{o.order_number}</b></td>
                  <td>{formatDateTime(o.created_at)}</td>
                  <td>
                    <b>{o.customer_name}</b>
                    {o.customer_email && <><br /><small style={{ color: 'var(--muted)' }}>{o.customer_email}</small></>}
                  </td>
                  <td><b>{formatRupiah(o.total)}</b></td>
                  <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}