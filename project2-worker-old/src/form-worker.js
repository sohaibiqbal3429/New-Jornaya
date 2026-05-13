import { chromium } from 'playwright';
import { config } from './config.js';
import { extractZipCode } from './zip-code.js';
import { resolvePlaywrightProxyForRecord } from './zip-proxy.js';
import { logEvent } from './logger.js';
import { debugLog } from './debug-console.js';

async function fillFirstAvailable(page, selectors, value, label) {
  if (!value) return false;
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) > 0 && (await locator.isVisible().catch(() => false))) {
      await locator.fill(String(value));
      debugLog('FORM:FILL', label, 'OK selector=', selector);
      return true;
    }
  }
  debugLog('FORM:FILL', label, 'SKIP (empty value or no visible field)');
  return false;
}

function splitName(fullName) {
  const clean = String(fullName || '').trim().replace(/\s+/g, ' ');
  if (!clean) return { firstName: '', lastName: '' };
  const parts = clean.split(' ');
  if (parts.length === 1) return { firstName: parts[0], lastName: 'N/A' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

/** Append #contact (or TARGET_FORM_HASH) when URL has no fragment so the lead form is in view after hydration. */
function buildTargetFormUrl() {
  const base = config.targetFormUrl.trim();
  const frag = (config.targetFormHash || '').replace(/^#/, '').trim();
  if (!frag) return base;
  try {
    const u = new URL(base);
    if (u.hash && u.hash !== '#') return base;
    u.hash = frag;
    return u.href;
  } catch {
    if (base.includes('#')) return base;
    const noTrail = base.replace(/\/$/, '');
    return `${noTrail}#${frag}`;
  }
}

function formReadyTimeoutMs(hasProxy) {
  const base = config.formWaitMs;
  return hasProxy ? Math.max(base, 90000) : base;
}

async function collectPageDebug(page) {
  const url = page.url();
  const title = await page.title().catch(() => '');
  const bodyStart = (await page.locator('body').innerText().catch(() => '')).slice(0, 500).replace(/\s+/g, ' ');
  return { url, title, bodyStart };
}

async function scrollContactIntoView(page) {
  await page
    .evaluate(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'instant', block: 'center' });
    })
    .catch(() => {});
}

/**
 * Next.js client page: Playwright "visible" often flakes before hydration or below the fold.
 * Prefer browser-side checks (computed style + layout) with the full form budget, then locator fallback.
 */
async function waitForLeadFormInteractive(page, hasProxy) {
  const timeout = formReadyTimeoutMs(hasProxy);
  debugLog('FORM:WAIT', 'Waiting for lead form (CSR-tolerant), timeoutMs=', timeout, 'hasProxy=', hasProxy);

  await scrollContactIntoView(page);
  await page.waitForTimeout(hasProxy ? 600 : 250);

  try {
    await page.waitForFunction(
      () => {
        const n = document.querySelector('input#firstName') || document.querySelector('input[name="firstName"]');
        if (!n || !(n instanceof HTMLElement)) return false;
        const st = window.getComputedStyle(n);
        if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) === 0) return false;
        const r = n.getBoundingClientRect();
        return r.width >= 8 && r.height >= 8;
      },
      { timeout },
    );
    debugLog('FORM:WAIT', 'Lead form ready (waitForFunction: hydrated firstName in layout)');
    await scrollContactIntoView(page);
    return;
  } catch (e) {
    debugLog('FORM:WAIT', 'Primary waitForFunction failed:', (e instanceof Error && e.message) || String(e));
  }

  const perTry = Math.min(60000, Math.max(30000, Math.floor(timeout / 2)));
  const anchors = [
    'input#firstName',
    '#contact input#firstName',
    'section#contact input#firstName',
    '#contact form',
    'form:has(input#firstName)',
    config.selectors.form,
    'form',
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  let lastErr = '';
  for (const sel of anchors) {
    try {
      const loc = page.locator(sel).first();
      await loc.waitFor({ state: 'attached', timeout: perTry });
      await loc.scrollIntoViewIfNeeded({ timeout: 20000 }).catch(() => {});
      await loc.waitFor({ state: 'visible', timeout: perTry });
      debugLog('FORM:WAIT', 'Lead form visible via selector:', sel);
      return;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
      debugLog('FORM:WAIT', 'Anchor failed:', sel, lastErr.slice(0, 160));
    }
  }

  throw new Error(`Lead form not ready in ${timeout}ms. Last: ${lastErr}`);
}

async function waitForLeadiDToken(page) {
  const start = Date.now();
  const timeoutMs = config.leadIdWaitMs;
  while (Date.now() - start < timeoutMs) {
    const token =
      (await page.locator('input[name="universal_leadid"]').first().inputValue().catch(() => '')) ||
      (await page.locator('#leadid_token').first().inputValue().catch(() => '')) ||
      '';
    if (token.trim()) return token.trim();
    await page.waitForTimeout(300);
  }
  return '';
}

