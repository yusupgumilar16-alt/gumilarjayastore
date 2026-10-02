import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/settings';
import InvoicePrint from '@/components/InvoicePrint';
import InvoiceActions from '@/components/InvoiceActions';
import PrintButton from '@/components/PrintButton';
import type { Invoice, InvoiceItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminInvoiceDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();
  if (!invoice) notFound();

  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoice.id)
    .order('id');

  const settings = await getSettings();
  const h = headers();
  const host = h.get('host') || 'localhost:3000';
  const proto = host.includes('localhost') ? 'http' : 'https';
  const publicUrl = `${proto}://${host}/invoice/${invoice.public_token}`;

  return (
    <>
      <style>{`
        @media print{
          .admin-sidebar,.admin-topbar,.no-print{display:none!important}
          body,html{background:#fff!important}
          .admin-body{padding:0!important}
          .admin-shell{background:#fff!important}
          .invoice-print{box-shadow:none;border-radius:0;max-width:100%}
          .admin-card-head{display:none!important}
        }
      `}</style>

      <div className="admin-card-head no-print">
        <h1 style={{ margin: 0 }}>Kwitansi {invoice.invoice_number}</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin/kwitansi" className="btn btn-ghost">← Kembali</Link>
          <Link href={`/admin/kwitansi/${invoice.id}/edit`} className="btn btn-ghost">Edit</Link>
          <PrintButton />
        </div>
      </div>

      <div className="admin-grid-2" style={{ gridTemplateColumns: '1fr 340px', alignItems: 'start' }}>
        <div>
          <InvoicePrint
            invoice={invoice as Invoice}
            items={(items || []) as InvoiceItem[]}
            settings={settings}
            publicUrl={publicUrl}
          />
        </div>
        <div className="no-print">
          <InvoiceActions invoice={invoice as Invoice} />
        </div>
      </div>
    </>
  );
}