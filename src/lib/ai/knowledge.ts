import fs from 'fs';
import path from 'path';
import type { ConciergeContext } from './types';

let cachedContext: ConciergeContext | null = null;
let cachedAt = 0;

const CACHE_TTL_MS = 5 * 60 * 1000;

function readFileSafe(relativePath: string, fallback = ''): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
  } catch {
    return fallback;
  }
}

export function loadConciergeContext(forceRefresh = false): ConciergeContext {
  const now = Date.now();

  if (!forceRefresh && cachedContext && now - cachedAt < CACHE_TTL_MS) {
    return cachedContext;
  }

  const brandIdentity = readFileSafe('brand/identity.md');
  const voiceTone = readFileSafe('brand/voice-and-tone.md');
  const roomsData = readFileSafe('src/data/rooms.ts');

  const systemPrompt = `
You are the Digital Concierge (Dijital Kâhya) and Growth Architect for Kozbeyli Konağı.

PRIMARY GOAL:
- Help the guest clearly, politely, and accurately.
- Protect brand trust.
- Increase conversion without sounding pushy.

LANGUAGE:
- Always respond in Turkish unless the user explicitly asks for another language.

BRAND CONTEXT:
${brandIdentity}

VOICE & TONE:
${voiceTone}

ROOMS DATA:
${roomsData}

RULES:
- Never invent prices, availability, policies, or promises.
- If pricing or availability is uncertain, direct the user to Rezervasyon or WhatsApp.
- Keep responses concise but premium.
- Emphasize stone architecture, calm atmosphere, Antakya cuisine, and Dibek coffee heritage where relevant.
- Prefer actionable replies.
- If asked something outside hotel/restaurant/event scope, answer briefly and redirect politely.
`.trim();

  cachedContext = {
    brandIdentity,
    voiceTone,
    roomsData,
    systemPrompt,
  };
  cachedAt = now;

  return cachedContext;
}
