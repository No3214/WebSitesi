import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  applyOutputGuardrails,
  buildFallbackResponse,
  buildSystemPrompt,
  emitChatTelemetry,
  generateAIResponse,
  sanitizeMessages,
} from "@/lib/ai";
import { checkRateLimit, rateLimitResponse } from "@/lib/ai/security";
import { extractClientIp } from "@/lib/security";

// Max messages per conversation to prevent abuse
const MAX_MESSAGES = 30;
// Max request body size (10KB)
const MAX_BODY_SIZE = 10_000;

function buildRequestId() {
  return crypto.randomUUID();
}

export async function POST(req: Request) {
  const requestId = buildRequestId();
  const startedAt = Date.now();

  try {
    // Body size limit
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "İstek çok büyük." }, { status: 413 });
    }

    // Use Cloudflare IP if available, fallback to proxy headers
    const ip = extractClientIp(req.headers);

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return rateLimitResponse();
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const messages = sanitizeMessages(body?.messages);

    if (!messages.length) {
      return NextResponse.json({ error: "Mesaj içeriği bulunamadı." }, { status: 400 });
    }

    // Limit conversation length to prevent token abuse
    const trimmedMessages = messages.slice(-MAX_MESSAGES);

    const systemPrompt = buildSystemPrompt();
    const providerResult = await generateAIResponse(trimmedMessages, systemPrompt);

    const usedFallback = !providerResult.ok || !providerResult.content;
    const rawContent = usedFallback
      ? buildFallbackResponse(trimmedMessages)
      : providerResult.content!;

    const content = applyOutputGuardrails(rawContent);

    emitChatTelemetry({
      route: "/api/chat",
      requestId,
      provider: providerResult.provider,
      model: providerResult.model,
      fallbackUsed: usedFallback,
      latencyMs: Date.now() - startedAt,
      status: usedFallback ? "fallback" : "success",
      // Sanitize error: never expose raw provider errors
      error: providerResult.error ? "provider_error" : undefined,
      messageCount: trimmedMessages.length,
    });

    return NextResponse.json({
      role: "assistant",
      content,
      meta: {
        requestId,
        fallbackUsed: usedFallback,
      },
    });
  } catch {
    emitChatTelemetry({
      route: "/api/chat",
      requestId,
      provider: "none",
      fallbackUsed: true,
      latencyMs: Date.now() - startedAt,
      status: "error",
      error: "internal_error",
      messageCount: 0,
    });

    return NextResponse.json(
      {
        role: "assistant",
        content:
          "Şu anda bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin veya WhatsApp üzerinden bize ulaşın.",
        meta: { requestId, fallbackUsed: true },
      },
      { status: 200 }
    );
  }
}
