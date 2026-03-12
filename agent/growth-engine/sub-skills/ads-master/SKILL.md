---
name: ads-master
description: Advanced 190-check advertising audit and optimization skill. 
  Activates on commands like "/ads audit", "check my meta ads", "optimize google headlines", or "audit my ad budget".
---

# Ads Master Skill (Claude-Ads Inspired)

Perform a granular audit of paid advertising campaigns using weighted scoring and industry-specific benchmarks.

## Audit Workflow

1. **Audit Google Ads (74 Checks)**: Flag Broad Match without Smart Bidding. Check for RSA headline variety.
2. **Audit Meta Ads (46 Checks)**: Verify Pixel/CAPI health. Flag high-frequency (>3.0) on small audiences.
3. **Audit Creative (21 Checks)**: Rate contrast, CTA visibility, and "Stop Power".
4. **Audit Budget (24 Checks)**: Enforce the "3x Kill Rule" (PAUSE if CPA >3x target).

## Optimization Protocol

- **Headlines**: Max 30 chars. Focus on the "19th Century History" + "Modern Luxury" USP.
- **Descriptions**: Max 90 chars. Highlight "Antakya Gastronomy" and "Sea View".
- **Quality Gates**: CPA > Target * 1.5 -> Monitor; CPA > Target * 3 -> Pause and Pivot.
