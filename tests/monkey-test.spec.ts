import { test, expect } from "@playwright/test";

test.skip(!!process.env.PW_BASE_URL, "Stres/monkey testleri canli prod ortaminda kosulmaz");

test('Monkey Test: Chaos & Stability Verification', async ({ page, baseURL }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore favicon, hydration warnings, and network resource failures
      if (
        !text.includes('favicon.ico') && 
        !text.includes('Next.js hydration') &&
        !text.includes('Failed to load resource') &&
        !text.includes('responded with a status of')
      ) {
        errors.push(text);
        console.error(`[CONSOLE ERROR]: ${text}`);
      }
    }
  });

  const base = baseURL || 'http://localhost:3006';
  await page.goto(base);
  
  const interactions = 30; // Reduce for faster debugging
  const urls = ['/', '/gastronomi', '/hikayemiz', '/odalar', '/organizasyonlar'];
  
  for (let i = 0; i < interactions; i++) {
    if (Math.random() > 0.85) {
      const url = urls[Math.floor(Math.random() * urls.length)];
      await page.goto(`${base}${url}`, { waitUntil: 'domcontentloaded' });
    }
    
    await page.mouse.wheel(0, Math.random() > 0.5 ? 2000 : -2000);
    
    const interactive = page.locator('button, a, circle, [role="button"]');
    const count = await interactive.count();
    if (count > 0) {
      const index = Math.floor(Math.random() * count);
      try {
        await interactive.nth(index).click({ timeout: 300, force: true });
      } catch {}
    }
    
    expect(errors.length).toBe(0);
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(100);
  }
});
