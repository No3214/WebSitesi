"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { usePathname } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";

import { CONSENT_STORAGE_KEY, getDefaultConsent, parseConsent } from "@/lib/consent";
import { publicEnv } from "@/lib/public-env";

let posthogReady = false;

const PRIVATE_POSTHOG_PROPERTIES = new Set([
  "$current_url",
  "$referrer",
  "$referring_domain",
  "$initial_current_url",
  "$initial_referrer",
  "$initial_referring_domain",
  "$gclid",
  "$gad_source",
  "$gbraid",
  "$wbraid",
  "$msclkid",
  "$fbclid",
  "$dclid",
  "$initial_gclid",
  "$initial_gad_source",
  "$initial_gbraid",
  "$initial_wbraid",
  "$initial_msclkid",
  "$initial_fbclid",
  "$initial_dclid",
]);

const PRIVATE_POSTHOG_PREFIXES = ["$utm_", "$initial_utm_"] as const;

function stripPrivatePostHogProperties(properties: Record<string, unknown>) {
  for (const property of Object.keys(properties)) {
    if (
      PRIVATE_POSTHOG_PROPERTIES.has(property) ||
      PRIVATE_POSTHOG_PREFIXES.some((prefix) => property.startsWith(prefix))
    ) {
      delete properties[property];
    }
  }
}

function sanitizePostHogProperties(properties: Record<string, unknown>) {
  stripPrivatePostHogProperties(properties);

  for (const nestedKey of ["$set", "$set_once"] as const) {
    const nested = properties[nestedKey];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      stripPrivatePostHogProperties(nested as Record<string, unknown>);
    }
  }
}

function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false;
  return (parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY)) || getDefaultConsent()).analytics;
}

function ensurePostHogReady() {
  if (typeof window === "undefined") return false;
  const posthogKey = publicEnv.NEXT_PUBLIC_POSTHOG_KEY;
  if (!posthogKey || !hasAnalyticsConsent()) {
    if (posthogReady) posthog.opt_out_capturing();
    return false;
  }

  if (!posthogReady) {
    posthog.init(posthogKey, {
      api_host: publicEnv.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      before_send: (event) => {
        if (event?.properties) {
          sanitizePostHogProperties(event.properties as Record<string, unknown>);
        }
        return event;
      },
    });
    posthogReady = true;
  }

  posthog.opt_in_capturing();
  return true;
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setReady(ensurePostHogReady());
    sync();

    window.addEventListener("storage", sync);
    window.addEventListener("consent:updated", sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("consent:updated", sync as EventListener);
    };
  }, []);

  useEffect(() => {
    if (ready) {
      posthog.capture("$pageview", { path: pathname || "/" });
    }
  }, [pathname, ready]);

  if (!ready) return <>{children}</>;
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

// Global utility for event tracking
export const trackEvent = (name: string, properties?: Record<string, string | number | boolean | null>) => {
  if (ensurePostHogReady()) {
    posthog.capture(name, properties || undefined);
  }
};
