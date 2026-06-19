"use client";

import { useEffect, useState } from "react";

import type { LocalPulse } from "@/lib/free-apis";
import { describeWeather } from "@/lib/free-apis";

type Locale = "tr" | "en";

function formatTime(iso: string, locale: Locale) {
  try {
    return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Istanbul",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function describeWeatherInEnglish(code: number): string {
  if (code === 0) return "clear";
  if (code <= 2) return "mostly clear";
  if (code === 3) return "cloudy";
  if (code <= 48) return "foggy";
  if (code <= 57) return "drizzly";
  if (code <= 67) return "rainy";
  if (code <= 77) return "snowy";
  if (code <= 82) return "showery";
  if (code <= 99) return "thunderstorms";
  return "variable conditions";
}

/**
 * Kozbeyli yerel bilgi şeridi — hava, gün batımı, kur ve yaklaşan tatil.
 * Ücretsiz API verisi yoksa sessizce gizlenir.
 */
export function WeatherRibbon({ locale = "tr" }: { locale?: Locale }) {
  const [pulse, setPulse] = useState<LocalPulse | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/local-pulse")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data) setPulse(data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  if (!pulse) return null;

  const items: { icon: string; text: string }[] = [];
  const numberLocale = locale === "tr" ? "tr-TR" : "en-GB";

  if (pulse.weather?.now) {
    const weather = describeWeather(pulse.weather.now.weatherCode);
    const weatherLabel =
      locale === "tr" ? weather.label.toLowerCase() : describeWeatherInEnglish(pulse.weather.now.weatherCode);

    items.push({
      icon: weather.icon,
      text:
        locale === "tr"
          ? `Kozbeyli'de şu an ${pulse.weather.now.temperature}°C, ${weatherLabel}`
          : `Kozbeyli is currently ${pulse.weather.now.temperature}°C and ${weatherLabel}`,
    });

    const weekend = pulse.weather.daily.slice(0, 7).filter((day) => {
      const weekday = new Date(`${day.date}T12:00:00+03:00`).getDay();
      return weekday === 6 || weekday === 0;
    });

    if (weekend.length > 0) {
      const max = Math.max(...weekend.map((day) => day.tMax));
      items.push({
        icon: "📅",
        text: locale === "tr" ? `Hafta sonu ${max}°C bekleniyor` : `Weekend high around ${max}°C`,
      });
    }
  }

  if (pulse.sun?.sunset) {
    const time = formatTime(pulse.sun.sunset, locale);
    if (time) {
      items.push({
        icon: "🌅",
        text: locale === "tr" ? `Bugün gün batımı ${time}` : `Sunset today at ${time}`,
      });
    }
  }

  if (pulse.nextHoliday && pulse.nextHoliday.daysAway <= 30) {
    items.push({
      icon: "✨",
      text:
        locale === "tr"
          ? pulse.nextHoliday.daysAway === 0
            ? `Bugün ${pulse.nextHoliday.localName}`
            : `${pulse.nextHoliday.localName} için ${pulse.nextHoliday.daysAway} gün`
          : pulse.nextHoliday.daysAway === 0
            ? `${pulse.nextHoliday.localName} is today`
            : `${pulse.nextHoliday.daysAway} days until ${pulse.nextHoliday.localName}`,
    });
  }

  if (pulse.fx.eurTry) {
    items.push({
      icon: "💶",
      text:
        locale === "tr"
          ? `1 € ≈ ${pulse.fx.eurTry.toLocaleString(numberLocale)} ₺`
          : `€1 ≈ ₺${pulse.fx.eurTry.toLocaleString(numberLocale)}`,
    });
  }

  if (items.length === 0) return null;

  return (
    <div
      data-event="local_pulse_view"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px 22px",
        alignItems: "center",
        padding: "12px 18px",
        border: "1px solid rgba(107, 114, 92, 0.25)",
        background: "rgba(107, 114, 92, 0.07)",
        fontSize: "0.9rem",
        margin: "18px 0 26px",
      }}
    >
      {items.map((item) => (
        <span key={item.text} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <span aria-hidden>{item.icon}</span>
          <span className="muted">{item.text}</span>
        </span>
      ))}
    </div>
  );
}
