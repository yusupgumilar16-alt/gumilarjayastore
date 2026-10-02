import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatRupiah, formatDate } from '@/lib/utils';
import type { Invoice, InvoiceItem } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kwitansi' };

export default async function InvoicePublicPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createAdminClient();

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('public_token', params.token)
    .maybeSingle();

  if (!invoice) notFound();

  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoice.id)
    .order('id');

  const inv = invoice as Invoice;
  const list = (items || []) as InvoiceItem[];

  const statusColor: Record<string, string> = {
    draft: 'background:#f1f5f9;color:#475569',
    terkirim: 'background:#dbeafe;color:#1e40af',
    dibayar: 'background:#d1fae5;color:#065f46',
    batal: 'background:#fee2e2;color:#991b1b',
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
          .invoice-card { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <section className="section">
        <div className="wrap" style={{ maxWidth: 860 }}>
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ margin: 0 }}>Kwitansi</h1>
            <button
              className="btn btn-primary"
              onClick={undefined}
              formAction={undefined}
              style={{ cursor: 'pointer' }}
              dangerouslySetInnerHTML={{ __html: '' }}
            />
            <PrintButton />
          </div>

          <div
            className="invoice-card"
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 16,
              padding: 40,
            }}
          >
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 36, paddingBottom: 24, borderBottom: '2px solid var(--ink)', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--blue)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>GJ</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>Gumilar Jaya Store</div>
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                  Garut, Indonesia<br />
                  halo@gumilarjaya.store
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: 4 }}>
                  Kwitansi
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>{inv.invoice_number}</div>
                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 99, fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}
                  dangerouslySetInnerHTML={{ __html: '' }}
                />
                <StatusBadge status={inv.status} />
              </div>
            </div>

            {/* INFO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 36 }}>
              <div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 8 }}>
                  Ditagihkan kepada
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{inv.customer_name}</div>
                {inv.customer_email && <div style={{ fontSize: '.88rem', color: 'var(--ink-2)' }}>{inv.customer_email}</div>}
                {inv.customer_phone && <div style={{ fontSize: '.88rem', color: 'var(--ink-2)' }}>{inv.customer_phone}</div>}
                {inv.customer_address && <div style={{ fontSize: '.88rem', color: 'var(--ink-2)', marginTop: 4, whiteSpace: 'pre-line' }}>{inv.customer_address}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 4 }}>
                    Tanggal
                  </div>
                  <div style={{ fontWeight: 600 }}>{formatDate(inv.invoice_date)}</div>
                </div>
                {inv.due_date && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 4 }}>
                      Jatuh Tempo
                    </div>
                    <div style={{ fontWeight: 600 }}>{formatDate(inv.due_date)}</div>
                  </div>
                )}
                {inv.payment_method && (
                  <div>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 4 }}>
                      Metode
                    </div>
                    <div style={{ fontWeight: 600 }}>{inv.payment_method}</div>
                  </div>
                )}
              </div>
            </div>

            {/* ITEMS */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 700 }}>Deskripsi</th>
                  <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 700, width: 60 }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 700, width: 130 }}>Harga</th>
                  <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 700, width: 130 }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {list.map((it) => (
                  <tr key={it.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '14px 0', fontSize: '.92rem' }}>{it.description}</td>
                    <td style={{ padding: '14px 0', textAlign: 'center', fontSize: '.92rem' }}>{it.qty}</td>
                    <td style={{ padding: '14px 0', textAlign: 'right', fontSize: '.92rem' }}>{formatRupiah(it.unit_price)}</td>
                    <td style={{ padding: '14px 0', textAlign: 'right', fontSize: '.92rem', fontWeight: 600 }}>{formatRupiah(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTALS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '.9rem' }}>
                  <span style={{ color: 'var(--muted)' }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>{formatRupiah(inv.subtotal)}</span>
                </div>
                {inv.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '.9rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Diskon</span>
                    <span style={{ fontWeight: 600, color: '#dc2626' }}>−{formatRupiah(inv.discount)}</span>
                  </div>
                )}
                {inv.tax > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '.9rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Pajak</span>
                    <span style={{ fontWeight: 600 }}>{formatRupiah(inv.tax)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '2px solid var(--ink)', marginTop: 8, fontSize: '1.15rem' }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontWeight: 800, color: 'var(--blue)' }}>{formatRupiah(inv.total)}</span>
                </div>
              </div>
            </div>

            {/* NOTES */}
            {inv.notes && (
              <div style={{ marginTop: 36, padding: 20, background: 'var(--bg-soft)', borderRadius: 12 }}>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 6 }}>
                  Catatan
                </div>
                <div style={{ fontSize: '.9rem', whiteSpace: 'pre-line' }}>{inv.notes}</div>
              </div>
            )}

            <div style={{ marginTop: 40, textAlign: 'center', fontSize: '.78rem', color: 'var(--muted)' }}>
              Terima kasih atas kepercayaan Anda.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Client component untuk tombol print & badge
function PrintButton() {
  return (
    <form>
      <button
        type="button"
        className="btn btn-primary"
        // @ts-ignore
        onClick={(e: any) => { if (typeof window !== 'undefined') window.print(); }}
      >
        Print / PDF
      </button>
    </form>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: '#f1f5f9', color: '#475569', label: 'Draft' },
    terkirim: { bg: '#dbeafe', color: '#1e40af', label: 'Terkirim' },
    dibayar: { bg: '#d1fae5', color: '#065f46', label: 'Dibayar' },
    batal: { bg: '#fee2e2', color: '#991b1b', label: 'Batal' },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 99,
      fontSize: '.72rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      background: s.bg,
      color: s.color,
    }}>
      {s.label}
    </span>
  );
}