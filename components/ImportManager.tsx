'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { findValue, parseNumber, parseDate, parseTime, normalizeCategory } from '@/lib/import-helpers';

type Mode = 'select' | 'preview' | 'importing' | 'result';
type ImportType = 'customers' | 'invoices';

interface ParsedRow {
  _rowNum: number;
  _errors: string[];
  [key: string]: any;
}

const CHUNK_SIZE = 20; // 20 baris per request

export default function ImportManager() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('select');
  const [importType, setImportType] = useState<ImportType>('invoices');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [filename, setFilename] = useState('');
  const [result, setResult] = useState<any>(null);
  const [autoCreate, setAutoCreate] = useState(true);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0, skipped: 0 });
  const [currentChunkMsg, setCurrentChunkMsg] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as any[];

    if (importType === 'invoices') {
      setRows(json.map((r, i) => parseInvoiceRow(r, i + 2)));
    } else {
      setRows(json.map((r, i) => parseCustomerRow(r, i + 2)));
    }
    setMode('preview');
  }

  function parseInvoiceRow(r: any, rowNum: number): ParsedRow {
    const errors: string[] = [];
    const idNumber = String(findValue(r, 'ID PEL', 'ID PELANGGAN', 'IDPEL') || '').trim();
    const name = String(findValue(r, 'NAMA', 'NAMA PELANGGAN') || '').trim();
    const address = String(findValue(r, 'ALAMAT', 'ADDRESS') || '').trim();
    const externalRef = String(findValue(r, 'NO TRANSAKSI', 'NO_TRANSAKSI', 'REF') || '').trim();
    const invoiceDate = findValue(r, 'TGL LUNAS', 'TANGGAL', 'TGL') || '';
    const category = String(findValue(r, 'JENIS TRANSAKSI', 'JENIS', 'CATEGORY') || '').trim();
    const tokenNumber = String(findValue(r, 'NO TOKEN', 'TOKEN') || '').trim();
    const subtotal = parseNumber(findValue(r, 'NOMINAL', 'JUMLAH'));
    const penalty = parseNumber(findValue(r, 'DENDA'));
    const adminFee = parseNumber(findValue(r, 'ADM', 'ADMIN'));
    const total = parseNumber(findValue(r, 'TOTAL BAYAR', 'TOTAL'));
    const paymentTime = findValue(r, 'JAM', 'TIME', 'WAKTU') || '';
    const period = String(findValue(r, 'PERIODE', 'PERIOD') || '').trim();

    if (!name) errors.push('Nama kosong');
    if (!invoiceDate) errors.push('Tanggal kosong');

    return {
      _rowNum: rowNum,
      _errors: errors,
      external_ref: externalRef,
      invoice_date: invoiceDate ? parseDate(invoiceDate) : '',
      category: normalizeCategory(category),
      id_number: idNumber,
      customer_name: name,
      address,
      token_number: tokenNumber,
      subtotal,
      penalty,
      admin_fee: adminFee,
      total,
      payment_time: parseTime(paymentTime),
      period,
    };
  }

  function parseCustomerRow(r: any, rowNum: number): ParsedRow {
    const errors: string[] = [];
    const idNumber = String(findValue(r, 'ID PEL', 'ID PELANGGAN', 'IDPEL', 'ID') || '').trim();
    const name = String(findValue(r, 'NAMA', 'NAMA PELANGGAN', 'NAME') || '').trim();
    const address = String(findValue(r, 'ALAMAT', 'ADDRESS') || '').trim();
    const phone = String(findValue(r, 'TELEPON', 'TELP', 'HP', 'WA', 'PHONE') || '').trim();
    const email = String(findValue(r, 'EMAIL') || '').trim();
    const idType = String(findValue(r, 'JENIS ID', 'TIPE ID', 'TYPE') || '').trim();

    if (!name) errors.push('Nama kosong');

    return {
      _rowNum: rowNum,
      _errors: errors,
      id_number: idNumber,
      name,
      address,
      phone,
      email,
      id_type: idType.toLowerCase(),
    };
  }

  async function postChunk(chunk: ParsedRow[], batchId: string, chunkIdx: number, isLast: boolean) {
    const res = await fetch(`/api/admin/import/${importType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rows: chunk,
        filename,
        batchId,
        chunkIndex: chunkIdx,
        isLastChunk: isLast,
        autoCreateCustomer: autoCreate,
        dryRun: false,
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Response tidak valid: ${text.slice(0, 200)}`);
    }
  }

  async function handleImport() {
    setMode('importing');

    const validRows = rows.filter((r) => r._errors.length === 0);

    if (validRows.length === 0) {
      setResult({ ok: false, error: 'Tidak ada baris valid untuk di-import' });
      setMode('result');
      return;
    }

    const batchId = `IMP-${importType.toUpperCase()}-${Date.now()}`;
    const chunks: ParsedRow[][] = [];
    for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
      chunks.push(validRows.slice(i, i + CHUNK_SIZE));
    }

    setProgress({ current: 0, total: validRows.length, success: 0, failed: 0, skipped: 0 });

    let totalSuccess = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    const allErrors: any[] = [];

    for (let i = 0; i < chunks.length; i++) {
      setCurrentChunkMsg(`Memproses baris ${i * CHUNK_SIZE + 1}–${Math.min((i + 1) * CHUNK_SIZE, validRows.length)} dari ${validRows.length}…`);

      let attempt = 0;
      let success = false;
      let lastErr = '';

      while (attempt < 3 && !success) {
        try {
          const data = await postChunk(
            chunks[i].map((r) => ({ ...r, _rowNum: r._rowNum })),
            batchId,
            i,
            i === chunks.length - 1
          );

          totalSuccess += data.success || 0;
          totalFailed += data.failed || 0;
          totalSkipped += data.skipped || 0;
          if (data.errors) allErrors.push(...data.errors);

          setProgress((p) => ({
            ...p,
            current: Math.min((i + 1) * CHUNK_SIZE, validRows.length),
            success: totalSuccess,
            failed: totalFailed,
            skipped: totalSkipped,
          }));

          success = true;
        } catch (err: any) {
          attempt++;
          lastErr = err.message || 'Error';
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }
        }
      }

      if (!success) {
        totalFailed += chunks[i].length;
        allErrors.push({ row: `Chunk ${i + 1}`, error: `Gagal setelah 3 percobaan: ${lastErr}` });
        setProgress((p) => ({
          ...p,
          current: Math.min((i + 1) * CHUNK_SIZE, validRows.length),
          failed: totalFailed,
        }));
      }

      // Delay kecil untuk hindari rate limit
      await new Promise((r) => setTimeout(r, 200));
    }

    setResult({
      ok: true,
      batch_id: batchId,
      total: validRows.length,
      success: totalSuccess,
      failed: totalFailed,
      skipped: totalSkipped,
      errors: allErrors.slice(0, 50),
    });
    setMode('result');
    router.refresh();
  }

  function downloadTemplate() {
    let template: any[] = [];
    let sheetName = 'Template';

    if (importType === 'invoices') {
      template = [{
        'NO TRANSAKSI': 'JPAY/1234567890/SHP',
        'TGL LUNAS': '2026-01-20',
        'JENIS TRANSAKSI': 'LISTRIK PASCABAYAR',
        'ID PEL': '532310573293',
        'NAMA': 'SMPN IMBANAGARA',
        'ALAMAT': 'Garut',
        'NO TOKEN': '',
        'NOMINAL': 300000,
        'DENDA': 0,
        'ADM': 2500,
        'TOTAL BAYAR': 302500,
        'jam': '22.41.00 WIB',
        'PERIODE': 'TAGIHAN BULAN JANUARI 2026',
      }];
      sheetName = 'Import Transaksi';
    } else {
      template = [{
        'ID PEL': '532310573293',
        'NAMA': 'SMPN IMBANAGARA',
        'ALAMAT': 'Garut, Jawa Barat',
        'TELEPON': '08123456789',
        'EMAIL': 'email@example.com',
        'JENIS ID': 'pln',
      }];
      sheetName = 'Import Pelanggan';
    }

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `template-import-${importType}.xlsx`);
  }

  function reset() {
    setMode('select');
    setRows([]);
    setResult(null);
    setFilename('');
    setProgress({ current: 0, total: 0, success: 0, failed: 0, skipped: 0 });
  }

  const validCount = rows.filter((r) => r._errors.length === 0).length;
  const invalidCount = rows.filter((r) => r._errors.length > 0).length;

  // ============================================================
  // RENDER
  // ============================================================

  if (mode === 'select') {
    return (
      <div className="admin-card">
        <h3 style={{ marginBottom: 20 }}>Pilih jenis data yang ingin di-import</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <button
            onClick={() => setImportType('invoices')}
            style={{
              padding: 24, borderRadius: 14,
              border: `2px solid ${importType === 'invoices' ? '#2563eb' : '#e2e8f0'}`,
              background: importType === 'invoices' ? '#eff6ff' : '#fff',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>📊 Import Transaksi</div>
            <div style={{ fontSize: '.85rem', color: '#64748b' }}>Data kwitansi dari Excel — auto-create pelanggan</div>
          </button>

          <button
            onClick={() => setImportType('customers')}
            style={{
              padding: 24, borderRadius: 14,
              border: `2px solid ${importType === 'customers' ? '#2563eb' : '#e2e8f0'}`,
              background: importType === 'customers' ? '#eff6ff' : '#fff',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>👥 Import Pelanggan</div>
            <div style={{ fontSize: '.85rem', color: '#64748b' }}>Data pelanggan + ID pelanggan</div>
          </button>
        </div>

        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, marginBottom: 24, fontSize: '.85rem', color: '#64748b' }}>
          <b style={{ color: '#0b1220' }}>Langkah:</b>
          <ol style={{ margin: '8px 0 0 20px', lineHeight: 1.8 }}>
            <li>Download template Excel</li>
            <li>Isi sesuai kolom</li>
            <li>Upload file, review preview</li>
            <li>Klik &quot;Proses Import&quot; (otomatis dipecah per 20 baris)</li>
          </ol>
        </div>

        <button onClick={downloadTemplate} className="btn btn-ghost" style={{ marginBottom: 16 }}>
          📥 Download Template Excel
        </button>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, marginTop: 20 }}>
          <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, marginBottom: 8 }}>
            Pilih file Excel (.xlsx / .xls)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            style={{ width: '100%', padding: 12, border: '2px dashed #cbd5e1', borderRadius: 12, background: '#f8fafc', cursor: 'pointer' }}
          />
        </div>
      </div>
    );
  }

  if (mode === 'preview') {
    return (
      <>
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Preview Import</h3>
            <button onClick={reset} className="btn btn-ghost" style={{ fontSize: '.82rem' }}>← Pilih File Lain</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 16, background: '#f1f5f9', borderRadius: 12 }}>
              <div style={{ fontSize: '.7rem', color: '#64748b', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>Total Baris</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{rows.length}</div>
            </div>
            <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 12 }}>
              <div style={{ fontSize: '.7rem', color: '#059669', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>Valid</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>{validCount}</div>
            </div>
            <div style={{ padding: 16, background: invalidCount > 0 ? '#fef2f2' : '#f1f5f9', borderRadius: 12 }}>
              <div style={{ fontSize: '.7rem', color: invalidCount > 0 ? '#dc2626' : '#64748b', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>Tidak Valid</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: invalidCount > 0 ? '#dc2626' : '#64748b' }}>{invalidCount}</div>
            </div>
          </div>

          <div style={{ fontSize: '.82rem', color: '#64748b', marginBottom: 12 }}>
            File: <b>{filename}</b> · Akan diproses dalam <b>{Math.ceil(validCount / CHUNK_SIZE)} batch</b> (20 baris/batch)
          </div>

          {importType === 'invoices' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: '#f8fafc', borderRadius: 10, marginBottom: 16, cursor: 'pointer', fontSize: '.88rem' }}>
              <input type="checkbox" checked={autoCreate} onChange={(e) => setAutoCreate(e.target.checked)} />
              Auto-create pelanggan baru kalau belum terdaftar
            </label>
          )}

          <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'auto', maxHeight: 400 }}>
            <table className="admin-table" style={{ fontSize: '.8rem' }}>
              <thead>
                <tr>
                  <th>Baris</th>
                  {importType === 'invoices' ? (
                    <>
                      <th>Tgl</th><th>Jenis</th><th>ID Pel</th><th>Nama</th>
                      <th style={{ textAlign: 'right' }}>Total</th><th>Status</th>
                    </>
                  ) : (
                    <>
                      <th>ID Pel</th><th>Nama</th><th>Alamat</th><th>Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map((r, i) => (
                  <tr key={i} style={{ background: r._errors.length > 0 ? '#fef2f2' : 'transparent' }}>
                    <td style={{ color: '#94a3b8' }}>{r._rowNum}</td>
                    {importType === 'invoices' ? (
                      <>
                        <td>{r.invoice_date}</td>
                        <td>{r.category}</td>
                        <td><code style={{ fontSize: '.75rem' }}>{r.id_number}</code></td>
                        <td>{r.customer_name}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{r.total.toLocaleString('id-ID')}</td>
                        <td>
                          {r._errors.length > 0
                            ? <span style={{ color: '#dc2626', fontSize: '.75rem' }}>⚠ {r._errors.join(', ')}</span>
                            : <span style={{ color: '#059669', fontSize: '.75rem' }}>✓</span>}
                        </td>
                      </>
                    ) : (
                      <>
                        <td><code style={{ fontSize: '.75rem' }}>{r.id_number}</code></td>
                        <td>{r.name}</td>
                        <td style={{ fontSize: '.75rem', color: '#64748b' }}>{r.address}</td>
                        <td>
                          {r._errors.length > 0
                            ? <span style={{ color: '#dc2626', fontSize: '.75rem' }}>⚠ {r._errors.join(', ')}</span>
                            : <span style={{ color: '#059669', fontSize: '.75rem' }}>✓</span>}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={reset} className="btn btn-ghost">Batal</button>
          <button onClick={handleImport} className="btn btn-primary" disabled={validCount === 0}>
            Proses Import ({validCount} baris · {Math.ceil(validCount / CHUNK_SIZE)} batch)
          </button>
        </div>
      </>
    );
  }

  if (mode === 'importing') {
    const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    return (
      <div className="admin-card" style={{ padding: 40 }}>
        <h3 style={{ marginBottom: 20, textAlign: 'center' }}>⏳ Sedang meng-import…</h3>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '.88rem' }}>
            <span>{currentChunkMsg}</span>
            <b>{pct}%</b>
          </div>
          <div style={{ height: 12, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: 'linear-gradient(90deg,#2563eb,#10b981)',
              transition: 'width .3s',
            }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{ padding: 14, background: '#f0fdf4', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '.7rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.1em' }}>Sukses</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>{progress.success}</div>
          </div>
          <div style={{ padding: 14, background: '#fffbeb', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '.7rem', color: '#d97706', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.1em' }}>Dilewati</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#d97706' }}>{progress.skipped}</div>
          </div>
          <div style={{ padding: 14, background: progress.failed > 0 ? '#fef2f2' : '#f1f5f9', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '.7rem', color: progress.failed > 0 ? '#dc2626' : '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.1em' }}>Gagal</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: progress.failed > 0 ? '#dc2626' : '#64748b' }}>{progress.failed}</div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '.82rem', color: '#64748b' }}>
          Jangan tutup halaman ini sampai proses selesai.
        </p>
      </div>
    );
  }

  if (mode === 'result') {
    const r = result || {};
    return (
      <>
        <div className="admin-card">
          <h3 style={{ marginBottom: 20 }}>{r.ok ? '✓ Import Selesai' : '✗ Import Gagal'}</h3>

          {r.ok ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                <div style={{ padding: 16, background: '#f1f5f9', borderRadius: 12 }}>
                  <div style={{ fontSize: '.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.1em' }}>Total</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{r.total}</div>
                </div>
                <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 12 }}>
                  <div style={{ fontSize: '.7rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.1em' }}>Sukses</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>{r.success}</div>
                </div>
                <div style={{ padding: 16, background: '#fffbeb', borderRadius: 12 }}>
                  <div style={{ fontSize: '.7rem', color: '#d97706', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.1em' }}>Dilewati</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{r.skipped}</div>
                </div>
                <div style={{ padding: 16, background: r.failed > 0 ? '#fef2f2' : '#f1f5f9', borderRadius: 12 }}>
                  <div style={{ fontSize: '.7rem', color: r.failed > 0 ? '#dc2626' : '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.1em' }}>Gagal</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: r.failed > 0 ? '#dc2626' : '#64748b' }}>{r.failed}</div>
                </div>
              </div>

              <div style={{ fontSize: '.82rem', color: '#64748b', marginBottom: 20 }}>
                Batch ID: <code>{r.batch_id}</code>
              </div>

              {r.errors && r.errors.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '.92rem', marginBottom: 12 }}>Detail Error ({r.errors.length})</h4>
                  <div style={{ border: '1px solid #fecaca', borderRadius: 12, overflow: 'auto', maxHeight: 300 }}>
                    <table className="admin-table" style={{ fontSize: '.8rem' }}>
                      <thead>
                        <tr style={{ background: '#fef2f2' }}>
                          <th>Baris</th><th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.errors.map((e: any, i: number) => (
                          <tr key={i}>
                            <td style={{ color: '#dc2626' }}>{e.row}</td>
                            <td style={{ color: '#dc2626' }}>{e.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: 16, background: '#fef2f2', borderRadius: 12, color: '#991b1b' }}>
              {r.error || 'Terjadi kesalahan'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={reset} className="btn btn-ghost">Import Lagi</button>
          {importType === 'invoices' && (
            <button onClick={() => router.push('/admin/kwitansi')} className="btn btn-primary">Lihat Kwitansi</button>
          )}
          {importType === 'customers' && (
            <button onClick={() => router.push('/admin/pelanggan-customers')} className="btn btn-primary">Lihat Pelanggan</button>
          )}
        </div>
      </>
    );
  }

  return null;
}