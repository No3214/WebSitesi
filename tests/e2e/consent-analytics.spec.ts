import { expect, test } from "@playwright/test";

test.describe("Analytics consent", () => {
  test("does not contact PostHog before analytics consent", async ({ page }) => {
    const analyticsRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (/posthog|i\.posthog|eu\.i\.posthog/i.test(url)) {
        analyticsRequests.push(url);
      }
    });

    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1200);

    expect(analyticsRequests).toEqual([]);
  });
});
