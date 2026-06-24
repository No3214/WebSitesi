---
version: alpha
name: Kozbeyli Konagi Heritage Hospitality
description: Boutique stone hotel, restaurant and event website design system for Kozbeyli Konagi.
colors:
  primary: "#3D4A3B"
  primaryDeep: "#2C3729"
  accent: "#B3925C"
  accentText: "#6E4B18"
  surface: "#FAF9F6"
  surfaceWarm: "#F0EDE6"
  stone: "#E7E2D6"
  azure: "#2E5D6B"
  ink: "#14161A"
  white: "#FFFFFF"
typography:
  display:
    fontFamily: Playfair Display, Georgia, serif
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: 0
  headline:
    fontFamily: Playfair Display, Georgia, serif
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: 0
  body:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0
  labelCaps:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.12em
rounded:
  sm: 4px
  md: 8px
  lg: 12px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
components:
  buttonPrimary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 14px
  buttonSecondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: 14px
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 24px
  heroOverlay:
    backgroundColor: "{colors.primaryDeep}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: 24px
  warmSection:
    backgroundColor: "{colors.surfaceWarm}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 32px
  stoneNote:
    backgroundColor: "{colors.stone}"
    textColor: "{colors.accentText}"
    rounded: "{rounded.sm}"
    padding: 16px
  locationLink:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.azure}"
    rounded: "{rounded.sm}"
    padding: 8px
---

# Kozbeyli Konagi Design System

## Overview

Kozbeyli Konagi should feel like a restored stone mansion in morning light: calm, premium, tactile and local. The interface is a hospitality tool, not a generic landing page. Guests should be able to inspect rooms, food, events, location and booking actions with minimal friction.

The visual reference is an Aegean stone hotel editorial system: warm limestone surfaces, olive typography, restrained gold actions, real property media and quiet whitespace. The design can be rich, but it should never become heavy, nightclub-dark, synthetic, or stock-like.

## Colors

The primary palette is olive, stone, warm white and restrained gold. Use dark ink only for readable body text and overlays that need contrast.

- **Olive {colors.primary}:** brand authority, headings, navigation and calm structural UI.
- **Gold {colors.accent}:** primary booking and contact actions only; do not overuse it as decoration.
- **Warm surfaces {colors.surface}, {colors.surfaceWarm}, {colors.stone}:** default page backgrounds and large section bands.
- **Azure {colors.azure}:** sparing local-sea support tone, not a dominant theme.
- **Ink {colors.ink}:** text and controlled overlays; avoid full-page black sections unless media contrast requires it.

## Typography

Headlines use the serif voice for heritage and hospitality. Body and utility text use Inter for fast scanning. Letter spacing must not be negative. Label caps can use generous spacing, but only for short eyebrow text.

## Layout

Use full-width warm sections with constrained inner content. Keep product-inspection pages light so room, food and event media remain clear. Cards are for repeated items, forms and framed tools; avoid cards nested inside cards.

Desktop layouts should preserve generous side margins. Mobile layouts should give text enough inset padding so no copy appears glued to the viewport edge.

## Elevation & Depth

Depth comes from tonal layering, hairline borders and soft shadows. Avoid heavy black backgrounds, glass gimmicks, glow effects and decorative gradient blobs.

## Shapes

Use 4px to 8px radii for buttons, cards and controls. Reserve larger round shapes for icon-only floating controls where the existing system already uses them.

## Components

Primary CTAs are reservation, WhatsApp/contact, route/location and event proposal actions. Booking CTAs should open the official HMS booking engine in a new tab when configured.

Media components must use real Kozbeyli Konagi property, food, room, event or approved brand assets. Do not use generated or uncertain imagery as proof of the hotel, rooms, food, weddings or team.

## Do's and Don'ts

- Do keep public claims evidence-gated: 500-year village history, pet-friendly policy, open parking and reception until 24:00 must stay consistent.
- Do make menu and room pricing conservative when live HMS/CMS evidence is missing.
- Do use real video/image probes before claiming a media file is production-ready.
- Do keep Turkish and English pages equivalent in promises, pricing caveats and booking behavior.
- Don't publish fake urgency, fake social proof, generated hotel imagery, unsupported 24/7 reception claims, or fixed cancellation promises.
- Don't let dark theme sections dominate rooms, gastronomy or product-inspection pages.
