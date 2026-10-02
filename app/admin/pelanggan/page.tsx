import { createAdminClient } from '@/lib/supabase/admin';
import { formatDateTime } from '@/lib/utils';
import DeleteButton from '@/components/DeleteButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pelanggan' };

export default async function AdminSubscribersPage() {
  const supabase = createAdminClient();
  const { data: subs } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  const list = subs || [];

  return (
    <>
      <h1 style={{ marginBottom: 24 }}>Pelanggan Newsletter ({list.length})</h1>
      <div className="admin-card">
        {list.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>
            Belum ada pelanggan yang berlangganan newsletter.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Terdaftar</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td><b>{s.email}</b></td>
                  <td>{formatDateTime(s.created_at)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <DeleteButton
                      url={`/api/admin/subscribers/${s.id}`}
                      label="Hapus"
                      confirmMessage={`Hapus ${s.email} dari daftar?`}
                    />
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