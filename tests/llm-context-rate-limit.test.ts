import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/llm-context/route";

function buildRequest(ip: string) {
  return new Request("http://localhost:3000/api/llm-context", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("/api/llm-context rate limiting", () => {
  it("serves conservative evidence-gated reservation context", async () => {
    const response = await GET(buildRequest(`llm-context-contract-${Date.now()}`));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Content-Policy")).toBe("evidence-gated");
    expect(response.headers.has("X-Agentic-Architecture")).toBe(false);
    expect(payload.reservation.status).toBe("availability_confirmation_required");
    expect(payload.reservation.live_booking_engine).toContain("NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL");
    expect(payload.reservation.payment_note).toContain("only be represented as available");
    expect(payload.evidence_boundaries).toContain("Do not claim every room has sea view.");
    expect(JSON.stringify(payload)).not.toContain("Registered Cultural Heritage Site Class-1");
    expect(JSON.stringify(payload)).not.toContain("9.6/10");
    expect(JSON.stringify(payload)).not.toContain("booking_engine_url");
  });

  it("awaits the shared rate limiter and rejects the sixth request in the window", async () => {
    const ip = `llm-context-test-${Date.now()}-${Math.random()}`;

    const responses: Response[] = [];
    for (let i = 0; i < 6; i += 1) {
      responses.push(await GET(buildRequest(ip)));
    }

    expect(responses.slice(0, 5).map((response) => response.status)).toEqual([
      200,
      200,
      200,
      200,
      200,
    ]);
    expect(responses[5].status).toBe(429);
  });
});
