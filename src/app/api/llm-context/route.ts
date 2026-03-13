import { NextResponse } from 'next/server';
import { LLMContextGenerator } from '@/lib/ai/llm-context-generator';
import { checkRateLimit, rateLimitResponse } from '@/lib/ai/security';

/**
 * LLM-Native Context API Endpoint
 * Optimized for travel-focused LLMs (Perplexity, Gemini, OpenAI Search).
 * Provides the "Soul" of the property in a high-density JSON format.
 */
export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  if (!checkRateLimit(ip)) {
    return rateLimitResponse();
  }

  const context = LLMContextGenerator.getCoreContext();
  
  return NextResponse.json(context, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
      'X-AI-Search-Ready': 'true',
      'X-Agentic-Architecture': 'Antigravity-V1'
    }
  });
}
