import { describe, expect, it } from "vitest";

import { optimizeCampaign } from "@/lib/agents/ad-optimizer";
import { LeadService } from "@/lib/ai/lead-service";

describe("agentic helper safety", () => {
  it("returns ad copy recommendations without generating media assets", () => {
    const report = optimizeCampaign([
      {
        id: "ad-low-ctr",
        headline: "Foça otel",
        description: "Konaklayın.",
        ctr: 0.8,
        conversions: 2,
      },
    ]);

    expect(report.status).toBe("review_required");
    expect(report.generatedAssets).toEqual([]);
    expect(report.recommendations).toEqual([
      expect.objectContaining({
        id: "ad-low-ctr",
        mediaPolicy: "copy-only-review",
      }),
    ]);
  });

  it("keeps CRM writes disabled outside the verified lead API route", async () => {
    const result = await LeadService.syncLeadToCRM({
      guests: 120,
      intent: "immediate",
      score: 90,
      budget: 300000,
    });

    expect(result).toMatchObject({
      success: false,
      writesPerformed: 0,
      reason: "CRM writes are disabled in LeadService; submit through /api/lead.",
      redactedSummary: {
        guests: 120,
        intent: "immediate",
        score: 90,
        hasBudget: true,
      },
    });
    expect(JSON.stringify(result)).not.toContain("lead_");
  });
});
