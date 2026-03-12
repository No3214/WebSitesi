```
import { NextResponse } from "next/server";

import {
  enforceRateLimit,
  extractClientIp,
  validateSameOrigin,
} from "@/lib/security";
import { buildSystemPrompt, processChatRequest } from "@/services/ai";

const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!validateSameOrigin(req)) {
      return NextResponse.json(
        { ok: false, message: "Geçersiz istek kaynağı." },
        { status: 403 },
      );
    }

    const ipAddress = extractClientIp(req.headers);
    const rateLimit = enforceRateLimit(
      `chat:${ipAddress}`,
      RATE_LIMIT.maxRequests,
      RATE_LIMIT.windowMs,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: "Çok fazla talep gönderildi. Lütfen daha sonra tekrar deneyiniz.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfterSec.toString(),
          },
        },
      );
    }

    // This is where you would normally call your LLM provider (OpenAI, Anthropic, etc.)
    // For now, we use our modular service to handle the logic.
    const systemPrompt = buildSystemPrompt();
    const response = await processChatRequest(messages);

    return NextResponse.json({
      role: response.role,
      content: response.content,
      usage: {
        prompt_tokens: systemPrompt.length / 4, // Simulated
        completion_tokens: response.content.length / 4, // Simulated
        total_tokens: (systemPrompt.length + response.content.length) / 4,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Efendim, şu an size yardımcı olamıyorum. Lütfen daha sonra tekrar deneyiniz.",
      },
      { status: 500 },
    );
  }
}
```
