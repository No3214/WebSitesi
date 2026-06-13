import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/llm-context/route";

function buildRequest(ip: string) {
  return new Request("http://localhost:3000/api/llm-context", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("/api/llm-context rate limiting", () => {
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
