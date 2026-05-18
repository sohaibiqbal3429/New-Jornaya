import axios from 'axios';
import { chromium } from 'playwright';
import { URL } from 'url';
import { config } from './config.js';
import { log, logBlock } from './logger.js';
import { buildProxyServerString, parseProxyForPlaywright, redactProxyConnectionString, resolveProxyHostEntries } from './proxy-util.js';
import { deleteSubmissionById, getMongoClient, markSubmissionComplete, releaseLease } from './mongo.js';
import { getZipDb, lookupProxyUrlTemplate } from './zip-db.js';

/**
 * End-to-end flow (Project 1 + SQLite + Oxylabs + Playwright):
 *
 * 1. MongoDB `submissions`: claim a row where **isVarified is not true** (pending verification — field name is the legacy typo `isVarified`).
 * 2. Read **zipCode** from that row (e.g. 35013).
 * 3. **zips_lookup.db**, table **`zips`**: row for that ZIP has an **Oxylabs template URL** (USERNAME / PASSWORD / replaceMe placeholders).
 * 4. Substitute **userName** and **password** from `.env` (and random **replaceMe** session id) → real `customer-…@pr.oxylabs.io:7777` string for Playwright.
 * 5. **DNS** on `pr.oxylabs.io` may return **one or more IPs** (load balancers) — we log them. The browser still connects by **hostname:port**; Oxylabs routes you to a ZIP-related **egress** IP.
 * 6. **Egress IP** for that session (what matches the lead / what we store in Mongo `ip`): from **ipify** through the same Playwright proxy tunnel (not from the SQLite row text).
 * 7. Re-submit the **same** lead on your site; wait for new LeadiD; **update the same Mongo row**: isVarified true, new token, egress ip.
 *
 * Selectors match `app/page.tsx` (Medicare contact form):
 * - section#contact — form section
 * - body-level: input#leadid_token[name=universal_leadid] (canonical hidden token)
 * - form: input#leadid_token_form[name=universal_leadid] (mirrored hidden token)
 * - input#firstName[name=firstName], #lastName, #phone, #zipCode, #email
 * - input#leadid_tcpa_disclosure (consent)
 * - button "Get Medicare Help" (type=submit)
 */

function splitFullName(fullName) {
  const s = String(fullName || '').trim();
  if (!s) return { firstName: '', lastName: '' };
  const i = s.indexOf(' ');
  if (i === -1) return { firstName: s, lastName: s };
  return { firstName: s.slice(0, i).trim(), lastName: s.slice(i + 1).trim() };
}

function summarizeSubmission(sub) {
  const id = sub._id?.toString?.() || String(sub._id);
  return [
    `Mongo _id:           ${id}`,
    `fullName:            ${String(sub.fullName || '')}`,
    `phone:               ${String(sub.phone || '')}`,
    `zipCode:             ${String(sub.zipCode || '')}`,
    `isVarified (Mongo):  ${String(sub.isVarified)}  ← false / missing = pending, worker re-submits`,
    `email:               ${String(sub.email || '')}`,
    `consent_text_version: ${String(sub.consent_text_version || '')}`,
    `existing leadiD_token (len): ${String(sub.leadiD_token || '').length}`,
  ];
}

