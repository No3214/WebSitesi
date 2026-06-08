## 2024-06-08 - Accessible Icon Buttons
**Learning:** Found several floating and interactive UI elements (digital concierge, audio guide, floating contacts) using icon-only buttons without `aria-label` attributes.
**Action:** Always verify icon-only buttons have dynamic `aria-label`s reflecting their state (e.g. `isMuted ? "Sesi Aç" : "Sesi Kapat"`).
