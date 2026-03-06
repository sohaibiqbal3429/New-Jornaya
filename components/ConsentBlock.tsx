'use client';

import { useState } from 'react';
import { Info, X } from 'lucide-react';

type TpmoDisclaimerProps = {
  text: string;
  longText?: string;
};

type ConsentCheckboxProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  error?: string;
};

export function TpmoDisclaimer({ text, longText }: TpmoDisclaimerProps) {
  const [open, setOpen] = useState(false);
  const fullText = longText || text;

  return (
    <>
      <div className="tpmo-card rounded-xl border border-slate-700 bg-slate-900/60 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
          <div className="space-y-2">
            <p className="tpmo-text tpmo-preview text-sm leading-relaxed text-gray-300">{fullText}</p>
            {longText ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="tpmo-link rounded text-sm font-medium text-orange-400 transition hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                Learn more
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-2 sm:p-4">
          <div className="tpmo-modal flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="mb-2 flex items-center justify-between border-b border-slate-700 px-4 pb-3 pt-4 sm:px-6">
              <h3 className="tpmo-modal-title text-lg font-semibold text-white">TPMO Disclaimer</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="tpmo-modal-close inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 text-gray-300 transition hover:bg-slate-800"
                aria-label="Close disclaimer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="tpmo-modal-scroll max-h-[65dvh] overflow-y-auto px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
              <p className="tpmo-modal-text text-sm leading-relaxed text-gray-300">{fullText}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ConsentCheckbox({
  id,
  checked,
  onChange,
  label,
  error,
}: ConsentCheckboxProps) {
  const hasError = Boolean(error);

  return (
    <div className={`consent-card rounded-xl border p-3 ${hasError ? 'border-red-500 bg-red-950/20' : 'border-slate-700 bg-slate-900/40'}`}>
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-required="true"
          aria-invalid={hasError}
          className="consent-checkbox mt-1 h-5 w-5 rounded border-slate-500 bg-slate-950 text-orange-500 focus:ring-2 focus:ring-orange-500"
        />
        <span className="consent-label text-sm leading-relaxed text-gray-300">{label}</span>
      </label>
      {hasError ? (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
