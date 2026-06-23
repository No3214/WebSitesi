export type LegalLocale = "tr" | "en";
export type LegalRouteKey = "kvkk" | "privacy" | "cookies" | "distanceSales";

const LEGAL_ROUTES = {
  kvkk: "/kvkk",
  privacy: "/gizlilik-politikasi",
  cookies: "/cerez-politikasi",
  distanceSales: "/mesafeli-satis-sozlesmesi",
} as const satisfies Record<LegalRouteKey, string>;

export function getLegalHref(key: LegalRouteKey, locale: LegalLocale): string {
  const route = LEGAL_ROUTES[key];
  return locale === "en" ? `/en${route}` : route;
}

export function getLegalTurkishHref(key: LegalRouteKey): string {
  return LEGAL_ROUTES[key];
}
