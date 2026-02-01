import { NextRequest, NextResponse } from 'next/server';
import { PROVIDERS, proxyRequest, ProviderConfig } from '@/lib/providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, config, messages, options } = body;

    const provider = PROVIDERS.find(p => p.id === providerId);
    if (!provider) {
      return NextResponse.json({ success: false, error: 'Provider not found' }, { status: 400 });
    }

    const result = await proxyRequest(provider, config as ProviderConfig, messages, options);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
