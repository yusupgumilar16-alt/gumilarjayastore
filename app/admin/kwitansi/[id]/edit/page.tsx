import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import InvoiceForm from '@/components/InvoiceForm';
import type { Invoice, InvoiceItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditInvoicePage({
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

  const [{ data: items }, { data: products }] = await Promise.all([
    supabase.from('invoice_items').select('*').eq('invoice_id', invoice.id).order('id'),
    supabase.from('products').select('id, name, price').order('name'),
  ]);

  return (
    <>
      <div className="admin-card-head">
        <h1>Edit Kwitansi {invoice.invoice_number}</h1>
        <Link href={`/admin/kwitansi/${invoice.id}`} className="btn btn-ghost">← Kembali</Link>
      </div>
      <InvoiceForm
        initial={invoice as Invoice}
        initialItems={(items || []) as InvoiceItem[]}
        products={products || []}
      />
    </>
  );
}