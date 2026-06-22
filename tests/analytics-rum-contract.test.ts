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
    const readme = read("README.md");
    const cookiePolicy = read("src/app/cerez-politikasi/page.tsx");
    const runbook = read("docs/real-user-monitoring.md");

    for (const key of ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"]) {
      expect(envExample).toContain(key);
      expect(publicEnv).toContain(key);
      expect(readme).toContain(key);
    }

    expect(envExample).toContain("https://eu.i.posthog.com");
    expect(readme).toContain("docs/real-user-monitoring.md");
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

  it("lets guests reopen and change optional cookie consent after the first choice", () => {
    const consent = read("src/lib/consent.ts");
    const cookieConsent = read("src/components/cookie-consent.tsx");
    const footer = read("src/components/site-footer.tsx");
    const cookiePolicy = read("src/app/cerez-politikasi/page.tsx");

    expect(consent).toContain('CONSENT_OPEN_EVENT = "consent:open"');
    expect(consent).toContain("openConsentPreferences");
    expect(cookieConsent).toContain("window.addEventListener(CONSENT_OPEN_EVENT");
    expect(cookieConsent).toContain("setIsExpanded(true)");
    expect(footer).toContain("CookiePreferencesButton");
    expect(footer).toContain("Çerez Tercihleri");
    expect(footer).toContain("Cookie Preferences");
    expect(cookiePolicy).toContain("Çerez Tercihlerini Aç");
    expect(cookiePolicy).not.toContain("kaydı silerek bandı yeniden görüntüleyebilir");
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

  it("keeps GTM and Meta event helpers fail-closed after consent withdrawal", () => {
    const gtm = read("src/lib/gtm.ts");

    expect(gtm).toContain("hasOptionalConsent");
    expect(gtm).toContain('hasOptionalConsent("analytics")');
    expect(gtm).toContain('hasOptionalConsent("marketing")');
    expect(gtm).toContain("globalThis.localStorage?.getItem(CONSENT_STORAGE_KEY)");
    expect(gtm).toContain("parseConsent(storedConsent)");
    expect(gtm).toContain("} catch {");
    expect(gtm).toContain("return false;");
    expect(gtm).toContain("if (!hasOptionalConsent(\"analytics\")) return;");
    expect(gtm).toContain("if (!hasOptionalConsent(\"marketing\")) return;");
  });
});
