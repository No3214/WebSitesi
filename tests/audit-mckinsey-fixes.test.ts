import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relPath: string) => fs.readFileSync(path.join(root, relPath), "utf8");

/**
 * REGRESYON KİLİDİ — McKinsey-seviye final audit düzeltmeleri.
 * Her describe bloğu, denetimde bulunan gerçek bir eksiği ve uygulanan
 * production-safe düzeltmeyi kilitler. Kanıt: ilgili dosya.
 */

describe("a11y kontrast — eyebrow/kpi/menu etiketleri AA token kullanır (WCAG 1.4.3)", () => {
  const globals = read("src/app/globals.css");

  it("temel .eyebrow düşük kontrastlı --gold yerine --gold-text kullanır", () => {
    const match = globals.match(/\n {2}\.eyebrow \{[^}]*\}/);
    expect(match).not.toBeNull();
    expect(match![0]).toContain("color: var(--gold-text)");
    expect(match![0]).not.toContain("color: var(--gold);");
  });

  it(".kpi-row span etiketleri --gold-text kullanır", () => {
    const match = globals.match(/\.kpi-row span \{[^}]*\}/);
    expect(match).not.toBeNull();
    expect(match![0]).toContain("color: var(--gold-text)");
    expect(match![0]).not.toContain("color: var(--gold);");
  });

  it(".gastronomy-menu-card small meta etiketleri --gold-text kullanır", () => {
    const match = globals.match(/\.gastronomy-menu-card small \{[^}]*\}/);
    expect(match).not.toBeNull();
    expect(match![0]).toContain("color: var(--gold-text)");
    expect(match![0]).not.toContain("color: var(--gold);");
  });
});

describe("a11y exit-intent modal — klavye erişilebilirliği (WCAG 2.1.1 / 2.4.3)", () => {
  const exitIntent = read("src/components/exit-intent.tsx");

  it("Escape ile kapanır", () => {
    expect(exitIntent).toContain('event.key === "Escape"');
  });

  it("açıkken body scroll kilitlenir", () => {
    expect(exitIntent).toContain('document.body.style.overflow = "hidden"');
  });

  it("kapanışta odak tetikleyiciye geri döner", () => {
    expect(exitIntent).toContain("lastFocusedRef.current?.focus?.()");
  });

  it("Tab odağı diyalog içinde hapsedilir", () => {
    expect(exitIntent).toContain('event.key !== "Tab"');
  });
});

describe("SEO — oda detay sayfaları reciprocal canonical + hreflang yayar", () => {
  it("TR /odalar/[slug] altLanguages ile reciprocal hreflang verir", () => {
    const tr = read("src/app/odalar/[slug]/page.tsx");
    expect(tr).toContain("altLanguages(`/odalar/${slug}`, `/en/rooms/${slug}`)");
  });

  it("EN /en/rooms/[slug] altLanguagesEn ile reciprocal hreflang verir", () => {
    const en = read("src/app/en/rooms/[slug]/page.tsx");
    expect(en).toContain("altLanguagesEn(`/odalar/${slug}`, `/en/rooms/${slug}`)");
  });
});

describe("SEO — EN içerik sayfaları en_US OG locale + reciprocal hreflang", () => {
  const pages = [
    "src/app/en/deneyimler/page.tsx",
    "src/app/en/gastronomi/page.tsx",
    "src/app/en/hikayemiz/page.tsx",
    "src/app/en/odalar/page.tsx",
    "src/app/en/organizasyonlar/page.tsx",
  ];

  it("her sayfa enOpenGraph + altLanguagesEn kullanır", () => {
    for (const page of pages) {
      const src = read(page);
      expect(src, page).toContain("enOpenGraph(");
      expect(src, page).toContain("altLanguagesEn(");
    }
  });

  it("enOpenGraph helper en_US locale + siteName + type set eder", () => {
    const meta = read("src/lib/metadata.ts");
    expect(meta).toContain('locale: "en_US"');
    expect(meta).toContain('siteName: "Kozbeyli Konağı"');
    expect(meta).toContain('type: "website"');
  });
});

describe("a11y payment-wizard — reduced motion + hata duyurusu (WCAG 2.3.3 / 4.1.3)", () => {
  const steps = [
    "src/components/payment-wizard/steps/dates-step.tsx",
    "src/components/payment-wizard/steps/rooms-step.tsx",
    "src/components/payment-wizard/steps/sensory-step.tsx",
    "src/components/payment-wizard/steps/payment-step.tsx",
    "src/components/payment-wizard/steps/success-step.tsx",
  ];

  it("her adım framer-motion transformlarını useReducedMotion ile geçitler", () => {
    for (const step of steps) {
      const src = read(step);
      expect(src, step).toContain("useReducedMotion");
      expect(src, step).toContain("shouldReduce ? false :");
    }
  });

  it("payment adımı submit hatasını role=alert + alan aria ile duyurur", () => {
    const src = read("src/components/payment-wizard/steps/payment-step.tsx");
    expect(src).toContain('role="alert"');
    expect(src).toContain("aria-invalid={invalid}");
    expect(src).toContain("aria-describedby={describedBy}");
  });
});

describe("güvenlik — CSP default-src 'self' temeli + style-src kilidi", () => {
  const nextConfig = read("next.config.ts");

  it("next.config CSP default-src 'self' içerir", () => {
    expect(nextConfig).toContain('"default-src \'self\'"');
  });

  it("next.config CSP style-src 'self' 'unsafe-inline' içerir", () => {
    expect(nextConfig).toContain('"style-src \'self\' \'unsafe-inline\'"');
  });

  it("worker-src/font-src/manifest-src self temeline çekilir", () => {
    expect(nextConfig).toContain('"worker-src \'self\' blob:"');
    expect(nextConfig).toContain('"font-src \'self\' data:"');
    expect(nextConfig).toContain('"manifest-src \'self\'"');
  });
});
