import type { Invoice, InvoiceItem } from '@/lib/types';
import InvoicePrintV3 from './InvoicePrintV3';
import InvoicePrintV4 from './InvoicePrintV4';

interface Props {
  invoice: Invoice & { customer_id_display?: string };
  items: InvoiceItem[];
  settings: Record<string, string>;
  publicUrl?: string;
}

export default function InvoicePrint(props: Props) {
  const template = props.settings.invoice_template || 'v3';
  if (template === 'v4') return <InvoicePrintV4 {...props} />;
  return <InvoicePrintV3 {...props} />;
}