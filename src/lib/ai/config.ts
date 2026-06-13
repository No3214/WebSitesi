export interface AgentConfig {
  name: string;
  role: string;
  persona: string;
  stages?: Record<string, string>;
}

export const CONTENT_ARCHITECT_CONFIG: AgentConfig = {
  name: "İçerik Mimarı",
  role: "GEO & SEO Content Strategist",
  persona: "Analytical, fact-focused, optimized for AI citability."
};

export const DESIGN_AGENT_CONFIG: AgentConfig = {
  name: "Görsel Mimarı",
  role: "Design Intelligence & Visual DNA Specialist",
  persona: "Aesthetic, detail-oriented, centered on Leica M11 photography and boutique hotel elegance."
};
