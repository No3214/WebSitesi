export const ENGLISH_PATH_BY_TR_ROUTE = {
  "/": "/en",
  "/rezervasyon": "/en/booking",
  "/odalar": "/en/rooms",
  "/menu": "/en/menu",
  "/gastronomi": "/en/dining",
  "/organizasyonlar": "/en/events",
  "/iletisim": "/en/contact",
  "/lokasyon": "/en/location",
  "/sss": "/en/faq",
  "/galeri": "/en/gallery",
  "/hikayemiz": "/en/our-story",
  "/misafir-rehberi": "/en/guest-guide",
  "/deneyimler": "/en/experiences",
  "/teklifler": "/en/offers",
  "/kvkk": "/en/kvkk",
  "/gizlilik-politikasi": "/en/gizlilik-politikasi",
  "/cerez-politikasi": "/en/cerez-politikasi",
  "/mesafeli-satis-sozlesmesi": "/en/mesafeli-satis-sozlesmesi",
} as const;

export const LEGACY_ENGLISH_PATH_BY_TR_ROUTE = {
  "/rezervasyon": "/en/rezervasyon",
  "/odalar": "/en/odalar",
  "/menu": "/en/menu",
  "/gastronomi": "/en/gastronomi",
  "/organizasyonlar": "/en/organizasyonlar",
  "/iletisim": "/en/iletisim",
  "/lokasyon": "/en/lokasyon",
  "/sss": "/en/sss",
  "/galeri": "/en/galeri",
  "/hikayemiz": "/en/hikayemiz",
  "/misafir-rehberi": "/en/misafir-rehberi",
  "/deneyimler": "/en/deneyimler",
  "/teklifler": "/en/teklifler",
  "/kvkk": "/en/kvkk",
  "/gizlilik-politikasi": "/en/gizlilik-politikasi",
  "/cerez-politikasi": "/en/cerez-politikasi",
  "/mesafeli-satis-sozlesmesi": "/en/mesafeli-satis-sozlesmesi",
} as const;

const TURKISH_PATH_BY_ENGLISH_PATH = Object.fromEntries(
  Object.entries(ENGLISH_PATH_BY_TR_ROUTE).map(([tr, en]) => [en, tr]),
) as Record<string, string>;

const TURKISH_PATH_BY_LEGACY_ENGLISH_PATH = Object.fromEntries(
  Object.entries(LEGACY_ENGLISH_PATH_BY_TR_ROUTE).map(([tr, en]) => [en, tr]),
) as Record<string, string>;

function normalizePath(pathname: string): string {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function splitInternalHref(href: string) {
  const match = href.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  return {
    path: normalizePath(match?.[1] || "/"),
    suffix: `${match?.[2] ?? ""}${match?.[3] ?? ""}`,
  };
}

export function isEnglishPath(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

export function getEnglishHref(pathname: string): string {
  const { path, suffix } = splitInternalHref(pathname);

  if (path === "/" || path === "/en") return `/en${suffix}`;
  if (path.startsWith("/en/rooms/")) return `${path}${suffix}`;
  if (path.startsWith("/en/odalar/")) return `/en/rooms/${path.slice("/en/odalar/".length)}${suffix}`;
  if (path.startsWith("/odalar/")) return `/en/rooms/${path.slice("/odalar/".length)}${suffix}`;

  const trPath = isEnglishPath(path) ? TURKISH_PATH_BY_LEGACY_ENGLISH_PATH[path] : path;
  const canonical = ENGLISH_PATH_BY_TR_ROUTE[trPath as keyof typeof ENGLISH_PATH_BY_TR_ROUTE];

  return canonical ? `${canonical}${suffix}` : `/en${suffix}`;
}

export function getTurkishHref(pathname: string): string {
  const { path, suffix } = splitInternalHref(pathname);

  if (path === "/en") return `/${suffix}`;
  if (path.startsWith("/en/rooms/")) return `/odalar/${path.slice("/en/rooms/".length)}${suffix}`;
  if (path.startsWith("/en/odalar/")) return `/odalar/${path.slice("/en/odalar/".length)}${suffix}`;
  if (!isEnglishPath(path)) return `${path}${suffix}`;

  const trPath =
    TURKISH_PATH_BY_ENGLISH_PATH[path] ??
    TURKISH_PATH_BY_LEGACY_ENGLISH_PATH[path] ??
    path.slice(3) ??
    "/";

  return `${trPath || "/"}${suffix}`;
}

export function localizedHref(href: string, english: boolean): string {
  if (!href.startsWith("/")) return href;
  return english ? getEnglishHref(href) : href;
}
