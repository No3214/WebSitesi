export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kozbeylikonagi.com.tr";

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path}`;
}
