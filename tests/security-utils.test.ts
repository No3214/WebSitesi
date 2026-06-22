import { describe, expect, it, vi } from "vitest";
import { extractClientIp, safeText, validateSameOrigin, enforceRateLimit } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
}));

describe("security utils", () => {
  describe("extractClientIp", () => {
    it("should extract x-real-ip", () => {
      const headers = new Headers({ "x-real-ip": "192.168.1.1" });
      expect(extractClientIp(headers)).toBe("192.168.1.1");
    });
    it("should fallback to x-forwarded-for", () => {
      const headers = new Headers({ "x-forwarded-for": "10.0.0.1" });
      expect(extractClientIp(headers)).toBe("10.0.0.1");
    });
    it("should parse multiple ips in x-forwarded-for", () => {
      const headers = new Headers({ "x-forwarded-for": "10.0.0.1, 192.168.1.2" });
      expect(extractClientIp(headers)).toBe("10.0.0.1");
    });
    it("should handle ipv6 mapped ipv4", () => {
      const headers = new Headers({ "x-real-ip": "::ffff:192.168.1.1" });
      expect(extractClientIp(headers)).toBe("192.168.1.1");
    });
    it("should return unknown if no headers", () => {
      const headers = new Headers();
      expect(extractClientIp(headers)).toBe("unknown");
    });
  });

  describe("safeText", () => {
    it("should remove < and >", () => {
      expect(safeText("<script>alert(1)</script>", 50)).toBe("scriptalert(1)/script");
    });
    it("should remove control characters", () => {
      expect(safeText("hello\x00world", 50)).toBe("helloworld");
    });
    it("should trim and slice", () => {
      expect(safeText("  hello world  ", 5)).toBe("hello");
    });
  });

  describe("validateSameOrigin", () => {
    it("should return true for same origin", () => {
      const req = new Request("https://example.com/api", {
        headers: { origin: "https://example.com", host: "example.com" }
      });
      expect(validateSameOrigin(req)).toBe(true);
    });
    it("should return false if origin is missing", () => {
      const req = new Request("https://example.com/api", {
        headers: { host: "example.com" }
      });
      expect(validateSameOrigin(req)).toBe(false);
    });
    it("should return false if host is missing", () => {
      const req = new Request("https://example.com/api", {
        headers: { origin: "https://example.com" }
      });
      expect(validateSameOrigin(req)).toBe(false);
    });
    it("should return false for different origins", () => {
      const req = new Request("https://example.com/api", {
        headers: { origin: "https://evil.com", host: "example.com" }
      });
      expect(validateSameOrigin(req)).toBe(false);
    });
    it("should return false for invalid origin URL", () => {
      const req = new Request("https://example.com/api", {
        headers: { origin: "not-a-url", host: "example.com" }
      });
      expect(validateSameOrigin(req)).toBe(false);
    });
    it("should handle trailing dots in hosts", () => {
      const req = new Request("https://example.com/api", {
        headers: { origin: "https://example.com.", host: "example.com" }
      });
      expect(validateSameOrigin(req)).toBe(true);
    });
  });

  describe("enforceRateLimit", () => {
    it("should call rateLimit", async () => {
      vi.mocked(rateLimit).mockResolvedValue(true as unknown as void);
      await enforceRateLimit("test-key", 10, 1000);
      expect(rateLimit).toHaveBeenCalledWith("test-key", 10, 1000);
    });
  });
});
