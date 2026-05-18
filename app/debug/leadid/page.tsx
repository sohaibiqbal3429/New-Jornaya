'use client';

import { useEffect, useState } from 'react';
import {
  getLeadIdDebugState,
  getLeadIdPlaybackSignals,
  isLeadIdVerboseLoggingEnabled,
  reInitLeadId,
} from '@/lib/leadid-browser';

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function LeadIdDebugPage() {
  const [snapshot, setSnapshot] = useState(() => ({
    state: typeof window === 'undefined' ? null : getLeadIdDebugState(),
    playbackSignals: typeof window === 'undefined' ? null : getLeadIdPlaybackSignals(),
    verboseLogging: typeof window === 'undefined' ? false : isLeadIdVerboseLoggingEnabled(),
  }));

  useEffect(() => {
    try {
      window.localStorage.setItem('leadid_debug', '1');
    } catch {}

    const intervalId = window.setInterval(() => {
      setSnapshot({
        state: getLeadIdDebugState(),
        playbackSignals: getLeadIdPlaybackSignals(),
        verboseLogging: isLeadIdVerboseLoggingEnabled(),
      });
    }, 500);

    return () => window.clearInterval(intervalId);
  }, []);

  if (!snapshot.state || !snapshot.playbackSignals) {
    return null;
  }

  const { state, playbackSignals } = snapshot;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">LeadID Debug</h1>
            <p className="text-sm text-slate-400">
              Live diagnostics for Jornaya script state, token capture, replay signals, and interaction telemetry.
            </p>
          </div>
          <button
            type="button"
            onClick={() => reInitLeadId('debug-page-button')}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Reinitialize Jornaya
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Current Token</div>
            <div className="mt-2 break-all font-mono text-sm text-emerald-300">{state.token.current || 'missing'}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Script State</div>
            <div className="mt-2 text-lg font-semibold">{state.script.state}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Jornaya Window</div>
            <div className="mt-2 text-lg font-semibold">{state.jornaya.windowPresent ? 'present' : 'missing'}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Verbose Logs</div>
            <div className="mt-2 text-lg font-semibold">{snapshot.verboseLogging ? 'enabled' : 'disabled'}</div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-lg font-semibold">Playback Eligibility Signals</h2>
            <pre className="mt-3 overflow-auto text-xs text-slate-300">{pretty(playbackSignals)}</pre>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-lg font-semibold">Recent Internal Events</h2>
            <pre className="mt-3 overflow-auto text-xs text-slate-300">{pretty(state.jornaya.internalEvents)}</pre>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-lg font-semibold">Session State</h2>
            <pre className="mt-3 overflow-auto text-xs text-slate-300">{pretty(state.session)}</pre>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-lg font-semibold">Interaction Events</h2>
            <pre className="mt-3 overflow-auto text-xs text-slate-300">{pretty(state.interactions)}</pre>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-lg font-semibold">Token Timeline</h2>
            <pre className="mt-3 overflow-auto text-xs text-slate-300">{pretty(state.token)}</pre>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-lg font-semibold">Raw State</h2>
            <pre className="mt-3 overflow-auto text-xs text-slate-300">{pretty(state)}</pre>
          </section>
        </div>
      </div>
    </main>
  );
}
