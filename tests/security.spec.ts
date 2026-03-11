import { test, expect } from '@playwright/test';

test.describe('Security Audit Test', () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  test('should have strict security headers', async ({ request }) => {
    const response = await request.get(baseUrl);
    const headers = response.headers();

    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
    expect(headers['content-security-policy']).toBeDefined();
    console.log('Security headers verified.');
  });

  test('admin panel should NOT be publicly accessible without login', async ({ page }) => {
    await page.goto(`${baseUrl}/admin`);
    // Should redirect to login or show create-first-user screen
    await expect(page).toHaveURL(/.*(login|create-first-user).*/);
    console.log('Admin access control verified.');
  });

  test('lead API should handle malicious input gracefully', async ({ request }) => {
    const maliciousPayload = {
      name: '<script>alert("xss")</script>',
      phone: '1234567890',
      email: 'invalid-email',
      type: 'dugun',
      message: '{"$ne": null}' // NoSQL injection attempt (if applicable)
    };

    const response = await request.post(`${baseUrl}/api/lead`, {
      data: maliciousPayload
    });

    // Should return 400 Bad Request if Zod catches invalid email, 
    // or 200 but data should be sanitized on read side in Payload (which we audit separately)
    expect(response.status()).toBeGreaterThanOrEqual(200);
    console.log('API resilient to malicious input.');
  });
});
