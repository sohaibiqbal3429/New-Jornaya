import { NextRequest, NextResponse } from 'next/server';
import { createSubmission } from '@/lib/submissions-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.formType || !body?.fullName || !body?.leadiD_token || typeof body?.consent_checked !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const userAgent = req.headers.get('user-agent') || undefined;

    const created = await createSubmission({
      formType: body.formType,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      company: body.company,
      serviceInterest: body.serviceInterest,
      message: body.message,
      consent_checked: body.consent_checked,
      consent_timestamp: body.consent_timestamp,
      consent_text_version: body.consent_text_version,
      leadiD_token: body.leadiD_token,
      page_url: body.page_url,
      page_source: body.page_source,
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
