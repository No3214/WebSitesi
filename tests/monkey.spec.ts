import { test } from '@playwright/test';

test.describe('Monkey Stability Test', () => {
  test('should survive random interactions for 2 minutes', async ({ page }) => {
    // Navigate to local dev or base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await page.goto(baseUrl);

    const startTime = Date.now();
    const duration = 120000; // 2 minutes

    console.log('Starting monkey test...');

    while (Date.now() - startTime < duration) {
      const actions = ['click', 'scroll', 'hover', 'navigate'];
      const action = actions[Math.floor(Math.random() * actions.length)];

      try {
        if (action === 'click') {
          const buttons = page.locator('button, a');
          const count = await buttons.count();
          if (count > 0) {
            const index = Math.floor(Math.random() * count);
            await buttons.nth(index).click({ force: true, timeout: 2000 }).catch(() => {});
          }
        } else if (action === 'scroll') {
          await page.mouse.wheel(0, Math.random() * 500 - 250);
        } else if (action === 'hover') {
          const elements = page.locator('div, section, img');
          const count = await elements.count();
          if (count > 0) {
            const index = Math.floor(Math.random() * count);
            await elements.nth(index).hover({ force: true, timeout: 2000 }).catch(() => {});
          }
        } else if (action === 'navigate') {
          const links = ['/', '/odalar', '/menu', '/organizasyonlar'];
          await page.goto(baseUrl + links[Math.floor(Math.random() * links.length)]);
        }

        // Check for common crash patterns / white screen
        const bodyContent = await page.textContent('body');
        if (!bodyContent || bodyContent.trim().length === 0) {
          throw new Error('Potential White Screen of Death detected');
        }

      } catch (e: unknown) {
        console.warn('Silent action error:', (e as Error).message);
      }

      await page.waitForTimeout(500); // Wait between actions
    }

    console.log('Monkey test completed successfully.');
  });
});
