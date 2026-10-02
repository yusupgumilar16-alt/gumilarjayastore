import Link from 'next/link';
import { notFound } from 'next/navigation';
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

  return (
    <>
      <style>{`
        @media print{
          .admin-sidebar,.admin-topbar,.no-print{display:none!important}
          body,html{background:#fff!important}
          .admin-body{padding:0!important}
          .admin-shell{background:#fff!important}
          .invoice-print{box-shadow:none;border-radius:0;max-width:100%}
        }
      `}</style>

      <div className="admin-card-head no-print">
        <h1 style={{ margin: 0 }}>Kwitansi {invoice.invoice_number}</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin/kwitansi" className="btn btn-ghost">← Kembali</Link>
          <Link href={`/admin/kwitansi/${invoice.id}/edit`} className="btn btn-ghost">Edit</Link>
          <a
            href={`/invoice/${invoice.public_token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            Lihat Publik
          </a>
          <PrintButton />
        </div>
      </div>

      <InvoicePrint
        invoice={invoice as Invoice}
        items={(items || []) as InvoiceItem[]}
        settings={{
          site_name: settings.site_name || 'Gumilar Jaya Store',
          contact_email: settings.contact_email || '',
          contact_whatsapp: settings.contact_whatsapp || '',
        }}
      />

      <div className="no-print" style={{ marginTop: 24 }}>
        <InvoiceActions invoice={invoice as Invoice} />
      </div>
    </>
  );
}