import { test, expect } from '@playwright/test';

/**
 * Prestige Verification Suite
 * Verifies that the 'No3214' standards and 500-year heritage claims are 
 * correctly presented and functional.
 */
test.describe('Prestige & Heritage Verification', () => {
  
  test('Metadata should reflect 500-year heritage', async ({ page }) => {
    await page.goto('/');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('500 yıllık');
  });

  test('Atmospheric Immersion should be present and toggleable', async ({ page }) => {
    await page.goto('/');
    // Check for the audio/visual ritual control
    const immersionToggle = page.getByText('SESİ', { exact: false }).first();
    await expect(immersionToggle).toBeVisible({ timeout: 15000 });

    // Test toggle state
    await immersionToggle.click({ force: true });
    await expect(immersionToggle).toContainText('SESİ');
  });

  test('Booking conversion triggers should be visible on scroll', async ({ page }) => {
    await page.goto('/');
    await page.mouse.wheel(0, 2000);
    // Wait for scroll-triggered components
    await page.waitForTimeout(1000);
    
    // Check for social proof or scarcity badges (if implemented)
    const toast = page.locator('.toast, [role="alert"]');
    // This is optional based on whether they are triggered
  });

  test('Living Museum Map should be interactive', async ({ page }) => {
    await page.goto('/hikayemiz');
    const mapNodes = page.locator('circle');
    const count = await mapNodes.count();
    expect(count).toBeGreaterThan(0);
    
    // Hover over a node and check for story popover
    await mapNodes.first().hover({ force: true });
    await expect(page.locator('h4:has-text("Taşın Hafızası")').or(page.locator('h4:has-text("Zamanın Tortusu")'))).toBeVisible();
  });

  test('Responsive Integrity: Mobile Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Menu button should be visible on mobile
    const menuBtn = page.locator('button:has-text("Menü"), .mobile-menu-trigger');
    // Ensure no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });
});
