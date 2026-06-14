const ROOM_NIGHTLY_RATES: Record<string, number> = {
  "standart-bahce-manzarali-oda": 4500,
  "standart-deniz-manzarali-oda": 4500,
  "uc-kisilik-oda": 6000,
  "4-kisilik-aile-odasi": 7500,
  "4-kisilik-aile-odasi-balkonlu": 7500,
  "superior-2-kisilik-oda": 8500,
  "superior-3-kisilik-oda": 8500,
};

const MAX_BOOKING_NIGHTS = 60;

export type BookingQuote =
  | {
      ok: true;
      roomSlug: string;
      nightlyRate: number;
      nights: number;
      totalPrice: number;
    }
  | {
      ok: false;
      reason: "unknown-room" | "invalid-date-range" | "too-many-nights";
    };

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp;
}

export function getRoomNightlyRate(roomSlug: string) {
  return ROOM_NIGHTLY_RATES[roomSlug] ?? null;
}

export function getBookingNights(checkIn: string, checkOut: string) {
  const start = parseIsoDate(checkIn);
  const end = parseIsoDate(checkOut);
  if (start === null || end === null || end <= start) return null;

  const nights = Math.round((end - start) / (24 * 60 * 60 * 1000));
  if (nights < 1) return null;
  return nights;
}

export function calculateBookingQuote(roomSlug: string, checkIn: string, checkOut: string): BookingQuote {
  const nightlyRate = getRoomNightlyRate(roomSlug);
  if (nightlyRate === null) {
    return { ok: false, reason: "unknown-room" };
  }

  const nights = getBookingNights(checkIn, checkOut);
  if (nights === null) {
    return { ok: false, reason: "invalid-date-range" };
  }

  if (nights > MAX_BOOKING_NIGHTS) {
    return { ok: false, reason: "too-many-nights" };
  }

  return {
    ok: true,
    roomSlug,
    nightlyRate,
    nights,
    totalPrice: nightlyRate * nights,
  };
}
