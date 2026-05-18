'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ensureLeadIdMirrorField,
  getCanonicalLeadIdInput,
  getLeadIdDebugState,
  leadIdLog,
  patchLeadIdInternalEvents,
  readCurrentLeadIdToken,
  recordLeadIdInteraction,
  reInitLeadId,
  syncLeadIdMirrorInputs,
  updateLeadIdJornayaState,
  updateLeadIdRoute,
  updateLeadIdScriptState,
  updateLeadIdTokenState,
} from '@/lib/leadid-browser';
import { LEADID_SCRIPT_ID } from '@/lib/leadid';

function throttle(fn: () => void, waitMs: number) {
  let lastRun = 0;
  return () => {
    const now = Date.now();
    if (now - lastRun < waitMs) {
      return;
    }
    lastRun = now;
    fn();
  };
}

export function LeadIdRuntime() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const hasSeenRouteRef = useRef(false);
  const search = searchParams.toString();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    getLeadIdDebugState();
    ensureLeadIdMirrorField();
    updateLeadIdTokenState(readCurrentLeadIdToken(), 'runtime:init');
    updateLeadIdJornayaState();

    const script = document.getElementById(LEADID_SCRIPT_ID) as HTMLScriptElement | null;
    updateLeadIdScriptState({
      present: Boolean(script),
      state: window.LeadiD ? 'loaded' : 'pending',
      loadedAt: window.LeadiD ? new Date().toISOString() : undefined,
    });

    if (script) {
      const handleLoad = () => {
        updateLeadIdScriptState({
          present: true,
          state: 'loaded',
          loadedAt: new Date().toISOString(),
        });
        updateLeadIdJornayaState();
        patchLeadIdInternalEvents();
        leadIdLog('script loaded', { src: script.src });
      };

      const handleError = () => {
        updateLeadIdScriptState({
          present: true,
          state: 'error',
          errorAt: new Date().toISOString(),
        });
        leadIdLog('script failed to load', { src: script.src });
      };

      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);

      const cleanup = () => {
        script.removeEventListener('load', handleLoad);
        script.removeEventListener('error', handleError);
      };

      window.addEventListener('pagehide', cleanup, { once: true });
    }

    const tokenPoll = window.setInterval(() => {
      ensureLeadIdMirrorField();
      const token = readCurrentLeadIdToken();
      updateLeadIdTokenState(token, 'runtime:poll');
      updateLeadIdJornayaState();
      patchLeadIdInternalEvents();
    }, 500);

    const initialReInitTimeout = window.setTimeout(() => {
      if (!readCurrentLeadIdToken() && window.LeadiD?.reInit) {
        reInitLeadId('missing-token-after-initial-load');
      }
    }, 8_000);

    const handleVisibility = () => {
      getLeadIdDebugState().session.visibilityState = document.visibilityState;
      recordLeadIdInteraction('visibilitychange');
    };

    const interactionListeners: Array<[keyof WindowEventMap, EventListener, AddEventListenerOptions?]> = [
      ['click', () => recordLeadIdInteraction('click'), { capture: true }],
      ['keydown', () => recordLeadIdInteraction('keydown'), { capture: true }],
      ['focusin', () => recordLeadIdInteraction('focusin'), { capture: true }],
      ['focusout', () => recordLeadIdInteraction('focusout'), { capture: true }],
      ['input', () => recordLeadIdInteraction('input'), { capture: true }],
      ['change', () => recordLeadIdInteraction('change'), { capture: true }],
      ['mousemove', throttle(() => recordLeadIdInteraction('mousemove'), 1_000), { capture: true }],
      ['scroll', throttle(() => recordLeadIdInteraction('scroll'), 800), { capture: true, passive: true }],
    ];

    document.addEventListener('visibilitychange', handleVisibility, true);
    for (const [eventName, handler, options] of interactionListeners) {
      window.addEventListener(eventName, handler, options);
    }

    return () => {
      window.clearInterval(tokenPoll);
      window.clearTimeout(initialReInitTimeout);
      document.removeEventListener('visibilitychange', handleVisibility, true);
      for (const [eventName, handler, options] of interactionListeners) {
        window.removeEventListener(eventName, handler, options);
      }
    };
  }, []);

  useEffect(() => {
    updateLeadIdRoute(pathname, search ? `?${search}` : '');
    ensureLeadIdMirrorField();
    syncLeadIdMirrorInputs(readCurrentLeadIdToken());

    if (!hasSeenRouteRef.current) {
      hasSeenRouteRef.current = true;
      return;
    }

    leadIdLog('route observed', {
      pathname,
      search,
    });

    const routeReInitTimeout = window.setTimeout(() => {
      if (!readCurrentLeadIdToken() && window.LeadiD?.reInit) {
        reInitLeadId('spa-route-without-token');
      }
    }, 2_000);

    return () => window.clearTimeout(routeReInitTimeout);
  }, [pathname, search]);

  return null;
}
