function normalizeSiteUrl(value: string) {
  return value.trim().replace(/\/+$/, "") || "https://www.kozbeylikonagi.com";
}

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kozbeylikonagi.com",
);

export function absoluteUrl(path = "/") {
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "/";
  return `${siteUrl}${normalizedPath}`;
}
