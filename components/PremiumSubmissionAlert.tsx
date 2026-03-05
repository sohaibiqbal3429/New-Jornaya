'use client';

import { useEffect } from 'react';
import { CheckCircle2, Sparkles, X, XCircle } from 'lucide-react';

type PremiumSubmissionAlertProps = {
  open: boolean;
  title: string;
  message: string;
  variant?: 'success' | 'error';
  onClose: () => void;
};

export function PremiumSubmissionAlert({
  open,
  title,
  message,
  variant = 'success',
  onClose,
}: PremiumSubmissionAlertProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const isSuccess = variant === 'success';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 text-white shadow-2xl shadow-black/60">
        <div
          className={`absolute inset-x-0 top-0 h-1 ${
            isSuccess ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400' : 'bg-gradient-to-r from-rose-400 via-orange-400 to-rose-400'
          }`}
        />
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-14 -left-14 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                isSuccess ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40' : 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/40'
              }`}
            >
              {isSuccess ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              Chatters Health Solutions
            </div>
          </div>

          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{message}</p>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
