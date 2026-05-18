'use client';

import {
  LEADID_CAMPAIGN_KEY,
  LEADID_CANONICAL_FIELD_ID,
  LEADID_FIELD_NAME,
  LEADID_FORM_FIELD_ID,
  LEADID_SCRIPT_ID,
  LEADID_SCRIPT_SRC,
  isValidLeadiDToken,
  normalizeLeadiDToken,
} from '@/lib/leadid';

type LeadIdInternalEvent = {
  name: string;
  at: string;
};

type LeadIdInteractionEvent = {
  type: string;
  at: string;
};

type LeadIdDebugState = {
  campaignKey: string;
  script: {
    id: string;
    src: string;
    present: boolean;
    state: 'pending' | 'loaded' | 'error';
    loadedAt?: string;
    errorAt?: string;
  };
  session: {
    pageLoadedAt: string;
    referrer: string;
    landingUrl: string;
    pathname: string;
    search: string;
    visibilityState: string;
    routeHistory: string[];
    lastRouteAt: string;
  };
  token: {
    current: string;
    isValid: boolean;
    firstSeenAt?: string;
    lastUpdatedAt?: string;
    updateCount: number;
    history: Array<{ token: string; at: string; source: string }>;
  };
  jornaya: {
    windowPresent: boolean;
    version?: string;
    lac?: string;
    lck?: string;
    hasValidToken: boolean;
    reInitCount: number;
    lastEvent?: string;
    lastEventAt?: string;
    internalEvents: LeadIdInternalEvent[];
  };
  interactions: {
    counts: Record<string, number>;
    lastInteractionAt?: string;
    recent: LeadIdInteractionEvent[];
  };
  submission: {
    lastSubmittedAt?: string;
    lastSubmissionToken?: string;
  };
};

type LeadIdApi = {
  version?: string;
  token?: string;
  getLac?: () => string;
  getLck?: () => string;
  hasValidToken?: () => boolean;
  reInit?: () => void;
  util?: {
    events?: {
      fireCustomEvent?: (eventName: string, ...args: unknown[]) => unknown;
    };
  };
};

type LeadIdWindow = Window &
  typeof globalThis & {
    LeadiD?: LeadIdApi;
    __leadIdDebug?: LeadIdDebugState;
    __leadIdDebugEventsPatched?: boolean;
  };

declare global {
  interface Window {
    LeadiD?: LeadIdApi;
    __leadIdDebug?: LeadIdDebugState;
    __leadIdDebugEventsPatched?: boolean;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function pushLimited<T>(list: T[], value: T, limit = 25) {
  list.push(value);
  if (list.length > limit) {
    list.splice(0, list.length - limit);
  }
}

export function getLeadIdDebugState() {
  const leadIdWindow = window as LeadIdWindow;
  if (!leadIdWindow.__leadIdDebug) {
    leadIdWindow.__leadIdDebug = {
      campaignKey: LEADID_CAMPAIGN_KEY.toUpperCase(),
      script: {
        id: LEADID_SCRIPT_ID,
        src: LEADID_SCRIPT_SRC,
        present: false,
        state: 'pending',
      },
      session: {
        pageLoadedAt: nowIso(),
        referrer: document.referrer,
        landingUrl: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        visibilityState: document.visibilityState,
        routeHistory: [`${window.location.pathname}${window.location.search}`],
        lastRouteAt: nowIso(),
      },
      token: {
        current: '',
        isValid: false,
        updateCount: 0,
        history: [],
      },
      jornaya: {
        windowPresent: false,
        hasValidToken: false,
        reInitCount: 0,
        internalEvents: [],
      },
      interactions: {
        counts: {},
        recent: [],
      },
      submission: {},
    };
  }

  return leadIdWindow.__leadIdDebug;
}

export function isLeadIdVerboseLoggingEnabled() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('leadid_debug') === '1') {
    return true;
  }

  try {
    return window.localStorage.getItem('leadid_debug') === '1';
  } catch {
    return false;
  }
}

export function leadIdLog(message: string, details?: unknown) {
  if (!isLeadIdVerboseLoggingEnabled()) {
    return;
  }

  if (details === undefined) {
    console.log(`[LeadID] ${message}`);
    return;
  }

  console.log(`[LeadID] ${message}`, details);
}

export function getCanonicalLeadIdInput() {
  return document.getElementById(LEADID_CANONICAL_FIELD_ID) as HTMLInputElement | null;
}

export function getLeadIdMirrorInputs() {
  const selector = [
    `input#${LEADID_FORM_FIELD_ID}`,
    'input[data-leadid-mirror="true"]',
  ].join(', ');
  return Array.from(document.querySelectorAll<HTMLInputElement>(selector));
}