async function findConsentControl(page) {
  debugLog('FORM:CONSENT', 'Looking for consent checkbox…');
  const fromConfig = String(config.selectors.consent || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const selectors = [
    ...fromConfig,
    'input#leadid_tcpa_disclosure',
    'input#consent',
    'input[type="checkbox"]',
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  for (const selector of selectors) {
    const locator = page.locator(selector);
    const count = await locator.count();
    for (let i = 0; i < count; i += 1) {
      const candidate = locator.nth(i);
      const isVisible = await candidate.isVisible().catch(() => false);
      if (!isVisible) continue;
      const type = await candidate.evaluate((el) => (el instanceof HTMLInputElement ? el.type : '')).catch(() => '');
      if (type === 'checkbox' || type === 'radio') {
        debugLog('FORM:CONSENT', 'Using selector=', selector, 'nth=', i);
        return candidate;
      }
    }
  }

  debugLog('FORM:CONSENT', 'No consent control found');
  return null;
}

export async function submitRecordViaPlaywright(record) {
  debugLog('FORM', '════════ submitRecordViaPlaywright START id=', record?.id, 'name=', record?.fullName);
  const proxyResolution = await resolvePlaywrightProxyForRecord(record);
  const hasProxy = Boolean(proxyResolution.proxy);
  debugLog('FORM', 'Proxy resolution source=', proxyResolution.source, 'usingProxy=', hasProxy);
  if (proxyResolution.warnings?.length) {
    debugLog('FORM', 'Proxy warnings:', proxyResolution.warnings);
  }
  const launchArgs = [
    ...config.playwrightChromiumArgs,
    ...(config.playwrightDevtools ? ['--auto-open-devtools-for-tabs'] : []),
  ];
  const launchOptions = {
    headless: config.playwrightHeadless && !config.playwrightDevtools,
    devtools: config.playwrightDevtools,
    slowMo: Number.isFinite(config.playwrightSlowMoMs) ? config.playwrightSlowMoMs : 0,
    args: launchArgs,
    ...(proxyResolution.proxy ? { proxy: proxyResolution.proxy } : {}),
  };

  debugLog('FORM', 'Launching Chromium headless=', launchOptions.headless, 'argsCount=', launchArgs.length);
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    userAgent: config.playwrightUserAgent || undefined,
    ignoreHTTPSErrors: config.playwrightIgnoreHttpErrors,
    viewport: { width: 1365, height: 900 },
  });
  const page = await context.newPage();
  debugLog('FORM', 'Browser context + new page ready');
  page.on('crash', () => {
    logEvent({ type: 'page_crash', targetUrl: config.targetFormUrl });
  });

  try {
    const navUrl = buildTargetFormUrl();
    debugLog('FORM:NAV', 'page.goto →', navUrl, 'timeout=', config.navigationTimeoutMs);
    const navResponse = await page.goto(navUrl, { waitUntil: 'load', timeout: config.navigationTimeoutMs });
    debugLog('FORM:NAV', 'HTTP status=', navResponse?.status() ?? '(n/a)', 'url=', page.url());
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: hasProxy ? 90000 : 45000 }).catch(() => {
      debugLog('FORM:NAV', 'networkidle wait stopped early (timeout or single long poll); continuing');
    });
    await scrollContactIntoView(page);
    await page.waitForTimeout(hasProxy ? 500 : 200);

    try {
      await waitForLeadFormInteractive(page, hasProxy);
    } catch (e) {
      const dbg = await collectPageDebug(page);
      debugLog('FORM:WAIT', 'FAILED', e, 'debug url=', dbg.url, 'title=', dbg.title);
      const hint =
        dbg.url.includes('localhost') || dbg.url.includes('127.0.0.1')
          ? ' If Next runs on the host and the worker runs in WSL/Docker, use http://host.docker.internal:3000 or your LAN IP instead of localhost.'
          : '';
      throw new Error(
        `${e instanceof Error ? e.message : String(e)} | url=${dbg.url} title=${JSON.stringify(dbg.title)} body=${JSON.stringify(dbg.bodyStart)}${hint}`,
      );
    }

    const submittedLeadiDToken = await waitForLeadiDToken(page);
    debugLog('FORM:LEADID', 'Token length=', (submittedLeadiDToken || '').length, submittedLeadiDToken ? '(present)' : '(empty)');
    const warnings = [...(proxyResolution.warnings || [])];
    if (proxyResolution.proxy) {
      warnings.push(`Oxylabs proxy source: ${proxyResolution.source}.`);
    } else {
      warnings.push('Browser launched without proxy (no DB line and no OXYLABS_PROXY fallback).');
    }
    if (!submittedLeadiDToken) {
      warnings.push(`LeadiD token is empty after waiting ${config.leadIdWaitMs}ms.`);
    }

    const { firstName, lastName } = splitName(record.fullName);
    const zipCode = extractZipCode(record);
    debugLog('FORM', 'Parsed zip for submit=', zipCode, 'firstName=', firstName, 'lastName=', lastName);
    if (!zipCode) {
      throw new Error('Missing zip code. Add DEFAULT_ZIP_CODE in .env or include zip in source data.');
    }
    const submittedData = {
      firstName,
      lastName,
      phone: record.phone || '',
      zipCode,
      email: record.email || '',
      consentChecked: true,
    };

    const firstNameFilled = await fillFirstAvailable(
      page,
      [
        config.selectors.firstName,
        'input[name="firstName"]',
        'input[id="firstName"]',
        'input[autocomplete="given-name"]',
        'input[name*="first"]',
        'input[type="text"]',
      ],
      firstName,
      'firstName',
    );
    if (!firstNameFilled) {
      throw new Error('Could not find a field for first name.');
    }

    const lastNameFilled = await fillFirstAvailable(
      page,
      [
        config.selectors.lastName,
        'input[name="lastName"]',
        'input[id="lastName"]',
        'input[autocomplete="family-name"]',
        'input[name*="last"]',
      ],
      lastName,
      'lastName',
    );
    if (!lastNameFilled) {
      throw new Error('Could not find a field for last name.');
    }

    await fillFirstAvailable(
      page,
      [config.selectors.email, 'input[name="email"]', 'input[type="email"]', 'input[id*="email"]'],
      record.email || '',
      'email',
    );
    await fillFirstAvailable(
      page,
      [config.selectors.phone, 'input[name="phone"]', 'input[type="tel"]', 'input[id*="phone"]'],
      record.phone || '',
      'phone',
    );

    const zipFilled = await fillFirstAvailable(
      page,
      [config.selectors.zipCode, 'input[name="zipCode"]', 'input[id="zipCode"]', 'input[autocomplete="postal-code"]'],
      zipCode,
      'zipCode',
    );
    if (!zipFilled) {
      throw new Error('Could not find a field for zip code.');
    }

    const consent = await findConsentControl(page);
    if (consent && !(await consent.isChecked().catch(() => false))) {
      debugLog('FORM:CONSENT', 'Checking consent…');
      await consent.check();
      debugLog('FORM:CONSENT', 'Checked.');
    } else if (consent) {
      debugLog('FORM:CONSENT', 'Already checked');
    } else {
      debugLog('FORM:CONSENT', 'WARN: no consent control — submit may fail validation');
    }

    if (config.preSubmitWaitMs > 0) {
      warnings.push(`Paused ${config.preSubmitWaitMs}ms before submit for manual inspection.`);
      await page.waitForTimeout(config.preSubmitWaitMs);
    }

    const submitRequestPromise = page
      .waitForRequest(
        (request) =>
          request.method() === 'POST' &&
          (request.url().includes('submit') || request.url().includes('/api/')),
        { timeout: 15000 },
      )
      .catch(() => null);
    const submitResponsePromise = page
      .waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          (response.url().includes('submit') || response.url().includes('/api/')),
        { timeout: 15000 },
      )
      .catch(() => null);

    debugLog('FORM:SUBMIT', 'Clicking submit selector=', config.selectors.submit);
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined),
      page.click(config.selectors.submit),
    ]);
    const submitRequest = await submitRequestPromise;
    const submitResponse = await submitResponsePromise;
    debugLog(
      'FORM:SUBMIT',
      'After click: request=',
      submitRequest ? `${submitRequest.method()} ${submitRequest.url()}` : '(none)',
      'response=',
      submitResponse ? `${submitResponse.status()} ${submitResponse.url()}` : '(none)',
    );

    debugLog('FORM', '════════ submitRecordViaPlaywright END OK id=', record?.id);
    return {
      success: true,
      submittedLeadiDToken: submittedLeadiDToken || '',
      submittedData,
      warnings,
      submitNetwork: {
        request: submitRequest
          ? {
              method: submitRequest.method(),
              url: submitRequest.url(),
              postData: submitRequest.postData() || '',
            }
          : null,
        response: submitResponse
          ? {
              url: submitResponse.url(),
              status: submitResponse.status(),
            }
          : null,
      },
    };
  } catch (err) {
    debugLog('FORM', '════════ submitRecordViaPlaywright FAIL id=', record?.id, err);
    throw err;
  } finally {
    debugLog('FORM', 'Closing browser/context…');
    try {
      await context.close();
    } catch {
      /* user interrupt / race */
    }
    try {
      await browser.close();
    } catch {
      /* ignore */
    }
    debugLog('FORM', 'Browser closed.');
  }
}
