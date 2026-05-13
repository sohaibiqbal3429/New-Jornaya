import { NextRequest } from 'next/server';

function getInternalApiKey() {
  return process.env.PROJECT2_API_KEY || process.env.INTERNAL_API_KEY;
}

export function isInternalApiAuthorized(req: NextRequest) {
  const configuredKey = getInternalApiKey();
  if (!configuredKey) return false;

  const headerKey = req.headers.get('x-api-key');
  if (headerKey && headerKey === configuredKey) return true;

  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : authHeader.trim();
  return token === configuredKey;
}
