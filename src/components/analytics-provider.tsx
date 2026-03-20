"use client";

import posthog from 'posthog-js';
import { PostHogProvider, usePostHog } from 'posthog-js/react';
import { useEffect, ReactNode, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) url += `?${search}`;
      ph.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (POSTHOG_KEY && typeof window !== 'undefined') {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_pageleave: true,
        loaded: () => setReady(true),
      });
    }
  }, []);

  if (!POSTHOG_KEY) return <>{children}</>;

  return (
    <PostHogProvider client={posthog}>
      {ready && <PostHogPageView />}
      {children}
    </PostHogProvider>
  );
}

/** Track custom events (no-op when PostHog is not configured) */
export const trackEvent = (name: string, properties?: Record<string, string | number | boolean | null>) => {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.capture(name, properties || undefined);
  }
};
