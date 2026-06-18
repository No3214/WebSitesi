import { describe, expect, it } from "vitest";

import { hotelSchema } from "@/lib/schema";
import { siteUrl } from "@/lib/utils";

describe("hotel structured data", () => {
  it("links to the real menu page and omits unverifiable review schema", () => {
    const [hotel] = hotelSchema();

    expect(hotel).toMatchObject({
      "@type": ["Hotel", "LodgingBusiness", "Restaurant"],
      hasMenu: `${siteUrl}/menu`,
    });
    expect(JSON.stringify(hotel)).toContain("180 Yıllık Taş Dibek Kahvesi");
    expect(JSON.stringify(hotel)).not.toContain("500 Yıllık Taş Dibek Kahvesi");
    expect(hotel).not.toHaveProperty("aggregateRating");
    expect(hotel).not.toHaveProperty("review");
  });
});
