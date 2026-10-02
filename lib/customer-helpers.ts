import type { CustomerIdType } from './types';

export const ID_TYPE_LABELS: Record<CustomerIdType, string> = {
  pln: 'ID PLN',
  internet: 'ID Pelanggan Internet',
  pdam: 'ID PDAM',
  telkom: 'ID Telkom',
  bpjs: 'ID BPJS',
  gas: 'ID Pelanggan Gas',
  air: 'ID Pelanggan Air',
  lainnya: 'ID Lainnya',
};

export const ID_TYPE_OPTIONS: { value: CustomerIdType; label: string; hint: string }[] = [
  { value: 'pln', label: 'ID PLN', hint: 'Contoh: 532310573293 (11-12 digit)' },
  { value: 'internet', label: 'ID Pelanggan Internet', hint: 'Contoh: 122000123456' },
  { value: 'pdam', label: 'ID PDAM', hint: 'Contoh: 10012345' },
  { value: 'telkom', label: 'ID Telkom', hint: 'Contoh: 123456789' },
  { value: 'bpjs', label: 'ID BPJS', hint: 'Contoh: 0001234567890 (13 digit)' },
  { value: 'gas', label: 'ID Pelanggan Gas', hint: 'Contoh: 1122334455' },
  { value: 'air', label: 'ID Pelanggan Air', hint: '' },
  { value: 'lainnya', label: 'ID Lainnya', hint: 'Nomor identifikasi bebas' },
];

// Auto-detect tipe ID dari format nomor
export function detectIdType(number: string): CustomerIdType {
  const clean = number.replace(/\D/g, '');
  if (clean.length === 13) return 'bpjs';
  if (clean.length === 11 || clean.length === 12) return 'pln';
  if (clean.length === 8) return 'pdam';
  if (clean.length === 9) return 'telkom';
  if (clean.length === 10) return 'gas';
  return 'lainnya';
}

// Format tampilan ID dengan label
export function formatCustomerId(idType: CustomerIdType, number: string): string {
  const label = ID_TYPE_LABELS[idType] || 'ID';
  return `${label}: ${number}`;
}