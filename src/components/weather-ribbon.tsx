"use client";

import { useEffect, useState } from "react";

import type { LocalPulse } from "@/lib/free-apis";
import { describeWeather } from "@/lib/free-apis";

function formatTime(iso: string, locale: "tr" | "en") {
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Istanbul",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/**
 * Kozbeyli "yerel nabız" şeridi — hava, gün batımı, kur ve yaklaşan tatil.
 * Tamamen ücretsiz API'lerden beslenir; veri yoksa sessizce gizlenir.
 */
export function WeatherRibbon({ locale = "tr" }: { locale?: "tr" | "en" }) {
  const [pulse, setPulse] = useState<LocalPulse | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/local-pulse")
      .then((r) => (r.ok ? r.json() : null))
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

  if (pulse.weather?.now) {
    const w = describeWeather(pulse.weather.now.weatherCode, locale);
    items.push({
      icon: w.icon,
      text:
        locale === "en"
          ? `Current weather in Kozbeyli: ${pulse.weather.now.temperature}°C, ${w.label.toLowerCase()}`
          : `Kozbeyli'de şu an ${pulse.weather.now.temperature}°C, ${w.label.toLowerCase()}`,
    });
    const weekend = pulse.weather.daily.slice(0, 7).filter((d) => {
      const day = new Date(`${d.date}T12:00:00+03:00`).getDay();
      return day === 6 || day === 0;
    });
    if (weekend.length > 0) {
      const max = Math.max(...weekend.map((d) => d.tMax));
      items.push({
        icon: "📅",
        text: locale === "en" ? `Weekend forecast: up to ${max}°C` : `Hafta sonu ${max}°C bekleniyor`,
      });
    }
  }

  if (pulse.sun?.sunset) {
    const t = formatTime(pulse.sun.sunset, locale);
    if (t) {
      items.push({
        icon: "🌅",
        text: locale === "en" ? `Sunset today ${t}` : `Bugün gün batımı ${t}`,
      });
    }
  }

  if (pulse.nextHoliday && pulse.nextHoliday.daysAway <= 30) {
    items.push({
      icon: "✨",
      text:
        locale === "en"
          ? pulse.nextHoliday.daysAway === 0
            ? "Public holiday today"
            : `Public holiday in ${pulse.nextHoliday.daysAway} days`
          : pulse.nextHoliday.daysAway === 0
            ? `Bugün ${pulse.nextHoliday.localName}`
            : `${pulse.nextHoliday.localName} için ${pulse.nextHoliday.daysAway} gün`,
    });
  }

  if (pulse.fx.eurTry) {
    items.push({
      icon: "💶",
      text: `1 € ≈ ${pulse.fx.eurTry.toLocaleString(locale === "en" ? "en-US" : "tr-TR")} ₺`,
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
        borderRadius: 14,
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
