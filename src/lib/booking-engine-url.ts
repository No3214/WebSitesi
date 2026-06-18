type BookingEngineHrefOptions = {
  roomSlug?: string;
};

export function getBookingEngineHref(rawUrl: string, options: BookingEngineHrefOptions = {}) {
  const source = rawUrl.trim();
  if (!source) return "";

  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return "";
  }

  if (url.protocol !== "https:") return "";

  if (!url.searchParams.has("utm_source")) {
    url.searchParams.set("utm_source", "website");
  }

  if (!url.searchParams.has("utm_medium")) {
    url.searchParams.set("utm_medium", "booking_engine");
  }

  if (options.roomSlug) {
    url.searchParams.set("room", options.roomSlug);
  }

  return url.toString();
}
