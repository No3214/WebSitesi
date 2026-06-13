import fs from "node:fs";

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * WCAG erişilebilirlik taraması (T18).
 * Kapsam: ana dönüşüm yolculuğundaki dört sayfa.
 * Eşik: critical + serious ihlal = 0 (moderate/minor raporlanır ama düşürmez).
 */
const PAGES = ["/", "/odalar", "/rezervasyon", "/organizasyonlar", "/en/organizasyonlar", "/sss"];

test.describe("Axe a11y taraması", () => {
  // Yorgun makinede goto+analyze 30sn varsayılanını aşabiliyor
  test.describe.configure({ timeout: 90000 });
  for (const path of PAGES) {
    test(`critical+serious ihlal yok: ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "load", timeout: 60000 });
      // Animasyonlu içeriğin oturması ve çerez bandının render'ı için kısa bekleme
      await page.waitForTimeout(1200);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      // Teşhis: ihlaller dosyaya yazılır (reporter çıktısı kesilse bile okunur)
      fs.mkdirSync("test-results", { recursive: true });
      fs.writeFileSync(
        `test-results/a11y-${path.replace(/\//g, "_") || "_root"}.json`,
        JSON.stringify(
          blocking.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary?.slice(0, 220) })),
          })),
          null,
          1
        )
      );

      if (blocking.length > 0) {
        console.log(
          `\n[a11y] ${path} ihlalleri:\n` +
            blocking
              .map(
                (v) =>
                  `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node)\n` +
                  v.nodes
                    .slice(0, 3)
                    .map((n) => `    ${n.target.join(" ")}`)
                    .join("\n")
              )
              .join("\n")
        );
      }

      expect(blocking).toEqual([]);
    });
  }
});
