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
    const cookiePolicy = read("src/app/cerez-politikasi/page.tsx");
    const runbook = read("docs/real-user-monitoring.md");

    for (const key of ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"]) {
      expect(envExample).toContain(key);
      expect(publicEnv).toContain(key);
    }

    expect(envExample).toContain("https://eu.i.posthog.com");
    expect(cookiePolicy).toContain("PostHog");
    expect(cookiePolicy).toContain("gerçek kullanıcı site performansı");
    expect(cookiePolicy).toContain("Açık rıza");
    expect(runbook).toContain("IP data capture");
    expect(runbook).toContain("before_send");
  });

  it("reports field Web Vitals only through the existing consent gate", () => {
    const reporter = read("src/components/web-vitals-reporter.tsx");
    const analyticsProvider = read("src/components/analytics-provider.tsx");
    const layout = read("src/app/layout.tsx");

    expect(reporter).toContain("useReportWebVitals");
    expect(reporter).toContain("const reportWebVitals");
    expect(reporter).toContain("useReportWebVitals(reportWebVitals)");
    expect(reporter).toContain("trackEvent(\"web_vital\"");
    expect(reporter).toContain("CLS\", \"FCP\", \"INP\", \"LCP\", \"TTFB");
    expect(reporter).toContain("window.location.pathname");
    expect(reporter).not.toContain("window.location.href");
    expect(reporter).not.toContain("window.location.search");
    expect(reporter).not.toContain("document.referrer");

    expect(analyticsProvider).toContain("hasAnalyticsConsent()");
    expect(analyticsProvider).toContain("if (!posthogKey || !hasAnalyticsConsent())");
    expect(layout).toContain("import { WebVitalsReporter }");
    expect(layout).toContain("<WebVitalsReporter />");
  });

  it("keeps PostHog limited to manual, privacy-minimized analytics", () => {
    const analyticsProvider = read("src/components/analytics-provider.tsx");

    expect(analyticsProvider).toContain("autocapture: false");
    expect(analyticsProvider).toContain("capture_pageview: false");
    expect(analyticsProvider).toContain("capture_pageleave: false");
    expect(analyticsProvider).toContain("disable_session_recording: true");
    expect(analyticsProvider).toContain("before_send:");
    expect(analyticsProvider).toContain("sanitizePostHogProperties");
    expect(analyticsProvider).toContain("$current_url");
    expect(analyticsProvider).toContain("$referrer");
    expect(analyticsProvider).toContain("$initial_current_url");
    expect(analyticsProvider).toContain("$utm_");
    expect(analyticsProvider).toContain("$initial_utm_");
    expect(analyticsProvider).toContain("$set_once");
    expect(analyticsProvider).toContain("$fbclid");
    expect(analyticsProvider).not.toContain("window.location.href");
    expect(analyticsProvider).not.toContain("document.referrer");
  });
});
