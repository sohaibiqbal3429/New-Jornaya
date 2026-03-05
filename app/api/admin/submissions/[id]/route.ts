import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { deleteSubmission, updateSubmissionStatus } from '@/lib/submissions-store';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const status = body?.status;
    if (!['new', 'seen', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { id } = await params;
    const updated = await updateSubmissionStatus(id, status);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, submission: updated });
  } catch {
    return NextResponse.json({ error: 'Update failed. Please verify database connectivity.' }, { status: 503 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const deleted = await deleteSubmission(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed. Please verify database connectivity.' }, { status: 503 });
  }
}