/** Measure public IP seen through the browser and/or Node, for logging and Mongo. */
async function measureEgress(playwrightProxy, page) {
  /** @type {{ browserViaProxy: string | null, axiosViaProxy: string | null, browserDirect: string | null, axiosDirect: string | null }} */
  const out = {
    browserViaProxy: null,
    axiosViaProxy: null,
    browserDirect: null,
    axiosDirect: null,
  };

  const ipifyInPage = () =>
    page.evaluate(async () => {
      const r = await fetch('https://api.ipify.org?format=json');
      const j = await r.json();
      return j && typeof j.ip === 'string' ? j.ip : null;
    });

  if (playwrightProxy) {
    try {
      out.browserViaProxy = await ipifyInPage();
    } catch {
      /* ignore */
    }
    const u = new URL(playwrightProxy.server);
    const port = Number(u.port || 7777);
    try {
      const res = await axios.get('https://api.ipify.org?format=json', {
        proxy: {
          protocol: 'http',
          host: u.hostname,
          port,
          auth: {
            username: playwrightProxy.username,
            password: playwrightProxy.password,
          },
        },
        timeout: 25_000,
        validateStatus: () => true,
      });
      if (res.status === 200 && res.data?.ip) out.axiosViaProxy = String(res.data.ip);
    } catch {
      /* ignore */
    }
    return out;
  }

  try {
    out.browserDirect = await ipifyInPage();
  } catch {
    /* ignore */
  }
  try {
    const res = await axios.get('https://api.ipify.org?format=json', { timeout: 15_000 });
    if (res.data?.ip) out.axiosDirect = String(res.data.ip);
  } catch {
    /* ignore */
  }
  return out;
}

/** When Oxylabs is on Playwright: store the egress IP from that proxy (same path as the form). */
function pickMongoIp(pwProxy, egress, apiReportedIp) {
  if (pwProxy) {
    const oxylabsEgress = egress.browserViaProxy || egress.axiosViaProxy || 'unknown';
    return {
      ip: oxylabsEgress,
      reason:
        egress.browserViaProxy && egress.axiosViaProxy && egress.browserViaProxy !== egress.axiosViaProxy
          ? 'oxylabs_egress: page-ipify (primary; differs from axios-ipify — see logs)'
          : egress.browserViaProxy
            ? 'oxylabs_egress: ipify inside Playwright (same tunnel as form submit)'
            : egress.axiosViaProxy
              ? 'oxylabs_egress: ipify via Node axios through same proxy (browser ipify failed)'
              : 'oxylabs_egress: unknown (both checks failed)',
    };
  }
  const direct = egress.browserDirect || egress.axiosDirect || 'unknown';
  const ip = apiReportedIp || direct;
  return {
    ip,
    reason: apiReportedIp
      ? 'direct_browser: Project1 `submission.ip` from POST (localhost / real client IP)'
      : 'direct_browser: ipify fallback (no submission.ip on API)',
  };
}

async function logPageDiagnostics(page, workerId, originalId, label) {
  let diag = {};
  try {
    diag = await page.evaluate(() => {
      const el = document.querySelector('#firstName');
      const style = el ? window.getComputedStyle(el) : null;
      return {
        title: document.title,
        url: window.location.href,
        hasContact: !!document.querySelector('section#contact'),
        hasFormFirstName: !!document.querySelector('section#contact input#firstName'),
        hasFirstName: !!el,
        firstDisplay: style?.display,
        firstVisibility: style?.visibility,
        firstOpacity: style?.opacity,
        bodyLen: document.body?.innerText?.length ?? 0,
        h1: document.querySelector('h1')?.textContent?.trim()?.slice(0, 120) || null,
      };
    });
  } catch (e) {
    diag = { evaluateError: String(e) };
  }
  logBlock(`${label} (worker=${workerId} id=${originalId})`, [
    `page.url:            ${diag.url ?? page.url()}`,
    `document.title:      ${diag.title ?? '?'}`,
    `section#contact:     ${diag.hasContact}`,
    `form #firstName:    ${diag.hasFormFirstName}`,
    `#firstName exists:  ${diag.hasFirstName}`,
    `#firstName display: ${diag.firstDisplay ?? 'n/a'}`,
    `#firstName visibility: ${diag.firstVisibility ?? 'n/a'}`,
    `#firstName opacity: ${diag.firstOpacity ?? 'n/a'}`,
    `body text length:    ${diag.bodyLen}`,
    `h1 preview:          ${diag.h1 ?? '—'}`,
  ]);
}

/**
 * Load home, wait for client form, scroll `section#contact` (matches `app/page.tsx`).
 */
