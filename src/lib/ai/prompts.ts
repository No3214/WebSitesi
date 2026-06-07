import type { ChatMessage } from './types';
import { loadConciergeContext } from './knowledge';

export function buildSystemPrompt() {
  return loadConciergeContext().systemPrompt;
}

/** Maximum characters allowed per message; longer content is truncated. */
export const MAX_MESSAGE_LENGTH = 2000;

/** Maximum number of messages forwarded to the model (only the most recent are kept). */
export const MAX_HISTORY_MESSAGES = 12;

/**
 * Roles accepted from the client. 'system' is deliberately excluded: the system
 * prompt is added server-side only (see buildSystemPrompt in the /api/chat route),
 * so clients can never inject or override system-level instructions through the
 * message history.
 */
const ALLOWED_ROLES: ReadonlySet<string> = new Set(['user', 'assistant']);

/**
 * Removes control characters (C0 controls except tab/newline/carriage-return,
 * DEL, and C1 controls) while preserving line breaks and tabs so that markdown
 * formatting and code blocks remain intact.
 */
function stripControlCharacters(value: string): string {
  let out = '';
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isC0 = code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d;
    const isDelOrC1 = code >= 0x7f && code <= 0x9f;
    if (!isC0 && !isDelOrC1) out += char;
  }
  return out;
}

/**
 * Truncates a string to `max` UTF-16 code units without leaving a dangling
 * unpaired surrogate at the cut point.
 */
function truncateContent(value: string, max: number): string {
  if (value.length <= max) return value;
  let out = value.slice(0, max);
  const last = out.charCodeAt(out.length - 1);
  // Drop a lone high surrogate created by the cut.
  if (last >= 0xd800 && last <= 0xdbff) out = out.slice(0, -1);
  return out;
}

/**
 * Sanitizes the untrusted chat history received from the client before it is
 * forwarded to the AI provider.
 *
 * Hardening rules (prompt-injection surface):
 * - Role whitelist: only 'user' and 'assistant' messages are accepted. Any
 *   client-supplied 'system' (or unknown) role is dropped entirely, so a system
 *   message can never appear in this function's output — the system prompt is
 *   always appended server-side via buildSystemPrompt().
 * - Content is stripped of control characters (markdown and code blocks are
 *   preserved), trimmed, and truncated to MAX_MESSAGE_LENGTH characters.
 * - Only the most recent MAX_HISTORY_MESSAGES non-empty messages are kept.
 * - Injection phrases such as "ignore previous instructions" are intentionally
 *   NOT removed from content (users may legitimately write them); isolating the
 *   server-owned system prompt is the actual defense.
 *
 * The signature and return type (ChatMessage[]) are unchanged for backwards
 * compatibility with existing callers.
 */
export function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((item) => item && typeof item === 'object')
    .filter((item) => typeof item.role === 'string' && ALLOWED_ROLES.has(item.role))
    .map((item): ChatMessage => {
      const raw = typeof item.content === 'string' ? item.content : '';
      const content = truncateContent(stripControlCharacters(raw).trim(), MAX_MESSAGE_LENGTH);
      return {
        role: item.role as 'user' | 'assistant',
        content,
      };
    })
    .filter((item) => item.content.length > 0)
    .slice(-MAX_HISTORY_MESSAGES);
}
