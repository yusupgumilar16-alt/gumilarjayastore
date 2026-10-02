import { createAdminClient } from '@/lib/supabase/admin';
import { formatRupiah, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pesanan' };

export default async function OrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  const list = orders || [];

  return (
    <>
      <h1 style={{ marginBottom: 24 }}>Pesanan <span style={{ color: '#94a3b8', fontWeight: 500 }}>({list.length})</span></h1>
      <div className="admin-card">
        {list.length === 0 ? (
          <p style={{ color: '#64748b', padding: '40px 0', textAlign: 'center' }}>Belum ada pesanan.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Nomor</th><th>Tanggal</th><th>Pelanggan</th><th style={{textAlign:'right'}}>Total</th><th>Status</th></tr></thead>
              <tbody>
                {list.map((o: any) => (
                  <tr key={o.id}>
                    <td><b>{o.order_number}</b></td>
                    <td>{formatDateTime(o.created_at)}</td>
                    <td><b>{o.customer_name}</b></td>
                    <td style={{ textAlign: 'right' }}><b>{formatRupiah(o.total)}</b></td>
                    <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
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