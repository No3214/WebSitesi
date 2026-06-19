import { test, expect } from "@playwright/test";

test.skip(!!process.env.PW_BASE_URL, "Stres/monkey testleri canli prod ortaminda kosulmaz");

function seededRandom(seed = 20260619) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

test('Extreme Monkey Test: Destructive Chaos', async ({ page, baseURL }) => {
  test.setTimeout(90000);
  const random = seededRandom();

  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Only ignore things that are truly beyond our control (third party script errors not in our domain)
      if (
        !text.includes('favicon.ico') && 
        !text.includes('Failed to load resource') && 
        !text.includes('responded with a status of')
      ) {
        errors.push(text);
        console.error(`[CHAOS ERROR]: ${text}`);
      }
    }
  });

  page.on('pageerror', exception => {
    console.error(`[UNCAUGHT EXCEPTION]: ${exception.message}`);
    errors.push(exception.message);
  });

  const base = baseURL || 'http://localhost:3006';
  await page.goto(base, { waitUntil: 'load' });
  
  const interactions = 35; // Violent stress
  const urls = ['/', '/gastronomi', '/hikayemiz', '/odalar', '/organizasyonlar'];
  
  console.log('--- STARTING DESTRUCTIVE CHAOS seed=20260619 ---');

  for (let i = 0; i < interactions; i++) {
    // 1. Violent Navigation & Back/Forward
    if (random() > 0.9) {
      const url = urls[Math.floor(random() * urls.length)];
      await page.goto(`${base}${url}`);
    } else if (random() > 0.95) {
      await page.goBack();
    }

    // 2. High-Speed Scrolling (Rapid reversals)
    await page.mouse.wheel(0, i % 2 === 0 ? 8000 : -8000);

    // 3. Brutal Click Injection (Everywhere, not just interactive)
    const x = Math.floor(random() * 1280);
    const y = Math.floor(random() * 720);
    await page.mouse.click(x, y);

    // 4. Force clicks on all circles (Map Stress)
    const circles = page.locator('circle');
    const cCount = await circles.count();
    if (cCount > 0 && random() > 0.7) {
      await circles.nth(Math.floor(random() * cCount)).click({ force: true, timeout: 500 }).catch(() => {});
    }

    // 5. Verification: Critical failures check
    if (errors.length > 5) {
      throw new Error(`System reported ${errors.length} client errors during chaos test`);
    }
    
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(50); // Minimal wait to maximize speed
  }
  
  console.log('--- CHAOS SURVIVED ---');
});
