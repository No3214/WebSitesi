import { test, expect } from '@playwright/test';

test('Extreme Monkey Test: Destructive Chaos', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Only ignore things that are truly beyond our control (third party script errors not in our domain)
      if (!text.includes('favicon.ico')) {
        errors.push(text);
        console.error(`[CHAOS ERROR]: ${text}`);
      }
    }
  });

  page.on('pageerror', exception => {
    console.error(`[UNCAUGHT EXCEPTION]: ${exception.message}`);
    errors.push(exception.message);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  const interactions = 100; // Violent stress
  const urls = ['/', '/gastronomi', '/hikayemiz', '/odalar', '/organizasyonlar'];
  
  console.log('--- STARTING DESTRUCTIVE CHAOS ---');

  for (let i = 0; i < interactions; i++) {
    // 1. Violent Navigation & Back/Forward
    if (Math.random() > 0.9) {
      const url = urls[Math.floor(Math.random() * urls.length)];
      await page.goto(`http://localhost:3000${url}`);
    } else if (Math.random() > 0.95) {
      await page.goBack();
    }

    // 2. High-Speed Scrolling (Rapid reversals)
    await page.mouse.wheel(0, i % 2 === 0 ? 8000 : -8000);

    // 3. Brutal Click Injection (Everywhere, not just interactive)
    const x = Math.floor(Math.random() * 1280);
    const y = Math.floor(Math.random() * 720);
    await page.mouse.click(x, y);

    // 4. Force clicks on all circles (Map Stress)
    const circles = page.locator('circle');
    const cCount = await circles.count();
    if (cCount > 0 && Math.random() > 0.7) {
      await circles.nth(Math.floor(Math.random() * cCount)).click({ force: true, timeout: 500 }).catch(() => {});
    }

    // 5. Verification: Critical failures check
    if (errors.length > 5) {
      throw new Error(`System exploded with ${errors.length} errors during chaos!`);
    }
    
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(50); // Minimal wait to maximize speed
  }
  
  console.log('--- CHAOS SURVIVED ---');
});
