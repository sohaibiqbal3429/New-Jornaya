import { config } from './config.js';
import { debugLog } from './debug-console.js';

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': config.project1ApiKey,
};

async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function fetchPendingSubmissions(limit) {
  const url = new URL('/api/internal/submissions/pending', config.project1BaseUrl);
  url.searchParams.set('limit', String(limit));

  debugLog('API:PENDING', 'GET', url.toString(), 'limit=', limit);
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
  });
  const body = await safeJson(response);

  debugLog('API:PENDING', 'Response status=', response.status, 'ok=', response.ok);
  if (!response.ok) {
    debugLog('API:PENDING', 'ERROR body keys=', body && typeof body === 'object' ? Object.keys(body) : typeof body);
    throw new Error(`Failed pending fetch: ${response.status} ${JSON.stringify(body)}`);
  }
  const list = Array.isArray(body?.submissions) ? body.submissions : [];
  debugLog(
    'API:PENDING',
    'Submissions count=',
    list.length,
    list.length ? `ids=${list.map((s) => s?.id).join(',')}` : '(empty)',
  );
  return list;
}

export async function markVerified(params) {
  const url = new URL('/api/internal/submissions/verify', config.project1BaseUrl);
  debugLog('API:VERIFY', 'POST', url.toString(), {
    id: params.id,
    workerId: params.workerId,
    ip: params.ip,
    submittedLeadiDTokenLen: (params.submittedLeadiDToken || '').length,
  });
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  const body = await safeJson(response);

  debugLog('API:VERIFY', 'Response status=', response.status, 'ok=', response.ok);
  if (!response.ok) {
    debugLog('API:VERIFY', 'ERROR body=', JSON.stringify(body).slice(0, 500));
    throw new Error(`Failed verify update: ${response.status} ${JSON.stringify(body)}`);
  }
  debugLog('API:VERIFY', 'Success; submission id=', body?.submission?.id ?? params.id);
  return body?.submission;
}
