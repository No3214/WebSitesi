import { describe, expect, it } from "vitest";

import {
  MOTION_CAPS,
  MOTION_DURATION,
  MOTION_EASING,
  MOTION_STAGGER_MS,
  ms,
} from "@/lib/motion";

describe("Stone & Light motion token sistemi", () => {
  it("sureler master prompt araliklarinda", () => {
    expect(MOTION_DURATION.micro).toBeGreaterThanOrEqual(120);
    expect(MOTION_DURATION.micro).toBeLessThanOrEqual(180);
    expect(MOTION_DURATION.fast).toBeGreaterThanOrEqual(200);
    expect(MOTION_DURATION.fast).toBeLessThanOrEqual(280);
    expect(MOTION_DURATION.standard).toBeGreaterThanOrEqual(420);
    expect(MOTION_DURATION.standard).toBeLessThanOrEqual(650);
    expect(MOTION_DURATION.editorialReveal).toBeGreaterThanOrEqual(700);
    expect(MOTION_DURATION.editorialReveal).toBeLessThanOrEqual(950);
    expect(MOTION_DURATION.routeTransition).toBeGreaterThanOrEqual(250);
    expect(MOTION_DURATION.routeTransition).toBeLessThanOrEqual(450);
    expect(MOTION_STAGGER_MS).toBeGreaterThanOrEqual(60);
    expect(MOTION_STAGGER_MS).toBeLessThanOrEqual(110);
  });

  it("hareket sinirlari premium kapilarini asmiyor", () => {
    expect(MOTION_CAPS.parallaxTravelPx).toBeLessThanOrEqual(24);
    expect(MOTION_CAPS.hoverScale).toBeLessThanOrEqual(1.03);
    expect(MOTION_CAPS.cardTiltDeg).toBeLessThanOrEqual(3);
    expect(MOTION_CAPS.magneticOffsetPx).toBeLessThanOrEqual(6);
  });

  it("easing degerleri gecerli cubic-bezier", () => {
    for (const e of Object.values(MOTION_EASING)) {
      expect(e).toMatch(/^cubic-bezier\(/);
    }
  });

  it("ms() yardimcisi saniyelik CSS string verir", () => {
    expect(ms(520)).toBe("0.52s");
    expect(ms(160)).toBe("0.16s");
  });
});
