import { optimizeCampaign, AdPerformance } from "@/lib/agents/ad-optimizer";

// Example Data
const mockStats: AdPerformance[] = [
  { id: "A1", headline: "Otelimiz Çok Güzel", description: "Gelin kalın bence.", ctr: 0.8, conversions: 2 },
  { id: "A2", headline: "Tarihi Butik Otel", description: "Foça'da konaklayın.", ctr: 2.5, conversions: 15 }
];

optimizeCampaign(mockStats);
