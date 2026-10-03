'use client';

import { useEffect, useRef, useState } from 'react';
import type { Customer } from '@/lib/types';

interface Props {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
  onManualFill?: (data: { name: string; email: string; phone: string; address: string }) => void;
}

export default function CustomerPicker({ value, onChange, onManualFill }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Load all customers saat pertama buka
  useEffect(() => {
    if (!open || query) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/customers');
        const data = await res.json();
        setResults(data.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, query]);

  // Search dengan debounce
  useEffect(() => {
    if (!query.trim()) return;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.data || []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  if (value) {
    return (
      <div style={{
        padding: 16,
        background: '#f0f9ff',
        border: '1.5px solid #bae6fd',
        borderRadius: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase',
              color: '#0284c7', fontWeight: 700, marginBottom: 4,
            }}>
              Pelanggan Terpilih
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>
              {value.name}
            </div>
            {value.customer_code && (
              <div style={{ fontSize: '.78rem', color: '#0284c7', fontFamily: 'monospace', fontWeight: 600, marginBottom: 6 }}>
                {value.customer_code}
              </div>
            )}
            {value.email && <div style={{ fontSize: '.82rem', color: '#334155' }}>📧 {value.email}</div>}
            {value.phone && <div style={{ fontSize: '.82rem', color: '#334155' }}>📱 {value.phone}</div>}
            {value.address && <div style={{ fontSize: '.82rem', color: '#334155', marginTop: 2 }}>📍 {value.address}</div>}
            {value.customer_ids && value.customer_ids.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {value.customer_ids.map((id: any) => (
                  <span key={id.id} style={{
                    fontSize: '.7rem', padding: '3px 10px', borderRadius: 99,
                    background: '#fff', border: '1px solid #bae6fd',
                    color: '#075985', fontWeight: 600, fontFamily: 'monospace',
                  }}>
                    {id.id_label}: {id.id_number}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setQuery(''); setShowManual(false); }}
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: '.78rem', flexShrink: 0 }}
          >
            Ganti
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => { setShowManual(false); setOpen(true); }}
          style={{
            flex: 1, padding: '11px 14px', borderRadius: 10,
            border: showManual ? '1px solid #e2e8f0' : '2px solid #2563eb',
            background: showManual ? '#fff' : '#eff6ff',
            color: showManual ? '#64748b' : '#2563eb',
            fontWeight: 700, fontSize: '.85rem', cursor: 'pointer',
          }}
        >
          👥 Pilih dari Database
        </button>
        <button
          type="button"
          onClick={() => {
            setShowManual(true);
            setOpen(false);
            if (onManualFill) onManualFill({ name: '', email: '', phone: '', address: '' });
          }}
          style={{
            flex: 1, padding: '11px 14px', borderRadius: 10,
            border: showManual ? '2px solid #2563eb' : '1px solid #e2e8f0',
            background: showManual ? '#eff6ff' : '#fff',
            color: showManual ? '#2563eb' : '#64748b',
            fontWeight: 700, fontSize: '.85rem', cursor: 'pointer',
          }}
        >
          ✍️ Input Manual
        </button>
      </div>

      {open && (
        <>
          <input
            type="text"
            placeholder="Cari nama, kode, atau email pelanggan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0',
              borderRadius: 10, fontSize: '.9rem', outline: 'none', marginBottom: 6,
            }}
          />

          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            marginTop: 6, background: '#fff',
            border: '1px solid #e2e8f0', borderRadius: 12,
            boxShadow: '0 12px 32px rgba(15,23,42,.12)',
            maxHeight: 340, overflowY: 'auto', zIndex: 50,
          }}>
            {loading && (
              <div style={{ padding: 16, color: '#64748b', fontSize: '.86rem' }}>Memuat…</div>
            )}

           {!loading && results.length > 0 && (
  <div>
    {results.slice(0, 30).map((c) => (
      <button
        key={c.id}
        type="button"
        onClick={() => { onChange(c); setOpen(false); setQuery(''); }}
        style={{
          width: '100%', textAlign: 'left', padding: '12px 16px',
          background: 'transparent', border: 'none',
          borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 8,
          marginBottom: 4,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 700, fontSize: '.9rem' }}>
            {c.name}
          </span>
          {c.customer_code && (
            <span style={{
              color: '#2563eb',
              fontWeight: 600,
              fontSize: '.72rem',
              fontFamily: 'monospace',
              background: '#eff6ff',
              padding: '2px 8px',
              borderRadius: 6,
            }}>
              {c.customer_code}
            </span>
          )}
        </div>

        {c.customer_ids && c.customer_ids.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {c.customer_ids.map((id: any) => (
              <span key={id.id} style={{
                fontSize: '.7rem',
                padding: '3px 9px',
                borderRadius: 99,
                background: id.id_type === 'pln' ? '#fef3c7'
                  : id.id_type === 'internet' ? '#dbeafe'
                  : id.id_type === 'pdam' ? '#d1fae5'
                  : id.id_type === 'bpjs' ? '#fce7f3'
                  : id.id_type === 'telkom' ? '#e0e7ff'
                  : id.id_type === 'gas' ? '#fed7aa'
                  : '#f1f5f9',
                color: id.id_type === 'pln' ? '#92400e'
                  : id.id_type === 'internet' ? '#1e40af'
                  : id.id_type === 'pdam' ? '#065f46'
                  : id.id_type === 'bpjs' ? '#9d174d'
                  : id.id_type === 'telkom' ? '#3730a3'
                  : id.id_type === 'gas' ? '#9a3412'
                  : '#475569',
                fontWeight: 600,
                fontFamily: 'SF Mono, Consolas, monospace',
              }}>
                {id.id_type === 'pln' ? '⚡'
                  : id.id_type === 'internet' ? '🌐'
                  : id.id_type === 'pdam' ? '💧'
                  : id.id_type === 'bpjs' ? '🏥'
                  : id.id_type === 'telkom' ? '📞'
                  : id.id_type === 'gas' ? '🔥'
                  : '📋'}{' '}
                {id.id_label || 'ID'}: {id.id_number}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>
            Belum ada ID pelanggan terdaftar
          </div>
        )}

        {(c.email || c.phone) && (
          <div style={{ fontSize: '.75rem', color: '#64748b', marginTop: 6 }}>
            {[c.email, c.phone].filter(Boolean).join(' · ')}
          </div>
        )}
      </button>
    ))}
  </div>
)}
            {!loading && results.length === 0 && (
              <div style={{ padding: 16, color: '#64748b', fontSize: '.86rem', textAlign: 'center' }}>
                {query ? 'Pelanggan tidak ditemukan' : 'Belum ada pelanggan di database'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}