import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

/**
 * Denetimde tespit edilen erişilebilirlik düzeltmelerinin regresyon guard'ı.
 * (Kaynak-grep tabanlı — bileşenleri render etmeden sözleşmeyi sabitler.)
 */
describe("a11y düzeltmeleri (denetim bulguları)", () => {
  it("whatsapp-bridge: ikon-only link aria-label taşır, ikon aria-hidden", () => {
    const src = read("src/components/whatsapp-bridge.tsx");
    expect(src).toContain("aria-label=");
    expect(src).toMatch(/MessageCircle[^/]*aria-hidden/);
  });

  it("payment rooms-step: kart klavye erişilebilir (role=button + onKeyDown + aria-pressed)", () => {
    const src = read("src/components/payment-wizard/steps/rooms-step.tsx");
    expect(src).toContain('role="button"');
    expect(src).toContain("tabIndex={0}");
    expect(src).toContain("aria-pressed={isSelected}");
    expect(src).toContain("onKeyDown=");
  });

  it("payment success-step: dekoratif başarı ikonu aria-hidden", () => {
    const src = read("src/components/payment-wizard/steps/success-step.tsx");
    expect(src).toMatch(/CheckCircle2[^/]*aria-hidden/);
  });

  it("experience progress-bar: role=progressbar + aria-valuenow", () => {
    const src = read("src/components/experience-designer/progress-bar.tsx");
    expect(src).toContain('role="progressbar"');
    expect(src).toContain("aria-valuenow={step}");
    expect(src).toContain("aria-valuemax={4}");
  });

  it("globals.css: lead-form alanlarında :focus-visible klavye halkası var", () => {
    const css = read("src/app/globals.css");
    expect(css).toContain(".lead-form input:focus-visible");
    expect(css).toMatch(/\.lead-form input:focus-visible[\s\S]*?outline:\s*2px solid var\(--gold\)/);
  });
});