async function gotoFormAndSettle(page, workerId, originalId) {
  const origin = config.targetFormUrl.replace(/\/$/, '');
  const startUrl = `${origin}/`;
  log('navigate', `worker=${workerId} id=${originalId} GET ${startUrl} (then scroll to #contact)`);
  const nav = await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  log(
    'navigate_response',
    `worker=${workerId} id=${originalId} status=${nav?.status() ?? '?'} final_url=${page.url()}`,
  );

  await page.waitForLoadState('networkidle', { timeout: 90_000 }).catch(() => {
    log('navigate', `worker=${workerId} id=${originalId} networkidle timeout (continuing)`);
  });

  await page.waitForFunction(
    () => !!document.querySelector('section#contact input#firstName'),
    { timeout: 120_000 },
  );

  await page.locator('section#contact').scrollIntoViewIfNeeded();
  await page.locator('#firstName').scrollIntoViewIfNeeded();

  try {
    await page.waitForSelector('section#contact input#firstName', { state: 'visible', timeout: 60_000 });
  } catch (e) {
    await logPageDiagnostics(page, workerId, originalId, 'Form not visible — diagnostics');
    throw e;
  }

  const hashUrl = `${origin}/#contact`;
  if (page.url() !== hashUrl && !page.url().includes('#contact')) {
    await page.goto(hashUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {});
    await page.locator('section#contact input#firstName').waitFor({ state: 'visible', timeout: 30_000 });
  }
}

/**
 * @param {import('mongodb').WithId<Record<string, unknown>>} submission
 * @param {number} workerId
 */
