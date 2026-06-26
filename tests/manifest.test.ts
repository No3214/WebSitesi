import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("PWA web manifest", () => {
  it("eksiksiz PWA alanları + çözülebilir ikon içerir", () => {
    const m = manifest();
    expect(m.name).toContain("Kozbeyli Konağı");
    expect(m.short_name).toBeTruthy();
    expect(m.display).toBe("standalone");
    expect(m.start_url).toBe("/");
    expect(m.scope).toBe("/");
    expect(m.lang).toBe("tr");
    expect(m.dir).toBe("ltr");
    expect(m.theme_color).toBeTruthy();
    expect(m.background_color).toBeTruthy();
    expect((m.categories ?? []).length).toBeGreaterThan(0);
    // ikon Next.js app-router konvansiyonundan /icon.svg olarak çözülür
    expect(m.icons?.[0]?.src).toBe("/icon.svg");
  });
});
