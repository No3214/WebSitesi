import { SPECIALIST_KNOWLEDGE } from "@/lib/ai/specialist-hospitality";

export interface AdPerformance {
  id: string;
  headline: string;
  description: string;
  ctr: number;
  conversions: number;
}

export interface AdRecommendation {
  id: string;
  currentHeadline: string;
  reason: string;
  proposedHeadline: string;
  proposedDescription: string;
  mediaPolicy: "copy-only-review";
}

export interface AdOptimizationReport {
  status: "review_required" | "no_action";
  thresholdCtr: number;
  generatedAssets: [];
  recommendations: AdRecommendation[];
}

const LOW_CTR_THRESHOLD = 1.5;

export function optimizeCampaign(data: AdPerformance[]): AdOptimizationReport {
  const underperforming = data.filter((ad) => ad.ctr < LOW_CTR_THRESHOLD);

  const gastronomyTokens = SPECIALIST_KNOWLEDGE.gastronomy.signature_tokens;
  const architectureTokens = SPECIALIST_KNOWLEDGE.local_expert.signature_tokens;

  const recommendations = underperforming.map((ad) => ({
    id: ad.id,
    currentHeadline: ad.headline,
    reason: `CTR ${ad.ctr}% is below ${LOW_CTR_THRESHOLD}%. Human review is required before publishing.`,
    proposedHeadline: `Kozbeyli'de ${gastronomyTokens[0]}`,
    proposedDescription: `${architectureTokens[0]} yapıda ${gastronomyTokens[2]} lezzeti. Mirasımızı keşfedin.`,
    mediaPolicy: "copy-only-review" as const,
  }));

  return {
    status: recommendations.length > 0 ? "review_required" : "no_action",
    thresholdCtr: LOW_CTR_THRESHOLD,
    generatedAssets: [],
    recommendations,
  };
}
