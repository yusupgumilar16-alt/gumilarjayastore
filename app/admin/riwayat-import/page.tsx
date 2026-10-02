import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Riwayat Import' };

export default async function ImportHistoryPage() {
  const supabase = createAdminClient();
  const { data: logs } = await supabase.from('import_logs').select('*').order('created_at', { ascending: false }).limit(100);
  const list = logs || [];

  return (
    <>
      <div className="admin-card-head">
        <h1>Riwayat Import</h1>
        <Link href="/admin/import" className="btn btn-primary">+ Import Baru</Link>
      </div>
      <div className="admin-card">
        {list.length === 0 ? (
          <p style={{ color: '#64748b', padding: '40px 0', textAlign: 'center' }}>Belum ada riwayat.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tanggal</th><th>Jenis</th><th>File</th>
                  <th style={{textAlign:'right'}}>Total</th>
                  <th style={{textAlign:'right'}}>Sukses</th>
                  <th style={{textAlign:'right'}}>Gagal</th>
                </tr>
              </thead>
              <tbody>
                {list.map((log: any) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '.82rem' }}>{formatDateTime(log.created_at)}</td>
                    <td><span className="badge">{log.import_type}</span></td>
                    <td style={{ fontSize: '.82rem' }}>{log.filename || '—'}</td>
                    <td style={{ textAlign: 'right' }}>{log.total_rows}</td>
                    <td style={{ textAlign: 'right', color: '#059669', fontWeight: 600 }}>{log.success_rows}</td>
                    <td style={{ textAlign: 'right', color: log.failed_rows > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>{log.failed_rows}</td>
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