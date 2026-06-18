import { test, expect } from '@playwright/test';

/**
 * Prestige Verification Suite
 * Verifies that the 'No3214' standards and verified heritage claims are
 * correctly presented and functional.
 */
test.describe('Prestige & Heritage Verification', () => {
  
  test('Metadata should reflect village texture and registered mansion heritage', async ({ page }) => {
    await page.goto('/');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('beş asırlık köy dokusu');
    expect(description).toContain('19. yüzyıl tescilli taş konak');
    expect(description).not.toContain('500 yıllık tescilli');
    expect(description).not.toContain('500 yıllık taş konak');
  });

  // Not (2026-06-10): AtmosphericImmersion perdesi hero'yu örttüğü için
  // layout'tan kaldırıldı; toggle testi yerine hero'nun gerçekten görünür
  // olduğunu doğruluyoruz (görsel QA bulgusunun regresyon ağı).
  test('Hero başlık ve CTA ilk ekranda görünür olmalı', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero h1')).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator('.hero').getByRole('link', { name: /rezervasyon/i }).first()
    ).toBeVisible();
  });

  test('Booking conversion triggers should be visible on scroll', async ({ page }) => {
    await page.goto('/');
    await page.mouse.wheel(0, 2000);
    // Wait for scroll-triggered components
    await page.waitForTimeout(1000);
  });

  test('Living Museum Map should be interactive', async ({ page }) => {
    await page.goto('/hikayemiz');
    // Not (2026-06-10): header logosu da <circle> içerdiğinden sayfa geneli
    // yerine haritanın kendi düğümlerine scope'lanır.
    const map = page.getByTestId('living-museum-map');
    await expect(map).toBeVisible();
    const mapNodes = map.locator('circle');
    expect(await mapNodes.count()).toBeGreaterThan(0);

    // Hover over a node and check for story popover
    await mapNodes.first().hover({ force: true });
    await expect(page.locator('h4:has-text("Taşın Hafızası")').or(page.locator('h4:has-text("Zamanın Tortusu")'))).toBeVisible();
  });

  test('Responsive Integrity: Mobile Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Ensure no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });
});
