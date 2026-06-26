import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("CTA event bridge (data-event → GA4 + Meta dönüşüm)", () => {
  it("kritik CTA'ları standart funnel event'lerine consent-gated bağlar", () => {
    const src = read("src/lib/cta-tracking.ts");
    // ana dönüşüm + ikincil temas event'leri
    expect(src).toContain("booking_engine_open");
    expect(src).toContain("whatsapp_click");
    expect(src).toContain("phone_click");
    expect(src).toContain("begin_checkout");
    expect(src).toContain("InitiateCheckout");
    expect(src).toContain("Contact");
    // delege listener + consent-gated helper'lar (kendi event'ini basmaz)
    expect(src).toContain('closest("[data-event]")');
    expect(src).toContain("pushEvent");
    expect(src).toContain("fbqTrack");
    // tek-sefer guard
    expect(src).toContain("wired");
  });

  it("bridge client bileşeni null render eder ve layout'a mount edilir", () => {
    const bridge = read("src/components/cta-event-bridge.tsx");
    expect(bridge).toContain('"use client"');
    expect(bridge).toContain("wireCtaTracking");
    expect(bridge).toContain("return null");
    const layout = read("src/app/layout.tsx");
    expect(layout).toContain("CtaEventBridge");
  });
});
