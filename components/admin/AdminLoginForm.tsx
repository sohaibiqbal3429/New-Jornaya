'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Invalid credentials.');
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <input className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={loading} className="w-full rounded bg-orange-500 p-2 font-semibold disabled:opacity-70">
        {loading ? 'Signing in...' : 'Login'}
      </button>
    </form>
  );
}
