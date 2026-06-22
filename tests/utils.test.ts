import { afterEach, describe, expect, it, vi } from "vitest";

import { absoluteUrl, siteUrl } from "@/lib/utils";

describe("URL utilities", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("keeps siteUrl available as the canonical public origin", () => {
    expect(siteUrl).toBe("https://www.kozbeylikonagi.com");
    expect(siteUrl).not.toMatch(/\/$/);
  });

  it("builds absolute URLs from root-relative paths", () => {
    expect(absoluteUrl("/menu")).toBe(`${siteUrl}/menu`);
    expect(absoluteUrl()).toBe(`${siteUrl}/`);
  });

  it("normalizes env origins and relative paths without duplicate slashes", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.kozbeylikonagi.com///");

    const utils = await import("@/lib/utils");

    expect(utils.siteUrl).toBe("https://www.kozbeylikonagi.com");
    expect(utils.absoluteUrl("menu")).toBe("https://www.kozbeylikonagi.com/menu");
    expect(utils.absoluteUrl("")).toBe("https://www.kozbeylikonagi.com/");
  });
});
