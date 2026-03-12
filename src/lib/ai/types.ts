export type ChatRole = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type AIProviderName = 'none' | 'openai-compatible';

export type AISettings = {
  provider: AIProviderName;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs: number;
  maxOutputTokens: number;
  temperature: number;
  enabled: boolean;
};

export type ConciergeContext = {
  brandIdentity: string;
  voiceTone: string;
  roomsData: string;
  systemPrompt: string;
};

export type AIProviderResult = {
  ok: boolean;
  content?: string;
  provider: AIProviderName;
  model?: string;
  latencyMs: number;
  finishReason?: string;
  error?: string;
};

export type TelemetryEvent = {
  route: string;
  requestId: string;
  provider: AIProviderName;
  model?: string;
  fallbackUsed: boolean;
  latencyMs: number;
  status: 'success' | 'fallback' | 'error';
  error?: string;
  messageCount: number;
};
