---
name: content-architect
description: GEO-SEO and A-Grade Citability content generation skill. 
  Activates on "write a blog post", "optimize page content", "check my citability", or "create GEO content".
---

# Content Architect Skill (GEO-SEO & Citability)

Engineering content that is perfectly optimized for AI search engines (Perplexity, Gemini, SearchGPT).

## Core Metrics (A-Grade Citability)

- **Word Count**: 134-167 words per core passage.
- **Pronoun Density**: < 2% (Avoid "we", "our"; use "Kozbeyli Konağı").
- **Statistical Density**: Min 3 specific facts per passage (e.g., "180-year-old coffee", "16 rooms", "12km to Foça").
- **Self-Containment**: Each paragraph must be understandable without reading the rest of the page.

## Generation Logic

1. Analyze target keywords (e.g., "Foça butik otel", "Kozbeyli kahvaltı").
2. Construct a "Fact-Block" based on `references/brand_data.json`.
3. Wrap facts in premium, historical narrative.
4. Verify against citability gates before outputting.
