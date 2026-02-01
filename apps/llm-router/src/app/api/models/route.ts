import { NextRequest, NextResponse } from 'next/server';
import { PROVIDERS } from '@/lib/providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, apiKey, baseUrl } = body;

    const provider = PROVIDERS.find(p => p.id === providerId);
    if (!provider) {
      return NextResponse.json({ models: provider?.models || [] });
    }

    // Try to fetch actual models from the API
    const url = baseUrl || provider.baseUrl;

    if (provider.id === 'ollama') {
      try {
        const res = await fetch(`${url}/tags`);
        const data = await res.json();
        const models = data.models?.map((m: any) => m.name) || [];
        return NextResponse.json({ models });
      } catch {
        return NextResponse.json({ models: provider.models });
      }
    }

    if (provider.id === 'anthropic') {
      // Anthropic doesn't have a models endpoint, return static list
      return NextResponse.json({ models: provider.models });
    }

    // OpenAI-compatible
    try {
      const res = await fetch(`${url}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await res.json();
      const models = data.data?.map((m: any) => m.id) || provider.models;
      return NextResponse.json({ models });
    } catch {
      return NextResponse.json({ models: provider.models });
    }
  } catch (error: any) {
    return NextResponse.json({ models: [] }, { status: 500 });
  }
}
