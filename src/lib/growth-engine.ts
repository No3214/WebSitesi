type GrowthHealthStatus = "EVIDENCE_GATED";

type DriftToken = {
  token: string;
  purpose: string;
};

const identityTokens: DriftToken[] = [
  { token: "Kozbeyli", purpose: "place identity" },
  { token: "tas", purpose: "stone-house texture" },
  { token: "Ege", purpose: "regional hospitality" },
  { token: "Antakya", purpose: "culinary origin" },
  { token: "Foça", purpose: "location demand" },
];

export const GrowthEngine = {
  checkHealth: () => {
    return {
      status: "EVIDENCE_GATED" as GrowthHealthStatus,
      metrics: {
        commercial_readiness: "82/100",
        blocked_points: "18",
        release_gate: "npm run release:verify",
        cutover_plan: "npm run launch:cutover:json",
      },
      alerts: [
        "Do not mark production ready until external DNS, HMS, POS, analytics, SEO and legal evidence is ready.",
      ],
    };
  },

  runDriftCheck: (currentPath: string, content: string) => {
    const normalizedContent = content.toLocaleLowerCase("tr-TR");
    const tokenResults = identityTokens.map((item) => {
      const normalizedToken = item.token.toLocaleLowerCase("tr-TR");
      return {
        ...item,
        present: normalizedContent.includes(normalizedToken),
      };
    });
    const foundTokens = tokenResults.filter((item) => item.present);
    const missingTokens = tokenResults.filter((item) => !item.present);
    const alignmentScore = foundTokens.length / identityTokens.length;

    return {
      currentPath,
      alignmentScore,
      foundTokens,
      missingTokens,
      suggestion:
        alignmentScore < 0.6
          ? "Review page copy against verified Kozbeyli hospitality evidence before publishing."
          : "Brand evidence alignment is acceptable for this deterministic check.",
    };
  },
};
