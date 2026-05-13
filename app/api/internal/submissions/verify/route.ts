import { NextRequest, NextResponse } from 'next/server';
import { isInternalApiAuthorized } from '@/lib/internal-api-auth';
import { markSubmissionVerified } from '@/lib/submissions-store';

export async function POST(req: NextRequest) {
  if (!isInternalApiAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body?.id || typeof body.id !== 'string') {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updated = await markSubmissionVerified({
      id: body.id,
      submittedLeadiDToken:
        typeof body.submittedLeadiDToken === 'string'
          ? body.submittedLeadiDToken
          : typeof body.updatedLeadiDToken === 'string'
            ? body.updatedLeadiDToken
            : undefined,
      verificationMeta: {
        verifiedAt: new Date().toISOString(),
        workerId: typeof body.workerId === 'string' ? body.workerId : 'unknown-worker',
        ip: typeof body.ip === 'string' ? body.ip : undefined,
      },
    });

    if (!updated) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, submission: updated });
  } catch {
    return NextResponse.json(
      { error: 'Unable to mark submission verified. Check database connectivity.' },
      { status: 503 },
    );
  }
}
