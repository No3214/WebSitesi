import { describe, expect, it, vi } from "vitest";

import { rateLimit } from "@/lib/rate-limit";
import {
  enforceRateLimit,
  extractClientIp,
  safeText,
  validateSameOrigin,
} from "@/lib/security";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
}));

describe("security helpers", () => {
  it("extracts the first trustworthy client IP header and normalizes IPv4-mapped IPv6", () => {
    expect(extractClientIp(new Headers({ "x-real-ip": "::ffff:192.168.1.10" }))).toBe(
      "192.168.1.10",
    );
    expect(
      extractClientIp(
        new Headers({ "x-forwarded-for": "203.0.113.10, 198.51.100.2" }),
      ),
    ).toBe("203.0.113.10");
    expect(extractClientIp(new Headers())).toBe("unknown");
  });

  it("sanitizes guest-controlled text before logging or persistence", () => {
    expect(safeText("  <script>\u0000alert(1)</script>  ", 12)).toBe("scriptalert(");
    expect(safeText("Kozbeyli Konağı", 8)).toBe("Kozbeyli");
  });

  it("removes bidirectional control characters that can spoof operational logs", () => {
    expect(safeText("invoice\u202Ecod.exe", 80)).toBe("invoicecod.exe");
    expect(safeText("\u2066Rezervasyon\u2069 \u200fNo: 42", 80)).toBe("Rezervasyon No: 42");
  });

  it("validates same-origin state-changing requests fail-closed", () => {
    expect(
      validateSameOrigin(
        new Request("https://www.kozbeylikonagi.com/api/lead", {
          headers: {
            origin: "https://www.kozbeylikonagi.com.",
            host: "www.kozbeylikonagi.com",
          },
        }),
      ),
    ).toBe(true);
    expect(
      validateSameOrigin(
        new Request("https://www.kozbeylikonagi.com/api/lead", {
          headers: { origin: "https://evil.example", host: "www.kozbeylikonagi.com" },
        }),
      ),
    ).toBe(false);
    expect(
      validateSameOrigin(
        new Request("https://www.kozbeylikonagi.com/api/lead", {
          headers: { host: "www.kozbeylikonagi.com" },
        }),
      ),
    ).toBe(false);
    expect(
      validateSameOrigin(
        new Request("https://www.kozbeylikonagi.com/api/lead", {
          headers: { origin: "not-a-url", host: "www.kozbeylikonagi.com" },
        }),
      ),
    ).toBe(false);
  });

  it("delegates rate limiting to the shared backend helper", async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSec: 30,
    });

    await expect(enforceRateLimit("lead:203.0.113.10", 5, 60_000)).resolves.toEqual({
      allowed: false,
      remaining: 0,
      retryAfterSec: 30,
    });
    expect(rateLimit).toHaveBeenCalledWith("lead:203.0.113.10", 5, 60_000);
  });
});
