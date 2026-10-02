// ============================================================
//  Konversi angka ke huruf Bahasa Indonesia
//  Contoh: 401760 → "Empat Ratus Satu Ribu Tujuh Ratus Enam Puluh Rupiah"
// ============================================================

const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

function toWords(n: number): string {
  if (n < 0) return 'minus ' + toWords(Math.abs(n));
  if (n < 12) return SATUAN[n];
  if (n < 20) return toWords(n - 10) + ' belas';
  if (n < 100) return toWords(Math.floor(n / 10)) + ' puluh ' + toWords(n % 10);
  if (n < 200) return 'seratus ' + toWords(n - 100);
  if (n < 1000) return toWords(Math.floor(n / 100)) + ' ratus ' + toWords(n % 100);
  if (n < 2000) return 'seribu ' + toWords(n - 1000);
  if (n < 1000000) return toWords(Math.floor(n / 1000)) + ' ribu ' + toWords(n % 1000);
  if (n < 1000000000) return toWords(Math.floor(n / 1000000)) + ' juta ' + toWords(n % 1000000);
  if (n < 1000000000000) return toWords(Math.floor(n / 1000000000)) + ' miliar ' + toWords(n % 1000000000);
  return toWords(Math.floor(n / 1000000000000)) + ' triliun ' + toWords(n % 1000000000000);
}

export function terbilang(n: number): string {
  const num = Math.round(Math.abs(n || 0));
  if (num === 0) return 'Nol Rupiah';

  const words = toWords(num)
    .replace(/\s+/g, ' ')
    .trim();

  // Kapitalisasi setiap kata
  const capitalized = words
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return capitalized + ' Rupiah';
}