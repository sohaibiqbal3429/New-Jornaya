import { NextRequest, NextResponse } from 'next/server';
import { createSubmission } from '@/lib/submissions-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.fullName || !body?.phone || !body?.message || !body?.leadiD_token || typeof body?.consent_checked !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const userAgent = req.headers.get('user-agent') || undefined;

    const created = await createSubmission({
      formType: body.formType || 'medicare_contact',
      fullName: body.fullName,
      email: body.email || '',
      phone: body.phone,
      company: body.company,
      serviceInterest: body.serviceInterest || 'Medicare Assistance',
      message: body.message,
      consent_checked: body.consent_checked,
      consent_timestamp: body.consent_timestamp || new Date().toISOString(),
      consent_text_version: body.consent_text_version || 'v2.0',
      leadiD_token: body.leadiD_token,
      page_url: body.page_url || req.nextUrl.toString(),
      page_source: body.page_source || 'medicare landing form',
      lead_id: body.lead_id,
      journey_identifier: body.journey_identifier,
      ip,
      userAgent,
    });

    return NextResponse.json({ ok: true, submission: created });
  } catch {
    return NextResponse.json(
      { error: 'Submission service unavailable. Check MongoDB connection and environment variables.' },
      { status: 503 },
    );
  }
}
