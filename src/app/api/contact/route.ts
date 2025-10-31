import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK_URL = 'https://n8n.unitycompany.com.br/webhook/novametalica/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const url = new URL(WEBHOOK_URL);
    const searchParams = new URLSearchParams();

    const appendParam = (key: string, value: unknown) => {
      if (value === undefined || value === null) {
        return;
      }

      if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value));
        return;
      }

      const stringValue = String(value).trim();
      if (stringValue.length === 0) {
        return;
      }

      searchParams.append(key, stringValue);
    };

  const { utm: rawUtm, ...rest } = (payload ?? {}) as Record<string, unknown>;

    Object.entries(rest).forEach(([key, value]) => {
      appendParam(key, value);
    });

    const resolveString = (value: unknown) => {
      if (typeof value === 'string') {
        return value.trim();
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }

      return '';
    };

    const utmRecord = rawUtm && typeof rawUtm === 'object' ? (rawUtm as Record<string, unknown>) : {};

    const utmSource = resolveString(utmRecord.utm_source);
    const utmMedium = resolveString(utmRecord.utm_medium);
    const utmCampaign = resolveString(utmRecord.utm_campaign);
    const utmTerm = resolveString(utmRecord.utm_term);
    const utmContent = resolveString(utmRecord.utm_content);
    const utmGclid = resolveString(utmRecord.gclid);
    const utmFbclid = resolveString(utmRecord.fbclid);
    const utmMsclkid = resolveString(utmRecord.msclkid);
    const utmLanding = resolveString(utmRecord.landingPage);
    const utmReferrer = resolveString(utmRecord.referrer);
    const utmLocale = resolveString(utmRecord.locale);

    const utmPayload = {
      source: utmSource,
      medium: utmMedium,
      campaign: utmCampaign,
      term: utmTerm,
      content: utmContent,
      gclid: utmGclid,
      fbclid: utmFbclid,
      msclkid: utmMsclkid,
      landingPage: utmLanding,
      referrer: utmReferrer,
      locale: utmLocale,
    };

    Object.entries(utmPayload).forEach(([key, value]) => {
      searchParams.append(`utm[${key}]`, value ?? '');
    });

    url.search = searchParams.toString();

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook responded with error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: 'Falha ao encaminhar dados.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao encaminhar contato:', error);
    return NextResponse.json({ success: false, error: 'Erro interno ao enviar contato.' }, { status: 500 });
  }
}