export async function processSubmission(submission, workerId) {
  const originalId = submission._id.toString();
  const zip = String(submission.zipCode || '').trim();

  logBlock(`Job picked — worker ${workerId}`, summarizeSubmission(submission));

  logBlock('This job — pipeline (your spec)', [
    '① Mongo row where isVarified ≠ true (not verified yet).',
    '② zipCode from that row → look up SQLite `zips` table in zips_lookup.db.',
    '③ That row’s `url` column = Oxylabs template; inject .env userName + password (+ sess id).',
    '④ DNS on pr.oxylabs.io → often multiple IPs (logged). Playwright uses hostname; Oxylabs assigns egress.',
    '⑤ ipify through browser = egress IP we save on the lead (ZIP-aligned when proxy ON).',
    '⑥ Same person data re-submitted; Mongo updated: isVarified true, leadiD_token, ip.',
  ]);

  const zipDb = await getZipDb();
  const template = lookupProxyUrlTemplate(zipDb, zip);
  if (!template) {
    log('failed', `worker=${workerId} id=${originalId} reason=no_zip_proxy_row zip=${zip}`);
    await releaseLease(originalId);
    return;
  }

  const built = buildProxyServerString(template, {
    userName: config.oxylabsUser,
    password: config.oxylabsPass,
  });
  const builtRedacted = redactProxyConnectionString(built);

  let pwProxy = null;
  if (config.usePlaywrightProxy) {
    pwProxy = parseProxyForPlaywright(built);
    log('proxy_plan', `worker=${workerId} id=${originalId} Oxylabs → Playwright (template + ipify results logged after page load)`);
  } else {
    logBlock('Proxy (skipped for this run)', [
      `Reason:              target is localhost and SKIP_PROXY_FOR_LOCALHOST is not "false"`,
      `localhostTarget:     ${config.localhostTarget}`,
      `FORCE_PLAYWRIGHT_PROXY: ${config.forcePlaywrightProxy}`,
      `ZIP row template:    ${template}`,
      `Would have built:    ${builtRedacted}`,
      `Note:                Oxylabs cannot open YOUR machine's http://localhost from the exit node.`,
      `                      Use TARGET_FORM_URL=https://your-public-site or set FORCE_PLAYWRIGHT_PROXY=true with a tunnel.`,
    ]);
  }

  let browser;
  try {
    await getMongoClient();

    browser = await chromium.launch({
      headless: config.headless,
      args: ['--disable-blink-features=AutomationControlled'],
    });

    const contextOptions = {
      userAgent: config.userAgent,
      ignoreHTTPSErrors: true,
      viewport: { width: 1280, height: 900 },
    };
    if (pwProxy) Object.assign(contextOptions, { proxy: pwProxy });

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    await gotoFormAndSettle(page, workerId, originalId);

    const egress = await measureEgress(pwProxy, page);
    if (pwProxy) {
      const { hostname } = new URL(pwProxy.server);
      const dnsEntries = await resolveProxyHostEntries(hostname);
      logBlock('Oxylabs — proxy string + DNS + egress (read carefully)', [
        `ZIP row template:    ${template}`,
        `Built (redacted):    ${builtRedacted}`,
        `Playwright server:   ${pwProxy.server}`,
        `Playwright username: ${pwProxy.username.slice(0, 56)}… (${pwProxy.username.length} chars)`,
        '',
        `DNS ${dnsEntries.hostname} — IPv4 (${dnsEntries.ipv4.length}): ${dnsEntries.ipv4.join(', ') || '—'}`,
        `DNS ${dnsEntries.hostname} — IPv6 (${dnsEntries.ipv6.length}): ${dnsEntries.ipv6.join(', ') || '—'}`,
        `(Those are Oxylabs **gateway** addresses. Your bot connects to hostname:port; Oxylabs maps the session to a ZIP-related exit.)`,
        '',
        `Egress — ipify INSIDE Playwright (same session as form):  ${egress.browserViaProxy ?? '— failed —'}`,
        `Egress — ipify via Node axios (same proxy creds):         ${egress.axiosViaProxy ?? '— failed —'}`,
        '',
        `Mongo field ip:      first non-empty egress row above (browser wins). NOT taken from raw SQLite text.`,
      ]);
    } else {
      logBlock('No Oxylabs in Playwright — direct IP checks (localhost dev)', [
        `IP from ipify inside Playwright:  ${egress.browserDirect ?? '—'}`,
        `IP from ipify via Node (no proxy): ${egress.axiosDirect ?? '—'}`,
        `Mongo \`ip\`: Project1 POST submission.ip if present, else ipify above.`,
      ]);
    }

    const { firstName, lastName } = splitFullName(submission.fullName);
    const phone = String(submission.phone || '').trim();
    const email = String(submission.email || '').trim();

    log('field_fill', `worker=${workerId} id=${originalId} selector=section#contact input#firstName[name=firstName] value="${firstName}"`);
    await page.locator('section#contact input#firstName').fill(firstName);

    log('field_fill', `worker=${workerId} id=${originalId} selector=section#contact input#lastName[name=lastName] value="${lastName}"`);
    await page.locator('section#contact input#lastName').fill(lastName);

    log('field_fill', `worker=${workerId} id=${originalId} selector=section#contact input#phone[name=phone][type=tel] value="${phone}"`);
    await page.locator('section#contact input#phone').fill(phone);

    log('field_fill', `worker=${workerId} id=${originalId} selector=section#contact input#zipCode[name=zipCode] value="${zip}"`);
    await page.locator('section#contact input#zipCode').fill(zip);

    log('field_fill', `worker=${workerId} id=${originalId} selector=section#contact input#email[name=email][type=email] value="${email}"`);
    await page.locator('section#contact input#email').fill(email);

    log('field_fill', `worker=${workerId} id=${originalId} selector=section#contact input#leadid_tcpa_disclosure (consent checkbox)`);
    const consent = page.locator('section#contact input#leadid_tcpa_disclosure');
    await consent.waitFor({ state: 'visible', timeout: 25_000 });
    await consent.check({ force: true });

    log('leadid_wait', `worker=${workerId} id=${originalId} waiting for input#leadid_token[name=universal_leadid] (canonical LeadiD field)`);
    await page.waitForFunction(
      () => {
        const el = document.querySelector('input#leadid_token[name="universal_leadid"]');
        return !!(el && 'value' in el && String(el.value).trim().length > 8);
      },
      { timeout: 120_000 },
    );
    const newToken = (await page.locator('input#leadid_token').inputValue()).trim();
    log('leadid_ready', `worker=${workerId} id=${originalId} token_len=${newToken.length} prefix=${newToken.slice(0, 12)}…`);

    const submitRespPromise = page.waitForResponse(
      (r) => r.url().includes('/api/forms/submit') && r.request().method() === 'POST',
      { timeout: 120_000 },
    );

    log('form_submit', `worker=${workerId} id=${originalId} button "Get Medicare Help" (type=submit)`);
    await page.locator('section#contact form').getByRole('button', { name: 'Get Medicare Help' }).click();

    const resp = await submitRespPromise;
    const rawText = await resp.text().catch(() => '');
    let body = {};
    try {
      body = JSON.parse(rawText);
    } catch {
      body = { _parseError: 'response not JSON', rawPreview: rawText.slice(0, 500) };
    }

    const apiReportedIp =
      body.submission?.ip !== undefined && body.submission?.ip !== null
        ? String(body.submission.ip).trim()
        : '';

    logBlock(`POST /api/forms/submit — response (worker=${workerId})`, [
      `http_status:         ${resp.status()}`,
      `ok:                  ${body.ok === true}`,
      `submission.id:       ${body.submission?.id ?? '—'}`,
      `submission.ip:       ${apiReportedIp || '—'} (what Next.js stored from the HTTP request)`,
      `error:               ${body.error ?? '—'}`,
      `body_preview:        ${JSON.stringify(body).slice(0, 600)}${JSON.stringify(body).length > 600 ? '…' : ''}`,
    ]);

    if (resp.status() !== 200 || !body.ok) {
      throw new Error(`submit API failed status=${resp.status()} body=${JSON.stringify(body).slice(0, 500)}`);
    }

    const { ip: ipForMongo, reason: ipReason } = pickMongoIp(pwProxy, egress, apiReportedIp);

    if (pwProxy && apiReportedIp && ipForMongo !== 'unknown' && apiReportedIp !== ipForMongo) {
      logBlock('FYI: Project1 submission.ip vs Oxylabs egress', [
        `submission.ip (API): ${apiReportedIp}`,
        `Oxylabs egress stored: ${ipForMongo}`,
        `We store Oxylabs egress for ZIP-matched leads. If Next should match, check x-forwarded-for / proxy headers on the server.`,
      ]);
    }

    logBlock(`Mongo field ip — final choice (worker=${workerId})`, [
      `stored_ip:           ${ipForMongo}`,
      `rule:                ${ipReason}`,
      `proxied_browser:     ${Boolean(pwProxy)}`,
      `api submission.ip:   ${apiReportedIp || '—'}`,
    ]);

    await markSubmissionComplete(originalId, {
      leadiD_token: newToken,
      ip: ipForMongo,
      workerId: `worker-${workerId}`,
    });

    const dupId = typeof body.submission?.id === 'string' ? body.submission.id : null;
    if (dupId && dupId !== originalId) {
      try {
        const removed = await deleteSubmissionById(dupId, { leadiD_token: newToken });
        log('duplicate_cleaned', `worker=${workerId} dup=${dupId} removed=${removed}`);
      } catch (e) {
        log('failed', `worker=${workerId} id=${originalId} duplicate_delete ${e}`);
      }
    }

    logBlock(`SUCCESS (worker=${workerId})`, [
      `Mongo _id updated:   ${originalId}`,
      `leadiD_token (len):  ${newToken.length}`,
      `ip stored:           ${ipForMongo}`,
      `ip rule:             ${ipReason}`,
      `proxied browser:     ${Boolean(pwProxy)}`,
    ]);
  } catch (e) {
    log('failed', `worker=${workerId} id=${originalId} ${e?.stack || e}`);
    await releaseLease(originalId);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
