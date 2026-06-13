import { expect, test, type Page } from "@playwright/test";

test.skip(!!process.env.PW_BASE_URL, "Stres/monkey testleri canli prod ortaminda kosulmaz");

const routes = ["/", "/odalar", "/menu", "/organizasyonlar", "/galeri", "/rezervasyon"];

function seededRandom(seed = 20260613) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function collectClientErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") return;

    const text = message.text();
    if (
      text.includes("favicon.ico") ||
      text.includes("Failed to load resource") ||
      text.includes("net::ERR_ABORTED") ||
      text.includes("ERR_BLOCKED_BY_CLIENT")
    ) {
      return;
    }

    errors.push(text);
  });

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  return errors;
}

async function assertPageStillHealthy(page: Page, errors: string[]) {
  await expect(page.locator("body")).toBeVisible();
  const bodyText = (await page.locator("body").innerText({ timeout: 3000 })).trim();

  expect(bodyText.length, "Body should not become blank during monkey interactions").toBeGreaterThan(80);
  expect(bodyText, "Next.js runtime error shell should not render").not.toMatch(/Application error|Unhandled Runtime Error/i);
  expect(errors, errors.join("\n")).toEqual([]);
}

async function runMonkey(page: Page, iterations: number, seed: number) {
  const random = seededRandom(seed);
  const errors = collectClientErrors(page);

  await page.goto("/", { waitUntil: "load" });
  await assertPageStillHealthy(page, errors);

  for (let i = 0; i < iterations; i += 1) {
    const action = ["click", "scroll", "hover", "navigate"][Math.floor(random() * 4)];

    if (action === "click") {
      const elements = page.locator('button:not([disabled]), a[href^="/"], a[href^="#"]');
      const count = await elements.count();
      if (count > 0) {
        await elements.nth(Math.floor(random() * count)).click({ force: true, timeout: 1500 }).catch(() => {});
      }
    }

    if (action === "scroll") {
      await page.mouse.wheel(0, random() > 0.5 ? 900 : -700);
    }

    if (action === "hover") {
      const elements = page.locator("main, section, article, img, video");
      const count = await elements.count();
      if (count > 0) {
        await elements.nth(Math.floor(random() * count)).hover({ force: true, timeout: 1500 }).catch(() => {});
      }
    }

    if (action === "navigate") {
      await page.goto(routes[Math.floor(random() * routes.length)], { waitUntil: "load" });
    }

    await assertPageStillHealthy(page, errors);
    await page.waitForTimeout(120);
  }
}

test.describe("Monkey stability", () => {
  test("desktop survives deterministic random interactions", async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await runMonkey(page, 45, 20260613);
  });

  test("mobile survives deterministic random interactions", async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 390, height: 844 });
    await runMonkey(page, 36, 20260614);
  });
});
