'use client';

import { useEffect, useMemo, useState } from 'react';

type Submission = {
  id: string;
  createdAt: string;
  formType: string;
  fullName: string;
  email: string;
  company?: string;
  serviceInterest?: string;
  consent_checked: boolean;
  status: 'new' | 'seen' | 'archived';
  message?: string;
  page_url: string;
  consent_timestamp: string;
  leadiD_token?: string;
  lead_id?: string;
  journey_identifier?: string;
};

export default function AdminDashboardClient() {
  const [items, setItems] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [formType, setFormType] = useState('all');
  const [status, setStatus] = useState('all');
  const [consentChecked, setConsentChecked] = useState('all');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const params = new URLSearchParams({ page: String(page), query, formType, status });
    if (consentChecked !== 'all') params.set('consent_checked', consentChecked);
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const res = await fetch(`/api/admin/submissions?${params.toString()}`);
    if (res.status === 401) {
      window.location.href = '/admin';
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Could not load submissions.');
      return;
    }

    const data = await res.json();
    setItems(data.data || []);
    setTotal(data.total || 0);
    setLastUpdated(new Date().toLocaleTimeString());
    setError('');
  };

  useEffect(() => {
    load();
  }, [page, formType, status, consentChecked, from, to]);

  useEffect(() => {
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [page, formType, status, consentChecked, from, to]);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setAdminEmail(d.email || ''))
      .catch(() => {
        window.location.href = '/admin';
      });
  }, []);

  const pages = Math.max(1, Math.ceil(total / 20));

  const exportCsv = () => {
    const header = ['Date', 'Form Type', 'Name', 'Email', 'Company', 'Service', 'Consent', 'Status', 'LeadiD Token'];
    const rows = items.map((s) => [
      s.createdAt,
      s.formType,
      s.fullName,
      s.email,
      s.company ?? '',
      s.serviceInterest ?? '',
      String(s.consent_checked),
      s.status,
      s.leadiD_token ?? '',
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'submissions.csv';
    a.click();
  };

  const updateStatus = async (id: string, next: Submission['status']) => {
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to update status.');
      return;
    }
    load();
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
  };

  const formOptions = useMemo(() => ['all', ...new Set(items.map((i) => i.formType))], [items]);
  const formatToken = (token?: string) => token || '-';

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Admin Dashboard <span className="text-sm text-green-400">Live</span></h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{adminEmail || 'admin'} | Last updated: {lastUpdated || '-'}</span>
          <button className="rounded border border-slate-700 px-3 py-1" onClick={logout}>Logout</button>
        </div>
      </div>

      {error && <div className="mb-4 rounded border border-red-700 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</div>}

      <div className="mb-4 grid gap-2 md:grid-cols-7">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name/email/company" className="rounded border border-slate-700 bg-slate-900 p-2" />
        <select value={formType} onChange={(e) => setFormType(e.target.value)} className="rounded border border-slate-700 bg-slate-900 p-2">{formOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border border-slate-700 bg-slate-900 p-2"><option value="all">all</option><option value="new">new</option><option value="seen">seen</option><option value="archived">archived</option></select>
        <select value={consentChecked} onChange={(e) => setConsentChecked(e.target.value)} className="rounded border border-slate-700 bg-slate-900 p-2"><option value="all">consent: all</option><option value="true">true</option><option value="false">false</option></select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded border border-slate-700 bg-slate-900 p-2" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded border border-slate-700 bg-slate-900 p-2" />
        <button onClick={() => { setPage(1); load(); }} className="rounded bg-orange-500 px-3">Apply</button>
      </div>

      <div className="mb-4"><button onClick={exportCsv} className="rounded border border-slate-700 px-3 py-1">Export CSV</button></div>

      <div className="overflow-x-auto rounded border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900"><tr><th className="p-2 text-left">Date/Time</th><th className="p-2 text-left">Form Type</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Service</th><th className="p-2 text-left">LeadiD Token</th><th className="p-2 text-left">Consent</th><th className="p-2 text-left">Status</th></tr></thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="cursor-pointer border-t border-slate-800 hover:bg-slate-900/70" onClick={() => setSelected(s)}>
                <td className="p-2">{new Date(s.createdAt).toLocaleString()}</td>
                <td className="p-2">{s.formType}</td><td className="p-2">{s.fullName}</td><td className="p-2">{s.email}</td><td className="p-2">{s.serviceInterest || '-'}</td><td className="max-w-56 p-2 font-mono text-xs text-slate-300">{formatToken(s.leadiD_token)}</td><td className="p-2">{s.consent_checked ? 'Yes' : 'No'}</td><td className="p-2">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border border-slate-700 px-3 py-1 disabled:opacity-50">Prev</button>
        <span>Page {page}/{pages}</span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded border border-slate-700 px-3 py-1 disabled:opacity-50">Next</button>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="ml-auto h-full w-full max-w-xl overflow-auto rounded bg-slate-900 p-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold">Submission Detail</h2>
            <div className="mt-4 grid gap-3 rounded border border-slate-800 bg-slate-950/60 p-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Name</div>
                <div>{selected.fullName || '-'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Email</div>
                <div>{selected.email || '-'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">LeadiD Token</div>
                <div className="break-all font-mono text-xs text-slate-200">{formatToken(selected.leadiD_token)}</div>
              </div>
            </div>
            <pre className="mt-4 whitespace-pre-wrap text-xs">{JSON.stringify(selected, null, 2)}</pre>
            <div className="mt-4 flex gap-2">
              <button onClick={() => updateStatus(selected.id, 'seen')} className="rounded bg-blue-600 px-3 py-1">Mark Seen</button>
              <button onClick={() => updateStatus(selected.id, 'archived')} className="rounded bg-yellow-600 px-3 py-1">Archive</button>
              <button onClick={async () => { if (confirm('Delete this submission?')) { await fetch(`/api/admin/submissions/${selected.id}`, { method: 'DELETE' }); setSelected(null); load(); } }} className="rounded bg-red-600 px-3 py-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
