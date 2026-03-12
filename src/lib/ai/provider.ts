import type { AIProviderResult, AISettings, ChatMessage } from './types';

function getSettings(): AISettings {
  const provider = (process.env.AI_PROVIDER || 'none') as AISettings['provider'];
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 12000);
  const maxOutputTokens = Number(process.env.AI_MAX_OUTPUT_TOKENS || 500);
  const temperature = Number(process.env.AI_TEMPERATURE || 0.4);

  const enabled = provider !== 'none' && Boolean(apiKey) && Boolean(baseUrl) && Boolean(model);

  return {
    provider,
    apiKey,
    baseUrl,
    model,
    timeoutMs,
    maxOutputTokens,
    temperature,
    enabled,
  };
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal, cache: 'no-store' });
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateAIResponse(messages: ChatMessage[], systemPrompt: string): Promise<AIProviderResult> {
  const settings = getSettings();
  const startedAt = Date.now();

  if (!settings.enabled || settings.provider === 'none') {
    return {
      ok: false,
      provider: 'none',
      latencyMs: Date.now() - startedAt,
      error: 'AI provider disabled',
    };
  }

  if (settings.provider !== 'openai-compatible') {
    return {
      ok: false,
      provider: settings.provider,
      model: settings.model,
      latencyMs: Date.now() - startedAt,
      error: 'Unsupported provider',
    };
  }

  const payload = {
    model: settings.model,
    temperature: settings.temperature,
    max_tokens: settings.maxOutputTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  };

  try {
    const response = await fetchWithTimeout(
      `${settings.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify(payload),
      },
      settings.timeoutMs,
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        provider: settings.provider,
        model: settings.model,
        latencyMs: Date.now() - startedAt,
        error: `Provider HTTP ${response.status}: ${errorText.slice(0, 300)}`,
      };
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    const finishReason = json?.choices?.[0]?.finish_reason;

    if (typeof content !== 'string' || !content.trim()) {
      return {
        ok: false,
        provider: settings.provider,
        model: settings.model,
        latencyMs: Date.now() - startedAt,
        finishReason,
        error: 'Provider returned empty content',
      };
    }

    return {
      ok: true,
      content,
      provider: settings.provider,
      model: settings.model,
      latencyMs: Date.now() - startedAt,
      finishReason,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown provider error';

    return {
      ok: false,
      provider: settings.provider,
      model: settings.model,
      latencyMs: Date.now() - startedAt,
      error: message,
    };
  }
}
