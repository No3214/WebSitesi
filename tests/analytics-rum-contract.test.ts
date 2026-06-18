import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

describe("consent-gated analytics RUM contracts", () => {
  it("documents the public PostHog configuration used by the client", () => {
    const envExample = read(".env.example");
    const publicEnv = read("src/lib/public-env.ts");

    for (const key of ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"]) {
      expect(envExample).toContain(key);
      expect(publicEnv).toContain(key);
    }

    expect(envExample).toContain("https://eu.i.posthog.com");
  });

  it("reports field Web Vitals only through the existing consent gate", () => {
    const reporter = read("src/components/web-vitals-reporter.tsx");
    const analyticsProvider = read("src/components/analytics-provider.tsx");
    const layout = read("src/app/layout.tsx");

    expect(reporter).toContain('useReportWebVitals');
    expect(reporter).toContain('trackEvent("web_vital"');
    expect(reporter).toContain('new Set(["CLS", "FCP", "INP", "LCP", "TTFB"])');
    expect(reporter).toContain("window.location.pathname");
    expect(reporter).not.toContain("window.location.href");
    expect(reporter).not.toContain("window.location.search");
    expect(reporter).not.toContain("document.referrer");

    expect(analyticsProvider).toContain("hasAnalyticsConsent()");
    expect(analyticsProvider).toContain("if (!posthogKey || !hasAnalyticsConsent())");
    expect(layout).toContain('import { WebVitalsReporter }');
    expect(layout).toContain("<WebVitalsReporter />");
  });
});
