/**
 * Ücretsiz, API key gerektirmeyen servis entegrasyonları.
 * Hepsi server-side çağrılır ve Next.js fetch cache ile korunur.
 *
 * - Open-Meteo      → Kozbeyli hava durumu (https://open-meteo.com, ücretsiz, key yok)
 * - Sunrise-Sunset  → Gün doğumu/batımı (https://sunrise-sunset.org/api, ücretsiz, key yok)
 * - Frankfurter     → ECB döviz kurları (https://frankfurter.dev, ücretsiz, key yok)
 * - Nager.Date      → TR resmi tatilleri (https://date.nager.at, ücretsiz, key yok)
 */

// Kozbeyli Köyü, Foça / İzmir
export const KOZBEYLI_COORDS = { lat: 38.737, lng: 26.885 } as const;

const REVALIDATE_30M = 1800;
const REVALIDATE_12H = 43200;
const REVALIDATE_24H = 86400;

type FetchOpts = { revalidate: number };

async function safeJson<T>(url: string, { revalidate }: FetchOpts): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/* ---------------------------------- Hava --------------------------------- */

export interface WeatherNow {
  temperature: number;
  weatherCode: number;
  windKmh: number;
  isDay: boolean;
}

export interface WeatherDay {
  date: string;
  tMax: number;
  tMin: number;
  weatherCode: number;
}

export interface WeatherData {
  now: WeatherNow;
  daily: WeatherDay[];
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

export async function getKozbeyliWeather(): Promise<WeatherData | null> {
  const { lat, lng } = KOZBEYLI_COORDS;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,is_day` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&forecast_days=7&timezone=Europe%2FIstanbul`;

  const data = await safeJson<OpenMeteoResponse>(url, { revalidate: REVALIDATE_30M });
  if (!data?.current || !data?.daily) return null;

  return {
    now: {
      temperature: Math.round(data.current.temperature_2m),
      weatherCode: data.current.weather_code,
      windKmh: Math.round(data.current.wind_speed_10m),
      isDay: data.current.is_day === 1,
    },
    daily: data.daily.time.map((date, i) => ({
      date,
      tMax: Math.round(data.daily.temperature_2m_max[i]),
      tMin: Math.round(data.daily.temperature_2m_min[i]),
      weatherCode: data.daily.weather_code[i],
    })),
  };
}

/** WMO weather code → TR etiket + emoji (Open-Meteo standardı) */
export function describeWeather(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "Açık", icon: "☀️" };
  if (code <= 2) return { label: "Az bulutlu", icon: "🌤️" };
  if (code === 3) return { label: "Parçalı bulutlu", icon: "⛅" };
  if (code <= 48) return { label: "Sisli", icon: "🌫️" };
  if (code <= 57) return { label: "Çisenti", icon: "🌦️" };
  if (code <= 67) return { label: "Yağmurlu", icon: "🌧️" };
  if (code <= 77) return { label: "Karlı", icon: "🌨️" };
  if (code <= 82) return { label: "Sağanak", icon: "🌧️" };
  if (code <= 99) return { label: "Gök gürültülü", icon: "⛈️" };
  return { label: "Değişken", icon: "🌤️" };
}

/* ------------------------------ Gün batımı ------------------------------- */

export interface SunTimes {
  sunrise: string; // ISO8601 (UTC)
  sunset: string; // ISO8601 (UTC)
}

interface SunriseSunsetResponse {
  status: string;
  results: { sunrise: string; sunset: string };
}

export async function getSunTimes(): Promise<SunTimes | null> {
  const { lat, lng } = KOZBEYLI_COORDS;
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`;
  const data = await safeJson<SunriseSunsetResponse>(url, { revalidate: REVALIDATE_12H });
  if (data?.status !== "OK") return null;
  return { sunrise: data.results.sunrise, sunset: data.results.sunset };
}

/* -------------------------------- Döviz ---------------------------------- */

export interface FxRates {
  eurTry: number | null;
  usdTry: number | null;
  date: string | null;
}

interface FrankfurterResponse {
  date: string;
  rates: Record<string, number>;
}

export async function getFxRates(): Promise<FxRates> {
  const data = await safeJson<FrankfurterResponse>(
    "https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY,USD",
    { revalidate: REVALIDATE_12H },
  );
  if (!data?.rates?.TRY) return { eurTry: null, usdTry: null, date: null };

  const eurTry = data.rates.TRY;
  const usdTry = data.rates.USD ? eurTry / data.rates.USD : null;
  return {
    eurTry: Math.round(eurTry * 100) / 100,
    usdTry: usdTry ? Math.round(usdTry * 100) / 100 : null,
    date: data.date,
  };
}

/* ------------------------------ Resmi tatil ------------------------------ */

export interface Holiday {
  date: string;
  localName: string;
  daysAway: number;
}

interface NagerHoliday {
  date: string;
  localName: string;
}

export async function getNextHoliday(): Promise<Holiday | null> {
  const year = new Date().getFullYear();
  const urls = [
    `https://date.nager.at/api/v3/PublicHolidays/${year}/TR`,
    `https://date.nager.at/api/v3/PublicHolidays/${year + 1}/TR`,
  ];

  const [thisYear, nextYear] = await Promise.all(
    urls.map((u) => safeJson<NagerHoliday[]>(u, { revalidate: REVALIDATE_24H })),
  );

  const all = [...(thisYear ?? []), ...(nextYear ?? [])];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const h of all) {
    const d = new Date(`${h.date}T00:00:00+03:00`);
    const daysAway = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (daysAway >= 0 && daysAway <= 60) {
      return { date: h.date, localName: h.localName, daysAway };
    }
  }
  return null;
}

/* ------------------------------ Birleşik veri ---------------------------- */

export interface LocalPulse {
  weather: WeatherData | null;
  sun: SunTimes | null;
  fx: FxRates;
  nextHoliday: Holiday | null;
  generatedAt: string;
}

export async function getLocalPulse(): Promise<LocalPulse> {
  const [weather, sun, fx, nextHoliday] = await Promise.all([
    getKozbeyliWeather(),
    getSunTimes(),
    getFxRates(),
    getNextHoliday(),
  ]);
  return { weather, sun, fx, nextHoliday, generatedAt: new Date().toISOString() };
}
