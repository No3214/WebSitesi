import type { ChatMessage } from './types';
import { loadConciergeContext } from './knowledge';

export function buildSystemPrompt() {
  return loadConciergeContext().systemPrompt;
}

export function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const role = typeof item.role === 'string' ? item.role : 'user';
      const content = typeof item.content === 'string' ? item.content.trim() : '';
      return {
        role: role === 'assistant' || role === 'system' ? role : 'user',
        content,
      } as ChatMessage;
    })
    .filter((item) => item.content.length > 0)
    .slice(-12);
}
