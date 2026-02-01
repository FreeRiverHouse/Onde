import { NextRequest, NextResponse } from 'next/server';
import { PROVIDERS, testProvider } from '@/lib/providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, apiKey, baseUrl } = body;

    const provider = PROVIDERS.find(p => p.id === providerId);
    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 400 });
    }

    const result = await testProvider(provider, apiKey, baseUrl);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
