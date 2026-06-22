import { describe, expect, it, vi, beforeEach } from "vitest";
import { maskIp, maskText, logEvent, errField } from "@/lib/logger";

describe("logger utils", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("maskIp", () => {
    it("should mask IPv4 address", () => {
      expect(maskIp("192.168.1.100")).toBe("192.168.1.x");
    });
    it("should mask IPv6 address", () => {
      expect(maskIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe("2001:0db8:85a3:0000:0000:8a2e:0370:x");
    });
    it("should fallback for unknown format", () => {
      expect(maskIp("invalid-ip")).toBe("invali…");
    });
    it("should handle null/undefined", () => {
      expect(maskIp(null)).toBe("unknown");
      expect(maskIp(undefined)).toBe("unknown");
      expect(maskIp("")).toBe("unknown");
    });
  });

  describe("maskText", () => {
    it("should mask text longer than 2 characters", () => {
      expect(maskText("Kozbeyli")).toBe("Ko…");
    });
    it("should mask short text", () => {
      expect(maskText("ab")).toBe("a…");
    });
    it("should handle null/undefined", () => {
      expect(maskText(null)).toBe("");
      expect(maskText(undefined)).toBe("");
      expect(maskText("")).toBe("");
    });
  });

  describe("logEvent", () => {
    it("should log info level", () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logEvent("info", "test_event", { data: 123 });

      expect(logSpy).toHaveBeenCalledTimes(1);
      const parsedLog = JSON.parse(logSpy.mock.calls[0][0]);
      expect(parsedLog.level).toBe("info");
      expect(parsedLog.event).toBe("test_event");
      expect(parsedLog.data).toBe(123);
      expect(parsedLog.ts).toBeDefined();
    });

    it("should log warn level", () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      logEvent("warn", "test_event");

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const parsedLog = JSON.parse(warnSpy.mock.calls[0][0]);
      expect(parsedLog.level).toBe("warn");
    });

    it("should log error level", () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logEvent("error", "test_event");

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const parsedLog = JSON.parse(errorSpy.mock.calls[0][0]);
      expect(parsedLog.level).toBe("error");
    });
  });

  describe("errField", () => {
    it("should handle Error object", () => {
      const err = new Error("Test error");
      expect(errField(err)).toBe("Error: Test error");
    });
    it("should handle non-Error object", () => {
      expect(errField("Test string error")).toBe("Test string error");
      expect(errField({ message: "Test obj error" })).toBe("[object Object]");
    });
  });
});
