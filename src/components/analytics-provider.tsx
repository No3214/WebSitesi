"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { usePathname } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";

import { CONSENT_STORAGE_KEY, getDefaultConsent, parseConsent } from "@/lib/consent";
import { publicEnv } from "@/lib/public-env";

let posthogReady = false;

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
      capture_pageview: false,
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
      posthog.capture("$pageview", { path: pathname });
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
