import { describe, expect, it } from "vitest";

import { absoluteUrl, siteUrl } from "@/lib/utils";

describe("URL utilities", () => {
  it("keeps siteUrl available as the canonical public origin", () => {
    expect(siteUrl).toMatch(/^https:\/\/.+/);
    expect(siteUrl).not.toMatch(/\/$/);
  });

  it("builds absolute URLs from root-relative paths", () => {
    expect(absoluteUrl("/menu")).toBe(`${siteUrl}/menu`);
    expect(absoluteUrl()).toBe(`${siteUrl}/`);
  });
});
