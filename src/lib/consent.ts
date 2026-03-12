export const CONSENT_STORAGE_KEY = "cookie_consent_v2";
export const CONSENT_VERSION = "2026-03";

export type ConsentState = {
  version: string;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export function getDefaultConsent(): ConsentState {
  return {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: false,
    marketing: false,
    updatedAt: new Date(0).toISOString(),
  };
}

export function parseConsent(value: string | null): ConsentState | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as ConsentState;
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      version: CONSENT_VERSION,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveConsent(nextConsent: Omit<ConsentState, "updatedAt" | "necessary" | "version">) {
  const value: ConsentState = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: Boolean(nextConsent.analytics),
    marketing: Boolean(nextConsent.marketing),
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("consent:updated", { detail: value }));
  return value;
}
