import { describe, expect, it } from "vitest";

import { hasSeen, markSeen, rateLimit, rateLimitBackend } from "@/lib/rate-limit";

// Not: CI/dev ortamında UPSTASH_* env tanımlı olmadığından bu testler
// in-memory backend davranışını doğrular (T4 fallback sözleşmesi).

describe("rate-limit (in-memory fallback)", () => {
  it("backend env yokken memory olmalı", () => {
    expect(rateLimitBackend()).toBe("memory");
  });

  it("limit içinde istekleri kabul eder ve remaining azalır", async () => {
    const key = `t:${Math.random()}`;
    const first = await rateLimit(key, 3, 60_000);
    const second = await rateLimit(key, 3, 60_000);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("limit aşımında reddeder ve retryAfterSec verir", async () => {
    const key = `t:${Math.random()}`;
    await rateLimit(key, 2, 60_000);
    await rateLimit(key, 2, 60_000);
    const blocked = await rateLimit(key, 2, 60_000);

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("pencere dolunca sayaç sıfırlanır", async () => {
    const key = `t:${Math.random()}`;
    await rateLimit(key, 1, 30); // 30ms pencere
    const blocked = await rateLimit(key, 1, 30);
    expect(blocked.allowed).toBe(false);

    await new Promise((r) => setTimeout(r, 40));
    const afterWindow = await rateLimit(key, 1, 30);
    expect(afterWindow.allowed).toBe(true);
  });

  it("replay: markSeen sonrası hasSeen true, TTL dolunca false", async () => {
    const key = `replay:${Math.random()}`;
    expect(await hasSeen(key)).toBe(false);

    await markSeen(key, 50);
    expect(await hasSeen(key)).toBe(true);

    await new Promise((r) => setTimeout(r, 60));
    expect(await hasSeen(key)).toBe(false);
  });
});
