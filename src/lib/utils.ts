export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kozbeylikonagi.com";

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path}`;
}
