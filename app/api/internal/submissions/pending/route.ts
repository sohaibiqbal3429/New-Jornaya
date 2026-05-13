import { NextRequest, NextResponse } from 'next/server';
import { isInternalApiAuthorized } from '@/lib/internal-api-auth';
import { listPendingVerificationSubmissions } from '@/lib/submissions-store';

export async function GET(req: NextRequest) {
  if (!isInternalApiAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const limit = Number(req.nextUrl.searchParams.get('limit') || 100);
    const submissions = await listPendingVerificationSubmissions(limit);
    return NextResponse.json({
      ok: true,
      count: submissions.length,
      submissions,
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to fetch pending submissions. Check database connectivity.' },
      { status: 503 },
    );
  }
}