export function syncLeadIdMirrorInputs(token: string) {
  const normalizedToken = normalizeLeadiDToken(token);
  for (const input of getLeadIdMirrorInputs()) {
    if (input.value !== normalizedToken) {
      input.value = normalizedToken;
      input.setAttribute('value', normalizedToken);
    }
  }
}

export function readCurrentLeadIdToken() {
  const canonicalInput = getCanonicalLeadIdInput();
  return normalizeLeadiDToken(canonicalInput?.value);
}

export function updateLeadIdTokenState(token: string, source: string) {
  const state = getLeadIdDebugState();
  const normalizedToken = normalizeLeadiDToken(token);
  const isValid = isValidLeadiDToken(normalizedToken);
  const changed = normalizedToken !== state.token.current;

  state.token.current = normalizedToken;
  state.token.isValid = isValid;
  state.jornaya.hasValidToken = isValid;

  if (!normalizedToken) {
    syncLeadIdMirrorInputs('');
    return;
  }

  syncLeadIdMirrorInputs(normalizedToken);

  if (changed) {
    const at = nowIso();
    if (!state.token.firstSeenAt) {
      state.token.firstSeenAt = at;
    }
    state.token.lastUpdatedAt = at;
    state.token.updateCount += 1;
    pushLimited(state.token.history, { token: normalizedToken, at, source });
    leadIdLog(changed && state.token.updateCount === 1 ? 'token created' : 'token updated', {
      token: normalizedToken,
      source,
      valid: isValid,
    });
  }
}

export function updateLeadIdScriptState(partial: Partial<LeadIdDebugState['script']>) {
  Object.assign(getLeadIdDebugState().script, partial);
}

export function updateLeadIdJornayaState() {
  const state = getLeadIdDebugState();
  const leadIdWindow = window as LeadIdWindow;
  const leadiD = leadIdWindow.LeadiD;

  state.jornaya.windowPresent = Boolean(leadiD);
  state.jornaya.version = leadiD?.version;
  state.jornaya.lac = leadiD?.getLac?.();
  state.jornaya.lck = leadiD?.getLck?.();
  state.jornaya.hasValidToken = Boolean(leadiD?.hasValidToken?.() || state.token.isValid);
}

export function recordLeadIdInteraction(type: string) {
  const state = getLeadIdDebugState();
  const at = nowIso();
  state.interactions.counts[type] = (state.interactions.counts[type] ?? 0) + 1;
  state.interactions.lastInteractionAt = at;
  pushLimited(state.interactions.recent, { type, at });

  if (type === 'click' || type === 'keydown' || type === 'scroll' || type === 'mousemove') {
    leadIdLog('session activity detected', {
      type,
      count: state.interactions.counts[type],
    });
  }
}

export function recordLeadIdInternalEvent(name: string) {
  const state = getLeadIdDebugState();
  const at = nowIso();
  state.jornaya.lastEvent = name;
  state.jornaya.lastEventAt = at;
  pushLimited(state.jornaya.internalEvents, { name, at });
  leadIdLog(`campaign event: ${name}`);
}

export function updateLeadIdRoute(pathname: string, search: string) {
  const state = getLeadIdDebugState();
  const route = `${pathname}${search}`;
  state.session.pathname = pathname;
  state.session.search = search;
  state.session.visibilityState = document.visibilityState;
  state.session.lastRouteAt = nowIso();
  if (state.session.routeHistory[state.session.routeHistory.length - 1] !== route) {
    pushLimited(state.session.routeHistory, route);
  }
}

export function markLeadIdSubmission(token: string) {
  const state = getLeadIdDebugState();
  state.submission.lastSubmittedAt = nowIso();
  state.submission.lastSubmissionToken = normalizeLeadiDToken(token);
}

export function getLeadIdPlaybackSignals() {
  const state = getLeadIdDebugState();
  const dwellMs = Math.max(0, Date.now() - new Date(state.session.pageLoadedAt).getTime());
  const interactionCounts = state.interactions.counts;
  const interactionTotal = Object.values(interactionCounts).reduce((sum, count) => sum + count, 0);
  const hasJourneyContext = Boolean(state.session.referrer || window.location.search);

  return {
    tokenValid: state.token.isValid,
    scriptLoaded: state.script.state === 'loaded',
    jornayaPresent: state.jornaya.windowPresent,
    routeObserved: state.session.routeHistory.length > 0,
    interactionTotal,
    hasPointerOrKeyboardActivity:
      (interactionCounts.click ?? 0) > 0 ||
      (interactionCounts.keydown ?? 0) > 0 ||
      (interactionCounts.mousemove ?? 0) > 0,
    hasScrollActivity: (interactionCounts.scroll ?? 0) > 0,
    hasFocusActivity: (interactionCounts.focusin ?? 0) > 0 || (interactionCounts.focusout ?? 0) > 0,
    dwellMs,
    hasJourneyContext,
    visibilityState: state.session.visibilityState,
  };
}

