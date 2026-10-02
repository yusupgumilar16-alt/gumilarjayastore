import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/settings';
import InvoicePrint from '@/components/InvoicePrint';
import PrintButton from '@/components/PrintButton';
import type { Invoice, InvoiceItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

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

  const settings = await getSettings();
  const inv = invoice as Invoice;
  const list = (items || []) as InvoiceItem[];

  return (
    <>
      <style>{`
        body{background:#eef2f8;padding:40px 20px}
        .toolbar-print{max-width:820px;margin:0 auto 20px;display:flex;justify-content:flex-end;gap:10px}
        @media print{
          body{background:#fff;padding:0}
          .toolbar-print,.no-print{display:none!important}
          .invoice-print{box-shadow:none;border-radius:0}
        }
      `}</style>

      <div className="toolbar-print no-print">
        <PrintButton />
      </div>

      <InvoicePrint
        invoice={inv}
        items={list}
        settings={{
          site_name: settings.site_name || 'Gumilar Jaya Store',
          contact_email: settings.contact_email || '',
          contact_whatsapp: settings.contact_whatsapp || '',
        }}
      />
    </>
  );
}