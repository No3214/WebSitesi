## 2026-06-13 - Accessible Icon Buttons
**Learning:** Icon-only buttons (like the floating contact trigger, audio guide play/pause, and digital concierge close buttons) lacked `aria-label` attributes, making them inaccessible to screen readers. The primary language of the application is Turkish.
**Action:** Always add descriptive `aria-label`s in Turkish to icon-only interactive elements and use `aria-controls` / `aria-expanded` for toggleable menus.
