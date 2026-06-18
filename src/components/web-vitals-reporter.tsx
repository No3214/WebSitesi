"use client";

import { useReportWebVitals } from "next/web-vitals";

import { trackEvent } from "@/components/analytics-provider";

const SUPPORTED_METRICS = new Set(["CLS", "FCP", "INP", "LCP", "TTFB"]);

function roundMetricValue(name: string, value: number) {
  return Number(value.toFixed(name === "CLS" ? 4 : 0));
}

/**
 * Sends privacy-safe field performance measurements to PostHog.
 *
 * trackEvent() is already consent-gated and becomes a no-op when PostHog is
 * not configured. Only the pathname is included: query parameters and full
 * URLs are deliberately excluded because they may contain personal data.
 */
const reportWebVitals: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  if (!SUPPORTED_METRICS.has(metric.name)) return;

  trackEvent("web_vital", {
    metric_id: metric.id,
    metric_name: metric.name,
    metric_value: roundMetricValue(metric.name, metric.value),
    metric_delta: roundMetricValue(metric.name, metric.delta),
    metric_rating: metric.rating ?? "unknown",
    navigation_type: metric.navigationType ?? "unknown",
    path: window.location.pathname,
  });
};

export function WebVitalsReporter() {
  useReportWebVitals(reportWebVitals);
  return null;
}