export function buildLeadIdSubmissionSnapshot() {
  const state = getLeadIdDebugState();
  const params = new URLSearchParams(window.location.search);

  return {
    token: {
      current: state.token.current,
      isValid: state.token.isValid,
      firstSeenAt: state.token.firstSeenAt,
      lastUpdatedAt: state.token.lastUpdatedAt,
      updateCount: state.token.updateCount,
    },
    script: state.script,
    jornaya: {
      windowPresent: state.jornaya.windowPresent,
      version: state.jornaya.version,
      lac: state.jornaya.lac,
      lck: state.jornaya.lck,
      hasValidToken: state.jornaya.hasValidToken,
      reInitCount: state.jornaya.reInitCount,
      lastEvent: state.jornaya.lastEvent,
      lastEventAt: state.jornaya.lastEventAt,
    },
    session: {
      pageLoadedAt: state.session.pageLoadedAt,
      referrer: state.session.referrer,
      landingUrl: state.session.landingUrl,
      pathname: state.session.pathname,
      search: state.session.search,
      visibilityState: document.visibilityState,
      dwellMs: Math.max(0, Date.now() - new Date(state.session.pageLoadedAt).getTime()),
      routeHistory: state.session.routeHistory,
      utm: {
        source: params.get('utm_source') ?? '',
        medium: params.get('utm_medium') ?? '',
        campaign: params.get('utm_campaign') ?? '',
        term: params.get('utm_term') ?? '',
        content: params.get('utm_content') ?? '',
      },
    },
    interactions: {
      counts: state.interactions.counts,
      lastInteractionAt: state.interactions.lastInteractionAt,
      recent: state.interactions.recent,
    },
    playbackSignals: getLeadIdPlaybackSignals(),
  };
}

export async function waitForValidLeadIdToken(timeoutMs = 6_000, intervalMs = 250) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const token = readCurrentLeadIdToken();
    if (isValidLeadiDToken(token)) {
      return token;
    }
    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
  }
  return null;
}

export function patchLeadIdInternalEvents() {
  const leadIdWindow = window as LeadIdWindow;
  if (leadIdWindow.__leadIdDebugEventsPatched) {
    return true;
  }

  const fireCustomEvent = leadIdWindow.LeadiD?.util?.events?.fireCustomEvent;
  if (typeof fireCustomEvent !== 'function') {
    return false;
  }

  leadIdWindow.LeadiD!.util!.events!.fireCustomEvent = function patchedLeadIdFireCustomEvent(
    eventName: string,
    ...args: unknown[]
  ) {
    recordLeadIdInternalEvent(eventName);
    window.dispatchEvent(new CustomEvent('leadid:internal-event', { detail: { eventName, args } }));
    return fireCustomEvent.call(this, eventName, ...args);
  };

  leadIdWindow.__leadIdDebugEventsPatched = true;
  leadIdLog('campaign initialized', {
    version: leadIdWindow.LeadiD?.version,
    lac: leadIdWindow.LeadiD?.getLac?.(),
    lck: leadIdWindow.LeadiD?.getLck?.(),
  });
  return true;
}

export function reInitLeadId(reason: string) {
  const leadIdWindow = window as LeadIdWindow;
  if (typeof leadIdWindow.LeadiD?.reInit !== "function") {
    return false;
  }

  leadIdWindow.LeadiD.reInit();
  const state = getLeadIdDebugState();
  state.jornaya.reInitCount += 1;
  recordLeadIdInternalEvent(`manual-reInit:${reason}`);
  leadIdLog('campaign reinitialized', { reason, reInitCount: state.jornaya.reInitCount });
  return true;
}

export function ensureLeadIdMirrorField() {
  const form = document.querySelector('section#contact form');
  if (!form || form.querySelector(`#${LEADID_FORM_FIELD_ID}`)) {
    return;
  }

  const input = document.createElement('input');
  input.type = 'hidden';
  input.id = LEADID_FORM_FIELD_ID;
  input.name = LEADID_FIELD_NAME;
  input.setAttribute('data-leadid-mirror', 'true');
  input.value = readCurrentLeadIdToken();
  form.prepend(input);
}
