import { NextResponse } from 'next/server';
import {
  applyOutputGuardrails,
  buildFallbackResponse,
  buildSystemPrompt,
  emitChatTelemetry,
  generateAIResponse,
  sanitizeMessages,
} from '@/lib/ai';

function buildRequestId() {
  return crypto.randomUUID();
}

export async function POST(req: Request) {
  const requestId = buildRequestId();
  const startedAt = Date.now();

  try {
    const body = await req.json().catch(() => null);
    const messages = sanitizeMessages(body?.messages);

    if (!messages.length) {
      return NextResponse.json(
        { error: 'Mesaj içeriği bulunamadı.' },
        { status: 400 },
      );
    }

    const systemPrompt = buildSystemPrompt();
    const providerResult = await generateAIResponse(messages, systemPrompt);

    const usedFallback = !providerResult.ok || !providerResult.content;
    const rawContent = usedFallback
      ? buildFallbackResponse(messages)
      : providerResult.content!;

    const content = applyOutputGuardrails(rawContent);

    emitChatTelemetry({
      route: '/api/chat',
      requestId,
      provider: providerResult.provider,
      model: providerResult.model,
      fallbackUsed: usedFallback,
      latencyMs: Date.now() - startedAt,
      status: usedFallback ? 'fallback' : 'success',
      error: providerResult.error,
      messageCount: messages.length,
    });

    return NextResponse.json({
      role: 'assistant',
      content,
      meta: {
        requestId,
        fallbackUsed: usedFallback,
        provider: providerResult.provider,
        model: providerResult.model,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';

    emitChatTelemetry({
      route: '/api/chat',
      requestId,
      provider: 'none',
      fallbackUsed: true,
      latencyMs: Date.now() - startedAt,
      status: 'error',
      error: message,
      messageCount: 0,
    });

    return NextResponse.json(
      {
        role: 'assistant',
        content:
          'Şu anda size hemen yardımcı olabilmek için kısa cevap modunda devam ediyorum. Oda, restoran veya rezervasyon konusunda sorunuzu tekrar iletebilirsiniz.',
        meta: {
          requestId,
          fallbackUsed: true,
          provider: 'none',
        },
      },
      { status: 200 },
    );
  }
}
