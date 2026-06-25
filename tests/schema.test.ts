import { describe, expect, it } from "vitest";

import { operationalPolicies } from "@/data/operational-policies";
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
    expect(JSON.stringify(hotel)).toContain("Açık otopark alanı ve varış yönlendirmesi");
    expect(JSON.stringify(hotel)).toContain(operationalPolicies.tr.pets);
    expect(JSON.stringify(hotel)).not.toContain("Ücretsiz Otopark");
    expect(JSON.stringify(hotel)).not.toContain("Evcil Hayvan Dostu");
    expect(hotel).not.toHaveProperty("aggregateRating");
    expect(hotel).not.toHaveProperty("review");
    expect(hotel).not.toHaveProperty("starRating");
    expect(hotel).not.toHaveProperty("award");
  });
});
