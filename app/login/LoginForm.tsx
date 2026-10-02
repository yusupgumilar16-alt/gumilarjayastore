'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Email atau password salah.');
      setLoading(false);
      return;
    }

    const redirect = searchParams.get('redirect') || '/admin';
    router.push(redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 9,
          background: '#fee2e2',
          color: '#991b1b',
          fontSize: '.86rem',
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, marginBottom: 6 }}>
        Email
      </label>
      <input
        type="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@gumilarjaya.store"
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '1px solid var(--line)',
          borderRadius: 9,
          fontSize: '.9rem',
          outline: 'none',
        }}
      />

      <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, marginTop: 14, marginBottom: 6 }}>
        Password
      </label>
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '1px solid var(--line)',
          borderRadius: 9,
          fontSize: '.9rem',
          outline: 'none',
        }}
      />

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ width: '100%', marginTop: 20, padding: '13px 20px' }}
      >
        {loading ? 'Memproses…' : 'Masuk'}
      </button>
    </form>
  );
}