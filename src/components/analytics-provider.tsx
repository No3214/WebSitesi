"use client";

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect, ReactNode } from 'react';

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_dummy_key';
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
  
  posthog.init(posthogKey, {
    api_host: posthogHost,
    person_profiles: 'identified_only',
    capture_pageview: false // Manual capture for SPA
  });
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Track initial page load
    posthog.capture('$pageview');
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

// Global utility for event tracking
export const trackEvent = (name: string, properties?: Record<string, string | number | boolean | null>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(name, properties || undefined);
  }
};
