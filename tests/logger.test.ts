import { beforeEach, describe, expect, it, vi } from "vitest";

import { errField, logEvent, maskIp, maskText } from "@/lib/logger";

describe("logger helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("masks IP addresses and unknown identifiers before logging", () => {
    expect(maskIp("192.168.1.100")).toBe("192.168.1.x");
    expect(maskIp("2001:db8::abcd")).toBe("2001:db8::x");
    expect(maskIp("unknown-client")).toBe("unknow…");
    expect(maskIp(null)).toBe("unknown");
  });

  it("masks free-form PII text consistently", () => {
    expect(maskText("Kozbeyli")).toBe("Ko…");
    expect(maskText("ab")).toBe("a…");
    expect(maskText("  Ali Veli  ")).toBe("Al…");
    expect(maskText(undefined)).toBe("");
  });

  it("emits one-line JSON logs to the expected console method", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    logEvent("info", "lead.created", { ip: maskIp("203.0.113.44") });
    logEvent("warn", "lead.rate_limited");
    logEvent("error", "checkout.failed", { error: errField(new Error("PSP rejected")) });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(logSpy.mock.calls[0][0])).toMatchObject({
      level: "info",
      event: "lead.created",
      ip: "203.0.113.x",
    });
    expect(JSON.parse(warnSpy.mock.calls[0][0])).toMatchObject({
      level: "warn",
      event: "lead.rate_limited",
    });
    expect(JSON.parse(errorSpy.mock.calls[0][0])).toMatchObject({
      level: "error",
      event: "checkout.failed",
      error: "Error: PSP rejected",
    });
  });

  it("does not throw when log fields contain circular objects, BigInt or Error instances", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const context: Record<string, unknown> = { bookingId: BigInt(123), err: new Error("bad") };
    context.self = context;

    expect(() => logEvent("info", "booking.audit", context)).not.toThrow();

    expect(JSON.parse(logSpy.mock.calls[0][0])).toMatchObject({
      level: "info",
      event: "booking.audit",
      bookingId: "123",
      err: "Error: bad",
      self: {
        bookingId: "123",
        err: "Error: bad",
        self: "[Circular]",
      },
    });
  });

  it("falls back to a minimal structured entry when field serialization throws", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(() =>
      logEvent("warn", "booking.audit", {
        bad: {
          toJSON() {
            throw new Error("broken toJSON");
          },
        },
      }),
    ).not.toThrow();

    expect(JSON.parse(warnSpy.mock.calls[0][0])).toMatchObject({
      level: "warn",
      event: "booking.audit",
      log_serialization_error: "Error: broken toJSON",
    });
  });

  it("reduces unknown errors to safe string fields", () => {
    expect(errField(new TypeError("bad payload"))).toBe("TypeError: bad payload");
    expect(errField("plain failure")).toBe("plain failure");
  });
});
