import type { CustomerIdType } from './types';

// ============ ID TYPE DETECTION ============
export function detectIdType(number: string): CustomerIdType {
  const clean = String(number || '').replace(/\D/g, '');
  if (clean.length === 13) return 'bpjs';
  if (clean.length === 11 || clean.length === 12) return 'pln';
  if (clean.length === 10) return 'gas';
  if (clean.length === 9) return 'telkom';
  if (clean.length === 8) return 'pdam';
  return 'lainnya';
}

export function idTypeLabel(type: CustomerIdType): string {
  const map: Record<CustomerIdType, string> = {
    pln: 'ID PLN',
    internet: 'ID Pelanggan Internet',
    pdam: 'ID PDAM',
    telkom: 'ID Telkom',
    bpjs: 'ID BPJS',
    gas: 'ID Pelanggan Gas',
    air: 'ID Pelanggan Air',
    lainnya: 'ID Lainnya',
  };
  return map[type] || 'ID';
}

// ============ JENIS TRANSAKSI MAPPING ============
export const TRANSACTION_CATEGORIES = [
  'LISTRIK PASCABAYAR',
  'LISTRIK PRABAYAR',
  'INTERNET',
  'PDAM',
  'TELKOM',
  'BPJS',
  'GAS',
  'PULSA',
  'LAINNYA',
] as const;

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number];

export function normalizeCategory(raw: string): string {
  const clean = String(raw || '').trim().toUpperCase();
  if (clean.includes('PASCABAYAR') || clean.includes('PASCA')) return 'LISTRIK PASCABAYAR';
  if (clean.includes('PRABAYAR') || clean.includes('PRA')) return 'LISTRIK PRABAYAR';
  if (clean.includes('INTERNET') || clean.includes('INDIHOME')) return 'INTERNET';
  if (clean.includes('PDAM')) return 'PDAM';
  if (clean.includes('TELKOM')) return 'TELKOM';
  if (clean.includes('BPJS')) return 'BPJS';
  if (clean.includes('GAS')) return 'GAS';
  if (clean.includes('PULSA') || clean.includes('DATA')) return 'PULSA';
  return 'LAINNYA';
}

// ============ PARSE ANGKA ============
export function parseNumber(input: any): number {
  if (input === null || input === undefined || input === '') return 0;
  if (typeof input === 'number') return Math.round(input);
  const cleaned = String(input).replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

// ============ PARSE TANGGAL ============
export function parseDate(input: any): string {
  if (!input) return new Date().toISOString().slice(0, 10);

  // Kalau sudah Date object
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return new Date().toISOString().slice(0, 10);
    return input.toISOString().slice(0, 10);
  }

  const str = String(input).trim();
  if (!str) return new Date().toISOString().slice(0, 10);

  // Format: 2023-01-20 00:00:00
  const isoMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  // Format: 01/20/2023 atau 20/01/2023
  const slashMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const a = parseInt(slashMatch[1]);
    const b = parseInt(slashMatch[2]);
    const y = slashMatch[3];
    // Asumsi US format: MM/DD/YYYY kalau a <= 12
    const m = a <= 12 ? a : b;
    const d = a <= 12 ? b : a;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // Coba Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);

  return new Date().toISOString().slice(0, 10);
}

// ============ PARSE JAM (payment_time) ============
export function parseTime(input: any): string {
  if (!input) return '';
  if (input instanceof Date) {
    const h = String(input.getUTCHours()).padStart(2, '0');
    const m = String(input.getUTCMinutes()).padStart(2, '0');
    const s = String(input.getUTCSeconds()).padStart(2, '0');
    return `${h}.${m}.${s} WIB`;
  }
  const str = String(input).trim();
  if (!str) return '';
  // Format: 22.41.00 atau 22:41:00 atau 22.41
  const match = str.match(/(\d{1,2})[.:](\d{2})(?:[.:](\d{2}))?/);
  if (match) {
    return `${match[1].padStart(2, '0')}.${match[2]}.${match[3] || '00'} WIB`;
  }
  return str;
}

// ============ PARSE BARIS EXCEL ============
export interface ExcelRow {
  [key: string]: any;
}

// Normalize header: hilangkan spasi, lowercase, dsb
export function normalizeHeader(h: string): string {
  return String(h || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

// Cari nilai di row berdasarkan beberapa kemungkinan nama kolom
export function findValue(row: ExcelRow, ...candidates: string[]): any {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    const target = normalizeHeader(cand);
    for (const k of keys) {
      if (normalizeHeader(k) === target) {
        return row[k];
      }
    }
  }
  return undefined;
}