import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { listSubmissions } from '@/lib/submissions-store';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const result = await listSubmissions({
    query: searchParams.get('query') ?? undefined,
    formType: searchParams.get('formType') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    consentChecked: searchParams.get('consent_checked') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
    limit: Number(searchParams.get('limit') ?? 20),
  });

  return NextResponse.json(result);
}
